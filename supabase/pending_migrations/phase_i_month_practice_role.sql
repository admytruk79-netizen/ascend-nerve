-- Must run before phase_i_month_practices_school_scale.sql.
-- Gives the 24-month Core Formation a role distinct from the singular legacy
-- stage-level primary practice contract.
alter table public.path_stage_practices
  drop constraint if exists path_stage_practices_role_check;

alter table public.path_stage_practices
  add constraint path_stage_practices_role_check check (
    role = any (array[
      'primary'::text,
      'month_primary'::text,
      'continuing'::text,
      'morning'::text,
      'evening'::text,
      'weekly'::text,
      'supporting'::text
    ])
  );
