export type SectionKind =
  | "warmup"
  | "technique"
  | "strength"
  | "metcon"
  | "other";

export const SECTION_KIND_OPTIONS: { value: SectionKind; label: string }[] = [
  { value: "warmup", label: "Warmup" },
  { value: "technique", label: "Teknik" },
  { value: "strength", label: "Styrka" },
  { value: "metcon", label: "Metcon" },
  { value: "other", label: "Övrigt" },
];

export type SectionMovement = {
  id: string;
  name: string;
  detail: string | null;
  suggested_weight_kg: number | null;
  sort_order: number;
};

export type WorkoutSection = {
  id: string;
  kind: SectionKind;
  sort_order: number;
  label: string;
  format_label: string | null;
  estimated_minutes_min: number | null;
  estimated_minutes_max: number | null;
  coaching_tip: string | null;
  timer_preset_sec: number | null;
  section_movements: SectionMovement[];
};

export type Workout = {
  id: string;
  title: string;
  pass_number: number | null;
  scheduled_date: string | null;
  status: "planned" | "done";
  equipment_notes: string | null;
  notes: string | null;
  workout_sections?: WorkoutSection[];
};

export type Goal = {
  id: string;
  title: string;
  deadline: string | null;
  status: "ongoing" | "planned" | "done";
  current_level: string | null;
  notes: string | null;
};

export type Profile = {
  id: string;
  display_name: string | null;
  equipment: string | null;
};

export type TrainingSession = {
  id: string;
  workout_id: string;
  score_text: string | null;
  feeling_1_5: number | null;
  rpe_1_10: number | null;
  notes: string | null;
  completed_at: string;
  workouts?: { title: string; pass_number: number | null } | null;
};
