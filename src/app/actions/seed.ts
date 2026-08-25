"use server";

import { createClient } from "@/lib/supabase/server";
import { SEED_GOALS, SEED_TEMPLATES, SEED_WORKOUTS } from "@/lib/seed-data";
import { revalidatePath } from "next/cache";

export async function seedDemoData(): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Inte inloggad." };

  const { count } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) > 0) {
    return { ok: false, message: "Du har redan pass — seed hoppades över." };
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    display_name: user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "Athlete",
  });

  for (const t of SEED_TEMPLATES) {
    await supabase.from("workout_templates").insert({
      user_id: user.id,
      name: t.name,
      workout_type: t.workout_type,
      notes: t.notes,
    });
  }

  for (const g of SEED_GOALS) {
    await supabase.from("goals").insert({
      user_id: user.id,
      title: g.title,
      deadline: g.deadline,
      status: g.status,
      current_level: g.current_level,
      notes: g.notes,
    });
  }

  for (const w of SEED_WORKOUTS) {
    const { data: workout, error } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        title: w.title,
        pass_number: w.pass_number,
        scheduled_date: w.scheduled_date,
        status: w.status,
        equipment_notes: w.equipment_notes ?? null,
        notes: w.notes ?? null,
      })
      .select("id")
      .single();

    if (error || !workout) {
      return { ok: false, message: error?.message ?? "Kunde inte skapa pass." };
    }

    for (let si = 0; si < w.sections.length; si++) {
      const s = w.sections[si];
      const { data: section, error: sErr } = await supabase
        .from("workout_sections")
        .insert({
          workout_id: workout.id,
          kind: s.kind,
          sort_order: si,
          label: s.label,
          format_label: s.format_label ?? null,
          estimated_minutes_min: s.estimated_minutes_min ?? null,
          estimated_minutes_max: s.estimated_minutes_max ?? null,
          coaching_tip: s.coaching_tip ?? null,
          timer_preset_sec: s.timer_preset_sec ?? null,
        })
        .select("id")
        .single();

      if (sErr || !section) {
        return { ok: false, message: sErr?.message ?? "Kunde inte skapa sektion." };
      }

      const moves = s.movements.map((m, mi) => ({
        section_id: section.id,
        name: m.name,
        detail: m.detail ?? null,
        suggested_weight_kg: m.suggested_weight_kg ?? null,
        sort_order: mi,
      }));

      if (moves.length) {
        const { error: mErr } = await supabase.from("section_movements").insert(moves);
        if (mErr) return { ok: false, message: mErr.message };
      }
    }

    if (w.session) {
      const { data: session, error: sessErr } = await supabase
        .from("training_sessions")
        .insert({
          user_id: user.id,
          workout_id: workout.id,
          score_text: w.session.score_text,
          feeling_1_5: w.session.feeling_1_5,
          rpe_1_10: w.session.rpe_1_10,
          notes: w.session.notes ?? null,
          completed_at: w.scheduled_date
            ? `${w.scheduled_date}T12:00:00Z`
            : new Date().toISOString(),
        })
        .select("id")
        .single();

      if (sessErr || !session) {
        return { ok: false, message: sessErr?.message ?? "Kunde inte skapa session." };
      }

      const lifts = w.session.lifts.map((l, i) => ({
        session_id: session.id,
        movement_name: l.movement_name,
        weight_kg: l.weight_kg,
        sort_order: i,
      }));
      await supabase.from("session_lifts").insert(lifts);
    }
  }

  revalidatePath("/");
  revalidatePath("/workouts");
  revalidatePath("/sessions");
  revalidatePath("/goals");
  revalidatePath("/library");
  return { ok: true, message: "Seed klar: pass #001–#008, mål och mallar." };
}
