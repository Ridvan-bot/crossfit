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
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-extrabold uppercase">
          Historik
        </h1>
        <ul className="divide-y divide-stone-800 rounded-xl border border-stone-800">
          {(sessions ?? []).map((s) => (
            <li key={s.id} className="px-4 py-4">
              <p className="font-semibold">
                {(s.workouts as { title?: string } | null)?.title ?? "Pass"}
              </p>
              <p className="text-stone-300">{s.score_text}</p>
              <p className="text-sm text-stone-500">
                {new Date(s.completed_at).toLocaleDateString("sv-SE")} · Känsla{" "}
                {s.feeling_1_5 ?? "–"}/5 · RPE {s.rpe_1_10 ?? "–"}/10
              </p>
              {s.notes ? <p className="mt-1 text-sm text-stone-400">{s.notes}</p> : null}
            </li>
          ))}
          {(sessions ?? []).length === 0 ? (
            <li className="px-4 py-6 text-stone-500">Inga sessioner ännu.</li>
          ) : null}
        </ul>
      </main>
    </>
  );
}
