// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";
import { Pencil } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/page-header";
import { BodySummaryCard } from "@/components/body-summary";
import { MeasurementsPanel } from "@/components/measurements-panel";
import { categoryFor } from "@/lib/athletics/category";
import { getCurrentAthlete } from "@/lib/athletes";
import { toBrusselsDate } from "@/lib/beathletics/mapper";
import { getDict } from "@/lib/i18n";
import { summarize } from "@/lib/measurements/bmi";
import { listMeasurements } from "@/lib/measurements/queries";
import { createAthlete } from "./actions";

type Params = { error?: string; measured?: string };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<Params> }) {
  const t = await getDict();
  const { error, measured } = await searchParams;
  const athlete = await getCurrentAthlete();
  const series = athlete ? await listMeasurements(athlete) : [];
  const body = summarize(series);
  const today = toBrusselsDate(new Date().toISOString()) ?? "";
  const category = athlete ? categoryFor(athlete.birthDate, today) : undefined;
  const field = "mt-1 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-base text-foreground";

  return (
    <>
      <PageHeader title={t.profile.title} />

      {athlete ? (
        <section className="relative rounded-3xl border border-border bg-card p-6" aria-label={athlete.firstName}>
          <Link
            href="/profile/edit"
            aria-label={t.details.edit}
            className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-2xl text-muted hover:bg-accent hover:text-primary"
          >
            <Pencil aria-hidden className="h-5 w-5" />
          </Link>
          <p className="text-2xl font-bold">{athlete.nickname ?? athlete.firstName}</p>
          {athlete.nickname ? <p className="text-sm text-muted">{[athlete.firstName, athlete.lastName].filter(Boolean).join(" ")}</p> : athlete.lastName ? <p className="text-sm text-muted">{athlete.lastName}</p> : null}
          <p className="mt-1 text-muted">
            {athlete.gender === "M" ? t.athlete.male : t.athlete.female} · {athlete.clubCode}
          </p>
          {category ? (
            <p className="mt-4 text-lg font-semibold">
              {t.athlete.category} : {category.code}
              {category.year ? ` ${category.year}` : ""}
              {category.verified ? "" : ` (${t.athlete.categoryUnverified})`}
            </p>
          ) : null}
        </section>
      ) : null}

      {athlete ? (
        <div className="mt-4">
          <BodySummaryCard summary={body} labels={t.body} locale={t.locale} showNote addHref="#measure" />
        </div>
      ) : null}
      {athlete ? (
        <MeasurementsPanel
          series={series}
          t={t}
          today={today}
          status={error === "measure" ? "error" : measured ? "saved" : undefined}
        />
      ) : null}

      {athlete ? null : (
        <>
          <EmptyState message={t.athlete.needProfile} />
          {error ? (
            <p role="alert" className="mt-4 rounded-2xl bg-accent p-3 text-sm">
              {t.athlete.error}
            </p>
          ) : null}
          <form action={createAthlete} className="mt-4 space-y-4">
            <h2 className="text-xl font-semibold">{t.athlete.createTitle}</h2>
            <label className="block text-sm font-medium">
              {t.athlete.firstName}
              <input name="firstName" required maxLength={80} autoComplete="off" className={field} />
            </label>
            <label className="block text-sm font-medium">
              {t.details.lastName}
              <input name="lastName" required maxLength={80} autoComplete="off" className={field} />
            </label>
            <label className="block text-sm font-medium">
              {t.athlete.birthDate}
              <input name="birthDate" type="date" required className={field} />
            </label>
            <label className="block text-sm font-medium">
              {t.athlete.gender}
              <select name="gender" required className={field} defaultValue="M">
                <option value="M">{t.athlete.male}</option>
                <option value="F">{t.athlete.female}</option>
              </select>
            </label>
            <button type="submit" className="min-h-12 w-full rounded-2xl bg-primary px-4 font-semibold text-primary-foreground">
              {t.athlete.save}
            </button>
          </form>
        </>
      )}
    </>
  );
}
// __________________________GenAI: Generated code ends here______________________________
