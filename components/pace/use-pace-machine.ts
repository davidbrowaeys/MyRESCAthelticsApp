// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
"use client";
/** React binding for the pure machine: reaction timeouts and the inactivity -> sleeping timer. */
import { useCallback, useEffect, useReducer, useRef } from "react";
import { INITIAL_MACHINE, REACTION_MS, reduce, visualState } from "./pace-machine";

export function usePaceMachine(sleepAfterMs: number) {
  const [machine, dispatch] = useReducer(reduce, INITIAL_MACHINE);
  const sleepTimer = useRef<number | undefined>(undefined);
  const lastActivity = useRef(0);
  const sleepingRef = useRef(false);
  useEffect(() => {
    sleepingRef.current = machine.base === "sleeping";
  }, [machine.base]);

  const armSleepTimer = useCallback(() => {
    window.clearTimeout(sleepTimer.current);
    sleepTimer.current = window.setTimeout(() => dispatch({ type: "sleep" }), sleepAfterMs);
  }, [sleepAfterMs]);

  // Reactions return to the base state on their own.
  useEffect(() => {
    if (!machine.reaction) return;
    const id = window.setTimeout(() => dispatch({ type: "endReaction" }), REACTION_MS[machine.reaction]);
    return () => window.clearTimeout(id);
  }, [machine.reaction, machine.nonce]);

  // Re-arm after any state change (e.g. back to idle after running).
  useEffect(() => {
    armSleepTimer();
    return () => window.clearTimeout(sleepTimer.current);
  }, [armSleepTimer, machine.base]);

  /** Call on any user activity: wakes Pace and postpones sleep. Cheap when called often. */
  const activity = useCallback(() => {
    const now = Date.now();
    if (!sleepingRef.current && now - lastActivity.current < 1000) return;
    lastActivity.current = now;
    if (sleepingRef.current) dispatch({ type: "wake" });
    armSleepTimer();
  }, [armSleepTimer]);

  return { machine, visual: visualState(machine), dispatch, activity };
}
// __________________________GenAI: Generated code ends here______________________________
