// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PaceToggle } from "@/components/pace";
import { getCurrentAthlete } from "@/lib/athletes";
import { getProvider } from "@/lib/beathletics/factory";
import type { ExternalAthlete } from "@/lib/domain/types";
import { getDict } from "@/lib/i18n";
import { listTrainingSlots } from "@/lib/training/slots";
import { getLastSyncRun } from "@/lib/results/runs";
import { signOut } from "../../login/actions";
import {
  addTrainingSlots,
  deleteTrainingSlot,
  linkBeAthleticsProfile,
  resyncResults,
  unlinkBeAthleticsProfile,
} from "../profile/actions";

type Params = { error?: string; q?: string; synced?: string };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const t = await getDict();
  const { error, q, synced } = await searchParams;
  const athlete = await getCurrentAthlete();
  const query = q?.trim().slice(0, 80);
  let candidates: ExternalAthlete[] = [];
  let searchFailed = false;
  if (athlete && !athlete.beathleticsLiveId && query) {
    try {
      candidates = await getProvider().searchAthletes({ firstName: query, birthDate: athlete.birthDate });
    } catch {
      searchFailed = true;
    }
  }
  const lastRun = athlete?.beathleticsLiveId ? await getLastSyncRun(athlete.id) : null;
  const slots = athlete ? await listTrainingSlots(athlete.id) : [];
  const dayFmt = new Intl.DateTimeFormat(t.locale, { weekday: "short", timeZone: "UTC" });
  const dayName = (wd: number) => dayFmt.format(new Date(Date.UTC(2024, 0, wd)));
  const field = "mt-1 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-base text-foreground";

  return (
    <>
      <PageHeader title={t.nav.settings} />

      {athlete ? (
        <section className="rounded-3xl border border-border bg-card p-6" aria-label={t.link.title}>
          <h2 className="text-xl font-semibold">{t.link.title}</h2>
          {synced ? <p role="status" className="mt-2 text-sm">{t.link.synced}</p> : null}
          {error === "link" || error === "sync" ? (
            <p role="alert" className="mt-2 rounded-2xl bg-accent p-3 text-sm">
              {error === "link" ? t.link.errorLink : t.link.errorSync}
            </p>
          ) : null}
          {athlete.beathleticsLiveId ? (
            <>
              <p className="mt-2 text-muted">{t.link.linked} · #{athlete.beathleticsLiveId}</p>
              {lastRun ? (
                <p className="mt-1 text-sm text-muted">
                  {t.link.lastSync} : {lastRun.startedAt.slice(0, 16).replace("T", " ")} ·{" "}
                  {lastRun.status === "failed"
                    ? (lastRun.errorCode ?? "error")
                    : `${lastRun.itemsWritten} / ${lastRun.itemsUpdated} / ${lastRun.itemsUnchanged} (${t.link.counts})`}
                </p>
              ) : null}
              <form action={resyncResults} className="mt-3">
                <button type="submit" className="min-h-12 w-full rounded-2xl bg-primary px-4 font-semibold text-primary-foreground">
                  {t.link.resync}
                </button>
              </form>
              <form action={unlinkBeAthleticsProfile} className="mt-2">
                <button type="submit" className="min-h-12 w-full rounded-2xl text-sm text-muted underline">
                  {t.link.unlink}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="mt-2 text-muted">{t.link.intro}</p>
              <form method="get" className="mt-3 space-y-3">
                <label className="block text-sm font-medium">
                  {t.link.searchLabel}
                  <input name="q" defaultValue={query} required maxLength={80} autoComplete="off" className={field} />
                </label>
                <button type="submit" className="min-h-12 w-full rounded-2xl border border-border px-4 font-semibold">
                  {t.link.search}
                </button>
              </form>
              {searchFailed ? <p role="alert" className="mt-3 text-sm">{t.link.searchFailed}</p> : null}
              {query && !searchFailed && candidates.length === 0 ? <p className="mt-3 text-muted">{t.link.none}</p> : null}
              <ul className="mt-3 space-y-2">
                {candidates.map((c) => (
                  <li key={c.externalId} className="rounded-2xl border border-border p-3">
                    <p className="font-semibold">{c.firstName} {c.lastName}</p>
                    <p className="text-sm text-muted">
                      {[c.clubCode, c.birthYear, c.currentCategory].filter(Boolean).join(" · ")}
                    </p>
                    <form action={linkBeAthleticsProfile} className="mt-2">
                      <input type="hidden" name="liveId" value={c.externalId} />
                      <button type="submit" className="min-h-12 w-full rounded-2xl bg-primary px-4 font-semibold text-primary-foreground">
                        {t.link.choose}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      ) : (
        <>
          <EmptyState message={t.athlete.needProfile} />
          <Link href="/profile" className="mt-4 flex min-h-12 items-center justify-center font-semibold text-primary">
            {t.athlete.goProfile}
          </Link>
        </>
      )}

      {athlete ? (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6" aria-label={t.training.title}>
          <h2 className="text-xl font-semibold">{t.training.title}</h2>
          <p className="mt-2 text-muted">{t.training.intro}</p>
          {error === "training" ? (
            <p role="alert" className="mt-2 rounded-2xl bg-accent p-3 text-sm">{t.training.error}</p>
          ) : null}
          {slots.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{t.training.empty}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {slots.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-2xl border border-border p-3">
                  <span className="font-semibold capitalize">
                    {dayName(s.weekday)} · {s.startTime}-{s.endTime}
                  </span>
                  <form action={deleteTrainingSlot}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="min-h-12 px-3 text-sm text-muted underline">
                      {t.training.remove}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <form action={addTrainingSlots} className="mt-4 space-y-3">
            <fieldset>
              <legend className="text-sm font-medium">{t.training.days}</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((wd) => (
                  <label key={wd} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border border-border px-3 text-sm capitalize">
                    <input type="checkbox" name="weekday" value={wd} />
                    {dayName(wd)}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                {t.training.start}
                <input type="time" name="startTime" required defaultValue="18:00" className={field} />
              </label>
              <label className="block text-sm font-medium">
                {t.training.end}
                <input type="time" name="endTime" required defaultValue="20:00" className={field} />
              </label>
            </div>
            <button type="submit" className="min-h-12 w-full rounded-2xl bg-primary px-4 font-semibold text-primary-foreground">
              {t.training.add}
            </button>
          </form>
        </section>
      ) : null}

      <PaceToggle labels={t.pace} />

      <div className="mt-8">
        <LanguageSwitcher />
      </div>

      <form action={signOut} className="mt-4">
        <button type="submit" className="min-h-12 w-full rounded-2xl border border-border bg-card px-4 font-semibold">
          {t.profile.signOut}
        </button>
      </form>
    </>
  );
}
// __________________________GenAI: Generated code ends here______________________________
