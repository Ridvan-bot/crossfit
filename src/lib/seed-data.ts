/** Seed payload mirroring docs/training-log.md (pass #001–#008). */

export type SeedMovement = {
  name: string;
  detail?: string;
  suggested_weight_kg?: number | null;
};

export type SeedSection = {
  kind: "warmup" | "technique" | "strength" | "metcon";
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
          { name: "Hang Power Clean", detail: "6 × 2", suggested_weight_kg: 30 },
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
        format_label: "AMRAP · TAR 10 MIN:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        timer_preset_sec: 600,
        coaching_tip: "10 min AMRAP",
        movements: [
          { name: "Power Clean", detail: "6", suggested_weight_kg: 30 },
          { name: "Dumbbell Snatch", detail: "10 · 15 kg, 3+3", suggested_weight_kg: 15 },
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
          { name: "Hang Power Snatch", detail: "6 × 2", suggested_weight_kg: 30 },
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
          { name: "Push Press", detail: "4 × 5", suggested_weight_kg: 30 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · TAR MAX 8 MIN:",
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
          { name: "Hang Power Clean", detail: "8 × 2", suggested_weight_kg: 30 },
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
        format_label: "AMRAP · TAR 10 MIN:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        timer_preset_sec: 600,
        movements: [
          { name: "Power Clean", detail: "6", suggested_weight_kg: 30 },
          { name: "Dumbbell Snatch", detail: "10 · 15 kg", suggested_weight_kg: 15 },
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
          { name: "Hang Power Snatch", detail: "8 × 2", suggested_weight_kg: 15 },
        ],
      },
      {
        kind: "strength",
        label: "Styrka",
        format_label: "STYRKA · TAR CA 18 MIN",
        estimated_minutes_min: 18,
        estimated_minutes_max: 18,
        movements: [
          { name: "Deadlift", detail: "4 × 3", suggested_weight_kg: 50 },
          { name: "Push Press", detail: "3 × 5", suggested_weight_kg: 40 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · TAR MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        timer_preset_sec: 480,
        movements: [
          { name: "Dumbbell Snatch", detail: "6 · 3+3", suggested_weight_kg: 15 },
          { name: "Dumbbell Clean & Push Press", detail: "10 · 5+5", suggested_weight_kg: 15 },
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
          { name: "Hang Power Clean", detail: "6 × 2", suggested_weight_kg: 35 },
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
        format_label: "AMRAP · TAR 10 MIN:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        timer_preset_sec: 600,
        coaching_tip: "AMRAP — kör tills klockan tar slut",
        movements: [
          { name: "Power Clean", detail: "6", suggested_weight_kg: 35 },
          { name: "Dumbbell Snatch", detail: "10 · 3+3", suggested_weight_kg: 15 },
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
          { name: "Air Squat", detail: "2 × 10" },
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
          { name: "Hang Power Snatch", detail: "6 × 2", suggested_weight_kg: 30 },
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
          { name: "Push Press", detail: "4 × 5", suggested_weight_kg: 40 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · TAR MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        timer_preset_sec: 480,
        movements: [
          { name: "Power Snatch", detail: "6", suggested_weight_kg: 30 },
          { name: "Clean & Push Press", detail: "10", suggested_weight_kg: 30 },
          { name: "Kettlebell Swing", detail: "20 · rysk", suggested_weight_kg: 20 },
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
          { name: "Air Squat", detail: "2 × 10" },
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
          { name: "Hang Power Clean", detail: "8 × 2", suggested_weight_kg: 35 },
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
        format_label: "AMRAP · TAR 10 MIN:",
        estimated_minutes_min: 10,
        estimated_minutes_max: 10,
        timer_preset_sec: 600,
        coaching_tip: "AMRAP — kör tills klockan tar slut",
        movements: [
          { name: "Power Clean", detail: "5", suggested_weight_kg: 35 },
          { name: "Kettlebell Swing", detail: "10 · rysk", suggested_weight_kg: 20 },
          { name: "Dumbbell Snatch", detail: "10 · 3+3", suggested_weight_kg: 15 },
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
    title: "Pass #008",
    pass_number: 8,
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
          { name: "Hang Power Snatch", detail: "8 × 2", suggested_weight_kg: 30 },
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
          { name: "Deadlift", detail: "4 × 3", suggested_weight_kg: 50 },
          { name: "Push Press", detail: "3 × 5", suggested_weight_kg: 42 },
        ],
      },
      {
        kind: "metcon",
        label: "Metcon",
        format_label: "FOR TIME · TAR MAX 8 MIN:",
        estimated_minutes_min: 8,
        estimated_minutes_max: 8,
        timer_preset_sec: 480,
        coaching_tip: "Benchmark #004 · mål ≤ 4:46",
        movements: [
          { name: "Dumbbell Snatch", detail: "6 · 3+3", suggested_weight_kg: 15 },
          { name: "Dumbbell Clean & Push Press", detail: "10 · 5+5", suggested_weight_kg: 15 },
          { name: "Double-unders", detail: "20" },
        ],
      },
    ],
  },
];
