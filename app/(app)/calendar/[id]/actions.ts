// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { categoryFor, eligibleDisciplines } from "@/lib/athletics/category";
import { getCurrentAthlete } from "@/lib/athletes";
import { getProvider } from "@/lib/beathletics/factory";
import { awardAchievements } from "@/lib/gamification/awards";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  competitionId: z.string().min(1).max(100),
  status: z.enum(["planned", "registered"]),
  disciplineIds: z.array(z.string().min(1).max(100)).max(50),
});

/**
 * Saves (idempotently) the local intention to take part. Competition data is re-read server-side from the
 * provider so the client cannot inject names, dates or disciplines. Nothing is written to BeAthletics.
 */
export async function saveParticipation(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    competitionId: formData.get("competitionId"),
    status: formData.get("status"),
    disciplineIds: formData.getAll("disciplineId").map(String),
  });
  if (!parsed.success) redirect("/calendar");
  const { competitionId, status, disciplineIds } = parsed.data;

  const athlete = await getCurrentAthlete();
  if (!athlete) redirect("/profile");

  let competition;
  try {
    competition = await getProvider().getCompetition(competitionId);
  } catch {
    redirect(`/calendar/${encodeURIComponent(competitionId)}?error=1`);
  }

  const cat = categoryFor(athlete.birthDate, competition.startDate);
  const allowed = cat
    ? eligibleDisciplines(competition.disciplines, { gender: athlete.gender, categoryCode: cat.code })
    : [];
  const chosen = allowed.filter((d) => disciplineIds.includes(d.externalId));
  const externalId = competition.eventNumber ?? competition.id;

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("participations")
    .upsert(
      {
        athlete_id: athlete.id,
        competition_external_id: externalId,
        competition_name: competition.name,
        start_date: competition.startDate,
        end_date: competition.endDate,
        venue_city: competition.venue.city ?? null,
        source_url: competition.sourceUrl,
        status,
      },
      { onConflict: "athlete_id,competition_external_id" },
    )
    .select("id")
    .single();
  if (error || !row) redirect(`/calendar/${encodeURIComponent(competitionId)}?error=1`);

  // Replace the discipline selection (idempotent).
  await supabase.from("participation_disciplines").delete().eq("participation_id", row.id);
  if (chosen.length > 0) {
    const ins = await supabase.from("participation_disciplines").insert(
      chosen.map((d) => ({
        participation_id: row.id,
        discipline_external_id: d.externalId,
        discipline_name: d.name,
      })),
    );
    if (ins.error) redirect(`/calendar/${encodeURIComponent(competitionId)}?error=1`);
  }

  await awardAchievements(athlete.id);
  revalidatePath("/my-events");
  redirect("/my-events");
}

export async function removeParticipation(formData: FormData): Promise<void> {
  const id = z.string().uuid().safeParse(formData.get("participationId"));
  if (!id.success) redirect("/my-events");
  const supabase = await createClient();
  await supabase.from("participations").delete().eq("id", id.data);
  revalidatePath("/my-events");
  redirect("/my-events");
}
// __________________________GenAI: Generated code ends here______________________________
