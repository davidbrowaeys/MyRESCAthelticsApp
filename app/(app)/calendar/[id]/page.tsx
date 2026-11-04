// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/page-header";
import { categoryFor, eligibleDisciplines } from "@/lib/athletics/category";
import { getCurrentAthlete } from "@/lib/athletes";
import { getProvider } from "@/lib/beathletics/factory";
import type { Competition } from "@/lib/domain/types";
import { formatDay, formatDayRange } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { getParticipationByCompetition } from "@/lib/participations";
import { saveParticipation } from "./actions";

export default async function CompetitionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const t = await getDict();
  const { id } = await params;
  const { error } = await searchParams;
  const eventId = decodeURIComponent(id);

  let competition: Competition | null = null;
  try {
    competition = await getProvider().getCompetition(eventId);
  } catch (e) {
    // Log the reason only (no payload data) so a mapping failure is diagnosable.
    console.warn("calendar.detail.failed", { eventId, reason: e instanceof Error ? e.message : "unknown" });
    competition = null;
  }

  const back = (
    <Link href="/calendar" className="mb-4 flex min-h-12 items-center font-semibold text-primary">
      {t.calendarPage.back}
    </Link>
  );

  if (!competition) {
    return (
      <>
        {back}
        <EmptyState message={t.calendarPage.notFound} />
      </>
    );
  }

  const athlete = await getCurrentAthlete();
  const cat = athlete ? categoryFor(athlete.birthDate, competition.startDate) : undefined;
  const open =
    athlete && cat ? eligibleDisciplines(competition.disciplines, { gender: athlete.gender, categoryCode: cat.code }) : [];
  const existing = await getParticipationByCompetition(competition.eventNumber ?? competition.id);
  const selected = new Set(existing?.disciplines.map((d) => d.externalId) ?? []);
  const reg = competition.registration;
  const mapUrl =
    competition.latitude !== undefined && competition.longitude !== undefined
      ? `https://www.openstreetmap.org/?mlat=${competition.latitude}&mlon=${competition.longitude}#map=16/${competition.latitude}/${competition.longitude}`
      : undefined;

  return (
    <>
      {back}
      <PageHeader title={competition.name} />
      <section className="space-y-2 rounded-3xl border border-border bg-card p-4">
        <p className="font-semibold">{formatDayRange(competition.startDate, competition.endDate, t.locale)}</p>
        {competition.startTime ? <p className="text-muted">{t.calendarPage.startTime} : {competition.startTime}</p> : null}
        <p className="text-muted">
          {[competition.venue.name, competition.venue.address, competition.venue.city].filter(Boolean).join(", ")}
        </p>
        {mapUrl ? (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center font-semibold text-primary">
            {t.calendarPage.map}
          </a>
        ) : null}
      </section>

      {error ? (
        <p role="alert" className="mt-4 rounded-2xl bg-accent p-3 text-sm">
          {t.myEventsPage.saveError}
        </p>
      ) : null}

      <form action={saveParticipation} className="mt-4 rounded-3xl border border-border bg-card p-4">
        <input type="hidden" name="competitionId" value={competition.eventNumber ?? competition.id} />
        <h2 className="mb-2 text-lg font-semibold">{t.calendarPage.disciplines}</h2>
        {!competition.eligibilityKnown ? (
          <p className="text-muted">{t.calendarPage.noDisciplines}</p>
        ) : open.length === 0 ? (
          <p className="text-muted">{t.calendarPage.notEligible}</p>
        ) : (
          <fieldset>
            <legend className="sr-only">{t.myEventsPage.pickDisciplines}</legend>
            <ul className="space-y-1">
              {open.map((d) => (
                <li key={d.externalId}>
                  <label className="flex min-h-12 items-center gap-3">
                    <input
                      type="checkbox"
                      name="disciplineId"
                      value={d.externalId}
                      defaultChecked={selected.has(d.externalId)}
                      className="h-6 w-6"
                    />
                    <span>{d.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}
        <label className="mt-3 block text-sm font-medium">
          {t.myEventsPage.status}
          <select
            name="status"
            defaultValue={existing?.status === "registered" ? "registered" : "planned"}
            className="mt-1 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-base text-foreground"
          >
            <option value="planned">{t.myEventsPage.planned}</option>
            <option value="registered">{t.myEventsPage.registered}</option>
          </select>
        </label>
        <button
          type="submit"
          className="mt-3 min-h-12 w-full rounded-2xl bg-primary px-4 font-semibold text-primary-foreground"
        >
          {existing ? t.myEventsPage.update : t.myEventsPage.add}
        </button>
      </form>

      <section className="mt-4 rounded-3xl border border-border bg-card p-4">
        <h2 className="mb-2 text-lg font-semibold">{t.calendarPage.registration}</h2>
        {reg?.closesOn ? <p className="text-muted">{formatDay(reg.closesOn, t.locale)}</p> : null}
        {reg?.message ? <p className="text-muted">{reg.message}</p> : null}
        <p className="text-muted">{t.calendarPage.registrationOnBeAthletics}</p>
        <a
          href={competition.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex min-h-12 items-center justify-center rounded-2xl bg-primary font-semibold text-primary-foreground"
        >
          {t.calendarPage.registerOn}
        </a>
      </section>
    </>
  );
}
// __________________________GenAI: Generated code ends here______________________________
