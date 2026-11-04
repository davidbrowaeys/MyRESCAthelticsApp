// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
/**
 * RENDERING ONLY. Temporary placeholder art for Pace (original blue furry bear, hand-built SVG).
 *
 * Swap point for the final artwork: replace this component (same props). The stylesheet drives
 * every pose through `[data-state]` and these part classes: pace-fig, pace-breath, pace-head,
 * pace-eye, pace-pupil, pace-armL, pace-armR, pace-legL, pace-legR, pace-mouth-smile,
 * pace-mouth-open, pace-sweat, pace-zzz. Pointer look-at is exposed as CSS vars --look-x / --look-y.
 */
import "./pace.css";
import type { PaceVisual } from "./types";

/** Scalloped "fluffy" outline: an ellipse whose edge is made of outward bumps. */
function furPath(cx: number, cy: number, rx: number, ry: number, tufts: number, amp: number): string {
  const step = (Math.PI * 2) / tufts;
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(cx + rx)} ${f(cy)}`;
  for (let i = 0; i < tufts; i++) {
    const a1 = (i + 1) * step;
    const am = i * step + step / 2;
    d += ` Q${f(cx + (rx + amp) * Math.cos(am))} ${f(cy + (ry + amp) * Math.sin(am))} ${f(cx + rx * Math.cos(a1))} ${f(cy + ry * Math.sin(a1))}`;
  }
  return `${d}Z`;
}

const HEAD_FUR = furPath(100, 72, 50, 44, 16, 6);
const BODY_FUR = furPath(100, 152, 37, 40, 10, 5);
const HAND_FUR = furPath(0, 0, 12, 12, 7, 3);
const ARM_FUR = furPath(0, 0, 11, 25, 8, 3);
const LEG_FUR = furPath(0, 0, 12, 13, 7, 3);

const CONFETTI = Array.from({ length: 12 }, (_, i) => ({
  x: (i % 6) * 22 - 55,
  delay: (i * 70) % 500,
  color: ["#ffd23f", "#ff5d73", "#ffffff", "#5ee0b5"][i % 4],
  rot: i * 37,
}));

const FUR = "#3d8bff";
const FUR_DARK = "#1c55b8";
const FUR_LIGHT = "#cfe6ff";
const NAVY = "#0b1b3a";
const SHIRT = "#0a3d91";

export interface PaceCharacterProps {
  state: PaceVisual;
  reducedMotion?: boolean;
  /** "auto" scales with the viewport; "sm" forces the compact size. */
  size?: "auto" | "sm";
}

export function PaceCharacter({ state, reducedMotion = false, size = "auto" }: PaceCharacterProps) {
  const fur = { fill: "url(#pace-fur)", stroke: FUR_DARK, strokeWidth: 2.5, strokeLinejoin: "round" as const };
  return (
    <div className="pace" data-state={state} data-size={size} aria-hidden="true">
      <svg viewBox="0 0 200 224" focusable="false">
        {/* 2.5D shading: light comes from the top-left, so every part is lit there and darker bottom-right */}
        <defs>
          <radialGradient id="pace-fur" cx="0.32" cy="0.28" r="0.85">
            <stop offset="0" stopColor="#8cc4ff" />
            <stop offset="0.45" stopColor={FUR} />
            <stop offset="1" stopColor="#1e5fc4" />
          </radialGradient>
          <radialGradient id="pace-muzzle" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#a9cdf5" />
          </radialGradient>
          <radialGradient id="pace-shoe" cx="0.3" cy="0.25" r="0.9">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#b9c7de" />
          </radialGradient>
          <radialGradient id="pace-ground" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#000" stopOpacity="0.35" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pace-eyeball" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#dbe6f5" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="217" rx="58" ry="8" fill="url(#pace-ground)" />
        <g className="pace-fig pace-part">
          <g className="pace-breath pace-part">
            {/* legs + big running shoes */}
            <g className="pace-legL pace-part">
              <path d={LEG_FUR} transform="translate(84 196)" {...fur} />
              <ellipse cx="78" cy="210" rx="21" ry="9" fill="url(#pace-shoe)" stroke={NAVY} strokeWidth="2.5" />
              <path d="M62 207 Q76 202 92 206" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d="M58 212 H98" stroke={SHIRT} strokeWidth="3" strokeLinecap="round" />
            </g>
            <g className="pace-legR pace-part">
              <path d={LEG_FUR} transform="translate(116 196)" {...fur} />
              <ellipse cx="122" cy="210" rx="21" ry="9" fill="url(#pace-shoe)" stroke={NAVY} strokeWidth="2.5" />
              <path d="M106 207 Q120 202 136 206" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d="M102 212 H142" stroke={SHIRT} strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* torso + running shirt */}
            <path d={BODY_FUR} {...fur} />
            <ellipse cx="82" cy="140" rx="12" ry="22" fill="#fff" opacity="0.18" transform="rotate(12 82 140)" />
            {/* black shorts with orange hem */}
            <path d="M66 178 Q100 188 134 178 L138 204 Q119 210 102 205 L100 196 L98 205 Q81 210 62 204 Z" fill="#12151f" stroke={NAVY} strokeWidth="2" strokeLinejoin="round" />
            <path d="M63 202 Q81 208 98 203 M102 203 Q119 208 137 202" fill="none" stroke="#ff8a1f" strokeWidth="3" strokeLinecap="round" />
            {/* Excelsior-style blue sleeveless singlet */}
            <defs>
              <linearGradient id="pace-jersey" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#6fd0ff" />
                <stop offset="0.5" stopColor="#2f8df0" />
                <stop offset="1" stopColor="#1456c4" />
              </linearGradient>
            </defs>
            <path d="M78 122 Q100 134 122 122 L128 130 Q121 148 126 166 L134 188 Q100 198 66 188 L74 166 Q79 148 72 130 Z" fill="url(#pace-jersey)" stroke={NAVY} strokeWidth="2" strokeLinejoin="round" />
            <path d="M84 122 Q100 138 116 122" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
            <text x="100" y="150" textAnchor="middle" fontSize="9.5" fontWeight="900" fontStyle="italic" fill="#fff" stroke={NAVY} strokeWidth="0.6" paintOrder="stroke" fontFamily="system-ui, sans-serif">
              EXCELSIOR
            </text>
            {/* race bib */}
            {/* singlet folds + sheen for volume */}
            <path d="M126 140 Q120 156 130 184 L134 188 Q124 160 126 140 Z" fill="#0b2f7a" opacity="0.35" />
            <path d="M80 128 Q76 150 78 170" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.28" />
            <rect x="82" y="156" width="36" height="20" rx="2" fill="#fff" stroke={NAVY} strokeWidth="1.5" />
            <rect x="82" y="156" width="36" height="5" rx="2" fill="#e8344e" />
            <text x="100" y="172.5" textAnchor="middle" fontSize="13" fontWeight="800" fill={NAVY} fontFamily="system-ui, sans-serif">
              P
            </text>

            {/* arms with big hands */}
            <g className="pace-armL pace-part">
              <path d={ARM_FUR} transform="translate(60 154) rotate(8)" {...fur} />
              <path d={HAND_FUR} transform="translate(55 182) scale(1.15)" {...fur} />
            </g>
            <g className="pace-armR pace-part">
              <path d={ARM_FUR} transform="translate(140 154) rotate(-8)" {...fur} />
              <path d={HAND_FUR} transform="translate(145 182) scale(1.15)" {...fur} />
            </g>

            {/* head */}
            <g className="pace-head-look pace-part">
              <g className="pace-head pace-part">
                <circle cx="56" cy="36" r="17" {...fur} />
                <circle cx="56" cy="38" r="8" fill={FUR_LIGHT} />
                <circle cx="144" cy="36" r="17" {...fur} />
                <circle cx="144" cy="38" r="8" fill={FUR_LIGHT} />
                <path d={HEAD_FUR} {...fur} />
                <ellipse cx="78" cy="42" rx="22" ry="11" fill="#fff" opacity="0.22" transform="rotate(-25 78 42)" />
                <path d="M62 108 Q100 128 138 108 Q130 120 100 122 Q70 120 62 108 Z" fill="#12408f" opacity="0.28" />
                <ellipse cx="100" cy="91" rx="25" ry="17" fill="url(#pace-muzzle)" />
                <g className="pace-eye">
                  <ellipse cx="78" cy="66" rx="16" ry="19" fill="url(#pace-eyeball)" stroke={NAVY} strokeWidth="2.5" />
                  <g className="pace-pupil pace-part">
                    <circle cx="78" cy="69" r="7.5" fill={NAVY} />
                    <circle cx="80.5" cy="65.5" r="2.6" fill="#fff" />
                  </g>
                </g>
                <g className="pace-eye">
                  <ellipse cx="122" cy="66" rx="16" ry="19" fill="url(#pace-eyeball)" stroke={NAVY} strokeWidth="2.5" />
                  <g className="pace-pupil pace-part">
                    <circle cx="122" cy="69" r="7.5" fill={NAVY} />
                    <circle cx="124.5" cy="65.5" r="2.6" fill="#fff" />
                  </g>
                </g>
                <ellipse cx="68" cy="92" rx="8" ry="5" fill="#ff8fa3" opacity="0.55" />
                <ellipse cx="132" cy="92" rx="8" ry="5" fill="#ff8fa3" opacity="0.55" />
                <ellipse cx="100" cy="82" rx="8.5" ry="6" fill={NAVY} />
                <path className="pace-mouth-smile" d="M88 94 Q100 107 112 94" fill="none" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
                <g className="pace-mouth-open">
                  <path d="M88 93 Q100 118 112 93 Z" fill={NAVY} />
                  <ellipse cx="100" cy="104" rx="7" ry="4" fill="#ff7d92" />
                </g>
                <path className="pace-sweat" d="M152 52 Q158 62 152 68 Q146 62 152 52 Z" fill="#9fd4ff" stroke="#4d9bff" strokeWidth="1.5" />
              </g>
            </g>
          </g>
        </g>
        <g fill={NAVY} fontFamily="system-ui, sans-serif" fontWeight="800">
          <text className="pace-zzz" x="148" y="34" fontSize="22">Z</text>
          <text className="pace-zzz pace-zzz-2" x="164" y="18" fontSize="16">z</text>
        </g>
      </svg>
      {state === "throw" && !reducedMotion ? <span className="pace-ball" /> : null}
      {state === "celebrate" && !reducedMotion ? (
        <div className="pace-confetti">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              style={{ "--cx": `${c.x}px`, "--cd": `${c.delay}ms`, "--cr": `${c.rot}deg`, background: c.color } as React.CSSProperties}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
// __________________________GenAI: Generated code ends here______________________________
