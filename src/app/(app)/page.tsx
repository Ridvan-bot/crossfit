import Link from "next/link";
import { AddToHomeScreen } from "@/components/AddToHomeScreen";
import { AthleteLearningCard } from "@/components/AthleteLearningCard";
import { SeedButton } from "@/components/SeedButton";
import { VoiceCreateWorkout } from "@/components/VoiceCreateWorkout";
import { parsePreferences, type AthleteInsights } from "@/lib/athlete";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutNameRef } from "@/lib/types";
import { wodDisplayName, wodNickname, wodNumberLabel } from "@/lib/wod-name";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: nextWorkout },
    { data: lastSession },
    { count },
    { data: profile },
    { data: insightsRow },
  ] = await Promise.all([
    supabase
      .from("workouts")
      .select("id, title, pass_number, scheduled_date, status")
      .eq("user_id", user!.id)
      .eq("status", "planned")
      .order("pass_number", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("training_sessions")
      .select("id, score_text, feeling_1_5, rpe_1_10, notes, completed_at, workouts(title, pass_number)")
      .eq("user_id", user!.id)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("workouts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("profiles")
      .select("preferences")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("athlete_insights")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  const preferences = parsePreferences(profile?.preferences);
  const insights = insightsRow as AthleteInsights | null;
  const lastWorkout = (lastSession?.workouts ?? null) as WorkoutNameRef;

  return (
      <main className="ui-page mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <AddToHomeScreen variant="prompt" />

        <VoiceCreateWorkout
          preferences={preferences}
          insights={insights}
        />

        <div className="ui-stagger grid gap-4 md:grid-cols-2">
          <section className="ui-card p-5 sm:p-6">
            <h1 className="ui-eyebrow">Nästa WOD</h1>
            {nextWorkout ? (
              <div className="mt-4 space-y-4">
                <div>
                  {wodNickname(nextWorkout.title, nextWorkout.pass_number) &&
                  wodNumberLabel(nextWorkout.pass_number) ? (
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      {wodNumberLabel(nextWorkout.pass_number)}
                    </p>
                  ) : null}
                  <p className="ui-title mt-1 text-2xl sm:text-3xl">
                    {wodDisplayName(nextWorkout.title, nextWorkout.pass_number)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/workouts/${nextWorkout.id}`} className="ui-btn ui-btn-ghost">
                    Öppna
                  </Link>
                  <Link
                    href={`/workouts/${nextWorkout.id}/phone`}
                    className="ui-btn ui-btn-primary"
                  >
                    Telefon
                  </Link>
                  <Link
                    href={`/workouts/${nextWorkout.id}/board`}
                    className="ui-btn ui-btn-outline"
                  >
                    Tavla
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-stone-400">
                Inga planerade WOD:er.{" "}
                <Link href="/workouts" className="ui-link">
                  Skapa ett
                </Link>
              </p>
            )}
          </section>

          <section className="ui-card p-5 sm:p-6">
            <h2 className="ui-eyebrow">Senaste session</h2>
            {lastSession ? (
              <div className="mt-4 space-y-2">
                <p className="ui-title text-xl sm:text-2xl">
                  {wodDisplayName(lastWorkout?.title, lastWorkout?.pass_number)}
                </p>
                <p className="text-lg text-stone-200">{lastSession.score_text}</p>
                {lastSession.notes ? (
                  <p className="text-sm text-stone-400">{lastSession.notes}</p>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-stone-300">
                    Känsla {lastSession.feeling_1_5 ?? "–"}/5
                  </span>
                  <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs text-teal-200">
                    RPE {lastSession.rpe_1_10 ?? "–"}/10
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-stone-400">Ingen historik ännu.</p>
            )}
          </section>

          <AthleteLearningCard preferences={preferences} insights={insights} />
        </div>

        {(count ?? 0) === 0 ? (
          <section className="ui-card ui-card-accent p-5 sm:p-6">
            <SeedButton />
          </section>
        ) : null}
      </main>
  );
}
