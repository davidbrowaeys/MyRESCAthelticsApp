// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { deleteMeasurement, saveMeasurement } from "@/app/(app)/profile/actions";
import { ChartTabs } from "@/components/chart-tabs";
import { TrendChart, type TrendPoint } from "@/components/trend-chart";
import { formatDay } from "@/lib/format";
import type { Dict } from "@/lib/i18n/fr";
import type { MeasurementPoint } from "@/lib/measurements/bmi";

const MAX_HISTORY = 12;

function trend(
  series: MeasurementPoint[],
  pick: (p: MeasurementPoint) => number | null,
  fmt: (n: number) => string,
  withBand = false,
): TrendPoint[] {
  return series.flatMap((p) => {
    const value = pick(p);
    if (value === null) return [];
    const band = withBand && p.reference ? { low: p.reference.low, high: p.reference.high, ideal: p.reference.ideal } : null;
    return [{ id: p.id, date: p.measuredOn, value, text: fmt(value), band }];
  });
}

/** Profile: evolution graphs (height, weight, BMI vs ideal range), history, and the add-a-measurement form. */
export function MeasurementsPanel({
  series,
  t,
  today,
  status,
}: {
  series: MeasurementPoint[];
  t: Dict;
  today: string;
  status?: "saved" | "error";
}) {
  const b = t.body;
  const num = new Intl.NumberFormat(t.locale, { maximumFractionDigits: 1 });
  const short = (d: string) => formatDay(d, t.locale);
  const charts = [
    { id: "bmi", label: b.chartBmi, points: trend(series, (p) => p.bmi, (n) => num.format(n), true), band: true },
    { id: "height", label: b.chartHeight, points: trend(series, (p) => p.heightCm, (n) => `${num.format(n)} ${b.cm}`), band: false },
    { id: "weight", label: b.chartWeight, points: trend(series, (p) => p.weightKg, (n) => `${num.format(n)} ${b.kg}`), band: false },
  ].filter((c) => c.points.length > 0);
  const history = [...series].reverse().slice(0, MAX_HISTORY);
  const field = "mt-1 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-base text-foreground";

  return (
    <>
      <section className="mt-4 rounded-3xl border border-border bg-card p-6" aria-label={b.evolution}>
        <h2 className="text-xl font-semibold">{b.evolution}</h2>
        {charts.length === 0 ? (
          <p className="mt-2 text-muted">{b.empty}</p>
        ) : (
          <>
            {series.length < 2 ? <p className="mt-2 text-sm text-muted">{b.evolutionHint}</p> : null}
            <ChartTabs
              tabs={charts.map((c) => ({
                id: c.id,
                label: c.label,
                note: c.band ? b.legendHealthy : undefined,
                content: <TrendChart points={c.points} label={c.label} format={(n) => num.format(n)} formatDate={short} />,
              }))}
            />
          </>
        )}

        {history.length > 0 ? (
          <>
            <h3 className="mb-1 mt-5 text-sm font-semibold">{b.history}</h3>
            <ul className="divide-y divide-border text-sm">
              {history.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-1">
                  <span>
                    <span className="block font-semibold">
                      {formatDay(p.measuredOn, t.locale)}
                      {i === 0 ? (
                        <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">{b.latest}</span>
                      ) : null}
                    </span>
                    <span className="text-muted">
                      {[
                        p.heightCm === null ? null : `${num.format(p.heightCm)} ${b.cm}`,
                        p.weightKg === null ? null : `${num.format(p.weightKg)} ${b.kg}`,
                        p.bmi === null ? null : `${b.bmi} ${num.format(p.bmi)}`,
                      ]
                        .filter(Boolean)
                        .join(" \u00b7 ")}
                    </span>
                  </span>
                  <form action={deleteMeasurement}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="min-h-12 px-2 text-sm text-muted underline" aria-label={`${b.remove} (${p.measuredOn})`}>
                      {"\u00d7"}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section id="measure" className="mt-4 scroll-mt-4 rounded-3xl border border-border bg-card p-6" aria-label={b.add}>
        <h2 className="text-xl font-semibold">{b.add}</h2>
        {status === "saved" ? <p role="status" className="mt-2 text-sm">{b.saved}</p> : null}
        {status === "error" ? <p role="alert" className="mt-2 rounded-2xl bg-accent p-3 text-sm">{b.error}</p> : null}
        <form action={saveMeasurement} className="mt-3 space-y-3">
          <label className="block text-sm font-medium">
            {b.date}
            <input name="measuredOn" type="date" required defaultValue={today} max={today} className={field} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">
              {b.heightField}
              <input name="heightCm" type="text" inputMode="decimal" autoComplete="off" maxLength={6} className={field} />
            </label>
            <label className="block text-sm font-medium">
              {b.weightField}
              <input name="weightKg" type="text" inputMode="decimal" autoComplete="off" maxLength={6} className={field} />
            </label>
          </div>
          <button type="submit" className="min-h-12 w-full rounded-2xl bg-primary px-4 font-semibold text-primary-foreground">
            {b.save}
          </button>
        </form>
      </section>
    </>
  );
}
// __________________________GenAI: Generated code ends here______________________________
