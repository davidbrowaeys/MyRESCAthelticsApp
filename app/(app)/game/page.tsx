// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { HurdleGame } from "@/components/game/hurdle-game";
import { PageHeader } from "@/components/page-header";
import { getDict } from "@/lib/i18n";

export default async function GamePage() {
  const t = await getDict();
  return (
    <>
      <PageHeader title={t.game.title} />
      <p className="mb-4 text-muted">{t.game.intro}</p>
      <HurdleGame labels={t.game} />
    </>
  );
}
// __________________________GenAI: Generated code ends here______________________________
