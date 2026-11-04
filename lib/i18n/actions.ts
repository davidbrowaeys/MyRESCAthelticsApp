// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, LOCALE_COOKIE } from "./index";

export async function setLocale(formData: FormData): Promise<void> {
  const value = formData.get("locale");
  if (!isLocale(value)) return;
  (await cookies()).set(LOCALE_COOKIE, value, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}
// __________________________GenAI: Generated code ends here______________________________
