"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FitToBox } from "@/components/FitToBox";

type Mode = "countdown" | "stopwatch" | "emom";

type Props = {
  initialSeconds?: number;
  variant?: "phone" | "board";
  sectionLabel?: string;
};

function formatMs(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function WorkoutTimer({
  initialSeconds = 600,
  variant = "phone",
  sectionLabel,
}: Props) {
  const [mode, setMode] = useState<Mode>("countdown");
  const [remainingMs, setRemainingMs] = useState(initialSeconds * 1000);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [emomRound, setEmomRound] = useState(1);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const lastTick = useRef(0);
  const raf = useRef<number | null>(null);

  const beep = useCallback(
    (freq = 880, dur = 0.18) => {
      if (!sound) return;
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new Ctx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.value = 0.09;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        o.stop(ctx.currentTime + dur);
        setTimeout(() => ctx.close(), 400);
      } catch {
        /* ignore */
      }
    },
    [sound]
  );

  const stopLoop = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setRunning(false);
  }, []);

  useEffect(() => {
    if (!running) return;

    const tick = (now: number) => {
      const dt = now - lastTick.current;
      lastTick.current = now;

      if (mode === "stopwatch") {
        setElapsedMs((v) => v + dt);
      } else if (mode === "countdown") {
        setRemainingMs((v) => {
          const next = Math.max(0, v - dt);
          if (next <= 0) {
            stopLoop();
            beep(523, 0.12);
            setTimeout(() => beep(784, 0.28), 140);
          } else if (next <= 3000 && v > 3000) {
            beep(660, 0.1);
          }
          return next;
        });
      } else {
        setElapsedMs((v) => {
          const next = v + dt;
          const round = Math.floor(next / 60000) + 1;
          setEmomRound((prev) => {
            if (round !== prev) beep(700, 0.15);
            return round;
          });
          return next;
        });
      }
      raf.current = requestAnimationFrame(tick);
    };

    lastTick.current = performance.now();
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [running, mode, beep, stopLoop]);

  const display =
    mode === "stopwatch"
      ? elapsedMs
      : mode === "emom"
        ? 60000 - (elapsedMs % 60000)
        : remainingMs;

  const warn = mode === "countdown" && display > 0 && display <= 30000;
  const done = mode === "countdown" && display <= 0;

  function setModeAndReset(m: Mode) {
    stopLoop();
    setMode(m);
    setElapsedMs(0);
    setEmomRound(1);
    if (m === "countdown") setRemainingMs(initialSeconds * 1000);
  }

  function reset() {
    stopLoop();
    setElapsedMs(0);
    setEmomRound(1);
    if (mode === "countdown") setRemainingMs(initialSeconds * 1000);
  }

  async function tryWakeLock() {
    try {
      if ("wakeLock" in navigator) await navigator.wakeLock.request("screen");
    } catch {
      /* ignore */
    }
  }

  const board = variant === "board";

  function toggleRun() {
    if (running) stopLoop();
    else {
      setRunning(true);
      beep(520, 0.08);
      void tryWakeLock();
    }
  }

  const boardControls = (
    <>
      <div className="flex flex-wrap justify-center gap-[0.35em] font-[family-name:var(--font-amatic)]">
        {(
          [
            ["countdown", "NEDRÄKNING"],
            ["stopwatch", "STOPPUR"],
            ["emom", "EMOM"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setModeAndReset(m)}
            className={`border-2 px-[0.45em] py-[0.15em] text-[0.85em] tracking-wider ${
              mode === m ? "border-white" : "border-white/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className={`font-[family-name:var(--font-amatic)] text-[4.2em] font-bold leading-none tracking-wide tabular-nums ${
          warn ? "text-amber-200" : ""
        } ${done ? "text-red-300" : ""}`}
      >
        {formatMs(display)}
      </div>

      {mode === "emom" ? (
        <p className="font-[family-name:var(--font-amatic)] text-[0.9em] tracking-widest text-white/60">
          Runda {emomRound}
        </p>
      ) : null}

      {mode === "countdown" ? (
        <div className="flex flex-wrap justify-center gap-[0.3em] font-[family-name:var(--font-amatic)] text-[0.85em]">
          {[
            [300, "5:00"],
            [480, "8:00"],
            [600, "10:00"],
          ].map(([sec, label]) => (
            <button
              key={sec}
              type="button"
              onClick={() => {
                stopLoop();
                setRemainingMs(Number(sec) * 1000);
              }}
              className="border-2 border-white/30 px-[0.4em] py-[0.12em]"
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setRemainingMs((v) => Math.max(0, v - 60000))}
            className="border-2 border-white/30 px-[0.4em] py-[0.12em]"
          >
            −1
          </button>
          <button
            type="button"
            onClick={() => setRemainingMs((v) => v + 60000)}
            className="border-2 border-white/30 px-[0.4em] py-[0.12em]"
          >
            +1
          </button>
        </div>
      ) : null}

      <div className="grid w-full grid-cols-3 gap-[0.3em] font-[family-name:var(--font-amatic)]">
        <button
          type="button"
          onClick={toggleRun}
          className="border-2 border-white py-[0.35em] text-[1.05em] tracking-wider"
        >
          {running ? "PAUS" : "START"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="border-2 border-white/40 py-[0.35em] text-[1.05em]"
        >
          RESET
        </button>
        <button
          type="button"
          onClick={() => setSound((s) => !s)}
          className="border-2 border-white/40 py-[0.35em] text-[1.05em]"
        >
          {sound ? "LJUD PÅ" : "LJUD AV"}
        </button>
      </div>
    </>
  );

  if (board) {
    return (
      <FitToBox
        className="h-full w-full px-2"
        minPx={28}
        maxPx={88}
        deps={[mode, initialSeconds]}
      >
        <div className="flex w-full flex-col items-center gap-[0.45em]">
          {boardControls}
        </div>
      </FitToBox>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {sectionLabel ? (
        <p className="ui-eyebrow shrink-0 text-center">{sectionLabel} · timer</p>
      ) : null}

      {!running ? (
        <div className="grid shrink-0 grid-cols-3 gap-2">
          {(
            [
              ["countdown", "Nedräkning"],
              ["stopwatch", "Stoppur"],
              ["emom", "EMOM"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setModeAndReset(m)}
              className={`flex min-h-14 items-center justify-center rounded-xl border px-1 text-center text-sm font-bold leading-tight ${
                mode === m
                  ? "border-amber-500 bg-amber-500/15 text-amber-300"
                  : "border-stone-700 text-stone-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1">
        <div
          className={`text-center font-[family-name:var(--font-barlow)] text-[clamp(4.5rem,22vw,6.5rem)] font-extrabold leading-none tabular-nums ${
            warn ? "text-amber-400" : ""
          } ${done ? "text-red-400" : ""}`}
        >
          {formatMs(display)}
        </div>
        {mode === "emom" ? (
          <p className="text-center text-base text-stone-400">Runda {emomRound}</p>
        ) : null}
      </div>

      {!running && mode === "countdown" ? (
        <div className="grid shrink-0 grid-cols-5 gap-2">
          {(
            [
              [300, "5:00"],
              [480, "8:00"],
              [600, "10:00"],
            ] as const
          ).map(([sec, label]) => (
            <button
              key={sec}
              type="button"
              onClick={() => {
                stopLoop();
                setRemainingMs(sec * 1000);
              }}
              className="flex min-h-12 items-center justify-center rounded-xl border border-stone-700 px-1 text-sm font-semibold text-stone-300"
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setRemainingMs((v) => Math.max(0, v - 60000))}
            className="flex min-h-12 items-center justify-center rounded-xl border border-stone-700 px-1 text-sm font-semibold text-stone-300"
          >
            −1
          </button>
          <button
            type="button"
            onClick={() => setRemainingMs((v) => v + 60000)}
            className="flex min-h-12 items-center justify-center rounded-xl border border-stone-700 px-1 text-sm font-semibold text-stone-300"
          >
            +1
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={toggleRun}
        className={`ui-phone-hit ui-phone-hit-xl w-full rounded-2xl font-extrabold ${
          running ? "bg-red-500 text-stone-950" : "bg-emerald-500 text-stone-950"
        }`}
      >
        {running ? "Paus" : "Start"}
      </button>

      <div className="grid shrink-0 grid-cols-2 gap-2">
        <button
          type="button"
          onClick={reset}
          className="ui-btn ui-btn-ghost ui-phone-hit"
        >
          Nollställ
        </button>
        <button
          type="button"
          onClick={() => setSound((s) => !s)}
          className="ui-btn ui-btn-ghost ui-phone-hit"
        >
          {sound ? "Ljud på" : "Ljud av"}
        </button>
      </div>
    </div>
  );
}
