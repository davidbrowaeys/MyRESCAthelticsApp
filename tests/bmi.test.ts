// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { describe, expect, it } from "vitest";
import { bmiReference, bmiStatus, buildSeries, computeBmi, parseDecimal, summarize } from "../lib/measurements/bmi";

const row = (id: string, measuredOn: string, heightCm: number | null, weightKg: number | null) => ({
  id,
  measuredOn,
  heightCm,
  weightKg,
});

describe("computeBmi", () => {
  it("computes kg / m^2 with one decimal", () => {
    expect(computeBmi(150, 40)).toBe(17.8);
    expect(computeBmi(180, 72)).toBe(22.2);
  });
  it("returns null for missing or implausible input", () => {
    expect(computeBmi(null, 40)).toBeNull();
    expect(computeBmi(150, null)).toBeNull();
    expect(computeBmi(10, 40)).toBeNull();
    expect(computeBmi(150, 0)).toBeNull();
  });
});

describe("series and summary", () => {
  const rows = [row("c", "2026-03-01", null, 42), row("a", "2025-09-01", 145, 38), row("b", "2026-01-10", 150, null)];

  it("sorts by date and carries the last known height forward", () => {
    const s = buildSeries(rows);
    expect(s.map((p) => p.id)).toEqual(["a", "b", "c"]);
    expect(s[0]?.bmi).toBe(18.1);
    expect(s[1]?.bmi).toBeNull(); // no weight on that day
    expect(s[2]?.bmi).toBe(18.7); // 42 kg at the carried 150 cm
  });

  it("summarises latest values and deltas", () => {
    const sum = summarize(buildSeries(rows));
    expect(sum).toMatchObject({ heightCm: 150, weightKg: 42, bmi: 18.7, asOf: "2026-03-01", heightDelta: 5, weightDelta: 4 });
    expect(summarize([])).toBeNull();
  });
});

describe("bmi reference", () => {
  it("uses the CDC median / P5 / P85 for children and fixed limits for adults", () => {
    const boy10 = bmiReference({ birthDate: "2016-01-01", gender: "M" }, "2026-01-01");
    expect(boy10).toMatchObject({ basis: "child" });
    expect(boy10!.low).toBeGreaterThan(13);
    expect(boy10!.ideal).toBeGreaterThan(16);
    expect(boy10!.ideal).toBeLessThan(17.5);
    expect(boy10!.high).toBeGreaterThan(boy10!.ideal);
    expect(bmiReference({ birthDate: "2000-01-01", gender: "F" }, "2026-01-01")).toEqual({
      low: 18.5,
      ideal: 21.7,
      high: 24.9,
      basis: "adult",
    });
    expect(bmiReference({ birthDate: "2025-06-01", gender: "M" }, "2026-01-01")).toBeNull();
  });

  it("derives status and ideal weight range", () => {
    const person = { birthDate: "2014-05-10", gender: "F" as const };
    const sum = summarize(buildSeries([row("a", "2026-03-01", 150, 40)], person))!;
    expect(sum.reference?.basis).toBe("child");
    expect(sum.status).not.toBeNull();
    expect(sum.idealWeight!.min).toBeLessThan(sum.idealWeight!.ideal);
    expect(sum.idealWeight!.ideal).toBeLessThan(sum.idealWeight!.max);
    expect(bmiStatus(10, { low: 14, ideal: 16, high: 19, basis: "child" })).toBe("under");
    expect(bmiStatus(25, { low: 14, ideal: 16, high: 19, basis: "child" })).toBe("over");
  });
});

describe("parseDecimal", () => {
  it("accepts comma or dot decimals", () => {
    expect(parseDecimal("42,5")).toBe(42.5);
    expect(parseDecimal(" 150 ")).toBe(150);
  });
  it("rejects garbage and empty", () => {
    expect(parseDecimal("")).toBeNull();
    expect(parseDecimal("abc")).toBeNull();
    expect(parseDecimal("-3")).toBeNull();
    expect(parseDecimal(null)).toBeNull();
  });
});
// __________________________GenAI: Generated code ends here______________________________
