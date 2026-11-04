// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { describe, expect, it } from "vitest";
import {
  ageInSeason,
  baseCategoryCode,
  categoryFor,
  competitionEligibility,
  eligibleDisciplines,
  seasonYear,
} from "../lib/athletics/category";

describe("seasonYear", () => {
  it("rolls over on 1 November", () => {
    expect(seasonYear("2026-10-31")).toBe(2026);
    expect(seasonYear("2026-11-01")).toBe(2027);
    expect(seasonYear("2027-03-15")).toBe(2027);
  });
});

describe("categoryFor", () => {
  it("puts 2016/2017 births in Pupilles for season 2026-2027, 2017 = Pupille 1", () => {
    expect(categoryFor("2017-05-01", "2026-11-14")).toEqual({ code: "PUP", year: 1, verified: true });
    expect(categoryFor("2016-12-31", "2027-02-01")).toEqual({ code: "PUP", year: 2, verified: true });
  });
  it("moves up a band the following season", () => {
    expect(categoryFor("2017-05-01", "2028-02-01")).toMatchObject({ code: "PUP", year: 2 });
    expect(categoryFor("2017-05-01", "2029-02-01")?.code).toBe("MIN");
    expect(ageInSeason("2017-05-01", "2029-02-01")).toBe(12);
  });
  it("handles the season boundary", () => {
    expect(categoryFor("2017-05-01", "2026-10-31")?.code).toBe("BEN");
  });
  it("matches BeAthletics currentCategory per birth year on 2026-11-04", () => {
    const expected: Record<number, string> = {
      2019: "BEN", 2018: "BEN", 2017: "PUP", 2016: "PUP", 2015: "MIN", 2014: "MIN", 2013: "CAD", 2012: "CAD",
      2011: "SCO", 2010: "SCO", 2009: "JUN", 2008: "JUN", 2007: "U23", 2006: "U23", 2005: "U23", 2004: "SEN",
    };
    for (const [y, code] of Object.entries(expected)) {
      expect(categoryFor(`${y}-06-15`, "2026-11-04")?.code, y).toBe(code);
    }
    expect(categoryFor("2021-06-15", "2026-11-04")).toBeUndefined();
  });
  it("returns undefined for a birth date in the future", () => {
    expect(categoryFor("2031-01-01", "2026-11-14")).toBeUndefined();
  });
});

describe("baseCategoryCode", () => {
  it("strips the gender suffix", () => {
    expect(baseCategoryCode("pup m")).toBe("PUP");
    expect(baseCategoryCode("U23 W")).toBe("U23");
    expect(baseCategoryCode("M35")).toBe("M35");
  });
});

const disc = (codes: Array<[string, "M" | "F"]>) => ({
  categories: codes.map(([code, gender]) => ({ code, gender })),
});

describe("competitionEligibility", () => {
  const athlete = { gender: "M" as const, categoryCode: "PUP" };
  it("is unknown when no disciplines are published", () => {
    expect(competitionEligibility({ disciplines: [], eligibilityKnown: false } as never, athlete)).toBe("unknown");
  });
  it("is eligible when any discipline lists the category and gender", () => {
    const c = { eligibilityKnown: true, disciplines: [disc([["BEN M", "M"]]), disc([["PUP M", "M"]])] };
    expect(competitionEligibility(c as never, athlete)).toBe("eligible");
  });
  it("is not eligible for the other gender or category", () => {
    const c = { eligibilityKnown: true, disciplines: [disc([["PUP F", "F"], ["BEN M", "M"]])] };
    expect(competitionEligibility(c as never, athlete)).toBe("not_eligible");
  });
  it("treats TC (all categories) as eligible for the matching gender", () => {
    const c = { eligibilityKnown: true, disciplines: [disc([["TC M", "M"]])] };
    expect(competitionEligibility(c as never, athlete)).toBe("eligible");
  });
  it("filters disciplines", () => {
    const ds = [disc([["PUP M", "M"]]), disc([["CAD M", "M"]])];
    expect(eligibleDisciplines(ds, athlete)).toHaveLength(1);
  });
});
// __________________________GenAI: Generated code ends here______________________________
