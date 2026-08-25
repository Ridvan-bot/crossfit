"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || undefined } },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }
    setInfo("Kolla din e-post för bekräftelselänk (om e-postbekräftelse är på).");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">CrossFit</p>
        <h1 className="mt-1 font-[family-name:var(--font-barlow)] text-4xl font-extrabold uppercase tracking-wide">
          Skapa konto
        </h1>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Namn (valfritt)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-3"
        />
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
          minLength={6}
          placeholder="Lösenord (minst 6 tecken)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-3"
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {info ? <p className="text-sm text-amber-300">{info}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 py-3 font-semibold text-stone-950 disabled:opacity-50"
        >
          {loading ? "Skapar…" : "Skapa konto"}
        </button>
      </form>
      <p className="text-sm text-stone-400">
        Har du konto?{" "}
        <Link href="/login" className="text-amber-400 hover:underline">
          Logga in
        </Link>
      </p>
    </main>
  );
}
