// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
"use client";
/** Settings row to hide / show Pace (stored on this device). */
import { setPaceEnabled, usePaceEnabled } from "./pace-settings";
import type { PaceDict } from "./pace-messages";

export function PaceToggle({ labels }: { labels: PaceDict }) {
  const enabled = usePaceEnabled();
  return (
    <section className="mt-4 rounded-3xl border border-border bg-card p-6" aria-label={labels.settingsTitle}>
      <h2 className="text-xl font-semibold">{labels.settingsTitle}</h2>
      <p className="mt-2 text-muted">{labels.settingsHint}</p>
      <button
        type="button"
        onClick={() => setPaceEnabled(!enabled)}
        className="mt-3 min-h-12 w-full rounded-2xl border border-border px-4 font-semibold"
      >
        {enabled ? labels.hide : labels.show}
      </button>
    </section>
  );
}
// __________________________GenAI: Generated code ends here______________________________
