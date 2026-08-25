"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { logSession } from "@/app/actions/crud";
import { HelpTip, FEELING_HELP_TEXT, RPE_HELP_TEXT } from "@/components/HelpTip";
import { todayDateInputValue } from "@/lib/dates";
import type { WorkoutSection } from "@/lib/types";

export type SuggestedLift = {
  name: string;
  weight_kg: number | null;
};

export function suggestedLiftsFromSections(
  sections: WorkoutSection[]
): SuggestedLift[] {
  const lifts: SuggestedLift[] = [];
  for (const s of sections) {
    if (s.kind !== "strength" && s.kind !== "technique") continue;
    for (const m of s.section_movements) {
      lifts.push({
        name: m.name,
        weight_kg: m.suggested_weight_kg,
      });
      if (lifts.length >= 5) return lifts;
    }
  }
  if (lifts.length === 0) {
    for (const s of sections) {
      for (const m of s.section_movements) {
        if (m.suggested_weight_kg == null) continue;
        lifts.push({ name: m.name, weight_kg: m.suggested_weight_kg });
        if (lifts.length >= 5) return lifts;
      }
    }
  }
  return lifts;
}

type Props = {
  open: boolean;
  onClose: () => void;
  workoutId: string;
  workoutTitle: string;
  suggestedLifts?: SuggestedLift[];
  variant?: "phone" | "board";
};

export function LogSessionSheet({
  open,
  onClose,
  workoutId,
  workoutTitle,
  suggestedLifts = [],
  variant = "phone",
}: Props) {
  const titleId = useId();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSaved(false);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, pending]);

  if (!open) return null;

  const rows = Array.from({ length: 5 }, (_, i) => suggestedLifts[i] ?? null);
  const isBoard = variant === "board";

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await logSession(fd);
      if (result.ok === false) {
        setError(result.message);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="Stäng"
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (!pending) onClose();
        }}
      />

      <div
        className={`relative z-10 flex h-[min(96dvh,100%)] max-h-[96dvh] w-full flex-col overflow-hidden shadow-2xl sm:mx-4 sm:h-auto sm:max-h-[min(94dvh,920px)] sm:w-[min(100%-2rem,48rem)] sm:max-w-3xl sm:rounded-2xl ${
          isBoard
            ? "border border-white/25 bg-[#121212] text-[#f4f1ea]"
            : "rounded-t-2xl border border-stone-700 bg-stone-900 text-stone-100 sm:rounded-2xl"
        }`}
      >
        <div
          className={`flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4 sm:px-6 ${
            isBoard ? "border-white/15" : "border-stone-800"
          }`}
        >
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                isBoard ? "text-white/45" : "text-amber-500"
              }`}
            >
              Pass klart
            </p>
            <h2
              id={titleId}
              className={
                isBoard
                  ? "font-[family-name:var(--font-amatic)] text-3xl tracking-wider"
                  : "font-[family-name:var(--font-barlow)] text-xl font-extrabold uppercase"
              }
            >
              {saved ? "Sparat!" : "Logga resultat"}
            </h2>
            <p
              className={`text-sm ${isBoard ? "text-white/50" : "text-stone-400"}`}
            >
              {workoutTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!pending) onClose();
            }}
            className={`rounded-lg px-2 py-1 text-sm ${
              isBoard
                ? "text-white/55 hover:text-white"
                : "text-stone-400 hover:text-stone-100"
            }`}
          >
            Stäng
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {saved ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div
                className={`flex size-14 items-center justify-center rounded-full border text-2xl ${
                  isBoard
                    ? "border-white/30 text-white"
                    : "border-amber-500/50 text-amber-400"
                }`}
                aria-hidden
              >
                ✓
              </div>
              <p className={isBoard ? "text-white/70" : "text-stone-300"}>
                Passet är markerat som klart och sparat i historiken.
              </p>
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 rounded-xl py-3 font-semibold ${
                    isBoard
                      ? "border border-white/30 hover:bg-white/10"
                      : "border border-stone-600 hover:bg-stone-800"
                  }`}
                >
                  Fortsätt i vyn
                </button>
                <Link
                  href="/sessions"
                  className={`flex-1 rounded-xl py-3 text-center font-semibold ${
                    isBoard
                      ? "bg-[#f4f1ea] text-[#0c0c0c]"
                      : "bg-amber-500 text-stone-950"
                  }`}
                >
                  Visa historik
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-3">
              <input type="hidden" name="workout_id" value={workoutId} />

              <label className="grid gap-1 text-sm">
                <span className={isBoard ? "text-white/55" : "text-stone-400"}>
                  Datum genomfört
                </span>
                <input
                  name="completed_date"
                  type="date"
                  required
                  defaultValue={todayDateInputValue()}
                  className={fieldClass(isBoard)}
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className={isBoard ? "text-white/55" : "text-stone-400"}>
                  Score
                </span>
                <input
                  name="score_text"
                  placeholder="t.ex. 4 hela varv / 12:34"
                  className={fieldClass(isBoard)}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-sm">
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      isBoard ? "text-white/55" : "text-stone-400"
                    }`}
                  >
                    Känsla 1–5
                    <HelpTip
                      text={FEELING_HELP_TEXT}
                      label="Vad betyder känsla?"
                      variant={isBoard ? "board" : "phone"}
                    />
                  </span>
                  <input
                    name="feeling_1_5"
                    type="number"
                    min={1}
                    max={5}
                    inputMode="numeric"
                    className={fieldClass(isBoard)}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      isBoard ? "text-white/55" : "text-stone-400"
                    }`}
                  >
                    RPE 1–10
                    <HelpTip
                      text={RPE_HELP_TEXT}
                      label="Vad betyder RPE?"
                      variant={isBoard ? "board" : "phone"}
                    />
                  </span>
                  <input
                    name="rpe_1_10"
                    type="number"
                    min={1}
                    max={10}
                    inputMode="numeric"
                    className={fieldClass(isBoard)}
                  />
                </label>
              </div>

              <label className="grid gap-1 text-sm">
                <span className={isBoard ? "text-white/55" : "text-stone-400"}>
                  Kommentar
                </span>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Valfritt"
                  className={fieldClass(isBoard)}
                />
              </label>

              <div className="space-y-2">
                <p
                  className={`text-sm ${isBoard ? "text-white/55" : "text-stone-400"}`}
                >
                  Vikter (valfritt)
                </p>
                {rows.map((lift, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      name="lift_name"
                      defaultValue={lift?.name ?? ""}
                      placeholder="Rörelse"
                      className={`flex-1 ${fieldClass(isBoard)}`}
                    />
                    <input
                      name="lift_weight"
                      type="number"
                      step="0.5"
                      defaultValue={
                        lift?.weight_kg != null ? String(lift.weight_kg) : ""
                      }
                      placeholder="kg"
                      className={`w-24 ${fieldClass(isBoard)}`}
                    />
                  </div>
                ))}
              </div>

              {error ? (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className={`mt-1 rounded-xl py-3.5 font-semibold disabled:opacity-60 ${
                  isBoard
                    ? "bg-[#f4f1ea] text-[#0c0c0c]"
                    : "bg-amber-500 text-stone-950"
                }`}
              >
                {pending ? "Sparar…" : "Spara & markera klart"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function fieldClass(isBoard: boolean) {
  return isBoard
    ? "rounded-lg border border-white/20 bg-[#0c0c0c] px-3 py-2.5 outline-none focus:border-white/45"
    : "rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 outline-none focus:border-amber-500/60";
}
