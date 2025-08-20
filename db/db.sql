-- =========================================================
-- RAG schema for Vito's site: documents + RPC search funcs
-- Requirements: pgvector enabled (you already did this)
-- =========================================================

-- ---------- PUBLIC DOCUMENTS (citable) ----------
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  content     text not null,          -- the text snippet used as context (LangChain expects this)
  metadata    jsonb,                  -- LangChain stores metadata here
  embedding   vector(1536) not null,  -- keep consistent with your embedding model
  -- optional full-text column for hybrid search
  tsv         tsvector generated always as (
                to_tsvector('simple', coalesce(content,''))
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

-- ---------- RPC: pure vector top-k ----------
-- Uses cosine distance operator `<=>`. Similarity = 1 - distance.
create or replace function public.match_docs(
  query_embedding vector(1536),
  match_count int default 8
)
returns table (
  content text,
  metadata jsonb,
  score double precision
)
language sql stable as $$
  select
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as score
  from public.documents d
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
  vec_weight double precision default 0.8,
  txt_weight double precision default 0.2
)
returns table (
  content text,
  metadata jsonb,
  score double precision
)
language sql stable as $$
  with vec as (
    select id, content, metadata,
           1 - (embedding <=> query_embedding) as vscore
    from public.documents
    order by embedding <-> query_embedding
    limit 50
  ),
  t as (
    select id, ts_rank(tsv, plainto_tsquery('simple', text_query)) as tscore
    from public.documents
    where tsv @@ plainto_tsquery('simple', text_query)
  )
  select
    v.content,
    v.metadata,
    coalesce(v.vscore,0)*vec_weight + coalesce(t.tscore,0)*txt_weight as score
  from vec v
  left join t using (id)
  order by score desc
  limit match_count
$$;