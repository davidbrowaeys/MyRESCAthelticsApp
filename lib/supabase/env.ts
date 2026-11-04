// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Public Supabase settings only (URL + publishable key). The service-role key is never read here.
export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example)");
  }
  return { url, key };
}
// __________________________GenAI: Generated code ends here______________________________
