// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Pure game logic for "Pace Hurdle Run" (no DOM, no React). Units are abstract "metres":
// the player stands still at PLAYER_X and the obstacles scroll towards him.

export type ObstacleKind = "hurdle" | "steeple" | "pit" | "double";

export interface Obstacle {
  id: number;
  kind: ObstacleKind;
  /** Left edge, in metres, in the same frame as PLAYER_X. */
  x: number;
  width: number;
  /** 0 for a pit (it is a gap in the track, not a wall). */
  height: number;
  cleared: boolean;
}

export interface GameState {
  alive: boolean;
  /** Seconds survived. */
  time: number;
  /** Metres run. */
  distance: number;
  speed: number;
  /** Multiplies the speed curve (below 1 for reduced-motion users). */
  speedScale: number;
  /** Height above the track and vertical velocity. */
  y: number;
  vy: number;
  holdTime: number;
  onGround: boolean;
  obstacles: Obstacle[];
  nextId: number;
  /** Obstacles cleared in a row. */
  streak: number;
  /** Bonus points already multiplied by the combo. */
  bonus: number;
  /** Which obstacle was next at the last take-off, and how many seconds away it was. */
  lastTakeoff: { id: number | null; gapSec: number };
}

export interface StepInput {
  /** True only on the frame the jump was requested. */
  pressed: boolean;
  /** True while the key / finger is down (a longer hold jumps higher and further). */
  held: boolean;
}

export const PLAYER_X = 9;
export const PLAYER_HALF = 0.5;
export const GRAVITY = 70;
export const HOLD_GRAVITY = 40;
export const JUMP_VELOCITY = 18;
export const MAX_HOLD_SECONDS = 0.35;
export const SPAWN_AHEAD = 45;
export const FIRST_OBSTACLE_X = 28;
export const MAX_STEP_SECONDS = 0.05;
export const PERFECT_WINDOW_SECONDS = 0.2;
export const PERFECT_BONUS = 5;

const BASE_SPEED = 6;
const SPEED_GAIN = 0.4;
const MAX_SPEED = 20;

/** Distance from which each obstacle type can appear. */
export const UNLOCK_DISTANCE: Record<ObstacleKind, number> = {
  hurdle: 0,
  steeple: 150,
  pit: 300,
  double: 500,
};

/** Points per cleared obstacle, before the combo multiplier. A double hurdle counts 20 per hurdle. */
export const CLEAR_POINTS: Record<ObstacleKind, number> = {
  hurdle: 10,
  steeple: 25,
  pit: 25,
  double: 20,
};

/** Badge codes must match supabase/migrations/20261104190000_game_badges.sql. */
export const BADGE_MILESTONES: ReadonlyArray<{ code: string; distance: number }> = [
  { code: "hurdle_100", distance: 100 },
  { code: "hurdle_500", distance: 500 },
  { code: "hurdle_1000", distance: 1000 },
];

export type Rng = () => number;

/** Longer runs are faster: 6 m/s at the start, +0.4 m/s every second, capped at 20 m/s. */
export function speedAt(seconds: number): number {
  return Math.min(BASE_SPEED + SPEED_GAIN * seconds, MAX_SPEED);
}

export function createState(options: { speedScale?: number } = {}): GameState {
  const speedScale = options.speedScale ?? 1;
  return {
    alive: true,
    time: 0,
    distance: 0,
    speed: speedAt(0) * speedScale,
    speedScale,
    y: 0,
    vy: 0,
    holdTime: 0,
    onGround: true,
    obstacles: [],
    nextId: 1,
    streak: 0,
    bonus: 0,
    lastTakeoff: { id: null, gapSec: Infinity },
  };
}

/** x1 up to x5: +1 for every 5 obstacles cleared in a row. */
export function multiplierFor(streak: number): number {
  return Math.min(5, 1 + Math.floor(streak / 5));
}

export function scoreOf(state: GameState): number {
  return Math.floor(state.distance) + state.bonus;
}

export function milestonesReached(distance: number): string[] {
  return BADGE_MILESTONES.filter((m) => distance >= m.distance).map((m) => m.code);
}

/** Free track between the end of one obstacle and the start of the next: always jumpable at this speed. */
export function spawnGap(speed: number, rng: Rng): number {
  return speed * (1.1 + rng() * 0.9);
}

export function pickKind(distance: number, rng: Rng): ObstacleKind {
  const pool = (Object.keys(UNLOCK_DISTANCE) as ObstacleKind[]).filter((k) => distance >= UNLOCK_DISTANCE[k]);
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))] ?? "hurdle";
}

/** Builds the obstacle(s) of a kind starting at x. A tap-jump cannot clear a steeple or a pit; a held jump can. */
export function makeObstacles(kind: ObstacleKind, x: number, speed: number, firstId: number): Obstacle[] {
  const base = { cleared: false };
  switch (kind) {
    case "hurdle":
      return [{ id: firstId, kind, x, width: 0.8, height: 1, ...base }];
    case "steeple":
      return [{ id: firstId, kind, x, width: 0.9, height: 2.8, ...base }];
    case "pit":
      return [{ id: firstId, kind, x, width: 0.58 * speed, height: 0, ...base }];
    case "double":
      return [
        { id: firstId, kind, x, width: 0.8, height: 1, ...base },
        { id: firstId + 1, kind, x: x + 0.8 + 0.9 * speed, width: 0.8, height: 1, ...base },
      ];
  }
}

function isHit(o: Obstacle, y: number): boolean {
  if (o.kind === "pit") {
    return y <= 0 && o.x <= PLAYER_X && PLAYER_X <= o.x + o.width;
  }
  const overlaps = o.x < PLAYER_X + PLAYER_HALF && o.x + o.width > PLAYER_X - PLAYER_HALF;
  return overlaps && y < o.height;
}

/** Advances the game by dtSeconds and returns the new state (the input state is not mutated). */
export function step(state: GameState, dtSeconds: number, input: StepInput, rng: Rng = Math.random): GameState {
  if (!state.alive) return state;
  const dt = Math.min(Math.max(dtSeconds, 0), MAX_STEP_SECONDS);
  const time = state.time + dt;
  const speed = speedAt(time) * state.speedScale;
  const dx = speed * dt;

  let { y, vy, holdTime, onGround, lastTakeoff } = state;

  if (input.pressed && onGround) {
    const next = state.obstacles
      .filter((o) => !o.cleared && o.x + o.width > PLAYER_X - PLAYER_HALF)
      .sort((a, b) => a.x - b.x)[0];
    lastTakeoff = next
      ? { id: next.id, gapSec: Math.max(0, next.x - PLAYER_X) / speed }
      : { id: null, gapSec: Infinity };
    vy = JUMP_VELOCITY;
    holdTime = 0;
    onGround = false;
  }
  if (!onGround) {
    const gravity = input.held && vy > 0 && holdTime < MAX_HOLD_SECONDS ? HOLD_GRAVITY : GRAVITY;
    holdTime += dt;
    vy -= gravity * dt;
    y += vy * dt;
    if (y <= 0) {
      y = 0;
      vy = 0;
      onGround = true;
    }
  }

  let streak = state.streak;
  let bonus = state.bonus;
  let alive = true;
  const moved = state.obstacles.map((o) => ({ ...o, x: o.x - dx }));

  for (const o of moved) {
    if (isHit(o, y)) alive = false;
  }
  if (alive) {
    for (const o of moved) {
      if (!o.cleared && o.x + o.width < PLAYER_X - PLAYER_HALF) {
        o.cleared = true;
        const multiplier = multiplierFor(streak);
        bonus += CLEAR_POINTS[o.kind] * multiplier;
        if (lastTakeoff.id === o.id && lastTakeoff.gapSec <= PERFECT_WINDOW_SECONDS) {
          bonus += PERFECT_BONUS * multiplier;
        }
        streak += 1;
      }
    }
  } else {
    streak = 0;
  }

  const distance = state.distance + dx;
  const obstacles = moved.filter((o) => o.x + o.width > -5);
  let nextId = state.nextId;
  // Bounded loop: each pass adds at least one obstacle ahead of the previous right edge.
  for (let guard = 0; guard < 4; guard++) {
    const last = obstacles[obstacles.length - 1];
    const rightEdge = last ? last.x + last.width : FIRST_OBSTACLE_X - spawnGap(speed, () => 0);
    if (rightEdge >= SPAWN_AHEAD) break;
    const x = last ? rightEdge + spawnGap(speed, rng) : FIRST_OBSTACLE_X;
    const made = makeObstacles(pickKind(distance, rng), x, speed, nextId);
    nextId += made.length;
    obstacles.push(...made);
  }

  return { ...state, alive, time, distance, speed, y, vy, holdTime, onGround, obstacles, nextId, streak, bonus, lastTakeoff };
}
// __________________________GenAI: Generated code ends here______________________________
