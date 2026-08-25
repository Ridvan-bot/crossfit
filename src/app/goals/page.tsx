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
      <main className="ui-page mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header>
          <p className="ui-eyebrow">Långsiktigt</p>
          <h1 className="ui-title mt-1 text-4xl sm:text-5xl">Mål</h1>
        </header>

        <form action={createGoal} className="ui-card grid gap-3 p-5 md:grid-cols-2">
          <input
            name="title"
            required
            placeholder="Mål"
            className="ui-input md:col-span-2"
          />
          <input name="deadline" type="date" className="ui-input" />
          <select name="status" defaultValue="ongoing" className="ui-input">
            <option value="ongoing">ongoing</option>
            <option value="planned">planned</option>
            <option value="done">done</option>
          </select>
          <input name="current_level" placeholder="Nuvarande nivå" className="ui-input" />
          <input name="notes" placeholder="Anteckningar" className="ui-input" />
          <button type="submit" className="ui-btn ui-btn-primary md:col-span-2 py-3">
            Lägg till mål
          </button>
        </form>

        <ul className="ui-stagger space-y-4">
          {(goals ?? []).map((g) => (
            <li key={g.id} className="ui-card p-4">
              <form action={updateGoal} className="grid gap-2 md:grid-cols-2">
                <input type="hidden" name="id" value={g.id} />
                <input
                  name="title"
                  defaultValue={g.title}
                  className="ui-input md:col-span-2"
                />
                <input
                  name="deadline"
                  type="date"
                  defaultValue={g.deadline ?? ""}
                  className="ui-input"
                />
                <select name="status" defaultValue={g.status} className="ui-input">
                  <option value="ongoing">ongoing</option>
                  <option value="planned">planned</option>
                  <option value="done">done</option>
                </select>
                <input
                  name="current_level"
                  defaultValue={g.current_level ?? ""}
                  className="ui-input"
                />
                <input name="notes" defaultValue={g.notes ?? ""} className="ui-input" />
                <button type="submit" className="ui-btn ui-btn-ghost py-2 text-sm">
                  Spara
                </button>
              </form>
              <form action={deleteGoal} className="mt-2">
                <input type="hidden" name="id" value={g.id} />
                <button type="submit" className="text-sm text-red-400 hover:underline">
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
