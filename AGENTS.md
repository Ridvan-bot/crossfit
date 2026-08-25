# AGENTS - Crossfit-projekt

1. Primärt arbete: Next.js-appen (`src/`) + Supabase-schema (`supabase/migrations/`).
   Markdown under `docs/` är **arkiv/referens**. App + databas är källa till sanning.

2. Supabase-projekt: **crossfit** (`mjtuxpdqeopikjaqlsna`).
   All användardata ska ha RLS (`user_id = auth.uid()`).

3. Kalla rörelser med officiella namn.
   Namn och grundstruktur följer CrossFits officiella lista:
   `https://www.crossfit.com/crossfit-movements`.

4. Huvuddokument / ytor:
   - App: dashboard, pass, telefon/tavla, historik, bibliotek, mål
   - `docs/movements.md`, `docs/wod-library.md`, `docs/training-log.md` (arkiv)
   - `docs/goals-and-metrics.md`, `docs/coaching-playbook.md` (arkiv)

5. Språk och ton:
   Skriv på svenska för coaching, mål och logg. Behåll engelska namn på movements/WOD-termer.

6. Ändringar i upplägg:
   Större förändringar i plan/filosofi dokumenteras kort i `case-journal.md` med datum och varför.

7. Fokus:
   Beslut och innehåll ska stötta långsiktig utveckling i CrossFit med teknik, styrka och hållbarhet.

8. Secrets:
   Aldrig committa `.env.local` eller API-nycklar. Använd `.env.example` med placeholders.
