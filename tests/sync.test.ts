// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Synthetic fixtures only. In-memory store stands in for Supabase.
import { describe, expect, it } from "vitest";
import { MOCK_ATHLETE_RESPONSE } from "../lib/beathletics/fixtures/athlete.sample";
import { MockCompetitionProvider } from "../lib/beathletics/mock-provider";
import { ProviderError, type CompetitionProvider } from "../lib/beathletics/provider";
import type { AthleteResult } from "../lib/domain/types";
import { resultKey, syncResults, toRow, type ResultRow, type SyncOutcome, type SyncStore } from "../lib/results/sync";

const N = MOCK_ATHLETE_RESPONSE.results.length;

function memoryStore() {
  const rows = new Map<string, ResultRow>();
  const runs: SyncOutcome[] = [];
  let started = 0;
  const store: SyncStore = {
    async loadExisting() {
      return new Map(rows);
    },
    async upsert(_a, list) {
      for (const r of list) rows.set(r.externalResultId, r);
    },
    async startRun() {
      started++;
      return `run-${started}`;
    },
    async finishRun(_id, o) {
      runs.push(o);
    },
  };
  return { store, rows, runs };
}

const failing = (code: ProviderError["code"]): CompetitionProvider =>
  new (class extends MockCompetitionProvider {
    override async getAthleteResults(): Promise<AthleteResult[]> {
      throw new ProviderError(code, "boom");
    }
  })();

describe("syncResults", () => {
  it("inserts on first run and is a no-op on the second", async () => {
    const { store, rows, runs } = memoryStore();
    const p = new MockCompetitionProvider();
    const first = await syncResults("a1", "9000001", p, store);
    expect(first).toMatchObject({ status: "success", itemsSeen: N, itemsWritten: N, itemsUpdated: 0, itemsUnchanged: 0 });
    const second = await syncResults("a1", "9000001", p, store);
    expect(second).toMatchObject({ status: "success", itemsWritten: 0, itemsUpdated: 0, itemsUnchanged: N });
    expect(rows.size).toBe(N);
    expect(runs).toHaveLength(2);
  });

  it("updates a result whose published values changed", async () => {
    const { store, rows } = memoryStore();
    await syncResults("a1", "9000001", new MockCompetitionProvider(), store);
    const existing = rows.get("m1")!;
    rows.set("m1", { ...existing, value: 9.9, display: "9.90" });
    const out = await syncResults("a1", "9000001", new MockCompetitionProvider(), store);
    expect(out).toMatchObject({ itemsWritten: 0, itemsUpdated: 1, itemsUnchanged: N - 1 });
    expect(rows.get("m1")!.value).toBe(9.5);
  });

  it("records a failed run with the provider error code and writes nothing", async () => {
    const { store, rows, runs } = memoryStore();
    const out = await syncResults("a1", "9000001", failing("BLOCKED"), store);
    expect(out).toMatchObject({ status: "failed", errorCode: "BLOCKED" });
    expect(rows.size).toBe(0);
    expect(runs).toEqual([out]);
  });

  it("fails fast without an audit run when no profile is linked", async () => {
    const { store, runs } = memoryStore();
    const out = await syncResults("a1", null, new MockCompetitionProvider(), store);
    expect(out).toMatchObject({ status: "failed", errorCode: "NO_PROFILE_LINK" });
    expect(runs).toHaveLength(0);
  });
});

describe("resultKey / toRow", () => {
  const base: AthleteResult = {
    competitionName: "[MOCK] M",
    eventDate: "2026-05-03",
    disciplineName: "60 m",
    display: "9.50",
    value: 9.5,
    kind: "time",
  };

  it("uses a deterministic fallback key when the id is missing", () => {
    expect(resultKey(base)).toBe(resultKey({ ...base }));
    expect(resultKey(base).startsWith("h:")).toBe(true);
    expect(resultKey({ ...base, externalResultId: "x1" })).toBe("x1");
  });

  it("drops results without a numeric value", () => {
    expect(toRow({ ...base, value: undefined })).toBeUndefined();
    expect(toRow(base)).toMatchObject({ lowerIsBetter: true, venueKind: "unknown", wind: null });
  });
});
// __________________________GenAI: Generated code ends here______________________________
