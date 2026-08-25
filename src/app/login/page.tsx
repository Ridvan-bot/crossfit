"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">CrossFit</p>
        <h1 className="mt-1 font-[family-name:var(--font-barlow)] text-4xl font-extrabold uppercase tracking-wide">
          Logga in
        </h1>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-3"
        />
        <input
          type="password"
          required
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-3"
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 py-3 font-semibold text-stone-950 disabled:opacity-50"
        >
          {loading ? "Loggar in…" : "Logga in"}
        </button>
      </form>
      <p className="text-sm text-stone-400">
        Inget konto?{" "}
        <Link href="/signup" className="text-amber-400 hover:underline">
          Skapa konto
        </Link>
      </p>
    </main>
  );
}
