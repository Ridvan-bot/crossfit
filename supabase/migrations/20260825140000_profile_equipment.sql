-- Utrustning hör till användarprofilen, inte till enskilda pass.
alter table public.profiles
  add column if not exists equipment text;

comment on column public.profiles.equipment is
  'Användarens tillgängliga utrustning (t.ex. "Skivstång · Kettlebell 20 kg").';
