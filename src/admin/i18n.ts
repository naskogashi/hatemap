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

/** Kosovo's time zone (CET/CEST; Kosovo shares the Europe/Belgrade zone in the IANA database). */
export const KOSOVO_TZ = "Europe/Belgrade";

const KOSOVO_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: KOSOVO_TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * Admin date-time display in Kosovo time: "11.11.2026 22:51".
 * D1 stores timestamps in UTC ("2026-11-11 21:51:07"); they are converted here.
 */
export const dt = (v: string | null | undefined) => {
  if (!v) return "";
  const iso = v.includes("T") ? v : v.replace(" ", "T");
  const d = new Date(/(Z|[+-]\d\d:?\d\d)$/.test(iso) ? iso : `${iso}Z`);
  if (Number.isNaN(d.getTime())) return v;
  const p = Object.fromEntries(KOSOVO_FMT.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}`;
};

/** Date only, "11.11.2026", for values that are already local dates (e.g. an article's publish date). */
export const dDate = (v: string | null | undefined) => {
  const m = v?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : (v ?? "");
};
