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

  const template = String(formData.get("template") || "classic");
  type SectionSeed = {
    kind: "warmup" | "technique" | "strength" | "metcon" | "other";
    label: string;
    format: string;
    min: number;
    max: number;
    timer?: number;
  };

  let seeds: SectionSeed[] = [];
  if (template === "metcon") {
    seeds = [
      {
        kind: "metcon",
        label: "Metcon",
        format: "AMRAP · TAR 10 MIN:",
        min: 10,
        max: 10,
        timer: 600,
      },
    ];
  } else if (template === "empty") {
    seeds = [];
  } else {
    // classic (default)
    seeds = [
      {
        kind: "warmup",
        label: "Warmup",
        format: "WARMUP · TAR CA 10 MIN",
        min: 10,
        max: 10,
      },
      {
        kind: "technique",
        label: "Teknik",
        format: "TEKNIK · TAR CA 12–15 MIN",
        min: 12,
        max: 15,
      },
      {
        kind: "strength",
        label: "Styrka",
        format: "STYRKA · TAR CA 10–12 MIN",
        min: 10,
        max: 12,
      },
      {
        kind: "metcon",
        label: "Metcon",
        format: "AMRAP · TAR 10 MIN:",
        min: 10,
        max: 10,
        timer: 600,
      },
    ];
  }

  for (let i = 0; i < seeds.length; i++) {
    const k = seeds[i];
    await supabase.from("workout_sections").insert({
      workout_id: data.id,
      kind: k.kind,
      sort_order: i,
      label: k.label,
      format_label: k.format,
      estimated_minutes_min: k.min,
      estimated_minutes_max: k.max,
      timer_preset_sec: k.timer ?? null,
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
  redirect("/profile?saved=1");
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
  const kind = String(formData.get("kind") || "other");
  const allowed = ["warmup", "technique", "strength", "metcon", "other"];
  const safeKind = allowed.includes(kind) ? kind : "other";

  await supabase
    .from("workout_sections")
    .update({
      label: String(formData.get("label") || "").trim() || "Del",
      kind: safeKind,
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

export type BoardSaveResult = { ok: true } | { ok: false; message: string };

function isTempId(id: string) {
  return id.startsWith("temp-");
}

/** Spara hela tavlans utkast: sektioner + rörelser (lägg till / uppdatera / radera). */
export async function saveBoardEdit(input: {
  workoutId: string;
  deletedSectionIds: string[];
  sections: {
    id: string;
    label: string;
    format_label: string | null;
    coaching_tip: string | null;
    kind: string;
    sort_order: number;
    movements: {
      id: string;
      name: string;
      detail: string | null;
      suggested_weight_kg: number | null;
      sort_order: number;
    }[];
  }[];
}): Promise<BoardSaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Inte inloggad." };

  const { data: owned } = await supabase
    .from("workouts")
    .select("id")
    .eq("id", input.workoutId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!owned) return { ok: false, message: "Passet hittades inte." };

  for (const sectionId of input.deletedSectionIds) {
    if (isTempId(sectionId)) continue;
    const { error } = await supabase
      .from("workout_sections")
      .delete()
      .eq("id", sectionId)
      .eq("workout_id", input.workoutId);
    if (error) return { ok: false, message: error.message };
  }

  const allowedKinds = ["warmup", "technique", "strength", "metcon", "other"];

  for (const sec of input.sections) {
    const kind = allowedKinds.includes(sec.kind) ? sec.kind : "other";
    const label = sec.label.trim() || "Del";
    const format_label = sec.format_label?.trim() || null;
    const coaching_tip = sec.coaching_tip?.trim() || null;
    let sectionId = sec.id;

    if (isTempId(sec.id)) {
      const { data: inserted, error } = await supabase
        .from("workout_sections")
        .insert({
          workout_id: input.workoutId,
          kind,
          sort_order: sec.sort_order,
          label,
          format_label: format_label ?? label.toUpperCase(),
          coaching_tip,
          timer_preset_sec: kind === "metcon" ? 600 : null,
        })
        .select("id")
        .single();
      if (error || !inserted) {
        return { ok: false, message: error?.message ?? "Kunde inte skapa del." };
      }
      sectionId = inserted.id;
    } else {
      const { error } = await supabase
        .from("workout_sections")
        .update({
          label,
          format_label,
          coaching_tip,
          kind,
          sort_order: sec.sort_order,
        })
        .eq("id", sectionId)
        .eq("workout_id", input.workoutId);
      if (error) return { ok: false, message: error.message };
    }

    const { data: existingMoves, error: listErr } = await supabase
      .from("section_movements")
      .select("id")
      .eq("section_id", sectionId);
    if (listErr) return { ok: false, message: listErr.message };

    const keptIds = new Set(
      sec.movements.filter((m) => !isTempId(m.id)).map((m) => m.id)
    );
    for (const row of existingMoves ?? []) {
      if (!keptIds.has(row.id)) {
        const { error } = await supabase
          .from("section_movements")
          .delete()
          .eq("id", row.id)
          .eq("section_id", sectionId);
        if (error) return { ok: false, message: error.message };
      }
    }

    for (const m of sec.movements) {
      const name = m.name.trim();
      if (!name) {
        if (!isTempId(m.id)) {
          const { error } = await supabase
            .from("section_movements")
            .delete()
            .eq("id", m.id)
            .eq("section_id", sectionId);
          if (error) return { ok: false, message: error.message };
        }
        continue;
      }

      const payload = {
        name,
        detail: m.detail?.trim() || null,
        suggested_weight_kg:
          m.suggested_weight_kg != null && !Number.isNaN(m.suggested_weight_kg)
            ? m.suggested_weight_kg
            : null,
        sort_order: m.sort_order,
      };

      if (isTempId(m.id)) {
        const { error } = await supabase.from("section_movements").insert({
          section_id: sectionId,
          ...payload,
        });
        if (error) return { ok: false, message: error.message };
      } else {
        const { error } = await supabase
          .from("section_movements")
          .update(payload)
          .eq("id", m.id)
          .eq("section_id", sectionId);
        if (error) return { ok: false, message: error.message };
      }
    }
  }

  revalidatePath(`/workouts/${input.workoutId}`);
  revalidatePath(`/workouts/${input.workoutId}/board`);
  revalidatePath(`/workouts/${input.workoutId}/phone`);
  return { ok: true };
}

export async function addSection(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workoutId = String(formData.get("workout_id"));
  const label = String(formData.get("label") || "").trim() || "Ny del";
  const kind = String(formData.get("kind") || "other");
  const allowed = ["warmup", "technique", "strength", "metcon", "other"];
  const safeKind = allowed.includes(kind) ? kind : "other";

  const { data: maxRow } = await supabase
    .from("workout_sections")
    .select("sort_order")
    .eq("workout_id", workoutId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (maxRow?.sort_order ?? -1) + 1;
  const timerDefault = safeKind === "metcon" ? 600 : null;

  await supabase.from("workout_sections").insert({
    workout_id: workoutId,
    kind: safeKind,
    sort_order: sortOrder,
    label,
    format_label: label.toUpperCase(),
    timer_preset_sec: timerDefault,
  });

  revalidatePath(`/workouts/${workoutId}`);
}

export async function deleteSection(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sectionId = String(formData.get("section_id"));
  const workoutId = String(formData.get("workout_id"));

  await supabase.from("workout_sections").delete().eq("id", sectionId);

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
