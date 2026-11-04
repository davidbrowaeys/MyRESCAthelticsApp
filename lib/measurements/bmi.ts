// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
/** Pure helpers for the height / weight evolution, BMI and its age-based reference (no I/O, unit-tested). */
import type { Gender } from "../domain/types";
import { BMI_REFERENCE_BOYS, BMI_REFERENCE_GIRLS, REFERENCE_FIRST_MONTH, REFERENCE_STEP_MONTHS } from "./bmi-reference";

export interface Person {
  /** YYYY-MM-DD */
  birthDate: string;
  gender: Gender;
}

export interface MeasurementRow {
  id: string;
  /** YYYY-MM-DD */
  measuredOn: string;
  heightCm: number | null;
  weightKg: number | null;
}

/**
 * Healthy BMI range and ideal (median) BMI for the athlete's age and sex.
 * Children / teens (2-19 y): P5 / P50 / P85 of the CDC BMI-for-age growth chart. Adults: 18.5 / 21.7 / 24.9.
 */
export interface BmiReference {
  low: number;
  ideal: number;
  high: number;
  basis: "child" | "adult";
}

export type BmiStatus = "under" | "healthy" | "over";

export interface MeasurementPoint extends MeasurementRow {
  /** BMI at this date; needs a weight on this date and the latest known height up to it. */
  bmi: number | null;
  /** Reference for the athlete's age on this date (null without athlete info or under 2 years). */
  reference: BmiReference | null;
}

export interface BodySummary {
  heightCm: number | null;
  weightKg: number | null;
  bmi: number | null;
  /** Date of the most recent measurement. */
  asOf: string;
  /** Change versus the previous recorded value (null when there is no previous value). */
  heightDelta: number | null;
  weightDelta: number | null;
  reference: BmiReference | null;
  status: BmiStatus | null;
  /** Weights that give the healthy / ideal BMI at the current height. */
  idealWeight: { min: number; ideal: number; max: number } | null;
}

export const LIMITS = { height: { min: 30, max: 250 }, weight: { min: 5, max: 250 } } as const;

const round1 = (n: number) => Math.round(n * 10) / 10;

/** BMI = kg / m^2, rounded to one decimal. Null when an input is missing or out of range. */
export function computeBmi(heightCm: number | null, weightKg: number | null): number | null {
  if (heightCm === null || weightKg === null) return null;
  if (heightCm < LIMITS.height.min || heightCm > LIMITS.height.max || weightKg <= 0) return null;
  const m = heightCm / 100;
  return round1(weightKg / (m * m));
}

/** Whole months between two YYYY-MM-DD dates (NaN for malformed input). */
export function ageInMonths(birthDate: string, on: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [y, m, d] = on.split("-").map(Number);
  if ([by, bm, bd, y, m, d].some((n) => n === undefined || !Number.isFinite(n))) return Number.NaN;
  return (y! - by!) * 12 + (m! - bm!) - (d! < bd! ? 1 : 0);
}

export function bmiReference(person: Person, on: string): BmiReference | null {
  const months = ageInMonths(person.birthDate, on);
  if (!Number.isFinite(months) || months < REFERENCE_FIRST_MONTH) return null;
  const table = person.gender === "F" ? BMI_REFERENCE_GIRLS : BMI_REFERENCE_BOYS;
  const pos = (months - REFERENCE_FIRST_MONTH) / REFERENCE_STEP_MONTHS;
  if (pos >= table.length - 1) return { low: 18.5, ideal: 21.7, high: 24.9, basis: "adult" };
  const i = Math.floor(pos);
  const a = table[i]!;
  const b = table[i + 1]!;
  const t = pos - i;
  const at = (k: 0 | 1 | 2) => round1(a[k] + (b[k] - a[k]) * t);
  return { low: at(0), ideal: at(1), high: at(2), basis: "child" };
}

export function bmiStatus(bmi: number, ref: BmiReference): BmiStatus {
  return bmi < ref.low ? "under" : bmi > ref.high ? "over" : "healthy";
}

export function idealWeightRange(heightCm: number, ref: BmiReference): { min: number; ideal: number; max: number } {
  const m2 = (heightCm / 100) ** 2;
  return { min: round1(ref.low * m2), ideal: round1(ref.ideal * m2), max: round1(ref.high * m2) };
}

/** Oldest first, with the last known height carried forward to compute BMI on weight-only entries. */
export function buildSeries(rows: MeasurementRow[], person?: Person): MeasurementPoint[] {
  const sorted = [...rows].sort((a, b) => a.measuredOn.localeCompare(b.measuredOn));
  let height: number | null = null;
  return sorted.map((row) => {
    if (row.heightCm !== null) height = row.heightCm;
    return {
      ...row,
      bmi: computeBmi(height, row.weightKg),
      reference: person ? bmiReference(person, row.measuredOn) : null,
    };
  });
}

function lastTwo(values: number[]): [number | null, number | null] {
  const last = values.at(-1) ?? null;
  const prev = values.length > 1 ? (values.at(-2) ?? null) : null;
  return [last, prev];
}

export function summarize(series: MeasurementPoint[]): BodySummary | null {
  const latest = series.at(-1);
  if (!latest) return null;
  const [heightCm, prevHeight] = lastTwo(series.flatMap((p) => (p.heightCm === null ? [] : [p.heightCm])));
  const [weightKg, prevWeight] = lastTwo(series.flatMap((p) => (p.weightKg === null ? [] : [p.weightKg])));
  const bmi = computeBmi(heightCm, weightKg);
  const reference = latest.reference;
  return {
    heightCm,
    weightKg,
    bmi,
    asOf: latest.measuredOn,
    heightDelta: heightCm !== null && prevHeight !== null ? round1(heightCm - prevHeight) : null,
    weightDelta: weightKg !== null && prevWeight !== null ? round1(weightKg - prevWeight) : null,
    reference,
    status: bmi !== null && reference ? bmiStatus(bmi, reference) : null,
    idealWeight: heightCm !== null && reference ? idealWeightRange(heightCm, reference) : null,
  };
}

/** Accepts "1,65" / "42.5" / " 42 "; returns null for empty or non-numeric input. */
export function parseDecimal(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim().replace(",", ".");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? round1(value) : null;
}
// __________________________GenAI: Generated code ends here______________________________
