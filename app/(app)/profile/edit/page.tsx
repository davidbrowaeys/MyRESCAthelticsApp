// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/page-header";
import { getCurrentAthlete } from "@/lib/athletes";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { saveDetails } from "../actions";

export default async function EditProfilePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const t = await getDict();
  const { error } = await searchParams;
  const athlete = await getCurrentAthlete();
  if (!athlete) {
    return (
      <>
        <PageHeader title={t.details.title} />
        <EmptyState message={t.athlete.needProfile} />
        <Link href="/profile" className="mt-4 flex min-h-12 items-center justify-center font-semibold text-primary">
          {t.athlete.goProfile}
        </Link>
      </>
    );
  }
  const supabase = await createClient();
  const { data: contact } = await supabase.from("profiles").select("phone, contact_email").maybeSingle();
  const field = "mt-1 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-base text-foreground";

  return (
    <>
      <PageHeader title={t.details.title} />
      <section className="rounded-3xl border border-border bg-card p-6" aria-label={t.details.title}>
        {error === "details" ? <p role="alert" className="mb-3 rounded-2xl bg-accent p-3 text-sm">{t.details.error}</p> : null}
        <form action={saveDetails} className="space-y-3">
          <label className="block text-sm font-medium">
            {t.athlete.firstName}
            <input name="firstName" required defaultValue={athlete.firstName} maxLength={80} autoComplete="given-name" className={field} />
          </label>
          <label className="block text-sm font-medium">
            {t.details.lastName}
            <input name="lastName" required defaultValue={athlete.lastName ?? ""} maxLength={80} autoComplete="family-name" className={field} />
          </label>
          <label className="block text-sm font-medium">
            {t.details.nickname}
            <input name="nickname" defaultValue={athlete.nickname ?? ""} maxLength={30} autoComplete="nickname" className={field} />
          </label>
          <label className="block text-sm font-medium">
            {t.details.phone}
            <input name="phone" type="tel" defaultValue={contact?.phone ?? ""} maxLength={20} autoComplete="tel" className={field} />
          </label>
          <label className="block text-sm font-medium">
            {t.details.email}
            <input name="contactEmail" type="email" defaultValue={contact?.contact_email ?? ""} maxLength={120} autoComplete="email" className={field} />
          </label>
          <button type="submit" className="min-h-12 w-full rounded-2xl bg-primary px-4 font-semibold text-primary-foreground">
            {t.details.save}
          </button>
        </form>
        <Link href="/profile" className="mt-2 flex min-h-12 items-center justify-center text-sm text-muted underline">
          {t.details.back}
        </Link>
      </section>
    </>
  );
}
// __________________________GenAI: Generated code ends here______________________________
