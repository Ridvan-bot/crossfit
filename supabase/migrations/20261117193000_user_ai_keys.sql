-- Per-user BYOK for the personal AI coach. No app-owned key in env.

create table if not exists public.user_ai_keys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  provider text not null check (provider in (
    'openai',
    'anthropic',
    'gemini',
    'cursor',
    'openai_compatible'
  )),
  api_key text not null check (length(trim(api_key)) > 0),
  base_url text,
  updated_at timestamptz not null default now(),
  constraint user_ai_keys_base_url_required check (
    provider <> 'openai_compatible'
    or (base_url is not null and length(trim(base_url)) > 0)
  )
);

comment on table public.user_ai_keys is
  'User-owned AI provider keys (BYOK). Select api_key only in server actions; never render it in the UI.';

comment on column public.user_ai_keys.api_key is
  'Secret. Never returned to the profile UI — only has_key + provider are shown.';

alter table public.user_ai_keys enable row level security;

create policy "user_ai_keys_all_own"
  on public.user_ai_keys
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
