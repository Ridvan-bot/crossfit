"use client";

import { deleteUserAiKey, saveUserAiKey } from "@/app/actions/ai-keys";
import {
  AI_PROVIDERS,
  providerLabel,
  providerNeedsBaseUrl,
  type AiKeyStatus,
  type AiProvider,
} from "@/lib/ai-keys";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

export function AiKeyFields({ status }: { status: AiKeyStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [provider, setProvider] = useState<AiProvider | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedProvider = provider ?? status.provider ?? "openai";
  const showBaseUrl = providerNeedsBaseUrl(selectedProvider);

  function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await saveUserAiKey(formData);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const keyInput = form.querySelector<HTMLInputElement>('[name="api_key"]');
      if (keyInput) keyInput.value = "";
      setMessage("Nyckeln är sparad.");
      router.refresh();
    });
  }

  function onDelete() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await deleteUserAiKey();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setMessage("Nyckeln är borttagen.");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSave}
      autoComplete="off"
      className="ui-card grid gap-4 p-5"
    >
      <div>
        <h2 className="ui-eyebrow">AI-nyckel</h2>
        <p className="mt-1 text-sm text-stone-500">
          Din egen nyckel. Appen har ingen.
        </p>
      </div>

      {status.hasKey ? (
        <p
          role="status"
          className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-sm text-teal-50"
        >
          Sparad nyckel · {providerLabel(status.provider)}
        </p>
      ) : (
        <p className="text-sm text-stone-500">Ingen nyckel sparad ännu.</p>
      )}

      <label className="grid gap-1.5">
        <span className="text-sm text-stone-400">Leverantör</span>
        <select
          name="provider"
          value={selectedProvider}
          onChange={(e) => setProvider(e.target.value as AiProvider)}
          className="ui-input"
        >
          {AI_PROVIDERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm text-stone-400">Nyckel</span>
        <input
          name="api_key"
          type="password"
          autoComplete="new-password"
          spellCheck={false}
          placeholder={
            status.hasKey ? "Klistra in ny nyckel för att byta" : "Klistra in nyckel"
          }
          className="ui-input font-mono"
        />
      </label>

      {showBaseUrl ? (
        <label className="grid gap-1.5">
          <span className="text-sm text-stone-400">Base URL</span>
          <input
            name="base_url"
            type="url"
            inputMode="url"
            autoComplete="off"
            defaultValue={
              status.provider === "openai_compatible" ? (status.baseUrl ?? "") : ""
            }
            placeholder="t.ex. https://api.groq.com/openai/v1"
            className="ui-input font-mono"
          />
        </label>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-teal-200">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="ui-btn ui-btn-primary py-3 disabled:opacity-60"
        >
          {pending ? "Sparar…" : "Spara nyckel"}
        </button>
        {status.hasKey ? (
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className="ui-btn ui-btn-ghost py-3 disabled:opacity-60"
          >
            Ta bort
          </button>
        ) : null}
      </div>
    </form>
  );
}
