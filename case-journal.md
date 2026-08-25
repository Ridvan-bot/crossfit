# Case Journal - Crossfit-projekt

## 1) Snabbstatus

- Senast uppdaterad: 2026-08-25
- Övergripande mål: CrossFit-app på Vercel med Supabase (pass, timer, logg, mål).
- Nuvarande läge: Utrustning i profil; WOD byggs med sökbara CrossFit-rörelser. Tavla har inline-redigering av WOD.
- Nästa steg:
  - I Vercel: koppla GitHub-repot `Ridvan-bot/crossfit`, lägg env-variabler, deploy.
  - Fyll i utrustning under Profil.
  - Kör pass #008.

## 2) Miljö och kontext

- Repo: `crossfit`
- Format: Next.js (`src/`) + Supabase; `docs/` och `workout-gui/` som arkiv/legacy
- Supabase: projekt **crossfit** (`mjtuxpdqeopikjaqlsna`)
- Träningsfokus: Teknik och styrka framför flås
- Fokusområde: Olympiska lyft (clean/snatch)
- Utrustning: skivstång + vikter, KB 20 kg, DB 15 kg, AbMat, hopprep (sätts i appen under Profil)

## 3) Genomfört

### 2026-08-25 - Redigera WOD på tavla

- Edit-knapp uppe till höger på tavlan → redigeringsläge.
- Delnamn, format, rörelser, reps/detalj, vikt (kg) och coaching-tip är editerbara.
- Lägg till / ta bort rörelser och delar direkt på tavlan.
- SPARA via `saveBoardEdit` (Supabase); AVBRYT återställer utkast.

### 2026-08-25 - Profil-utrustning + rörelseväljare

- `profiles.equipment` tillagd (migration).
- Ny sida `/profile` för utrustning.
- Vid WOD-bygg: sökbar lista med CrossFit-rörelser (Clean and Jerk, Wall-ball Shot, m.fl.).
- Utrustning borttagen från skapa/redigera pass.

### 2026-03-31 - Projektstart

- Skapat repo-lokal dokumentstruktur:
  - `AGENTS.md`
  - `case-journal.md`
  - `troubleshooting-log.md`
  - `docs/movements.md`
  - `docs/wod-library.md`
  - `docs/training-log.md`
  - `docs/goals-and-metrics.md`
  - `docs/coaching-playbook.md`
- Definierat målbild, coachingprinciper och första konkreta WOD/pass.

### 2026-03-31 - Inriktning uppdaterad

- Prioritering justerad till olympiska lyft (teknik + styrka).
- Utrustningsinventering dokumenterad i `docs/equipment-and-constraints.md`.
- WOD-bibliotek och träningslogg uppdaterade utan maskinkrav.

### 2026-05-29 - Block 2 planerat

- Block 1 avslutat (pass #001–#004) med tydlig progression i pacing och styrka.
- Nytt 4-pass-block (#005–#008) tillagt i `docs/wod-library.md` och `docs/training-log.md`.
- Pass #005 (Clean Day) redo att köras idag; små viktökningar från block 1 (HPC/FS/PC förslag 35/45 kg).

### 2026-08-25 - Workout GUI

- Skapat `workout-gui/`: väljare + telefon-GUI + tavla-GUI (landscape chalk).
- Syfte: läsbarhet under träning (svårt att följa hela `.md`-loggen live).

### 2026-08-25 - Next.js + Supabase (crossfit-projekt)

- Scaffoldat Next.js App Router + Tailwind + Auth (signup/login).
- Schema + RLS i nytt Supabase-projekt **crossfit** (`mjtuxpdqeopikjaqlsna`).
- Sidor: dashboard, pass CRUD, telefon/tavla-timer, historik, WOD-bibliotek, mål.
- Seed-knapp importerar pass #001–#008 + sessioner/mål från träningsloggen.
- `docs/` och `workout-gui/` = arkiv; app + DB = källa till sanning.
- MCP `~/.cursor/mcp.json` pekar på `project_ref=mjtuxpdqeopikjaqlsna`.
- Vercel: projekt skapat via MCP (`crossfit-app` / `prj_Kv1yfqFSM5nnEEvyZ9M4zGze4dhk`) men Git-länk verifierades inte (404). Användaren behöver i Vercel Dashboard: Import GitHub-repo `Ridvan-bot/crossfit`, sätt env `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`, deploy.

## 4) Planerade ändringar / roadmap

- Kort sikt (1-2 mån):
  - Etablera rutin med 1 kvalitetspass/vecka.
  - Prioritera teknik i squat, deadlift, press och grunddrag.
  - Fånga progression i logg med tydliga anteckningar.

- Medellång sikt (3-6 mån):
  - Justera till 2 pass/vecka om vardagen tillåter.
  - Introducera fler benchmark-liknande pass.

## 5) Öppna punkter

- När ska vi testa ökad frekvens (2 pass/vecka)?
- Vilka 2-3 benchmark-WODs ska följas kontinuerligt?
