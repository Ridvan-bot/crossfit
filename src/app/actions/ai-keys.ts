"use server";

import {
  AI_KEY_STATUS_COLUMNS,
  parseAiKeyInput,
  toAiKeyStatus,
  type AiKeyStatus,
} from "@/lib/ai-keys";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AiKeyActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function getUserAiKeyStatus(): Promise<AiKeyStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return toAiKeyStatus(null);

  const { data } = await supabase
    .from("user_ai_keys")
    .select(AI_KEY_STATUS_COLUMNS)
    .eq("user_id", user.id)
    .maybeSingle();

  return toAiKeyStatus(data);
}

export async function saveUserAiKey(
  formData: FormData
): Promise<AiKeyActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Inte inloggad." };

  const parsed = parseAiKeyInput({
    provider: String(formData.get("provider") || ""),
    apiKey: String(formData.get("api_key") || ""),
    baseUrl: String(formData.get("base_url") || ""),
  });
  if (!parsed.ok) return parsed;

  const { error } = await supabase.from("user_ai_keys").upsert({
    user_id: user.id,
    provider: parsed.provider,
    api_key: parsed.apiKey,
    base_url: parsed.baseUrl,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, message: "Kunde inte spara nyckeln." };

  revalidatePath("/profile");
  return { ok: true };
}

export async function deleteUserAiKey(): Promise<AiKeyActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Inte inloggad." };

  const { error } = await supabase
    .from("user_ai_keys")
    .delete()
    .eq("user_id", user.id);

  if (error) return { ok: false, message: "Kunde inte ta bort nyckeln." };

  revalidatePath("/profile");
  return { ok: true };
}
