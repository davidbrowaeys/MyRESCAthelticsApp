// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PaceToggle } from "@/components/pace";
import { getCurrentAthlete } from "@/lib/athletes";
import { getProvider } from "@/lib/beathletics/factory";
import type { ExternalAthlete } from "@/lib/domain/types";
import { getDict } from "@/lib/i18n";
import { getLastSyncRun } from "@/lib/results/runs";
import { signOut } from "../../login/actions";
import { linkBeAthleticsProfile, resyncResults, unlinkBeAthleticsProfile } from "../profile/actions";

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
