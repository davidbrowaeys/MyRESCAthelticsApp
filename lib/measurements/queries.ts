// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { createClient } from "@/lib/supabase/server";
import { buildSeries, type MeasurementPoint } from "./bmi";
import type { AthleteRecord } from "@/lib/athletes";

/** All measurements of the athlete (RLS scopes them to the signed-in parent), oldest first, with BMI and age reference. */
export async function listMeasurements(athlete: Pick<AthleteRecord, "id" | "birthDate" | "gender">): Promise<MeasurementPoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("athlete_measurements")
    .select("id, measured_on, height_cm, weight_kg")
    .eq("athlete_id", athlete.id)
    .order("measured_on", { ascending: true });
  if (error || !data) return [];
  return buildSeries(
    data.map((r) => ({
      id: r.id,
      measuredOn: r.measured_on,
      heightCm: r.height_cm === null ? null : Number(r.height_cm),
      weightKg: r.weight_kg === null ? null : Number(r.weight_kg),
    })),
    { birthDate: athlete.birthDate, gender: athlete.gender },
  );
}
// __________________________GenAI: Generated code ends here______________________________
