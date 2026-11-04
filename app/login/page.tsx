// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Image from "next/image";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDict } from "@/lib/i18n";
import { signIn, signInWithGoogle } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const t = await getDict();
  const { error } = await searchParams;
  const field =
    "mt-1 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-base text-foreground";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <Image
        src="/icons/resc-logo.png"
        alt={t.appName}
        width={160}
        height={160}
        priority
        className="mx-auto mb-6 h-40 w-40 rounded-3xl object-contain"
      />
      <h1 className="mb-1 text-center text-3xl font-bold tracking-tight">{t.appName}</h1>
      <p className="mb-6 text-center text-sm text-muted">{t.login.private}</p>

      {error ? (
        <p role="alert" className="mb-4 rounded-2xl bg-accent p-3 text-sm">
          {t.login.error}
        </p>
      ) : null}

      <form action={signIn} className="space-y-4">
        <label className="block text-sm font-medium">
          {t.login.email}
          <input name="email" type="email" autoComplete="email" required className={field} />
        </label>
        <label className="block text-sm font-medium">
          {t.login.password}
          <input name="password" type="password" autoComplete="current-password" required className={field} />
        </label>
        <button
          type="submit"
          className="min-h-12 w-full rounded-2xl bg-primary px-4 font-semibold text-primary-foreground"
        >
          {t.login.submit}
        </button>
      </form>
      <p className="my-4 text-center text-sm text-muted">{t.login.or}</p>
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 font-semibold text-foreground"
        >
          <Image src="/icons/google.webp" alt="" width={20} height={20} aria-hidden="true" />
          {t.login.google}
        </button>
      </form>
      <div className="mt-6">
        <LanguageSwitcher />
      </div>
    </main>
  );
}
// __________________________GenAI: Generated code ends here______________________________
