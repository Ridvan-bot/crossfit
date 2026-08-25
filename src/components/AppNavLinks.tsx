"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Hem" },
  { href: "/workouts", label: "Pass" },
  { href: "/sessions", label: "Historik" },
  { href: "/library", label: "Bibliotek" },
  { href: "/goals", label: "Mål" },
  { href: "/profile", label: "Profil" },
];

export function AppNavLinks({ signOutAction }: { signOutAction: () => Promise<void> }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm sm:gap-1.5">
      {links.map((l) => {
        const active =
          l.href === "/"
            ? pathname === "/"
            : pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-2.5 py-1.5 transition ${
              active
                ? "bg-teal-500/15 text-teal-300"
                : "text-stone-400 hover:bg-white/5 hover:text-stone-100"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
      <form action={signOutAction} className="ml-1">
        <button
          type="submit"
          className="rounded-lg px-2.5 py-1.5 text-stone-500 transition hover:bg-white/5 hover:text-stone-300"
        >
          Logga ut
        </button>
      </form>
    </nav>
  );
}
