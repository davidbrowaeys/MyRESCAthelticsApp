// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { createClient } from "@/lib/supabase/server";
import type { TrainingSlot } from "./expand";

/** The athlete's weekly training slots (RLS limits rows to the signed-in parent's athletes). */
export async function listTrainingSlots(athleteId: string): Promise<TrainingSlot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("athlete_training_slots")
    .select("id, weekday, start_time, end_time")
    .eq("athlete_id", athleteId)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    weekday: r.weekday,
    startTime: String(r.start_time).slice(0, 5),
    endTime: String(r.end_time).slice(0, 5),
  }));
}
// __________________________GenAI: Generated code ends here______________________________
