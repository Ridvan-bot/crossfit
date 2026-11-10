"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createWorkout } from "@/app/actions/crud";
import {
  DEFAULT_SESSION_LAYOUT,
  SESSION_LAYOUT_OPTIONS,
  type SessionLayoutId,
} from "@/lib/session-layout";

export function CreateWorkoutForm() {
  const [template, setTemplate] = useState<SessionLayoutId>(
    DEFAULT_SESSION_LAYOUT
  );

  return (
    <form action={createWorkout} className="ui-card grid gap-4 p-5">
      <h1 className="ui-eyebrow">Nytt pass</h1>
      <input type="hidden" name="template" value={template} />
      <fieldset>
        <legend className="sr-only">Dagens prioritet</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SESSION_LAYOUT_OPTIONS.map((opt) => {
            const selected = template === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setTemplate(opt.id)}
                className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  selected
                    ? "border-teal-400 bg-teal-500 text-stone-950"
                    : "border-stone-700 bg-stone-950 text-stone-200 hover:border-teal-500/60"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      <CreateSubmitButton />
    </form>
  );
}

function CreateSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="ui-btn ui-btn-primary py-3 disabled:opacity-60"
    >
      {pending ? "Skapar…" : "Skapa"}
    </button>
  );
}
