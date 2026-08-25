import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import {
  addMovement,
  logSessionFromForm,
  updateSection,
  updateWorkout,
} from "@/app/actions/crud";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutSection } from "@/lib/types";

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
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-extrabold uppercase">
              {workout.title}
            </h1>
            <p className="text-stone-400">{workout.equipment_notes}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/workouts/${id}/phone`}
              className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-stone-950"
            >
              Telefon
            </Link>
            <Link
              href={`/workouts/${id}/board`}
              className="rounded-lg border border-stone-600 px-4 py-2"
            >
              Tavla
            </Link>
          </div>
        </div>

        <form action={updateWorkout} className="grid gap-3 rounded-xl border border-stone-800 bg-stone-900/50 p-4 md:grid-cols-2">
          <input type="hidden" name="id" value={id} />
          <h2 className="md:col-span-2 text-sm font-semibold uppercase tracking-wider text-amber-500">
            Redigera pass
          </h2>
          <input name="title" defaultValue={workout.title} required className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <input name="pass_number" type="number" defaultValue={workout.pass_number ?? ""} className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <input name="scheduled_date" type="date" defaultValue={workout.scheduled_date ?? ""} className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <select name="status" defaultValue={workout.status} className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2">
            <option value="planned">planned</option>
            <option value="done">done</option>
          </select>
          <input name="equipment_notes" defaultValue={workout.equipment_notes ?? ""} className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <textarea name="notes" defaultValue={workout.notes ?? ""} rows={2} className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <button type="submit" className="md:col-span-2 rounded-lg bg-stone-100 py-2 font-semibold text-stone-950">
            Spara pass
          </button>
        </form>

        {ordered.map((s) => (
          <section key={s.id} className="rounded-xl border border-stone-800 bg-stone-900/40 p-4">
            <h3 className="font-semibold text-amber-400">
              {s.label}
              {s.estimated_minutes_min
                ? ` · tar ca ${s.estimated_minutes_min}${
                    s.estimated_minutes_max && s.estimated_minutes_max !== s.estimated_minutes_min
                      ? `–${s.estimated_minutes_max}`
                      : ""
                  } min`
                : ""}
            </h3>

            <form action={updateSection} className="mt-3 grid gap-2 md:grid-cols-2">
              <input type="hidden" name="section_id" value={s.id} />
              <input type="hidden" name="workout_id" value={id} />
              <input name="format_label" defaultValue={s.format_label ?? ""} placeholder="Format-etikett" className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm" />
              <input name="timer_preset_sec" type="number" defaultValue={s.timer_preset_sec ?? ""} placeholder="Timer sek" className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm" />
              <input name="estimated_minutes_min" type="number" defaultValue={s.estimated_minutes_min ?? ""} placeholder="Min min" className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm" />
              <input name="estimated_minutes_max" type="number" defaultValue={s.estimated_minutes_max ?? ""} placeholder="Max min" className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm" />
              <input name="coaching_tip" defaultValue={s.coaching_tip ?? ""} placeholder="Coaching-tip" className="md:col-span-2 rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm" />
              <button type="submit" className="md:col-span-2 text-left text-sm text-amber-400 hover:underline">
                Spara sektion
              </button>
            </form>

            <ul className="mt-3 space-y-1 text-sm">
              {s.section_movements.map((m) => (
                <li key={m.id} className="rounded bg-stone-950/60 px-3 py-2">
                  <span className="font-medium">{m.name}</span>
                  {m.detail ? <span className="text-stone-400"> · {m.detail}</span> : null}
                  {m.suggested_weight_kg != null ? (
                    <span className="text-amber-300"> · ({m.suggested_weight_kg} kg)</span>
                  ) : null}
                </li>
              ))}
            </ul>

            <form action={addMovement} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="section_id" value={s.id} />
              <input type="hidden" name="workout_id" value={id} />
              <input name="name" required placeholder="Rörelse" className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm" />
              <input name="detail" placeholder="Reps/set" className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm" />
              <input name="suggested_weight_kg" type="number" step="0.5" placeholder="kg" className="w-20 rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm" />
              <button type="submit" className="rounded bg-stone-800 px-3 py-1 text-sm">
                Lägg till
              </button>
            </form>
          </section>
        ))}

        <section className="rounded-xl border border-amber-700/40 bg-amber-500/5 p-4">
          <h2 className="font-semibold text-amber-200">Logga genomfört pass</h2>
          <form action={logSessionFromForm} className="mt-3 grid gap-3 md:grid-cols-2">
            <input type="hidden" name="workout_id" value={id} />
            <input name="score_text" placeholder="Score (t.ex. 4 hela varv)" className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
            <input name="feeling_1_5" type="number" min={1} max={5} placeholder="Känsla 1–5" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
            <input name="rpe_1_10" type="number" min={1} max={10} placeholder="RPE 1–10" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
            <textarea name="notes" placeholder="Kommentar" rows={2} className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
            <div className="md:col-span-2 space-y-2">
              <p className="text-sm text-stone-400">Vikter (valfritt, upp till 5)</p>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-2">
                  <input name="lift_name" placeholder="Rörelse" className="flex-1 rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm" />
                  <input name="lift_weight" type="number" step="0.5" placeholder="kg" className="w-24 rounded border border-stone-700 bg-stone-950 px-2 py-1 text-sm" />
                </div>
              ))}
            </div>
            <button type="submit" className="md:col-span-2 rounded-lg bg-amber-500 py-3 font-semibold text-stone-950">
              Spara session
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
