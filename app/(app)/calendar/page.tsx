// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";
import { CalendarCheck, CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Globe, List, Trash2, UserCheck } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/page-header";
import { MonthGrid, type GridEvent } from "@/components/month-grid";
import { categoryFor, competitionEligibility, type Eligibility } from "@/lib/athletics/category";
import { getCurrentAthlete } from "@/lib/athletes";
import { getProvider } from "@/lib/beathletics/factory";
import { toBrusselsDate } from "@/lib/beathletics/mapper";
import { buildGoogleCalendarUrl } from "@/lib/calendar/export";
import type { Competition } from "@/lib/domain/types";
import { formatDayRange, formatMonthYear } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { consoleLogger } from "@/lib/logging/logger";
import { listParticipations, toCalendarEvent, type Participation } from "@/lib/participations";
import { removeParticipation } from "./[id]/actions";

type View = "month" | "list";
type Filter = "all" | "mine" | "planned";

interface Item {
  key: string;
  name: string;
  start: string;
  end: string;
  city?: string;
  typeLabel?: string;
  mock: boolean;
  eligibility?: Eligibility;
  participation?: Participation;
}

const LIST_MONTHS = 6;

function day(s: string): string {
  return s.length === 10 ? s : (toBrusselsDate(s) ?? s.slice(0, 10));
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; filter?: string; m?: string }>;
}) {
  const t = await getDict();
  const sp = await searchParams;
  const view: View = sp.view === "list" ? "list" : "month";
  const filter: Filter = sp.filter === "all" || sp.filter === "planned" ? sp.filter : "mine";
  const athlete = await getCurrentAthlete();

  if (!athlete) {
    return (
      <>
        <PageHeader title={t.calendar.title} />
        <EmptyState message={t.athlete.needProfile} />
        <Link href="/profile" className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-primary font-semibold text-primary-foreground">
          {t.athlete.goProfile}
        </Link>
      </>
    );
  }

  const now = new Date();
  const today = toBrusselsDate(now.toISOString()) ?? now.toISOString().slice(0, 10);
  const month = sp.m && /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.m) ? sp.m : today.slice(0, 7);
  const href = (o: { view?: View; filter?: Filter; m?: string }) => {
    const q = new URLSearchParams({ view: o.view ?? view, filter: o.filter ?? filter, m: o.m ?? month });
    return `/calendar?${q.toString()}`;
  };

  const participations = await listParticipations();
  const byId = new Map(participations.map((p) => [p.competitionExternalId, p]));

  let items: Item[] = [];
  if (filter === "planned") {
    items = participations.map((p) => ({
      key: p.competitionExternalId,
      name: p.competitionName,
      start: day(p.startDate),
      end: day(p.endDate),
      city: p.venueCity,
      mock: false,
      participation: p,
    }));
  } else {
    const from = view === "month" ? new Date(`${month}-01T00:00:00Z`) : now;
    const to = view === "month" ? new Date(`${shiftMonth(month, 1)}-01T00:00:00Z`) : new Date(now);
    if (view === "list") to.setMonth(to.getMonth() + LIST_MONTHS);
    let competitions: Competition[];
    try {
      competitions = await getProvider().getCompetitions(from, to);
    } catch (e) {
      consoleLogger.error("calendar.load_failed", { code: e instanceof Error ? e.name : "unknown" });
      return (
        <>
          <PageHeader title={t.calendar.title} />
          <EmptyState message={t.calendarPage.loadError} />
        </>
      );
    }
    items = competitions.map((c) => {
      const key = c.eventNumber ?? c.id;
      const cat = categoryFor(athlete.birthDate, c.startDate);
      const eligibility: Eligibility = cat
        ? competitionEligibility(c, { gender: athlete.gender, categoryCode: cat.code })
        : "unknown";
      return {
        key,
        name: c.name,
        start: day(c.startDate),
        end: day(c.endDate),
        city: c.venue.city,
        typeLabel: c.typeLabel,
        mock: c.dataOrigin === "mock",
        eligibility,
        participation: byId.get(key) ?? byId.get(c.id),
      };
    });
    if (filter === "mine") items = items.filter((i) => i.participation || i.eligibility !== "not_eligible");
  }
  items.sort((a, b) => a.start.localeCompare(b.start));
  if (view === "list" && filter !== "planned") items = items.filter((i) => i.end >= today);
  if (view === "month") {
    const last = `${month}-31`;
    items = items.filter((i) => i.end >= `${month}-01` && i.start <= last);
  }

  const itemHref = (i: Item) => `/calendar/${encodeURIComponent(i.key)}`;
  const eligLabel: Record<Eligibility, string> = {
    eligible: t.calendarPage.eligible,
    unknown: t.calendarPage.unknown,
    not_eligible: t.calendarPage.notEligible,
  };
  const iconBtn = (active: boolean) =>
    `flex h-12 min-w-12 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-semibold ${
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted"
    }`;
  const actionBtn = "flex h-11 w-11 items-center justify-center rounded-xl border border-border text-primary";

  const filters: { f: Filter; label: string; Icon: typeof Globe }[] = [
    { f: "all", label: t.calendarPage.filterAll, Icon: Globe },
    { f: "mine", label: t.calendarPage.filterMine, Icon: UserCheck },
    { f: "planned", label: t.calendarPage.filterPlanned, Icon: CalendarCheck },
  ];
  const gridEvents: GridEvent[] = items.map((i) => ({
    key: i.key,
    href: itemHref(i),
    name: i.name,
    start: i.start,
    end: i.end,
    mine: !!i.participation,
  }));

  return (
    <>
      <PageHeader title={t.calendar.title} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label={t.calendarPage.filters} className="flex gap-2">
          {filters.map(({ f, label, Icon }) => (
            <Link key={f} href={href({ filter: f })} title={label} aria-label={label} aria-current={f === filter} className={iconBtn(f === filter)}>
              <Icon aria-hidden className="h-5 w-5" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex gap-2">
          <Link href={href({ view: "month" })} title={t.calendarPage.viewMonth} aria-label={t.calendarPage.viewMonth} className={iconBtn(view === "month")}>
            <CalendarDays aria-hidden className="h-5 w-5" />
          </Link>
          <Link href={href({ view: "list" })} title={t.calendarPage.viewList} aria-label={t.calendarPage.viewList} className={iconBtn(view === "list")}>
            <List aria-hidden className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {view === "month" ? (
        <div className="mb-4 flex items-center justify-between">
          <Link href={href({ m: shiftMonth(month, -1) })} title={t.calendarPage.prevMonth} aria-label={t.calendarPage.prevMonth} className={iconBtn(false)}>
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </Link>
          <Link href={href({ m: today.slice(0, 7) })} title={t.calendarPage.today} className="text-lg font-semibold capitalize">
            {formatMonthYear(`${month}-01`, t.locale)}
          </Link>
          <Link href={href({ m: shiftMonth(month, 1) })} title={t.calendarPage.nextMonth} aria-label={t.calendarPage.nextMonth} className={iconBtn(false)}>
            <ChevronRight aria-hidden className="h-5 w-5" />
          </Link>
        </div>
      ) : null}

      {view === "month" ? <MonthGrid month={month} events={gridEvents} locale={t.locale} today={today} /> : null}

      <div className={view === "month" ? "mt-6" : ""}>
        {items.length === 0 ? (
          <EmptyState message={filter === "mine" && view === "list" ? t.calendar.empty : t.calendarPage.noMatch} />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((i) => {
              const p = i.participation;
              return (
                <li key={i.key} className="flex flex-col rounded-3xl border border-border bg-card p-4">
                  <Link href={itemHref(i)} className="block flex-1">
                    <p className="text-sm text-muted">{formatDayRange(i.start, i.end, t.locale)}</p>
                    <p className="mt-1 text-lg font-semibold">{i.name}</p>
                    <p className="text-sm text-muted">{[i.city, i.typeLabel].filter(Boolean).join(" \u00b7 ")}</p>
                    <p className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                      {p ? (
                        <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                          {p.status === "registered" ? t.calendarPage.tagRegistered : t.calendarPage.tagPlanned}
                        </span>
                      ) : null}
                      {i.eligibility ? (
                        <span className="rounded-full bg-accent px-3 py-1">
                          {eligLabel[i.eligibility]}
                          {i.mock ? ` \u00b7 ${t.calendarPage.mockNotice}` : ""}
                        </span>
                      ) : null}
                    </p>
                  </Link>
                  {p ? (
                    <div className="mt-3 flex items-center gap-2">
                      <a
                        className={actionBtn}
                        href={buildGoogleCalendarUrl(toCalendarEvent(p))}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Google Calendar"
                        aria-label="Google Calendar"
                      >
                        <CalendarPlus aria-hidden className="h-5 w-5" />
                      </a>
                      <a className={actionBtn} href={`/my-events/${p.id}/ics`} title="ICS" aria-label={t.calendarPage.addToCalendar}>
                        <CalendarDays aria-hidden className="h-5 w-5" />
                      </a>
                      <form action={removeParticipation} className="ml-auto">
                        <input type="hidden" name="participationId" value={p.id} />
                        <button type="submit" className={`${actionBtn} text-muted`} title={t.myEventsPage.remove} aria-label={t.myEventsPage.remove}>
                          <Trash2 aria-hidden className="h-5 w-5" />
                        </button>
                      </form>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
// __________________________GenAI: Generated code ends here______________________________
