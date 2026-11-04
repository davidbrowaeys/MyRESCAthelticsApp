// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
export interface TrainingSlot {
  id: string;
  weekday: number; // 1 = Monday ... 7 = Sunday
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface TrainingOccurrence {
  slotId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
}

/** ISO weekday (1 = Monday ... 7 = Sunday) of a YYYY-MM-DD date. */
export function isoWeekday(date: string): number {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return ((new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7) + 1;
}

/** Expands weekly slots into dated occurrences between from and to (both inclusive, YYYY-MM-DD). */
export function expandSlots(slots: TrainingSlot[], from: string, to: string): TrainingOccurrence[] {
  const out: TrainingOccurrence[] = [];
  const [y, m, d] = from.split("-").map(Number) as [number, number, number];
  for (let i = 0; ; i++) {
    const date = new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10);
    if (date > to) break;
    const wd = isoWeekday(date);
    for (const s of slots) {
      if (s.weekday === wd) out.push({ slotId: s.id, date, startTime: s.startTime, endTime: s.endTime });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}
// __________________________GenAI: Generated code ends here______________________________
