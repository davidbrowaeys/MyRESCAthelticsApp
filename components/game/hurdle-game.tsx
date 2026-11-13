// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { submitGameScore } from "@/app/(app)/game/actions";
import { PaceCharacter } from "@/components/pace/pace-character";
import type { PaceVisual } from "@/components/pace/types";
import {
  PLAYER_X,
  createState,
  multiplierFor,
  scoreOf,
  step,
  type GameState,
  type Obstacle,
} from "@/lib/game/hurdle-engine";

export interface HurdleGameLabels {
  stageLabel: string;
  hint: string;
  start: string;
  restart: string;
  score: string;
  best: string;
  multiplier: string;
  gameOver: string;
  badgeUnlocked: string;
  seeBadges: string;
}

const W = 800;
const H = 240;
const GROUND = 200;
const PPU = 20; // pixels per metre
const PACE_W = 72;
const PACE_H = 80;
// Narrow screens show at least this many logical px of track (26 m) so the stage is zoomed in, not shrunk.
const MIN_VIEW_W = 520;
// Matches the main layout's bottom padding (pb-28) reserved for the mobile tab bar.
const BOTTOM_RESERVE = 112;
const BEST_KEY = "pace-hurdle-best";
const RESTART_LOCK_MS = 600;
const FIXED_DT = 1 / 120;

function drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const px = o.x * PPU;
  const w = o.width * PPU;
  if (o.kind === "pit") {
    ctx.fillStyle = "#2b6cb0";
    ctx.fillRect(px, GROUND, w, H - GROUND);
    ctx.fillStyle = "#63b3ed";
    ctx.fillRect(px, GROUND, w, 4);
    return;
  }
  const h = o.height * PPU;
  if (o.kind === "steeple") {
    ctx.fillStyle = "#7b4a22";
    ctx.fillRect(px, GROUND - h, w, h);
    ctx.fillStyle = "#c58a4e";
    ctx.fillRect(px, GROUND - h, w, 6);
    return;
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(px, GROUND - h, 4, h);
  ctx.fillRect(px + w - 4, GROUND - h, 4, h);
  ctx.fillStyle = o.kind === "double" ? "#ff5d73" : "#ffd23f";
  ctx.fillRect(px, GROUND - h, w, 6);
}

function draw(ctx: CanvasRenderingContext2D, s: GameState) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#d9733b";
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  const offset = -((s.distance * PPU) % 80);
  for (let x = offset; x < W; x += 80) ctx.fillRect(x, GROUND + 22, 40, 3);
  for (const o of s.obstacles) drawObstacle(ctx, o);
}

export function HurdleGame({ labels }: { labels: HurdleGameLabels }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paceBoxRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameState>(createState());
  const statusRef = useRef<"ready" | "playing" | "over">("ready");
  const inputRef = useRef({ pressed: false, held: false });
  const reducedRef = useRef(false);
  const overAtRef = useRef(0);
  const hudRef = useRef({ score: 0, multiplier: 1 });
  const paceRef = useRef<PaceVisual>("running");

  const [status, setStatus] = useState<"ready" | "playing" | "over">("ready");
  const [hud, setHud] = useState({ score: 0, multiplier: 1 });
  const [best, setBest] = useState(0);
  const [pace, setPace] = useState<PaceVisual>("running");
  const [unlocked, setUnlocked] = useState(false);
  const [view, setView] = useState({ scale: 1, height: H });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [, startTransition] = useTransition();

  const setPaceIfChanged = useCallback((next: PaceVisual) => {
    if (paceRef.current === next) return;
    paceRef.current = next;
    setPace(next);
  }, []);

  const start = useCallback(() => {
    gameRef.current = createState({ speedScale: reducedRef.current ? 0.7 : 1 });
    inputRef.current = { pressed: false, held: false };
    statusRef.current = "playing";
    hudRef.current = { score: 0, multiplier: 1 };
    setHud(hudRef.current);
    setUnlocked(false);
    setStatus("playing");
    setPaceIfChanged("running");
  }, [setPaceIfChanged]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = reduced;
    const stored = Number(window.localStorage.getItem(BEST_KEY));
    /* eslint-disable react-hooks/set-state-in-effect -- browser-only values, read once after mount */
    setReducedMotion(reduced);
    if (Number.isFinite(stored) && stored > 0) setBest(stored);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Zoom the 800x240 track to the width (cropping the far right on narrow screens) and, in portrait,
  // grow the sky above it so the stage fills the remaining screen height.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      const nextScale = width / Math.min(W, Math.max(MIN_VIEW_W, width));
      let height = H;
      if (window.innerHeight > window.innerWidth) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const available = window.innerHeight - top - BOTTOM_RESERVE;
        height = Math.max(H, available / nextScale);
      }
      setView((prev) => (prev.scale === nextScale && prev.height === height ? prev : { scale: nextScale, height }));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const finish = (final: GameState) => {
      statusRef.current = "over";
      overAtRef.current = performance.now();
      setStatus("over");
      setPaceIfChanged("tired");
      const finalScore = scoreOf(final);
      setBest((prev) => {
        const next = Math.max(prev, finalScore);
        window.localStorage.setItem(BEST_KEY, String(next));
        return next;
      });
      startTransition(async () => {
        const result = await submitGameScore(final.distance);
        if (result.earned.length > 0) setUnlocked(true);
      });
    };

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (statusRef.current === "playing") {
        // Fixed 120 Hz sub-steps keep jump arcs and collisions identical on any refresh rate.
        acc += dt;
        let next = gameRef.current;
        while (acc >= FIXED_DT && next.alive) {
          const input = { pressed: inputRef.current.pressed, held: inputRef.current.held };
          inputRef.current.pressed = false;
          next = step(next, FIXED_DT, input);
          acc -= FIXED_DT;
        }
        gameRef.current = next;
        const s = scoreOf(next);
        const m = multiplierFor(next.streak);
        if (s !== hudRef.current.score || m !== hudRef.current.multiplier) {
          hudRef.current = { score: s, multiplier: m };
          setHud(hudRef.current);
        }
        if (!next.alive) finish(next);
        else setPaceIfChanged(next.onGround ? "running" : "jump");
      }
      const g = gameRef.current;
      draw(ctx, g);
      const box = paceBoxRef.current;
      if (box) box.style.transform = `translate3d(${PLAYER_X * PPU - PACE_W / 2}px, ${GROUND - PACE_H + 6 - g.y * PPU}px, 0)`;
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [setPaceIfChanged, startTransition]);

  const press = useCallback(() => {
    if (statusRef.current === "playing") {
      inputRef.current.pressed = true;
      inputRef.current.held = true;
    } else if (statusRef.current === "ready") {
      start();
    } else if (performance.now() - overAtRef.current > RESTART_LOCK_MS) {
      start();
    }
  }, [start]);

  const release = useCallback(() => {
    inputRef.current.held = false;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "ArrowUp") return;
      // Let focused buttons and links keep their own Space / Enter behaviour.
      if (e.target instanceof HTMLElement && e.target.closest("button, a, input, textarea, select")) return;
      e.preventDefault();
      if (!e.repeat) press();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") release();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [press, release]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          {labels.score}: {hud.score}
        </span>
        <span aria-hidden={hud.multiplier === 1}>{hud.multiplier > 1 ? `${labels.multiplier} x${hud.multiplier}` : ""}</span>
        <span>
          {labels.best}: {best}
        </span>
      </div>

      <div
        ref={wrapperRef}
        role="img"
        aria-label={labels.stageLabel}
        className="relative w-full select-none overflow-hidden rounded-3xl border border-border"
        style={{ height: view.height * view.scale, touchAction: "manipulation" }}
      >
        <div
          onPointerDown={press}
          onPointerUp={release}
          onPointerCancel={release}
          onPointerLeave={release}
          className="absolute left-0 top-0 bg-gradient-to-b from-sky-300 to-sky-100"
          style={{ width: W, height: view.height, transform: `scale(${view.scale})`, transformOrigin: "top left" }}
        >
          <div className="absolute bottom-0 left-0" style={{ width: W, height: H }}>
            <canvas ref={canvasRef} style={{ width: W, height: H }} />
            <div ref={paceBoxRef} className="pace-game absolute left-0 top-0" style={{ width: PACE_W, height: PACE_H, willChange: "transform" }}>
              <PaceCharacter state={pace} size="sm" reducedMotion={reducedMotion} />
            </div>
          </div>
        </div>

        {status !== "playing" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 p-4 text-center text-white">
            {status === "over" ? (
              <div role="status" className="space-y-1">
                <p className="text-2xl font-bold">{labels.gameOver}</p>
                <p>
                  {labels.score}: {hud.score}
                </p>
                {unlocked ? (
                  <p className="font-semibold">
                    {labels.badgeUnlocked}{" "}
                    <Link href="/badges" className="underline">
                      {labels.seeBadges}
                    </Link>
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="max-w-xs text-sm">{labels.hint}</p>
            )}
            <button
              type="button"
              onClick={start}
              className="min-h-12 rounded-2xl bg-primary px-6 font-semibold text-white"
            >
              {status === "over" ? labels.restart : labels.start}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
// __________________________GenAI: Generated code ends here______________________________
