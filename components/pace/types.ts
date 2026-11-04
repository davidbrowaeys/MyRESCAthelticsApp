// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
/** Public contracts shared by every Pace module (rendering, state, messages, triggers). */

/** The seven states the application can ask Pace to display. */
export type PaceState = "idle" | "welcome" | "encourage" | "running" | "celebrate" | "tired" | "sleeping";

/** What is actually drawn: the public states plus two small click-only reactions. */
export type PaceVisual = PaceState | "hop" | "wiggle" | "run" | "jump" | "throw" | "spin";

/** Application-level triggers; map them to states in pace-events.ts. */
export type PaceEventName =
  | "appOpened"
  | "workoutStarted"
  | "workoutPaused"
  | "workoutCompleted"
  | "personalBest"
  | "targetPaceReached"
  | "athleteBehindTarget"
  | "inactivity";

/** Messages sent over the (window-level) command bus. */
export type PaceCommand =
  | { kind: "event"; name: PaceEventName; text?: string }
  | { kind: "state"; state: PaceState; text?: string }
  | { kind: "say"; text: string };
// __________________________GenAI: Generated code ends here______________________________
