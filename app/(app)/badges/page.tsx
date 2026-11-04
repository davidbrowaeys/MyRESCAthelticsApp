// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";
import { AchievementsPanel } from "@/components/achievements-panel";
import { EmptyState, PageHeader } from "@/components/page-header";
import { getCurrentAthlete } from "@/lib/athletes";
import { listAchievements } from "@/lib/gamification/awards";
import { getDict } from "@/lib/i18n";

export default async function BadgesPage() {
  const t = await getDict();
  const athlete = await getCurrentAthlete();
  if (!athlete) {
    return (
      <>
        <PageHeader title={t.nav.badges} />
        <EmptyState message={t.athlete.needProfile} />
        <Link href="/profile" className="mt-4 flex min-h-12 items-center justify-center font-semibold text-primary">
          {t.athlete.goProfile}
        </Link>
      </>
    );
  }
  const achievements = await listAchievements(athlete.id);
  return (
    <>
      <PageHeader title={t.nav.badges} />
      <AchievementsPanel items={achievements} />
      <Link href="/game" className="mt-4 flex min-h-12 items-center justify-center font-semibold text-primary">
        {t.game.playLink}
      </Link>
    </>
  );
}
// __________________________GenAI: Generated code ends here______________________________
