import Link from "next/link";
import {
  CONSTRAINT_OPTIONS,
  FOCUS_OPTIONS,
  parsePreferences,
  type AthletePreferences,
} from "@/lib/athlete";

export function AthletePreferencesFields({
  preferences,
}: {
  preferences: AthletePreferences;
}) {
  const prefs = parsePreferences(preferences);

  return (
    <div className="md:col-span-2 grid gap-5 border-t border-white/5 pt-5">
      <div>
        <h2 className="ui-eyebrow">Träningsprofil</h2>
        <p className="mt-1 text-sm text-stone-500">
          Detta styr hur pass och WOD:er anpassas till dig över tid — fokus,
          begränsningar och vad du tycker är kul.
        </p>
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm text-stone-400">Fokus</legend>
        <div className="flex flex-wrap gap-2">
          {FOCUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm hover:border-teal-500/40"
            >
              <input
                type="checkbox"
                name="focus"
                value={opt.value}
                defaultChecked={prefs.focus.includes(opt.value)}
                className="accent-teal-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="text-sm text-stone-400">Begränsningar</legend>
        <div className="flex flex-wrap gap-2">
          {CONSTRAINT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm hover:border-teal-500/40"
            >
              <input
                type="checkbox"
                name="constraints"
                value={opt.value}
                defaultChecked={prefs.constraints.includes(opt.value)}
                className="accent-teal-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm text-stone-400">Erfarenhet</span>
          <select
            name="experience"
            defaultValue={prefs.experience ?? ""}
            className="ui-input"
          >
            <option value="">Välj…</option>
            <option value="beginner">Nybörjare</option>
            <option value="intermediate">Medel</option>
            <option value="advanced">Avancerad</option>
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm text-stone-400">Pass per vecka</span>
          <input
            name="sessions_per_week"
            type="number"
            min={1}
            max={7}
            defaultValue={prefs.sessions_per_week ?? ""}
            placeholder="t.ex. 1"
            className="ui-input"
          />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-sm text-stone-400">
          Rörelser jag tycker om (kommaseparerat, officiella namn)
        </span>
        <input
          name="fun_movements"
          defaultValue={prefs.fun_movements.join(", ")}
          placeholder="t.ex. Hang Power Clean, Front Squat, Kettlebell Swing"
          className="ui-input"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm text-stone-400">
          Rörelser jag vill undvika (kommaseparerat)
        </span>
        <input
          name="avoid_movements"
          defaultValue={prefs.avoid_movements.join(", ")}
          placeholder="t.ex. Double-unders, Box Jump"
          className="ui-input"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm text-stone-400">Övrigt (fritt)</span>
        <textarea
          name="athlete_notes"
          rows={3}
          defaultValue={prefs.notes ?? ""}
          placeholder="T.ex. teknik framför flås, gillar clean mer än snatch…"
          className="ui-input"
        />
      </label>

      <p className="text-xs text-stone-500">
        Tips: se{" "}
        <Link href="https://www.crossfit.com/crossfit-movements" className="ui-link">
          CrossFit movements
        </Link>{" "}
        för officiella namn.
      </p>
    </div>
  );
}
