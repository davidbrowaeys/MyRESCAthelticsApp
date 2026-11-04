// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { createClient } from "../supabase/server";
import { listProgressInputs } from "../results/queries";
import { evaluateAchievements } from "./engine";

export interface AchievementView {
  code: string;
  name: string;
  description: string;
  xp: number;
  earned: boolean;
}

/** Evaluates the rules and inserts missing awards. Safe to call repeatedly (unique athlete + code). Never throws. */
export async function awardAchievements(athleteId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const [results, parts] = await Promise.all([
      listProgressInputs(athleteId),
      supabase
        .from("participations")
        .select("id", { count: "exact", head: true })
        .eq("athlete_id", athleteId)
        .neq("status", "cancelled"),
    ]);
    const codes = evaluateAchievements({ participationCount: parts.count ?? 0, results });
    if (codes.length === 0) return;
    await supabase
      .from("achievements")
      .upsert(
        codes.map((definition_code) => ({ athlete_id: athleteId, definition_code })),
        { onConflict: "athlete_id,definition_code", ignoreDuplicates: true },
      );
  } catch {
    // Gamification must never break the primary action.
  }
}

export async function listAchievements(athleteId: string): Promise<AchievementView[]> {
  const supabase = await createClient();
  const [defs, mine] = await Promise.all([
    supabase.from("achievement_definitions").select("code, name_fr, description_fr, xp").order("xp", { ascending: true }),
    supabase.from("achievements").select("definition_code").eq("athlete_id", athleteId),
  ]);
  const earned = new Set((mine.data ?? []).map((a) => a.definition_code as string));
  return (defs.data ?? []).map((d) => ({
    code: d.code,
    name: d.name_fr,
    description: d.description_fr,
    xp: d.xp,
    earned: earned.has(d.code),
  }));
}
// __________________________GenAI: Generated code ends here______________________________
