// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Image from "next/image";
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
import { expandSlots } from "@/lib/training/expand";
import { listTrainingSlots } from "@/lib/training/slots";
import { summarize } from "@/lib/measurements/bmi";
import { listMeasurements } from "@/lib/measurements/queries";
import { listProgressInputs } from "@/lib/results/queries";
import { buildProgress, type ProgressInput } from "@/lib/results/stats";

const MAX_UPCOMING = 4;
const MAX_TRAINING = 4;
const TRAINING_DAYS = 14;
const MAX_RECORDS = 8;
const MAX_RECENT = 5;

export default async function HomePage() {
  const t = await getDict();
  const athlete = await getCurrentAthlete();
  const today = toBrusselsDate(new Date().toISOString()) ?? "";

  const [participations, inputs, achievements, measurements, slots] = await Promise.all([
    listParticipations(),
    athlete ? listProgressInputs(athlete.id) : Promise.resolve([] as ProgressInput[]),
    athlete ? listAchievements(athlete.id) : Promise.resolve([] as AchievementView[]),
    athlete ? listMeasurements(athlete) : Promise.resolve([] as Awaited<ReturnType<typeof listMeasurements>>),
    athlete ? listTrainingSlots(athlete.id) : Promise.resolve([]),
  ]);

  // Next training sessions: today's sessions still to come, then the following days.
  const nowTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", hour: "2-digit", minute: "2-digit" }).format(new Date());
  const horizon = new Date(`${today}T00:00:00Z`);
  horizon.setUTCDate(horizon.getUTCDate() + TRAINING_DAYS);
  const training = today
    ? expandSlots(slots, today, horizon.toISOString().slice(0, 10))
        .filter((o) => o.date > today || o.endTime > nowTime)
        .slice(0, MAX_TRAINING)
    : [];
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
      <div className="mb-6 flex items-center gap-4 md:gap-6">
        <Image
          src="/icons/resc-logo.png"
          alt={t.appName}
          width={160}
          height={160}
          priority
          className="h-24 w-24 shrink-0 object-contain sm:h-32 sm:w-32 md:h-40 md:w-40"
        />
        <div className="min-w-0 flex-1">
          <PageHeader title={athlete ? `${t.home.greeting} ${athlete.firstName}` : t.home.title} />
          {athlete ? (
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-3">
                  <dd className="text-2xl font-bold">{s.value}</dd>
                  <dt className="text-xs text-muted">{s.label}</dt>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>

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

      <section aria-label={t.home.upcoming} className="mb-6 border-t border-border pt-6">
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

      {athlete ? (
        <section aria-label={t.training.upcoming} className="mb-6 border-t border-border pt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">{t.training.upcoming}</h2>
            <Link href="/settings" className="min-h-12 content-center text-sm font-semibold text-primary">
              {t.training.manage}
            </Link>
          </div>
          {training.length === 0 ? (
            <EmptyState message={t.training.none} />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {training.map((o) => (
                <li key={`${o.slotId}-${o.date}`} className="rounded-3xl border border-dashed border-primary bg-card p-4">
                  <p className="text-sm capitalize text-muted">{o.date === today ? t.training.today : formatDay(o.date, t.locale)}</p>
                  <p className="mt-1 text-lg font-semibold">{o.startTime}-{o.endTime}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {disciplines.length > 0 ? (
        <section aria-label={t.home.records} className="mb-6 border-t border-border pt-6">
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
        <section aria-label={t.home.recent} className="mb-6 border-t border-border pt-6">
          <div className="rounded-3xl border border-border bg-card p-4">
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
          </div>
        </section>
      ) : null}

      {athlete ? (
        <div className="mb-6 border-t border-border pt-6">
          <AchievementsPanel items={achievements} />
        </div>
      ) : null}

      <div className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
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
