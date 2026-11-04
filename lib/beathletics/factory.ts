// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Server-side provider selection. "mock" is the default so development never depends on the live site.
import { consoleLogger } from "../logging/logger";
import { BeAthleticsClient } from "./client";
import { BeAthleticsProvider } from "./beathletics-provider";
import { MockCompetitionProvider } from "./mock-provider";
import type { CompetitionProvider } from "./provider";

export function getProvider(): CompetitionProvider {
  if (process.env.BEATHLETICS_PROVIDER === "live") {
    return new BeAthleticsProvider(
      new BeAthleticsClient({ baseUrl: process.env.BEATHLETICS_BASE_URL, logger: consoleLogger }),
      consoleLogger,
    );
  }
  return new MockCompetitionProvider();
}
// __________________________GenAI: Generated code ends here______________________________
