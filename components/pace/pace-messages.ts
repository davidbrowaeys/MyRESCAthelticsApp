// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
/** Motivational messages. Text lives in lib/i18n (t.pace); each entry is a "|" separated list. */
import type { Dict } from "@/lib/i18n/fr";
import type { PaceVisual } from "./types";

export type PaceDict = Dict["pace"];
export type MessageKey = "welcome" | "encourage" | "running" | "celebrate" | "tired" | "sleeping" | "tap";
export type PaceMessages = Record<MessageKey, string[]>;

const KEYS: MessageKey[] = ["welcome", "encourage", "running", "celebrate", "tired", "sleeping", "tap"];

function split(value: string): string[] {
  return value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseMessages(dict: PaceDict): PaceMessages {
  const result = {} as PaceMessages;
  for (const key of KEYS) result[key] = split(dict[key]);
  return result;
}

/** Random entry that differs from `previous` when possible. */
export function pickMessage(list: readonly string[], previous?: string, random: () => number = Math.random): string | undefined {
  if (list.length === 0) return undefined;
  const pool = list.length > 1 ? list.filter((m) => m !== previous) : list;
  return pool[Math.floor(random() * pool.length)];
}

/** Which message list belongs to a visual (idle and click-only reactions have none). */
const SILENT_VISUALS = new Set<PaceVisual>(["idle", "hop", "wiggle", "run", "jump", "throw", "spin"]);

export function messageKeyFor(visual: PaceVisual): MessageKey | undefined {
  return SILENT_VISUALS.has(visual) ? undefined : (visual as MessageKey);
}
// __________________________GenAI: Generated code ends here______________________________
