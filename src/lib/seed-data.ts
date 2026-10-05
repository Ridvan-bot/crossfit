/** Seed payload mirroring docs/training-log.md (pass #001–#012 (block 3 = #008–#011)). */

export type SeedMovement = {
  name: string;
  detail?: string;
  suggested_weight_kg?: number | null;
};

export type SeedSection = {
  kind: "warmup" | "technique" | "strength" | "metcon" | "other";
  label: string;
  format_label?: string;
  estimated_minutes_min?: number;
  estimated_minutes_max?: number;
  coaching_tip?: string;
  timer_preset_sec?: number | null;
  movements: SeedMovement[];
};

export type SeedWorkout = {
  title: string;
  pass_number: number;
  scheduled_date: string | null;
  status: "planned" | "done";
  equipment_notes?: string;
  notes?: string;
  sections: SeedSection[];
  session?: {
    score_text: string;
    feeling_1_5: number;
    rpe_1_10: number;
    notes?: string;
    lifts: { movement_name: string; weight_kg: number }[];
  };
};

export const SEED_TEMPLATES = [
  {
    name: "Olympic Foundation - Clean Day",
    workout_type: "AMRAP",
    notes: "Teknik clean + Front Squat + kort AMRAP",
  },
  {
    name: "Olympic Foundation - Snatch Day",
    workout_type: "For Time",
    notes: "Teknik snatch + Deadlift/Push Press + For Time",
  },
];

export const SEED_GOALS = [
  {
    title: "Stabil teknik i Power Clean och Hang Power Clean",
    deadline: "2026-09-30",
    status: "ongoing" as const,
    current_level: "Nybörjarnivå",
    notes: "Fokus på timing, rackposition och fotarbete",
  },
  {
    title: "Stabil teknik i Power Snatch och Hang Power Snatch",
    deadline: "2026-12-31",
    status: "ongoing" as const,
    current_level: "Nybörjarnivå",
    notes: "Fokus på overhead-position och dragbana",
  },
  {
    title: "1RM Deadlift med bra teknik (100 kg)",
    deadline: "2026-12-31",
    status: "planned" as const,
    current_level: "Okänd",
    notes: "Startvärde sätts i kommande pass",
  },
];

export const SEED_WORKOUTS: SeedWorkout[] = [
  {
    title: "Pass #001",
    pass_number: 1,
    scheduled_date: "2026-04-01",
    status: "done",
    equipment_notes: "Stång · DB 15 kg · AbMat · Hopprep",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        movements: [
          { name: "Hopprep", detail: "3–5 min lugnt" },
          { name: "Dynamisk mobilitet", detail: "Höfter/anklar/skuldror" },
          { name: "Uppvärmningsset", detail: "2 set HPC + Front Squat" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 15,
        movements: [
          { name: "Hang Power Clean", detail: "2 × 6", suggested_weight_kg: 30 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 15 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 15,
        movements: [
          { name: "Front Squat", detail: "5 × 3", suggested_weight_kg: 30 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "AMRAP 10 MIN · SÅ MÅNGA VARV DU HINNER:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        timer_preset_sec: 600,
        coaching_tip: "10 min AMRAP",
        movements: [
          { name: "Power Clean", detail: "6", suggested_weight_kg: 30 },
          { name: "Dumbbell Snatch", detail: "10 växelvis", suggested_weight_kg: 15 },
          { name: "AbMat Sit-up", detail: "12" },
          { name: "Double-unders", detail: "20" },
        ],
      },
    ],
    session: {
      score_text: "4 hela varv + 6 Power Clean (30 kg)",
      feeling_1_5: 2,
      rpe_1_10: 9,
      notes: "Väldigt trött efter 2 varv, särskilt double-unders.",
      lifts: [
        { movement_name: "Hang Power Clean", weight_kg: 30 },
        { movement_name: "Front Squat", weight_kg: 30 },
        { movement_name: "Power Clean", weight_kg: 30 },
      ],
    },
  },
  {
    title: "Pass #002",
    pass_number: 2,
    scheduled_date: "2026-04-08",
    status: "done",
    equipment_notes: "Stång · Hopprep",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        movements: [
          { name: "Hopprep", detail: "3–5 min" },
          { name: "Mobilitet", detail: "Höfter/axlar/anklar" },
          { name: "Uppvärmningsset", detail: "2 set HPS + Push Press" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 15,
        movements: [
          { name: "Hang Power Snatch", detail: "2 × 6", suggested_weight_kg: 30 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 18 MIN",
        estimated_minutes_min: 18,
        estimated_minutes_max: 18,
        movements: [
          { name: "Deadlift", detail: "5 × 3", suggested_weight_kg: 50 },
          { name: "Push Press", detail: "5 × 4", suggested_weight_kg: 30 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · 3 ROUNDS · MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        timer_preset_sec: 480,
        movements: [
          { name: "Power Snatch", detail: "6", suggested_weight_kg: 30 },
          { name: "Clean & Push Press", detail: "10", suggested_weight_kg: 30 },
          { name: "Double-unders", detail: "20" },
        ],
      },
    ],
    session: {
      score_text: "2 hela varv + alla Power Snatch + 8 Clean & Push Press",
      feeling_1_5: 4,
      rpe_1_10: 10,
      lifts: [
        { movement_name: "Hang Power Snatch", weight_kg: 30 },
        { movement_name: "Deadlift", weight_kg: 50 },
        { movement_name: "Push Press", weight_kg: 30 },
      ],
    },
  },
  {
    title: "Pass #003",
    pass_number: 3,
    scheduled_date: "2026-04-15",
    status: "done",
    equipment_notes: "Stång · DB 15 · AbMat · Hopprep",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        movements: [
          { name: "Hopprep", detail: "3–5 min" },
          { name: "Mobilitet + front-rack prep", detail: "Dynamiskt" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15–20 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 20,
        movements: [
          { name: "Hang Power Clean", detail: "2 × 8", suggested_weight_kg: 30 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 18 MIN",
        estimated_minutes_min: 18,
        estimated_minutes_max: 18,
        movements: [
          { name: "Front Squat", detail: "5 × 3", suggested_weight_kg: 40 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "AMRAP 10 MIN · SÅ MÅNGA VARV DU HINNER:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        timer_preset_sec: 600,
        movements: [
          { name: "Power Clean", detail: "6", suggested_weight_kg: 30 },
          { name: "Dumbbell Snatch", detail: "10", suggested_weight_kg: 15 },
          { name: "AbMat Sit-up", detail: "12" },
          { name: "Double-unders", detail: "20" },
        ],
      },
    ],
    session: {
      score_text: "4 hela varv (klar ca 5 sek före cap)",
      feeling_1_5: 4,
      rpe_1_10: 8,
      lifts: [
        { movement_name: "Hang Power Clean", weight_kg: 30 },
        { movement_name: "Front Squat", weight_kg: 40 },
        { movement_name: "Power Clean", weight_kg: 30 },
      ],
    },
  },
  {
    title: "Pass #004",
    pass_number: 4,
    scheduled_date: "2026-04-22",
    status: "done",
    equipment_notes: "Stång · DB 15 · Hopprep",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        movements: [
          { name: "Hopprep", detail: "3–5 min" },
          { name: "Mobilitet", detail: "Overhead + höfter" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15–20 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 20,
        movements: [
          { name: "Hang Power Snatch", detail: "2 × 8", suggested_weight_kg: 15 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 18 MIN",
        estimated_minutes_min: 18,
        estimated_minutes_max: 18,
        movements: [
          { name: "Deadlift", detail: "3 × 4", suggested_weight_kg: 50 },
          { name: "Push Press", detail: "5 × 3", suggested_weight_kg: 40 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · 3 ROUNDS · MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        timer_preset_sec: 480,
        movements: [
          { name: "Dumbbell Snatch", detail: "6 växelvis", suggested_weight_kg: 15 },
          { name: "Dumbbell Clean & Push Press", detail: "10 växelvis", suggested_weight_kg: 15 },
          { name: "Double-unders", detail: "20" },
        ],
      },
    ],
    session: {
      score_text: "3 hela varv For Time: 4:46",
      feeling_1_5: 5,
      rpe_1_10: 8,
      lifts: [
        { movement_name: "Hang Power Snatch", weight_kg: 15 },
        { movement_name: "Deadlift", weight_kg: 50 },
        { movement_name: "Push Press", weight_kg: 40 },
      ],
    },
  },
  {
    title: "Pass #005",
    pass_number: 5,
    scheduled_date: "2026-05-29",
    status: "done",
    equipment_notes: "Stång · DB 15 · AbMat · Hopprep",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        movements: [
          { name: "Hopprep", detail: "3–5 min" },
          { name: "Mobilitet + front-rack", detail: "Dynamiskt" },
          { name: "Uppvärmningsset", detail: "2 set HPC + FS" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 15,
        movements: [
          { name: "Hang Power Clean", detail: "2 × 6", suggested_weight_kg: 35 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 18 MIN",
        estimated_minutes_min: 18,
        estimated_minutes_max: 18,
        movements: [
          { name: "Front Squat", detail: "5 × 3", suggested_weight_kg: 45 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "AMRAP 10 MIN · SÅ MÅNGA VARV DU HINNER:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        timer_preset_sec: 600,
        coaching_tip: "AMRAP — kör tills klockan tar slut",
        movements: [
          { name: "Power Clean", detail: "6", suggested_weight_kg: 35 },
          { name: "Dumbbell Snatch", detail: "10 växelvis", suggested_weight_kg: 15 },
          { name: "AbMat Sit-up", detail: "12" },
          { name: "Double-unders", detail: "20" },
        ],
      },
    ],
    session: {
      score_text: "4 hela varv · 59 sek kvar · PC 40 kg",
      feeling_1_5: 4,
      rpe_1_10: 9,
      lifts: [
        { movement_name: "Hang Power Clean", weight_kg: 30 },
        { movement_name: "Front Squat", weight_kg: 40 },
        { movement_name: "Power Clean", weight_kg: 40 },
      ],
    },
  },
  {
    title: "Pass #006",
    pass_number: 6,
    scheduled_date: "2026-08-18",
    status: "done",
    equipment_notes: "Stång · KB 20 · ingen hopprep",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Ingen hopprep",
        movements: [
          { name: "Rask marsch", detail: "2 min" },
          { name: "Air Squat", detail: "10 × 2" },
          { name: "Mobilitet", detail: "Höfter/axlar/anklar" },
          { name: "Uppvärmningsset", detail: "2 set HPS + Push Press" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 15,
        movements: [
          { name: "Hang Power Snatch", detail: "2 × 6", suggested_weight_kg: 30 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 18 MIN",
        estimated_minutes_min: 18,
        estimated_minutes_max: 18,
        movements: [
          { name: "Deadlift", detail: "5 × 3", suggested_weight_kg: 55 },
          { name: "Push Press", detail: "5 × 4", suggested_weight_kg: 40 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · 3 ROUNDS · MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        timer_preset_sec: 480,
        movements: [
          { name: "Power Snatch", detail: "6", suggested_weight_kg: 30 },
          { name: "Clean & Push Press", detail: "10", suggested_weight_kg: 30 },
          { name: "Kettlebell Swing", detail: "20 rysk", suggested_weight_kg: 20 },
        ],
      },
    ],
    session: {
      score_text: "1 varv + 6 PS + 10 C&PP + 13 KB Swing",
      feeling_1_5: 4,
      rpe_1_10: 8,
      lifts: [
        { movement_name: "Hang Power Snatch", weight_kg: 30 },
        { movement_name: "Deadlift", weight_kg: 55 },
        { movement_name: "Push Press", weight_kg: 40 },
      ],
    },
  },
  {
    title: "Pass #007",
    pass_number: 7,
    scheduled_date: "2026-08-25",
    status: "done",
    equipment_notes: "Stång · KB 20 · DB 15 · AbMat · ingen hopprep",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Ingen hopprep",
        movements: [
          { name: "Rask marsch", detail: "2 min" },
          { name: "Air Squat", detail: "10 × 2" },
          { name: "Mobilitet + front-rack", detail: "Dynamiskt" },
          { name: "Uppvärmningsset", detail: "2 set HPC + lätta KB Swing" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 12–15 MIN",
        estimated_minutes_min: 12,
        estimated_minutes_max: 15,
        coaching_tip: "Backa till 30 kg om tekniken brister",
        movements: [
          { name: "Hang Power Clean", detail: "2 × 8", suggested_weight_kg: 35 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 10–12 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 12,
        movements: [
          { name: "Front Squat", detail: "5 × 3", suggested_weight_kg: 45 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "AMRAP 10 MIN · SÅ MÅNGA VARV DU HINNER:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        timer_preset_sec: 600,
        coaching_tip: "AMRAP — kör tills klockan tar slut",
        movements: [
          { name: "Power Clean", detail: "5", suggested_weight_kg: 35 },
          { name: "Kettlebell Swing", detail: "10 rysk", suggested_weight_kg: 20 },
          { name: "Dumbbell Snatch", detail: "10 växelvis", suggested_weight_kg: 15 },
          { name: "AbMat Sit-up", detail: "15" },
        ],
      },
    ],
    session: {
      score_text: "4 hela varv",
      feeling_1_5: 4,
      rpe_1_10: 7,
      notes: "Bra genom hela WOD:en. FS 50 kg.",
      lifts: [
        { movement_name: "Hang Power Clean", weight_kg: 30 },
        { movement_name: "Front Squat", weight_kg: 50 },
        { movement_name: "Power Clean", weight_kg: 40 },
        { movement_name: "Kettlebell Swing", weight_kg: 20 },
        { movement_name: "Dumbbell Snatch", weight_kg: 15 },
      ],
    },
  },
  {
    title: "Pass #012",
    pass_number: 12,
    scheduled_date: null,
    status: "planned",
    equipment_notes: "Stång · DB 15 · Hopprep",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        movements: [
          { name: "Hopprep", detail: "3–5 min lugnt" },
          { name: "Mobilitet", detail: "Overhead + höfter" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 12–15 MIN",
        estimated_minutes_min: 12,
        estimated_minutes_max: 15,
        movements: [
          { name: "Hang Power Snatch", detail: "2 × 8", suggested_weight_kg: 30 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 15–18 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 18,
        coaching_tip: "Lättare DL-vecka",
        movements: [
          { name: "Deadlift", detail: "3 × 4", suggested_weight_kg: 50 },
          { name: "Push Press", detail: "5 × 3", suggested_weight_kg: 42 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · 3 ROUNDS · MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        timer_preset_sec: 480,
        coaching_tip: "Benchmark #004 · mål ≤ 4:46",
        movements: [
          { name: "Dumbbell Snatch", detail: "6 växelvis", suggested_weight_kg: 15 },
          { name: "Dumbbell Clean & Push Press", detail: "10 växelvis", suggested_weight_kg: 15 },
          { name: "Double-unders", detail: "20" },
        ],
      },
    ],
  },
  {
    title: "Pass #008",
    pass_number: 8,
    scheduled_date: null,
    status: "planned",
    equipment_notes: "Stång · KB 20 · AbMat · ingen hopprep",
    notes:
      "Block 3 vecka 1 – Clean. Power Clean från golv + FS-volym + For Time (tydligt skilt från #007).",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Ingen hopprep. Förbered Power Clean från golv.",
        movements: [
          { name: "Rask marsch", detail: "2 min" },
          { name: "Air Squat", detail: "10 × 2" },
          { name: "Mobilitet", detail: "Höfter / handleder / front-rack" },
          { name: "Uppvärmningsset", detail: "2 set Power Clean + Front Squat" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 15,
        coaching_tip:
          "2 reps × 6 gånger från golv (inte hang). Vila ca 90–120 sek mellan gångerna. Fokus: första drag, höfter genom, snabb rack.",
        movements: [
          { name: "Power Clean", detail: "2 × 6", suggested_weight_kg: 35 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 15–18 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 18,
        coaching_tip:
          "5 reps × 4 gånger. Paus 1 sek i botten om det känns ostadigt.",
        movements: [
          { name: "Front Squat", detail: "5 × 4", suggested_weight_kg: 50 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · 3 ROUNDS · MAX 9 MIN:",
        estimated_minutes_min: 9,
        estimated_minutes_max: 9,
        timer_preset_sec: 540,
        coaching_tip:
          "For Time (inte AMRAP). Logga total tid. Skala PC-vikt om tekniken brister.",
        movements: [
          { name: "Power Clean", detail: "8", suggested_weight_kg: 35 },
          { name: "Kettlebell Swing", detail: "12 rysk", suggested_weight_kg: 20 },
          { name: "Push-up", detail: "10" },
          { name: "AbMat Sit-up", detail: "12" },
        ],
      },
    ],
  },
  {
    title: "Pass #009",
    pass_number: 9,
    scheduled_date: null,
    status: "planned",
    equipment_notes: "Stång · KB 20 · ingen hopprep",
    notes: "Block 3 vecka 2 – Snatch. HPS + DL/PP + For Time utan hopprep.",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Ingen hopprep",
        movements: [
          { name: "Rask marsch", detail: "2 min" },
          { name: "Air Squat", detail: "10 × 2" },
          { name: "Mobilitet", detail: "Overhead + höfter" },
          { name: "Uppvärmningsset", detail: "2 set HPS + Push Press" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 15,
        coaching_tip: "Dragbana + stabil overhead",
        movements: [
          { name: "Hang Power Snatch", detail: "2 × 6", suggested_weight_kg: 35 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 18 MIN",
        estimated_minutes_min: 18,
        estimated_minutes_max: 18,
        coaching_tip: "DL 55 → 60 om rygg/teknik OK",
        movements: [
          { name: "Deadlift", detail: "3 × 4", suggested_weight_kg: 60 },
          { name: "Push Press", detail: "5 × 3", suggested_weight_kg: 45 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · 3 ROUNDS · MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        timer_preset_sec: 480,
        coaching_tip: "3 rounds. Benchmark-känsla som #006 (utan DU).",
        movements: [
          { name: "Power Snatch", detail: "6", suggested_weight_kg: 30 },
          { name: "Clean and Push Jerk", detail: "10", suggested_weight_kg: 30 },
          { name: "Kettlebell Snatch", detail: "20 växelvis", suggested_weight_kg: 20 },
        ],
      },
    ],
  },
  {
    title: "Pass #010",
    pass_number: 10,
    scheduled_date: null,
    status: "planned",
    equipment_notes: "Stång · DB 15 · KB 20 · AbMat · ingen hopprep",
    notes: "Block 3 vecka 3 – Clean volym. HPC 8×2 + FS + blandad AMRAP.",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Ingen hopprep",
        movements: [
          { name: "Rask marsch", detail: "2 min" },
          { name: "Air Squat", detail: "10 × 2" },
          { name: "Mobilitet", detail: "Front-rack + höfter" },
          { name: "Uppvärmningsset", detail: "2 set HPC + Front Squat" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15–18 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 18,
        coaching_tip: "Mer volym — behåll teknik",
        movements: [
          { name: "Hang Power Clean", detail: "2 × 8", suggested_weight_kg: 35 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 15–18 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 18,
        coaching_tip: "Samma vikt som #009 om 55 kändes tungt",
        movements: [
          { name: "Front Squat", detail: "5 × 4", suggested_weight_kg: 55 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "AMRAP 10 MIN · SÅ MÅNGA VARV DU HINNER:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        timer_preset_sec: 600,
        coaching_tip: "Blandat barbell/DB/KB. Första varvet lugnt.",
        movements: [
          { name: "Power Clean", detail: "5", suggested_weight_kg: 40 },
          { name: "Dumbbell Snatch", detail: "10 växelvis", suggested_weight_kg: 15 },
          { name: "Kettlebell Swing", detail: "10 rysk", suggested_weight_kg: 20 },
          { name: "AbMat Sit-up", detail: "15" },
        ],
      },
    ],
  },
  {
    title: "Pass #011",
    pass_number: 11,
    scheduled_date: null,
    status: "planned",
    equipment_notes: "Stång · DB 15 · AbMat · ingen hopprep",
    notes: "Block 3 vecka 4 – Snatch kontroll. Lättare DL-vecka + For Time utan hopprep.",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Ingen hopprep",
        movements: [
          { name: "Rask marsch", detail: "2 min" },
          { name: "Air Squat", detail: "10 × 2" },
          { name: "Mobilitet", detail: "Overhead + höfter" },
          { name: "Uppvärmningsset", detail: "2 set HPS + Push Press" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 12–15 MIN",
        estimated_minutes_min: 12,
        estimated_minutes_max: 15,
        coaching_tip: "Volym HPS — prioritera overhead",
        movements: [
          { name: "Hang Power Snatch", detail: "2 × 8", suggested_weight_kg: 35 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 15–18 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 18,
        coaching_tip: "Lättare DL-vecka",
        movements: [
          { name: "Deadlift", detail: "3 × 4", suggested_weight_kg: 55 },
          { name: "Push Press", detail: "5 × 3", suggested_weight_kg: 45 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · 3 ROUNDS · MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        timer_preset_sec: 480,
        coaching_tip: "3 rounds. AbMat ersätter hopprep. Jämför känsla med #008.",
        movements: [
          { name: "Dumbbell Snatch", detail: "6 växelvis", suggested_weight_kg: 15 },
          { name: "Dumbbell Clean & Push Press", detail: "10 växelvis", suggested_weight_kg: 15 },
          { name: "AbMat Sit-up", detail: "20" },
        ],
      },
    ],
  },
  {
    title: "Pass #013",
    pass_number: 13,
    scheduled_date: null,
    status: "planned",
    equipment_notes: "Stång · KB 20 · ingen hopprep",
    notes:
      "Block 4 vecka 1 – Clean. HPC 40 + FS 55 + For Time utan sit-ups.",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Ingen hopprep",
        movements: [
          { name: "Rask marsch", detail: "2 min" },
          { name: "Air Squat", detail: "10 × 2" },
          { name: "Mobilitet", detail: "Höfter / front-rack" },
          { name: "Uppvärmningsset", detail: "2 set HPC + Front Squat" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 15,
        coaching_tip: "2 reps × 6 gånger @ 40 kg. Prioritera snabb rack.",
        movements: [
          { name: "Hang Power Clean", detail: "2 × 6", suggested_weight_kg: 40 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 15–18 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 18,
        coaching_tip: "FS 50 → 55 om 50 kändes lätt.",
        movements: [
          { name: "Front Squat", detail: "3 × 5", suggested_weight_kg: 55 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · 3 ROUNDS · MAX 9 MIN:",
        estimated_minutes_min: 9,
        estimated_minutes_max: 9,
        timer_preset_sec: 540,
        coaching_tip: "Ingen AbMat Sit-up. Logga tid.",
        movements: [
          { name: "Power Clean", detail: "8", suggested_weight_kg: 40 },
          { name: "Goblet Squat", detail: "12", suggested_weight_kg: 20 },
          { name: "Push-up", detail: "10" },
        ],
      },
    ],
  },
  {
    title: "Pass #014",
    pass_number: 14,
    scheduled_date: null,
    status: "planned",
    equipment_notes: "Stång · KB 20 · DB 15 · ingen hopprep",
    notes: "Block 4 vecka 2 – Snatch. DL 55. Ny: Shoulder Press + DB Thruster.",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Ingen hopprep",
        movements: [
          { name: "Rask marsch", detail: "2 min" },
          { name: "Air Squat", detail: "10 × 2" },
          { name: "Mobilitet", detail: "Overhead + höfter" },
          { name: "Uppvärmningsset", detail: "2 set HPS + Shoulder Press" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 15,
        coaching_tip: "Försök 35 kg om overhead är stabil.",
        movements: [
          { name: "Hang Power Snatch", detail: "2 × 6", suggested_weight_kg: 35 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 18 MIN",
        estimated_minutes_min: 18,
        estimated_minutes_max: 18,
        coaching_tip: "DL 55. Strict Shoulder Press = ny stimulans.",
        movements: [
          { name: "Deadlift", detail: "3 × 4", suggested_weight_kg: 55 },
          { name: "Shoulder Press", detail: "5 × 3", suggested_weight_kg: 30 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · 3 ROUNDS · MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        timer_preset_sec: 480,
        coaching_tip: "1 DB — C&PP växelvis (inte thruster med två hantlar). Hellre lätt än fula PS-reps.",
        movements: [
          { name: "Power Snatch", detail: "6", suggested_weight_kg: 30 },
          { name: "Dumbbell Clean & Push Press", detail: "10 växelvis (1 DB)", suggested_weight_kg: 15 },
          { name: "Kettlebell Swing", detail: "15 rysk", suggested_weight_kg: 20 },
        ],
      },
    ],
  },
  {
    title: "Pass #015",
    pass_number: 15,
    scheduled_date: null,
    status: "planned",
    equipment_notes: "Stång · KB 20 · ingen hopprep",
    notes: "Block 4 vecka 3 – Power Clean + Thruster + SDHP AMRAP.",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Ingen hopprep",
        movements: [
          { name: "Rask marsch", detail: "2 min" },
          { name: "Air Squat", detail: "10 × 2" },
          { name: "Mobilitet", detail: "Front-rack + axlar" },
          { name: "Uppvärmningsset", detail: "2 set Power Clean + lätta Thruster" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 15 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 15,
        coaching_tip: "Power Clean från golv.",
        movements: [
          { name: "Power Clean", detail: "2 × 5", suggested_weight_kg: 40 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 15 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 15,
        coaching_tip: "Thruster: lätt vikt, jämn rytm.",
        movements: [
          { name: "Thruster", detail: "5 × 3", suggested_weight_kg: 30 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "AMRAP 10 MIN · SÅ MÅNGA VARV DU HINNER:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        timer_preset_sec: 600,
        coaching_tip: "Ny: Sumo Deadlift High Pull med KB.",
        movements: [
          { name: "Thruster", detail: "6", suggested_weight_kg: 30 },
          { name: "Sumo Deadlift High Pull", detail: "10", suggested_weight_kg: 20 },
          { name: "Push-up", detail: "8" },
        ],
      },
    ],
  },
  {
    title: "Pass #016",
    pass_number: 16,
    scheduled_date: null,
    status: "planned",
    equipment_notes: "Stång · DB 15 · ingen hopprep",
    notes: "Block 4 vecka 4 – Snatch-volym. Tätare metcon än #012, Hollow Rock istället för sit-up/DU.",
    sections: [
      {
        kind: "warmup",
        label: "Warmup",
        format_label: "WARMUP · TAR CA 10 MIN",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        coaching_tip: "Ingen hopprep",
        movements: [
          { name: "Rask marsch", detail: "2 min" },
          { name: "Air Squat", detail: "10 × 2" },
          { name: "Mobilitet", detail: "Overhead + höfter" },
          { name: "Uppvärmningsset", detail: "2 set HPS + Push Press" },
        ],
      },
      {
        kind: "technique",
        label: "Teknik",
        format_label: "TEKNIK · TAR CA 12–15 MIN",
        estimated_minutes_min: 12,
        estimated_minutes_max: 15,
        coaching_tip: "Mer volym HPS. 35 kg om möjligt.",
        movements: [
          { name: "Hang Power Snatch", detail: "2 × 8", suggested_weight_kg: 35 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 15–18 MIN",
        estimated_minutes_min: 15,
        estimated_minutes_max: 18,
        coaching_tip: "DL få reps @ 60. PP 42.",
        movements: [
          { name: "Deadlift", detail: "5 × 2", suggested_weight_kg: 60 },
          { name: "Push Press", detail: "5 × 3", suggested_weight_kg: 42 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · 3 ROUNDS · MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        timer_preset_sec: 480,
        coaching_tip: "Hollow Rock istället för sit-ups. Sikta under 5:00.",
        movements: [
          { name: "Dumbbell Snatch", detail: "8 växelvis", suggested_weight_kg: 15 },
          { name: "Dumbbell Clean & Push Press", detail: "10 växelvis", suggested_weight_kg: 15 },
          { name: "Hollow Rock", detail: "15" },
        ],
      },
    ],
  },
];
