"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  ADD_TO_HOME_SCREEN_DISMISS_KEY,
  ADD_TO_HOME_SCREEN_HINT,
  ANDROID_ADD_TO_HOME_SCREEN_STEPS,
  IOS_ADD_TO_HOME_SCREEN_STEPS,
  isStandaloneDisplayMode,
  shouldOfferAddToHomeScreen,
} from "@/lib/pwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

type Props = {
  /** prompt = dismissible banner; guide = always-on instructions */
  variant?: "prompt" | "guide";
};

function subscribeNever() {
  return () => {};
}

function subscribeDisplayMode(onStoreChange: () => void) {
  const standalone = window.matchMedia("(display-mode: standalone)");
  const fullscreen = window.matchMedia("(display-mode: fullscreen)");
  standalone.addEventListener("change", onStoreChange);
  fullscreen.addEventListener("change", onStoreChange);
  return () => {
    standalone.removeEventListener("change", onStoreChange);
    fullscreen.removeEventListener("change", onStoreChange);
  };
}

function readStandalone() {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return isStandaloneDisplayMode({
    iosStandalone: nav.standalone === true,
    mediaMatches:
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches,
  });
}

function useStandalone() {
  return useSyncExternalStore(subscribeDisplayMode, readStandalone, () => false);
}

function useIsIos() {
  return useSyncExternalStore(
    subscribeNever,
    () => /iphone|ipad|ipod/i.test(window.navigator.userAgent),
    () => false
  );
}

function useStoredDismiss(active: boolean) {
  const stored = useSyncExternalStore(
    subscribeNever,
    () => window.localStorage.getItem(ADD_TO_HOME_SCREEN_DISMISS_KEY) === "1",
    () => true
  );
  const [localDismissed, setLocalDismissed] = useState(false);
  const dismiss = useCallback(() => {
    window.localStorage.setItem(ADD_TO_HOME_SCREEN_DISMISS_KEY, "1");
    setLocalDismissed(true);
  }, []);
  return {
    dismissed: active ? stored || localDismissed : false,
    dismiss,
  };
}

export function AddToHomeScreen({ variant = "prompt" }: Props) {
  const standalone = useStandalone();
  const ios = useIsIos();
  const persistDismiss = variant === "prompt";
  const { dismissed, dismiss } = useStoredDismiss(persistDismiss);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null
  );

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (standalone) {
    if (variant === "guide") {
      return (
        <section className="ui-card p-5 sm:p-6">
          <h2 className="ui-eyebrow">På hemskärmen</h2>
          <p className="mt-2 text-sm text-stone-300">
            Appen är redan installerad och öppnas utan webbläsarens adressfält.
          </p>
        </section>
      );
    }
    return null;
  }

  if (persistDismiss && !shouldOfferAddToHomeScreen({ standalone, dismissed })) {
    return null;
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(null);
  }

  const steps = ios ? IOS_ADD_TO_HOME_SCREEN_STEPS : ANDROID_ADD_TO_HOME_SCREEN_STEPS;

  return (
    <section className="ui-card ui-card-accent p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="ui-eyebrow">På telefonen</h2>
          <p className="ui-title mt-2 text-xl">Lägg till på hemskärmen</p>
        </div>
        {persistDismiss ? (
          <button
            type="button"
            onClick={dismiss}
            className="min-h-11 rounded-lg px-3 text-sm text-stone-500 transition hover:bg-white/5 hover:text-stone-300"
          >
            Inte nu
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-stone-300">{ADD_TO_HOME_SCREEN_HINT}</p>
      {installEvent ? (
        <button
          type="button"
          onClick={install}
          className="ui-btn ui-btn-primary mt-4 min-h-11"
        >
          Installera appen
        </button>
      ) : (
        <p className="mt-2 text-sm text-stone-400">{steps}</p>
      )}
    </section>
  );
}
