"use server";

import { createClient } from "@/lib/supabase/server";
import {
  buildAthleteInsights,
  parsePreferences,
  type AthleteInsights,
} from "@/lib/athlete";

/** Recompute derived athlete_insights from all sessions for the current user. */
export async function recomputeAthleteInsights(
  userId?: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = userId ?? user?.id;
  if (!uid) return { ok: false, message: "Inte inloggad." };
  if (user && userId && user.id !== userId) {
    return { ok: false, message: "Otillåtet." };
  }

  const { data: sessions, error } = await supabase
    .from("training_sessions")
    .select(
      "id, completed_at, score_text, feeling_1_5, rpe_1_10, workouts(title, pass_number), session_lifts(movement_name, weight_kg)"
    )
    .eq("user_id", uid)
    .order("completed_at", { ascending: false });

  if (error) return { ok: false, message: error.message };

  const insights = buildAthleteInsights(
    uid,
    (sessions ?? []).map((s) => ({
      ...s,
      workouts: Array.isArray(s.workouts) ? s.workouts[0] ?? null : s.workouts,
    })) as Parameters<typeof buildAthleteInsights>[1]
  );

  const { error: upsertErr } = await supabase.from("athlete_insights").upsert({
    user_id: insights.user_id,
    movement_best: insights.movement_best,
    recent_sessions: insights.recent_sessions,
    signals: insights.signals,
    rpe_avg_last_4: insights.rpe_avg_last_4,
    feeling_avg_last_4: insights.feeling_avg_last_4,
    total_sessions: insights.total_sessions,
    summary_sv: insights.summary_sv,
    updated_at: new Date().toISOString(),
  });

  if (upsertErr) return { ok: false, message: upsertErr.message };
  return { ok: true };
}

/** Load preferences + insights for programming (agents / future WOD generator). */
export async function loadAthleteContext(userId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = userId ?? user?.id;
  if (!uid) return null;

  const [{ data: profile }, { data: insights }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, equipment, preferences")
      .eq("id", uid)
      .maybeSingle(),
    supabase.from("athlete_insights").select("*").eq("user_id", uid).maybeSingle(),
  ]);

  return {
    userId: uid,
    display_name: profile?.display_name ?? null,
    equipment: profile?.equipment ?? null,
    preferences: parsePreferences(profile?.preferences),
    insights: insights as AthleteInsights | null,
  };
}
