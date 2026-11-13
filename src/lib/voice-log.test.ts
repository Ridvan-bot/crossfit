import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatSessionLogSummary,
  hasParsedSessionLog,
  parseSessionUtterance,
} from "./voice-log.ts";

const MOVEMENTS = [
  "Front Squat",
  "Hang Power Clean",
  "Deadlift",
  "Push-up",
];

describe("parseSessionUtterance", () => {
  it("parses the canonical after-workout example", () => {
    const parsed = parseSessionUtterance(
      "4 varv, RPE 7, känsla 4, front squat 50",
      MOVEMENTS
    );
    assert.equal(parsed.score_text, "4 varv");
    assert.equal(parsed.rpe_1_10, 7);
    assert.equal(parsed.feeling_1_5, 4);
    assert.deepEqual(parsed.lifts, [{ name: "Front Squat", weight_kg: 50 }]);
    assert.equal(
      formatSessionLogSummary(parsed),
      "4 varv · RPE 7 · känsla 4 · Front Squat 50 kg"
    );
    assert.equal(hasParsedSessionLog(parsed), true);
  });

  it("understands Swedish number words", () => {
    const parsed = parseSessionUtterance(
      "fyra varv RPE sju känsla fyra front squat femtio",
      MOVEMENTS
    );
    assert.equal(parsed.score_text, "4 varv");
    assert.equal(parsed.rpe_1_10, 7);
    assert.equal(parsed.feeling_1_5, 4);
    assert.deepEqual(parsed.lifts, [{ name: "Front Squat", weight_kg: 50 }]);
  });

  it("parses time scores and multiple lifts", () => {
    const parsed = parseSessionUtterance(
      "8.32 RPE 8 känsla 3 hang power clean 40, deadlift 60 kilo",
      MOVEMENTS
    );
    assert.equal(parsed.score_text, "8:32");
    assert.equal(parsed.rpe_1_10, 8);
    assert.equal(parsed.feeling_1_5, 3);
    assert.deepEqual(parsed.lifts, [
      { name: "Hang Power Clean", weight_kg: 40 },
      { name: "Deadlift", weight_kg: 60 },
    ]);
  });

  it("prefers workout-specific names and kg-before-name", () => {
    const parsed = parseSessionUtterance("50 kg front squat, RPE 6", [
      "Front Squat",
      "Hang Power Clean",
    ]);
    assert.equal(parsed.rpe_1_10, 6);
    assert.deepEqual(parsed.lifts, [{ name: "Front Squat", weight_kg: 50 }]);
  });

  it("returns empty when nothing training-related was said", () => {
    const parsed = parseSessionUtterance("hej", MOVEMENTS);
    assert.equal(hasParsedSessionLog(parsed), false);
    assert.equal(parsed.score_text, null);
    assert.equal(parsed.rpe_1_10, null);
    assert.equal(parsed.feeling_1_5, null);
    assert.deepEqual(parsed.lifts, []);
  });
});
