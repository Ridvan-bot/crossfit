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
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4">
      <div className="pointer-events-none absolute left-1/2 top-24 size-64 -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="ui-page relative ui-card p-6 sm:p-8">
        <p className="ui-eyebrow">CrossFit</p>
        <h1 className="ui-title mt-2 text-4xl">Skapa konto</h1>
        <p className="mt-2 text-sm text-stone-400">Kom igång med pass, timer och logg.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Namn (valfritt)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="ui-input"
          />
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
            minLength={6}
            placeholder="Lösenord (minst 6 tecken)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ui-input"
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {info ? <p className="text-sm text-teal-300">{info}</p> : null}
          <button type="submit" disabled={loading} className="ui-btn ui-btn-primary py-3 disabled:opacity-50">
            {loading ? "Skapar…" : "Skapa konto"}
          </button>
        </form>
        <p className="mt-5 text-sm text-stone-400">
          Har du konto?{" "}
          <Link href="/login" className="ui-link">
            Logga in
          </Link>
        </p>
      </div>
    </main>
  );
}
