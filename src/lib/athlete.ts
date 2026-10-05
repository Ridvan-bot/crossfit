/**
 * Athlete learning layer.
 *
 * - preferences: user-declared (profile.preferences)
 * - insights: derived from training_sessions + session_lifts (athlete_insights)
 *
 * Used when programming WODs and on dashboard. Recompute after every logged session.
 */

export type AthleteExperience = "beginner" | "intermediate" | "advanced";

export type AthletePreferences = {
  /** e.g. olympic_lifts, strength, gymnastics, engine */
  focus: string[];
  sessions_per_week: number | null;
  /** Official CrossFit movement names the athlete enjoys */
  fun_movements: string[];
  /** Movements to avoid or minimize */
  avoid_movements: string[];
  /** e.g. no_jump_rope, limited_plates, knee_sensitive */
  constraints: string[];
  experience: AthleteExperience | null;
  /** Free-text coaching notes from athlete */
  notes: string | null;
};

export const EMPTY_PREFERENCES: AthletePreferences = {
  focus: [],
  sessions_per_week: null,
  fun_movements: [],
  avoid_movements: [],
  constraints: [],
  experience: null,
  notes: null,
};

export const FOCUS_OPTIONS: { value: string; label: string }[] = [
  { value: "olympic_lifts", label: "Olympiska lyft" },
  { value: "strength", label: "Styrka" },
  { value: "gymnastics", label: "Gymnastik" },
  { value: "engine", label: "Kondition / engine" },
  { value: "technique", label: "Teknik först" },
];

export const CONSTRAINT_OPTIONS: { value: string; label: string }[] = [
  { value: "no_jump_rope", label: "Ingen hopprep" },
  { value: "limited_plates", label: "Begränsade viktskivor (inga 2,5 kg)" },
  { value: "home_gym", label: "Hemma / begränsad box" },
  { value: "one_dumbbell", label: "Bara 1 dumbbell (inte par)" },
  { value: "knee_sensitive", label: "Känsliga knän" },
  { value: "shoulder_sensitive", label: "Känsliga axlar" },
  { value: "back_sensitive", label: "Känslig rygg" },
];

export type MovementBest = {
  weight_kg: number;
  completed_at: string;
  session_id: string;
};

export type RecentSessionSignal = {
  session_id: string;
  workout_title: string | null;
  pass_number: number | null;
  completed_at: string;
  score_text: string | null;
  feeling_1_5: number | null;
  rpe_1_10: number | null;
};

export type AthleteSignals = {
  high_rpe_streak?: boolean;
  low_feeling_streak?: boolean;
  progressing_lifts?: string[];
  needs_deload_hint?: boolean;
};

export type AthleteInsights = {
  user_id: string;
  movement_best: Record<string, MovementBest>;
  recent_sessions: RecentSessionSignal[];
  signals: AthleteSignals;
  rpe_avg_last_4: number | null;
  feeling_avg_last_4: number | null;
  total_sessions: number;
  summary_sv: string | null;
  updated_at: string;
};

export function parsePreferences(raw: unknown): AthletePreferences {
  if (!raw || typeof raw !== "object") return { ...EMPTY_PREFERENCES };
  const o = raw as Record<string, unknown>;
  const experience =
    o.experience === "beginner" ||
    o.experience === "intermediate" ||
    o.experience === "advanced"
      ? o.experience
      : null;
  return {
    focus: Array.isArray(o.focus) ? o.focus.map(String) : [],
    sessions_per_week:
      typeof o.sessions_per_week === "number" ? o.sessions_per_week : null,
    fun_movements: Array.isArray(o.fun_movements)
      ? o.fun_movements.map(String)
      : [],
    avoid_movements: Array.isArray(o.avoid_movements)
      ? o.avoid_movements.map(String)
      : [],
    constraints: Array.isArray(o.constraints) ? o.constraints.map(String) : [],
    experience,
    notes: typeof o.notes === "string" ? o.notes : null,
  };
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

type SessionRow = {
  id: string;
  completed_at: string;
  score_text: string | null;
  feeling_1_5: number | null;
  rpe_1_10: number | null;
  workouts: { title: string; pass_number: number | null } | null;
  session_lifts: { movement_name: string; weight_kg: number | null }[] | null;
};

/** Build insights payload from session history (newest first). */
export function buildAthleteInsights(
  userId: string,
  sessions: SessionRow[]
): Omit<AthleteInsights, "updated_at"> {
  const movement_best: Record<string, MovementBest> = {};
  for (const s of sessions) {
    for (const lift of s.session_lifts ?? []) {
      if (lift.weight_kg == null || Number.isNaN(lift.weight_kg)) continue;
      const name = lift.movement_name.trim();
      if (!name) continue;
      const prev = movement_best[name];
      if (!prev || lift.weight_kg > prev.weight_kg) {
        movement_best[name] = {
          weight_kg: lift.weight_kg,
          completed_at: s.completed_at,
          session_id: s.id,
        };
      }
    }
  }

  const recent_sessions: RecentSessionSignal[] = sessions.slice(0, 5).map((s) => ({
    session_id: s.id,
    workout_title: s.workouts?.title ?? null,
    pass_number: s.workouts?.pass_number ?? null,
    completed_at: s.completed_at,
    score_text: s.score_text,
    feeling_1_5: s.feeling_1_5,
    rpe_1_10: s.rpe_1_10,
  }));

  const last4 = sessions.slice(0, 4);
  const rpe_avg_last_4 = avg(
    last4.map((s) => s.rpe_1_10).filter((n): n is number => n != null)
  );
  const feeling_avg_last_4 = avg(
    last4.map((s) => s.feeling_1_5).filter((n): n is number => n != null)
  );

  const last3Rpe = sessions
    .slice(0, 3)
    .map((s) => s.rpe_1_10)
    .filter((n): n is number => n != null);
  const last3Feeling = sessions
    .slice(0, 3)
    .map((s) => s.feeling_1_5)
    .filter((n): n is number => n != null);

  const signals: AthleteSignals = {
    high_rpe_streak:
      last3Rpe.length >= 3 && last3Rpe.every((r) => r >= 8) ? true : undefined,
    low_feeling_streak:
      last3Feeling.length >= 3 && last3Feeling.every((f) => f <= 2)
        ? true
        : undefined,
    needs_deload_hint:
      last3Rpe.length >= 3 && last3Rpe.every((r) => r >= 8) ? true : undefined,
  };

  const progressing_lifts: string[] = [];
  // Simple: if we have at least 2 sessions with same lift increasing — skip complex for v1
  Object.keys(movement_best)
    .slice(0, 5)
    .forEach((name) => progressing_lifts.push(name));
  if (progressing_lifts.length) signals.progressing_lifts = progressing_lifts;

  const summary_sv = buildSummarySv({
    total: sessions.length,
    movement_best,
    rpe_avg_last_4,
    feeling_avg_last_4,
    signals,
    recent_sessions,
  });

  return {
    user_id: userId,
    movement_best,
    recent_sessions,
    signals,
    rpe_avg_last_4,
    feeling_avg_last_4,
    total_sessions: sessions.length,
    summary_sv,
  };
}

function buildSummarySv(input: {
  total: number;
  movement_best: Record<string, MovementBest>;
  rpe_avg_last_4: number | null;
  feeling_avg_last_4: number | null;
  signals: AthleteSignals;
  recent_sessions: RecentSessionSignal[];
}): string {
  if (input.total === 0) {
    return "Ingen session loggad ännu. Efter första passen byggs en personlig bild av vikter, RPE och preferenser.";
  }

  const parts: string[] = [];
  parts.push(`${input.total} loggade pass.`);

  if (input.rpe_avg_last_4 != null) {
    parts.push(`Snitt-RPE senaste passen: ${input.rpe_avg_last_4}/10.`);
  }
  if (input.feeling_avg_last_4 != null) {
    parts.push(`Snitt-känsla: ${input.feeling_avg_last_4}/5.`);
  }

  const topLifts = Object.entries(input.movement_best)
    .sort((a, b) => b[1].weight_kg - a[1].weight_kg)
    .slice(0, 4)
    .map(([name, v]) => `${name} ${v.weight_kg} kg`);
  if (topLifts.length) {
    parts.push(`Bästa loggade lyft: ${topLifts.join(", ")}.`);
  }

  if (input.signals.needs_deload_hint) {
    parts.push("Hög RPE flera pass i rad — överväg lättare vecka eller mer teknikfokus.");
  }
  if (input.signals.low_feeling_streak) {
    parts.push("Låg känsla flera pass — prioritera återhämtning och roliga rörelser.");
  }

  const last = input.recent_sessions[0];
  if (last?.score_text) {
    parts.push(`Senaste score: ${last.score_text}.`);
  }

  return parts.join(" ");
}

/** Suggested next weight: last best + small bump, or same if high RPE. */
export function suggestWeightKg(
  insights: Pick<AthleteInsights, "movement_best" | "rpe_avg_last_4"> | null,
  movementName: string,
  fallback: number | null = null
): number | null {
  const best = insights?.movement_best?.[movementName]?.weight_kg;
  if (best == null) return fallback;
  if (insights?.rpe_avg_last_4 != null && insights.rpe_avg_last_4 >= 8.5) {
    return best;
  }
  // 5 kg jumps (no 2.5 plates assumed common)
  return best + 5;
}
