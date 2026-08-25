"use client";

import { useFormStatus } from "react-dom";

export function ProfileSaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="md:col-span-2 rounded-lg bg-amber-500 py-2.5 font-semibold text-stone-950 disabled:opacity-60"
    >
      {pending ? "Sparar…" : "Spara profil"}
    </button>
  );
}
