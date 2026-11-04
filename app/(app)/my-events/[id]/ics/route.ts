// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { buildIcs } from "@/lib/calendar/export";
import { getParticipationById, toCalendarEvent } from "@/lib/participations";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // RLS: a participation of another parent is simply not found.
  const p = await getParticipationById(id);
  if (!p) return new Response("Not found", { status: 404 });
  return new Response(buildIcs([toCalendarEvent(p)]), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="resc-${p.startDate}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
// __________________________GenAI: Generated code ends here______________________________
