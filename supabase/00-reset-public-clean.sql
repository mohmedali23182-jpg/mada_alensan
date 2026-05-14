-- Mada Alinsan: clean the public schema before rebuilding the database with Prisma UUID schema.
-- Run this ONLY when you want to remove old project tables and rebuild from zero.
-- It does not drop Supabase auth schema. It does not delete Storage files themselves.

begin;

do $$
declare
  r record;
begin
  -- Drop public views first.
  for r in (
    select table_schema, table_name
    from information_schema.views
    where table_schema = 'public'
  ) loop
    execute format('drop view if exists %I.%I cascade;', r.table_schema, r.table_name);
  end loop;

  -- Drop public materialized views.
  for r in (
    select schemaname, matviewname
    from pg_matviews
    where schemaname = 'public'
  ) loop
    execute format('drop materialized view if exists %I.%I cascade;', r.schemaname, r.matviewname);
  end loop;

  -- Drop all project tables in public.
  for r in (
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
  ) loop
    execute format('drop table if exists %I.%I cascade;', r.schemaname, r.tablename);
  end loop;
end $$;

-- Drop public enums created by older Prisma schemas.
do $$
declare
  r record;
begin
  for r in (
    select t.typname
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typtype = 'e'
  ) loop
    execute format('drop type if exists public.%I cascade;', r.typname);
  end loop;
end $$;

-- Keep extensions available for UUID generation.
create extension if not exists "pgcrypto";

commit;
