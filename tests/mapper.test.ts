// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { describe, expect, it } from "vitest";
import { MOCK_CALENDAR_RESPONSE } from "../lib/beathletics/fixtures/calendar.sample";
import { mapCalendarResponse, mapCompetitionDetail, toBrusselsDate } from "../lib/beathletics/mapper";
import { MockCompetitionProvider } from "../lib/beathletics/mock-provider";

describe("toBrusselsDate", () => {
  it("converts 23:00Z winter to next Brussels day", () => {
    expect(toBrusselsDate("2026-11-07T23:00:00.000Z")).toBe("2026-11-08");
  });
  it("converts 22:00Z summer to next Brussels day", () => {
    expect(toBrusselsDate("2027-04-17T22:00:00.000Z")).toBe("2027-04-18");
  });
  it("returns undefined for invalid input", () => {
    expect(toBrusselsDate("nope")).toBeUndefined();
    expect(toBrusselsDate(null)).toBeUndefined();
  });
});

describe("mapCalendarResponse", () => {
  const list = mapCalendarResponse(MOCK_CALENDAR_RESPONSE, undefined, "mock");
  const byId = (id: string) => list.find((c) => c.id === id)!;

  it("skips malformed items without failing the list", () => {
    expect(list.map((c) => c.id)).toEqual(["mock-0001", "mock-0002", "mock-0003"]);
  });

  it("deduplicates categories and trims names", () => {
    const d = byId("mock-0001").disciplines;
    expect(d).toHaveLength(2);
    expect(d[0]!.name).toBe("60m");
    expect(d[0]!.categories).toEqual([
      { code: "MIN", gender: "M" },
      { code: "CAD", gender: "M" },
    ]);
  });

  it("marks eligibility unknown when no disciplines", () => {
    expect(byId("mock-0002").eligibilityKnown).toBe(false);
    expect(byId("mock-0001").eligibilityKnown).toBe(true);
  });

  it("handles null endDate, null registration and numeric zip", () => {
    const c = byId("mock-0002");
    expect(c.endDate).toBe(c.startDate);
    expect(c.registration).toBeNull();
    expect(c.venue.postalCode).toBe("1000");
  });

  it("maps registration dates and venue kind", () => {
    const c = byId("mock-0001");
    expect(c.registration?.closesOn).toBe("2026-11-04");
    expect(c.venueKind).toBe("indoor");
    expect(byId("mock-0003").venueKind).toBe("outdoor");
    expect(c.dataOrigin).toBe("mock");
  });

  it("throws INVALID_RESPONSE for a wrong envelope", () => {
    expect(() => mapCalendarResponse({ foo: 1 })).toThrow(/Unexpected/);
  });
});

describe("mapCompetitionDetail with loosely typed fields", () => {
  const payload = {
    competition: {
      id: "synthetic-id",
      eventNumber: "F0000",
      name: "[MOCK] Indoor test",
      startDate: "2026-12-04T23:00:00.000Z",
      endDate: "2026-12-04T23:00:00.000Z",
      competitionStatus: "Scheduled",
      type: "Meeting ouvert",
      club: { abbr: "MCK", name: "[MOCK] Club" },
      venue: { name: "Stade", city: "Ville", zipCode: 7370, address: "Rue", number: "", geoLat: null, geoLon: 4.35 },
      metadata: { startTime: "10:00", website: null, price: 4 },
      registrationDetail: null,
      disciplines: [
        { id: "d1", name: "60 m", categories: [{ abbr: "BEN M", requiredGender: "Male" }], eventType: { venue: "I" } },
        { id: "d2", name: "60 m", categories: [{ abbr: "PUP M", requiredGender: "Male" }], eventType: { venue: "I" } },
      ],
    },
    results: [],
  };

  it("accepts a numeric price and coordinates", () => {
    const c = mapCompetitionDetail(payload);
    expect(c.price).toBe("4");
    expect(c.startTime).toBe("10:00");
    expect(c.longitude).toBe(4.35);
    expect(c.latitude).toBeUndefined();
    expect(c.registration).toBeNull();
    expect(c.disciplines).toHaveLength(2);
  });
});

describe("MockCompetitionProvider", () => {
  it("filters by club and date window", async () => {
    const p = new MockCompetitionProvider();
    const r = await p.getCompetitions(new Date("2026-01-01"), new Date("2027-12-31"), { clubs: ["RESC"] });
    expect(r.map((c) => c.id)).toEqual(["mock-0001", "mock-0003"]);
  });
});
