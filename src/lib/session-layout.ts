/**
 * Passupplägg: samma uppvärmning varje gång, varierande arbetspass.
 *
 * CrossFit.com och HQ-programmering kör inte teknik + styrka + metcon varje dag.
 * Dagen har en prioritet (tungt lyft, skill, eller ett WOD). Tvådelat (lyft + WOD)
 * används ibland, inte som standardmall.
 *
 * Källor:
 * - Glassman, "A Theoretical Template for CrossFit’s Programming"
 * - CrossFit.com, "Ask a Coach: strength then met-con"
 * - CrossFit.com, "What to Expect From a Class"
 */

import type { SectionKind, WorkoutSection } from "@/lib/types";

export type LayoutMovement = {
  name: string;
  detail: string | null;
  suggested_weight_kg: number | null;
};

export type LayoutSection = {
  kind: SectionKind;
  label: string;
  format_label: string;
  estimated_minutes_min: number;
  estimated_minutes_max: number;
  coaching_tip: string | null;
  timer_preset_sec: number | null;
  movements: LayoutMovement[];
};

export const STANDARD_WARMUP_MOVEMENTS: LayoutMovement[] = [
  { name: "Air Squat", detail: "10 × 2", suggested_weight_kg: null },
  {
    name: "Mobilitet",
    detail: "Höfter / axlar / handleder / anklar",
    suggested_weight_kg: null,
  },
  {
    name: "Tom stång",
    detail:
      "5 Deadlift + 5 Hang Power Clean + 5 Front Squat + 5 Shoulder Press",
    suggested_weight_kg: null,
  },
];

export const STANDARD_WARMUP: LayoutSection = {
  kind: "warmup",
  label: "Warmup",
  format_label: "WARMUP · TAR CA 8 MIN · ALLTID SAMMA",
  estimated_minutes_min: 8,
  estimated_minutes_max: 8,
  coaching_tip:
    "Samma uppvärmning varje pass. Ingen hopprep. Lugn. Dagens rörelse byggs i arbetspasset, inte här.",
  timer_preset_sec: null,
  movements: STANDARD_WARMUP_MOVEMENTS,
};

function working(
  partial: Omit<LayoutSection, "movements"> & { movements?: LayoutMovement[] }
): LayoutSection {
  return { movements: [], ...partial };
}

export const SESSION_LAYOUTS = {
  weightlifting: {
    id: "weightlifting",
    label: "Styrka / Oly",
    hint: "Tunga lyft eller olympiskt arbete. Ingen metcon.",
    sections: [
      STANDARD_WARMUP,
      working({
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · VILA UT · INGEN KLOCKA:",
        estimated_minutes_min: 20,
        estimated_minutes_max: 25,
        coaching_tip:
          "Dagens prioritet är lyftet. Långa vilor. Bygg upp till arbetsserier.",
        timer_preset_sec: null,
      }),
    ],
  },
  skill: {
    id: "skill",
    label: "Teknik",
    hint: "Skill-arbete, ingen klocka och ingen metcon.",
    sections: [
      STANDARD_WARMUP,
      working({
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15–20 MIN · VILA UT:",
        estimated_minutes_min: 15,
        estimated_minutes_max: 20,
        coaching_tip:
          "Kvalitet före vikt. Vila tills tekniken sitter. Ingen klocka.",
        timer_preset_sec: null,
      }),
    ],
  },
  wod: {
    id: "wod",
    label: "WOD",
    hint: "Ett metcon är hela passet (For Time, AMRAP, chipper…).",
    sections: [
      STANDARD_WARMUP,
      working({
        kind: "metcon",
        label: "WOD",
        format_label: "FOR TIME · 3 ROUNDS · MAX 10 MIN:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip:
          "WOD:en är passet. 2 lätta set av dagens rörelser efter warmup, sen klocka.",
        timer_preset_sec: 600,
      }),
    ],
  },
  emom: {
    id: "emom",
    label: "EMOM",
    hint: "Uppvärmning + EMOM som enda arbetspass.",
    sections: [
      STANDARD_WARMUP,
      working({
        kind: "metcon",
        label: "EMOM",
        format_label: "EMOM 12 MIN · 1 RÖRELSE / MIN",
        estimated_minutes_min: 12,
        estimated_minutes_max: 12,
        coaching_tip:
          "Arbete ca 30–40 sek, vila resten av minuten. Släpp inte tekniken.",
        timer_preset_sec: 720,
      }),
    ],
  },
  skill_wod: {
    id: "skill_wod",
    label: "Teknik + WOD",
    hint: "Kort skill, sen ett metcon. Inte varje vecka.",
    sections: [
      STANDARD_WARMUP,
      working({
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 10 MIN · VILA UT:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Kort skill som följer med in i WOD:en.",
        timer_preset_sec: null,
      }),
      working({
        kind: "metcon",
        label: "WOD",
        format_label: "FOR TIME · 3 ROUNDS · MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        coaching_tip: "Samma rörelsetema som tekniken.",
        timer_preset_sec: 480,
      }),
    ],
  },
  strength_wod: {
    id: "strength_wod",
    label: "Styrka + WOD",
    hint: "Tungt lyft, sen kort metcon. Inte varje vecka.",
    sections: [
      STANDARD_WARMUP,
      working({
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · VILA UT:",
        estimated_minutes_min: 12,
        estimated_minutes_max: 15,
        coaching_tip: "Huvudlyftet först. Spara inte energi till WOD:en — vila ut.",
        timer_preset_sec: null,
      }),
      working({
        kind: "metcon",
        label: "WOD",
        format_label: "FOR TIME · CHIPPER · MAX 10 MIN:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Kortare WOD efter tungt lyft. Logga tid.",
        timer_preset_sec: 600,
      }),
    ],
  },
  empty: {
    id: "empty",
    label: "Bara warmup",
    hint: "Standarduppvärmning infogas. Lägg till dagens del själv.",
    sections: [STANDARD_WARMUP],
  },
} as const;

export type SessionLayoutId = keyof typeof SESSION_LAYOUTS;

export const SESSION_LAYOUT_OPTIONS: {
  id: SessionLayoutId;
  label: string;
  hint: string;
}[] = (
  [
    "weightlifting",
    "skill",
    "wod",
    "emom",
    "skill_wod",
    "strength_wod",
    "empty",
  ] as const
).map((id) => ({
  id,
  label: SESSION_LAYOUTS[id].label,
  hint: SESSION_LAYOUTS[id].hint,
}));

export const DEFAULT_SESSION_LAYOUT: SessionLayoutId = "weightlifting";

export function resolveSessionLayout(id: string | null | undefined) {
  if (id && id in SESSION_LAYOUTS) {
    return SESSION_LAYOUTS[id as SessionLayoutId];
  }
  return SESSION_LAYOUTS[DEFAULT_SESSION_LAYOUT];
}

/** Tavlan startar på första arbetspasset, inte på warmup. */
export function firstWorkingSectionIndex(
  sections: Pick<WorkoutSection, "kind">[]
): number {
  const i = sections.findIndex((s) => s.kind !== "warmup");
  return i >= 0 ? i : 0;
}
