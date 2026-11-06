# Case Journal - Crossfit-projekt

## 1) Snabbstatus

- Senast uppdaterad: 2026-11-06
- Övergripande mål: CrossFit-app på Vercel med Supabase (pass, timer, logg, mål).
- Nuvarande läge: Block 5 pågår. #017 genomfört (5:42). Passupplägg varieras (samma warmup, olika arbetspass). #018 är dagens teknik-/styrkepass utan metcon pga snuva.
- Nästa steg:
  - #019 EMOM-WOD och #020 tung DL + chipper när andningen är OK.

## 2) Miljö och kontext

- Repo: `crossfit`
- Format: Next.js (`src/`) + Supabase; `docs/` och `workout-gui/` som arkiv/legacy
- Supabase: projekt **crossfit** (`mjtuxpdqeopikjaqlsna`)
- Träningsfokus: Teknik och styrka framför flås
- Fokusområde: Olympiska lyft (clean/snatch)
- Utrustning: skivstång + vikter, KB 20 kg, DB 15 kg, AbMat, hopprep (sätts i appen under Profil)

## 3) Genomfört

### 2026-11-06 - Varierade passupplägg + standardwarmup

- Alla pass hade samma fyra block (warmup / teknik / styrka / metcon). Det är inte CrossFit-variance.
- Källa: Glassman-template (1–3 modaliteter, inte allt varje dag) och HQ Ask a Coach (sällan styrka + metcon samma pass).
- Appen: `src/lib/session-layout.ts` — `STANDARD_WARMUP` + mallar (Oly, teknik, WOD, EMOM, skill+WOD, styrka+WOD). Classic 4-delar borttagen från skapa-pass.
- Passupplägg framåt:
  - #019 WOD-dag: EMOM 12 (Thruster / KB Swing / Push-up).
  - #020 tvådelat: Deadlift 3 × 4 @ 55 + kort chipper.
- Genomförda pass (#001–#017) orörda.

### 2026-11-06 - Pass #018 omgjort till teknik/styrka (ingen flås)

- Robin snuvig, vill inte köra flås. CrossFit.com 261106 är Fight Gone Bad — skippad.
- #018 (block 5 vecka 2, clean-dag) omlagd: metcon/For Time borttagen. Warmup utan marsch.
- Teknik: Hang Power Clean 2 × 6 @ 35 (under loggade 40). Styrka: Front Squat 3 × 4 @ 50 + Shoulder Press 5 × 3 @ 30. Full vila.
- #019–#020 orörda.

### 2026-09-30 - Block 4 (#013–#016) från athlete data

- Byggda utifrån logg: HPC 40, FS 50→55, DL 60 tungt, #011 sit-ups begränsar, #012 för lätt (RPE 5).
- Nya rörelser: Goblet Squat, Shoulder Press, Thruster, Dumbbell Thruster, Sumo Deadlift High Pull, Hollow Rock, Push-up i metcon.
- Ingen hopprep/DU. Formatetiketter med antal varv.

### 2026-09-08 - Lära av användaren (athlete learning)

- `profiles.preferences` (fokus, constraints, kul/undvik, erfarenhet).
- `athlete_insights` (bästa lyft, RPE/känsla, summary) — uppdateras efter varje loggad session.
- Dashboard-kort + profilfält. Regel i `AGENTS.md`: WOD-bygge måste läsa preferenser + insights.

### 2026-09-08 - WOD-notation reps × gånger

- Konvention i appen: `A × B` = **A reps, B gånger**. Dokumenterat i `AGENTS.md`.
- Befintliga pass uppdaterade (t.ex. teknik `6 × 2` → `2 × 6`).

### 2026-09-08 - WOD-inspiration från CrossFit.com

- Vid framtida WOD-/passbygge: titta på `https://www.crossfit.com/workout/` för struktur och format, sedan skala till hemmautrustning och coachingfilosofi (noterat i `AGENTS.md`).

### 2026-09-08 - Dashboard-bakgrund

- Bytt ut hårda teal-blobs mot chalk/gym-atmosfär (`public/dashboard-bg.jpg` + mjuk overlay).
- Stitch MCP autentiserades men verktyg fanns inte i sessionen — bakgrund genererad och polishad manuellt.

- Nya pass i Supabase + seed: Clean/Snatch-växling, ingen hopprep.
- Progression från loggade vikter (#006–#007): HPC/HPS 35, FS 55, DL 60/55, PP 45.
- Test-pass (#9) borttaget för att frigöra passnummer.

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
