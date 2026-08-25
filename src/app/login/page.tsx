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
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4">
      <div className="pointer-events-none absolute left-1/2 top-24 size-64 -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="ui-page relative ui-card p-6 sm:p-8">
        <p className="ui-eyebrow">CrossFit</p>
        <h1 className="ui-title mt-2 text-4xl">Logga in</h1>
        <p className="mt-2 text-sm text-stone-400">Fortsätt där du slutade.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ui-input"
          />
          <input
            type="password"
            required
            placeholder="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ui-input"
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button type="submit" disabled={loading} className="ui-btn ui-btn-primary py-3 disabled:opacity-50">
            {loading ? "Loggar in…" : "Logga in"}
          </button>
        </form>
        <p className="mt-5 text-sm text-stone-400">
          Inget konto?{" "}
          <Link href="/signup" className="ui-link">
            Skapa konto
          </Link>
        </p>
      </div>
    </main>
  );
}
