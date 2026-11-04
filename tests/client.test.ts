// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { describe, expect, it, vi } from "vitest";
import { BeAthleticsClient, buildCalendarUrl } from "../lib/beathletics/client";

const noSleep = () => Promise.resolve();
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), { status, headers });
const make = (fetchImpl: typeof fetch, sleep = noSleep) =>
  new BeAthleticsClient({ fetchImpl, sleep, maxRetries: 2 });
const range = [new Date(0), new Date(1000)] as const;

describe("buildCalendarUrl", () => {
  it("repeats clubs and types", () => {
    const u = buildCalendarUrl("https://x", ...range, { clubs: ["RESC", "ACBB"], types: ["Interclubs"] });
    expect(u).toContain("clubs=RESC&clubs=ACBB");
    expect(u).toContain("types=Interclubs");
    expect(u).toContain("loaded=50");
  });
});

describe("BeAthleticsClient", () => {
  it("returns parsed JSON", async () => {
    const f = vi.fn().mockResolvedValue(json({ competitions: [] }));
    await expect(make(f).getCalendar(...range)).resolves.toEqual({ competitions: [] });
  });

  it("retries 500 then succeeds", async () => {
    const f = vi.fn().mockResolvedValueOnce(json("x", 500)).mockResolvedValueOnce(json({ ok: 1 }));
    await expect(make(f).getCalendar(...range)).resolves.toEqual({ ok: 1 });
    expect(f).toHaveBeenCalledTimes(2);
  });

  it("honours Retry-After on 429", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const f = vi
      .fn()
      .mockResolvedValueOnce(json("", 429, { "Retry-After": "2" }))
      .mockResolvedValueOnce(json({ ok: 1 }));
    await make(f, sleep).getCalendar(...range);
    expect(sleep).toHaveBeenCalledWith(2000);
  });

  it("gives up with RATE_LIMITED after retries", async () => {
    const f = vi.fn().mockImplementation(async () => json("", 429));
    await expect(make(f).getCalendar(...range)).rejects.toMatchObject({ code: "RATE_LIMITED" });
    expect(f).toHaveBeenCalledTimes(3);
  });

  it("does not retry 4xx; 403 is BLOCKED", async () => {
    const f = vi.fn().mockResolvedValue(json("", 403));
    await expect(make(f).getCalendar(...range)).rejects.toMatchObject({ code: "BLOCKED" });
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("rejects HTML instead of JSON", async () => {
    const f = vi.fn().mockResolvedValue(json("<html></html>"));
    await expect(make(f).getCalendar(...range)).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("maps timeouts", async () => {
    const err = Object.assign(new Error("t"), { name: "TimeoutError" });
    const f = vi.fn().mockRejectedValue(err);
    await expect(make(f).getCalendar(...range)).rejects.toMatchObject({ code: "TIMEOUT" });
  });
});
