"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";

/**
 * Grows/shrinks font-size so children fill the available box.
 * Children should size with `em` relative to this wrapper.
 */
export function FitToBox({
  children,
  className = "",
  minPx = 18,
  maxPx = 96,
  deps = [],
}: {
  children: ReactNode;
  className?: string;
  minPx?: number;
  maxPx?: number;
  deps?: unknown[];
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const fit = useCallback(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;

    const availW = box.clientWidth;
    const availH = box.clientHeight;
    if (availW < 16 || availH < 16) return;

    // Binary search the largest font-size that still fits
    let lo = minPx;
    let hi = maxPx;
    let best = minPx;

    inner.style.width = "100%";
    inner.style.transform = "none";

    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      inner.style.fontSize = `${mid}px`;
      // Height is the main constraint on the board; allow slight width overflow
      // from chalk letter-spacing so we don't collapse to tiny type.
      const fits = inner.scrollHeight <= availH + 2;
      if (fits) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    inner.style.fontSize = `${best}px`;

    // If still wider than the board, nudge down until it fits width too
    let guard = 0;
    while (
      guard < 24 &&
      best > minPx &&
      inner.scrollWidth > availW + 4
    ) {
      best -= 1.5;
      inner.style.fontSize = `${best}px`;
      guard += 1;
    }
  }, [minPx, maxPx]);

  useLayoutEffect(() => {
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit, ...deps]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(fit);
    });
    ro.observe(box);
    window.addEventListener("orientationchange", fit);
    window.addEventListener("resize", fit);
    void document.fonts?.ready.then(() => fit());
    // Second pass after paint (fonts / flex settle)
    const t = window.setTimeout(fit, 50);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", fit);
      window.removeEventListener("resize", fit);
      window.clearTimeout(t);
    };
  }, [fit]);

  return (
    <div
      ref={boxRef}
      className={`relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden ${className}`}
    >
      <div ref={innerRef} className="w-full max-w-full origin-center">
        {children}
      </div>
    </div>
  );
}
