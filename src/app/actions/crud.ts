"use server";

import { createClient } from "@/lib/supabase/server";
import { dateInputToCompletedAt, todayDateInputValue } from "@/lib/dates";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createWorkout(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  const rawPass = String(formData.get("pass_number") || "").trim();
  let passNumber = rawPass ? Number(rawPass) : null;
  if (passNumber == null || Number.isNaN(passNumber)) {
    const { data: maxRow } = await supabase
      .from("workouts")
      .select("pass_number")
      .eq("user_id", user.id)
      .not("pass_number", "is", null)
      .order("pass_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    passNumber = (maxRow?.pass_number ?? 0) + 1;
  }

  const { data, error } = await supabase
    .from("workouts")
    .insert({
      user_id: user.id,
      title,
      pass_number: passNumber,
      status: "planned",
      notes: (formData.get("notes") as string) || null,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "create failed");

  const kinds = [
    { kind: "warmup", label: "Warmup", format: "WARMUP · TAR CA 10 MIN", min: 10, max: 10 },
    { kind: "technique", label: "Teknik", format: "TEKNIK · TAR CA 12–15 MIN", min: 12, max: 15 },
    { kind: "strength", label: "Styrka", format: "STYRKA · TAR CA 10–12 MIN", min: 10, max: 12 },
    { kind: "metcon", label: "Metcon", format: "AMRAP · TAR 10 MIN:", min: 10, max: 10, timer: 600 },
  ] as const;

  for (let i = 0; i < kinds.length; i++) {
    const k = kinds[i];
    await supabase.from("workout_sections").insert({
      workout_id: data.id,
      kind: k.kind,
      sort_order: i,
      label: k.label,
      format_label: k.format,
      estimated_minutes_min: k.min,
      estimated_minutes_max: k.max,
      timer_preset_sec: "timer" in k ? k.timer : null,
    });
  }

  revalidatePath("/workouts");
  redirect(`/workouts/${data.id}`);
}

export async function updateWorkout(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id"));
  await supabase
    .from("workouts")
    .update({
      title: String(formData.get("title") || "").trim(),
      pass_number: formData.get("pass_number")
        ? Number(formData.get("pass_number"))
        : null,
      status: String(formData.get("status") || "planned"),
      notes: (formData.get("notes") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath(`/workouts/${id}`);
  revalidatePath("/workouts");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: String(formData.get("display_name") || "").trim() || null,
      equipment: (formData.get("equipment") as string) || null,
      updated_at: new Date().toISOString(),
    });

  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath("/workouts");
}

export async function deleteWorkout(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id"));
  await supabase.from("workouts").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/workouts");
  redirect("/workouts");
}

export async function addMovement(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sectionId = String(formData.get("section_id"));
  const workoutId = String(formData.get("workout_id"));
  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  const { count } = await supabase
    .from("section_movements")
    .select("*", { count: "exact", head: true })
    .eq("section_id", sectionId);

  await supabase.from("section_movements").insert({
    section_id: sectionId,
    name,
    detail: (formData.get("detail") as string) || null,
    suggested_weight_kg: formData.get("suggested_weight_kg")
      ? Number(formData.get("suggested_weight_kg"))
      : null,
    sort_order: count ?? 0,
  });

  revalidatePath(`/workouts/${workoutId}`);
}

export async function updateSection(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sectionId = String(formData.get("section_id"));
  const workoutId = String(formData.get("workout_id"));

  await supabase
    .from("workout_sections")
    .update({
      format_label: (formData.get("format_label") as string) || null,
      coaching_tip: (formData.get("coaching_tip") as string) || null,
      estimated_minutes_min: formData.get("estimated_minutes_min")
        ? Number(formData.get("estimated_minutes_min"))
        : null,
      estimated_minutes_max: formData.get("estimated_minutes_max")
        ? Number(formData.get("estimated_minutes_max"))
        : null,
      timer_preset_sec: formData.get("timer_preset_sec")
        ? Number(formData.get("timer_preset_sec"))
        : null,
    })
    .eq("id", sectionId);

  revalidatePath(`/workouts/${workoutId}`);
}

export type LogSessionResult =
  | { ok: true }
  | { ok: false; message: string };

/** Logga genomfört pass. Returnerar alltid resultat (ingen redirect). */
export async function logSession(formData: FormData): Promise<LogSessionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Inte inloggad." };

  const userId = user.id;
  const workoutId = String(formData.get("workout_id") || "");
  if (!workoutId) return { ok: false, message: "Saknar pass-id." };

  const completedDate =
    String(formData.get("completed_date") || "").trim() || todayDateInputValue();
  const completedAt =
    dateInputToCompletedAt(completedDate) ??
    dateInputToCompletedAt(todayDateInputValue())!;

  const { data: session, error } = await supabase
    .from("training_sessions")
    .insert({
      user_id: userId,
      workout_id: workoutId,
      score_text: (formData.get("score_text") as string) || null,
      feeling_1_5: formData.get("feeling_1_5")
        ? Number(formData.get("feeling_1_5"))
        : null,
      rpe_1_10: formData.get("rpe_1_10") ? Number(formData.get("rpe_1_10")) : null,
      notes: (formData.get("notes") as string) || null,
      completed_at: completedAt,
    })
    .select("id")
    .single();

  if (error || !session) {
    return { ok: false, message: error?.message ?? "Kunde inte spara session." };
  }

  const liftNames = formData.getAll("lift_name") as string[];
  const liftWeights = formData.getAll("lift_weight") as string[];
  const lifts = liftNames
    .map((name, i) => ({
      session_id: session.id,
      movement_name: name.trim(),
      weight_kg: liftWeights[i] ? Number(liftWeights[i]) : null,
      sort_order: i,
    }))
    .filter((l) => l.movement_name);

  if (lifts.length) await supabase.from("session_lifts").insert(lifts);

  await supabase
    .from("workouts")
    .update({
      status: "done",
      scheduled_date: completedDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workoutId)
    .eq("user_id", userId);

  revalidatePath(`/workouts/${workoutId}`);
  revalidatePath("/sessions");
  revalidatePath("/");

  return { ok: true };
}

/** Formulär-action från passdetalj: logga och gå till historik. */
export async function logSessionFromForm(formData: FormData): Promise<void> {
  const result = await logSession(formData);
  if (!result.ok) throw new Error(result.message);
  redirect("/sessions");
}

export async function createTemplate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("workout_templates").insert({
    user_id: user.id,
    name: String(formData.get("name") || "").trim(),
    workout_type: String(formData.get("workout_type") || "mixed"),
    notes: (formData.get("notes") as string) || null,
  });
  revalidatePath("/library");
}

export async function deleteTemplate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase
    .from("workout_templates")
    .delete()
    .eq("id", String(formData.get("id")))
    .eq("user_id", user.id);
  revalidatePath("/library");
}

export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("goals").insert({
    user_id: user.id,
    title: String(formData.get("title") || "").trim(),
    deadline: (formData.get("deadline") as string) || null,
    status: String(formData.get("status") || "ongoing"),
    current_level: (formData.get("current_level") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  revalidatePath("/goals");
}

export async function updateGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("goals")
    .update({
      title: String(formData.get("title") || "").trim(),
      deadline: (formData.get("deadline") as string) || null,
      status: String(formData.get("status") || "ongoing"),
      current_level: (formData.get("current_level") as string) || null,
      notes: (formData.get("notes") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", String(formData.get("id")))
    .eq("user_id", user.id);
  revalidatePath("/goals");
}

export async function deleteGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase
    .from("goals")
    .delete()
    .eq("id", String(formData.get("id")))
    .eq("user_id", user.id);
  revalidatePath("/goals");
}
