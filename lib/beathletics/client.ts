// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Server-side only HTTP client for public BeAthletics read endpoints. No cookies, no auth, no bypass of bot protection.
import type { CompetitionFilters } from "../domain/types";
import { silentLogger, type Logger } from "../logging/logger";
import { ProviderError } from "./provider";

export interface ClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  logger?: Logger;
}

const DEFAULT_BASE = "https://www.beathletics.be";
const USER_AGENT = "MyRESCAthletics/0.1 (private family app; read-only)";

export function buildCalendarUrl(
  baseUrl: string,
  from: Date,
  to: Date,
  filters: CompetitionFilters = {},
): string {
  const p = new URLSearchParams();
  p.set("from", String(from.getTime()));
  p.set("to", String(to.getTime()));
  p.set("championship", String(filters.championship ?? false));
  p.set("wpa", String(filters.wpa ?? false));
  p.set("worldAthletic", String(filters.worldAthletics ?? false));
  for (const t of filters.types ?? []) p.append("types", t);
  for (const c of filters.clubs ?? []) p.append("clubs", c);
  p.set("loaded", "50");
  p.set("order", "asc");
  return `${baseUrl}/api/new-competition/calendar?${p.toString()}`;
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const secs = Number(value);
  if (Number.isFinite(secs)) return Math.min(secs, 30) * 1000;
  return undefined;
}

export class BeAthleticsClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly fetchImpl: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly logger: Logger;

  constructor(opts: ClientOptions = {}) {
    this.baseUrl = opts.baseUrl ?? DEFAULT_BASE;
    this.timeoutMs = opts.timeoutMs ?? 8000;
    this.maxRetries = opts.maxRetries ?? 2;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.sleep = opts.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.logger = opts.logger ?? silentLogger;
  }

  async getCalendar(from: Date, to: Date, filters?: CompetitionFilters): Promise<unknown> {
    return this.getJson(buildCalendarUrl(this.baseUrl, from, to, filters));
  }

  async getCompetitionDetail(eventNumber: string): Promise<unknown> {
    return this.getJson(`${this.baseUrl}/api/new-competition/full/${encodeURIComponent(eventNumber)}`);
  }

  async searchAthletes(name: string): Promise<unknown> {
    return this.getJson(`${this.baseUrl}/api/search/public/${encodeURIComponent(name)}`);
  }

  async getAthlete(liveId: string): Promise<unknown> {
    return this.getJson(`${this.baseUrl}/api/athlete/new/${encodeURIComponent(liveId)}`);
  }

  async getJson(url: string): Promise<unknown> {
    let attempt = 0;
    for (;;) {
      const started = Date.now();
      let retryDelay: number | undefined;
      let failure: ProviderError;
      try {
        const res = await this.fetchImpl(url, {
          headers: { Accept: "application/json", "User-Agent": USER_AGENT },
          signal: AbortSignal.timeout(this.timeoutMs),
        });
        this.logger.info("beathletics.request", {
          status: res.status,
          durationMs: Date.now() - started,
          attempt,
        });
        if (res.ok) return await this.readJson(res);
        if (res.status === 429) {
          retryDelay = parseRetryAfter(res.headers.get("Retry-After"));
          failure = new ProviderError("RATE_LIMITED", "Rate limited", 429);
        } else if (res.status === 403) {
          throw new ProviderError("BLOCKED", "Request blocked (possible bot protection)", 403);
        } else if (res.status >= 500) {
          failure = new ProviderError("HTTP_ERROR", `Server error ${res.status}`, res.status);
        } else {
          throw new ProviderError("HTTP_ERROR", `HTTP ${res.status}`, res.status);
        }
      } catch (e) {
        if (e instanceof ProviderError) {
          if (e.code !== "RATE_LIMITED" && !(e.code === "HTTP_ERROR" && (e.status ?? 0) >= 500)) {
            throw e;
          }
          failure = e;
        } else if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) {
          failure = new ProviderError("TIMEOUT", "Request timed out");
        } else {
          failure = new ProviderError("HTTP_ERROR", "Network error");
        }
      }
      if (attempt >= this.maxRetries) throw failure;
      await this.sleep(retryDelay ?? 500 * 2 ** attempt);
      attempt++;
    }
  }

  private async readJson(res: Response): Promise<unknown> {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new ProviderError("INVALID_RESPONSE", "Response was not JSON", res.status);
    }
  }
}
