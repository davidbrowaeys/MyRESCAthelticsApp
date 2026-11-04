// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";

export interface GridEvent {
  key: string;
  href: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  mine: boolean;
}

/** Monday-first month grid. month is "YYYY-MM". Pure server component. */
export function MonthGrid({ month, events, locale, today }: { month: string; events: GridEvent[]; locale: string; today: string }) {
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
                {dayEvents.slice(0, 4).map((e) => (
                  <Link
                    key={e.key}
                    href={e.href}
                    aria-label={e.name}
                    className={`h-2.5 w-2.5 rounded-full ${e.mine ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </div>
              <div className="mt-1 hidden flex-col gap-1 md:flex">
                {dayEvents.slice(0, 3).map((e) => (
                  <Link
                    key={e.key}
                    href={e.href}
                    title={e.name}
                    className={`truncate rounded-md px-1.5 py-0.5 text-xs font-medium ${
                      e.mine ? "bg-primary text-primary-foreground" : "bg-accent"
                    }`}
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
