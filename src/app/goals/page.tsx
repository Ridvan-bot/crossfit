import { AppNav } from "@/components/AppNav";
import { createGoal, deleteGoal, updateGoal } from "@/app/actions/crud";
import { createClient } from "@/lib/supabase/server";

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user!.id)
    .order("deadline", { ascending: true, nullsFirst: false });

  return (
    <>
      <AppNav />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-extrabold uppercase">
          Mål
        </h1>

        <form action={createGoal} className="grid gap-3 rounded-xl border border-stone-800 bg-stone-900/50 p-4 md:grid-cols-2">
          <input name="title" required placeholder="Mål" className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <input name="deadline" type="date" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <select name="status" defaultValue="ongoing" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2">
            <option value="ongoing">ongoing</option>
            <option value="planned">planned</option>
            <option value="done">done</option>
          </select>
          <input name="current_level" placeholder="Nuvarande nivå" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <input name="notes" placeholder="Anteckningar" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <button type="submit" className="md:col-span-2 rounded-lg bg-amber-500 py-2 font-semibold text-stone-950">
            Lägg till mål
          </button>
        </form>

        <ul className="space-y-4">
          {(goals ?? []).map((g) => (
            <li key={g.id} className="rounded-xl border border-stone-800 bg-stone-900/40 p-4">
              <form action={updateGoal} className="grid gap-2 md:grid-cols-2">
                <input type="hidden" name="id" value={g.id} />
                <input name="title" defaultValue={g.title} className="md:col-span-2 rounded border border-stone-700 bg-stone-950 px-2 py-1" />
                <input name="deadline" type="date" defaultValue={g.deadline ?? ""} className="rounded border border-stone-700 bg-stone-950 px-2 py-1" />
                <select name="status" defaultValue={g.status} className="rounded border border-stone-700 bg-stone-950 px-2 py-1">
                  <option value="ongoing">ongoing</option>
                  <option value="planned">planned</option>
                  <option value="done">done</option>
                </select>
                <input name="current_level" defaultValue={g.current_level ?? ""} className="rounded border border-stone-700 bg-stone-950 px-2 py-1" />
                <input name="notes" defaultValue={g.notes ?? ""} className="rounded border border-stone-700 bg-stone-950 px-2 py-1" />
                <button type="submit" className="rounded bg-stone-100 py-1 text-sm font-semibold text-stone-950">
                  Spara
                </button>
              </form>
              <form action={deleteGoal} className="mt-2">
                <input type="hidden" name="id" value={g.id} />
                <button type="submit" className="text-sm text-red-400">
                  Ta bort
                </button>
              </form>
            </li>
          ))}
          {(goals ?? []).length === 0 ? (
            <li className="text-stone-500">Inga mål ännu.</li>
          ) : null}
        </ul>
      </main>
    </>
  );
}
