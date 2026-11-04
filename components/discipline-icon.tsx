// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import type { ReactNode } from "react";
import { disciplinePictogram, type Pictogram } from "@/lib/results/discipline";

/**
 * Athlete pictograms (a person doing the discipline). Own artwork, drawn with currentColor so they
 * follow the theme. Each figure: head dot + stroked limbs; props (hurdle, bar, pole...) are thinner.
 */
const HEAD = (cx: number, cy: number): ReactNode => <circle cx={cx} cy={cy} r={4.5} fill="currentColor" stroke="none" />;
const prop = { strokeWidth: 2.5 } as const;

const FIGURES: Record<Pictogram, ReactNode> = {
  sprint: (
    <>
      {HEAD(30, 9)}
      <path d="M28 14 L21 26 M27 16 L19 21 L13 15 M27 16 L34 22 L38 15 M21 26 L31 30 L30 40 M21 26 L14 35 L6 32" />
      <path d="M3 14 H10 M2 20 H8" {...prop} opacity={0.5} />
    </>
  ),
  run: (
    <>
      {HEAD(26, 9)}
      <path d="M25 14 L23 27 M25 16 L19 21 L15 16 M25 16 L31 22 L34 17 M23 27 L29 33 L27 42 M23 27 L18 36 L10 38" />
    </>
  ),
  hurdles: (
    <>
      {HEAD(29, 9)}
      <path d="M28 14 L22 26 M27 17 L35 19 L39 23 M27 17 L19 19 L15 24 M22 26 L38 25 M22 26 L16 32 L21 38" />
      <path d="M38 44 V33 M33 33 H43" {...prop} />
    </>
  ),
  relay: (
    <>
      {HEAD(26, 9)}
      <path d="M25 14 L23 27 M25 16 L19 21 L15 16 M25 16 L31 22 L35 19 M23 27 L29 33 L27 42 M23 27 L18 36 L10 38" />
      <path d="M34 22 L41 14" strokeWidth={3.5} />
    </>
  ),
  walk: (
    <>
      {HEAD(24, 8)}
      <path d="M24 13 L24 27 M24 16 L30 22 L31 28 M24 16 L18 22 L17 28 M24 27 L31 43 M24 27 L17 43" />
    </>
  ),
  longJump: (
    <>
      {HEAD(27, 11)}
      <path d="M25 16 L20 27 M24 18 L32 12 L36 6 M20 27 L30 31 L38 28 M20 27 L28 36 L37 34" />
      <rect x={18} y={42} width={28} height={3} rx={1} fill="currentColor" stroke="none" opacity={0.35} />
    </>
  ),
  highJump: (
    <>
      {HEAD(10, 30)}
      <path d="M15 29 Q26 12 37 29 M16 31 L13 39 M37 29 L41 38 L38 43" />
      <path d="M4 26 H44 M4 44 V26 M44 44 V26" {...prop} opacity={0.6} />
    </>
  ),
  poleVault: (
    <>
      {HEAD(23, 31)}
      <path d="M26 26 L29 12 M26 22 L28 14 M29 12 L31 3 M29 12 L38 5" />
      <path d="M9 44 L32 5" {...prop} />
    </>
  ),
  shotPut: (
    <>
      {HEAD(22, 9)}
      <path d="M22 14 L22 28 M22 17 L30 16 L32 11 M22 17 L14 22 L8 20 M22 28 L14 42 M22 28 L32 42" />
      <circle cx={33} cy={8} r={3.5} fill="currentColor" stroke="none" />
    </>
  ),
  discus: (
    <>
      {HEAD(24, 9)}
      <path d="M24 14 L24 28 M24 17 L37 20 M24 17 L12 21 M24 28 L16 42 M24 28 L33 42" />
      <ellipse cx={42} cy={20} rx={4.5} ry={1.8} fill="currentColor" stroke="none" />
    </>
  ),
  javelin: (
    <>
      {HEAD(24, 10)}
      <path d="M24 15 L22 28 M24 18 L16 21 M24 18 L31 16 M22 28 L28 34 L27 43 M22 28 L16 37 L10 41" />
      <path d="M4 25 L43 8" {...prop} />
    </>
  ),
  hammer: (
    <>
      {HEAD(22, 9)}
      <path d="M22 14 L22 28 M22 17 L30 17 M22 28 L14 42 M22 28 L32 42" />
      <path d="M30 17 L40 25" strokeWidth={1.5} />
      <circle cx={42} cy={27} r={3.8} fill="currentColor" stroke="none" />
    </>
  ),
  throw: (
    <>
      {HEAD(22, 9)}
      <path d="M22 14 L22 28 M22 17 L30 13 L33 7 M22 17 L14 22 L9 19 M22 28 L14 42 M22 28 L31 42" />
      <circle cx={35} cy={5} r={3} fill="currentColor" stroke="none" />
    </>
  ),
};

/** Decorative athlete pictogram for a discipline name. */
export function DisciplineIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        {FIGURES[disciplinePictogram(name)]}
        <path d="M2 46 H46" strokeWidth={1.5} opacity={0.35} />
      </g>
    </svg>
  );
}
// __________________________GenAI: Generated code ends here______________________________
