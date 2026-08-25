-- Tillåt flexibla snabbtyper på passdelar (inkl. other).
alter table public.workout_sections
  drop constraint if exists workout_sections_kind_check;

alter table public.workout_sections
  add constraint workout_sections_kind_check
  check (kind in ('warmup', 'technique', 'strength', 'metcon', 'other'));
