// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Synthetic payloads only (modelled on the observed shape). No real athlete data.
export const MOCK_ATHLETE_SEARCH_RESPONSE = {
  athletes: [
    {
      liveId: 9000001,
      person: { firstName: "[MOCK] Alex", lastName: "Exemple", birthYear: 2014, gender: "M", currentCategory: "PUP M" },
      club: { abbr: "RESC" },
    },
  ],
};

interface EventType {
  name: string;
  nameFr: string;
  resultType: "Time" | "Distance";
  low2high: 0 | 1;
}

const E = {
  m60: { name: "60 metres", nameFr: "60 m", resultType: "Time", low2high: 1 },
  m1000: { name: "1000 metres", nameFr: "1000 m", resultType: "Time", low2high: 1 },
  hurdles: { name: "60 metres hurdles", nameFr: "60 m haies", resultType: "Time", low2high: 1 },
  longJump: { name: "Long jump", nameFr: "Longueur", resultType: "Distance", low2high: 0 },
  highJump: { name: "High jump", nameFr: "Hauteur", resultType: "Distance", low2high: 0 },
  shot: { name: "Shot put 3kg", nameFr: "Poids 3 kg", resultType: "Distance", low2high: 0 },
  vortex: { name: "Vortex throw", nameFr: "Vortex", resultType: "Distance", low2high: 0 },
} satisfies Record<string, EventType>;

type Venue = "Indoor" | "Outdoor";

/** Times are integer milliseconds; distances are metres (as published). */
const result = (
  id: string,
  ev: EventType,
  perf: number,
  date: string,
  name: string,
  venue: Venue = "Outdoor",
  category = "PUP M",
) => ({
  resultId: id,
  personalRecord: false,
  venueType: venue,
  category: { abbr: category },
  result: {
    rank: 1,
    newTrials: [
      {
        trialJson: { perf, perfType: ev.resultType === "Time" ? "time" : "distance", valid: true, best: true },
        windSpeed: null,
      },
    ],
    discipline: {
      name: ev.name,
      eventType: { name_fr: ev.nameFr, result_type: ev.resultType, low2high: ev.low2high },
      competition: { eventNumber: "F9000", name: `[MOCK] ${name}`, startDate: date },
    },
  },
});

export const MOCK_ATHLETE_RESPONSE = {
  results: [
    // 60 m (m1 and m2 are relied on by the sync tests)
    result("m1", E.m60, 9500, "2026-05-02T22:00:00.000Z", "Meeting A"),
    result("m2", E.m60, 9200, "2026-06-13T22:00:00.000Z", "Meeting B"),
    result("m60-0", E.m60, 10100, "2025-02-08T23:00:00.000Z", "Indoor Cup", "Indoor"),
    result("m60-1", E.m60, 9900, "2025-05-17T22:00:00.000Z", "Spring Meeting"),
    result("m60-2", E.m60, 9700, "2025-09-06T22:00:00.000Z", "Autumn Meeting"),
    result("m60-3", E.m60, 9600, "2026-02-14T23:00:00.000Z", "Indoor Cup", "Indoor", "MIN M"),
    result("m60-4", E.m60, 9100, "2026-09-12T22:00:00.000Z", "Club Championship", "Outdoor", "MIN M"),
    // 1000 m
    result("k1-0", E.m1000, 245000, "2025-05-17T22:00:00.000Z", "Spring Meeting"),
    result("k1-1", E.m1000, 236500, "2025-09-06T22:00:00.000Z", "Autumn Meeting"),
    result("k1-2", E.m1000, 231200, "2026-05-02T22:00:00.000Z", "Meeting A"),
    result("k1-3", E.m1000, 226800, "2026-09-12T22:00:00.000Z", "Club Championship", "Outdoor", "MIN M"),
    // 60 m hurdles
    result("h-0", E.hurdles, 12400, "2025-02-08T23:00:00.000Z", "Indoor Cup", "Indoor"),
    result("h-1", E.hurdles, 11800, "2026-02-14T23:00:00.000Z", "Indoor Cup", "Indoor", "MIN M"),
    result("h-2", E.hurdles, 11300, "2026-06-13T22:00:00.000Z", "Meeting B", "Outdoor", "MIN M"),
    // Long jump
    result("lj-0", E.longJump, 3.12, "2025-05-17T22:00:00.000Z", "Spring Meeting"),
    result("lj-1", E.longJump, 3.35, "2025-09-06T22:00:00.000Z", "Autumn Meeting"),
    result("lj-2", E.longJump, 3.31, "2026-02-14T23:00:00.000Z", "Indoor Cup", "Indoor", "MIN M"),
    result("lj-3", E.longJump, 3.58, "2026-06-13T22:00:00.000Z", "Meeting B", "Outdoor", "MIN M"),
    result("lj-4", E.longJump, 3.74, "2026-09-12T22:00:00.000Z", "Club Championship", "Outdoor", "MIN M"),
    // High jump
    result("hj-0", E.highJump, 1.0, "2025-05-17T22:00:00.000Z", "Spring Meeting"),
    result("hj-1", E.highJump, 1.05, "2025-09-06T22:00:00.000Z", "Autumn Meeting"),
    result("hj-2", E.highJump, 1.15, "2026-06-13T22:00:00.000Z", "Meeting B", "Outdoor", "MIN M"),
    // Shot put
    result("sp-0", E.shot, 5.2, "2025-05-17T22:00:00.000Z", "Spring Meeting"),
    result("sp-1", E.shot, 5.85, "2026-02-14T23:00:00.000Z", "Indoor Cup", "Indoor", "MIN M"),
    result("sp-2", E.shot, 6.4, "2026-09-12T22:00:00.000Z", "Club Championship", "Outdoor", "MIN M"),
    // Vortex
    result("v-0", E.vortex, 24.5, "2025-09-06T22:00:00.000Z", "Autumn Meeting"),
    result("v-1", E.vortex, 28.9, "2026-06-13T22:00:00.000Z", "Meeting B", "Outdoor", "MIN M"),
  ],
};
// __________________________GenAI: Generated code ends here______________________________
