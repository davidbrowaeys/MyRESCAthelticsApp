// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { createClient } from "../supabase/server";

export interface SyncRunSummary {
  status: "running" | "success" | "failed";
  startedAt: string;
  itemsSeen: number;
  itemsWritten: number;
  itemsUpdated: number;
  itemsUnchanged: number;
  errorCode?: string;
}

/** Most recent results sync for the athlete (RLS-scoped). */
export async function getLastSyncRun(athleteId: string): Promise<SyncRunSummary | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sync_runs")
    .select("status, started_at, items_seen, items_written, items_updated, items_unchanged, error_code")
    .eq("athlete_id", athleteId)
    .eq("kind", "results")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    status: data.status,
    startedAt: data.started_at,
    itemsSeen: data.items_seen,
    itemsWritten: data.items_written,
    itemsUpdated: data.items_updated,
    itemsUnchanged: data.items_unchanged,
    errorCode: data.error_code ?? undefined,
  };
}
// __________________________GenAI: Generated code ends here______________________________
