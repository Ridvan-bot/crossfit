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
        className="rounded-lg border border-amber-600/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/20 disabled:opacity-50"
      >
        {loading ? "Seedar…" : "Importera pass #001–#008"}
      </button>
      {msg ? <p className="text-sm text-stone-400">{msg}</p> : null}
    </div>
  );
}
