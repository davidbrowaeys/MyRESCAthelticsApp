// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
"use client";
/** Imperative API for the rest of the app: const { react, setState, say } = usePace(); */
import { useMemo } from "react";
import { emitPaceEvent, sendPaceCommand } from "./pace-events";
import { setPaceEnabled, usePaceEnabled } from "./pace-settings";
import type { PaceState } from "./types";

export function usePace() {
  const enabled = usePaceEnabled();
  return useMemo(
    () => ({
      enabled,
      setEnabled: setPaceEnabled,
      setState: (state: PaceState, text?: string) => sendPaceCommand({ kind: "state", state, text }),
      react: emitPaceEvent,
      say: (text: string) => sendPaceCommand({ kind: "say", text }),
    }),
    [enabled],
  );
}
// __________________________GenAI: Generated code ends here______________________________
