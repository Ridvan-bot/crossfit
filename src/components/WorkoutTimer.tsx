"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "countdown" | "stopwatch" | "emom";

type Props = {
  initialSeconds?: number;
  variant?: "phone" | "board";
};

function formatMs(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function WorkoutTimer({ initialSeconds = 600, variant = "phone" }: Props) {
  const [mode, setMode] = useState<Mode>("countdown");
  const [remainingMs, setRemainingMs] = useState(initialSeconds * 1000);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [emomRound, setEmomRound] = useState(1);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const lastTick = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    setRemainingMs(initialSeconds * 1000);
  }, [initialSeconds]);

  const beep = useCallback(
    (freq = 880, dur = 0.18) => {
      if (!sound) return;
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  return (
    <div className={board ? "flex w-full flex-col items-center gap-3" : "flex flex-col gap-3"}>
      <div className={`flex flex-wrap justify-center gap-2 ${board ? "font-[family-name:var(--font-amatic)]" : ""}`}>
        {(
          [
            ["countdown", board ? "NEDRÄKNING" : "Nedräkning"],
            ["stopwatch", board ? "STOPPUR" : "Stoppur"],
            ["emom", "EMOM"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setModeAndReset(m)}
            className={
              board
                ? `border-2 px-3 py-1 text-xl tracking-wider ${mode === m ? "border-white" : "border-white/30"}`
                : `rounded-lg border px-3 py-2 text-sm ${mode === m ? "border-amber-500 text-amber-400" : "border-stone-700"}`
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className={
          board
            ? `font-[family-name:var(--font-amatic)] text-[clamp(5rem,22vh,11rem)] font-bold leading-none tracking-wide ${warn ? "text-amber-200" : ""} ${done ? "text-red-300" : ""}`
            : `text-center font-[family-name:var(--font-barlow)] text-6xl font-extrabold tabular-nums ${warn ? "text-amber-400" : ""} ${done ? "text-red-400" : ""}`
        }
      >
        {formatMs(display)}
      </div>

      {mode === "emom" ? (
        <p className={board ? "font-[family-name:var(--font-amatic)] text-xl tracking-widest text-white/60" : "text-center text-sm text-stone-400"}>
          Runda {emomRound}
        </p>
      ) : null}

      {mode === "countdown" ? (
        <div className={`flex flex-wrap justify-center gap-2 ${board ? "font-[family-name:var(--font-amatic)] text-xl" : "text-sm"}`}>
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
              className={board ? "border-2 border-white/30 px-3 py-1" : "rounded-lg border border-stone-700 px-3 py-2"}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setRemainingMs((v) => Math.max(0, v - 60000))}
            className={board ? "border-2 border-white/30 px-3 py-1" : "rounded-lg border border-stone-700 px-3 py-2"}
          >
            −1
          </button>
          <button
            type="button"
            onClick={() => setRemainingMs((v) => v + 60000)}
            className={board ? "border-2 border-white/30 px-3 py-1" : "rounded-lg border border-stone-700 px-3 py-2"}
          >
            +1
          </button>
        </div>
      ) : null}

      <div className={`grid w-full max-w-md grid-cols-3 gap-2 ${board ? "font-[family-name:var(--font-amatic)]" : ""}`}>
        <button
          type="button"
          onClick={() => {
            if (running) stopLoop();
            else {
              setRunning(true);
              beep(520, 0.08);
              void tryWakeLock();
            }
          }}
          className={
            board
              ? "border-2 border-white py-3 text-2xl tracking-wider"
              : `rounded-lg py-3 font-bold ${running ? "bg-red-500 text-stone-950" : "bg-emerald-500 text-stone-950"}`
          }
        >
          {running ? (board ? "PAUS" : "Paus") : board ? "START" : "Start"}
        </button>
        <button
          type="button"
          onClick={reset}
          className={board ? "border-2 border-white/40 py-3 text-2xl" : "rounded-lg border border-stone-700 py-3"}
        >
          {board ? "RESET" : "Nollställ"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSound((s) => !s);
          }}
          className={board ? "border-2 border-white/40 py-3 text-2xl" : "rounded-lg border border-stone-700 py-3"}
        >
          {sound ? (board ? "LJUD PÅ" : "Ljud på") : board ? "LJUD AV" : "Ljud av"}
        </button>
      </div>
    </div>
  );
}
