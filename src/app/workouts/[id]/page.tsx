import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { HelpTip, FEELING_HELP_TEXT, RPE_HELP_TEXT } from "@/components/HelpTip";
import { MovementPicker } from "@/components/MovementPicker";
import {
  addMovement,
  addSection,
  deleteSection,
  logSessionFromForm,
  updateSection,
  updateWorkout,
} from "@/app/actions/crud";
import { createClient } from "@/lib/supabase/server";
import { todayDateInputValue } from "@/lib/dates";
import { SECTION_KIND_OPTIONS, type WorkoutSection } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function WorkoutDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workout } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!workout) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("equipment")
    .eq("id", user!.id)
    .maybeSingle();

  const { data: sections } = await supabase
    .from("workout_sections")
    .select("*, section_movements(*)")
    .eq("workout_id", id)
    .order("sort_order", { ascending: true });

  const ordered = (sections ?? []).map((s) => ({
    ...s,
    section_movements: [...(s.section_movements ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  })) as WorkoutSection[];

  return (
    <>
      <AppNav />
      <main className="ui-page mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="ui-eyebrow">Passdetalj</p>
            <h1 className="ui-title mt-1 text-4xl sm:text-5xl">
              {workout.title}
            </h1>
            {profile?.equipment ? (
              <p className="text-stone-400">
                Din utrustning: {profile.equipment}{" "}
                <Link href="/profile" className="text-teal-400 hover:underline">
                  ändra
                </Link>
              </p>
            ) : (
              <p className="text-stone-500">
                Ingen utrustning i profilen.{" "}
                <Link href="/profile" className="text-teal-400 hover:underline">
                  Lägg till under Profil
                </Link>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/workouts/${id}/phone`}
              className="ui-btn ui-btn-primary"
            >
              Telefon
            </Link>
            <Link
              href={`/workouts/${id}/board`}
              className="ui-btn ui-btn-outline"
            >
              Tavla
            </Link>
          </div>
        </div>

        <form
          action={updateWorkout}
          className="grid gap-3 rounded-xl border border-stone-800 bg-stone-900/50 p-4 md:grid-cols-2"
        >
          <input type="hidden" name="id" value={id} />
          <h2 className="md:col-span-2 text-sm font-semibold uppercase tracking-wider text-teal-500">
            Redigera pass
          </h2>
          <input
            name="title"
            defaultValue={workout.title}
            required
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
          />
          <input
            name="pass_number"
            type="number"
            defaultValue={workout.pass_number ?? ""}
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
          />
          <select
            name="status"
            defaultValue={workout.status}
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 md:col-span-2"
          >
            <option value="planned">planned</option>
            <option value="done">done</option>
          </select>
          <textarea
            name="notes"
            defaultValue={workout.notes ?? ""}
            rows={2}
            className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
          />
          <button
            type="submit"
            className="md:col-span-2 rounded-lg bg-stone-100 py-2 font-semibold text-stone-950"
          >
            Spara pass
          </button>
        </form>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-500">
            Passdelar
          </h2>
        </div>

        {ordered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-700 px-4 py-6 text-stone-500">
            Inga delar ännu. Lägg till en del nedan.
          </p>
        ) : null}

        {ordered.map((s) => (
          <section
            key={s.id}
            className="rounded-xl border border-stone-800 bg-stone-900/40 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-semibold text-teal-400">
                {s.label}
                {s.estimated_minutes_min
                  ? ` · tar ca ${s.estimated_minutes_min}${
                      s.estimated_minutes_max &&
                      s.estimated_minutes_max !== s.estimated_minutes_min
                        ? `–${s.estimated_minutes_max}`
                        : ""
                    } min`
                  : ""}
              </h3>
              <form action={deleteSection}>
                <input type="hidden" name="section_id" value={s.id} />
                <input type="hidden" name="workout_id" value={id} />
                <button
                  type="submit"
                  className="text-sm text-red-400 hover:underline"
                >
                  Ta bort del
                </button>
              </form>
            </div>

            <form action={updateSection} className="mt-3 grid gap-2 md:grid-cols-2">
              <input type="hidden" name="section_id" value={s.id} />
              <input type="hidden" name="workout_id" value={id} />
              <input
                name="label"
                defaultValue={s.label}
                required
                placeholder="Namn (t.ex. EMOM / Finisher)"
                className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm"
              />
              <select
                name="kind"
                defaultValue={s.kind}
                className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm"
              >
                {SECTION_KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                name="format_label"
                defaultValue={s.format_label ?? ""}
                placeholder="Format-etikett"
                className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm"
              />
              <input
                name="timer_preset_sec"
                type="number"
                defaultValue={s.timer_preset_sec ?? ""}
                placeholder="Timer sek"
                className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm"
              />
              <input
                name="estimated_minutes_min"
                type="number"
                defaultValue={s.estimated_minutes_min ?? ""}
                placeholder="Min min"
                className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm"
              />
              <input
                name="estimated_minutes_max"
                type="number"
                defaultValue={s.estimated_minutes_max ?? ""}
                placeholder="Max min"
                className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm"
              />
              <input
                name="coaching_tip"
                defaultValue={s.coaching_tip ?? ""}
                placeholder="Coaching-tip"
                className="md:col-span-2 rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm"
              />
              <button
                type="submit"
                className="md:col-span-2 text-left text-sm text-teal-400 hover:underline"
              >
                Spara del
              </button>
            </form>

            <ul className="mt-3 space-y-1 text-sm">
              {s.section_movements.map((m) => (
                <li key={m.id} className="rounded bg-stone-950/60 px-3 py-2">
                  <span className="font-medium">{m.name}</span>
                  {m.detail ? (
                    <span className="text-stone-400"> · {m.detail}</span>
                  ) : null}
                  {m.suggested_weight_kg != null ? (
                    <span className="text-teal-300">
                      {" "}
                      · ({m.suggested_weight_kg} kg)
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>

            <form
              action={addMovement}
              className="mt-3 flex flex-wrap items-start gap-2"
            >
              <input type="hidden" name="section_id" value={s.id} />
              <input type="hidden" name="workout_id" value={id} />
              <MovementPicker />
              <input
                name="detail"
                placeholder="Reps/set (t.ex. 5×3)"
                className="rounded border border-stone-700 bg-stone-950 px-2 py-1.5 text-sm"
              />
              <input
                name="suggested_weight_kg"
                type="number"
                step="0.5"
                placeholder="kg"
                className="w-20 rounded border border-stone-700 bg-stone-950 px-2 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="rounded bg-stone-800 px-3 py-1.5 text-sm"
              >
                Lägg till rörelse
              </button>
            </form>
          </section>
        ))}

        <form
          action={addSection}
          className="grid gap-3 rounded-xl border border-dashed border-stone-700 bg-stone-900/30 p-4 md:grid-cols-[1fr_10rem_auto]"
        >
          <input type="hidden" name="workout_id" value={id} />
          <h3 className="md:col-span-3 text-sm font-semibold text-stone-300">
            Lägg till del
          </h3>
          <input
            name="label"
            required
            placeholder="Namn (t.ex. Skill, EMOM, Finisher)"
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
          />
          <select
            name="kind"
            defaultValue="other"
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
          >
            {SECTION_KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-stone-100 px-4 py-2 font-semibold text-stone-950"
          >
            Lägg till
          </button>
        </form>

        <section className="rounded-xl border border-teal-700/40 bg-teal-500/5 p-4">
          <h2 className="font-semibold text-teal-200">Logga genomfört pass</h2>
          <form
            action={logSessionFromForm}
            className="mt-3 grid gap-3 md:grid-cols-2"
          >
            <input type="hidden" name="workout_id" value={id} />
            <label className="grid gap-1.5 md:col-span-2">
              <span className="text-sm text-stone-400">Datum genomfört</span>
              <input
                name="completed_date"
                type="date"
                required
                defaultValue={todayDateInputValue()}
                className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
              />
            </label>
            <input
              name="score_text"
              placeholder="Score (t.ex. 4 hela varv)"
              className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
            />
            <label className="grid gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-400">
                Känsla 1–5
                <HelpTip
                  text={FEELING_HELP_TEXT}
                  label="Vad betyder känsla?"
                  variant="app"
                />
              </span>
              <input
                name="feeling_1_5"
                type="number"
                min={1}
                max={5}
                placeholder="1–5"
                className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-400">
                RPE 1–10
                <HelpTip
                  text={RPE_HELP_TEXT}
                  label="Vad betyder RPE?"
                  variant="app"
                />
              </span>
              <input
                name="rpe_1_10"
                type="number"
                min={1}
                max={10}
                placeholder="1–10"
                className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
              />
            </label>
            <textarea
              name="notes"
              placeholder="Kommentar"
              rows={2}
              className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
            />
            <div className="md:col-span-2 space-y-2">
              <p className="text-sm text-stone-400">
                Vikter (valfritt, upp till 5)
              </p>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-2">
                  <input
                    name="lift_name"
                    placeholder="Rörelse"
                    className="flex-1 rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm"
                  />
                  <input
                    name="lift_weight"
                    type="number"
                    step="0.5"
                    placeholder="kg"
                    className="w-24 rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="md:col-span-2 rounded-lg bg-teal-500 py-3 font-semibold text-stone-950"
            >
              Spara session
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
