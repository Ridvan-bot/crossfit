/**
 * Passupplägg: varierad uppvärmning, varierande arbetspass.
 *
 * CrossFit.com och HQ-programmering kör inte teknik + styrka + metcon varje dag.
 * Dagen har en prioritet (tungt lyft, skill, eller ett WOD). Tvådelat (lyft + WOD)
 * används ibland, inte som standardmall.
 *
 * Uppvärmning: flera teman (inte samma varje pass). Mall från CrossFit Journal
 * 2003 / "The CrossFit Warm-Up" (Rochet, 2025) — skala till hemmautrustning,
 * ingen hopprep. Specifik förberedelse av dagens tunga lyft hör fortfarande
 * hemma i arbetspasset.
 *
 * Källor:
 * - Glassman, "A Theoretical Template for CrossFit’s Programming"
 * - CrossFit.com, "The CrossFit Warm-Up"
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

function warmup(
  format_label: string,
  coaching_tip: string,
  movements: LayoutMovement[],
  minutes = 8
): LayoutSection {
  return {
    kind: "warmup",
    label: "Warmup",
    format_label,
    estimated_minutes_min: minutes,
    estimated_minutes_max: minutes,
    coaching_tip,
    timer_preset_sec: null,
    movements,
  };
}

/**
 * Teman inspirerade av CrossFit.com warmup-flow + box-varianter.
 * Ingen hopprep. Sit-ups undviks (Hollow Rock i stället).
 */
export const WARMUPS = {
  general: warmup(
    "WARMUP · TAR CA 8 MIN · TOM STÅNG",
    "Lugn. Ingen hopprep. Tom stång — dagens tunga lyft byggs i arbetspasset.",
    [
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
    ]
  ),
  classic: warmup(
    "WARMUP · 3 VARV · CLASSIC CF",
    "Skalad CrossFit Journal-warmup (2003): stretch, squat, core, hinge, press. Ingen hopprep, inga sit-ups, ingen rig. Lugn — inte ett WOD.",
    [
      { name: "Samson Stretch", detail: "15 sek / ben, varje varv", suggested_weight_kg: null },
      { name: "Overhead Squat", detail: "10 tom stång / varv", suggested_weight_kg: null },
      { name: "Hollow Rock", detail: "10 / varv", suggested_weight_kg: null },
      { name: "Good Morning", detail: "10 tom stång / varv", suggested_weight_kg: null },
      { name: "Push-up", detail: "8 / varv", suggested_weight_kg: null },
    ],
    10
  ),
  clean: warmup(
    "WARMUP · TAR CA 8 MIN · FRONT-RACK",
    "Clean-dag. Ingen hopprep. Öppna handleder och höfter innan stången blir tung.",
    [
      { name: "Air Squat", detail: "10 × 2", suggested_weight_kg: null },
      {
        name: "Walking Lunge",
        detail: "8 / ben, armar i front-rack (tomt)",
        suggested_weight_kg: null,
      },
      {
        name: "Tom stång",
        detail: "5 Deadlift + 5 Hang Power Clean + 5 Front Squat",
        suggested_weight_kg: null,
      },
    ]
  ),
  snatch: warmup(
    "WARMUP · TAR CA 8 MIN · OVERHEAD",
    "Snatch-dag. Ingen hopprep. Lås ut armbågarna och håll stången över mitten av foten.",
    [
      { name: "Inchworm", detail: "5", suggested_weight_kg: null },
      { name: "Good Morning", detail: "8 tom stång, snatch-grepp", suggested_weight_kg: null },
      {
        name: "Tom stång",
        detail: "5 Hang Power Snatch + 5 Overhead Squat + 5 Sots Press",
        suggested_weight_kg: null,
      },
    ]
  ),
  hinge: warmup(
    "WARMUP · TAR CA 8 MIN · HINGE",
    "Deadlift-/posterior-kedja. Ingen hopprep. Neutral rygg före varje drag.",
    [
      { name: "Good Morning", detail: "8 × 2 tom stång", suggested_weight_kg: null },
      { name: "Air Squat", detail: "10", suggested_weight_kg: null },
      {
        name: "Tom stång",
        detail: "5 Deadlift + 5 Sumo Deadlift + 5 Hang Power Clean",
        suggested_weight_kg: null,
      },
    ]
  ),
  engine: warmup(
    "WARMUP · 2 VARV · ENGINE",
    "WOD-dag. Ingen hopprep. Höj pulsen utan att trötta ut — sen 1–2 lätta set av dagens rörelser.",
    [
      { name: "Rask marsch", detail: "90 sek / varv", suggested_weight_kg: null },
      { name: "Bear Crawl", detail: "8 steg fram + 8 bak / varv", suggested_weight_kg: null },
      { name: "Air Squat", detail: "10 / varv", suggested_weight_kg: null },
      { name: "Inchworm + Push-up", detail: "4 / varv", suggested_weight_kg: null },
    ]
  ),
} as const satisfies Record<string, LayoutSection>;

export type WarmupTheme = keyof typeof WARMUPS;

export const WARMUP_THEME_OPTIONS: {
  id: WarmupTheme;
  label: string;
  hint: string;
}[] = [
  { id: "general", label: "Tom stång", hint: "Allmän barbell-complex." },
  { id: "classic", label: "Classic CF", hint: "3 varv Journal-warmup, skalad hemma." },
  { id: "clean", label: "Clean / front-rack", hint: "Höfter, handleder, rack." },
  { id: "snatch", label: "Snatch / overhead", hint: "Inchworm, OHS, Sots Press." },
  { id: "hinge", label: "Hinge / deadlift", hint: "Good Morning + drag." },
  { id: "engine", label: "Engine / WOD", hint: "Marsch, Bear Crawl, Air Squat." },
];

export const DEFAULT_WARMUP_THEME: WarmupTheme = "general";

/** Bakåtkompatibelt alias — samma som general. */
export const STANDARD_WARMUP: LayoutSection = WARMUPS.general;
export const STANDARD_WARMUP_MOVEMENTS: LayoutMovement[] =
  WARMUPS.general.movements;

export function resolveWarmup(theme: string | null | undefined): LayoutSection {
  if (theme && theme in WARMUPS) {
    return WARMUPS[theme as WarmupTheme];
  }
  return WARMUPS[DEFAULT_WARMUP_THEME];
}

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
    defaultWarmup: "general" as WarmupTheme,
    sections: [
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
    defaultWarmup: "classic" as WarmupTheme,
    sections: [
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
    defaultWarmup: "engine" as WarmupTheme,
    sections: [
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
    defaultWarmup: "engine" as WarmupTheme,
    sections: [
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
    defaultWarmup: "clean" as WarmupTheme,
    sections: [
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
    defaultWarmup: "hinge" as WarmupTheme,
    sections: [
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
    hint: "Välj uppvärmning. Lägg till dagens del själv.",
    defaultWarmup: "general" as WarmupTheme,
    sections: [] as LayoutSection[],
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

export function resolveSessionLayout(
  id: string | null | undefined,
  warmupTheme?: string | null
) {
  const layout =
    id && id in SESSION_LAYOUTS
      ? SESSION_LAYOUTS[id as SessionLayoutId]
      : SESSION_LAYOUTS[DEFAULT_SESSION_LAYOUT];
  const warmup = resolveWarmup(
    warmupTheme || layout.defaultWarmup || DEFAULT_WARMUP_THEME
  );
  return {
    ...layout,
    sections: [warmup, ...layout.sections],
  };
}

/** Tavlan startar på första arbetspasset, inte på warmup. */
export function firstWorkingSectionIndex(
  sections: Pick<WorkoutSection, "kind">[]
): number {
  const i = sections.findIndex((s) => s.kind !== "warmup");
  return i >= 0 ? i : 0;
}
