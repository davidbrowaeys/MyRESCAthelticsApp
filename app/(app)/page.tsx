// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";
import { AchievementsPanel } from "@/components/achievements-panel";
import { BodySummaryCard } from "@/components/body-summary";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PerformanceCards } from "@/components/performance-cards";
import { seasonYear } from "@/lib/athletics/category";
import { getCurrentAthlete } from "@/lib/athletes";
import { toBrusselsDate } from "@/lib/beathletics/mapper";
import { formatDay, formatDayRange } from "@/lib/format";
import { listAchievements, type AchievementView } from "@/lib/gamification/awards";
import { getDict } from "@/lib/i18n";
import { listParticipations } from "@/lib/participations";
import { summarize } from "@/lib/measurements/bmi";
import { listMeasurements } from "@/lib/measurements/queries";
import { listProgressInputs } from "@/lib/results/queries";
import { buildProgress, type ProgressInput } from "@/lib/results/stats";

const MAX_UPCOMING = 4;
const MAX_RECORDS = 8;
const MAX_RECENT = 5;

export default async function HomePage() {
  const t = await getDict();
  const athlete = await getCurrentAthlete();
  const today = toBrusselsDate(new Date().toISOString()) ?? "";

  const [participations, inputs, achievements, measurements] = await Promise.all([
    listParticipations(),
    athlete ? listProgressInputs(athlete.id) : Promise.resolve([] as ProgressInput[]),
    athlete ? listAchievements(athlete.id) : Promise.resolve([] as AchievementView[]),
    athlete ? listMeasurements(athlete) : Promise.resolve([] as Awaited<ReturnType<typeof listMeasurements>>),
  ]);
  const body = summarize(measurements);

  // Participations are ordered by start date; keep those not yet finished.
  const upcoming = participations.filter((p) => p.endDate >= today);
  const disciplines = buildProgress(inputs);
  const year = today ? seasonYear(today) : 0;
  const pbsThisSeason = disciplines.reduce(
    (n, d) => n + d.points.filter((p) => p.isPb && seasonYear(p.date) === year).length,
    0,
  );
  const recent = [...inputs].sort((a, b) => b.eventDate.localeCompare(a.eventDate)).slice(0, MAX_RECENT);
  const earned = achievements.filter((a) => a.earned);
  const totalXp = earned.reduce((sum, a) => sum + a.xp, 0);

  const stats = [
    { label: t.home.statResults, value: String(inputs.length) },
    { label: t.home.statPbs, value: String(pbsThisSeason) },
    { label: t.home.statEvents, value: String(upcoming.length) },
    { label: t.home.statBadges, value: `${earned.length} \u00b7 ${totalXp} ${t.achievements.xp}` },
  ];
  const link =
    "flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card px-4 font-semibold text-primary";

  return (
    <>
      <PageHeader title={athlete ? `${t.home.greeting} ${athlete.firstName}` : t.home.title} />

      {athlete ? (
        <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-3">
              <dd className="text-2xl font-bold">{s.value}</dd>
              <dt className="text-xs text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      ) : null}

      {athlete ? (
        <div className="mb-6">
          <BodySummaryCard summary={body} labels={t.body} locale={t.locale} addHref="/profile#measure" />
          {body ? (
            <Link href="/profile#measure" className="mt-2 flex min-h-12 items-center justify-center text-sm font-semibold text-primary">
              {t.body.edit}
            </Link>
          ) : null}
        </div>
      ) : null}

      <section aria-label={t.home.upcoming} className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">{t.home.upcoming}</h2>
        {upcoming.length === 0 ? (
          <EmptyState message={athlete ? t.home.noEvents : t.home.empty} />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.slice(0, MAX_UPCOMING).map((p, i) => (
              <li key={p.id}>
                <Link
                  href={`/calendar/${encodeURIComponent(p.competitionExternalId)}`}
                  className={`block h-full rounded-3xl border bg-card p-4 ${i === 0 ? "border-primary" : "border-border"}`}
                >
                  {i === 0 ? <p className="mb-1 text-xs font-semibold uppercase text-primary">{t.home.next}</p> : null}
                  <p className="text-sm text-muted">{formatDayRange(p.startDate, p.endDate, t.locale)}</p>
                  <p className="mt-1 text-lg font-semibold">{p.competitionName}</p>
                  {p.venueCity ? <p className="text-sm text-muted">{p.venueCity}</p> : null}
                  <p className="mt-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium">
                    {p.status === "registered" ? t.myEventsPage.registered : t.myEventsPage.planned}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {disciplines.length > 0 ? (
        <section aria-label={t.home.records} className="mb-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">{t.home.records}</h2>
            <Link href="/progress" className="min-h-12 content-center text-sm font-semibold text-primary">
              {t.home.allRecords}
            </Link>
          </div>
          <PerformanceCards
            items={disciplines.slice(0, MAX_RECORDS)}
            locale={t.locale}
            labels={{
              indoor: t.progressPage.indoor,
              outdoor: t.progressPage.outdoor,
              details: t.progressPage.details,
              pb: t.progressPage.pb,
              list: t.home.records,
            }}
          />
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section aria-label={t.home.recent} className="mb-6 rounded-3xl border border-border bg-card p-4">
          <h2 className="mb-2 text-lg font-semibold">{t.home.recent}</h2>
          <ul className="divide-y divide-border text-sm">
            {recent.map((r) => (
              <li key={r.externalResultId} className="flex items-center justify-between gap-3 py-2">
                <span>
                  <span className="block font-semibold">{r.disciplineName}</span>
                  <span className="text-muted">
                    {formatDay(r.eventDate, t.locale)} · {r.competitionName}
                  </span>
                </span>
                <span className="shrink-0 text-base font-bold">{r.display}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {athlete ? <AchievementsPanel items={achievements} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/my-events" className={link}>
          {t.home.seeAll}
        </Link>
        <Link href="/calendar" className={link}>
          {t.home.browse}
        </Link>
      </div>
    </>
  );
}
// __________________________GenAI: Generated code ends here______________________________
