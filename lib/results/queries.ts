// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { createClient } from "../supabase/server";
import type { ProgressInput } from "./stats";

/** All stored results for the signed-in parent's athlete (RLS-scoped), for progress stats. */
export async function listProgressInputs(athleteId: string): Promise<ProgressInput[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("results")
    .select("external_result_id, event_date, discipline_name, competition_name, display, value, kind, lower_is_better, venue_kind, category_code")
    .eq("athlete_id", athleteId)
    .order("event_date", { ascending: true });
  if (error || !data) return [];
  return data.map((r) => ({
    externalResultId: r.external_result_id,
    eventDate: r.event_date,
    disciplineName: r.discipline_name,
    competitionName: r.competition_name,
    display: r.display,
    value: Number(r.value),
    kind: r.kind,
    lowerIsBetter: r.lower_is_better,
    venueKind: r.venue_kind,
    categoryCode: r.category_code,
  }));
}
// __________________________GenAI: Generated code ends here______________________________
