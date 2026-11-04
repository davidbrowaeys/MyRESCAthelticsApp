// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { Pace } from "@/components/pace";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Defence in depth: the proxy already redirects anonymous users.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const t = await getDict();
  return (
    <>
      {/* Mobile: single column above the bottom bar. md+: content to the right of the 15rem sidebar. */}
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-6 md:ml-60 md:max-w-none md:px-8 md:pb-10 lg:px-10 xl:mx-auto xl:max-w-7xl xl:pl-72 2xl:max-w-[96rem]">
        {children}
      </main>
      <BottomNav labels={{ ...t.nav, appName: t.appName }} />
      <Pace labels={t.pace} />
    </>
  );
}
// __________________________GenAI: Generated code ends here______________________________
