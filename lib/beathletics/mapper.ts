// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Maps raw BeAthletics DTOs to internal domain models. Malformed items are dropped individually and logged.
import { formatDistance, formatTime, millisToSeconds } from "../domain/performance";
import type {
  AthleteResult,
  ExternalAthlete,
  AthleticsCategory,
  Competition,
  CompetitionDiscipline,
  Gender,
  VenueKind,
} from "../domain/types";
import { silentLogger, type Logger } from "../logging/logger";
import {
  athleteSearchEntrySchema,
  athleteSearchResponseSchema,
  athleteResponseSchema,
  athleteResultEntryDtoSchema,
  calendarResponseSchema,
  competitionDetailResponseSchema,
  competitionDtoSchema,
  trialDtoSchema,
  disciplineDtoSchema,
  type CompetitionDto,
  type DisciplineDto,
} from "./dto";
import { ProviderError } from "./provider";

export const CALENDAR_PAGE_URL = "https://www.beathletics.be/calendar";

const brusselsDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Brussels",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Converts an ISO instant (e.g. 2026-11-07T23:00:00Z) to the Brussels calendar date (2026-11-08). */
export function toBrusselsDate(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return brusselsDateFormat.format(d);
}

function clean(value: string | null | undefined): string | undefined {
  const t = value?.trim();
  return t ? t : undefined;
}

function asText(value: string | number | null | undefined): string | undefined {
  return value == null ? undefined : String(value);
}

function mapGender(value: string | null | undefined): Gender | undefined {
  const v = value?.trim().toLowerCase();
  if (v === "male" || v === "m") return "M";
  if (v === "female" || v === "f") return "F";
  return undefined;
}

function mapVenueKind(value: string | null | undefined): VenueKind {
  const v = value?.trim().toUpperCase();
  if (v === "I") return "indoor";
  if (v === "N") return "outdoor";
  return "unknown";
}

export function mapDiscipline(dto: DisciplineDto): CompetitionDiscipline {
  const seen = new Set<string>();
  const categories: AthleticsCategory[] = [];
  for (const c of dto.categories ?? []) {
    const code = c.abbr.trim().toUpperCase();
    if (!code) continue;
    const gender = mapGender(c.requiredGender);
    const key = `${code}|${gender ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    categories.push(gender ? { code, gender } : { code });
  }
  return {
    externalId: String(dto.id),
    name: clean(dto.name) ?? clean(dto.eventType?.name_fr) ?? "?",
    group: clean(dto.disciplineGroup) ?? clean(dto.eventType?.discipline_group),
    venueKind: mapVenueKind(dto.eventType?.venue),
    categories,
  };
}

function deriveVenueKind(disciplines: CompetitionDiscipline[]): VenueKind {
  const kinds = new Set(disciplines.map((d) => d.venueKind).filter((k) => k !== "unknown"));
  return kinds.size === 1 ? [...kinds][0]! : "unknown";
}

export function mapCompetition(
  dto: CompetitionDto,
  logger: Logger = silentLogger,
  dataOrigin: Competition["dataOrigin"] = "beathletics",
): Competition {
  const disciplines: CompetitionDiscipline[] = [];
  for (const raw of dto.disciplines ?? []) {
    const parsed = disciplineDtoSchema.safeParse(raw);
    if (parsed.success) disciplines.push(mapDiscipline(parsed.data));
    else logger.warn("beathletics.mapping.discipline_skipped", { competitionId: dto.id });
  }

  const startDate = toBrusselsDate(dto.startDate);
  if (!startDate) throw new Error("invalid startDate");
  const endDate = toBrusselsDate(dto.endDate) ?? startDate;

  const reg = dto.registrationDetail;
  const venue = dto.venue;
  const street = [clean(venue?.address), venue?.number != null ? String(venue.number) : undefined]
    .filter(Boolean)
    .join(" ");

  return {
    id: dto.id,
    eventNumber: dto.eventNumber != null ? String(dto.eventNumber) : undefined,
    name: dto.name.trim(),
    startDate,
    endDate,
    status: clean(dto.competitionStatus),
    typeLabel: clean(dto.type),
    venueKind: deriveVenueKind(disciplines),
    clubCode: clean(dto.club?.abbr),
    clubName: clean(dto.club?.name),
    venue: {
      name: clean(venue?.name),
      city: clean(venue?.city),
      postalCode: venue?.zipCode != null ? String(venue.zipCode) : undefined,
      address: street || undefined,
    },
    disciplines,
    eligibilityKnown: disciplines.length > 0,
    registration: reg
      ? {
          opensOn: toBrusselsDate(reg.startDate),
          closesOn: toBrusselsDate(reg.endDate),
          onSiteAllowed: reg.onSiteAllowed ?? undefined,
          active: reg.active ?? undefined,
          finished: reg.finished ?? undefined,
          message: clean(reg.publicMsg),
        }
      : null,
    sourceUrl: CALENDAR_PAGE_URL,
    dataOrigin,
  };
}

/** Maps a full calendar payload. Throws INVALID_RESPONSE only if the envelope itself is wrong. */
export function mapCalendarResponse(
  payload: unknown,
  logger: Logger = silentLogger,
  dataOrigin: Competition["dataOrigin"] = "beathletics",
): Competition[] {
  const envelope = calendarResponseSchema.safeParse(payload);
  if (!envelope.success) {
    throw new ProviderError("INVALID_RESPONSE", "Unexpected calendar response shape");
  }
  const out: Competition[] = [];
  const ids = new Set<string>();
  for (const raw of envelope.data.competitions) {
    const parsed = competitionDtoSchema.safeParse(raw);
    if (!parsed.success) {
      logger.warn("beathletics.mapping.competition_skipped", { reason: "schema" });
      continue;
    }
    if (ids.has(parsed.data.id)) continue;
    try {
      out.push(mapCompetition(parsed.data, logger, dataOrigin));
      ids.add(parsed.data.id);
    } catch {
      logger.warn("beathletics.mapping.competition_skipped", {
        reason: "mapping",
        competitionId: parsed.data.id,
      });
    }
  }
  return out;
}

function toFiniteNumber(value: string | number | null | undefined): number | undefined {
  if (value == null || String(value).trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/** Maps the competition detail payload ({ competition, ... }) to a domain Competition with detail-only fields. */
export function mapCompetitionDetail(
  payload: unknown,
  logger: Logger = silentLogger,
  dataOrigin: Competition["dataOrigin"] = "beathletics",
): Competition {
  const envelope = competitionDetailResponseSchema.safeParse(payload);
  if (!envelope.success) throw new ProviderError("INVALID_RESPONSE", "Unexpected detail response shape");
  const parsed = competitionDtoSchema.safeParse(envelope.data.competition);
  if (!parsed.success) throw new ProviderError("INVALID_RESPONSE", "Invalid competition detail");
  let base: Competition;
  try {
    base = mapCompetition(parsed.data, logger, dataOrigin);
  } catch {
    throw new ProviderError("INVALID_RESPONSE", "Competition detail could not be mapped");
  }
  const dto = parsed.data;
  return {
    ...base,
    startTime: clean(asText(dto.metadata?.startTime)),
    website: clean(asText(dto.metadata?.website)),
    price: clean(asText(dto.metadata?.price)),
    latitude: toFiniteNumber(dto.venue?.geoLat),
    longitude: toFiniteNumber(dto.venue?.geoLon),
  };
}

/** Maps the public athlete search response. Malformed entries are skipped. */
export function mapAthleteSearch(payload: unknown, logger: Logger = silentLogger): ExternalAthlete[] {
  const envelope = athleteSearchResponseSchema.safeParse(payload);
  if (!envelope.success) throw new ProviderError("INVALID_RESPONSE", "Unexpected athlete search response shape");
  const out: ExternalAthlete[] = [];
  for (const raw of envelope.data.athletes) {
    const parsed = athleteSearchEntrySchema.safeParse(raw);
    if (!parsed.success) {
      logger.warn("beathletics.mapping.athlete_skipped", { reason: "schema" });
      continue;
    }
    const { liveId, person, club } = parsed.data;
    out.push({
      externalId: String(liveId),
      firstName: person.firstName.trim(),
      lastName: person.lastName.trim(),
      clubCode: clean(club?.abbr),
      birthYear: person.birthYear ?? undefined,
      gender: mapGender(person.gender),
      currentCategory: clean(person.currentCategory),
    });
  }
  return out;
}

function pickTrial(trials: unknown[]): { perf: number; wind?: number } | undefined {
  const valid: { perf: number; best: boolean; wind?: number }[] = [];
  for (const raw of trials) {
    const t = trialDtoSchema.safeParse(raw);
    if (!t.success) continue;
    const j = t.data.trialJson;
    if (!j || typeof j.perf !== "number" || !Number.isFinite(j.perf) || j.valid === false) continue;
    const w = t.data.windSpeed == null ? undefined : Number(t.data.windSpeed);
    valid.push({ perf: j.perf, best: j.best === true, wind: w !== undefined && Number.isFinite(w) ? w : undefined });
  }
  return valid.find((v) => v.best) ?? valid[0];
}

/** Maps the athlete payload to results. Entries without a valid numeric performance (DNS, DNF, ...) are skipped. */
export function mapAthleteResults(payload: unknown, logger: Logger = silentLogger): AthleteResult[] {
  const envelope = athleteResponseSchema.safeParse(payload);
  if (!envelope.success) throw new ProviderError("INVALID_RESPONSE", "Unexpected athlete response shape");
  const out: AthleteResult[] = [];
  const ids = new Set<string>();
  for (const raw of envelope.data.results) {
    const parsed = athleteResultEntryDtoSchema.safeParse(raw);
    if (!parsed.success) {
      logger.warn("beathletics.mapping.result_skipped", { reason: "schema" });
      continue;
    }
    const entry = parsed.data;
    if (ids.has(entry.resultId)) continue;
    const trial = pickTrial(entry.result.newTrials ?? []);
    const comp = entry.result.discipline.competition;
    const eventDate = toBrusselsDate(comp?.startDate);
    if (!trial || !eventDate) {
      logger.warn("beathletics.mapping.result_skipped", { reason: "no_valid_performance", resultId: entry.resultId });
      continue;
    }
    const et = entry.result.discipline.eventType;
    const rt = et?.result_type?.trim().toLowerCase();
    const kind: NonNullable<AthleteResult["kind"]> = rt === "time" ? "time" : rt === "distance" ? "distance" : "other";
    const value = kind === "time" ? millisToSeconds(trial.perf) : trial.perf;
    const lowerIsBetter = et?.low2high != null ? et.low2high === 1 : kind === "time";
    const vt = entry.venueType?.trim().toLowerCase();
    ids.add(entry.resultId);
    out.push({
      externalResultId: entry.resultId,
      externalCompetitionId: comp?.eventNumber != null ? String(comp.eventNumber) : undefined,
      competitionName: clean(comp?.name) ?? "?",
      eventDate,
      disciplineName: clean(et?.name_fr) ?? clean(entry.result.discipline.name) ?? "?",
      display: kind === "time" ? formatTime(value) : kind === "distance" ? formatDistance(value) : String(value),
      value,
      kind,
      lowerIsBetter,
      venueKind: vt === "indoor" ? "indoor" : vt === "outdoor" ? "outdoor" : "unknown",
      personalBestFlag: entry.personalRecord ?? undefined,
      wind: trial.wind,
      ranking: entry.result.rank ?? undefined,
      round: clean(entry.result.roundName),
      categoryCode: clean(entry.category?.abbr),
    });
  }
  return out;
}
