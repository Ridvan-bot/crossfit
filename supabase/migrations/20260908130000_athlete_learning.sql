-- Athlete learning: preferences (user-declared) + insights (derived from sessions).

alter table public.profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;

comment on column public.profiles.preferences is
  'Structured athlete preferences: focus, constraints, fun/avoid movements, experience, notes.';

create table if not exists public.athlete_insights (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  movement_best jsonb not null default '{}'::jsonb,
  recent_sessions jsonb not null default '[]'::jsonb,
  signals jsonb not null default '{}'::jsonb,
  rpe_avg_last_4 numeric(4, 2),
  feeling_avg_last_4 numeric(4, 2),
  total_sessions int not null default 0,
  summary_sv text,
  updated_at timestamptz not null default now()
);

comment on table public.athlete_insights is
  'Per-user derived training memory. Recomputed after sessions; used when programming WODs.';

alter table public.athlete_insights enable row level security;

create policy "athlete_insights_all_own"
  on public.athlete_insights
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
