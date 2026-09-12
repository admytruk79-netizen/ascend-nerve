-- Structured curriculum provenance for Journal entries.
-- Existing and older clients remain compatible because the column has a non-null JSON default.

alter table public.path_journal_entries
  add column if not exists context jsonb not null default '{}'::jsonb;

comment on column public.path_journal_entries.context is
  'Optional ASCEND curriculum provenance. Expected keys: kind, branchId, branchSlug, branchTitle, moduleId, moduleNumber, moduleTitle.';

-- Existing RLS and teacher visibility policies continue to govern the row.
-- No policy is broadened by this migration, and clients omitting context receive {}.
