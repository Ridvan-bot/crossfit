import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAthleteInsights,
  sessionNoteHintsFromNotes,
} from "./athlete.ts";

describe("sessionNoteHintsFromNotes", () => {
  it("reads knee stiffness and a movement that went well", () => {
    const hints = sessionNoteHintsFromNotes([
      "knät kändes stelt i sista varvet, burpees gick bra",
    ]);
    assert.deepEqual(hints.extra_constraints, ["knee_sensitive"]);
    assert.equal(hints.deload, true);
    assert.deepEqual(hints.prefer_movements, ["Burpee"]);
    assert.deepEqual(hints.avoid_movements, []);
  });

  it("avoids a movement that felt heavy", () => {
    const hints = sessionNoteHintsFromNotes(["Deadlift kändes tungt"]);
    assert.ok(hints.avoid_movements.includes("Deadlift"));
  });
});

describe("buildAthleteInsights", () => {
  it("stores recent comments and mentions them in the summary", () => {
    const insights = buildAthleteInsights("user-1", [
      {
        id: "s1",
        completed_at: "2026-11-16T10:00:00.000Z",
        score_text: "4 varv",
        feeling_1_5: 4,
        rpe_1_10: 7,
        notes: "knät kändes stelt i sista varvet, burpees gick bra",
        workouts: { title: "Pass #020", pass_number: 20 },
        session_lifts: [{ movement_name: "Front Squat", weight_kg: 50 }],
      },
    ]);

    assert.equal(
      insights.recent_sessions[0]?.notes,
      "knät kändes stelt i sista varvet, burpees gick bra"
    );
    assert.match(insights.summary_sv ?? "", /Senaste kommentar/);
    assert.match(insights.summary_sv ?? "", /knät kändes stelt/);
    assert.equal(insights.signals.needs_deload_hint, true);
    assert.deepEqual(insights.signals.from_notes?.prefer_movements, ["Burpee"]);
    assert.ok(insights.signals.from_notes?.extra_constraints.includes("knee_sensitive"));
  });
});
