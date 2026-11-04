// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import type { Gender } from "./domain/types";
import { createClient } from "./supabase/server";

export interface AthleteRecord {
  id: string;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  birthDate: string;
  gender: Gender;
  clubCode: string;
  beathleticsLiveId: string | null;
}

/** The signed-in parent's athlete (MVP: one). RLS guarantees only their own rows are visible. */
export async function getCurrentAthlete(): Promise<AthleteRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("athletes")
    .select("id, first_name, last_name, nickname, birth_date, gender, club_code, beathletics_live_id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name ?? null,
    nickname: data.nickname ?? null,
    birthDate: data.birth_date,
    gender: data.gender === "F" ? "F" : "M",
    clubCode: data.club_code,
    beathleticsLiveId: data.beathletics_live_id ?? null,
  };
}
// __________________________GenAI: Generated code ends here______________________________
