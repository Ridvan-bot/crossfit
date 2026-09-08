import Link from "next/link";
import type { AthleteInsights, AthletePreferences } from "@/lib/athlete";
import { FOCUS_OPTIONS, CONSTRAINT_OPTIONS } from "@/lib/athlete";

export function AthleteLearningCard({
  preferences,
  insights,
}: {
  preferences: AthletePreferences;
  insights: AthleteInsights | null;
}) {
  const focusLabels = preferences.focus
    .map((v) => FOCUS_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);
  const constraintLabels = preferences.constraints
    .map((v) => CONSTRAINT_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);

  const topLifts = Object.entries(insights?.movement_best ?? {})
    .sort((a, b) => b[1].weight_kg - a[1].weight_kg)
    .slice(0, 4);

  return (
    <section className="ui-card ui-card-accent p-5 sm:p-6 md:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="ui-eyebrow">Lärdomar om dig</h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-300">
            {insights?.summary_sv ??
              "När du loggar pass byggs en personlig bild: vikter, RPE, känsla och preferenser. Det styr framtida WOD:er."}
          </p>
        </div>
        <Link href="/profile" className="ui-btn ui-btn-ghost text-xs">
          Uppdatera profil
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Preferenser
          </p>
          <ul className="mt-2 space-y-1 text-sm text-stone-300">
            {focusLabels.length ? (
              <li>Fokus: {focusLabels.join(", ")}</li>
            ) : (
              <li className="text-stone-500">Ingen fokus vald ännu</li>
            )}
            {constraintLabels.length ? (
              <li>Begränsningar: {constraintLabels.join(", ")}</li>
            ) : null}
            {preferences.fun_movements.length ? (
              <li>Kul: {preferences.fun_movements.join(", ")}</li>
            ) : null}
            {preferences.avoid_movements.length ? (
              <li>Undvik: {preferences.avoid_movements.join(", ")}</li>
            ) : null}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Loggade lyft (bästa)
          </p>
          {topLifts.length ? (
            <ul className="mt-2 space-y-1 text-sm text-stone-300">
              {topLifts.map(([name, v]) => (
                <li key={name}>
                  {name}: <span className="text-teal-200">{v.weight_kg} kg</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-stone-500">
              Inga lyft loggade ännu — fyll i vikter under Pass klart.
            </p>
          )}
          {insights && (
            <p className="mt-3 text-xs text-stone-500">
              {insights.total_sessions} sessioner
              {insights.rpe_avg_last_4 != null
                ? ` · RPE-snitt ${insights.rpe_avg_last_4}`
                : ""}
              {insights.feeling_avg_last_4 != null
                ? ` · känsla ${insights.feeling_avg_last_4}`
                : ""}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
