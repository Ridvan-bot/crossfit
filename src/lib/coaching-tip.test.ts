import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const srcDir = join(dirname(fileURLToPath(import.meta.url)), "../components");

describe("coaching-tip bakom i-ikon", () => {
  const helpTip = readFileSync(join(srcDir, "HelpTip.tsx"), "utf8");
  const phone = readFileSync(join(srcDir, "PhonePlayer.tsx"), "utf8");
  const board = readFileSync(join(srcDir, "BoardPlayer.tsx"), "utf8");

  it("HelpTip har i-symbol och CoachingTip-wrapper", () => {
    assert.match(helpTip, /symbol\?: "\?" \| "i"/);
    assert.match(helpTip, /export function CoachingTip/);
    assert.match(helpTip, /label="Visa coaching-tip"/);
  });

  it("telefon visar inte coaching-tip som brödtext", () => {
    assert.match(phone, /import \{ CoachingTip \} from "@\/components\/HelpTip"/);
    assert.match(phone, /<CoachingTip[\s\S]*text=\{section\.coaching_tip\}/);
    assert.doesNotMatch(phone, /\$\{section\.coaching_tip\}/);
    assert.match(phone, /m\.detail/);
    assert.match(phone, /m\.suggested_weight_kg/);
  });

  it("tavla visar coaching bakom ikon, inte som brödtext i visningsläge", () => {
    assert.match(board, /import \{ CoachingTip \} from "@\/components\/HelpTip"/);
    assert.match(board, /<CoachingTip[\s\S]*text=\{section\.coaching_tip\}/);
    assert.doesNotMatch(
      board,
      /text-white\/65">\s*\{section\.coaching_tip\}/
    );
    assert.match(board, /m\.detail/);
    assert.match(board, /m\.suggested_weight_kg/);
  });
});
