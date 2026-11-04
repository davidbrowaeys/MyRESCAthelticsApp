// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
/** Maps a click anywhere in the app to a Pace reaction (contextual first, random otherwise). Pure, no React. */
import type { Reaction } from "./pace-machine";

export const RANDOM_REACTIONS: readonly Reaction[] = ["run", "jump", "throw", "spin", "hop", "wiggle"];

const DESTRUCTIVE = /delete|remove|cancel|discard|clear|reset|verwijder|annuler|supprimer|annuleer/i;
const CONFIRM = /save|submit|add|create|confirm|done|finish|log|sign in|login|opslaan|toevoegen|enregistrer|ajouter/i;

export function randomReaction(random: () => number = Math.random): Reaction {
  return RANDOM_REACTIONS[Math.floor(random() * RANDOM_REACTIONS.length)] ?? "hop";
}

/** Pick a reaction that matches what was clicked; falls back to a random movement. */
export function reactionForClick(target: Element | null, random: () => number = Math.random): Reaction {
  const el = target?.closest("a, button, [role='button'], [role='link'], [role='tab'], input, select, textarea, label");
  if (!el) return randomReaction(random);
  const label = `${el.getAttribute("aria-label") ?? ""} ${el.textContent ?? ""}`.slice(0, 80);
  const tag = el.tagName.toLowerCase();
  if (DESTRUCTIVE.test(label)) return "throw"; // toss it away
  if (tag === "a" || el.getAttribute("role") === "link" || el.closest("nav")) return "run"; // heading somewhere
  if ((el as HTMLButtonElement).type === "submit" || CONFIRM.test(label)) return "jump"; // success
  if (tag === "input" || tag === "select" || tag === "textarea") return "encourage";
  return randomReaction(random);
}
// __________________________GenAI: Generated code ends here______________________________
