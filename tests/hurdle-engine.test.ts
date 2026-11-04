// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { describe, expect, it } from "vitest";
import {
  PLAYER_X,
  createState,
  makeObstacles,
  milestonesReached,
  multiplierFor,
  pickKind,
  scoreOf,
  speedAt,
  step,
  type ObstacleKind,
} from "../lib/game/hurdle-engine";

const rng = () => 0.5;
const DT = 1 / 60;

/** Plays one obstacle placed ahead with a jump at `jumpFrame`, held for `holdFrames`. */
function play(kind: ObstacleKind, jumpFrame: number, holdFrames: number): "cleared" | "hit" | "timeout" {
  const obstacles = makeObstacles(kind, PLAYER_X + 6, 6, 1000);
  const target = obstacles[0]!.id;
  let s = { ...createState(), obstacles, nextId: 2000 };
  for (let f = 0; f < 400; f++) {
    const pressed = f === jumpFrame;
    const held = f >= jumpFrame && f < jumpFrame + holdFrames;
    s = step(s, DT, { pressed, held }, rng);
    if (!s.alive) return "hit";
    if (s.obstacles.find((o) => o.id === target)?.cleared) return "cleared";
  }
  return "timeout";
}

function anyTiming(kind: ObstacleKind, holdFrames: number): Set<string> {
  const results = new Set<string>();
  for (let jumpFrame = 0; jumpFrame < 90; jumpFrame++) results.add(play(kind, jumpFrame, holdFrames));
  return results;
}

describe("speed", () => {
  it("grows with time and is capped", () => {
    expect(speedAt(0)).toBe(6);
    expect(speedAt(10)).toBeGreaterThan(speedAt(5));
    expect(speedAt(1000)).toBe(20);
  });
});

describe("obstacles", () => {
  it("a hurdle kills a runner who never jumps", () => {
    expect(play("hurdle", 9999, 0)).toBe("hit");
  });
  it("a tapped jump can clear a hurdle", () => {
    expect(anyTiming("hurdle", 1).has("cleared")).toBe(true);
  });
  it("a tapped jump never clears a steeple, a held jump can", () => {
    expect(anyTiming("steeple", 1).has("cleared")).toBe(false);
    expect(anyTiming("steeple", 30).has("cleared")).toBe(true);
  });
  it("a tapped jump never clears a pit, a held jump can", () => {
    expect(anyTiming("pit", 1).has("cleared")).toBe(false);
    expect(anyTiming("pit", 30).has("cleared")).toBe(true);
  });
  it("unlocks harder obstacles with distance", () => {
    expect(pickKind(0, () => 0.99)).toBe("hurdle");
    expect(pickKind(600, () => 0.99)).toBe("double");
  });
});

describe("scoring", () => {
  it("combo multiplier steps up every 5 clears, max x5", () => {
    expect(multiplierFor(0)).toBe(1);
    expect(multiplierFor(4)).toBe(1);
    expect(multiplierFor(5)).toBe(2);
    expect(multiplierFor(100)).toBe(5);
  });
  it("score is distance plus bonus", () => {
    const s = { ...createState(), distance: 120.9, bonus: 30 };
    expect(scoreOf(s)).toBe(150);
  });
  it("awards badge milestones at their thresholds", () => {
    expect(milestonesReached(99)).toEqual([]);
    expect(milestonesReached(100)).toEqual(["hurdle_100"]);
    expect(milestonesReached(1000)).toEqual(["hurdle_100", "hurdle_500", "hurdle_1000"]);
  });
});
// __________________________GenAI: Generated code ends here______________________________
