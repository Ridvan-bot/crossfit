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
   - **Uppvärmning (alltid densamma):** använd `STANDARD_WARMUP` i `src/lib/session-layout.ts`.
     Inte en unik warmup per pass. Specifik förberedelse av dagens rörelse hör hemma i arbetspasset.
   - **Variera upplägget:** kör inte teknik + styrka + metcon varje pass. Dagen har en prioritet
     (styrka/oly, teknik, WOD, EMOM). Tvådelat (skill+WOD eller styrka+WOD) ibland, inte som mall.
     Mallar: `SESSION_LAYOUTS` i `src/lib/session-layout.ts`.
   - **Metcon på tavlan (när det finns):** `format_label` måste tydligt ange strukturen:
     - For Time med fasta varv: t.ex. `FOR TIME · 3 ROUNDS · MAX 8 MIN:`
     - AMRAP: t.ex. `AMRAP 10 MIN · SÅ MÅNGA VARV DU HINNER:`
     - EMOM: t.ex. `EMOM 12 MIN · 1 RÖRELSE / MIN`
     - Chipper: t.ex. `FOR TIME · CHIPPER · MAX 10 MIN:`
     Antal varv / tid / format får **aldrig** bara ligga i coaching-tip — det ska synas i formatet på tavlan.
   - Hämta inspiration från CrossFits dagliga WOD-sida:
     `https://www.crossfit.com/workout/`
     (format, pacing, struktur: AMRAP / For Time / EMOM / chipper / tungt lyft-dag, m.m.).
   - Anpassa till hemmautrustning, ingen (eller begränsad) hopprep om användaren sagt det.
     Coaching: kvalitet och intensitet i *dagens* prioritet — inte tre halvfärdiga block.
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

10. Lära av användaren (skalbart, per atlet):
    - Varje användare har egna `profiles.preferences` (fokus, constraints, kul/undvik)
      och `athlete_insights` (bästa lyft, RPE/känsla, sammanfattning).
    - Efter varje loggad session uppdateras insights automatiskt.
    - När du bygger/föreslår WOD:er **måste** du läsa preferenser + insights
      (och historik) — skala vikter, undvik constrained rörelser, variera efter
      vad användaren tycker är kul och hur senaste passen gick.
    - Olika atleter ska få olika upplevelser; kopiera inte samma pass till alla.

11. Secrets:
    Aldrig committa `.env.local` eller API-nycklar. Använd `.env.example` med placeholders.
