-- CrossFit app schema (user-scoped, RLS from day one)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  workout_type text not null default 'mixed',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_id uuid references public.workout_templates (id) on delete set null,
  title text not null,
  pass_number int,
  scheduled_date date,
  status text not null default 'planned' check (status in ('planned', 'done')),
  equipment_notes text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sections (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  kind text not null check (kind in ('warmup', 'technique', 'strength', 'metcon')),
  sort_order int not null default 0,
  label text not null,
  format_label text,
  estimated_minutes_min int,
  estimated_minutes_max int,
  coaching_tip text,
  timer_preset_sec int,
  created_at timestamptz not null default now()
);

create table if not exists public.section_movements (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.workout_sections (id) on delete cascade,
  name text not null,
  detail text,
  suggested_weight_kg numeric,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  score_text text,
  feeling_1_5 int check (feeling_1_5 is null or (feeling_1_5 >= 1 and feeling_1_5 <= 5)),
  rpe_1_10 int check (rpe_1_10 is null or (rpe_1_10 >= 1 and rpe_1_10 <= 10)),
  notes text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.session_lifts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions (id) on delete cascade,
  movement_name text not null,
  weight_kg numeric,
  notes text,
  sort_order int not null default 0
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  deadline date,
  status text not null default 'ongoing' check (status in ('ongoing', 'planned', 'done')),
  current_level text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workouts_user_id_idx on public.workouts (user_id);
create index if not exists workouts_scheduled_date_idx on public.workouts (scheduled_date);
create index if not exists workout_sections_workout_id_idx on public.workout_sections (workout_id);
create index if not exists section_movements_section_id_idx on public.section_movements (section_id);
create index if not exists training_sessions_user_id_idx on public.training_sessions (user_id);
create index if not exists training_sessions_workout_id_idx on public.training_sessions (workout_id);
create index if not exists session_lifts_session_id_idx on public.session_lifts (session_id);
create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists workout_templates_user_id_idx on public.workout_templates (user_id);

alter table public.profiles enable row level security;
alter table public.workout_templates enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sections enable row level security;
alter table public.section_movements enable row level security;
alter table public.training_sessions enable row level security;
alter table public.session_lifts enable row level security;
alter table public.goals enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy "templates_all_own" on public.workout_templates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workouts_all_own" on public.workouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sections_select_own" on public.workout_sections for select
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));
create policy "sections_insert_own" on public.workout_sections for insert
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));
create policy "sections_update_own" on public.workout_sections for update
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));
create policy "sections_delete_own" on public.workout_sections for delete
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

create policy "movements_select_own" on public.section_movements for select
  using (exists (
    select 1 from public.workout_sections s
    join public.workouts w on w.id = s.workout_id
    where s.id = section_id and w.user_id = auth.uid()
  ));
create policy "movements_insert_own" on public.section_movements for insert
  with check (exists (
    select 1 from public.workout_sections s
    join public.workouts w on w.id = s.workout_id
    where s.id = section_id and w.user_id = auth.uid()
  ));
create policy "movements_update_own" on public.section_movements for update
  using (exists (
    select 1 from public.workout_sections s
    join public.workouts w on w.id = s.workout_id
    where s.id = section_id and w.user_id = auth.uid()
  ));
create policy "movements_delete_own" on public.section_movements for delete
  using (exists (
    select 1 from public.workout_sections s
    join public.workouts w on w.id = s.workout_id
    where s.id = section_id and w.user_id = auth.uid()
  ));

create policy "sessions_all_own" on public.training_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "lifts_select_own" on public.session_lifts for select
  using (exists (select 1 from public.training_sessions t where t.id = session_id and t.user_id = auth.uid()));
create policy "lifts_insert_own" on public.session_lifts for insert
  with check (exists (select 1 from public.training_sessions t where t.id = session_id and t.user_id = auth.uid()));
create policy "lifts_update_own" on public.session_lifts for update
  using (exists (select 1 from public.training_sessions t where t.id = session_id and t.user_id = auth.uid()));
create policy "lifts_delete_own" on public.session_lifts for delete
  using (exists (select 1 from public.training_sessions t where t.id = session_id and t.user_id = auth.uid()));

create policy "goals_all_own" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
