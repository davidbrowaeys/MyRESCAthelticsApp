// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Pure helpers to group disciplines for display (icon family, anchor id).
export type DisciplineFamily = "run" | "jump" | "throw";

const JUMP = /longueur|hauteur|perche|triple|saut|long jump|high jump|pole vault/i;
const THROW = /poids|disque|javelot|marteau|balle|vortex|lancer|shot|discus|javelin|hammer|throw/i;

export function disciplineFamily(name: string): DisciplineFamily {
  if (THROW.test(name)) return "throw";
  if (JUMP.test(name)) return "jump";
  return "run";
}

export type Pictogram =
  | "sprint"
  | "run"
  | "hurdles"
  | "relay"
  | "walk"
  | "longJump"
  | "highJump"
  | "poleVault"
  | "shotPut"
  | "discus"
  | "javelin"
  | "hammer"
  | "throw";

const PICTOGRAM_RULES: Array<[RegExp, Pictogram]> = [
  [/haies|hurdle|horden|steeple|obstacle/i, "hurdles"],
  [/relais|relay|estafette|4\s*x/i, "relay"],
  [/marche|walk|wandel/i, "walk"],
  [/perche|pole|polsstok/i, "poleVault"],
  [/hauteur|high jump|hoogspringen/i, "highJump"],
  [/longueur|triple|long jump|verspringen|hink/i, "longJump"],
  [/poids|shot|kogel/i, "shotPut"],
  [/disque|discus/i, "discus"],
  [/javelot|javelin|speer/i, "javelin"],
  [/marteau|hammer/i, "hammer"],
  [/balle|vortex|lancer|throw|bal\b/i, "throw"],
  [/^\s*(40|50|60|80|100|150|200|300)\s*m\b|sprint/i, "sprint"],
];

/** Which athlete pictogram to draw for a discipline name (French, Dutch or English). Distance running is the fallback. */
export function disciplinePictogram(name: string): Pictogram {
  return PICTOGRAM_RULES.find(([re]) => re.test(name))?.[1] ?? "run";
}

/** Stable DOM id for a discipline section, e.g. "60 m haies" -> "d-60-m-haies". */
export function disciplineAnchor(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `d-${slug || "x"}`;
}
// __________________________GenAI: Generated code ends here______________________________
