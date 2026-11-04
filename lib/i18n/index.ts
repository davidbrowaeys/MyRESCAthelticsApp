// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import { cookies } from "next/headers";
import { en } from "./en";
import { fr, type Dict } from "./fr";
import { nl } from "./nl";

export const LOCALES = ["fr", "en", "nl"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "lang";
export const LOCALE_LABELS: Record<Locale, string> = { fr: "Français", en: "English", nl: "Nederlands" };

const dictionaries: Record<Locale, Dict> = { fr, en, nl };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Locale chosen by the user (cookie); French by default. */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "fr";
}

export async function getDict(): Promise<Dict> {
  return dictionaries[await getLocale()];
}
// __________________________GenAI: Generated code ends here______________________________
