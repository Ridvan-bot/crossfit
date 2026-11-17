"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { createWorkoutFromVoice } from "@/app/actions/crud";
import { VoiceMicButton } from "@/components/VoiceMicButton";
import type { AthleteInsights, AthletePreferences } from "@/lib/athlete";
import { CROSSFIT_MOVEMENTS } from "@/lib/movements";
import {
  formatWorkoutPlanSummary,
  hasParsedWorkoutPlan,
  parseWorkoutUtterance,
  type ParsedWorkoutPlan,
} from "@/lib/voice-workout";

type Props = {
  preferences: AthletePreferences;
  insights?: AthleteInsights | null;
  movementBest?: AthleteInsights["movement_best"] | null;
};

export function VoiceCreateWorkout({
  preferences,
  insights = null,
  movementBest = null,
}: Props) {
  const router = useRouter();
  const titleId = useId();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [parsed, setParsed] = useState<ParsedWorkoutPlan | null>(null);

  const reset = useCallback(() => {
    if (pending) return;
    setParsed(null);
    setError(null);
  }, [pending]);

  useEffect(() => {
    if (!parsed) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") reset();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [parsed, reset]);

  const resolvedInsights = useMemo(() => {
    if (insights) return insights;
    if (movementBest) {
      return { movement_best: movementBest } as AthleteInsights;
    }
    return null;
  }, [insights, movementBest]);

  const context = useMemo(
    () => ({
      preferences,
      insights: resolvedInsights,
      knownMovements: [
        ...new Set(
          [
            ...CROSSFIT_MOVEMENTS,
            ...preferences.fun_movements,
            ...Object.keys(resolvedInsights?.movement_best ?? {}),
          ].filter(Boolean)
        ),
      ],
    }),
    [preferences, resolvedInsights]
  );

  function applyTranscript(text: string) {
    setError(null);
    const next = parseWorkoutUtterance(text, context);
    if (!hasParsedWorkoutPlan(next)) {
      setError("Hörde inget pass. Försök igen, t.ex. teknik och styrka, ingen flås.");
      return;
    }
    setDraft(text);
    setParsed(next);
  }

  function onWrite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    applyTranscript(draft);
  }

  function save() {
    if (!parsed) return;
    setError(null);
    startTransition(async () => {
      const result = await createWorkoutFromVoice({
        transcript: parsed.transcript,
        layoutId: parsed.layoutId,
        warmupTheme: parsed.warmupTheme,
        title: parsed.title,
        notes: parsed.notes,
        workingMovements: parsed.sections
          .filter((s) => s.kind !== "warmup")
          .flatMap((s) =>
            s.movements.map((m) => ({
              kind: s.kind,
              name: m.name,
              detail: m.detail,
              suggested_weight_kg: m.suggested_weight_kg,
            }))
          ),
      });
      if (result.ok === false) {
        setError(result.message);
        return;
      }
      router.push(`/workouts/${result.id}`);
      router.refresh();
    });
  }

  return (
    <section className="ui-card grid gap-3 p-5 sm:p-6">
      <h2 className="ui-eyebrow">Säg dagens pass</h2>
      <VoiceMicButton
        disabled={pending}
        idleLabel="Säg dagens pass"
        listeningLabel="Lyssnar…"
        onTranscript={applyTranscript}
        onError={setError}
      />
      <form onSubmit={onWrite} className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <label className="grid gap-1.5">
          <span className="sr-only">Eller skriv vad du vill träna</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="t.ex. teknik och styrka, ingen flås"
            className="ui-input"
            autoComplete="off"
            disabled={pending}
          />
        </label>
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          className="ui-btn ui-btn-ghost min-h-12 px-4 disabled:opacity-60"
        >
          Tolk
        </button>
      </form>
      {error && !parsed ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {parsed ? (
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
            onClick={reset}
          />
          <div className="ui-sheet relative z-10 flex w-full max-h-[96dvh] flex-col overflow-hidden rounded-t-2xl border border-stone-700 bg-stone-900 text-stone-100 shadow-2xl sm:mx-4 sm:w-[min(100%-2rem,28rem)] sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-800 px-4 py-3">
              <h3
                id={titleId}
                className="font-[family-name:var(--font-barlow)] text-lg font-extrabold uppercase"
              >
                Bekräfta
              </h3>
              <button
                type="button"
                onClick={reset}
                className="min-h-11 min-w-11 rounded-lg px-3 text-sm text-stone-300 hover:text-stone-100"
              >
                Stäng
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <p className="text-sm text-stone-400">Hörde jag rätt?</p>
              <p className="mt-3 text-xl font-semibold leading-snug">
                {formatWorkoutPlanSummary(parsed)}
              </p>
              <ul className="mt-4 grid gap-3">
                {parsed.sections
                  .filter((s) => s.kind !== "warmup")
                  .map((section) => (
                    <li key={section.kind}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                        {section.label}
                      </p>
                      <p className="mt-1 text-sm text-stone-300">
                        {section.movements
                          .map((m) =>
                            m.detail ? `${m.name} ${m.detail}` : m.name
                          )
                          .join(" · ") || "Inga rörelser"}
                      </p>
                    </li>
                  ))}
              </ul>
              {parsed.transcript ? (
                <p className="mt-3 text-sm text-stone-500">
                  “{parsed.transcript}”
                </p>
              ) : null}
              {error ? (
                <p className="mt-3 text-sm text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
            <div className="grid shrink-0 gap-2 border-t border-stone-800 px-4 py-3">
              <button
                type="button"
                disabled={pending}
                onClick={save}
                className="ui-phone-hit ui-phone-hit-xl w-full rounded-xl bg-teal-500 font-semibold text-stone-950 disabled:opacity-60"
              >
                {pending ? "Sparar…" : "Spara"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={reset}
                className="ui-phone-hit rounded-xl border border-stone-600 text-sm font-semibold text-stone-200 disabled:opacity-60"
              >
                Prata om
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
