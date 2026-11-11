import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppBottomNav, AppChrome, AppNavLinks } from "@/components/AppNavLinks";

export async function AppNav() {
  async function signOut() {
    "use server";
    const sb = await createClient();
    await sb.auth.signOut();
    redirect("/login");
  }

  return (
    <AppChrome>
      <header className="ui-safe-t ui-safe-x sticky top-0 z-40 border-b border-white/5 bg-[#07090a]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="group flex min-h-11 items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-700 text-xs font-extrabold text-stone-950 shadow-[0_0_20px_-4px_rgba(26,149,135,0.8)]">
              CF
            </span>
            <span className="font-[family-name:var(--font-barlow)] text-lg font-extrabold uppercase tracking-[0.14em] text-stone-100 transition group-hover:text-teal-300">
              CrossFit
            </span>
          </Link>
          <AppNavLinks signOutAction={signOut} />
          <form action={signOut} className="md:hidden">
            <button
              type="submit"
              className="min-h-11 rounded-lg px-3 py-2 text-sm text-stone-500 transition hover:bg-white/5 hover:text-stone-300"
            >
              Logga ut
            </button>
          </form>
        </div>
      </header>
      <AppBottomNav />
    </AppChrome>
  );
}
