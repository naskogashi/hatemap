import "server-only";
import { cookies, headers } from "next/headers";
import type { AdminLang } from "@hatemap/lib/taxonomy";

export const LANG_COOKIE = "sb_admin_lang";

/** Admin UI language: the user's choice (cookie), else the browser's preference, else English. */
export async function adminLang(): Promise<AdminLang> {
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  if (c === "sq" || c === "en") return c;
  const accept = ((await headers()).get("accept-language") ?? "").toLowerCase();
  return accept.startsWith("sq") ? "sq" : "en";
}

export type T = ((sq: string, en: string) => string) & { lang: AdminLang };

/** `t("Ruaj", "Save")`: Albanian first, English second, picked by the admin language. */
export async function getT(): Promise<T> {
  const lang = await adminLang();
  return Object.assign((sq: string, en: string) => (lang === "en" ? en : sq), { lang });
}

/** Admin date-time display: "2026-11-11 09:41" (UTC as stored in D1). */
export const dt = (v: string | null | undefined) => (v ? v.replace("T", " ").slice(0, 16) : "");
