-- =========================================================
-- RAG schema for Vito's site: documents + RPC search funcs
-- Requirements: pgvector enabled (you already did this)
-- =========================================================

-- ---------- PUBLIC DOCUMENTS (citable) ----------
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  source_type text not null,          -- 'blog' | 'project' | 'cv' | 'about' | 'talk' | 'note'
  title       text not null,
  url         text not null,          -- e.g. /blog/my-post
  chunk       text not null,          -- the text snippet used as context
  hash        text not null unique,   -- sha256(source|url|chunk) for incremental upserts
  embedding   vector(1536) not null,  -- keep consistent with your embedding model
  -- optional full-text column for hybrid search
  tsv         tsvector generated always as (
                to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(chunk,''))
              ) stored,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ANN index for pgvector (adjust lists based on dataset size: 100 is fine to start)
create index if not exists documents_embedding_ivfflat_idx
  on public.documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Full-text GIN index (for hybrid)
create index if not exists documents_tsv_gin_idx
  on public.documents using gin (tsv);

-- RLS: public can read (your content is public); writes come from server (service role)
alter table public.documents enable row level security;


-- ---------- OPTIONAL: helper to normalize vectors (if you want unit vectors) ----------
-- If you consistently normalize vectors in app code before insert, you can skip this.
-- Normalizing improves cosine behavior/recall for some setups.
-- create or replace function public.l2_normalize(vec vector)
-- returns vector language sql immutable as $$
--   select (vec / sqrt(vec <#> vec))::vector
-- $$;

-- ---------- RPC: pure vector top-k ----------
-- Uses cosine distance operator `<=>`. Similarity = 1 - distance.
create or replace function public.match_docs(
  query_embedding vector(1536),
  match_count int default 8,
  allowed_types text[] default array['blog','project','cv','about','talk','note']
)
returns table (
  title text,
  url   text,
  chunk text,
  score double precision
)
language sql stable as $$
  select
    d.title,
    d.url,
    d.chunk,
    1 - (d.embedding <=> query_embedding) as score
  from public.documents d
  where d.source_type = any(allowed_types)
  order by d.embedding <-> query_embedding
  limit match_count
$$;

-- ---------- RPC: hybrid (vector + keyword) ----------
-- Pass a plain text query; we build a tsquery and blend scores.
-- Adjust weights if needed (0.8 vector / 0.2 text is a reasonable start).
create or replace function public.match_docs_hybrid(
  query_embedding vector(1536),
  text_query text,
  match_count int default 8,
  allowed_types text[] default array['blog','project','cv','about','talk','note'],
  vec_weight double precision default 0.8,
  txt_weight double precision default 0.2
)
returns table (
  title text,
  url   text,
  chunk text,
  score double precision
)
language sql stable as $$
  with vec as (
    select id, title, url, chunk,
           1 - (embedding <=> query_embedding) as vscore
    from public.documents
    where source_type = any(allowed_types)
    order by embedding <-> query_embedding
    limit 50
  ),
  t as (
    select id, ts_rank(tsv, plainto_tsquery('simple', text_query)) as tscore
    from public.documents
    where source_type = any(allowed_types)
      and tsv @@ plainto_tsquery('simple', text_query)
  )
  select
    v.title,
    v.url,
    v.chunk,
    coalesce(v.vscore,0)*vec_weight + coalesce(t.tscore,0)*txt_weight as score
  from vec v
  left join t using (id)
  order by score desc
  limit match_count
$$;
