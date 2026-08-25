import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { createWorkout, deleteWorkout } from "@/app/actions/crud";
import { createClient } from "@/lib/supabase/server";

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
        <header>
          <p className="ui-eyebrow">Programmera</p>
          <h1 className="ui-title mt-1 text-4xl sm:text-5xl">Pass</h1>
          <p className="mt-2 text-stone-400">
            Skapa WOD med rörelser. Utrustning ställer du in under{" "}
            <Link href="/profile" className="ui-link">
              Profil
            </Link>
            .
          </p>
        </header>

        <form action={createWorkout} className="ui-card grid gap-3 p-5 md:grid-cols-2">
          <h2 className="ui-eyebrow md:col-span-2">Nytt pass</h2>
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
              placeholder={`Auto → #${nextPassNumber}`}
              className="ui-input"
            />
            <p className="mt-1.5 text-xs text-stone-500">
              Lämna tomt så sätts passnummer till {nextPassNumber} automatiskt.
            </p>
          </div>
          <textarea
            name="notes"
            placeholder="Anteckningar"
            className="ui-input md:col-span-2"
            rows={2}
          />
          <fieldset className="md:col-span-2 space-y-3 rounded-xl border border-white/5 bg-black/20 p-3">
            <legend className="px-1 text-sm text-stone-400">Mall för delar</legend>
            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-4">
              <label className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5">
                <input
                  type="radio"
                  name="template"
                  value="classic"
                  defaultChecked
                  className="accent-teal-500"
                />
                Classic (4 delar)
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5">
                <input type="radio" name="template" value="metcon" className="accent-teal-500" />
                Bara Metcon
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5">
                <input type="radio" name="template" value="empty" className="accent-teal-500" />
                Tomt
              </label>
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
                    {w.status}
                  </span>
                  {w.scheduled_date ? ` · genomförd ${w.scheduled_date}` : ""}
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
              Inga pass ännu. Skapa ett eller seeda från dashboard.
            </li>
          ) : null}
        </ul>
      </main>
    </>
  );
}
