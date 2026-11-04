// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Calendar export helpers (pure). All events are all-day; dates are Brussels calendar days (YYYY-MM-DD).

export interface CalendarEvent {
  uid: string;
  title: string;
  /** YYYY-MM-DD, inclusive */
  startDate: string;
  /** YYYY-MM-DD, inclusive */
  endDate: string;
  location?: string;
  description?: string;
  url?: string;
}

/** Adds days to a YYYY-MM-DD date without timezone drift. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${isoDate}`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const compact = (isoDate: string) => isoDate.replace(/-/g, "");

function describe(ev: CalendarEvent): string {
  return [ev.description, ev.url].filter(Boolean).join("\n");
}

export function buildGoogleCalendarUrl(ev: CalendarEvent): string {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    // Google expects an exclusive end date for all-day events.
    dates: `${compact(ev.startDate)}/${compact(addDays(ev.endDate, 1))}`,
  });
  const details = describe(ev);
  if (details) p.set("details", details);
  if (ev.location) p.set("location", ev.location);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function buildOutlookUrl(ev: CalendarEvent): string {
  const p = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: ev.title,
    startdt: ev.startDate,
    enddt: addDays(ev.endDate, 1),
    allday: "true",
  });
  const body = describe(ev);
  if (body) p.set("body", body);
  if (ev.location) p.set("location", ev.location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds a content line at 75 octets (RFC 5545), never splitting a multi-byte character. */
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let size = 0;
  let limit = 75;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (size + n > limit) {
      parts.push(current);
      current = "";
      size = 0;
      limit = 74; // continuation lines start with one space
    }
    current += ch;
    size += n;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function utcStamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildIcs(events: CalendarEvent[], now: Date = new Date()): string {
  const lines: string[] = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//My RESC Athletics//FR", "CALSCALE:GREGORIAN"];
  for (const ev of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.uid}`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART;VALUE=DATE:${compact(ev.startDate)}`,
      `DTEND;VALUE=DATE:${compact(addDays(ev.endDate, 1))}`,
      `SUMMARY:${escapeText(ev.title)}`,
    );
    const description = describe(ev);
    if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);
    if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`);
    if (ev.url) lines.push(`URL:${ev.url}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
// __________________________GenAI: Generated code ends here______________________________
