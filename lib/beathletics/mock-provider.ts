// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import type {
  AthleteResult,
  AthleteSearchQuery,
  Competition,
  CompetitionFilters,
  ExternalAthlete,
} from "../domain/types";
import { MOCK_CALENDAR_RESPONSE } from "./fixtures/calendar.sample";
import { MOCK_ATHLETE_RESPONSE, MOCK_ATHLETE_SEARCH_RESPONSE } from "./fixtures/athlete.sample";
import { mapAthleteResults, mapAthleteSearch, mapCalendarResponse } from "./mapper";
import { ProviderError, type CompetitionProvider } from "./provider";

/** Deterministic provider for local development. All data is MOCK (dataOrigin = "mock"). */
export class MockCompetitionProvider implements CompetitionProvider {
  private all(): Competition[] {
    return mapCalendarResponse(MOCK_CALENDAR_RESPONSE, undefined, "mock");
  }

  async getCompetitions(from: Date, to: Date, filters?: CompetitionFilters): Promise<Competition[]> {
    const f = from.toISOString().slice(0, 10);
    const t = to.toISOString().slice(0, 10);
    return this.all().filter(
      (c) =>
        c.startDate >= f &&
        c.startDate <= t &&
        (!filters?.clubs?.length || (c.clubCode && filters.clubs.includes(c.clubCode))),
    );
  }

  async getCompetition(id: string): Promise<Competition> {
    const found = this.all().find((c) => c.id === id || c.eventNumber === id);
    if (!found) throw new ProviderError("NOT_FOUND", `Mock competition ${id} not found`);
    return found;
  }

  async searchAthletes(_query: AthleteSearchQuery): Promise<ExternalAthlete[]> {
    return mapAthleteSearch(MOCK_ATHLETE_SEARCH_RESPONSE);
  }

  async getAthleteResults(_externalAthleteId: string): Promise<AthleteResult[]> {
    return mapAthleteResults(MOCK_ATHLETE_RESPONSE);
  }
}
