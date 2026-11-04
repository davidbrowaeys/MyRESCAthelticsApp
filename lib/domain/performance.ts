// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Pure helpers for athletics performance values. Times are normalised to seconds, distances to metres.

/** BeAthletics publishes times as integer milliseconds (inferred from two samples: 9050 => 9.05 s). */
export function millisToSeconds(ms: number): number {
  return ms / 1000;
}

/** Formats seconds as "9.05", "1:23.45" or "1:02:03.40" (hundredths, rounded). */
export function formatTime(seconds: number): string {
  const cs = Math.round(seconds * 100);
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const s = Math.floor((cs % 6000) / 100);
  const c = cs % 100;
  const ss = `${String(s).padStart(h > 0 || m > 0 ? 2 : 1, "0")}.${String(c).padStart(2, "0")}`;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  if (m > 0) return `${m}:${ss}`;
  return ss;
}

export function formatDistance(metres: number): string {
  return `${metres.toFixed(2)} m`;
}
// __________________________GenAI: Generated code ends here______________________________
