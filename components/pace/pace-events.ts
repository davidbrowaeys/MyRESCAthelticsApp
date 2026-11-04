// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
/**
 * Application event triggers. Any client code can call emitPaceEvent("personalBest")
 * without importing the mascot itself; <Pace /> subscribes to the bus.
 */
import type { PaceCommand, PaceEventName, PaceState } from "./types";

export const EVENT_TO_STATE: Record<PaceEventName, PaceState> = {
  appOpened: "welcome",
  workoutStarted: "running",
  workoutPaused: "idle",
  workoutCompleted: "celebrate",
  personalBest: "celebrate",
  targetPaceReached: "encourage",
  athleteBehindTarget: "encourage",
  inactivity: "sleeping",
};

const BUS_EVENT = "pace:command";

export function sendPaceCommand(command: PaceCommand): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<PaceCommand>(BUS_EVENT, { detail: command }));
}

/** Tell Pace that something happened. `text` overrides the default random message. */
export function emitPaceEvent(name: PaceEventName, options?: { text?: string }): void {
  sendPaceCommand({ kind: "event", name, text: options?.text });
}

export function subscribePaceCommands(handler: (command: PaceCommand) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<PaceCommand>).detail);
  window.addEventListener(BUS_EVENT, listener);
  return () => window.removeEventListener(BUS_EVENT, listener);
}
// __________________________GenAI: Generated code ends here______________________________
