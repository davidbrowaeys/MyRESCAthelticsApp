// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Synthetic data only.
import { describe, expect, it } from "vitest";
import { buildProgress, isBetter, type ProgressInput } from "../lib/results/stats";

const r = (id: string, date: string, value: number, over: Partial<ProgressInput> = {}): ProgressInput => ({
  externalResultId: id,
  eventDate: date,
  disciplineName: "60 m",
  competitionName: "[MOCK]",
  display: String(value),
  value,
  kind: "time",
  lowerIsBetter: true,
  venueKind: "outdoor",
  ...over,
});

describe("isBetter", () => {
  it("respects direction", () => {
    expect(isBetter(9, 10, true)).toBe(true);
    expect(isBetter(9, 10, false)).toBe(false);
  });
});

describe("buildProgress", () => {
  it("flags strict PBs chronologically regardless of input order", () => {
    const d = buildProgress([r("c", "2026-06-01", 9.2), r("a", "2026-04-01", 9.8), r("b", "2026-05-01", 9.9)])[0]!;
    expect(d.points.map((p) => p.id)).toEqual(["a", "b", "c"]);
    expect(d.points.map((p) => p.isPb)).toEqual([true, false, true]);
    expect(d.pb.value).toBe(9.2);
  });

  it("does not flag an equal result as a new PB", () => {
    const d = buildProgress([r("a", "2026-04-01", 9.5), r("b", "2026-05-01", 9.5)])[0]!;
    expect(d.points.map((p) => p.isPb)).toEqual([true, false]);
  });

  it("uses higher-is-better for distances and signs the improvement", () => {
    const d = buildProgress([
      r("a", "2026-04-01", 3.1, { disciplineName: "Longueur", kind: "distance", lowerIsBetter: false }),
      r("b", "2026-05-01", 3.4, { disciplineName: "Longueur", kind: "distance", lowerIsBetter: false }),
    ])[0]!;
    expect(d.pb.value).toBe(3.4);
    expect(d.improvement).toBeCloseTo(0.3);
  });

  it("improvement is positive when a time drops, undefined for one result", () => {
    const d = buildProgress([r("a", "2026-04-01", 10), r("b", "2026-05-01", 9.5)])[0]!;
    expect(d.improvement).toBeCloseTo(0.5);
    expect(buildProgress([r("a", "2026-04-01", 10)])[0]!.improvement).toBeUndefined();
  });

  it("SB is the best of the latest season only", () => {
    const d = buildProgress([r("old", "2024-05-01", 8.0), r("new1", "2026-05-01", 9.5), r("new2", "2026-06-01", 9.7)])[0]!;
    expect(d.pb.id).toBe("old");
    expect(d.sb.id).toBe("new1");
  });

  it("groups by discipline, newest activity first, ignoring non-finite values", () => {
    const out = buildProgress([
      r("a", "2026-04-01", 9.5),
      r("b", "2026-06-01", 20, { disciplineName: "200 m" }),
      r("c", "2026-05-01", Number.NaN),
    ]);
    expect(out.map((d) => d.name)).toEqual(["200 m", "60 m"]);
    expect(out[1]!.points).toHaveLength(1);
  });
});
// __________________________GenAI: Generated code ends here______________________________
