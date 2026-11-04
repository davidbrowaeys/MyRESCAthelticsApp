// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";

export interface GridEvent {
  key: string;
  href: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  status: "registered" | "planned" | "open";
}

const DOT: Record<GridEvent["status"], string> = {
  registered: "bg-registered",
  planned: "bg-planned",
  open: "bg-muted",
};
const CHIP: Record<GridEvent["status"], string> = {
  registered: "bg-registered text-registered-foreground",
  planned: "bg-planned text-planned-foreground",
  open: "bg-accent",
};

/** Monday-first month grid. month is "YYYY-MM". Pure server component. */
export function MonthGrid({
  month,
  events,
  locale,
  today,
  training = {},
  trainingLabel = "",
}: {
  month: string;
  events: GridEvent[];
  locale: string;
  today: string;
  /** YYYY-MM-DD -> start times ("18:00") of the training sessions that day. */
  training?: Record<string, string[]>;
  trainingLabel?: string;
}) {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const first = new Date(Date.UTC(y, m - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const total = Math.ceil((offset + daysInMonth) / 7) * 7;
  const wd = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const weekdays = Array.from({ length: 7 }, (_, i) => wd.format(new Date(Date.UTC(2024, 0, 1 + i))));

  const cells = Array.from({ length: total }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1, 1 - offset + i));
    const key = d.toISOString().slice(0, 10);
    return { key, day: d.getUTCDate(), inMonth: d.getUTCMonth() === m - 1 };
  });

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-accent text-center text-xs font-semibold text-muted">
        {weekdays.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((c) => {
          const dayEvents = events.filter((e) => e.start <= c.key && c.key <= e.end);
          const dayTraining = training[c.key] ?? [];
          return (
            <div
              key={c.key}
              className={`min-h-14 border-b border-r border-border p-1 md:min-h-24 ${c.inMonth ? "" : "bg-accent/40 text-muted"}`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  c.key === today ? "bg-primary font-bold text-primary-foreground" : ""
                }`}
              >
                {c.day}
              </span>
              <div className="mt-1 flex flex-wrap gap-1 md:hidden">
                {dayTraining.length > 0 ? (
                  <span
                    role="img"
                    aria-label={`${trainingLabel} ${dayTraining.join(", ")}`}
                    className="h-2.5 w-2.5 rounded-sm bg-training"
                  />
                ) : null}
                {dayEvents.slice(0, 4).map((e) => (
                  <Link
                    key={e.key}
                    href={e.href}
                    aria-label={e.name}
                    className={`h-2.5 w-2.5 rounded-full ${DOT[e.status]}`}
                  />
                ))}
              </div>
              <div className="mt-1 hidden flex-col gap-1 md:flex">
                {dayTraining.map((time) => (
                  <span key={time} className="truncate rounded-md bg-training px-1.5 py-0.5 text-xs font-medium text-training-foreground">
                    {trainingLabel} {time}
                  </span>
                ))}
                {dayEvents.slice(0, 3).map((e) => (
                  <Link
                    key={e.key}
                    href={e.href}
                    title={e.name}
                    className={`truncate rounded-md px-1.5 py-0.5 text-xs font-medium ${CHIP[e.status]}`}
                  >
                    {e.name}
                  </Link>
                ))}
                {dayEvents.length > 3 ? <span className="text-xs text-muted">+{dayEvents.length - 3}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// __________________________GenAI: Generated code ends here______________________________
