// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

export interface ChartTab {
  id: string;
  label: string;
  /** Short hint shown above the chart (e.g. the healthy-range legend). */
  note?: string;
  content: ReactNode;
}

/** Accessible tab strip; the first tab is selected initially. Panels are rendered by the server and just toggled here. */
export function ChartTabs({ tabs }: { tabs: ChartTab[] }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const current = Math.min(active, tabs.length - 1);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (current + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    setActive(next);
    document.getElementById(`${base}-tab-${next}`)?.focus();
  };

  return (
    <div className="mt-4">
      <div role="tablist" onKeyDown={onKeyDown} className="flex gap-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={`${base}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={i === current ? 0 : -1}
            onClick={() => setActive(i)}
            className={`min-h-12 flex-1 rounded-2xl border px-3 text-sm font-semibold ${
              i === current ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div key={tab.id} id={`${base}-panel-${i}`} role="tabpanel" aria-labelledby={`${base}-tab-${i}`} hidden={i !== current} className="mt-3">
          {tab.note ? <p className="mb-1 text-xs text-emerald-600 dark:text-emerald-300">{tab.note}</p> : null}
          {tab.content}
        </div>
      ))}
    </div>
  );
}
// __________________________GenAI: Generated code ends here______________________________
