"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WorkoutTimer } from "@/components/WorkoutTimer";
import type { WorkoutSection } from "@/lib/types";

export function BoardPlayer({
  workoutId,
  title,
  sections,
}: {
  workoutId: string;
  title: string;
  sections: WorkoutSection[];
}) {
  const metconIndex = Math.max(
    0,
    sections.findIndex((s) => s.kind === "metcon")
  );
  const [index, setIndex] = useState(metconIndex === -1 ? 0 : metconIndex);
  const section = sections[index];
  const timerSec = useMemo(
    () => section?.timer_preset_sec ?? 600,
    [section?.timer_preset_sec]
  );

  if (!section) return null;

  return (
    <div className="fixed inset-0 border-[10px] border-[#2a2a2a] bg-[#0c0c0c] text-[#f4f1ea]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative z-10 grid h-full grid-cols-1 gap-0 landscape:grid-cols-[1.15fr_0.85fr]">
        <div className="flex h-full min-h-0 flex-col border-b border-white/20 p-4 landscape:border-b-0 landscape:border-r landscape:pr-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Link
              href={`/workouts/${workoutId}`}
              className="font-[family-name:var(--font-amatic)] text-lg tracking-widest text-white/50"
            >
              ← VÄLJ GUI
            </Link>
            <span className="font-[family-name:var(--font-amatic)] text-xl tracking-wider">
              {title}
            </span>
          </div>

          <div className="text-center">
            <h1 className="font-[family-name:var(--font-amatic)] text-[clamp(2.8rem,9vh,5.5rem)] font-bold tracking-[0.2em]">
              WOD
            </h1>
            <div className="mx-auto mt-1 h-[3px] w-[28%] -rotate-[0.4deg] bg-white/85" />
          </div>

          <p className="mt-3 text-center font-[family-name:var(--font-amatic)] text-[clamp(1.4rem,4vh,2.4rem)] font-bold tracking-widest">
            <span className="border-b border-white/30 pb-1">
              {section.format_label ?? section.label.toUpperCase()}
            </span>
          </p>

          <nav className="mt-3 flex flex-wrap justify-center gap-2">
            {sections.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`font-[family-name:var(--font-amatic)] text-lg tracking-wider ${
                  i === index ? "border border-white/40 border-b-white px-2 text-white" : "px-2 text-white/45"
                }`}
              >
                {s.label.toUpperCase()}
              </button>
            ))}
          </nav>

          <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-2">
            {section.section_movements.map((m) => (
              <div key={m.id} className="w-full text-center">
                <div className="font-[family-name:var(--font-amatic)] text-[clamp(1.6rem,5vh,3.2rem)] font-bold uppercase tracking-wider leading-none">
                  {m.name}
                </div>
                <div className="font-[family-name:var(--font-caveat)] text-[clamp(1.2rem,3vh,2rem)]">
                  {m.detail}
                  {m.suggested_weight_kg != null ? ` (${m.suggested_weight_kg} kg)` : ""}
                </div>
              </div>
            ))}
          </div>

          {section.coaching_tip ? (
            <p className="text-center font-[family-name:var(--font-caveat)] text-lg text-white/55">
              {section.coaching_tip}
            </p>
          ) : null}

          <p className="mt-auto pt-2 text-center font-[family-name:var(--font-amatic)] text-2xl font-bold tracking-[0.22em]">
            YOU VS YOU
          </p>
        </div>

        <div className="flex h-full flex-col items-center justify-between gap-3 p-4 landscape:pl-6">
          <WorkoutTimer key={`${section.id}-${timerSec}`} initialSeconds={timerSec} variant="board" />
          <Link
            href={`/workouts/${workoutId}/phone`}
            className="font-[family-name:var(--font-amatic)] text-lg tracking-widest text-white/45"
          >
            TELEFON-VY
          </Link>
        </div>
      </div>
    </div>
  );
}
