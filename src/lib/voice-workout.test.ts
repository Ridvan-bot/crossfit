import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMPTY_PREFERENCES, type AthleteInsights } from "./athlete.ts";
import {
  formatWorkoutPlanSummary,
  hasParsedWorkoutPlan,
  parseWorkoutUtterance,
} from "./voice-workout.ts";

function workingNames(transcript: string, context = {}) {
  const parsed = parseWorkoutUtterance(transcript, context);
  return parsed.sections
    .filter((s) => s.kind !== "warmup")
    .map((s) => ({
      kind: s.kind,
      names: s.movements.map((m) => m.name),
    }));
}

describe("parseWorkoutUtterance", () => {
  it("parses the canonical teknik + styrka, ingen flås example", () => {
    const parsed = parseWorkoutUtterance("teknik och styrka, ingen flås");
    assert.equal(hasParsedWorkoutPlan(parsed), true);
    assert.equal(parsed.layoutId, "skill_strength");
    assert.equal(parsed.title, "Teknik + styrka");
    const kinds = parsed.sections.map((s) => s.kind);
    assert.deepEqual(kinds, ["warmup", "technique", "strength"]);
    const technique = parsed.sections.find((s) => s.kind === "technique");
    const strength = parsed.sections.find((s) => s.kind === "strength");
    assert.ok(technique?.movements.some((m) => m.name === "Hang Power Clean"));
    assert.ok(strength?.movements.some((m) => m.name === "Front Squat"));
    assert.match(formatWorkoutPlanSummary(parsed), /Teknik \+ styrka/);
    assert.match(formatWorkoutPlanSummary(parsed), /Hang Power Clean/);
    assert.match(formatWorkoutPlanSummary(parsed), /Front Squat/);
  });

  it("maps WOD, EMOM and styrka + WOD", () => {
    assert.equal(parseWorkoutUtterance("WOD").layoutId, "wod");
    assert.equal(parseWorkoutUtterance("EMOM").layoutId, "emom");
    assert.equal(
      parseWorkoutUtterance("styrka och wod").layoutId,
      "strength_wod"
    );
    assert.equal(
      parseWorkoutUtterance("teknik och wod").layoutId,
      "skill_wod"
    );
  });

  it("drops metcon when the athlete says ingen flås", () => {
    const parsed = parseWorkoutUtterance("wod ingen flås");
    assert.equal(parsed.layoutId, "weightlifting");
    assert.ok(!parsed.sections.some((s) => s.kind === "metcon"));
  });

  it("places spoken lifts on the matching parts", () => {
    const parsed = parseWorkoutUtterance(
      "teknik och styrka, hang power clean och front squat, ingen flås"
    );
    const byKind = Object.fromEntries(
      workingNames("teknik och styrka, hang power clean och front squat, ingen flås").map(
        (s) => [s.kind, s.names]
      )
    );
    assert.deepEqual(byKind.technique, ["Hang Power Clean"]);
    assert.deepEqual(byKind.strength, ["Front Squat"]);
    assert.equal(parsed.warmupTheme, "clean");
  });

  it("infers a snatch skill day from the movement", () => {
    const parsed = parseWorkoutUtterance("hang power snatch");
    assert.equal(parsed.layoutId, "skill");
    assert.equal(parsed.warmupTheme, "snatch");
    const technique = parsed.sections.find((s) => s.kind === "technique");
    assert.deepEqual(
      technique?.movements.map((m) => m.name),
      ["Hang Power Snatch"]
    );
  });

  it("uses official aliases like marklyft", () => {
    const parsed = parseWorkoutUtterance("styrka marklyft");
    assert.equal(parsed.layoutId, "weightlifting");
    const strength = parsed.sections.find((s) => s.kind === "strength");
    assert.deepEqual(strength?.movements.map((m) => m.name), ["Deadlift"]);
    assert.equal(parsed.warmupTheme, "hinge");
  });

  it("prefers fun movements and skips avoided ones", () => {
    const parsed = parseWorkoutUtterance("teknik", {
      preferences: {
        ...EMPTY_PREFERENCES,
        fun_movements: ["Hang Power Snatch"],
        avoid_movements: ["Hang Power Clean"],
      },
    });
    const technique = parsed.sections.find((s) => s.kind === "technique");
    assert.deepEqual(
      technique?.movements.map((m) => m.name),
      ["Hang Power Snatch"]
    );
  });

  it("scales suggested weight from insights", () => {
    const insights = {
      movement_best: { "Front Squat": { weight_kg: 50 } },
    } as unknown as AthleteInsights;
    const parsed = parseWorkoutUtterance("styrka front squat", { insights });
    const strength = parsed.sections.find((s) => s.kind === "strength");
    assert.equal(strength?.movements[0]?.suggested_weight_kg, 35);
  });

  it("skips knee-stressing metcon work after a stiff-knee comment", () => {
    const insights = {
      recent_sessions: [
        { notes: "knät kändes stelt i sista varvet, burpees gick bra" },
      ],
    } as unknown as AthleteInsights;
    const parsed = parseWorkoutUtterance("wod", { insights });
    const metcon = parsed.sections.find((s) => s.kind === "metcon");
    const names = metcon?.movements.map((m) => m.name) ?? [];
    assert.ok(names.includes("Burpee"));
    assert.ok(!names.includes("Walking Lunge"));
  });

  it("deloads suggested weight after a stiff comment", () => {
    const insights = {
      movement_best: { "Front Squat": { weight_kg: 50 } },
      recent_sessions: [{ notes: "knät kändes stelt" }],
    } as unknown as AthleteInsights;
    const parsed = parseWorkoutUtterance("styrka front squat", { insights });
    const strength = parsed.sections.find((s) => s.kind === "strength");
    assert.equal(strength?.movements[0]?.suggested_weight_kg, 30);
  });

  it("returns unrecognized for chatter", () => {
    const parsed = parseWorkoutUtterance("hej");
    assert.equal(hasParsedWorkoutPlan(parsed), false);
  });
});
