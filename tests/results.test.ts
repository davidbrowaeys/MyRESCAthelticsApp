// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Synthetic payloads only (modelled on the observed shape). No real athlete data.
import { describe, expect, it } from "vitest";
import { formatTime } from "../lib/domain/performance";
import { mapAthleteResults, mapAthleteSearch, mapCompetitionDetail } from "../lib/beathletics/mapper";

const entry = (over: Record<string, unknown> = {}, trial: Record<string, unknown> | null = {}) => ({
  resultId: "r1",
  personalRecord: true,
  venueType: "Indoor",
  category: { abbr: "PUP M" },
  result: {
    rank: 2,
    newTrials: trial
      ? [{ trialJson: { perf: 9050, perfType: "time", valid: true, best: true, ...trial }, windSpeed: null }]
      : [],
    discipline: {
      name: "60 metres",
      eventType: { name_fr: "60 m", result_type: "Time", low2high: 1 },
      competition: { eventNumber: "F0001", name: "[MOCK] Meeting", startDate: "2026-02-14T23:00:00.000Z" },
    },
  },
  ...over,
});

describe("formatTime", () => {
  it("formats seconds, minutes and hours", () => {
    expect(formatTime(9.05)).toBe("9.05");
    expect(formatTime(83.45)).toBe("1:23.45");
    expect(formatTime(3723.4)).toBe("1:02:03.40");
  });
});

describe("mapAthleteResults", () => {
  it("normalises time from ms to seconds, lower is better, Brussels date", () => {
    const [r] = mapAthleteResults({ results: [entry()] });
    expect(r).toMatchObject({
      value: 9.05,
      kind: "time",
      lowerIsBetter: true,
      display: "9.05",
      eventDate: "2026-02-15",
      venueKind: "indoor",
      personalBestFlag: true,
      ranking: 2,
      categoryCode: "PUP M",
    });
  });

  it("keeps distance in metres, higher is better", () => {
    const e = entry({}, { perf: 3.48, perfType: "distance" });
    (e.result.discipline.eventType as Record<string, unknown>) = { name_fr: "Longueur", result_type: "Distance", low2high: 0 };
    const [r] = mapAthleteResults({ results: [e] });
    expect(r).toMatchObject({ value: 3.48, kind: "distance", lowerIsBetter: false, display: "3.48 m" });
  });

  it("skips entries without a valid performance and malformed entries, dedupes", () => {
    const out = mapAthleteResults({
      results: [entry(), entry(), entry({ resultId: "r2" }, null), entry({ resultId: "r3" }, { valid: false }), { junk: 1 }],
    });
    expect(out.map((r) => r.externalResultId)).toEqual(["r1"]);
  });

  it("rejects a wrong envelope", () => {
    expect(() => mapAthleteResults({})).toThrow();
  });
});

describe("mapAthleteSearch", () => {
  it("maps entries and skips malformed ones", () => {
    const out = mapAthleteSearch({
      athletes: [
        { liveId: "1", person: { firstName: "Test", lastName: "Mock", birthYear: 2017, gender: "Male", currentCategory: "PUP M" }, club: null },
        { liveId: 2, person: { firstName: "Bad" } },
        { nope: true },
      ],
      competitions: [],
    });
    expect(out).toEqual([
      { externalId: "1", firstName: "Test", lastName: "Mock", clubCode: undefined, birthYear: 2017, gender: "M", currentCategory: "PUP M" },
    ]);
  });
  it("rejects a wrong envelope", () => {
    expect(() => mapAthleteSearch({})).toThrow();
  });
});

describe("mapCompetitionDetail", () => {
  it("adds detail-only fields", () => {
    const c = mapCompetitionDetail({
      competition: {
        id: "c1",
        eventNumber: "F0001",
        name: "[MOCK] Meeting",
        startDate: "2026-11-06T23:00:00.000Z",
        venue: { name: "Mock Park", geoLat: "50.67", geoLon: "4.38" },
        metadata: { startTime: "12:00", website: "example.org", price: "" },
        disciplines: [],
      },
    });
    expect(c).toMatchObject({ startDate: "2026-11-07", startTime: "12:00", latitude: 50.67, longitude: 4.38, website: "example.org" });
    expect(c.price).toBeUndefined();
  });

  it("throws INVALID_RESPONSE on a bad payload", () => {
    expect(() => mapCompetitionDetail({ competition: { id: 1 } })).toThrow();
  });
});
// __________________________GenAI: Generated code ends here______________________________
