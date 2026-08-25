import { AppNav } from "@/components/AppNav";
import { createTemplate, deleteTemplate } from "@/app/actions/crud";
import { createClient } from "@/lib/supabase/server";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: templates } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <AppNav />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-extrabold uppercase">
          WOD-bibliotek
        </h1>

        <form action={createTemplate} className="grid gap-3 rounded-xl border border-stone-800 bg-stone-900/50 p-4 md:grid-cols-2">
          <input name="name" required placeholder="Namn" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <input name="workout_type" placeholder="Typ (AMRAP / For Time)" defaultValue="mixed" className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <textarea name="notes" placeholder="Anteckningar" rows={2} className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" />
          <button type="submit" className="md:col-span-2 rounded-lg bg-amber-500 py-2 font-semibold text-stone-950">
            Lägg till mall
          </button>
        </form>

        <ul className="divide-y divide-stone-800 rounded-xl border border-stone-800">
          {(templates ?? []).map((t) => (
            <li key={t.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-stone-500">{t.workout_type}</p>
                {t.notes ? <p className="text-sm text-stone-400">{t.notes}</p> : null}
              </div>
              <form action={deleteTemplate}>
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="text-sm text-red-400">
                  Ta bort
                </button>
              </form>
            </li>
          ))}
          {(templates ?? []).length === 0 ? (
            <li className="px-4 py-6 text-stone-500">Inga mallar ännu.</li>
          ) : null}
        </ul>
      </main>
    </>
  );
}
