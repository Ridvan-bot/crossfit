"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { logSession } from "@/app/actions/crud";
import { VoiceMicButton } from "@/components/VoiceMicButton";
import { todayDateInputValue } from "@/lib/dates";
import { CROSSFIT_MOVEMENTS } from "@/lib/movements";
import type { WorkoutSection } from "@/lib/types";
import {
  formatSessionLogSummary,
  hasParsedSessionLog,
  parseSessionUtterance,
  type ParsedSessionLog,
  type VoiceLift,
} from "@/lib/voice-log";

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
  // Fallback: rörelser med föreslagen vikt oavsett deltyp
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

type Phase = "form" | "confirm";

export function LogSessionSheet({
  open,
  onClose,
  workoutId,
  workoutTitle,
  suggestedLifts = [],
  variant = "phone",
}: Props) {
  const router = useRouter();
  const titleId = useId();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [feeling, setFeeling] = useState<number | null>(null);
  const [rpe, setRpe] = useState<number | null>(null);
  const [scoreText, setScoreText] = useState("");
  const [lifts, setLifts] = useState<VoiceLift[]>(() =>
    liftsFromSuggested(suggestedLifts)
  );
  const [parsed, setParsed] = useState<ParsedSessionLog | null>(null);

  const knownMovements = useMemo(() => {
    const names = [
      ...suggestedLifts.map((l) => l.name),
      ...CROSSFIT_MOVEMENTS,
    ];
    return [...new Set(names.filter(Boolean))];
  }, [suggestedLifts]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, pending]);

  if (!open) return null;

  const isBoard = variant === "board";

  function applyTranscript(text: string) {
    setError(null);
    const next = parseSessionUtterance(text, knownMovements);
    if (!hasParsedSessionLog(next)) {
      setError("Hörde inget resultat. Försök igen eller fyll i själv.");
      return;
    }
    setParsed(next);
    setScoreText(next.score_text ?? "");
    setFeeling(next.feeling_1_5);
    setRpe(next.rpe_1_10);
    if (next.lifts.length > 0) setLifts(next.lifts);
    setPhase("confirm");
  }

  function saveFromValues() {
    const fd = new FormData();
    fd.set("workout_id", workoutId);
    fd.set("completed_date", todayDateInputValue());
    fd.set("score_text", scoreText.trim());
    fd.set("feeling_1_5", feeling != null ? String(feeling) : "");
    fd.set("rpe_1_10", rpe != null ? String(rpe) : "");
    for (const lift of lifts) {
      fd.append("lift_name", lift.name);
      fd.append(
        "lift_weight",
        lift.weight_kg != null ? String(lift.weight_kg) : ""
      );
    }
    setError(null);
    startTransition(async () => {
      const result = await logSession(fd);
      if (result.ok === false) {
        setError(result.message);
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    saveFromValues();
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
        className={`ui-sheet relative z-10 flex w-full max-h-[96dvh] flex-col overflow-hidden shadow-2xl sm:mx-4 sm:w-[min(100%-2rem,28rem)] ${
          isBoard
            ? "border border-white/25 bg-[#121212] text-[#f4f1ea] sm:rounded-2xl"
            : "rounded-t-2xl border border-stone-700 bg-stone-900 text-stone-100 sm:rounded-2xl"
        }`}
      >
        <div
          className={`flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 ${
            isBoard ? "border-white/15" : "border-stone-800"
          }`}
        >
          <h2
            id={titleId}
            className={
              isBoard
                ? "font-[family-name:var(--font-amatic)] text-2xl tracking-wider"
                : "font-[family-name:var(--font-barlow)] text-lg font-extrabold uppercase"
            }
          >
            {phase === "confirm" ? "Bekräfta" : "Logga"}
          </h2>
          <button
            type="button"
            onClick={() => {
              if (!pending) onClose();
            }}
            className={`min-h-11 min-w-11 rounded-lg px-3 text-sm ${
              isBoard
                ? "text-white/55 hover:text-white"
                : "text-stone-300 hover:text-stone-100"
            }`}
          >
            Stäng
          </button>
        </div>

        {phase === "confirm" && parsed ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <p className="sr-only">{workoutTitle}</p>
              <p
                className={`text-sm ${isBoard ? "text-white/55" : "text-stone-400"}`}
              >
                Hörde jag rätt?
              </p>
              <p
                className={`mt-3 text-xl font-semibold leading-snug ${
                  isBoard
                    ? "font-[family-name:var(--font-amatic)] tracking-wider"
                    : ""
                }`}
              >
                {formatSessionLogSummary(parsed)}
              </p>
              {parsed.transcript ? (
                <p
                  className={`mt-3 text-sm ${
                    isBoard ? "text-white/45" : "text-stone-500"
                  }`}
                >
                  “{parsed.transcript}”
                </p>
              ) : null}
              {error ? (
                <p className="mt-3 text-sm text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
            <div
              className={`grid shrink-0 gap-2 border-t px-4 py-3 ${
                isBoard ? "border-white/15" : "border-stone-800"
              }`}
            >
              <button
                type="button"
                disabled={pending}
                onClick={saveFromValues}
                className={`w-full rounded-xl font-semibold disabled:opacity-60 ${
                  isBoard
                    ? "bg-[#f4f1ea] py-3.5 text-[#0c0c0c]"
                    : "ui-phone-hit ui-phone-hit-xl bg-teal-500 text-stone-950"
                }`}
              >
                {pending ? "Sparar…" : "Spara"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setPhase("form")}
                  className={`rounded-xl border text-sm font-semibold disabled:opacity-60 ${
                    isBoard
                      ? "min-h-11 border-white/25 text-white/80"
                      : "ui-phone-hit border-stone-600 text-stone-200"
                  }`}
                >
                  Ändra
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setPhase("form");
                    setParsed(null);
                    setError(null);
                  }}
                  className={`rounded-xl border text-sm font-semibold disabled:opacity-60 ${
                    isBoard
                      ? "min-h-11 border-white/25 text-white/80"
                      : "ui-phone-hit border-stone-600 text-stone-200"
                  }`}
                >
                  Prata om
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <input type="hidden" name="workout_id" value={workoutId} />
              <input
                type="hidden"
                name="completed_date"
                value={todayDateInputValue()}
              />
              <p className="sr-only">{workoutTitle}</p>

              <div className="grid gap-4">
                <VoiceMicButton
                  variant={variant}
                  disabled={pending}
                  onTranscript={applyTranscript}
                  onError={setError}
                />

                <label className="grid gap-1.5 text-sm">
                  <span className={isBoard ? "text-white/55" : "text-stone-400"}>
                    Score
                  </span>
                  <input
                    name="score_text"
                    inputMode="text"
                    autoComplete="off"
                    value={scoreText}
                    onChange={(e) => setScoreText(e.target.value)}
                    className={fieldClass(isBoard)}
                  />
                </label>

                <ScaleChips
                  label="Känsla"
                  name="feeling_1_5"
                  value={feeling}
                  max={5}
                  isBoard={isBoard}
                  onChange={setFeeling}
                />

                <ScaleChips
                  label="RPE"
                  name="rpe_1_10"
                  value={rpe}
                  max={10}
                  isBoard={isBoard}
                  onChange={setRpe}
                />

                <div className="grid gap-1.5">
                  <p
                    className={`text-sm ${isBoard ? "text-white/55" : "text-stone-400"}`}
                  >
                    Vikter
                  </p>
                  {lifts.map((lift, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        name="lift_name"
                        value={lift.name}
                        onChange={(e) =>
                          setLifts((prev) =>
                            prev.map((row, idx) =>
                              idx === i ? { ...row, name: e.target.value } : row
                            )
                          )
                        }
                        aria-label="Rörelse"
                        className={`flex-1 ${fieldClass(isBoard)}`}
                      />
                      <input
                        name="lift_weight"
                        type="number"
                        step="0.5"
                        inputMode="decimal"
                        value={
                          lift.weight_kg != null ? String(lift.weight_kg) : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value;
                          setLifts((prev) =>
                            prev.map((row, idx) =>
                              idx === i
                                ? {
                                    ...row,
                                    weight_kg:
                                      raw.trim() === "" ? null : Number(raw),
                                  }
                                : row
                            )
                          );
                        }}
                        aria-label="kg"
                        placeholder="kg"
                        className={`w-20 ${fieldClass(isBoard)}`}
                      />
                    </div>
                  ))}
                </div>

                {error ? (
                  <p className="text-sm text-red-400" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className={`shrink-0 border-t px-4 py-3 ${
                isBoard ? "border-white/15" : "border-stone-800"
              }`}
            >
              <button
                type="submit"
                disabled={pending}
                className={`w-full rounded-xl font-semibold disabled:opacity-60 ${
                  isBoard
                    ? "bg-[#f4f1ea] py-3.5 text-[#0c0c0c]"
                    : "ui-phone-hit ui-phone-hit-xl bg-teal-500 text-stone-950"
                }`}
              >
                {pending ? "Sparar…" : "Spara"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function liftsFromSuggested(suggestedLifts: SuggestedLift[]): VoiceLift[] {
  if (suggestedLifts.length === 0) {
    return [{ name: "", weight_kg: null }];
  }
  return suggestedLifts.map((lift) => ({
    name: lift.name,
    weight_kg: lift.weight_kg,
  }));
}

function ScaleChips({
  label,
  name,
  value,
  max,
  isBoard,
  onChange,
}: {
  label: string;
  name: string;
  value: number | null;
  max: number;
  isBoard: boolean;
  onChange: (n: number | null) => void;
}) {
  return (
    <fieldset className="grid gap-1.5">
      <legend
        className={`text-sm ${isBoard ? "text-white/55" : "text-stone-400"}`}
      >
        {label}
      </legend>
      <input type="hidden" name={name} value={value ?? ""} />
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : n)}
              className={`rounded-lg border text-sm font-semibold transition ${
                isBoard ? "min-h-11" : "ui-phone-hit"
              } ${
                selected
                  ? isBoard
                    ? "border-white bg-[#f4f1ea] text-[#0c0c0c]"
                    : "border-teal-400 bg-teal-500 text-stone-950"
                  : isBoard
                    ? "border-white/20 bg-[#0c0c0c] text-white/80 hover:border-white/45"
                    : "border-stone-700 bg-stone-950 text-stone-200 hover:border-teal-500/60"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function fieldClass(isBoard: boolean) {
  return isBoard
    ? "rounded-lg border border-white/20 bg-[#0c0c0c] px-3 py-2.5 outline-none focus:border-white/45"
    : "min-h-12 rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 outline-none focus:border-teal-500/60";
}
