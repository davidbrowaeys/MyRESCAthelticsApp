// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
/** Hide/mute preference, persisted in localStorage and shared across components. */
import { useSyncExternalStore } from "react";

const KEY = "pace.enabled";
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}

export function setPaceEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(KEY, enabled ? "1" : "0");
  } catch {
    // Storage unavailable (private mode): fall through, listeners still re-read.
  }
  listeners.forEach((l) => l());
}

/** SSR renders enabled; the client corrects itself right after hydration. */
export function usePaceEnabled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
// __________________________GenAI: Generated code ends here______________________________
