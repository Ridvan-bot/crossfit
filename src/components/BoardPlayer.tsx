"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FitToBox } from "@/components/FitToBox";
import {
  LogSessionSheet,
  suggestedLiftsFromSections,
} from "@/components/LogSessionSheet";
import { WorkoutTimer } from "@/components/WorkoutTimer";
import type { WorkoutSection } from "@/lib/types";

const DEFAULT_BOARD_FRAC = 0.575;
const MIN_BOARD_FRAC = 0.32;
const MAX_BOARD_FRAC = 0.78;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Render tavlan utanför app-layout så global UI-CSS inte påverkar. */
function BoardPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const html = document.documentElement;
    const body = document.body;
    html.dataset.board = "true";
    const prevBackground = body.style.background;
    const prevBackgroundImage = body.style.backgroundImage;
    const prevColor = body.style.color;
    body.style.background = "#0c0c0c";
    body.style.backgroundImage = "none";
    body.style.color = "#f4f1ea";
    return () => {
      delete html.dataset.board;
      body.style.background = prevBackground;
      body.style.backgroundImage = prevBackgroundImage;
      body.style.color = prevColor;
    };
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}

/** Hide right/bottom timer panel */
function CollapseTimerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M15 4v16" />
      <path d="M11 9l3 3-3 3" />
    </svg>
  );
}

/** Show timer panel again */
function ExpandTimerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M15 4v16" />
      <path d="M14 9l-3 3 3 3" />
    </svg>
  );
}

export function BoardPlayer({
  workoutId,
  title,
  sections,
}: {
  workoutId: string;
  title: string;
  sections: WorkoutSection[];
}) {
  const initialIndex = (() => {
    const metcon = sections.findIndex((s) => s.kind === "metcon");
    return metcon >= 0 ? metcon : 0;
  })();
  const [index, setIndex] = useState(initialIndex);
  const [timerOpen, setTimerOpen] = useState(true);
  const [logOpen, setLogOpen] = useState(false);
  const [boardFrac, setBoardFrac] = useState(DEFAULT_BOARD_FRAC);
  const [dragging, setDragging] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const section = sections[index];
  const timerSec = useMemo(
    () => section?.timer_preset_sec ?? 600,
    [section?.timer_preset_sec]
  );
  const suggestedLifts = useMemo(
    () => suggestedLiftsFromSections(sections),
    [sections]
  );

  const updateFracFromPointer = useCallback((clientX: number, clientY: number) => {
    const el = layoutRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;
    const horizontal = rect.width >= rect.height;
    const raw = horizontal
      ? (clientX - rect.left) / rect.width
      : (clientY - rect.top) / rect.height;
    setBoardFrac(clamp(raw, MIN_BOARD_FRAC, MAX_BOARD_FRAC));
  }, []);

  const endDrag = useCallback(() => {
    draggingRef.current = false;
    setDragging(false);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      updateFracFromPointer(e.clientX, e.clientY);
    };
    const onUp = () => endDrag();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, endDrag, updateFracFromPointer]);

  useEffect(() => {
    if (!dragging) return;
    const prev = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    const el = layoutRef.current;
    const horizontal = el
      ? el.getBoundingClientRect().width >= el.getBoundingClientRect().height
      : true;
    document.body.style.cursor = horizontal ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = prev;
      document.body.style.userSelect = prevSelect;
    };
  }, [dragging]);

  const onDividerPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    draggingRef.current = true;
    setDragging(true);
    updateFracFromPointer(e.clientX, e.clientY);
  };

  if (!section) {
    return (
      <BoardPortal>
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-[#0c0c0c] p-6 text-[#f4f1ea]">
          <p className="font-[family-name:var(--font-amatic)] text-3xl tracking-wider text-white/70">
            Inga delar i passet ännu
          </p>
          <Link
            href={`/workouts/${workoutId}`}
            className="font-[family-name:var(--font-amatic)] text-xl tracking-widest text-white/55 hover:text-white"
          >
            ← TILL PASSET
          </Link>
        </div>
      </BoardPortal>
    );
  }

  const moveCount = section.section_movements.length;
  const maxPx = !timerOpen
    ? moveCount <= 1
      ? 140
      : moveCount <= 2
        ? 120
        : moveCount <= 3
          ? 100
          : 88
    : moveCount <= 1
      ? 120
      : moveCount <= 2
        ? 100
        : moveCount <= 3
          ? 84
          : 72;

  const boardFlex = timerOpen ? boardFrac : 1;
  const timerFlex = timerOpen ? 1 - boardFrac : 0;

  return (
    <BoardPortal>
    <div className="fixed inset-0 z-[9999] border-[10px] border-[#2a2a2a] bg-[#0c0c0c] text-[#f4f1ea] [font-family:var(--font-amatic),cursive]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        ref={layoutRef}
        className={`relative z-10 flex h-full min-h-0 ${
          timerOpen ? "flex-col landscape:flex-row" : "flex-col"
        }`}
      >
        <div
          className="flex min-h-0 min-w-0 flex-col p-3 landscape:p-4"
          style={{ flex: `${boardFlex} 1 0%` }}
        >
          <div className="mb-1 flex shrink-0 items-center justify-between gap-3">
            <Link
              href="/"
              className="font-[family-name:var(--font-amatic)] text-xl tracking-widest text-white/55 hover:text-white"
            >
              ← DASHBOARD
            </Link>
            <span className="font-[family-name:var(--font-amatic)] text-2xl tracking-wider">
              {title}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLogOpen(true)}
                className="font-[family-name:var(--font-amatic)] text-xl tracking-widest text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white"
              >
                PASS KLART
              </button>
              <Link
                href={`/workouts/${workoutId}/phone`}
                className="font-[family-name:var(--font-amatic)] text-xl tracking-widest text-white/55 hover:text-white"
              >
                TELEFON
              </Link>
            </div>
          </div>

          <nav className="mb-2 flex shrink-0 flex-wrap justify-center gap-4">
            {sections.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`font-[family-name:var(--font-amatic)] text-[clamp(1.75rem,3.5vh,2.75rem)] tracking-wider ${
                  i === index
                    ? "border border-white/40 border-b-white px-3 text-white"
                    : "px-3 text-white/45"
                }`}
              >
                {s.label.toUpperCase()}
              </button>
            ))}
          </nav>

          <FitToBox
            className="px-3"
            minPx={22}
            maxPx={maxPx}
            deps={[
              section.id,
              moveCount,
              section.format_label,
              section.coaching_tip,
              timerOpen,
            ]}
          >
            <div className="flex w-full flex-col items-center gap-[0.4em] text-center">
              <div>
                <h1 className="font-[family-name:var(--font-amatic)] text-[3.2em] font-bold leading-none tracking-[0.18em]">
                  WOD
                </h1>
                <div className="mx-auto mt-[0.1em] h-[0.07em] w-[30%] -rotate-[0.4deg] bg-white/85" />
              </div>

              <p className="max-w-full px-[0.2em] text-balance font-[family-name:var(--font-amatic)] text-[1.45em] font-bold leading-tight tracking-wide">
                <span className="border-b border-white/30 pb-[0.06em]">
                  {section.format_label ?? section.label.toUpperCase()}
                </span>
              </p>

              <div
                className="flex w-full flex-col items-center"
                style={{
                  gap:
                    moveCount <= 2
                      ? "0.65em"
                      : moveCount <= 3
                        ? "0.45em"
                        : "0.3em",
                }}
              >
                {section.section_movements.map((m) => (
                  <div key={m.id} className="w-full px-1">
                    <div className="font-[family-name:var(--font-amatic)] text-[2.4em] font-bold uppercase leading-[0.95] tracking-wider">
                      {m.name}
                    </div>
                    <div className="mt-[0.12em] font-[family-name:var(--font-caveat)] text-[1.35em] leading-tight">
                      {m.detail}
                      {m.suggested_weight_kg != null
                        ? ` (${m.suggested_weight_kg} kg)`
                        : ""}
                    </div>
                  </div>
                ))}
              </div>

              {section.coaching_tip ? (
                <p className="max-w-[32ch] font-[family-name:var(--font-caveat)] text-[1em] leading-snug text-white/65">
                  {section.coaching_tip}
                </p>
              ) : null}
            </div>
          </FitToBox>

          <div className="flex shrink-0 items-center justify-center gap-4 pt-1">
            <p className="font-[family-name:var(--font-amatic)] text-3xl font-bold tracking-[0.22em]">
              YOU VS YOU
            </p>
            <button
              type="button"
              onClick={() => setLogOpen(true)}
              className="rounded-full border border-white/35 px-4 py-1 font-[family-name:var(--font-amatic)] text-xl tracking-widest text-white/80 transition hover:border-white/60 hover:bg-white/10 hover:text-white"
            >
              ✓ KLART
            </button>
          </div>
        </div>

        {timerOpen ? (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={Math.round(boardFrac * 100)}
            aria-valuemin={Math.round(MIN_BOARD_FRAC * 100)}
            aria-valuemax={Math.round(MAX_BOARD_FRAC * 100)}
            aria-label="Justera storlek mellan tavla och timer"
            onPointerDown={onDividerPointerDown}
            className={`relative z-20 flex shrink-0 touch-none items-center justify-center ${
              dragging ? "bg-white/15" : "hover:bg-white/10"
            } h-4 w-full cursor-row-resize landscape:h-full landscape:w-3 landscape:cursor-col-resize`}
          >
            <div
              className="pointer-events-none absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-white/25 landscape:inset-x-auto landscape:inset-y-8 landscape:left-1/2 landscape:h-auto landscape:w-px landscape:translate-x-[-50%] landscape:translate-y-0"
              aria-hidden
            />
            <button
              type="button"
              title="Dölj timer"
              aria-label="Dölj timer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setTimerOpen(false)}
              className="relative z-10 flex size-9 items-center justify-center rounded-full border border-white/35 bg-[#161616] text-white/75 shadow-[0_0_0_4px_#0c0c0c] transition hover:border-white/60 hover:bg-[#1e1e1e] hover:text-white active:scale-95"
            >
              <CollapseTimerIcon className="size-5 landscape:block portrait:rotate-90" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            title="Visa timer"
            aria-label="Visa timer"
            onClick={() => setTimerOpen(true)}
            className="absolute bottom-3 right-3 z-30 flex size-10 items-center justify-center rounded-full border border-white/35 bg-[#161616] text-white/80 shadow-lg transition hover:border-white/60 hover:bg-[#1e1e1e] hover:text-white landscape:bottom-auto landscape:top-1/2 landscape:right-2 landscape:-translate-y-1/2"
          >
            <ExpandTimerIcon className="size-5" />
          </button>
        )}

        <div
          className={`min-h-0 min-w-0 flex-col p-3 landscape:p-4 ${
            timerOpen ? "flex" : "hidden"
          }`}
          style={{ flex: `${timerFlex} 1 0%` }}
          aria-hidden={!timerOpen}
        >
          <WorkoutTimer
            key={`${section.id}-${timerSec}`}
            initialSeconds={timerSec}
            variant="board"
          />
        </div>
      </div>

      <LogSessionSheet
        open={logOpen}
        onClose={() => setLogOpen(false)}
        workoutId={workoutId}
        workoutTitle={title}
        suggestedLifts={suggestedLifts}
        variant="board"
      />
    </div>
    </BoardPortal>
  );
}
