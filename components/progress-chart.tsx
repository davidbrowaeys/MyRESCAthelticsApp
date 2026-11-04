// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import type { ProgressPoint } from "@/lib/results/stats";

const W = 320;
const H = 140;
const PAD = 16;

/** Dependency-free SVG line chart. Points are evenly spaced in time order; the Y axis is flipped so up always = better. */
export function ProgressChart({
  points,
  lowerIsBetter,
  label,
}: {
  points: ProgressPoint[];
  lowerIsBetter: boolean;
  label: string;
}) {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => (points.length === 1 ? W / 2 : PAD + (i * (W - 2 * PAD)) / (points.length - 1));
  const y = (v: number) => {
    const t = (v - min) / span; // 0..1 from min to max
    const better = lowerIsBetter ? 1 - t : t; // 1 = best
    return H - PAD - better * (H - 2 * PAD);
  };
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
      {points.length > 1 ? <path d={path} fill="none" stroke="currentColor" strokeWidth={2} className="text-primary" /> : null}
      {points.map((p, i) => (
        <circle
          key={p.id}
          cx={x(i)}
          cy={y(p.value)}
          r={p.isPb ? 6 : 4}
          className={p.isPb ? "fill-primary" : "fill-muted"}
        >
          <title>{`${p.date} - ${p.display}`}</title>
        </circle>
      ))}
    </svg>
  );
}
// __________________________GenAI: Generated code ends here______________________________
