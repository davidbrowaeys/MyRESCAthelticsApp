// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";
import { formatDay } from "@/lib/format";
import type { BmiStatus, BodySummary } from "@/lib/measurements/bmi";

export interface BodyLabels {
  title: string;
  height: string;
  weight: string;
  bmi: string;
  asOf: string;
  sincePrevious: string;
  bmiNote: string;
  cm: string;
  kg: string;
  actualBmi: string;
  ideal: string;
  idealWeight: string;
  healthyRange: string;
  under: string;
  healthy: string;
  over: string;
  noData: string;
  addFirst: string;
  latest: string;
}

const STATUS_STYLE: Record<BmiStatus, string> = {
  under: "bg-amber-500/20 text-amber-600 dark:text-amber-300",
  healthy: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  over: "bg-amber-500/20 text-amber-600 dark:text-amber-300",
};

/** BMI scale: shaded healthy zone with a marker for the actual value and a tick for the ideal. */
function BmiScale({ bmi, low, high, ideal }: { bmi: number; low: number; high: number; ideal: number }) {
  const min = Math.min(low - 4, bmi - 1);
  const max = Math.max(high + 6, bmi + 1);
  const pct = (v: number) => `${(((v - min) / (max - min)) * 100).toFixed(1)}%`;
  return (
    <div className="relative mt-3 h-3 rounded-full bg-border" aria-hidden="true">
      <div
        className="absolute inset-y-0 rounded-full bg-emerald-500/40"
        style={{ left: pct(low), width: `${((high - low) / (max - min)) * 100}%` }}
      />
      <div className="absolute -inset-y-1 w-0.5 bg-emerald-600" style={{ left: pct(ideal) }} />
      <div
        className="absolute -top-1 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-card bg-primary"
        style={{ left: pct(bmi) }}
      />
    </div>
  );
}

/** Latest height, weight and BMI, with the ideal BMI / weight for the athlete's age. Used on home and profile. */
export function BodySummaryCard({
  summary,
  labels,
  locale,
  showNote = false,
  addHref,
}: {
  summary: BodySummary | null;
  labels: BodyLabels;
  locale: string;
  showNote?: boolean;
  /** Where the "add a first measurement" link goes when there is no data yet. */
  addHref?: string;
}) {
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const int = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const dash = "\u2013";
  const delta = (value: number | null | undefined, unit: string) =>
    !value ? null : (
      <span className="block text-xs text-muted" title={labels.sincePrevious}>
        {value > 0 ? "+" : "\u2212"}
        {int.format(Math.abs(value))} {unit}
      </span>
    );
  const s = summary;
  const tiles = [
    { label: labels.height, value: s?.heightCm == null ? dash : `${int.format(s.heightCm)} ${labels.cm}`, delta: delta(s?.heightDelta, labels.cm) },
    { label: labels.weight, value: s?.weightKg == null ? dash : `${int.format(s.weightKg)} ${labels.kg}`, delta: delta(s?.weightDelta, labels.kg) },
    { label: labels.actualBmi, value: s?.bmi == null ? dash : num.format(s.bmi), delta: null },
  ];
  const ref = s?.reference ?? null;

  return (
    <section aria-label={labels.title} className="rounded-3xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{labels.title}</h2>
        {s ? (
          <p className="text-xs text-muted">
            {labels.latest} · {formatDay(s.asOf, locale)}
          </p>
        ) : null}
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl bg-accent p-3">
            <dd className="text-xl font-bold">{t.value}</dd>
            <dt className="text-xs text-muted">{t.label}</dt>
            {t.delta}
          </div>
        ))}
      </dl>

      {!s ? (
        <p className="mt-3 text-sm text-muted">
          {labels.noData}.{" "}
          {addHref ? (
            <Link href={addHref} className="font-semibold text-primary underline">
              {labels.addFirst}
            </Link>
          ) : null}
        </p>
      ) : null}

      {s?.bmi != null && ref ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            {s.status ? (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[s.status]}`}>
                {labels[s.status]}
              </span>
            ) : null}
            <span className="text-sm">
              {labels.ideal} <strong>{num.format(ref.ideal)}</strong>{" "}
              <span className="text-muted">
                ({labels.healthyRange} {num.format(ref.low)}&ndash;{num.format(ref.high)})
              </span>
            </span>
          </div>
          <BmiScale bmi={s.bmi} low={ref.low} high={ref.high} ideal={ref.ideal} />
          {s.idealWeight ? (
            <p className="mt-3 text-sm">
              {labels.idealWeight} ({int.format(s.heightCm ?? 0)} {labels.cm}):{" "}
              <strong>
                {int.format(s.idealWeight.min)}&ndash;{int.format(s.idealWeight.max)} {labels.kg}
              </strong>{" "}
              <span className="text-muted">
                ({labels.ideal.toLowerCase()} {int.format(s.idealWeight.ideal)} {labels.kg})
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      {showNote ? <p className="mt-3 text-xs text-muted">{labels.bmiNote}</p> : null}
    </section>
  );
}
// __________________________GenAI: Generated code ends here______________________________
