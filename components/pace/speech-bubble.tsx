// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
/** Non-interactive speech bubble: animates in/out via CSS and never captures pointer events. */
import "./pace.css";

export function SpeechBubble({ text, open }: { text: string; open: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-open={open}
      className="pace-bubble pointer-events-none mb-6 max-w-[min(16rem,58vw)] rounded-2xl border border-border bg-card px-3 py-2 text-sm font-medium leading-snug text-foreground shadow-md md:text-base"
    >
      {text}
    </div>
  );
}
// __________________________GenAI: Generated code ends here______________________________
