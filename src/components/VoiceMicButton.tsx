"use client";

import { useEffect, useRef, useState } from "react";
import {
  getSpeechRecognitionConstructor,
  speechErrorMessage,
  type SpeechRecognitionLike,
} from "@/lib/speech";

type Props = {
  onTranscript: (text: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  variant?: "phone" | "board";
  listeningLabel?: string;
  idleLabel?: string;
};

export function VoiceMicButton({
  onTranscript,
  onError,
  disabled = false,
  variant = "phone",
  listeningLabel = "Lyssnar…",
  idleLabel = "Säg resultatet",
}: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interim, setInterim] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => {
      recRef.current?.abort();
      recRef.current = null;
    };
  }, []);

  const isBoard = variant === "board";

  function stop() {
    recRef.current?.stop();
  }

  function start() {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    recRef.current?.abort();
    const rec = new Ctor();
    rec.lang = "sv-SE";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let delivered = false;
    let lastInterim = "";
    rec.onresult = (event) => {
      let finalText = "";
      let live = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i];
        const spoken = piece[0]?.transcript?.trim() ?? "";
        if (!spoken) continue;
        if (piece.isFinal) finalText = joinUtterance(finalText, spoken);
        else live = joinUtterance(live, spoken);
      }
      if (live) {
        lastInterim = live;
        setInterim(live);
      }
      if (finalText) {
        delivered = true;
        setInterim("");
        onTranscript(finalText);
        rec.stop();
      }
    };
    rec.onerror = (event) => {
      delivered = true;
      const message = speechErrorMessage(event.error);
      setListening(false);
      setInterim("");
      if (message) onError?.(message);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
      if (!delivered && lastInterim) {
        onTranscript(lastInterim);
      }
    };
    recRef.current = rec;
    setInterim("");
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      onError?.("Kunde inte starta mikrofonen. Försök igen.");
    }
  }

  if (!supported) {
    return (
      <p
        className={`text-sm ${isBoard ? "text-white/55" : "text-stone-400"}`}
        role="status"
      >
        Röst stöds i Chrome, Edge och Safari.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? "Stoppa röstinmatning" : idleLabel}
        onClick={() => (listening ? stop() : start())}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border font-semibold transition disabled:opacity-60 ${
          isBoard ? "min-h-12" : "ui-phone-hit"
        } ${
          listening
            ? isBoard
              ? "border-white bg-white/15 text-white"
              : "border-teal-400 bg-teal-500/20 text-teal-100"
            : isBoard
              ? "border-white/35 bg-white/5 text-white/90 hover:border-white/60 hover:bg-white/10"
              : "border-stone-600 bg-stone-950 text-stone-100 hover:border-teal-500/60"
        }`}
      >
        <MicIcon listening={listening} />
        {listening ? listeningLabel : idleLabel}
      </button>
      {interim ? (
        <p
          className={`text-sm ${isBoard ? "text-white/70" : "text-stone-300"}`}
          aria-live="polite"
        >
          {interim}
        </p>
      ) : null}
    </div>
  );
}

function joinUtterance(a: string, b: string) {
  return [a, b].filter(Boolean).join(" ").trim();
}

function MicIcon({ listening }: { listening: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-5 ${listening ? "animate-pulse" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}
