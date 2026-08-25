"use client";

import { useState } from "react";
import { seedDemoData } from "@/app/actions/seed";

export function SeedButton() {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const res = await seedDemoData();
    setMsg(res.message);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="ui-btn ui-btn-outline disabled:opacity-50"
      >
        {loading ? "Seedar…" : "Importera pass #001–#008"}
      </button>
      {msg ? <p className="text-sm text-stone-400">{msg}</p> : null}
    </div>
  );
}
