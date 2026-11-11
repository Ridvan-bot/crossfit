"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

const desktopLinks = [
  { href: "/", label: "Hem" },
  { href: "/workouts", label: "Pass" },
  { href: "/sessions", label: "Historik" },
  { href: "/library", label: "Bibliotek" },
  { href: "/goals", label: "Mål" },
  { href: "/profile", label: "Profil" },
];

const mobileTabs = [
  { href: "/", label: "Hem", icon: HomeIcon },
  { href: "/workouts", label: "Pass", icon: PassIcon },
  { href: "/sessions", label: "Historik", icon: HistoryIcon },
  { href: "/profile", label: "Profil", icon: ProfileIcon },
];

const prefetchHrefs = desktopLinks.map((l) => l.href);

function isPlayerRoute(pathname: string) {
  return pathname.includes("/phone") || pathname.includes("/board");
}

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function linkClass(active: boolean) {
  return `rounded-lg px-2.5 py-1.5 transition ${
    active
      ? "bg-teal-500/15 text-teal-300"
      : "text-stone-400 hover:bg-white/5 hover:text-stone-100"
  }`;
}

function isModifiedClick(e: MouseEvent) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}

function useOptimisticPathname() {
  const pathname = usePathname();
  const [pending, setPending] = useState<{ from: string; to: string } | null>(null);

  const displayPath = pending && pending.from === pathname ? pending.to : pathname;

  function onNavClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (isModifiedClick(e) || href === pathname) return;
    setPending({ from: pathname, to: href });
  }

  return { displayPath, onNavClick };
}

function usePrefetchAppRoutes() {
  const router = useRouter();
  useEffect(() => {
    for (const href of prefetchHrefs) {
      router.prefetch(href);
    }
  }, [router]);
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  usePrefetchAppRoutes();
  if (isPlayerRoute(pathname)) return null;
  return children;
}

export function AppNavLinks({ signOutAction }: { signOutAction: () => Promise<void> }) {
  const { displayPath, onNavClick } = useOptimisticPathname();

  return (
    <nav className="hidden items-center gap-1.5 text-sm md:flex" aria-label="Huvudmeny">
      {desktopLinks.map((l) => {
        const active = isActive(displayPath, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            prefetch
            onClick={(e) => onNavClick(e, l.href)}
            className={linkClass(active)}
            aria-current={active ? "page" : undefined}
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

export function AppBottomNav() {
  const { displayPath, onNavClick } = useOptimisticPathname();

  return (
    <nav className="ui-bottom-nav md:hidden" aria-label="Huvudmeny">
      {mobileTabs.map((tab) => {
        const active = isActive(displayPath, tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch
            onClick={(e) => onNavClick(e, tab.href)}
            className={active ? "is-active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <Icon />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function iconProps(children: ReactNode) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-[1.35rem]"
    >
      {children}
    </svg>
  );
}

function HomeIcon() {
  return iconProps(
    <>
      <path d="M4 11.25 12 4.25l8 7" />
      <path d="M6.5 10.5V20h11V10.5" />
      <path d="M10 20v-5.25h4V20" />
    </>
  );
}

function PassIcon() {
  return iconProps(
    <>
      <path d="M3.5 12h17" />
      <path d="M6 8.5v7" />
      <path d="M18 8.5v7" />
      <path d="M8.5 10v4" />
      <path d="M15.5 10v4" />
    </>
  );
}

function HistoryIcon() {
  return iconProps(
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8.25V12l2.75 1.75" />
    </>
  );
}

function ProfileIcon() {
  return iconProps(
    <>
      <circle cx="12" cy="8.5" r="3" />
      <path d="M5.5 19.25c1.4-3.2 3.7-4.75 6.5-4.75s5.1 1.55 6.5 4.75" />
    </>
  );
}
