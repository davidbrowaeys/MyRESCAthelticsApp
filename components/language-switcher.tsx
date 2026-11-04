// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { setLocale } from "@/lib/i18n/actions";
import { getLocale, LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";

export async function LanguageSwitcher() {
  const [current, t] = await Promise.all([getLocale(), getDict()]);
  return (
    <form action={setLocale} className="flex items-center justify-center gap-2" aria-label={t.language}>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="submit"
          name="locale"
          value={code}
          aria-pressed={code === current}
          className={`min-h-12 rounded-2xl border px-4 text-sm font-semibold ${
            code === current ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
          }`}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </form>
  );
}
// __________________________GenAI: Generated code ends here______________________________
