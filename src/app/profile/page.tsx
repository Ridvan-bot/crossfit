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
      <main className="ui-page mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header>
          <p className="ui-eyebrow">Konto</p>
          <h1 className="ui-title mt-1 text-4xl sm:text-5xl">Profil</h1>
          <p className="mt-2 max-w-2xl text-stone-400">
            Din utrustning används som kontext för passen — när du bygger en WOD
            väljer du rörelser, inte grejer.
          </p>
        </header>

        {saved === "1" ? (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-teal-500/40 bg-teal-500/15 px-4 py-3 text-teal-50 shadow-[0_0_40px_-12px_rgba(26,149,135,0.5)]"
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-400 text-lg font-bold text-stone-950"
              aria-hidden
            >
              ✓
            </span>
            <div>
              <p className="font-semibold">Profilen är sparad</p>
              <p className="text-sm text-teal-100/80">
                Visningsnamn och utrustning är uppdaterade.
              </p>
            </div>
          </div>
        ) : null}

        <form action={updateProfile} className="ui-card grid gap-4 p-5 md:grid-cols-2">
          <label className="grid gap-1.5 md:col-span-2">
            <span className="text-sm text-stone-400">Visningsnamn</span>
            <input
              name="display_name"
              defaultValue={profile?.display_name ?? ""}
              placeholder="Namn"
              className="ui-input"
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
