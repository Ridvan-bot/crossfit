/**
 * User-owned AI keys (BYOK).
 *
 * The secret is stored per user in `user_ai_keys` (RLS: user_id = auth.uid()).
 * Profile UI must only ever see provider + whether a key exists — never the key.
 */

export const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI", needsBaseUrl: false },
  { value: "anthropic", label: "Anthropic", needsBaseUrl: false },
  { value: "gemini", label: "Google Gemini", needsBaseUrl: false },
  { value: "cursor", label: "Cursor", needsBaseUrl: false },
  { value: "openai_compatible", label: "OpenAI-kompatibel", needsBaseUrl: true },
] as const;

export type AiProvider = (typeof AI_PROVIDERS)[number]["value"];

export type AiKeyStatus = {
  hasKey: boolean;
  provider: AiProvider | null;
  baseUrl: string | null;
};

export const EMPTY_AI_KEY_STATUS: AiKeyStatus = {
  hasKey: false,
  provider: null,
  baseUrl: null,
};

const PROVIDER_VALUES = new Set<string>(AI_PROVIDERS.map((p) => p.value));

export function isAiProvider(value: string): value is AiProvider {
  return PROVIDER_VALUES.has(value);
}

export function parseAiProvider(raw: string): AiProvider | null {
  const value = raw.trim();
  return isAiProvider(value) ? value : null;
}

export function providerNeedsBaseUrl(provider: AiProvider): boolean {
  return AI_PROVIDERS.find((p) => p.value === provider)?.needsBaseUrl ?? false;
}

export function providerLabel(provider: AiProvider | null): string {
  if (!provider) return "";
  return AI_PROVIDERS.find((p) => p.value === provider)?.label ?? provider;
}

export type ParseAiKeyInput =
  | {
      ok: true;
      provider: AiProvider;
      apiKey: string;
      baseUrl: string | null;
    }
  | { ok: false; message: string };

export function parseBaseUrl(
  raw: string
): { ok: true; url: string } | { ok: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "Base URL krävs för OpenAI-kompatibel." };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, message: "Ogiltig base URL." };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, message: "Base URL måste vara http eller https." };
  }

  const url = parsed.toString().replace(/\/$/, "");
  return { ok: true, url };
}

export function parseAiKeyInput(input: {
  provider: string;
  apiKey: string;
  baseUrl: string;
}): ParseAiKeyInput {
  const provider = parseAiProvider(input.provider);
  if (!provider) {
    return { ok: false, message: "Välj en leverantör." };
  }

  const apiKey = input.apiKey.trim();
  if (!apiKey) {
    return { ok: false, message: "Klistra in en nyckel." };
  }

  if (providerNeedsBaseUrl(provider)) {
    const base = parseBaseUrl(input.baseUrl);
    if (!base.ok) return base;
    return { ok: true, provider, apiKey, baseUrl: base.url };
  }

  return { ok: true, provider, apiKey, baseUrl: null };
}

/** Map a DB row to UI status. Drops api_key even if the row object contains it. */
export function toAiKeyStatus(
  row:
    | {
        provider?: string | null;
        base_url?: string | null;
        api_key?: string | null;
      }
    | null
    | undefined
): AiKeyStatus {
  if (!row) return EMPTY_AI_KEY_STATUS;
  const provider = parseAiProvider(String(row.provider ?? ""));
  if (!provider) return EMPTY_AI_KEY_STATUS;
  return {
    hasKey: true,
    provider,
    baseUrl: row.base_url?.trim() || null,
  };
}

export const AI_KEY_STATUS_COLUMNS = "provider, base_url, updated_at" as const;
