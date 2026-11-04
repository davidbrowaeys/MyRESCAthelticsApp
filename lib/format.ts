// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
const formats = new Map<string, Intl.DateTimeFormat>();

function dayFormat(locale: string): Intl.DateTimeFormat {
  let f = formats.get(locale);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Brussels",
    });
    formats.set(locale, f);
  }
  return f;
}

/** Formats a YYYY-MM-DD date (a Brussels calendar day) for display in the given locale (default French). */
export function formatDay(isoDate: string, locale = "fr-BE"): string {
  return dayFormat(locale).format(new Date(`${isoDate}T12:00:00Z`));
}

/** "mai 2026" / "May 2026" for a YYYY-MM-DD date. */
export function formatMonthYear(isoDate: string, locale = "fr-BE"): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "Europe/Brussels" }).format(
    new Date(`${isoDate}T12:00:00Z`),
  );
}

export function formatDayRange(start: string, end: string, locale = "fr-BE"): string {
  return start === end ? formatDay(start, locale) : `${formatDay(start, locale)} - ${formatDay(end, locale)}`;
}
// __________________________GenAI: Generated code ends here______________________________
