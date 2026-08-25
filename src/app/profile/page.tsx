import { AppNav } from "@/components/AppNav";
import { EquipmentPicker } from "@/components/EquipmentPicker";
import { updateProfile } from "@/app/actions/crud";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, equipment")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <AppNav />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-extrabold uppercase">
            Profil
          </h1>
          <p className="text-stone-400">
            Din utrustning används som kontext för passen — när du bygger en WOD
            väljer du rörelser, inte grejer.
          </p>
        </div>

        <form
          action={updateProfile}
          className="grid gap-4 rounded-xl border border-stone-800 bg-stone-900/50 p-4 md:grid-cols-2"
        >
          <label className="grid gap-1.5 md:col-span-2">
            <span className="text-sm text-stone-400">Visningsnamn</span>
            <input
              name="display_name"
              defaultValue={profile?.display_name ?? ""}
              placeholder="Namn"
              className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
            />
          </label>

          <EquipmentPicker
            name="equipment"
            defaultValue={profile?.equipment}
            label="Min utrustning"
            hint="Det du har hemma / i gymmet. Syns som kontext i telefonvyn."
          />

          <button
            type="submit"
            className="md:col-span-2 rounded-lg bg-amber-500 py-2.5 font-semibold text-stone-950"
          >
            Spara profil
          </button>
        </form>

        <p className="text-sm text-stone-500">
          Inloggad som {user.email}
        </p>
      </main>
    </>
  );
}
