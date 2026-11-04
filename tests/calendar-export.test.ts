// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { describe, expect, it } from "vitest";
import { addDays, buildGoogleCalendarUrl, buildIcs, buildOutlookUrl } from "../lib/calendar/export";

const ev = {
  uid: "p1@my-resc-athletics",
  title: "Meeting, test; d'ouverture",
  startDate: "2026-12-31",
  endDate: "2027-01-01",
  location: "Parc Allard, Braine",
  description: "60 m\nLongueur",
  url: "https://www.beathletics.be/calendar",
};

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
  it("rejects invalid dates", () => {
    expect(() => addDays("nope", 1)).toThrow();
  });
});

describe("calendar URLs", () => {
  it("builds a Google URL with an exclusive end date", () => {
    const u = new URL(buildGoogleCalendarUrl(ev));
    expect(u.origin + u.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(u.searchParams.get("action")).toBe("TEMPLATE");
    expect(u.searchParams.get("text")).toBe(ev.title);
    expect(u.searchParams.get("dates")).toBe("20261231/20270102");
    expect(u.searchParams.get("location")).toBe(ev.location);
  });
  it("builds an Outlook URL for an all-day event", () => {
    const u = new URL(buildOutlookUrl(ev));
    expect(u.searchParams.get("startdt")).toBe("2026-12-31");
    expect(u.searchParams.get("enddt")).toBe("2027-01-02");
    expect(u.searchParams.get("allday")).toBe("true");
    expect(u.searchParams.get("subject")).toBe(ev.title);
  });
});

describe("buildIcs", () => {
  const ics = buildIcs([ev], new Date("2026-11-04T12:00:00Z"));
  it("is a well-formed all-day calendar with CRLF endings", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTAMP:20261104T120000Z");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261231");
    expect(ics).toContain("DTEND;VALUE=DATE:20270102");
    expect(ics).toContain("UID:p1@my-resc-athletics");
  });
  it("escapes commas, semicolons and newlines", () => {
    expect(ics).toContain("SUMMARY:Meeting\\, test\\; d'ouverture");
    expect(ics).toContain("DESCRIPTION:60 m\\nLongueur\\nhttps://www.beathletics.be/calendar");
  });
  it("folds long lines at 75 octets", () => {
    const long = buildIcs([{ ...ev, title: "é".repeat(100) }]);
    for (const line of long.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});
// __________________________GenAI: Generated code ends here______________________________
