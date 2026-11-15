import type { AthleteInsights, AthletePreferences } from "./athlete.ts";
import { EMPTY_PREFERENCES } from "./athlete.ts";
import { CROSSFIT_MOVEMENTS } from "./movements.ts";
import {
  resolveSessionLayout,
  SESSION_LAYOUTS,
  WARMUP_THEME_OPTIONS,
  type LayoutMovement,
  type LayoutSection,
  type SessionLayoutId,
  type WarmupTheme,
} from "./session-layout.ts";
import type { SectionKind } from "./types.ts";
import {
  expandSwedishNumbers,
  MOVEMENT_ALIASES,
  normalizeSpeech,
} from "./voice-log.ts";

export type WorkoutVoiceContext = {
  preferences?: AthletePreferences | null;
  insights?: AthleteInsights | null;
  knownMovements?: readonly string[];
};

export type PlannedSection = {
  kind: SectionKind;
  label: string;
  format_label: string;
  movements: LayoutMovement[];
};

export type ParsedWorkoutPlan = {
  recognized: boolean;
  transcript: string;
  layoutId: SessionLayoutId;
  warmupTheme: WarmupTheme;
  title: string;
  notes: string | null;
  sections: PlannedSection[];
};

const JUMP_ROPE = new Set([
  "double-under",
  "single-under",
  "double unders",
  "single unders",
]);

const TECHNIQUE_NAMES = new Set(
  [
    "Clean",
    "Clean and Jerk",
    "Clean and Push Jerk",
    "Cluster",
    "Hang Clean",
    "Hang Clean and Push Jerk",
    "Hang Power Clean",
    "Hang Power Snatch",
    "Hang Snatch",
    "Hang Squat Clean",
    "Hang Squat Snatch",
    "Muscle Snatch",
    "Overhead Squat",
    "Power Clean",
    "Power Clean and Split Jerk",
    "Power Snatch",
    "Snatch",
    "Snatch Balance",
    "Sots Press",
    "Split Clean",
    "Split Jerk",
    "Split Snatch",
    "Squat Clean",
    "Squat Snatch",
    "Handstand",
    "Handstand Push-up",
    "Handstand Walk",
    "Muscle-up",
    "Toes-to-bar",
    "Turkish Get-up",
    "Pistol",
  ].map((n) => n.toLowerCase())
);

const STRENGTH_NAMES = new Set(
  [
    "Front Squat",
    "Back Squat",
    "Deadlift",
    "Sumo Deadlift",
    "Bench Press",
    "Shoulder Press",
    "Push Press",
    "Push Jerk",
    "Good Morning",
    "Goblet Squat",
    "Dumbbell Front Squat",
    "Dumbbell Deadlift",
  ].map((n) => n.toLowerCase())
);

const DEFAULT_BY_KIND: Record<
  "technique" | "strength" | "metcon",
  LayoutMovement[]
> = {
  technique: [
    { name: "Hang Power Clean", detail: "2 × 6", suggested_weight_kg: null },
  ],
  strength: [
    { name: "Front Squat", detail: "3 × 4", suggested_weight_kg: null },
  ],
  metcon: [
    { name: "Push-up", detail: "10", suggested_weight_kg: null },
    { name: "Air Squat", detail: "15", suggested_weight_kg: null },
    { name: "Walking Lunge", detail: "12 steg", suggested_weight_kg: null },
  ],
};

const EMOM_DEFAULT: LayoutMovement[] = [
  { name: "Deadlift", detail: "udda min · 5", suggested_weight_kg: null },
  { name: "Push-up", detail: "jämn min · 8", suggested_weight_kg: null },
];

export function hasParsedWorkoutPlan(parsed: ParsedWorkoutPlan): boolean {
  return parsed.recognized;
}

export function formatWorkoutPlanSummary(parsed: ParsedWorkoutPlan): string {
  const parts = [parsed.title];
  const warmup = WARMUP_THEME_OPTIONS.find((o) => o.id === parsed.warmupTheme);
  if (warmup) parts.push(`warmup: ${warmup.label}`);
  for (const section of parsed.sections) {
    if (section.kind === "warmup") continue;
    const moves = section.movements
      .map((m) =>
        m.detail
          ? `${m.name} ${m.detail}`
          : m.suggested_weight_kg != null
            ? `${m.name} ${m.suggested_weight_kg} kg`
            : m.name
      )
      .join(", ");
    if (moves) parts.push(`${section.label}: ${moves}`);
  }
  return parts.join(" · ");
}

export function parseWorkoutUtterance(
  transcript: string,
  context: WorkoutVoiceContext = {}
): ParsedWorkoutPlan {
  const original = transcript.trim();
  const preferences = context.preferences ?? EMPTY_PREFERENCES;
  const known = context.knownMovements?.length
    ? context.knownMovements
    : [
        ...CROSSFIT_MOVEMENTS,
        ...preferences.fun_movements,
        ...Object.keys(context.insights?.movement_best ?? {}),
      ];

  let text = expandSwedishNumbers(normalizeSpeech(original));

  const noMetcon = Boolean(
    text.match(
      /\b(?:ingen|utan|inte)\s+(?:flas|metcon|wod|kondition|engine)\b/
    )
  );
  text = text.replace(
    /\b(?:ingen|utan|inte)\s+(?:flas|metcon|wod|kondition|engine)\b/g,
    " "
  );

  const wantsEmom = /\bemom\b|\be mom\b|\bevery minute\b/.test(text);
  const wantsSkill = /\b(?:teknik|skill)\b/.test(text);
  const wantsStrength =
    /\b(?:styrka|oly|olympisk[ta]?|tyngdlyft|weightlifting)\b/.test(text);
  const wantsWod =
    /\b(?:wod|metcon|flas|kondition|amrap|chipper|for time)\b/.test(text);

  const { names: spokenNames, rest } = extractSpokenMovements(text, known);
  void rest;

  const spokenKinds = spokenNames.map((name) => classifyMovement(name));
  const hasTechniqueMove = spokenKinds.includes("technique");
  const hasStrengthMove = spokenKinds.includes("strength");
  const hasMetconMove = spokenKinds.includes("metcon");

  const recognized =
    wantsEmom ||
    wantsSkill ||
    wantsStrength ||
    wantsWod ||
    noMetcon ||
    spokenNames.length > 0;

  const layoutId = pickLayout({
    wantsEmom,
    wantsSkill,
    wantsStrength,
    wantsWod,
    noMetcon,
    hasTechniqueMove,
    hasStrengthMove,
    hasMetconMove,
  });
  const warmupTheme = pickWarmup(layoutId, spokenNames, {
    wantsWod: wantsWod && !noMetcon,
    wantsEmom: wantsEmom && !noMetcon,
    wantsSkill,
  });

  const layout = resolveSessionLayout(layoutId, warmupTheme);
  const sections = fillSections(layout.sections, spokenNames, {
    preferences,
    insights: context.insights ?? null,
    layoutId,
  });

  return {
    recognized,
    transcript: original,
    layoutId,
    warmupTheme,
    title: SESSION_LAYOUTS[layoutId].label,
    notes: original ? `Röst: “${original}”` : null,
    sections: sections.map((s) => ({
      kind: s.kind,
      label: s.label,
      format_label: s.format_label,
      movements: s.movements,
    })),
  };
}

function pickLayout(flags: {
  wantsEmom: boolean;
  wantsSkill: boolean;
  wantsStrength: boolean;
  wantsWod: boolean;
  noMetcon: boolean;
  hasTechniqueMove: boolean;
  hasStrengthMove: boolean;
  hasMetconMove: boolean;
}): SessionLayoutId {
  const wod = flags.wantsWod && !flags.noMetcon;
  if (flags.wantsEmom && !flags.noMetcon) return "emom";
  if (flags.wantsSkill && flags.wantsStrength) {
    return wod ? "skill_wod" : "skill_strength";
  }
  if (flags.wantsSkill && wod) return "skill_wod";
  if (flags.wantsStrength && wod) return "strength_wod";
  if (flags.wantsSkill) return "skill";
  if (flags.wantsStrength) return "weightlifting";
  if (wod) return "wod";
  if (flags.wantsEmom) return "emom";

  if (flags.hasTechniqueMove && flags.hasStrengthMove) return "skill_strength";
  if (flags.hasTechniqueMove && flags.hasMetconMove && !flags.noMetcon) {
    return "skill_wod";
  }
  if (flags.hasStrengthMove && flags.hasMetconMove && !flags.noMetcon) {
    return "strength_wod";
  }
  if (flags.hasTechniqueMove) return "skill";
  if (flags.hasStrengthMove) return "weightlifting";
  if (flags.hasMetconMove && !flags.noMetcon) return "wod";
  if (flags.noMetcon) return "weightlifting";
  return "weightlifting";
}

function pickWarmup(
  layoutId: SessionLayoutId,
  spokenNames: string[],
  hints: { wantsWod: boolean; wantsEmom: boolean; wantsSkill: boolean }
): WarmupTheme {
  const joined = spokenNames.map((n) => n.toLowerCase()).join(" ");
  if (/\bsnatch\b/.test(joined)) return "snatch";
  if (/\bclean\b/.test(joined)) return "clean";
  if (/\bdeadlift\b/.test(joined)) return "hinge";
  if (hints.wantsWod || hints.wantsEmom || layoutId === "wod" || layoutId === "emom") {
    return "engine";
  }
  return SESSION_LAYOUTS[layoutId].defaultWarmup;
}

function fillSections(
  sections: LayoutSection[],
  spokenNames: string[],
  ctx: {
    preferences: AthletePreferences;
    insights: AthleteInsights | null;
    layoutId: SessionLayoutId;
  }
): LayoutSection[] {
  const working = sections.filter((s) => s.kind !== "warmup");
  const assigned = new Map<SectionKind, LayoutMovement[]>();
  for (const name of spokenNames) {
    const kind = classifyMovement(name);
    const target = pickSectionForMovement(kind, working);
    if (!target) continue;
    const list = assigned.get(target.kind) ?? [];
    list.push(prescribe(name, target.kind, ctx));
    assigned.set(target.kind, list);
  }

  return sections.map((section) => {
    if (section.kind === "warmup") return section;
    const spoken = assigned.get(section.kind);
    if (spoken && spoken.length) {
      return { ...section, movements: spoken };
    }
    return {
      ...section,
      movements: defaultMovementsFor(section.kind, ctx).map((m) =>
        prescribe(m.name, section.kind, ctx, m.detail)
      ),
    };
  });
}

function pickSectionForMovement(
  kind: "technique" | "strength" | "metcon",
  working: LayoutSection[]
): LayoutSection | null {
  const exact = working.find((s) => s.kind === kind);
  if (exact) return exact;
  if (kind === "technique") {
    return working.find((s) => s.kind === "strength") ?? working[0] ?? null;
  }
  if (kind === "strength") {
    return working.find((s) => s.kind === "technique") ?? working[0] ?? null;
  }
  return working.find((s) => s.kind === "metcon") ?? working.at(-1) ?? null;
}

function defaultMovementsFor(
  kind: SectionKind,
  ctx: {
    preferences: AthletePreferences;
    insights: AthleteInsights | null;
    layoutId: SessionLayoutId;
  }
): LayoutMovement[] {
  const fromFun = ctx.preferences.fun_movements
    .map((name) => name.trim())
    .filter(Boolean)
    .filter((name) => classifyMovement(name) === kind || kind === "metcon")
    .filter((name) => allowedMovement(name, ctx.preferences));

  if (kind === "metcon" && ctx.layoutId === "emom") {
    const pool = fromFun.length ? fromFun.slice(0, 2) : EMOM_DEFAULT.map((m) => m.name);
    if (pool.length === 1) {
      return [
        { name: pool[0], detail: "udda min · 5", suggested_weight_kg: null },
        {
          name: "Push-up",
          detail: "jämn min · 8",
          suggested_weight_kg: null,
        },
      ].filter((m) => allowedMovement(m.name, ctx.preferences));
    }
    if (fromFun.length >= 2) {
      return [
        { name: pool[0], detail: "udda min · 5", suggested_weight_kg: null },
        { name: pool[1], detail: "jämn min · 8", suggested_weight_kg: null },
      ];
    }
    return EMOM_DEFAULT.filter((m) => allowedMovement(m.name, ctx.preferences));
  }

  if (kind === "technique" || kind === "strength" || kind === "metcon") {
    if (kind === "metcon" && fromFun.length) {
      const metconish = fromFun.filter((n) => classifyMovement(n) === "metcon");
      const pool = (metconish.length ? metconish : fromFun).slice(0, 3);
      return pool.map((name, i) => ({
        name,
        detail: String(8 + i * 4),
        suggested_weight_kg: null,
      }));
    }
    if (fromFun.length && (kind === "technique" || kind === "strength")) {
      const name = fromFun.find((n) => classifyMovement(n) === kind) ?? fromFun[0];
      const detail = kind === "technique" ? "2 × 6" : "3 × 4";
      return [{ name, detail, suggested_weight_kg: null }];
    }
    const fallback = DEFAULT_BY_KIND[kind].filter((m) =>
      allowedMovement(m.name, ctx.preferences)
    );
    if (fallback.length) return fallback;
    if (kind === "metcon") {
      return [{ name: "Air Squat", detail: "15", suggested_weight_kg: null }];
    }
    if (kind === "strength") {
      return [{ name: "Air Squat", detail: "10 × 3", suggested_weight_kg: null }];
    }
    return [{ name: "Hang Power Clean", detail: "2 × 6", suggested_weight_kg: null }];
  }
  return [];
}

function prescribe(
  name: string,
  kind: SectionKind,
  ctx: { preferences: AthletePreferences; insights: AthleteInsights | null },
  detail?: string | null
): LayoutMovement {
  const fallback =
    kind === "technique" ? "2 × 6" : kind === "strength" ? "3 × 4" : detail ?? "10";
  return {
    name,
    detail: detail ?? fallback,
    suggested_weight_kg: suggestedKg(name, kind, ctx.insights),
  };
}

function suggestedKg(
  name: string,
  kind: SectionKind,
  insights: AthleteInsights | null
): number | null {
  const best = insights?.movement_best?.[name]?.weight_kg;
  if (best == null || !Number.isFinite(best) || best <= 0) return null;
  const pct = kind === "strength" ? 0.7 : kind === "technique" ? 0.55 : 0.45;
  return Math.max(5, Math.round((best * pct) / 5) * 5);
}

function classifyMovement(name: string): "technique" | "strength" | "metcon" {
  const key = name.trim().toLowerCase();
  if (TECHNIQUE_NAMES.has(key) || /\b(snatch|clean|jerk|muscle-up|handstand)\b/.test(key)) {
    if (key.includes("thruster")) return "metcon";
    return "technique";
  }
  if (STRENGTH_NAMES.has(key)) return "strength";
  return "metcon";
}

function allowedMovement(name: string, preferences: AthletePreferences): boolean {
  const key = name.trim().toLowerCase();
  if (JUMP_ROPE.has(key)) return false;
  if (preferences.constraints.includes("no_jump_rope") && JUMP_ROPE.has(key)) {
    return false;
  }
  const avoided = preferences.avoid_movements.map((n) => n.trim().toLowerCase());
  if (avoided.includes(key)) return false;
  if (preferences.constraints.includes("knee_sensitive")) {
    if (/pistol|box jump|walking lunge|burpee box/.test(key)) return false;
  }
  if (preferences.constraints.includes("shoulder_sensitive")) {
    if (/handstand|snatch|jerk/.test(key)) return false;
  }
  if (preferences.constraints.includes("back_sensitive")) {
    if (/deadlift|good morning/.test(key)) return false;
  }
  return true;
}

function extractSpokenMovements(
  text: string,
  knownMovements: readonly string[]
): { names: string[]; rest: string } {
  const candidates = buildCandidates(knownMovements);
  let rest = ` ${text} `;
  const names: string[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const pattern = escapeRegExp(candidate.pattern);
    const re = new RegExp(`(?:^| )(${pattern})(?= |$)`);
    const match = rest.match(re);
    if (!match) continue;
    const key = candidate.name.toLowerCase();
    rest = rest.replace(match[0], " ");
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(candidate.name);
  }

  return { names, rest: rest.replace(/\s+/g, " ").trim() };
}

type Candidate = { name: string; pattern: string };

function buildCandidates(knownMovements: readonly string[]): Candidate[] {
  const byKey = new Map<string, Candidate>();
  for (const name of knownMovements) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    addCandidate(byKey, trimmed, trimmed);
    for (const alias of MOVEMENT_ALIASES[trimmed] ?? []) {
      addCandidate(byKey, trimmed, alias);
    }
  }
  for (const [name, aliases] of Object.entries(MOVEMENT_ALIASES)) {
    addCandidate(byKey, name, name);
    for (const alias of aliases) addCandidate(byKey, name, alias);
  }
  return [...byKey.values()].sort(
    (a, b) => b.pattern.length - a.pattern.length || a.name.localeCompare(b.name)
  );
}

function addCandidate(
  byKey: Map<string, Candidate>,
  name: string,
  rawPattern: string
) {
  const pattern = normalizeSpeech(rawPattern);
  if (!pattern) return;
  const key = `${name.toLowerCase()}|${pattern}`;
  if (byKey.has(key)) return;
  byKey.set(key, { name, pattern });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
