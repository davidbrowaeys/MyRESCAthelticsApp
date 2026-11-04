// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Category engine. Pure functions, no I/O.
//
// Age = season end year - birth year (season 2026-2027 => 2027). Bands were derived on 2026-11-04 from the
// BeAthletics public search (`person.currentCategory` per birth year): 2018-19 BEN, 2016-17 PUP, 2014-15 MIN,
// 2012-13 CAD, 2010-11 SCO, 2008-09 JUN, 2005-07 U23, <=2004 SEN, 2021 "too young".
// The exact rollover date (assumed 1 Nov) is INFERRED: it happened on or before 2026-11-04.
import type { AthleticsCategory, Competition, Gender } from "../domain/types";

export interface CategoryBand {
  code: string;
  minAge: number;
  maxAge: number;
  /** false = extrapolated from the two-year progression, not confirmed by BeAthletics data. */
  verified: boolean;
}

export const SEASON_START_MONTH = 11;

export const CATEGORY_BANDS: readonly CategoryBand[] = [
  // Kangourous: exact band unknown (BeAthletics reports birth year 2021 as too young; 2020 not observed).
  { code: "KAN", minAge: 7, maxAge: 7, verified: false },
  { code: "BEN", minAge: 8, maxAge: 9, verified: true },
  { code: "PUP", minAge: 10, maxAge: 11, verified: true },
  { code: "MIN", minAge: 12, maxAge: 13, verified: true },
  { code: "CAD", minAge: 14, maxAge: 15, verified: true },
  { code: "SCO", minAge: 16, maxAge: 17, verified: true },
  { code: "JUN", minAge: 18, maxAge: 19, verified: true },
  { code: "U23", minAge: 20, maxAge: 22, verified: true },
  { code: "SEN", minAge: 23, maxAge: 34, verified: true },
];

/** Season year for a YYYY-MM-DD date: the calendar year in which the season ends (Nov 2026 -> 2027). */
export function seasonYear(isoDate: string): number {
  const [y, m] = isoDate.split("-").map(Number);
  if (!y || !m) throw new Error(`Invalid date: ${isoDate}`);
  return m >= SEASON_START_MONTH ? y + 1 : y;
}

export function ageInSeason(birthDate: string, onDate: string): number {
  const birthYear = Number(birthDate.slice(0, 4));
  if (!Number.isInteger(birthYear)) throw new Error(`Invalid birth date: ${birthDate}`);
  return seasonYear(onDate) - birthYear;
}

export interface CategoryResult {
  code: string;
  /** 1 = youngest year of a two-year band, 2 = oldest (e.g. Pupille 1 / Pupille 2). */
  year: 1 | 2 | undefined;
  verified: boolean;
}

export function categoryFor(birthDate: string, onDate: string): CategoryResult | undefined {
  const age = ageInSeason(birthDate, onDate);
  if (age < 0) return undefined;
  const band = CATEGORY_BANDS.find((b) => age >= b.minAge && age <= b.maxAge);
  if (!band) return undefined;
  const span = band.maxAge - band.minAge;
  return {
    code: band.code,
    year: span === 1 ? (age === band.minAge ? 1 : 2) : undefined,
    verified: band.verified,
  };
}

/** "PUP M" -> "PUP"; "U23 W" -> "U23"; "TC F" -> "TC". Veteran codes (M35, W40) are returned unchanged. */
export function baseCategoryCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+[MFW]$/, "");
}

export type Eligibility = "eligible" | "not_eligible" | "unknown";

function categoryMatches(c: AthleticsCategory, athleteCode: string, gender: Gender): boolean {
  if (c.gender && c.gender !== gender) return false;
  const base = baseCategoryCode(c.code);
  return base === "TC" || base === athleteCode;
}

export interface AthleteCategoryContext {
  gender: Gender;
  /** Base category code of the athlete for the competition date, e.g. "PUP". */
  categoryCode: string;
}

export function competitionEligibility(
  competition: Pick<Competition, "disciplines" | "eligibilityKnown">,
  athlete: AthleteCategoryContext,
): Eligibility {
  if (!competition.eligibilityKnown) return "unknown";
  const ok = competition.disciplines.some((d) =>
    d.categories.some((c) => categoryMatches(c, athlete.categoryCode, athlete.gender)),
  );
  return ok ? "eligible" : "not_eligible";
}

/** Disciplines of a competition open to the athlete. */
export function eligibleDisciplines<T extends { categories: AthleticsCategory[] }>(
  disciplines: T[],
  athlete: AthleteCategoryContext,
): T[] {
  return disciplines.filter((d) => d.categories.some((c) => categoryMatches(c, athlete.categoryCode, athlete.gender)));
}
// __________________________GenAI: Generated code ends here______________________________
