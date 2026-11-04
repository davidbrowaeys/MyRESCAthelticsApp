// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { describe, expect, it } from "vitest";
import { expandSlots, isoWeekday } from "../lib/training/expand";

const wed = { id: "a", weekday: 3, startTime: "18:00", endTime: "20:00" };
const fri = { id: "b", weekday: 5, startTime: "18:00", endTime: "20:00" };

describe("isoWeekday", () => {
  it("maps Monday to 1 and Sunday to 7", () => {
    expect(isoWeekday("2026-11-02")).toBe(1);
    expect(isoWeekday("2026-11-08")).toBe(7);
  });
});

describe("expandSlots", () => {
  it("returns Wednesdays and Fridays in the range, sorted", () => {
    const r = expandSlots([fri, wed], "2026-11-02", "2026-11-08");
    expect(r.map((o) => o.date)).toEqual(["2026-11-04", "2026-11-06"]);
    expect(r[0]).toMatchObject({ slotId: "a", startTime: "18:00", endTime: "20:00" });
  });

  it("includes both range bounds", () => {
    expect(expandSlots([wed], "2026-11-04", "2026-11-04")).toHaveLength(1);
  });

  it("returns nothing without slots or for an inverted range", () => {
    expect(expandSlots([], "2026-11-01", "2026-11-30")).toEqual([]);
    expect(expandSlots([wed], "2026-11-30", "2026-11-01")).toEqual([]);
  });
});
// __________________________GenAI: Generated code ends here______________________________
