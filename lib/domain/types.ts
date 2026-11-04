// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Internal domain models. UI and business logic must only import these, never raw BeAthletics DTOs.

export type Gender = "M" | "F";
export type VenueKind = "indoor" | "outdoor" | "unknown";

export interface AthleticsCategory {
  /** Normalised code, e.g. MIN, CAD, U23, TC (all categories). */
  code: string;
  gender?: Gender;
}

export interface CompetitionDiscipline {
  externalId: string;
  /** Display name as published (trimmed). Not a stable code. */
  name: string;
  group?: string;
  venueKind: VenueKind;
  categories: AthleticsCategory[];
}

export interface CompetitionVenue {
  name?: string;
  city?: string;
  postalCode?: string;
  address?: string;
}

export interface CompetitionRegistration {
  /** YYYY-MM-DD in Europe/Brussels */
  opensOn?: string;
  closesOn?: string;
  onSiteAllowed?: boolean;
  active?: boolean;
  finished?: boolean;
  message?: string;
}

export interface Competition {
  id: string;
  eventNumber?: string;
  name: string;
  /** YYYY-MM-DD in Europe/Brussels */
  startDate: string;
  endDate: string;
  status?: string;
  /** Federation label as published, e.g. "Meeting ouvert". */
  typeLabel?: string;
  venueKind: VenueKind;
  clubCode?: string;
  clubName?: string;
  venue: CompetitionVenue;
  disciplines: CompetitionDiscipline[];
  /** False when the source lists no disciplines: eligibility is unknown, not "not eligible". */
  eligibilityKnown: boolean;
  registration: CompetitionRegistration | null;
  /** Detail-only fields (absent when mapped from the calendar list). */
  startTime?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  price?: string;
  /** Public BeAthletics calendar page (no confirmed per-competition URL yet). */
  sourceUrl: string;
  dataOrigin: "beathletics" | "mock";
}

export interface CompetitionFilters {
  clubs?: string[];
  types?: string[];
  championship?: boolean;
  wpa?: boolean;
  worldAthletics?: boolean;
}

export interface AthleteSearchQuery {
  licenseNumber?: string;
  beathleticsId?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
}

export interface ExternalAthlete {
  externalId: string;
  firstName: string;
  lastName: string;
  clubCode?: string;
  birthYear?: number;
  gender?: Gender;
  /** Category as published by BeAthletics for the current season, e.g. "PUP M". */
  currentCategory?: string;
}

export interface AthleteResult {
  externalResultId?: string;
  externalCompetitionId?: string;
  competitionName: string;
  eventDate: string;
  disciplineName: string;
  display: string;
  /** Normalised numeric performance: seconds for time, metres for distance. */
  value?: number;
  kind?: "time" | "distance" | "other";
  lowerIsBetter?: boolean;
  venueKind?: VenueKind;
  /** PB flag as published by BeAthletics; the app recomputes PB/SB itself. */
  personalBestFlag?: boolean;
  wind?: number;
  ranking?: number;
  round?: string;
  categoryCode?: string;
  sourceUrl?: string;
}
