// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Idempotent results sync. Pure planning + an orchestrator over an injected store (testable without Supabase).
import type { AthleteResult } from "../domain/types";
import { ProviderError, type CompetitionProvider } from "../beathletics/provider";

export interface ResultRow {
  externalResultId: string;
  competitionExternalId: string | null;
  competitionName: string;
  eventDate: string;
  disciplineName: string;
  display: string;
  value: number;
  kind: "time" | "distance" | "other";
  lowerIsBetter: boolean;
  venueKind: "indoor" | "outdoor" | "unknown";
  wind: number | null;
  ranking: number | null;
  round: string | null;
  categoryCode: string | null;
}

export interface SyncStore {
  /** Existing rows for the athlete keyed by externalResultId. */
  loadExisting(athleteId: string): Promise<Map<string, ResultRow>>;
  upsert(athleteId: string, rows: ResultRow[]): Promise<void>;
  startRun(athleteId: string): Promise<string>;
  finishRun(runId: string, outcome: SyncOutcome): Promise<void>;
}

export interface SyncOutcome {
  status: "success" | "failed";
  itemsSeen: number;
  itemsWritten: number;
  itemsUpdated: number;
  itemsUnchanged: number;
  errorCode?: string;
}

export interface SyncPlan {
  inserts: ResultRow[];
  updates: ResultRow[];
  unchanged: number;
}

/** Stable key: the BeAthletics result id, else a deterministic composite so re-runs never duplicate. */
export function resultKey(r: AthleteResult): string {
  if (r.externalResultId) return r.externalResultId;
  return `h:${r.eventDate}|${r.disciplineName}|${r.value ?? ""}|${r.competitionName}`;
}

/** Maps a provider result to a row; returns undefined when it has no usable numeric value. */
export function toRow(r: AthleteResult): ResultRow | undefined {
  if (r.value === undefined || !Number.isFinite(r.value)) return undefined;
  return {
    externalResultId: resultKey(r),
    competitionExternalId: r.externalCompetitionId ?? null,
    competitionName: r.competitionName,
    eventDate: r.eventDate,
    disciplineName: r.disciplineName,
    display: r.display,
    value: r.value,
    kind: r.kind ?? "other",
    lowerIsBetter: r.lowerIsBetter ?? r.kind === "time",
    venueKind: r.venueKind ?? "unknown",
    wind: r.wind ?? null,
    ranking: r.ranking ?? null,
    round: r.round ?? null,
    categoryCode: r.categoryCode ?? null,
  };
}

function same(a: ResultRow, b: ResultRow): boolean {
  return (Object.keys(a) as (keyof ResultRow)[]).every((k) => a[k] === b[k]);
}

export function planSync(incoming: ResultRow[], existing: Map<string, ResultRow>): SyncPlan {
  const seen = new Set<string>();
  const plan: SyncPlan = { inserts: [], updates: [], unchanged: 0 };
  for (const row of incoming) {
    if (seen.has(row.externalResultId)) continue;
    seen.add(row.externalResultId);
    const old = existing.get(row.externalResultId);
    if (!old) plan.inserts.push(row);
    else if (same(old, row)) plan.unchanged++;
    else plan.updates.push(row);
  }
  return plan;
}

export async function syncResults(
  athleteId: string,
  liveId: string | null | undefined,
  provider: CompetitionProvider,
  store: SyncStore,
): Promise<SyncOutcome> {
  if (!liveId) {
    return { status: "failed", itemsSeen: 0, itemsWritten: 0, itemsUpdated: 0, itemsUnchanged: 0, errorCode: "NO_PROFILE_LINK" };
  }
  const runId = await store.startRun(athleteId);
  let outcome: SyncOutcome;
  try {
    const results = await provider.getAthleteResults(liveId);
    const rows = results.map(toRow).filter((r): r is ResultRow => r !== undefined);
    const plan = planSync(rows, await store.loadExisting(athleteId));
    const changed = [...plan.inserts, ...plan.updates];
    if (changed.length > 0) await store.upsert(athleteId, changed);
    outcome = {
      status: "success",
      itemsSeen: results.length,
      itemsWritten: plan.inserts.length,
      itemsUpdated: plan.updates.length,
      itemsUnchanged: plan.unchanged,
    };
  } catch (e) {
    const code = e instanceof ProviderError ? e.code : "SYNC_ERROR";
    outcome = { status: "failed", itemsSeen: 0, itemsWritten: 0, itemsUpdated: 0, itemsUnchanged: 0, errorCode: code };
  }
  await store.finishRun(runId, outcome);
  return outcome;
}
// __________________________GenAI: Generated code ends here______________________________
