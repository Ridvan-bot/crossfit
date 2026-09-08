# AGENTS - Crossfit-projekt

1. Primärt arbete: Next.js-appen (`src/`) + Supabase-schema (`supabase/migrations/`).
   Markdown under `docs/` är **arkiv/referens**. App + databas är källa till sanning.

2. Supabase-projekt: **crossfit** (`mjtuxpdqeopikjaqlsna`).
   All användardata ska ha RLS (`user_id = auth.uid()`).
   Utrustning ligger på **profilen** (`profiles.equipment`), inte på enskilda pass.

3. Kalla rörelser med officiella namn.
   Namn och grundstruktur följer CrossFits officiella lista:
   `https://www.crossfit.com/crossfit-movements`.
   Appen har en sökbar katalog i `src/lib/movements.ts`.

4. När du bygger / föreslår WODs eller pass:
   - **Reps/set-notation (alltid):** `A × B` betyder **A reps, B gånger** (set).
     Exempel: `2 × 6` = 2 reps, 6 gånger. **Inte** sets×reps.
     Skriv aldrig tvetydigt — håll dig till den här konventionen i alla WOD-texter.
   - Hämta inspiration från CrossFits dagliga WOD-sida:
     `https://www.crossfit.com/workout/`
     (format, pacing, struktur: AMRAP / For Time / EMOM / rounds, m.m.).
   - Anpassa till hemmautrustning, ingen (eller begränsad) hopprep om användaren sagt det,
     och coachingfilosofin: teknik → styrka → kort metcon.
   - Kopiera inte rakt av benchmark-WODs utan att skala till nivå och utrustning.

5. Huvuddokument / ytor:
   - App: dashboard, pass, telefon/tavla, historik, bibliotek, mål
   - `docs/movements.md`, `docs/wod-library.md`, `docs/training-log.md` (arkiv)
   - `docs/goals-and-metrics.md`, `docs/coaching-playbook.md` (arkiv)

6. Språk och ton:
   Skriv på svenska för coaching, mål och logg. Behåll engelska namn på movements/WOD-termer.

7. Ändringar i upplägg:
   Större förändringar i plan/filosofi dokumenteras kort i `case-journal.md` med datum och varför.

8. Fokus:
   Beslut och innehåll ska stötta långsiktig utveckling i CrossFit med teknik, styrka och hållbarhet.

9. Secrets:
   Aldrig committa `.env.local` eller API-nycklar. Använd `.env.example` med placeholders.
