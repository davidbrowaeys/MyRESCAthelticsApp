// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** OAuth return point: exchanges the one-time code for a session cookie. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/", origin));
  }
  return NextResponse.redirect(new URL("/login?error=1", origin));
}
// __________________________GenAI: Generated code ends here______________________________
