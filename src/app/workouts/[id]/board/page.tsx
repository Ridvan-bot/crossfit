import { notFound } from "next/navigation";
import { BoardPlayer } from "@/components/BoardPlayer";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutSection } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function BoardWorkoutPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workout } = await supabase
    .from("workouts")
    .select("id, title")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();
  if (!workout) notFound();

  const { data: sections } = await supabase
    .from("workout_sections")
    .select("*, section_movements(*)")
    .eq("workout_id", id)
    .order("sort_order", { ascending: true });

  const ordered = (sections ?? []).map((s) => ({
    ...s,
    section_movements: [...(s.section_movements ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  })) as WorkoutSection[];

  return <BoardPlayer workoutId={id} title={workout.title} sections={ordered} />;
}
