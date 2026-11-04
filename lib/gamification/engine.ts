// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Pure achievement rules. Codes match supabase/seed.sql (achievement_definitions).
import { buildProgress, type ProgressInput } from "../results/stats";

export type AchievementCode =
  | "first_participation"
  | "first_result"
  | "first_pb"
  | "five_competitions"
  | "season_consistency";

export interface AchievementFacts {
  /** Non-cancelled participations the athlete added. */
  participationCount: number;
  results: ProgressInput[];
}

/** Ordinal month index (year * 12 + month) of a YYYY-MM-DD date. */
function monthIndex(isoDate: string): number {
  return Number(isoDate.slice(0, 4)) * 12 + Number(isoDate.slice(5, 7)) - 1;
}

function hasThreeConsecutiveMonths(results: ProgressInput[]): boolean {
  const months = [...new Set(results.map((r) => monthIndex(r.eventDate)))].sort((a, b) => a - b);
  for (let i = 0; i + 2 < months.length; i++) {
    if (months[i + 2] === (months[i] ?? 0) + 2 && months[i + 1] === (months[i] ?? 0) + 1) return true;
  }
  return false;
}

/** Codes the athlete currently qualifies for. Awarding is idempotent elsewhere (unique per athlete + code). */
export function evaluateAchievements(facts: AchievementFacts): AchievementCode[] {
  const earned: AchievementCode[] = [];
  const { results } = facts;
  if (facts.participationCount >= 1) earned.push("first_participation");
  if (results.length >= 1) earned.push("first_result");
  // A PB needs an earlier result to beat, so the first result of a discipline never counts.
  if (buildProgress(results).some((d) => d.points.some((p, i) => i > 0 && p.isPb))) earned.push("first_pb");
  const competitions = new Set(results.map((r) => r.competitionName));
  if (competitions.size >= 5) earned.push("five_competitions");
  if (hasThreeConsecutiveMonths(results)) earned.push("season_consistency");
  return earned;
}
// __________________________GenAI: Generated code ends here______________________________
