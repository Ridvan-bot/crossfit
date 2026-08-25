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
      <main className="ui-page mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header>
          <p className="ui-eyebrow">Mallar</p>
          <h1 className="ui-title mt-1 text-4xl sm:text-5xl">WOD-bibliotek</h1>
        </header>

        <form action={createTemplate} className="ui-card grid gap-3 p-5 md:grid-cols-2">
          <input name="name" required placeholder="Namn" className="ui-input" />
          <input
            name="workout_type"
            placeholder="Typ (AMRAP / For Time)"
            defaultValue="mixed"
            className="ui-input"
          />
          <textarea
            name="notes"
            placeholder="Anteckningar"
            rows={2}
            className="ui-input md:col-span-2"
          />
          <button type="submit" className="ui-btn ui-btn-primary md:col-span-2 py-3">
            Lägg till mall
          </button>
        </form>

        <ul className="ui-card divide-y divide-white/5 overflow-hidden">
          {(templates ?? []).map((t) => (
            <li
              key={t.id}
              className="flex items-start justify-between gap-3 px-4 py-4 hover:bg-teal-500/[0.04]"
            >
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-teal-300/80">{t.workout_type}</p>
                {t.notes ? <p className="text-sm text-stone-400">{t.notes}</p> : null}
              </div>
              <form action={deleteTemplate}>
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="text-sm text-red-400 hover:underline">
                  Ta bort
                </button>
              </form>
            </li>
          ))}
          {(templates ?? []).length === 0 ? (
            <li className="px-4 py-8 text-center text-stone-500">Inga mallar ännu.</li>
          ) : null}
        </ul>
      </main>
    </>
  );
}
