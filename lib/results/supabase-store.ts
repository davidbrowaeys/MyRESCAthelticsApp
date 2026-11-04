// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { createClient } from "../supabase/server";
import type { ResultRow, SyncOutcome, SyncStore } from "./sync";

const COLUMNS =
  "external_result_id, competition_external_id, competition_name, event_date, discipline_name, display, value, kind, lower_is_better, venue_kind, wind, ranking, round, category_code";

interface DbRow {
  external_result_id: string;
  competition_external_id: string | null;
  competition_name: string;
  event_date: string;
  discipline_name: string;
  display: string;
  value: number | string;
  kind: ResultRow["kind"];
  lower_is_better: boolean;
  venue_kind: ResultRow["venueKind"];
  wind: number | string | null;
  ranking: number | null;
  round: string | null;
  category_code: string | null;
}

const num = (v: number | string | null): number | null => (v === null ? null : Number(v));

function fromDb(r: DbRow): ResultRow {
  return {
    externalResultId: r.external_result_id,
    competitionExternalId: r.competition_external_id,
    competitionName: r.competition_name,
    eventDate: r.event_date,
    disciplineName: r.discipline_name,
    display: r.display,
    value: Number(r.value),
    kind: r.kind,
    lowerIsBetter: r.lower_is_better,
    venueKind: r.venue_kind,
    wind: num(r.wind),
    ranking: r.ranking,
    round: r.round,
    categoryCode: r.category_code,
  };
}

/** Uses the signed-in parent's session; RLS scopes every statement to their athletes. */
export async function createSupabaseSyncStore(): Promise<SyncStore> {
  const supabase = await createClient();
  return {
    async loadExisting(athleteId) {
      const { data, error } = await supabase.from("results").select(COLUMNS).eq("athlete_id", athleteId);
      if (error) throw new Error("load_failed");
      return new Map((data as unknown as DbRow[]).map((r) => [r.external_result_id, fromDb(r)]));
    },
    async upsert(athleteId, rows) {
      const payload = rows.map((r) => ({
        athlete_id: athleteId,
        external_result_id: r.externalResultId,
        competition_external_id: r.competitionExternalId,
        competition_name: r.competitionName,
        event_date: r.eventDate,
        discipline_name: r.disciplineName,
        display: r.display,
        value: r.value,
        kind: r.kind,
        lower_is_better: r.lowerIsBetter,
        venue_kind: r.venueKind,
        wind: r.wind,
        ranking: r.ranking,
        round: r.round,
        category_code: r.categoryCode,
      }));
      const { error } = await supabase.from("results").upsert(payload, { onConflict: "athlete_id,external_result_id" });
      if (error) throw new Error("upsert_failed");
    },
    async startRun(athleteId) {
      const { data, error } = await supabase
        .from("sync_runs")
        .insert({ kind: "results", status: "running", athlete_id: athleteId })
        .select("id")
        .single();
      if (error || !data) throw new Error("audit_failed");
      return data.id as string;
    },
    async finishRun(runId, o: SyncOutcome) {
      await supabase
        .from("sync_runs")
        .update({
          status: o.status,
          finished_at: new Date().toISOString(),
          items_seen: o.itemsSeen,
          items_written: o.itemsWritten,
          items_updated: o.itemsUpdated,
          items_unchanged: o.itemsUnchanged,
          error_code: o.errorCode ?? null,
        })
        .eq("id", runId);
    },
  };
}
// __________________________GenAI: Generated code ends here______________________________
