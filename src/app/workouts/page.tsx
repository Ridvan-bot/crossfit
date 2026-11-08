import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { createWorkout, deleteWorkout } from "@/app/actions/crud";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SESSION_LAYOUT,
  SESSION_LAYOUT_OPTIONS,
} from "@/lib/session-layout";

export default async function WorkoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, title, pass_number, scheduled_date, status")
    .eq("user_id", user!.id)
    .order("pass_number", { ascending: true, nullsFirst: false });

  const nextPassNumber =
    Math.max(0, ...(workouts ?? []).map((w) => w.pass_number ?? 0)) + 1;

  return (
    <>
      <AppNav />
      <main className="ui-page mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <form action={createWorkout} className="ui-card grid gap-3 p-5 md:grid-cols-2">
          <h1 className="ui-eyebrow md:col-span-2">Nytt pass</h1>
          <input
            name="title"
            required
            placeholder={`Titel (t.ex. Pass #${String(nextPassNumber).padStart(3, "0")})`}
            className="ui-input"
          />
          <div>
            <input
              name="pass_number"
              type="number"
              min={1}
              placeholder={`#${nextPassNumber} (auto)`}
              className="ui-input"
            />
          </div>
          <textarea
            name="notes"
            placeholder="Anteckningar"
            className="ui-input md:col-span-2"
            rows={2}
          />
          <fieldset className="md:col-span-2 space-y-3 rounded-xl border border-white/5 bg-black/20 p-3">
            <legend className="px-1 text-sm text-stone-400">Dagens prioritet</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {SESSION_LAYOUT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="inline-flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5"
                >
                  <input
                    type="radio"
                    name="template"
                    value={opt.id}
                    defaultChecked={opt.id === DEFAULT_SESSION_LAYOUT}
                    className="mt-1 accent-teal-500"
                  />
                  <span>
                    <span className="text-sm text-stone-200">{opt.label}</span>
                    <span className="mt-0.5 block text-xs text-stone-500">
                      {opt.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="ui-btn ui-btn-primary md:col-span-2 py-3">
            Skapa pass
          </button>
        </form>

        <ul className="ui-card divide-y divide-white/5 overflow-hidden">
          {(workouts ?? []).map((w) => (
            <li
              key={w.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 transition hover:bg-teal-500/[0.04]"
            >
              <div>
                <Link href={`/workouts/${w.id}`} className="font-semibold hover:text-teal-300">
                  {w.title}
                  {w.pass_number != null ? (
                    <span className="ml-2 text-sm font-normal text-stone-500">
                      #{String(w.pass_number).padStart(3, "0")}
                    </span>
                  ) : null}
                </Link>
                <p className="mt-0.5 text-sm text-stone-500">
                  <span
                    className={
                      w.status === "done"
                        ? "text-teal-300/90"
                        : "text-stone-400"
                    }
                  >
                    {w.status === "done" ? "Genomfört" : "Planerat"}
                  </span>
                  {w.scheduled_date ? ` · ${w.scheduled_date}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/workouts/${w.id}/phone`} className="ui-btn ui-btn-primary px-3 py-1.5 text-xs">
                  Telefon
                </Link>
                <Link href={`/workouts/${w.id}/board`} className="ui-btn ui-btn-ghost px-3 py-1.5 text-xs">
                  Tavla
                </Link>
                <form action={deleteWorkout}>
                  <input type="hidden" name="id" value={w.id} />
                  <button
                    type="submit"
                    className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/40"
                  >
                    Ta bort
                  </button>
                </form>
              </div>
            </li>
          ))}
          {(workouts ?? []).length === 0 ? (
            <li className="px-4 py-8 text-center text-stone-500">
              Inga pass ännu.
            </li>
          ) : null}
        </ul>
      </main>
    </>
  );
}
