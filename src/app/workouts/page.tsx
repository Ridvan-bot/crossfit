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
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-extrabold uppercase">
              Pass
            </h1>
            <p className="text-stone-400">
              Skapa WOD med rörelser. Utrustning ställer du in under{" "}
              <Link href="/profile" className="text-amber-400 hover:underline">
                Profil
              </Link>
              .
            </p>
          </div>
        </div>

        <form
          action={createWorkout}
          className="grid gap-3 rounded-xl border border-stone-800 bg-stone-900/50 p-4 md:grid-cols-2"
        >
          <h2 className="md:col-span-2 text-sm font-semibold uppercase tracking-wider text-amber-500">
            Nytt pass
          </h2>
          <input
            name="title"
            required
            placeholder={`Titel (t.ex. Pass #${String(nextPassNumber).padStart(3, "0")})`}
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
          />
          <div>
            <input
              name="pass_number"
              type="number"
              min={1}
              placeholder={`Auto → #${nextPassNumber}`}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
            />
            <p className="mt-1 text-xs text-stone-500">
              Lämna tomt så sätts passnummer till {nextPassNumber} automatiskt.
            </p>
          </div>
          <textarea
            name="notes"
            placeholder="Anteckningar"
            className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
            rows={2}
          />
          <fieldset className="md:col-span-2 space-y-2">
            <legend className="text-sm text-stone-400">Mall för delar</legend>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="template"
                  value="classic"
                  defaultChecked
                  className="accent-amber-500"
                />
                Classic (Warmup · Teknik · Styrka · Metcon)
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="template"
                  value="metcon"
                  className="accent-amber-500"
                />
                Bara Metcon
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="template"
                  value="empty"
                  className="accent-amber-500"
                />
                Tomt (lägg till delar själv)
              </label>
            </div>
          </fieldset>
          <button
            type="submit"
            className="md:col-span-2 rounded-lg bg-amber-500 py-2 font-semibold text-stone-950"
          >
            Skapa pass
          </button>
        </form>

        <ul className="divide-y divide-stone-800 rounded-xl border border-stone-800">
          {(workouts ?? []).map((w) => (
            <li
              key={w.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <Link
                  href={`/workouts/${w.id}`}
                  className="font-semibold hover:text-amber-400"
                >
                  {w.title}
                  {w.pass_number != null ? (
                    <span className="ml-2 text-sm font-normal text-stone-500">
                      #{String(w.pass_number).padStart(3, "0")}
                    </span>
                  ) : null}
                </Link>
                <p className="text-sm text-stone-500">
                  {w.status}
                  {w.scheduled_date ? ` · genomförd ${w.scheduled_date}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/workouts/${w.id}/phone`}
                  className="rounded-md bg-stone-800 px-2 py-1 text-sm"
                >
                  Telefon
                </Link>
                <Link
                  href={`/workouts/${w.id}/board`}
                  className="rounded-md bg-stone-800 px-2 py-1 text-sm"
                >
                  Tavla
                </Link>
                <form action={deleteWorkout}>
                  <input type="hidden" name="id" value={w.id} />
                  <button
                    type="submit"
                    className="rounded-md px-2 py-1 text-sm text-red-400 hover:bg-red-950/40"
                  >
                    Ta bort
                  </button>
                </form>
              </div>
            </li>
          ))}
          {(workouts ?? []).length === 0 ? (
            <li className="px-4 py-6 text-stone-500">
              Inga pass ännu. Skapa ett eller seeda från dashboard.
            </li>
          ) : null}
        </ul>
      </main>
    </>
  );
}
