# CrossFit Träning

Next.js-app med Supabase (Auth + Postgres) och deploy till Vercel.

Pass, WOD-bibliotek, mål, historik och träningsvyer (telefon + tavla med timer).

`docs/*.md` är arkiv. **Appen + databasen** är källa till sanning.

## Lokal utveckling

```bash
cp .env.example .env.local
# Fyll i NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_ANON_KEY
# från Supabase-projektet "crossfit"

npm install
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

1. Skapa konto under `/signup`
2. På dashboard: **Importera pass #001–#008**
3. Öppna ett pass → Telefon eller Tavla

## Supabase

Projekt: `crossfit` (`mjtuxpdqeopikjaqlsna`)

Schema: `supabase/migrations/20260825120000_crossfit_schema.sql`  
RLS: varje rad ägs av `auth.uid()`.

Auth: e-post + lösenord. Under Authentication → Providers, se till att Email är på. För lokal snabbstart kan e-postbekräftelse stängas av under Auth → Providers → Email.

## Vercel

```bash
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel --prod
```

## Scripts

| Kommando | Syfte |
| --- | --- |
| `npm run dev` | Lokal server |
| `npm run build` | Produktionsbuild |
| `npm run start` | Kör build |

## Statisk GUI (legacy)

`workout-gui/` är den tidigare HTML-prototypen. Används inte i produktion.
