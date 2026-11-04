// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Pure progress statistics: PB / SB per discipline, computed by the app (the published PB flag is not trusted).
import { seasonYear } from "../athletics/category";
import type { ResultRow } from "./sync";

export type ProgressInput = Pick<
  ResultRow,
  "externalResultId" | "eventDate" | "disciplineName" | "competitionName" | "display" | "value" | "kind" | "lowerIsBetter" | "venueKind"
> & { categoryCode?: string | null };

export interface ProgressPoint {
  id: string;
  date: string;
  value: number;
  display: string;
  competitionName: string;
  venueKind: ProgressInput["venueKind"];
  categoryCode?: string;
  /** True when strictly better than every earlier result in the discipline. */
  isPb: boolean;
}

export interface DisciplineProgress {
  name: string;
  kind: ProgressInput["kind"];
  lowerIsBetter: boolean;
  /** Chronological (date asc, then id for a stable order). */
  points: ProgressPoint[];
  pb: ProgressPoint;
  /** Best result of the most recent season present in the data. */
  sb: ProgressPoint;
  seasonYear: number;
  /** Signed gain of the latest result vs the first, positive = improved. Undefined with a single result. */
  improvement?: number;
}

export function isBetter(a: number, b: number, lowerIsBetter: boolean): boolean {
  return lowerIsBetter ? a < b : a > b;
}

function best(points: ProgressPoint[], lowerIsBetter: boolean): ProgressPoint | undefined {
  let top: ProgressPoint | undefined;
  for (const p of points) if (!top || isBetter(p.value, top.value, lowerIsBetter)) top = p;
  return top;
}

/** Groups by discipline; disciplines are ordered by most recent activity. Results with no numeric value are ignored. */
export function buildProgress(results: ProgressInput[]): DisciplineProgress[] {
  const groups = new Map<string, ProgressInput[]>();
  for (const r of results) {
    if (!Number.isFinite(r.value)) continue;
    const list = groups.get(r.disciplineName) ?? [];
    list.push(r);
    groups.set(r.disciplineName, list);
  }

  const out: DisciplineProgress[] = [];
  for (const [name, list] of groups) {
    const sorted = [...list].sort(
      (a, b) => a.eventDate.localeCompare(b.eventDate) || a.externalResultId.localeCompare(b.externalResultId),
    );
    const head = sorted[0];
    if (!head) continue;
    const { kind, lowerIsBetter } = head;
    let bestSoFar: number | undefined;
    const points: ProgressPoint[] = sorted.map((r) => {
      const isPb = bestSoFar === undefined || isBetter(r.value, bestSoFar, lowerIsBetter);
      if (isPb) bestSoFar = r.value;
      return {
        id: r.externalResultId,
        date: r.eventDate,
        value: r.value,
        display: r.display,
        competitionName: r.competitionName,
        venueKind: r.venueKind,
        categoryCode: r.categoryCode ?? undefined,
        isPb,
      };
    });
    const first = points[0];
    const last = points[points.length - 1];
    if (!first || !last) continue;
    const year = seasonYear(last.date);
    const pb = best(points, lowerIsBetter);
    const sb = best(points.filter((p) => seasonYear(p.date) === year), lowerIsBetter);
    if (!pb || !sb) continue;
    out.push({
      name,
      kind,
      lowerIsBetter,
      points,
      pb,
      sb,
      seasonYear: year,
      improvement: points.length > 1 ? (lowerIsBetter ? first.value - last.value : last.value - first.value) : undefined,
    });
  }
  const latest = (d: DisciplineProgress) => d.points[d.points.length - 1]?.date ?? "";
  return out.sort((a, b) => latest(b).localeCompare(latest(a)));
}
// __________________________GenAI: Generated code ends here______________________________
