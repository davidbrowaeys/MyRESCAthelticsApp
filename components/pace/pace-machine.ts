// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
/**
 * Pure animation state machine (no React, no DOM) so it is trivially testable.
 * A persistent `base` (idle / running / sleeping) with a timed `reaction` layered on top.
 */
import type { PaceState, PaceVisual } from "./types";

export type BaseState = "idle" | "running" | "sleeping";
export type Reaction = "welcome" | "encourage" | "celebrate" | "tired" | "hop" | "wiggle" | "run" | "jump" | "throw" | "spin";

export interface MachineState {
  base: BaseState;
  reaction: Reaction | null;
  /** Bumped on every reaction so repeating the same one restarts its timer. */
  nonce: number;
}

export type MachineAction =
  | { type: "setState"; state: PaceState }
  | { type: "react"; reaction: Reaction }
  | { type: "endReaction" }
  | { type: "sleep" }
  | { type: "wake" };

export const INITIAL_MACHINE: MachineState = { base: "idle", reaction: null, nonce: 0 };

export const REACTION_MS: Record<Reaction, number> = {
  welcome: 2800,
  encourage: 2400,
  celebrate: 3400,
  tired: 3800,
  hop: 750,
  wiggle: 750,
  run: 1500,
  jump: 950,
  throw: 1200,
  spin: 800,
};

export const CLICK_REACTIONS: readonly Reaction[] = ["welcome", "encourage", "hop", "wiggle"];

function withReaction(m: MachineState, reaction: Reaction): MachineState {
  // Any reaction wakes a sleeping Pace.
  return { base: m.base === "sleeping" ? "idle" : m.base, reaction, nonce: m.nonce + 1 };
}

export function reduce(m: MachineState, action: MachineAction): MachineState {
  switch (action.type) {
    case "setState": {
      const s = action.state;
      if (s === "idle" || s === "running" || s === "sleeping") return { base: s, reaction: null, nonce: m.nonce };
      return withReaction(m, s);
    }
    case "react":
      return withReaction(m, action.reaction);
    case "endReaction":
      return m.reaction === null ? m : { ...m, reaction: null };
    case "sleep":
      return m.base === "idle" && m.reaction === null ? { ...m, base: "sleeping" } : m;
    case "wake":
      return m.base === "sleeping" ? { ...m, base: "idle" } : m;
  }
}

export function visualState(m: MachineState): PaceVisual {
  return m.reaction ?? m.base;
}
// __________________________GenAI: Generated code ends here______________________________
