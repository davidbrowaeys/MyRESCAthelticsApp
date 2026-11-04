// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";
import { DisciplineIcon } from "@/components/discipline-icon";
import { formatMonthYear } from "@/lib/format";
import { disciplineAnchor } from "@/lib/results/discipline";
import type { DisciplineProgress } from "@/lib/results/stats";

export interface PerformanceCardLabels {
  indoor: string;
  outdoor: string;
  details: string;
  pb: string;
  list: string;
}

/** Responsive grid of record cards (one per discipline, showing the personal best). No horizontal scrolling. */
export function PerformanceCards({
  items,
  labels,
  locale,
  detailsBase = "/progress",
  detailsQuery = "",
}: {
  items: DisciplineProgress[];
  labels: PerformanceCardLabels;
  locale: string;
  detailsBase?: string;
  /** Query string (e.g. "?venue=indoor") kept on the details link so the filter survives navigation. */
  detailsQuery?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul aria-label={labels.list} className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {items.map((d) => {
        const venue = d.pb.venueKind === "indoor" ? labels.indoor : d.pb.venueKind === "outdoor" ? labels.outdoor : undefined;
        const heading = [d.pb.categoryCode, venue].filter(Boolean).join(" \u2022 ");
        return (
          <li
            key={d.name}
            className="flex min-w-0 flex-col items-center rounded-2xl border border-border bg-card p-3 text-center shadow-sm sm:p-4"
          >
            <p className="min-h-5 text-xs font-semibold text-muted sm:text-sm">{heading}</p>
            <span className="my-2 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
              <DisciplineIcon name={d.name} className="h-10 w-10" />
            </span>
            <p className="min-h-10 break-words text-sm font-semibold leading-snug sm:text-base">{d.name}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl" aria-label={`${labels.pb} ${d.pb.display}`}>
              {d.pb.display}
            </p>
            <p className="text-xs text-muted sm:text-sm">{formatMonthYear(d.pb.date, locale)}</p>
            <Link
              href={`${detailsBase}${detailsQuery}#${disciplineAnchor(d.name)}`}
              className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-3 text-sm font-semibold text-primary"
            >
              {labels.details}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
// __________________________GenAI: Generated code ends here______________________________
