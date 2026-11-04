// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import type { AchievementView } from "@/lib/gamification/awards";
import { getDict } from "@/lib/i18n";

export async function AchievementsPanel({ items }: { items: AchievementView[] }) {
  const t = await getDict();
  if (items.length === 0) return null;
  const totalXp = items.filter((a) => a.earned).reduce((sum, a) => sum + a.xp, 0);
  return (
    <section className="mb-4 rounded-3xl border border-border bg-card p-4" aria-label={t.achievements.title}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{t.achievements.title}</h2>
        <span className="font-bold">
          {totalXp} {t.achievements.xp}
        </span>
      </div>
      <ul className="mt-2 space-y-2">
        {items.map((a) => (
          <li
            key={a.code}
            className={`flex items-center justify-between gap-3 rounded-2xl p-3 ${a.earned ? "bg-accent" : "border border-border text-muted"}`}
          >
            <div>
              <p className="font-semibold">{a.name}</p>
              <p className="text-sm">{a.description}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold">
              {a.earned ? `${t.achievements.earned} \u00b7 +${a.xp}` : t.achievements.locked}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
// __________________________GenAI: Generated code ends here______________________________
