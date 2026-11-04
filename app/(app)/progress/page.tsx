// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PerformanceCards } from "@/components/performance-cards";
import { parseVenue, VenueFilter } from "@/components/venue-filter";
import { ProgressChart } from "@/components/progress-chart";
import { getCurrentAthlete } from "@/lib/athletes";
import { formatDistance, formatTime } from "@/lib/domain/performance";
import { formatDay } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { disciplineAnchor } from "@/lib/results/discipline";
import { listProgressInputs } from "@/lib/results/queries";
import { buildProgress, type DisciplineProgress } from "@/lib/results/stats";

function formatGain(d: DisciplineProgress): string | undefined {
  if (d.improvement === undefined) return undefined;
  const abs = Math.abs(d.improvement);
  const text = d.kind === "time" ? formatTime(abs) : d.kind === "distance" ? formatDistance(abs) : String(abs);
  return `${d.improvement >= 0 ? "+" : "-"}${text}`;
}

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ venue?: string }> }) {
  const venue = parseVenue((await searchParams).venue);
  const t = await getDict();
  const athlete = await getCurrentAthlete();
  if (!athlete) {
    return (
      <>
        <PageHeader title={t.progress.title} />
        <EmptyState message={t.athlete.needProfile} />
        <Link href="/profile" className="mt-4 flex min-h-12 items-center justify-center font-semibold text-primary">
          {t.athlete.goProfile}
        </Link>
      </>
    );
  }

  const inputs = await listProgressInputs(athlete.id);
  const allDisciplines = buildProgress(inputs);
  // Filtering the inputs (not the cards) makes every PB / SB / chart specific to the chosen track type.
  const disciplines = venue === "all" ? allDisciplines : buildProgress(inputs.filter((r) => r.venueKind === venue));
  if (allDisciplines.length === 0) {
    return (
      <>
        <PageHeader title={t.progress.title} />
        <EmptyState message={athlete.beathleticsLiveId ? t.progress.empty : t.progressPage.needProfile} />
        {athlete.beathleticsLiveId ? null : (
          <Link href="/profile" className="mt-4 flex min-h-12 items-center justify-center font-semibold text-primary">
            {t.athlete.goProfile}
          </Link>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader title={t.progress.title} />
      <VenueFilter
        current={venue}
        basePath="/progress"
        labels={{
          all: t.progressPage.filterAll,
          outdoor: t.progressPage.outdoor,
          indoor: t.progressPage.indoor,
          filter: t.progressPage.filterLabel,
        }}
      />
      {disciplines.length === 0 ? <EmptyState message={t.progressPage.noneForFilter} /> : null}
      <PerformanceCards
        items={disciplines}
        locale={t.locale}
        detailsQuery={venue === "all" ? "" : `?venue=${venue}`}
        labels={{
          indoor: t.progressPage.indoor,
          outdoor: t.progressPage.outdoor,
          details: t.progressPage.details,
          pb: t.progressPage.pb,
          list: t.progressPage.recordsList,
        }}
      />
      <ul className="grid gap-4 xl:grid-cols-2">
        {disciplines.map((d) => {
          const gain = formatGain(d);
          return (
            <li
              key={d.name}
              id={disciplineAnchor(d.name)}
              className="scroll-mt-4 rounded-3xl border border-border bg-card p-4"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">{d.name}</h2>
                <span className="text-sm text-muted">
                  {d.points.length} {t.progressPage.results}
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-accent p-3">
                  <dt className="text-xs text-muted">{t.progressPage.pb}</dt>
                  <dd className="text-xl font-bold">{d.pb.display}</dd>
                  <dd className="text-xs text-muted">{formatDay(d.pb.date, t.locale)}</dd>
                </div>
                <div className="rounded-2xl bg-accent p-3">
                  <dt className="text-xs text-muted">
                    {t.progressPage.sb} ({d.seasonYear})
                  </dt>
                  <dd className="text-xl font-bold">{d.sb.display}</dd>
                  <dd className="text-xs text-muted">{formatDay(d.sb.date, t.locale)}</dd>
                </div>
              </dl>
              {gain ? (
                <p className="mt-2 text-sm">
                  {t.progressPage.improved} : <strong>{gain}</strong>
                </p>
              ) : null}
              <div className="mt-3">
                <ProgressChart
                  points={d.points}
                  lowerIsBetter={d.lowerIsBetter}
                  label={`${t.progressPage.chartLabel} - ${d.name}`}
                />
              </div>
              <details className="mt-2">
                <summary className="flex min-h-12 cursor-pointer items-center text-sm font-semibold text-primary">
                  {t.progressPage.history}
                </summary>
                <ul className="space-y-1 text-sm">
                  {[...d.points].reverse().map((p) => (
                    <li key={p.id} className="flex justify-between gap-2">
                      <span className="text-muted">
                        {formatDay(p.date, t.locale)} · {p.competitionName}
                      </span>
                      <span className="font-semibold">
                        {p.display}
                        {p.isPb ? ` (${t.progressPage.pbDot})` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
    </>
  );
}
// __________________________GenAI: Generated code ends here______________________________
