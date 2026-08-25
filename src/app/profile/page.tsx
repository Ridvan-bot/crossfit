import { AppNav } from "@/components/AppNav";
import { EquipmentPicker } from "@/components/EquipmentPicker";
import { ProfileSaveButton } from "@/components/ProfileSaveButton";
import { updateProfile } from "@/app/actions/crud";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function ProfilePage({ searchParams }: Props) {
  const { saved } = await searchParams;
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

        {saved === "1" ? (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-emerald-100"
          >
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-stone-950"
              aria-hidden
            >
              ✓
            </span>
            <div>
              <p className="font-semibold">Profilen är sparad</p>
              <p className="text-sm text-emerald-100/80">
                Visningsnamn och utrustning är uppdaterade.
              </p>
            </div>
          </div>
        ) : null}

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

          <ProfileSaveButton />
        </form>

        <p className="text-sm text-stone-500">Inloggad som {user.email}</p>
      </main>
    </>
  );
}
