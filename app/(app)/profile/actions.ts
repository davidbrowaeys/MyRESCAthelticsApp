// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentAthlete } from "@/lib/athletes";
import { getProvider } from "@/lib/beathletics/factory";
import { toBrusselsDate } from "@/lib/beathletics/mapper";
import { awardAchievements } from "@/lib/gamification/awards";
import { LIMITS, parseDecimal } from "@/lib/measurements/bmi";
import { createSupabaseSyncStore } from "@/lib/results/supabase-store";
import { syncResults } from "@/lib/results/sync";
import { createClient } from "@/lib/supabase/server";

const athleteSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["M", "F"]),
});

export async function createAthlete(formData: FormData): Promise<void> {
  const parsed = athleteSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    gender: formData.get("gender"),
  });
  if (!parsed.success) redirect("/profile?error=1");

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");

  // Bootstrap the parent profile row (RLS: id must equal auth.uid()).
  const profile = await supabase.from("profiles").upsert({ id: userId }, { onConflict: "id" });
  if (profile.error) redirect("/profile?error=1");

  const { error } = await supabase.from("athletes").insert({
    parent_id: userId,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    birth_date: parsed.data.birthDate,
    gender: parsed.data.gender,
  });
  if (error) redirect("/profile?error=1");

  revalidatePath("/", "layout");
  redirect("/profile");
}

async function runSync(athleteId: string, liveId: string): Promise<boolean> {
  const outcome = await syncResults(athleteId, liveId, getProvider(), await createSupabaseSyncStore());
  if (outcome.status === "success") await awardAchievements(athleteId);
  return outcome.status === "success";
}

/** Stores the chosen BeAthletics liveId on the athlete, then runs a first sync. */
export async function linkBeAthleticsProfile(formData: FormData): Promise<void> {
  const parsed = z.string().regex(/^\d{1,12}$/).safeParse(formData.get("liveId"));
  if (!parsed.success) redirect("/settings?error=link");
  const athlete = await getCurrentAthlete();
  if (!athlete) redirect("/settings?error=link");

  const supabase = await createClient();
  const { error } = await supabase
    .from("athletes")
    .update({ beathletics_live_id: parsed.data })
    .eq("id", athlete.id);
  if (error) redirect("/settings?error=link");

  const ok = await runSync(athlete.id, parsed.data);
  revalidatePath("/", "layout");
  redirect(ok ? "/settings?synced=1" : "/settings?error=sync");
}

export async function resyncResults(): Promise<void> {
  const athlete = await getCurrentAthlete();
  if (!athlete?.beathleticsLiveId) redirect("/settings?error=link");
  const ok = await runSync(athlete.id, athlete.beathleticsLiveId);
  revalidatePath("/", "layout");
  redirect(ok ? "/settings?synced=1" : "/settings?error=sync");
}

/** Adds or updates the measurement of a day; a field left empty keeps the value already stored for that day. */
export async function saveMeasurement(formData: FormData): Promise<void> {
  const athlete = await getCurrentAthlete();
  if (!athlete) redirect("/profile");
  const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(formData.get("measuredOn"));
  const rawHeight = String(formData.get("heightCm") ?? "").trim();
  const rawWeight = String(formData.get("weightKg") ?? "").trim();
  const height = rawHeight ? parseDecimal(rawHeight) : null;
  const weight = rawWeight ? parseDecimal(rawWeight) : null;
  const today = toBrusselsDate(new Date().toISOString()) ?? "";
  const badHeight = rawHeight !== "" && (height === null || height < LIMITS.height.min || height > LIMITS.height.max);
  const badWeight = rawWeight !== "" && (weight === null || weight < LIMITS.weight.min || weight > LIMITS.weight.max);
  if (!date.success || date.data > today || badHeight || badWeight || (height === null && weight === null)) {
    redirect("/profile?error=measure");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("athlete_measurements")
    .select("height_cm, weight_kg")
    .eq("athlete_id", athlete.id)
    .eq("measured_on", date.data)
    .maybeSingle();
  const { error } = await supabase.from("athlete_measurements").upsert(
    {
      athlete_id: athlete.id,
      measured_on: date.data,
      height_cm: height ?? existing?.height_cm ?? null,
      weight_kg: weight ?? existing?.weight_kg ?? null,
    },
    { onConflict: "athlete_id,measured_on" },
  );
  if (error) redirect("/profile?error=measure");
  revalidatePath("/", "layout");
  redirect("/profile?measured=1");
}

export async function deleteMeasurement(formData: FormData): Promise<void> {
  const id = z.string().uuid().safeParse(formData.get("id"));
  const athlete = await getCurrentAthlete();
  if (!id.success || !athlete) redirect("/profile");
  const supabase = await createClient();
  await supabase.from("athlete_measurements").delete().eq("id", id.data).eq("athlete_id", athlete.id);
  revalidatePath("/", "layout");
  redirect("/profile");
}

const detailsSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  nickname: z.string().trim().max(30),
  phone: z.string().trim().regex(/^([+0-9 ()./-]{6,20})?$/),
  contactEmail: z.string().trim().max(120).refine((v) => v === "" || z.string().email().safeParse(v).success),
});

/** Saves the optional nickname (athlete) and the contact details (parent). Empty values clear the field. */
export async function saveDetails(formData: FormData): Promise<void> {
  const parsed = detailsSchema.safeParse({
    firstName: formData.get("firstName") ?? "",
    lastName: formData.get("lastName") ?? "",
    nickname: formData.get("nickname") ?? "",
    phone: formData.get("phone") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
  });
  if (!parsed.success) redirect("/profile/edit?error=details");
  const athlete = await getCurrentAthlete();
  if (!athlete) redirect("/profile/edit?error=details");

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");

  const d = parsed.data;
  const [profile, athleteRes] = await Promise.all([
    supabase.from("profiles").upsert(
      { id: userId, phone: d.phone || null, contact_email: d.contactEmail || null },
      { onConflict: "id" },
    ),
    supabase.from("athletes").update({ first_name: d.firstName, last_name: d.lastName, nickname: d.nickname || null }).eq("id", athlete.id),
  ]);
  if (profile.error || athleteRes.error) redirect("/profile/edit?error=details");
  revalidatePath("/", "layout");
  redirect("/profile");
}

export async function unlinkBeAthleticsProfile(): Promise<void> {
  const athlete = await getCurrentAthlete();
  if (!athlete) redirect("/settings");
  const supabase = await createClient();
  await supabase.from("athletes").update({ beathletics_live_id: null }).eq("id", athlete.id);
  revalidatePath("/", "layout");
  redirect("/settings");
}
// __________________________GenAI: Generated code ends here______________________________
