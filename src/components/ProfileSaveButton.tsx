"use client";

import { useFormStatus } from "react-dom";

export function ProfileSaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="ui-btn ui-btn-primary md:col-span-2 py-3 disabled:opacity-60"
    >
      {pending ? "Sparar…" : "Spara profil"}
    </button>
  );
}
