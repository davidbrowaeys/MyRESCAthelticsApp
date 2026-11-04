// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Synthetic data only.
import { describe, expect, it } from "vitest";
import { evaluateAchievements } from "../lib/gamification/engine";
import type { ProgressInput } from "../lib/results/stats";

const r = (id: string, date: string, value: number, comp = `[MOCK] ${id}`): ProgressInput => ({
  externalResultId: id,
  eventDate: date,
  disciplineName: "60 m",
  competitionName: comp,
  display: String(value),
  value,
  kind: "time",
  lowerIsBetter: true,
  venueKind: "outdoor",
});

describe("evaluateAchievements", () => {
  it("awards nothing with no activity", () => {
    expect(evaluateAchievements({ participationCount: 0, results: [] })).toEqual([]);
  });

  it("first participation and first result", () => {
    expect(evaluateAchievements({ participationCount: 1, results: [r("a", "2026-04-01", 9.5)] })).toEqual([
      "first_participation",
      "first_result",
    ]);
  });

  it("first_pb needs an earlier result to beat", () => {
    const one = evaluateAchievements({ participationCount: 0, results: [r("a", "2026-04-01", 9.5)] });
    expect(one).not.toContain("first_pb");
    const two = evaluateAchievements({
      participationCount: 0,
      results: [r("a", "2026-04-01", 9.5), r("b", "2026-05-01", 9.4)],
    });
    expect(two).toContain("first_pb");
    const worse = evaluateAchievements({
      participationCount: 0,
      results: [r("a", "2026-04-01", 9.5), r("b", "2026-05-01", 9.9)],
    });
    expect(worse).not.toContain("first_pb");
  });

  it("five_competitions counts distinct competitions", () => {
    const same = ["a", "b", "c", "d", "e"].map((id, i) => r(id, `2026-0${i + 1}-10`, 9, "[MOCK] Same"));
    expect(evaluateAchievements({ participationCount: 0, results: same })).not.toContain("five_competitions");
    const distinct = ["a", "b", "c", "d", "e"].map((id, i) => r(id, `2026-0${i + 1}-10`, 9));
    expect(evaluateAchievements({ participationCount: 0, results: distinct })).toContain("five_competitions");
  });

  it("season_consistency needs three consecutive months, across a year boundary too", () => {
    const gap = [r("a", "2026-03-01", 9), r("b", "2026-04-01", 9), r("c", "2026-06-01", 9)];
    expect(evaluateAchievements({ participationCount: 0, results: gap })).not.toContain("season_consistency");
    const run = [r("a", "2025-11-20", 9), r("b", "2025-12-05", 9), r("c", "2026-01-15", 9)];
    expect(evaluateAchievements({ participationCount: 0, results: run })).toContain("season_consistency");
  });
});
// __________________________GenAI: Generated code ends here______________________________
