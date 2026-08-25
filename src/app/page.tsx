import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { SeedButton } from "@/components/SeedButton";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: nextWorkout } = await supabase
    .from("workouts")
    .select("id, title, pass_number, scheduled_date, status")
    .eq("user_id", user!.id)
    .eq("status", "planned")
    .order("pass_number", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: lastSession } = await supabase
    .from("training_sessions")
    .select("id, score_text, feeling_1_5, rpe_1_10, completed_at, workouts(title, pass_number)")
    .eq("user_id", user!.id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  return (
    <>
      <AppNav />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-extrabold uppercase tracking-wide">
            Dashboard
          </h1>
          <p className="mt-1 text-stone-400">Nästa pass, senaste resultat och snabbstart.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500">
              Nästa pass
            </h2>
            {nextWorkout ? (
              <div className="mt-3 space-y-3">
                <p className="text-2xl font-semibold">{nextWorkout.title}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/workouts/${nextWorkout.id}`}
                    className="rounded-lg bg-stone-800 px-3 py-2 text-sm hover:bg-stone-700"
                  >
                    Öppna
                  </Link>
                  <Link
                    href={`/workouts/${nextWorkout.id}/phone`}
                    className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-stone-950"
                  >
                    Telefon
                  </Link>
                  <Link
                    href={`/workouts/${nextWorkout.id}/board`}
                    className="rounded-lg border border-stone-600 px-3 py-2 text-sm"
                  >
                    Tavla
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-stone-400">Inga planerade pass.</p>
            )}
          </section>

          <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500">
              Senaste session
            </h2>
            {lastSession ? (
              <div className="mt-3 space-y-1">
                <p className="text-xl font-semibold">
                  {(lastSession.workouts as { title?: string } | null)?.title ?? "Pass"}
                </p>
                <p className="text-stone-300">{lastSession.score_text}</p>
                <p className="text-sm text-stone-500">
                  Känsla {lastSession.feeling_1_5}/5 · RPE {lastSession.rpe_1_10}/10
                </p>
              </div>
            ) : (
              <p className="mt-3 text-stone-400">Ingen historik ännu.</p>
            )}
          </section>
        </div>

        {(count ?? 0) === 0 ? (
          <section className="rounded-xl border border-dashed border-amber-700/40 bg-amber-500/5 p-5">
            <h2 className="font-semibold text-amber-200">Kom igång</h2>
            <p className="mt-1 text-sm text-stone-400">
              Importera pass #001–#008, mål och WOD-mallar från din träningslogg.
            </p>
            <div className="mt-4">
              <SeedButton />
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
