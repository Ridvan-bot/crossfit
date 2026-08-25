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
      <div className="ui-page mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-6">
        <Link href={`/workouts/${workoutId}`} className="ui-link text-sm">
          ← Tillbaka
        </Link>
        <div className="ui-card p-5">
          <p className="text-stone-400">
            Inga delar i passet ännu. Lägg till delar på pass-sidan först.
          </p>
        </div>
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
    <div className="ui-page mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-4 pb-8">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/workouts/${workoutId}`} className="text-sm text-stone-400 hover:text-stone-200">
          ← Tillbaka
        </Link>
        <Link href={`/workouts/${workoutId}/board`} className="ui-link text-sm font-medium">
          Tavla
        </Link>
      </div>

      <header className="ui-card overflow-hidden p-4">
        <p className="ui-eyebrow">Passvy · timer</p>
        <h1 className="ui-title mt-1 text-3xl leading-none">{title}</h1>
        {meta ? <p className="mt-2 text-sm text-stone-400">{meta}</p> : null}
      </header>

      <nav className="flex flex-wrap gap-2">
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            className={`min-w-[4.5rem] flex-1 rounded-xl border py-3 text-xs font-bold uppercase tracking-wide transition ${
              i === index
                ? "border-teal-400/60 bg-gradient-to-b from-teal-400 to-teal-600 text-stone-950 shadow-[0_8px_24px_-10px_rgba(26,149,135,0.8)]"
                : "border-white/10 bg-white/[0.03] text-stone-300 hover:border-teal-500/30"
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <section className="ui-card p-4">
        <h2 className="ui-title text-xl">
          Del {index + 1} · {section.label}
          {duration ? ` · ${duration}` : ""}
        </h2>
        {section.coaching_tip || section.format_label ? (
          <p className="mt-2 text-sm font-medium text-teal-300">
            {section.format_label}
            {section.coaching_tip ? ` · ${section.coaching_tip}` : ""}
          </p>
        ) : null}
        <ul className="mt-4 space-y-2">
          {section.section_movements.map((m, i) => (
            <li
              key={m.id}
              className="grid grid-cols-[auto_1fr] gap-3 rounded-xl border border-white/5 bg-black/30 px-3 py-3"
            >
              <span className="ui-title text-2xl text-teal-400">{i + 1}</span>
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
          className="ui-btn ui-btn-ghost py-3 disabled:opacity-40"
        >
          Föregående
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={() => setLogOpen(true)}
            className="ui-btn ui-btn-primary py-3"
          >
            Pass klart
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((v) => Math.min(sections.length - 1, v + 1))}
            className="ui-btn ui-btn-ghost py-3"
          >
            Nästa del
          </button>
        )}
      </div>

      <section className="ui-card sticky bottom-2 p-4 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.8)]">
        <WorkoutTimer
          key={`${section.id}-${timerSec}`}
          initialSeconds={timerSec}
          variant="phone"
        />
        <button
          type="button"
          onClick={() => setLogOpen(true)}
          className="ui-btn ui-btn-outline mt-3 w-full py-3"
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
