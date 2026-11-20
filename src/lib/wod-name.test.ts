import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultWodTitle,
  formatPassNumber,
  resolveWodTitle,
  wodDisplayName,
  wodNickname,
  wodNumberLabel,
} from "./wod-name.ts";

describe("wod-name", () => {
  it("pads pass_number as WOD #020", () => {
    assert.equal(formatPassNumber(20), "020");
    assert.equal(defaultWodTitle(20), "WOD #020");
    assert.equal(defaultWodTitle(1), "WOD #001");
    assert.equal(defaultWodTitle(null), "WOD");
    assert.equal(wodNumberLabel(20), "WOD #020");
    assert.equal(wodNumberLabel(null), null);
  });

  it("treats Pass #NNN and WOD #NNN as fallback, not nicknames", () => {
    assert.equal(wodNickname("Pass #020", 20), null);
    assert.equal(wodNickname("WOD #020", 20), null);
    assert.equal(wodNickname("pass 20", 20), null);
    assert.equal(wodNickname("WOD", 8), null);
    assert.equal(wodNickname("", 8), null);
    assert.equal(wodDisplayName("Pass #001", 1), "WOD #001");
    assert.equal(resolveWodTitle("", 20), "WOD #020");
  });

  it("keeps custom names like Helen-skalat and DL-våg", () => {
    assert.equal(wodNickname("Helen-skalat", 12), "Helen-skalat");
    assert.equal(wodDisplayName("Helen-skalat", 12), "Helen-skalat");
    assert.equal(wodDisplayName("DL-våg", 8), "DL-våg");
    assert.equal(resolveWodTitle("  DL-våg  ", 8), "DL-våg");
  });
});
