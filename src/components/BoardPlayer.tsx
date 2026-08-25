"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { saveBoardEdit } from "@/app/actions/crud";
import { FitToBox } from "@/components/FitToBox";
import {
  LogSessionSheet,
  suggestedLiftsFromSections,
} from "@/components/LogSessionSheet";
import { WorkoutTimer } from "@/components/WorkoutTimer";
import type { SectionMovement, WorkoutSection } from "@/lib/types";

const DEFAULT_BOARD_FRAC = 0.575;
const MIN_BOARD_FRAC = 0.32;
const MAX_BOARD_FRAC = 0.78;

const chalkInput =
  "w-full max-w-full border-0 border-b border-white/35 bg-transparent text-center text-inherit outline-none placeholder:text-white/30 focus:border-white";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function tempId() {
  return `temp-${crypto.randomUUID()}`;
}

function cloneSections(sections: WorkoutSection[]): WorkoutSection[] {
  return sections.map((s) => ({
    ...s,
    section_movements: s.section_movements.map((m) => ({ ...m })),
  }));
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

function EditIcon({ className = "" }: { className?: string }) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function BoardPlayer({
  workoutId,
  title,
  sections: initialSections,
}: {
  workoutId: string;
  title: string;
  sections: WorkoutSection[];
}) {
  const initialIndex = (() => {
    const metcon = initialSections.findIndex((s) => s.kind === "metcon");
    return metcon >= 0 ? metcon : 0;
  })();
  const router = useRouter();
  const [sections, setSections] = useState(() => cloneSections(initialSections));
  const [index, setIndex] = useState(initialIndex);
  const [editing, setEditing] = useState(false);
  const [deletedSectionIds, setDeletedSectionIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [timerOpen, setTimerOpen] = useState(true);
  const [logOpen, setLogOpen] = useState(false);
  const [boardFrac, setBoardFrac] = useState(DEFAULT_BOARD_FRAC);
  const [dragging, setDragging] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const snapshotRef = useRef<WorkoutSection[] | null>(null);

  useEffect(() => {
    if (!editing) {
      setSections(cloneSections(initialSections));
      setDeletedSectionIds([]);
    }
  }, [initialSections, editing]);

  const section = sections[index];
  const timerSec = useMemo(
    () => section?.timer_preset_sec ?? 600,
    [section?.timer_preset_sec]
  );
  const suggestedLifts = useMemo(
    () => suggestedLiftsFromSections(sections),
    [sections]
  );

  const updateSectionField = useCallback(
    (field: "label" | "format_label" | "coaching_tip", value: string) => {
      setSections((prev) =>
        prev.map((s, i) =>
          i === index
            ? {
                ...s,
                [field]: value,
              }
            : s
        )
      );
    },
    [index]
  );

  const updateMovement = useCallback(
    (
      movementId: string,
      field: keyof Pick<
        SectionMovement,
        "name" | "detail" | "suggested_weight_kg"
      >,
      value: string
    ) => {
      setSections((prev) =>
        prev.map((s, i) => {
          if (i !== index) return s;
          return {
            ...s,
            section_movements: s.section_movements.map((m) => {
              if (m.id !== movementId) return m;
              if (field === "suggested_weight_kg") {
                const n = value.trim() === "" ? null : Number(value);
                return {
                  ...m,
                  suggested_weight_kg:
                    n == null || Number.isNaN(n) ? null : n,
                };
              }
              return { ...m, [field]: value };
            }),
          };
        })
      );
    },
    [index]
  );

  const addMovementRow = useCallback(() => {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        return {
          ...s,
          section_movements: [
            ...s.section_movements,
            {
              id: tempId(),
              name: "",
              detail: null,
              suggested_weight_kg: null,
              sort_order: s.section_movements.length,
            },
          ],
        };
      })
    );
  }, [index]);

  const removeMovementRow = useCallback(
    (movementId: string) => {
      setSections((prev) =>
        prev.map((s, i) => {
          if (i !== index) return s;
          return {
            ...s,
            section_movements: s.section_movements
              .filter((m) => m.id !== movementId)
              .map((m, order) => ({ ...m, sort_order: order })),
          };
        })
      );
    },
    [index]
  );

  const addSectionLocal = useCallback(() => {
    setSections((prev) => {
      const next: WorkoutSection = {
        id: tempId(),
        kind: "other",
        sort_order: prev.length,
        label: "Ny del",
        format_label: null,
        estimated_minutes_min: null,
        estimated_minutes_max: null,
        coaching_tip: null,
        timer_preset_sec: null,
        section_movements: [
          {
            id: tempId(),
            name: "",
            detail: null,
            suggested_weight_kg: null,
            sort_order: 0,
          },
        ],
      };
      setIndex(prev.length);
      return [...prev, next];
    });
  }, []);

  const removeSectionLocal = useCallback(() => {
    if (sections.length <= 1) {
      setSaveError("Passet måste ha minst en del.");
      return;
    }
    const current = sections[index];
    if (!current) return;
    if (!current.id.startsWith("temp-")) {
      setDeletedSectionIds((ids) =>
        ids.includes(current.id) ? ids : [...ids, current.id]
      );
    }
    const next = sections
      .filter((_, i) => i !== index)
      .map((s, order) => ({ ...s, sort_order: order }));
    setSections(next);
    setIndex(Math.max(0, Math.min(index, next.length - 1)));
    setSaveError(null);
  }, [index, sections]);

  const startEdit = () => {
    snapshotRef.current = cloneSections(sections);
    setDeletedSectionIds([]);
    setSaveError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    if (snapshotRef.current) setSections(snapshotRef.current);
    snapshotRef.current = null;
    setDeletedSectionIds([]);
    setSaveError(null);
    setEditing(false);
  };

  const saveEdit = () => {
    if (sections.length === 0) {
      setSaveError("Passet måste ha minst en del.");
      return;
    }
    setSaveError(null);
    startTransition(async () => {
      const result = await saveBoardEdit({
        workoutId,
        deletedSectionIds,
        sections: sections.map((s, order) => ({
          id: s.id,
          label: s.label,
          format_label: s.format_label,
          coaching_tip: s.coaching_tip,
          kind: s.kind,
          sort_order: order,
          movements: s.section_movements.map((m, mOrder) => ({
            id: m.id,
            name: m.name,
            detail: m.detail,
            suggested_weight_kg: m.suggested_weight_kg,
            sort_order: mOrder,
          })),
        })),
      });
      if (!result.ok) {
        setSaveError(result.message);
        return;
      }
      snapshotRef.current = null;
      setDeletedSectionIds([]);
      setEditing(false);
      router.refresh();
    });
  };

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
    if (e.button !== 0 || editing) return;
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
              <div className="flex items-center gap-2 sm:gap-3">
                {!editing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setLogOpen(true)}
                      className="hidden font-[family-name:var(--font-amatic)] text-xl tracking-widest text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white sm:inline"
                    >
                      PASS KLART
                    </button>
                    <Link
                      href={`/workouts/${workoutId}/phone`}
                      className="font-[family-name:var(--font-amatic)] text-xl tracking-widest text-white/55 hover:text-white"
                    >
                      TELEFON
                    </Link>
                    <button
                      type="button"
                      onClick={startEdit}
                      title="Redigera WOD"
                      aria-label="Redigera WOD"
                      className="flex size-9 items-center justify-center rounded-full border border-white/40 bg-white/5 text-white/85 transition hover:border-white hover:bg-white/10 hover:text-white"
                    >
                      <EditIcon className="size-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={pending}
                      className="font-[family-name:var(--font-amatic)] text-xl tracking-widest text-white/55 hover:text-white disabled:opacity-50"
                    >
                      AVBRYT
                    </button>
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={pending}
                      className="rounded-full border border-white/50 bg-white/10 px-3 py-1 font-[family-name:var(--font-amatic)] text-xl tracking-widest text-white hover:bg-white/20 disabled:opacity-50"
                    >
                      {pending ? "SPARAR…" : "SPARA"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {editing ? (
              <p className="mb-1 text-center font-[family-name:var(--font-caveat)] text-lg text-white/50">
                Redigeringsläge — ändra, lägg till eller ta bort, sedan SPARA
              </p>
            ) : null}
            {saveError ? (
              <p className="mb-1 text-center text-sm text-red-300" role="alert">
                {saveError}
              </p>
            ) : null}

            <nav className="mb-2 flex shrink-0 flex-wrap items-center justify-center gap-3">
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`font-[family-name:var(--font-amatic)] text-[clamp(1.75rem,3.5vh,2.75rem)] tracking-wider ${
                    i === index
                      ? "border border-white/40 border-b-white px-3 text-white"
                      : "px-3 text-white/45 hover:text-white/70"
                  }`}
                >
                  {editing && i === index ? (
                    <input
                      value={s.label}
                      onChange={(e) => updateSectionField("label", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`${chalkInput} max-w-[10ch] uppercase`}
                      aria-label="Delnamn"
                    />
                  ) : (
                    s.label.toUpperCase()
                  )}
                </button>
              ))}
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={addSectionLocal}
                    title="Lägg till del"
                    aria-label="Lägg till del"
                    className="flex size-8 items-center justify-center rounded-full border border-dashed border-white/45 text-xl leading-none text-white/70 hover:border-white hover:text-white"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={removeSectionLocal}
                    title="Ta bort aktuell del"
                    aria-label="Ta bort aktuell del"
                    disabled={sections.length <= 1}
                    className="flex size-8 items-center justify-center rounded-full border border-dashed border-white/35 text-lg leading-none text-white/55 hover:border-red-300 hover:text-red-200 disabled:opacity-30"
                  >
                    −
                  </button>
                </>
              ) : null}
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
                section.label,
                timerOpen,
                editing,
                ...section.section_movements.map(
                  (m) =>
                    `${m.name}|${m.detail}|${m.suggested_weight_kg ?? ""}`
                ),
              ]}
            >
              <div className="flex w-full flex-col items-center gap-[0.4em] text-center">
                {editing ? (
                  <input
                    value={section.format_label ?? ""}
                    onChange={(e) =>
                      updateSectionField("format_label", e.target.value)
                    }
                    placeholder="Format (t.ex. AMRAP 10 MIN)"
                    className={`${chalkInput} max-w-[28ch] font-[family-name:var(--font-amatic)] text-[1.45em] font-bold tracking-wide`}
                  />
                ) : (
                  <p className="max-w-full px-[0.2em] text-balance font-[family-name:var(--font-amatic)] text-[1.45em] font-bold leading-tight tracking-wide">
                    <span className="border-b border-white/30 pb-[0.06em]">
                      {section.format_label ?? section.label.toUpperCase()}
                    </span>
                  </p>
                )}

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
                    <div key={m.id} className="relative w-full px-1">
                      {editing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => removeMovementRow(m.id)}
                            title="Ta bort rörelse"
                            aria-label={`Ta bort ${m.name || "rörelse"}`}
                            className="absolute -right-1 -top-1 z-10 flex size-7 items-center justify-center rounded-full border border-white/35 bg-[#161616] text-sm text-white/70 hover:border-red-300 hover:text-red-200"
                          >
                            ×
                          </button>
                          <input
                            value={m.name}
                            onChange={(e) =>
                              updateMovement(m.id, "name", e.target.value)
                            }
                            placeholder="Rörelse"
                            className={`${chalkInput} font-[family-name:var(--font-amatic)] text-[2.4em] font-bold uppercase leading-[0.95] tracking-wider`}
                          />
                          <div className="mt-[0.12em] flex flex-wrap items-baseline justify-center gap-[0.35em]">
                            <input
                              value={m.detail ?? ""}
                              onChange={(e) =>
                                updateMovement(m.id, "detail", e.target.value)
                              }
                              placeholder="Reps / set"
                              className={`${chalkInput} max-w-[18ch] font-[family-name:var(--font-caveat)] text-[1.35em]`}
                            />
                            <span className="font-[family-name:var(--font-caveat)] text-[1.2em] text-white/50">
                              (
                            </span>
                            <input
                              type="number"
                              step="0.5"
                              value={
                                m.suggested_weight_kg != null
                                  ? String(m.suggested_weight_kg)
                                  : ""
                              }
                              onChange={(e) =>
                                updateMovement(
                                  m.id,
                                  "suggested_weight_kg",
                                  e.target.value
                                )
                              }
                              placeholder="kg"
                              className={`${chalkInput} w-[3.5em] font-[family-name:var(--font-caveat)] text-[1.35em]`}
                            />
                            <span className="font-[family-name:var(--font-caveat)] text-[1.2em] text-white/50">
                              kg)
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-[family-name:var(--font-amatic)] text-[2.4em] font-bold uppercase leading-[0.95] tracking-wider">
                            {m.name}
                          </div>
                          <div className="mt-[0.12em] font-[family-name:var(--font-caveat)] text-[1.35em] leading-tight">
                            {m.detail}
                            {m.suggested_weight_kg != null
                              ? ` (${m.suggested_weight_kg} kg)`
                              : ""}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {editing ? (
                    <button
                      type="button"
                      onClick={addMovementRow}
                      className="mt-[0.2em] rounded-full border border-dashed border-white/40 px-[0.8em] py-[0.15em] font-[family-name:var(--font-amatic)] text-[1.2em] tracking-widest text-white/65 hover:border-white hover:text-white"
                    >
                      + RÖRELSE
                    </button>
                  ) : null}
                </div>

                {editing ? (
                  <textarea
                    value={section.coaching_tip ?? ""}
                    onChange={(e) =>
                      updateSectionField("coaching_tip", e.target.value)
                    }
                    placeholder="Coaching-tip (valfritt)"
                    rows={2}
                    className={`${chalkInput} max-w-[32ch] resize-none border font-[family-name:var(--font-caveat)] text-[1em] leading-snug text-white/80`}
                  />
                ) : section.coaching_tip ? (
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
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setLogOpen(true)}
                  className="rounded-full border border-white/35 px-4 py-1 font-[family-name:var(--font-amatic)] text-xl tracking-widest text-white/80 transition hover:border-white/60 hover:bg-white/10 hover:text-white"
                >
                  ✓ KLART
                </button>
              ) : null}
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
              } h-4 w-full cursor-row-resize landscape:h-full landscape:w-3 landscape:cursor-col-resize ${
                editing ? "pointer-events-none opacity-40" : ""
              }`}
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
