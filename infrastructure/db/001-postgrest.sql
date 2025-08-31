-- Enable pgvector and a minimal docs table (adjust to your schema later)
create extension if not exists vector;

create role web_anon nologin;
grant usage on schema public to web_anon;

-- Example table; if you already have one, skip this block
create table if not exists docs (
  id bigserial primary key,
  title text,
  content text,
  embedding vector(768)  -- adjust to your TEI dim
);

-- Least-privilege read-only for the UI
grant select on table docs to web_anon;