// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import type {
  AthleteResult,
  AthleteSearchQuery,
  Competition,
  CompetitionFilters,
  ExternalAthlete,
} from "../domain/types";
import { silentLogger, type Logger } from "../logging/logger";
import { BeAthleticsClient } from "./client";
import { mapAthleteResults, mapAthleteSearch, mapCalendarResponse, mapCompetitionDetail } from "./mapper";
import { ProviderError, type CompetitionProvider } from "./provider";

/** Real provider. Only the calendar endpoint is confirmed; the rest is NOT_AVAILABLE until captured. */
export class BeAthleticsProvider implements CompetitionProvider {
  constructor(
    private readonly client: BeAthleticsClient = new BeAthleticsClient(),
    private readonly logger: Logger = silentLogger,
  ) {}

  async getCompetitions(from: Date, to: Date, filters?: CompetitionFilters): Promise<Competition[]> {
    const payload = await this.client.getCalendar(from, to, filters);
    return mapCalendarResponse(payload, this.logger);
  }

  /** `id` is the BeAthletics event number (e.g. "F4984"), not the internal uuid. */
  async getCompetition(id: string): Promise<Competition> {
    return mapCompetitionDetail(await this.client.getCompetitionDetail(id), this.logger);
  }

  /** Searches by name (the only confirmed search key). Birth year narrows the result when given. */
  async searchAthletes(query: AthleteSearchQuery): Promise<ExternalAthlete[]> {
    const name = [query.firstName, query.lastName].filter(Boolean).join(" ").trim();
    if (!name) throw new ProviderError("NOT_AVAILABLE", "Athlete search needs a name");
    const found = mapAthleteSearch(await this.client.searchAthletes(name), this.logger);
    const year = query.birthDate ? Number(query.birthDate.slice(0, 4)) : undefined;
    return year ? found.filter((a) => a.birthYear === year) : found;
  }

  /** `externalAthleteId` is the BeAthletics liveId (e.g. "5143736"). */
  async getAthleteResults(externalAthleteId: string): Promise<AthleteResult[]> {
    return mapAthleteResults(await this.client.getAthlete(externalAthleteId), this.logger);
  }
}
