// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { describe, expect, it } from "vitest";
import { disciplinePictogram } from "../lib/results/discipline";

describe("disciplinePictogram", () => {
  it.each([
    ["60 m", "sprint"],
    ["60 m haies", "hurdles"],
    ["1000 m", "run"],
    ["Saut en longueur", "longJump"],
    ["Triple saut", "longJump"],
    ["Saut en hauteur", "highJump"],
    ["Saut à la perche", "poleVault"],
    ["Lancer du poids", "shotPut"],
    ["Disque", "discus"],
    ["Javelot", "javelin"],
    ["Marteau", "hammer"],
    ["Balle de 200 g", "throw"],
    ["4 x 60 m relais", "relay"],
    ["Marche 2000 m", "walk"],
    ["Kogelstoten", "shotPut"],
    ["Hoogspringen", "highJump"],
  ])("%s -> %s", (name, expected) => {
    expect(disciplinePictogram(name)).toBe(expected);
  });
});
// __________________________GenAI: Generated code ends here______________________________
