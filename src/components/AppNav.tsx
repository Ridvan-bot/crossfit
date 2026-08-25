import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppNavLinks } from "@/components/AppNavLinks";

export async function AppNav() {
  const supabase = await createClient();

  async function signOut() {
    "use server";
    const sb = await createClient();
    await sb.auth.signOut();
    redirect("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07090a]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-700 text-xs font-extrabold text-stone-950 shadow-[0_0_20px_-4px_rgba(26,149,135,0.8)]">
            CF
          </span>
          <span className="font-[family-name:var(--font-barlow)] text-lg font-extrabold uppercase tracking-[0.14em] text-stone-100 transition group-hover:text-teal-300">
            CrossFit
          </span>
        </Link>
        <AppNavLinks signOutAction={signOut} />
      </div>
    </header>
  );
}
