// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import type {
  AthleteResult,
  AthleteSearchQuery,
  Competition,
  CompetitionFilters,
  ExternalAthlete,
} from "../domain/types";

export interface CompetitionProvider {
  getCompetitions(from: Date, to: Date, filters?: CompetitionFilters): Promise<Competition[]>;
  getCompetition(id: string): Promise<Competition>;
  searchAthletes(query: AthleteSearchQuery): Promise<ExternalAthlete[]>;
  getAthleteResults(externalAthleteId: string): Promise<AthleteResult[]>;
}

export type ProviderErrorCode =
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "BLOCKED"
  | "HTTP_ERROR"
  | "INVALID_RESPONSE"
  | "NOT_AVAILABLE"
  | "NOT_FOUND";

export class ProviderError extends Error {
  constructor(
    public readonly code: ProviderErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
