// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { describe, expect, it } from "vitest";
import { INITIAL_MACHINE, reduce, visualState } from "../components/pace/pace-machine";
import { EVENT_TO_STATE } from "../components/pace/pace-events";
import { messageKeyFor, pickMessage } from "../components/pace/pace-messages";

describe("pace machine", () => {
  it("transient states are reactions that return to the base state", () => {
    let m = reduce(INITIAL_MACHINE, { type: "setState", state: "running" });
    m = reduce(m, { type: "setState", state: "celebrate" });
    expect(visualState(m)).toBe("celebrate");
    m = reduce(m, { type: "endReaction" });
    expect(visualState(m)).toBe("running");
  });

  it("sleeps only when idle and wakes on reaction or wake", () => {
    const running = reduce(INITIAL_MACHINE, { type: "setState", state: "running" });
    expect(reduce(running, { type: "sleep" }).base).toBe("running");
    const asleep = reduce(INITIAL_MACHINE, { type: "sleep" });
    expect(visualState(asleep)).toBe("sleeping");
    expect(reduce(asleep, { type: "wake" }).base).toBe("idle");
    expect(visualState(reduce(asleep, { type: "react", reaction: "hop" }))).toBe("hop");
    expect(reduce(asleep, { type: "react", reaction: "hop" }).base).toBe("idle");
  });

  it("repeating a reaction bumps the nonce", () => {
    const a = reduce(INITIAL_MACHINE, { type: "react", reaction: "hop" });
    expect(reduce(a, { type: "react", reaction: "hop" }).nonce).toBe(a.nonce + 1);
  });
});

describe("pace events and messages", () => {
  it("maps application events to states", () => {
    expect(EVENT_TO_STATE.workoutStarted).toBe("running");
    expect(EVENT_TO_STATE.personalBest).toBe("celebrate");
    expect(EVENT_TO_STATE.athleteBehindTarget).toBe("encourage");
    expect(EVENT_TO_STATE.inactivity).toBe("sleeping");
  });

  it("avoids repeating the previous message", () => {
    for (let i = 0; i < 20; i++) expect(pickMessage(["a", "b"], "a")).toBe("b");
    expect(pickMessage([], undefined)).toBeUndefined();
    expect(messageKeyFor("idle")).toBeUndefined();
    expect(messageKeyFor("tired")).toBe("tired");
  });
});
// __________________________GenAI: Generated code ends here______________________________
