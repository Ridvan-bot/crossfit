import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const links = [
  { href: "/", label: "Hem" },
  { href: "/workouts", label: "Pass" },
  { href: "/sessions", label: "Historik" },
  { href: "/library", label: "Bibliotek" },
  { href: "/goals", label: "Mål" },
  { href: "/profile", label: "Profil" },
];

export async function AppNav() {
  const supabase = await createClient();

  async function signOut() {
    "use server";
    const sb = await createClient();
    await sb.auth.signOut();
    redirect("/login");
  }

  return (
    <header className="border-b border-stone-800 bg-stone-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-semibold tracking-wide text-amber-400">
          CROSSFIT
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-stone-300">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
          <form action={signOut}>
            <button type="submit" className="text-stone-500 hover:text-stone-300">
              Logga ut
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
