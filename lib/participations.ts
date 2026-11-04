// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import type { CalendarEvent } from "./calendar/export";
import { createClient } from "./supabase/server";

export type ParticipationStatus = "planned" | "registered" | "cancelled";

export interface Participation {
  id: string;
  competitionExternalId: string;
  competitionName: string;
  startDate: string;
  endDate: string;
  venueCity?: string;
  sourceUrl?: string;
  status: ParticipationStatus;
  disciplines: { externalId: string; name: string }[];
}

const SELECT =
  "id, competition_external_id, competition_name, start_date, end_date, venue_city, source_url, status, participation_disciplines(discipline_external_id, discipline_name)";

interface Row {
  id: string;
  competition_external_id: string;
  competition_name: string;
  start_date: string;
  end_date: string;
  venue_city: string | null;
  source_url: string | null;
  status: string;
  participation_disciplines: { discipline_external_id: string; discipline_name: string }[] | null;
}

function toParticipation(r: Row): Participation {
  return {
    id: r.id,
    competitionExternalId: r.competition_external_id,
    competitionName: r.competition_name,
    startDate: r.start_date,
    endDate: r.end_date,
    venueCity: r.venue_city ?? undefined,
    sourceUrl: r.source_url ?? undefined,
    status: r.status === "registered" || r.status === "cancelled" ? r.status : "planned",
    disciplines: (r.participation_disciplines ?? []).map((d) => ({
      externalId: d.discipline_external_id,
      name: d.discipline_name,
    })),
  };
}

/** RLS limits rows to the signed-in parent's athlete. */
export async function listParticipations(): Promise<Participation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participations")
    .select(SELECT)
    .neq("status", "cancelled")
    .order("start_date", { ascending: true });
  if (error || !data) return [];
  return (data as unknown as Row[]).map(toParticipation);
}

export async function getParticipationById(id: string): Promise<Participation | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("participations").select(SELECT).eq("id", id).maybeSingle();
  return data ? toParticipation(data as unknown as Row) : null;
}

export async function getParticipationByCompetition(externalId: string): Promise<Participation | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participations")
    .select(SELECT)
    .eq("competition_external_id", externalId)
    .maybeSingle();
  return data ? toParticipation(data as unknown as Row) : null;
}

export function toCalendarEvent(p: Participation): CalendarEvent {
  return {
    uid: `${p.id}@my-resc-athletics`,
    title: p.competitionName,
    startDate: p.startDate,
    endDate: p.endDate,
    location: p.venueCity,
    description: p.disciplines.length ? p.disciplines.map((d) => d.name).join(", ") : undefined,
    url: `https://www.beathletics.be/event/${encodeURIComponent(p.competitionExternalId)}/overview`,
  };
}
// __________________________GenAI: Generated code ends here______________________________
