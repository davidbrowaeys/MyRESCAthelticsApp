// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentAthlete } from "@/lib/athletes";
import { milestonesReached } from "@/lib/game/hurdle-engine";
import { createClient } from "@/lib/supabase/server";

const distanceSchema = z.number().int().min(0).max(100000);

/**
 * Awards the distance badges for a finished run and returns the newly earned codes.
 * The distance comes from the browser, so a determined user could fake it: acceptable for a fun game.
 */
export async function submitGameScore(distance: number): Promise<{ earned: string[] }> {
  const parsed = distanceSchema.safeParse(Math.floor(distance));
  if (!parsed.success) return { earned: [] };
  const codes = milestonesReached(parsed.data);
  if (codes.length === 0) return { earned: [] };

  const athlete = await getCurrentAthlete();
  if (!athlete) return { earned: [] };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("achievements")
    .select("definition_code")
    .eq("athlete_id", athlete.id)
    .in("definition_code", codes);
  const have = new Set((existing ?? []).map((a) => a.definition_code as string));
  const fresh = codes.filter((c) => !have.has(c));
  if (fresh.length === 0) return { earned: [] };

  const { error } = await supabase
    .from("achievements")
    .insert(fresh.map((definition_code) => ({ athlete_id: athlete.id, definition_code })));
  if (error) return { earned: [] };
  revalidatePath("/badges");
  return { earned: fresh };
}
// __________________________GenAI: Generated code ends here______________________________
