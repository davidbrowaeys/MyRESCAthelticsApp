// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
"use client";
/**
 * <Pace /> - composes rendering, state machine, messages and event triggers.
 * Mount once in a layout; control it via props or usePace()/emitPaceEvent().
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { EVENT_TO_STATE, subscribePaceCommands } from "./pace-events";
import { type Reaction } from "./pace-machine";
import { randomReaction, reactionForClick } from "./pace-actions";
import { messageKeyFor, parseMessages, pickMessage, type PaceDict } from "./pace-messages";
import { PaceCharacter } from "./pace-character";
import { usePaceEnabled } from "./pace-settings";
import { SpeechBubble } from "./speech-bubble";
import { usePaceMachine } from "./use-pace-machine";
import type { PaceState, PaceVisual } from "./types";

const BUBBLE_MS = 4500;
const TAP_MESSAGE_GAP_MS = 4000;
const WELCOME_KEY = "pace.welcomed";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(callback: () => void): () => void {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

export interface PaceProps {
  labels: PaceDict;
  /** Controlled base/reaction state. Omit to let Pace run on its own and react to events. */
  state?: PaceState;
  /** Show this message in the speech bubble whenever it changes. */
  message?: string;
  size?: "auto" | "sm";
  /** Inactivity before Pace falls asleep (default 3 minutes). */
  sleepAfterMs?: number;
  onStateChange?: (state: PaceVisual) => void;
}

/** Respects the user's hide/mute setting; nothing is mounted (or listening) when hidden. */
export function Pace(props: PaceProps) {
  return usePaceEnabled() ? <PaceInner {...props} /> : null;
}

function PaceInner({ labels, state, message, size = "auto", sleepAfterMs = 180_000, onStateChange }: PaceProps) {
  const reduced = useReducedMotion();
  const messages = useMemo(() => parseMessages(labels), [labels]);
  const { machine, visual, dispatch, activity } = usePaceMachine(sleepAfterMs);
  const [bubble, setBubble] = useState({ text: "", open: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bubbleTimer = useRef<number | undefined>(undefined);
  const lastText = useRef<string | undefined>(undefined);
  const lastTap = useRef(0);

  const show = useCallback((text: string) => {
    lastText.current = text;
    setBubble({ text, open: true });
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble((b) => ({ ...b, open: false })), BUBBLE_MS);
  }, []);

  const applyState = useCallback(
    (next: PaceState, text?: string, silent = false) => {
      dispatch({ type: "setState", state: next });
      if (silent) return;
      const key = messageKeyFor(next);
      const msg = text ?? (key ? pickMessage(messages[key], lastText.current) : undefined);
      if (msg) show(msg);
    },
    [dispatch, messages, show],
  );

  // Command bus: events from the application, imperative state changes, free-text messages.
  useEffect(
    () =>
      subscribePaceCommands((command) => {
        if (command.kind === "say") show(command.text);
        else if (command.kind === "state") applyState(command.state, command.text);
        else applyState(EVENT_TO_STATE[command.name], command.text);
      }),
    [applyState, show],
  );

  // Welcome once per browser session; delayed so a dev-mode remount does not lose it.
  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(WELCOME_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;
    const id = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(WELCOME_KEY, "1");
      } catch {
        // ignore
      }
      applyState("welcome");
    }, 700);
    return () => window.clearTimeout(id);
  }, [applyState]);

  // Controlled props.
  useEffect(() => {
    if (state) applyState(state, undefined, true);
  }, [state, applyState]);
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => show(message), 0);
    return () => window.clearTimeout(id);
  }, [message, show]);
  useEffect(() => onStateChange?.(visual), [visual, onStateChange]);
  useEffect(() => () => window.clearTimeout(bubbleTimer.current), []);

  // User activity (wakes Pace) + desktop cursor look-at. All listeners passive, so scrolling is untouched.
  useEffect(() => {
    let raf = 0;
    let last: PointerEvent | null = null;
    const lookAt = () => {
      raf = 0;
      const el = buttonRef.current;
      if (!el || !last) return;
      const r = el.getBoundingClientRect();
      const dx = last.clientX - (r.left + r.width / 2);
      const dy = last.clientY - (r.top + r.height * 0.35);
      const dist = Math.hypot(dx, dy) || 1;
      const strength = Math.min(1, dist / 300);
      el.style.setProperty("--look-x", ((dx / dist) * strength * 5).toFixed(2));
      el.style.setProperty("--look-y", ((dy / dist) * strength * 4).toFixed(2));
    };
    const onMove = (e: PointerEvent) => {
      activity();
      if (e.pointerType !== "mouse" || reduced) return;
      last = e;
      if (!raf) raf = window.requestAnimationFrame(lookAt);
    };
    const onActivity = () => activity();
    const onVisibility = () => document.documentElement.setAttribute("data-pace-paused", String(document.hidden));
    const opts = { passive: true } as const;
    window.addEventListener("pointermove", onMove, opts);
    window.addEventListener("pointerdown", onActivity, opts);
    window.addEventListener("keydown", onActivity, opts);
    window.addEventListener("scroll", onActivity, opts);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("scroll", onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
      window.cancelAnimationFrame(raf);
      document.documentElement.removeAttribute("data-pace-paused");
    };
  }, [activity, reduced]);

  // Clicks elsewhere in the app: react to what was clicked, or move randomly.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (target && buttonRef.current?.contains(target)) return;
      activity();
      dispatch({ type: "react", reaction: reactionForClick(target) });
    };
    document.addEventListener("click", onDocClick, { passive: true });
    return () => document.removeEventListener("click", onDocClick);
  }, [activity, dispatch]);

  const onClick = () => {
    const wasSleeping = machine.base === "sleeping";
    activity();
    const reaction: Reaction = wasSleeping
      ? "wiggle"
      : randomReaction();
    dispatch({ type: "react", reaction });
    const now = Date.now();
    if (!wasSleeping && now - lastTap.current > TAP_MESSAGE_GAP_MS && Math.random() < 0.7) {
      const msg = pickMessage(messages.tap, lastText.current);
      if (msg) show(msg);
      lastTap.current = now;
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] right-3 z-20 flex items-end gap-2 md:bottom-4 md:right-4">
      <SpeechBubble text={bubble.text} open={bubble.open} />
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        aria-label={labels.label}
        className="pointer-events-auto rounded-2xl [-webkit-tap-highlight-color:transparent] [touch-action:manipulation]"
      >
        <PaceCharacter state={visual} reducedMotion={reduced} size={size} />
      </button>
    </div>
  );
}
// __________________________GenAI: Generated code ends here______________________________
