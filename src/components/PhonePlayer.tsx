"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LogSessionSheet,
  suggestedLiftsFromSections,
} from "@/components/LogSessionSheet";
import { WorkoutTimer } from "@/components/WorkoutTimer";
import type { WorkoutSection } from "@/lib/types";

export function PhonePlayer({
  workoutId,
  title,
  meta,
  sections,
}: {
  workoutId: string;
  title: string;
  meta: string;
  sections: WorkoutSection[];
}) {
  const [index, setIndex] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const section = sections[index];
  const timerSec = useMemo(
    () => section?.timer_preset_sec ?? 600,
    [section?.timer_preset_sec]
  );
  const suggestedLifts = useMemo(
    () => suggestedLiftsFromSections(sections),
    [sections]
  );

  if (!section) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 bg-stone-950 px-4 py-4">
        <Link href={`/workouts/${workoutId}`} className="text-sm text-stone-400">
          ← Tillbaka
        </Link>
        <p className="text-stone-400">
          Inga delar i passet ännu. Lägg till delar på pass-sidan först.
        </p>
      </div>
    );
  }

  const duration =
    section.estimated_minutes_min != null
      ? `tar ca ${section.estimated_minutes_min}${
          section.estimated_minutes_max &&
          section.estimated_minutes_max !== section.estimated_minutes_min
            ? `–${section.estimated_minutes_max}`
            : ""
        } min`
      : null;

  const isLast = index === sections.length - 1;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 bg-stone-950 px-4 py-4 pb-6">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/workouts/${workoutId}`} className="text-sm text-stone-400">
          ← Tillbaka
        </Link>
        <Link href={`/workouts/${workoutId}/board`} className="text-sm text-amber-400">
          Tavla
        </Link>
      </div>

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">
          Passvy · timer
        </p>
        <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-extrabold uppercase leading-none">
          {title}
        </h1>
        <p className="mt-1 text-sm text-stone-400">{meta}</p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            className={`min-w-[4.5rem] flex-1 rounded-lg border py-3 text-xs font-bold uppercase tracking-wide ${
              i === index
                ? "border-amber-500 bg-amber-500 text-stone-950"
                : "border-stone-700 bg-stone-900"
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <section className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
        <h2 className="font-[family-name:var(--font-barlow)] text-xl font-extrabold uppercase">
          Del {index + 1} · {section.label}
          {duration ? ` · ${duration}` : ""}
        </h2>
        {section.coaching_tip || section.format_label ? (
          <p className="mt-2 text-sm font-medium text-amber-300">
            {section.format_label}
            {section.coaching_tip ? ` · ${section.coaching_tip}` : ""}
          </p>
        ) : null}
        <ul className="mt-4 space-y-2">
          {section.section_movements.map((m, i) => (
            <li
              key={m.id}
              className="grid grid-cols-[auto_1fr] gap-3 rounded-xl border border-stone-800 bg-stone-950/80 px-3 py-3"
            >
              <span className="font-[family-name:var(--font-barlow)] text-2xl font-extrabold text-amber-500">
                {i + 1}
              </span>
              <span>
                <span className="block text-lg font-semibold">{m.name}</span>
                <span className="text-sm text-stone-400">
                  {m.detail}
                  {m.suggested_weight_kg != null
                    ? ` · (${m.suggested_weight_kg} kg)`
                    : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((v) => Math.max(0, v - 1))}
          className="rounded-xl border border-stone-700 py-3 font-semibold disabled:opacity-40"
        >
          Föregående
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={() => setLogOpen(true)}
            className="rounded-xl bg-amber-500 py-3 font-semibold text-stone-950"
          >
            Pass klart
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((v) => Math.min(sections.length - 1, v + 1))}
            className="rounded-xl border border-stone-700 py-3 font-semibold"
          >
            Nästa del
          </button>
        )}
      </div>

      <section className="sticky bottom-2 rounded-xl border border-stone-800 bg-stone-900 p-4 shadow-2xl shadow-black/50">
        <WorkoutTimer
          key={`${section.id}-${timerSec}`}
          initialSeconds={timerSec}
          variant="phone"
        />
        <button
          type="button"
          onClick={() => setLogOpen(true)}
          className="mt-3 w-full rounded-xl border border-amber-500/50 bg-amber-500/10 py-3 text-sm font-semibold text-amber-300 hover:bg-amber-500/20"
        >
          Markera klart & logga
        </button>
      </section>

      <LogSessionSheet
        open={logOpen}
        onClose={() => setLogOpen(false)}
        workoutId={workoutId}
        workoutTitle={title}
        suggestedLifts={suggestedLifts}
        variant="phone"
      />
    </div>
  );
}
