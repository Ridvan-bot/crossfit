import { notFound } from "next/navigation";
import { PhonePlayer } from "@/components/PhonePlayer";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutSection } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function PhoneWorkoutPage({ params }: Props) {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("equipment")
    .eq("id", user!.id)
    .maybeSingle();

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

  return (
    <PhonePlayer
      workoutId={id}
      title={workout.title}
      meta={profile?.equipment ?? ""}
      sections={ordered}
    />
  );
}
