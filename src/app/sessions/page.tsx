import { AppNav } from "@/components/AppNav";
import { createClient } from "@/lib/supabase/server";

export default async function SessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("training_sessions")
    .select("id, score_text, feeling_1_5, rpe_1_10, notes, completed_at, workouts(title, pass_number)")
    .eq("user_id", user!.id)
    .order("completed_at", { ascending: false });

  return (
    <>
      <AppNav />
      <main className="ui-page mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header>
          <p className="ui-eyebrow">Resultat</p>
          <h1 className="ui-title mt-1 text-4xl sm:text-5xl">Historik</h1>
        </header>
        <ul className="ui-card divide-y divide-white/5 overflow-hidden">
          {(sessions ?? []).map((s) => (
            <li key={s.id} className="px-4 py-4 transition hover:bg-teal-500/[0.04]">
              <p className="ui-title text-lg">
                {(s.workouts as { title?: string } | null)?.title ?? "Pass"}
              </p>
              <p className="mt-1 text-stone-200">{s.score_text}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-stone-400">
                  {new Date(s.completed_at).toLocaleDateString("sv-SE")}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-stone-300">
                  Känsla {s.feeling_1_5 ?? "–"}/5
                </span>
                <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-teal-200">
                  RPE {s.rpe_1_10 ?? "–"}/10
                </span>
              </div>
              {s.notes ? <p className="mt-2 text-sm text-stone-400">{s.notes}</p> : null}
            </li>
          ))}
          {(sessions ?? []).length === 0 ? (
            <li className="px-4 py-8 text-center text-stone-500">Inga sessioner ännu.</li>
          ) : null}
        </ul>
      </main>
    </>
  );
}
