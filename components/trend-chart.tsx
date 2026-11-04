// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
const W = 320;
const H = 150;
const PAD_L = 36;
const PAD_R = 10;
const PAD_T = 10;
const PAD_B = 26;

export interface TrendBand {
  low: number;
  high: number;
  ideal: number;
}

export interface TrendPoint {
  id: string;
  date: string;
  value: number;
  text: string;
  /** Optional healthy range at this point (drawn as a shaded band with a dashed ideal line). */
  band?: TrendBand | null;
}

/**
 * Dependency-free SVG line chart (higher = up). Points are evenly spaced in time order, the latest one is
 * highlighted, and min / max / first / last labels make it readable without hovering.
 */
export function TrendChart({
  points,
  label,
  format,
  formatDate,
}: {
  points: TrendPoint[];
  label: string;
  format: (n: number) => string;
  formatDate: (date: string) => string;
}) {
  if (points.length === 0) return null;
  const bands = points.map((p) => p.band ?? null);
  const withBand = bands.every((b) => b !== null);
  const all = [...points.map((p) => p.value), ...(withBand ? bands.flatMap((b) => [b!.low, b!.high]) : [])];
  const rawMin = Math.min(...all);
  const rawMax = Math.max(...all);
  const margin = (rawMax - rawMin || 1) * 0.08;
  const min = rawMin - margin;
  const span = rawMax + margin - min;
  const left = PAD_L;
  const right = W - PAD_R;
  const x = (i: number) => (points.length === 1 ? (left + right) / 2 : left + (i * (right - left)) / (points.length - 1));
  const y = (v: number) => H - PAD_B - ((v - min) / span) * (H - PAD_T - PAD_B);
  const f = (n: number) => n.toFixed(1);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${f(x(i))},${f(y(p.value))}`).join(" ");

  let bandPath = "";
  let idealPath = "";
  if (withBand) {
    const bs = bands as TrendBand[];
    if (points.length === 1) {
      const b = bs[0]!;
      bandPath = `M${left},${f(y(b.high))} L${right},${f(y(b.high))} L${right},${f(y(b.low))} L${left},${f(y(b.low))} Z`;
      idealPath = `M${left},${f(y(b.ideal))} L${right},${f(y(b.ideal))}`;
    } else {
      const top = bs.map((b, i) => `${i === 0 ? "M" : "L"}${f(x(i))},${f(y(b.high))}`).join(" ");
      const bottom = bs.map((b, i) => `L${f(x(bs.length - 1 - i))},${f(y(bs[bs.length - 1 - i]!.low))}`).join(" ");
      bandPath = `${top} ${bottom} Z`;
      idealPath = bs.map((b, i) => `${i === 0 ? "M" : "L"}${f(x(i))},${f(y(b.ideal))}`).join(" ");
    }
  }
  const last = points.length - 1;
  const first = points[0]!;
  const latest = points[last]!;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
      {bandPath ? <path d={bandPath} className="fill-emerald-500/20" /> : null}
      {idealPath ? <path d={idealPath} fill="none" strokeWidth={1.5} strokeDasharray="4 3" className="stroke-emerald-500" /> : null}
      <line x1={left} x2={right} y1={H - PAD_B} y2={H - PAD_B} className="stroke-border" />
      {points.length > 1 ? <path d={line} fill="none" stroke="currentColor" strokeWidth={2} className="text-primary" /> : null}
      {points.map((p, i) => (
        <circle key={p.id} cx={x(i)} cy={y(p.value)} r={i === last ? 5.5 : 3.5} className="fill-primary">
          <title>{`${p.date} - ${p.text}`}</title>
        </circle>
      ))}
      <text x={PAD_L - 4} y={y(rawMax) + 3} textAnchor="end" fontSize={9} className="fill-muted">{format(rawMax)}</text>
      {rawMax !== rawMin ? (
        <text x={PAD_L - 4} y={y(rawMin) + 3} textAnchor="end" fontSize={9} className="fill-muted">{format(rawMin)}</text>
      ) : null}
      <text x={left} y={H - 8} textAnchor="start" fontSize={9} className="fill-muted">{formatDate(first.date)}</text>
      {points.length > 1 ? (
        <text x={right} y={H - 8} textAnchor="end" fontSize={9} className="fill-muted">{formatDate(latest.date)}</text>
      ) : null}
    </svg>
  );
}
// __________________________GenAI: Generated code ends here______________________________
