import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CATEGORIES, GROUPS, SOURCES, VERIFICATION, isKey, isMunicipality } from "@hatemap/lib/taxonomy";
import type { Lang } from "@hatemap-host";

export type HmRecord = {
  id: number;
  public_id: string | null;
  category: string;
  affected_group: string | null;
  source_type: string;
  verification: string;
  status: string;
  sensitivity: string;
  municipality: string;
  occurred_on: string;
  title_sq: string | null;
  title_en: string | null;
  title_sr: string | null;
  summary_sq: string | null;
  summary_en: string | null;
  summary_sr: string | null;
  evidence_json: string | null;
  internal_notes: string | null;
  report_id: number | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type HmReport = {
  id: number;
  received_at: string;
  lang: string;
  category: string | null;
  municipality: string | null;
  occurred_on: string | null;
  description: string;
  source_url: string | null;
  contact: string | null;
  contact_ok: number;
  status: string;
  record_id: number | null;
  handled_by: string | null;
  handled_at: string | null;
  notes: string | null;
};

export type Evidence = { url: string; label?: string; public?: boolean };

export type PublicFilters = {
  municipality?: string;
  category?: string;
  group?: string;
  source?: string;
  verification?: string;
  from?: string; // YYYY-MM
  to?: string; // YYYY-MM
  q?: string;
  year?: string; // YYYY (SPLC-style year control)
  verifiedOnly?: boolean;
};

async function db() {
  return (await getCloudflareContext({ async: true })).env.DB;
}

/** Only whitelisted values reach SQL; everything else is dropped. */
export function sanitizeFilters(raw: Record<string, string | string[] | undefined>): PublicFilters {
  const one = (k: string) => {
    const v = raw[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  const month = (v?: string) => (v && /^\d{4}-\d{2}$/.test(v) ? v : undefined);
  const f: PublicFilters = {};
  const m = one("komuna") ?? one("municipality");
  if (isMunicipality(m)) f.municipality = m;
  const c = one("kategoria") ?? one("category");
  if (isKey(CATEGORIES, c)) f.category = c;
  const g = one("grupi") ?? one("group");
  if (isKey(GROUPS, g)) f.group = g;
  const s = one("burimi") ?? one("source");
  if (isKey(SOURCES, s)) f.source = s;
  const v = one("verifikimi") ?? one("verification");
  if (isKey(VERIFICATION, v)) f.verification = v;
  f.from = month(one("nga") ?? one("from"));
  f.to = month(one("deri") ?? one("to"));
  const q = one("q");
  if (q && q.length >= 2) f.q = q.slice(0, 80);
  const y = one("viti") ?? one("year");
  if (y && /^d{4}$/.test(y)) {
    f.year = y;
    f.from = `${y}-01`;
    f.to = `${y}-12`;
  }
  if ((one("verified") ?? one("verifikuar")) === "1") {
    f.verifiedOnly = true;
    f.verification = "verified";
  }
  return f;
}

function where(f: PublicFilters, lang: Lang): { sql: string; binds: unknown[] } {
  const parts = ["status IN ('published','redacted')"];
  const binds: unknown[] = [];
  const add = (sql: string, v: unknown) => {
    binds.push(v);
    parts.push(sql.replace("?", `?${binds.length}`));
  };
  if (f.municipality) add("municipality = ?", f.municipality);
  if (f.category) add("category = ?", f.category);
  if (f.group) add("affected_group = ?", f.group);
  if (f.source) add("source_type = ?", f.source);
  if (f.verification) add("verification = ?", f.verification);
  if (f.from) add("substr(occurred_on, 1, 7) >= ?", f.from);
  if (f.to) add("substr(occurred_on, 1, 7) <= ?", f.to);
  if (f.q) {
    const like = `%${f.q.replace(/[%_]/g, "")}%`;
    binds.push(like);
    const n = binds.length;
    // Redacted records are only findable by their public ID, never by their withheld text.
    parts.push(`(public_id LIKE ?${n} OR (status = 'published' AND (COALESCE(title_${lang}, title_sq) LIKE ?${n} OR COALESCE(summary_${lang}, summary_sq) LIKE ?${n})))`);
  }
  return { sql: parts.join(" AND "), binds };
}

export async function listPublic(f: PublicFilters, lang: Lang, limit = 200) {
  const d = await db();
  const w = where(f, lang);
  const [rows, byMunicipality, byCategory, total, stats, years] = await d.batch([
    d.prepare(`SELECT * FROM hm_records WHERE ${w.sql} ORDER BY occurred_on DESC, id DESC LIMIT ${limit}`).bind(...w.binds),
    d.prepare(`SELECT municipality AS k, COUNT(*) AS n FROM hm_records WHERE ${w.sql} GROUP BY municipality`).bind(...w.binds),
    d.prepare(`SELECT category AS k, COUNT(*) AS n FROM hm_records WHERE ${w.sql} GROUP BY category ORDER BY n DESC`).bind(...w.binds),
    d.prepare(`SELECT COUNT(*) AS n FROM hm_records WHERE status IN ('published','redacted')`),
    d.prepare(
      `SELECT SUM(verification = 'verified') AS verified, COUNT(DISTINCT municipality) AS municipalities,
              MIN(substr(occurred_on, 1, 4)) AS first_year, MAX(substr(occurred_on, 1, 4)) AS last_year
       FROM hm_records WHERE status IN ('published','redacted')`,
    ),
    d.prepare(`SELECT DISTINCT substr(occurred_on, 1, 4) AS y FROM hm_records WHERE status IN ('published','redacted') ORDER BY y DESC`),
  ]);
  const st = (stats.results[0] ?? {}) as { verified: number | null; municipalities: number; first_year: string | null };
  return {
    records: (rows.results as HmRecord[]).map(redact),
    byMunicipality: Object.fromEntries((byMunicipality.results as { k: string; n: number }[]).map((r) => [r.k, r.n])),
    byCategory: byCategory.results as { k: string; n: number }[],
    totalPublished: Number((total.results[0] as { n: number }).n),
    verifiedCount: Number(st.verified ?? 0),
    municipalitiesWithRecords: Number(st.municipalities ?? 0),
    firstYear: st.first_year,
    years: (years.results as { y: string }[]).map((r) => r.y).filter(Boolean),
  };
}

const REDACTED_TEXT = {
  title: { sq: "Detajet janë mbajtur të fshehta", en: "Details withheld", sr: "Detalji su uskraćeni" },
  summary: {
    sq: "Ky regjistrim numërohet në hartë, por titulli, përmbledhja dhe burimet nuk publikohen për arsye sigurie ose mbrojtjeje.",
    en: "This record is counted on the map, but its title, summary and sources are withheld for safety or safeguarding reasons.",
    sr: "Ovaj zapis se računa na mapi, ali su naslov, sažetak i izvori uskraćeni iz bezbednosnih ili zaštitnih razloga.",
  },
};

/** Redacted records keep their classification public but never their text or sources. */
function redact(r: HmRecord): HmRecord {
  if (r.status !== "redacted") return r;
  return {
    ...r,
    title_sq: REDACTED_TEXT.title.sq, title_en: REDACTED_TEXT.title.en, title_sr: REDACTED_TEXT.title.sr,
    summary_sq: REDACTED_TEXT.summary.sq, summary_en: REDACTED_TEXT.summary.en, summary_sr: REDACTED_TEXT.summary.sr,
    evidence_json: "[]",
    internal_notes: null,
    created_by: null,
    updated_by: null,
  };
}

export function evidence(r: Pick<HmRecord, "evidence_json">): Evidence[] {
  try {
    const list = JSON.parse(r.evidence_json ?? "[]") as Evidence[];
    return Array.isArray(list) ? list.filter((e) => e && typeof e.url === "string" && /^https?:\/\//.test(e.url)) : [];
  } catch {
    return [];
  }
}

export function localized(r: HmRecord, lang: Lang): { title: string; summary: string; fallback: boolean } {
  const title = (r[`title_${lang}` as const] ?? "").trim();
  const summary = (r[`summary_${lang}` as const] ?? "").trim();
  if (title && summary) return { title, summary, fallback: false };
  return { title: r.title_sq ?? "", summary: r.summary_sq ?? "", fallback: lang !== "sq" };
}

export type AuditEntity = "record" | "report" | "user" | "case" | "content" | "media" | "access" | "security";

/** Append-only audit trail (UPDATE/DELETE are blocked by triggers, see migrations/0005). */
export async function audit(actor: string, action: string, entity: AuditEntity, entityId: number | null, details?: unknown) {
  await (await db())
    .prepare("INSERT INTO hm_audit (actor, action, entity, entity_id, details) VALUES (?1, ?2, ?3, ?4, ?5)")
    .bind(actor, action, entity, entityId, details === undefined ? null : JSON.stringify(details))
    .run();
}

/** Fixed-window rate limit stored in D1. Returns false when the limit is exceeded. */
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const row = await (await db())
    .prepare(
      `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN window_start <= ?2 - ?3 THEN 1 ELSE count + 1 END,
         window_start = CASE WHEN window_start <= ?2 - ?3 THEN ?2 ELSE window_start END
       RETURNING count`,
    )
    .bind(key, now, windowSeconds)
    .first<{ count: number }>();
  return (row?.count ?? 1) <= max;
}

export async function nextPublicId(): Promise<string> {
  const year = new Date().getUTCFullYear();
  const row = await (await db())
    .prepare(`SELECT COUNT(*) AS n FROM hm_records WHERE public_id LIKE ?1`)
    .bind(`HM-${year}-%`)
    .first<{ n: number }>();
  return `HM-${year}-${String((row?.n ?? 0) + 1).padStart(4, "0")}`;
}

/** Public date shown at month precision only (safeguarding: avoid pinpointing). */
export function publicMonth(occurred: string, lang: Lang): string {
  const m = occurred.match(/^(\d{4})-(\d{2})/);
  if (!m) return occurred;
  const names: Record<Lang, string[]> = {
    sq: ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    sr: ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"],
  };
  return `${names[lang][Number(m[2]) - 1]} ${m[1]}`;
}
