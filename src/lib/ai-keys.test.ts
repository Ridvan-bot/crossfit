import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_PROVIDERS,
  parseAiKeyInput,
  parseAiProvider,
  parseBaseUrl,
  providerLabel,
  providerNeedsBaseUrl,
  toAiKeyStatus,
} from "./ai-keys.ts";

describe("AI_PROVIDERS", () => {
  it("includes Cursor alongside the other BYOK providers", () => {
    const values = AI_PROVIDERS.map((p) => p.value);
    assert.deepEqual(values, [
      "openai",
      "anthropic",
      "gemini",
      "cursor",
      "openai_compatible",
    ]);
    assert.equal(providerLabel("cursor"), "Cursor");
    assert.equal(providerNeedsBaseUrl("cursor"), false);
    assert.equal(providerNeedsBaseUrl("openai_compatible"), true);
  });
});

describe("parseAiProvider", () => {
  it("accepts known providers and rejects junk", () => {
    assert.equal(parseAiProvider("cursor"), "cursor");
    assert.equal(parseAiProvider(" gemini "), "gemini");
    assert.equal(parseAiProvider("openai_compatible"), "openai_compatible");
    assert.equal(parseAiProvider("google"), null);
    assert.equal(parseAiProvider(""), null);
  });
});

describe("parseBaseUrl", () => {
  it("requires http(s) and trims a trailing slash", () => {
    const ok = parseBaseUrl(" https://openrouter.ai/api/v1/ ");
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.url, "https://openrouter.ai/api/v1");

    assert.equal(parseBaseUrl("").ok, false);
    assert.equal(parseBaseUrl("not-a-url").ok, false);
    assert.equal(parseBaseUrl("javascript:alert(1)").ok, false);
  });
});

describe("parseAiKeyInput", () => {
  it("saves Cursor with a key and no base URL", () => {
    const parsed = parseAiKeyInput({
      provider: "cursor",
      apiKey: "  key_live_abc  ",
      baseUrl: "https://should.be.ignored",
    });
    assert.deepEqual(parsed, {
      ok: true,
      provider: "cursor",
      apiKey: "key_live_abc",
      baseUrl: null,
    });
  });

  it("requires a key and a valid base URL for OpenAI-compatible", () => {
    const missingKey = parseAiKeyInput({
      provider: "openai_compatible",
      apiKey: "   ",
      baseUrl: "https://api.groq.com/openai/v1",
    });
    assert.equal(missingKey.ok, false);

    const missingUrl = parseAiKeyInput({
      provider: "openai_compatible",
      apiKey: "gsk_test",
      baseUrl: "",
    });
    assert.equal(missingUrl.ok, false);

    const ok = parseAiKeyInput({
      provider: "openai_compatible",
      apiKey: "gsk_test",
      baseUrl: "https://api.groq.com/openai/v1",
    });
    assert.deepEqual(ok, {
      ok: true,
      provider: "openai_compatible",
      apiKey: "gsk_test",
      baseUrl: "https://api.groq.com/openai/v1",
    });
  });

  it("rejects an unknown provider", () => {
    const parsed = parseAiKeyInput({
      provider: "cohere",
      apiKey: "secret",
      baseUrl: "",
    });
    assert.equal(parsed.ok, false);
  });
});

describe("toAiKeyStatus", () => {
  it("never copies api_key onto the status object", () => {
    const status = toAiKeyStatus({
      provider: "anthropic",
      base_url: null,
      api_key: "sk-secret-must-not-leak",
    });
    assert.deepEqual(status, {
      hasKey: true,
      provider: "anthropic",
      baseUrl: null,
    });
    assert.equal("api_key" in status, false);
    assert.equal(JSON.stringify(status).includes("sk-secret"), false);
  });

  it("treats missing or invalid rows as no key", () => {
    assert.deepEqual(toAiKeyStatus(null), {
      hasKey: false,
      provider: null,
      baseUrl: null,
    });
    assert.equal(toAiKeyStatus({ provider: "nope", api_key: "x" }).hasKey, false);
  });
});
