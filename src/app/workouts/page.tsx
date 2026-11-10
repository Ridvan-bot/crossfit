import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { CreateWorkoutForm } from "@/components/CreateWorkoutForm";
import { deleteWorkout } from "@/app/actions/crud";
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
      <main className="ui-page mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <CreateWorkoutForm />

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
