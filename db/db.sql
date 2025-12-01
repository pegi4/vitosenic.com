-- =========================================================
-- RAG schema for Vito's site: documents + RPC search funcs
-- Requirements: pgvector enabled (you already did this)
-- =========================================================

-- Enable pgvector extension if not already enabled
create extension if not exists vector;

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

-- RLS: Enable RLS but allow all operations for authenticated users
-- For self-hosted PostgreSQL, you can either:
-- 1. Disable RLS completely (remove these lines)
-- 2. Create policies that allow your application user
-- 3. Use a superuser role that bypasses RLS
alter table public.documents enable row level security;

-- Policy: Allow all operations for authenticated users
-- Replace 'your_app_user' with your actual database user, or remove RLS entirely
-- Option 1: Allow all (if you trust your connection security)
create policy "Allow all for application" on public.documents
  for all using (true) with check (true);

-- Option 2: If you want to keep RLS strict, uncomment and adjust:
-- create policy "Allow read for all" on public.documents
--   for select using (true);
-- create policy "Allow write for application user" on public.documents
--   for insert with check (current_user = 'your_app_user');
-- create policy "Allow update for application user" on public.documents
--   for update using (current_user = 'your_app_user');

-- ---------- RPC: pure vector top-k ----------
-- Uses cosine distance operator `<=>`. Similarity = 1 - distance.
-- This version matches LangChain's SupabaseVectorStore expected signature
create or replace function public.match_docs(
  query_embedding vector(1536),
  match_count int default 8,
  filter jsonb default '{}'::jsonb
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql stable as $$
  select
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where
    case
      when filter::text = '{}'::text then true
      else d.metadata @> filter
    end
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
  filter jsonb default '{}'::jsonb,
  vec_weight double precision default 0.8,
  txt_weight double precision default 0.2
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql stable as $$
  with vec as (
    select id, content, metadata,
           1 - (embedding <=> query_embedding) as vscore
    from public.documents
    where
      case
        when filter::text = '{}'::text then true
        else metadata @> filter
      end
    order by embedding <-> query_embedding
    limit 50
  ),
  t as (
    select id, ts_rank(tsv, plainto_tsquery('simple', text_query)) as tscore
    from public.documents
    where tsv @@ plainto_tsquery('simple', text_query)
    and case
      when filter::text = '{}'::text then true
      else metadata @> filter
    end
  )
  select
    v.id,
    v.content,
    v.metadata,
    coalesce(v.vscore,0)*vec_weight + coalesce(t.tscore,0)*txt_weight as similarity
  from vec v
  left join t using (id)
  order by similarity desc
  limit match_count
$$;

-- =========================================================
-- CHAT LOGS TABLE
-- =========================================================

-- Table to store chat interactions for analytics
create table if not exists public.chat_logs (
  id          uuid primary key default gen_random_uuid(),
  timestamp   timestamptz default now(),
  user_fingerprint text not null,      -- User fingerprint (IP + user agent)
  user_input  text not null,          -- User's message
  system_output text not null,        -- System's response
  created_at  timestamptz default now()
);

-- Index on timestamp for efficient querying by date
create index if not exists chat_logs_timestamp_idx
  on public.chat_logs (timestamp);

-- Index on user fingerprint for analytics
create index if not exists chat_logs_user_fingerprint_idx
  on public.chat_logs (user_fingerprint);

-- RLS: Enable RLS but allow all operations for application user
alter table public.chat_logs enable row level security;

-- Policy: Allow all operations for application
-- Replace with your specific user if needed, or remove RLS entirely
create policy "Allow all for application" on public.chat_logs
  for all using (true) with check (true);

-- Alternative: If you want stricter control, uncomment and adjust:
-- create policy "Allow insert for application user" on public.chat_logs
--   for insert with check (current_user = 'your_app_user');
-- create policy "Allow select for application user" on public.chat_logs
--   for select using (current_user = 'your_app_user');
