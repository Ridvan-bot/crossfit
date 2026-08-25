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

  return (
    <>
      <AppNav />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-extrabold uppercase">
              Pass
            </h1>
            <p className="text-stone-400">Skapa och öppna dina workouts.</p>
          </div>
        </div>

        <form action={createWorkout} className="grid gap-3 rounded-xl border border-stone-800 bg-stone-900/50 p-4 md:grid-cols-2">
          <h2 className="md:col-span-2 text-sm font-semibold uppercase tracking-wider text-amber-500">
            Nytt pass
          </h2>
          <input name="title" required placeholder="Titel (t.ex. Pass #009)" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <input name="pass_number" type="number" placeholder="Passnummer" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <input name="scheduled_date" type="date" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <input name="equipment_notes" placeholder="Utrustning" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <textarea name="notes" placeholder="Anteckningar" className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" rows={2} />
          <button type="submit" className="md:col-span-2 rounded-lg bg-amber-500 py-2 font-semibold text-stone-950">
            Skapa pass (med 4 tomma delar)
          </button>
        </form>

        <ul className="divide-y divide-stone-800 rounded-xl border border-stone-800">
          {(workouts ?? []).map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <Link href={`/workouts/${w.id}`} className="font-semibold hover:text-amber-400">
                  {w.title}
                </Link>
                <p className="text-sm text-stone-500">
                  {w.status} · {w.scheduled_date ?? "ingen dag"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/workouts/${w.id}/phone`} className="rounded-md bg-stone-800 px-2 py-1 text-sm">
                  Telefon
                </Link>
                <Link href={`/workouts/${w.id}/board`} className="rounded-md bg-stone-800 px-2 py-1 text-sm">
                  Tavla
                </Link>
                <form action={deleteWorkout}>
                  <input type="hidden" name="id" value={w.id} />
                  <button type="submit" className="rounded-md px-2 py-1 text-sm text-red-400 hover:bg-red-950/40">
                    Ta bort
                  </button>
                </form>
              </div>
            </li>
          ))}
          {(workouts ?? []).length === 0 ? (
            <li className="px-4 py-6 text-stone-500">Inga pass ännu. Skapa ett eller seeda från dashboard.</li>
          ) : null}
        </ul>
      </main>
    </>
  );
}
