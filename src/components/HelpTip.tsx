"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export const RPE_HELP_TEXT =
  "RPE (Rate of Perceived Exertion) är hur ansträngande passet kändes, på en skala 1–10. 1 = mycket lätt, 5–6 = måttligt, 7–8 = jobbigt men hållbart, 9–10 = nära max / maxinsats.";

export const FEELING_HELP_TEXT =
  "Känsla är hur du upplevde passet totalt sett, på en skala 1–5. 1 = dåligt / tungt mentalt, 3 = okej, 4 = bra, 5 = riktigt starkt och positivt. Det handlar mer om helhetskänsla än ren ansträngning (RPE).";

type Props = {
  text?: string;
  label?: string;
  /** Visuell stil för tavla vs telefon/app */
  variant?: "phone" | "board" | "app";
  className?: string;
};

/**
 * Frågetecken med förklaring.
 * Öppnas med klick/tryck (stabilt på mobil och i modaler).
 * Tooltip i portal med hög z-index så den syns ovanpå tavla/sheet.
 */
export function HelpTip({
  text = RPE_HELP_TEXT,
  label = "Vad betyder det här?",
  variant = "app",
  className = "",
}: Props) {
  const tipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setCoords(null);
      return;
    }

    const place = () => {
      const btn = rootRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const tipW = Math.min(320, window.innerWidth - 24);
      let left = r.left;
      if (left + tipW > window.innerWidth - 12) {
        left = window.innerWidth - tipW - 12;
      }
      if (left < 12) left = 12;

      let top = r.bottom + 8;
      const tipH = tipRef.current?.offsetHeight ?? 120;
      if (top + tipH > window.innerHeight - 12) {
        top = Math.max(12, r.top - tipH - 8);
      }
      setCoords({ top, left });
    };

    place();
    const raf = requestAnimationFrame(place);

    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (tipRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // delay so the opening click doesn't immediately close
    const timer = window.setTimeout(() => {
      window.addEventListener("pointerdown", onPointerDown);
    }, 0);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const tone =
    variant === "board"
      ? {
          btn: "border-white/35 text-white/70 hover:border-white/55 hover:text-white",
          panel:
            "border-white/25 bg-[#1a1a1a] text-white/85 shadow-[0_8px_28px_rgba(0,0,0,0.55)]",
        }
      : variant === "phone"
        ? {
            btn: "border-stone-600 text-stone-400 hover:border-teal-500/50 hover:text-teal-300",
            panel:
              "border-stone-600 bg-stone-900 text-stone-200 shadow-xl shadow-black/50",
          }
        : {
            btn: "border-stone-600 text-stone-400 hover:border-teal-500/50 hover:text-teal-300",
            panel:
              "border-stone-600 bg-stone-900 text-stone-200 shadow-xl shadow-black/50",
          };

  // Above board (z-9999) and log sheet (z-80)
  const tipZ = "z-[10050]";

  const tip =
    mounted && open
      ? createPortal(
          <div
            ref={tipRef}
            id={tipId}
            role="tooltip"
            style={{
              top: coords?.top ?? -9999,
              left: coords?.left ?? 0,
              visibility: coords ? "visible" : "hidden",
            }}
            className={`fixed ${tipZ} w-[min(20rem,calc(100vw-1.5rem))] rounded-lg border px-3 py-2.5 text-left text-sm leading-snug ${tone.panel}`}
          >
            {text}
          </div>,
          document.body
        )
      : null;

  return (
    <span ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={tipId}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-[0.75rem] font-semibold leading-none ${tone.btn}`}
      >
        ?
      </button>
      {tip}
    </span>
  );
}
