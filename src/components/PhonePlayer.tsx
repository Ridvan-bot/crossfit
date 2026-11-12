"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LogSessionSheet,
  suggestedLiftsFromSections,
} from "@/components/LogSessionSheet";
import { WorkoutTimer } from "@/components/WorkoutTimer";
import type { WorkoutSection } from "@/lib/types";

type Pane = "part" | "timer";

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
  const [pane, setPane] = useState<Pane>("part");
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
      <div className="ui-page ui-phone-screen mx-auto flex min-h-dvh max-w-lg flex-col gap-4">
        <Link href={`/workouts/${workoutId}`} className="ui-phone-hit ui-link self-start px-3">
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

  const isFirst = index === 0;
  const isLast = index === sections.length - 1;
  const showingTimer = pane === "timer";

  function goPrev() {
    setIndex((v) => Math.max(0, v - 1));
    setPane("part");
  }

  function goNext() {
    if (isLast) {
      setLogOpen(true);
      return;
    }
    setIndex((v) => Math.min(sections.length - 1, v + 1));
    setPane("part");
  }

  return (
    <div className="ui-page ui-phone-screen mx-auto flex h-dvh max-w-lg flex-col overflow-hidden overscroll-none">
      <header className="flex shrink-0 items-center gap-2 pb-3">
        <Link
          href={`/workouts/${workoutId}`}
          className="ui-phone-hit min-w-11 shrink-0 px-2 text-stone-400 hover:text-stone-200"
        >
          ←
          <span className="sr-only">Tillbaka till passet</span>
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="ui-eyebrow truncate">{title}</p>
          <p className="mt-0.5 text-sm text-stone-400">
            Del {index + 1} av {sections.length}
            {duration ? ` · ${duration}` : ""}
          </p>
        </div>
        <Link
          href={`/workouts/${workoutId}/board`}
          className="ui-phone-hit ui-link shrink-0 px-2 text-sm font-medium"
        >
          Tavla
        </Link>
      </header>

      <section
        className="ui-card flex min-h-0 flex-1 flex-col overflow-hidden p-4"
        aria-live="polite"
      >
        <div
          className={
            showingTimer ? "flex min-h-0 flex-1 flex-col" : "hidden"
          }
          aria-hidden={!showingTimer}
        >
          <WorkoutTimer
            key={`${section.id}-${timerSec}`}
            initialSeconds={timerSec}
            variant="phone"
            sectionLabel={section.label}
          />
        </div>
        <div
          className={
            showingTimer
              ? "hidden"
              : "min-h-0 flex-1 overflow-y-auto overscroll-contain"
          }
        >
          <h1 className="ui-title text-2xl">{section.label}</h1>
          {section.coaching_tip || section.format_label ? (
            <p className="mt-2 text-sm font-medium text-teal-300">
              {section.format_label}
              {section.coaching_tip ? ` · ${section.coaching_tip}` : ""}
            </p>
          ) : null}
          {meta ? (
            <p className="mt-1 text-xs text-stone-500">{meta}</p>
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
        </div>
      </section>

      <nav
        className="ui-bottom-chrome mt-3 grid shrink-0 grid-cols-2 gap-2"
        aria-label="Passkontroller"
      >
        <button
          type="button"
          disabled={isFirst}
          onClick={goPrev}
          className="ui-btn ui-btn-ghost ui-phone-hit disabled:opacity-40"
        >
          Föregående
        </button>
        <button
          type="button"
          onClick={goNext}
          className={`ui-btn ui-phone-hit ${
            isLast ? "ui-btn-primary" : "ui-btn-ghost"
          }`}
        >
          {isLast ? "Pass klart" : "Nästa del"}
        </button>
        <button
          type="button"
          aria-pressed={showingTimer}
          onClick={() => setPane(showingTimer ? "part" : "timer")}
          className={`ui-btn ui-phone-hit ${
            showingTimer ? "ui-btn-primary" : "ui-btn-outline"
          }`}
        >
          {showingTimer ? "Passet" : "Timer"}
        </button>
        <button
          type="button"
          onClick={() => setLogOpen(true)}
          className="ui-btn ui-btn-outline ui-phone-hit"
        >
          Logga
        </button>
      </nav>

      {logOpen ? (
        <LogSessionSheet
          open
          onClose={() => setLogOpen(false)}
          workoutId={workoutId}
          workoutTitle={title}
          suggestedLifts={suggestedLifts}
          variant="phone"
        />
      ) : null}
    </div>
  );
}
