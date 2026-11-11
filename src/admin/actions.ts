"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { requirePerm } from "@hatemap-host";
import { audit, nextPublicId, type HmRecord } from "@hatemap/lib/records";
import {
  CATEGORIES, GROUPS, PUBLIC_STATUSES, RECORD_STATUSES, SOURCES, TRANSITIONS, VERIFICATION,
  can, isKey, isMunicipality, publicationBlockers, type RecordStatus,
} from "@hatemap/lib/taxonomy";
import { adminLang } from "@hatemap/admin/i18n";

const str = (f: FormData, k: string, max = 5000) => String(f.get(k) ?? "").trim().slice(0, max);
const db = async () => (await getCloudflareContext({ async: true })).env.DB;
const q = (v: string) => encodeURIComponent(v);

const EDITABLE = [
  "category", "affected_group", "source_type", "verification", "sensitivity", "municipality", "occurred_on",
  "title_sq", "title_en", "title_sr", "summary_sq", "summary_en", "summary_sr", "evidence_json", "internal_notes",
] as const;

function parseEvidence(text: string): string {
  // One source per line: "https://… | label | public"  (public flag optional; default: not public)
  const items = text
    .split(/\r?\n/)
    .map((line) => line.split("|").map((p) => p.trim()))
    .filter(([url]) => /^https?:\/\/\S+$/i.test(url ?? ""))
    .map(([url, lbl, pub]) => ({ url, label: lbl || undefined, public: /^(public|publik|po|yes|1)$/i.test(pub ?? "") }));
  return JSON.stringify(items);
}

/**
 * Create or update a record's CONTENT. Status never changes here (see decideRecord),
 * so saving can never publish anything. Edits to a public record are corrections
 * and require a note, which goes to the audit trail.
 */
export async function saveRecord(form: FormData) {
  const s = await requirePerm("hatemap_edit");
  const d = await db();
  const lang = await adminLang();
  const id = Number(str(form, "id")) || null;
  const before = id ? await d.prepare("SELECT * FROM hm_records WHERE id = ?1").bind(id).first<HmRecord>() : null;
  if (id && !before) redirect("/admin/hatemap/?tab=records&error=notfound");

  const v: Record<(typeof EDITABLE)[number], string | null> = {
    category: isKey(CATEGORIES, str(form, "category")) ? str(form, "category") : "other",
    affected_group: isKey(GROUPS, str(form, "affected_group")) ? str(form, "affected_group") : null,
    source_type: isKey(SOURCES, str(form, "source_type")) ? str(form, "source_type") : "sbunker",
    verification: isKey(VERIFICATION, str(form, "verification")) ? str(form, "verification") : "signal",
    sensitivity: str(form, "sensitivity") === "high" ? "high" : "normal",
    municipality: isMunicipality(str(form, "municipality")) ? str(form, "municipality") : "",
    occurred_on: /^\d{4}-\d{2}(-\d{2})?$/.test(str(form, "occurred_on")) ? str(form, "occurred_on") : "",
    title_sq: str(form, "title_sq", 200) || null,
    title_en: str(form, "title_en", 200) || null,
    title_sr: str(form, "title_sr", 200) || null,
    summary_sq: str(form, "summary_sq", 2000) || null,
    summary_en: str(form, "summary_en", 2000) || null,
    summary_sr: str(form, "summary_sr", 2000) || null,
    evidence_json: parseEvidence(str(form, "evidence", 4000)),
    internal_notes: str(form, "internal_notes", 4000) || null,
  };
  const changed = EDITABLE.filter((k) => (before?.[k] ?? null) !== v[k]);
  const isPublic = !!before && PUBLIC_STATUSES.includes(before.status as RecordStatus);
  const note = str(form, "change_note", 1000);

  if (isPublic && changed.length) {
    if (!note) redirect(`/admin/hatemap/record/${id}/?error=note`);
    // A correction must not make a public record fail the publication standard.
    const blockers = publicationBlockers(v as never, s.role, lang);
    if (blockers.length) redirect(`/admin/hatemap/record/${id}/?blocked=${q(blockers.join("; "))}`);
  }

  let recordId = id;
  if (id) {
    if (changed.length) {
      await d
        .prepare(
          `UPDATE hm_records SET ${EDITABLE.map((k, i) => `${k} = ?${i + 1}`).join(", ")},
           updated_by = ?${EDITABLE.length + 1}, updated_at = datetime('now') WHERE id = ?${EDITABLE.length + 2}`,
        )
        .bind(...EDITABLE.map((k) => v[k]), s.email, id)
        .run();
    }
  } else {
    const row = await d
      .prepare(
        `INSERT INTO hm_records (${EDITABLE.join(", ")}, status, created_by, updated_by, report_id)
         VALUES (${EDITABLE.map((_, i) => `?${i + 1}`).join(", ")}, 'draft', ?${EDITABLE.length + 1}, ?${EDITABLE.length + 1}, ?${EDITABLE.length + 2}) RETURNING id`,
      )
      .bind(...EDITABLE.map((k) => v[k]), s.email, Number(str(form, "report_id")) || null)
      .first<{ id: number }>();
    recordId = row!.id;
  }

  // Which fields changed is logged; free-text values are not copied into the log.
  if (!id || changed.length) {
    await audit(s.email, !id ? "record.create" : isPublic ? "record.correct" : "record.update", "record", recordId, {
      changed,
      reason: note || undefined,
    });
  }
  redirect(`/admin/hatemap/record/${recordId}/?saved=1`);
}

/**
 * Editorial decision: move a record through the workflow.
 * Every transition is explicit, permission-checked, validated and logged with its reason.
 */
export async function decideRecord(form: FormData) {
  const s = await requirePerm("hatemap_edit");
  const d = await db();
  const lang = await adminLang();
  const id = Number(str(form, "id"));
  const to = str(form, "to") as RecordStatus;
  const reason = str(form, "reason", 1000);
  const r = await d.prepare("SELECT * FROM hm_records WHERE id = ?1").bind(id).first<HmRecord>();
  if (!r) redirect("/admin/hatemap/?tab=records&error=notfound");
  const from = r.status as RecordStatus;
  const back = `/admin/hatemap/record/${id}/`;

  if (!RECORD_STATUSES.includes(to) || !TRANSITIONS[from]?.includes(to)) redirect(`${back}?error=transition`);
  // Submitting a draft for review is routine; every other decision needs a stated reason.
  if (to !== "review" && !reason) redirect(`${back}?error=reason`);

  if (to === "published" || to === "redacted") {
    if (!can(s.role, "hatemap_publish")) redirect(`${back}?error=perm`);
    const blockers = publicationBlockers(r, s.role, lang);
    if (blockers.length) {
      await audit(s.email, "record.publish_blocked", "record", id, { from, to, blocked: blockers.join("; ") });
      redirect(`${back}?blocked=${q(blockers.join("; "))}`);
    }
  }
  // Taking content down is a safety action: any moderator may do it, including on high-sensitivity records.

  const publicId = r.public_id ?? (to === "published" || to === "redacted" ? await nextPublicId() : null);
  const publishedAt = to === "published" || to === "redacted" ? r.published_at ?? new Date().toISOString().slice(0, 19).replace("T", " ") : r.published_at;
  await d
    .prepare("UPDATE hm_records SET status = ?2, public_id = ?3, published_at = ?4, updated_by = ?5, updated_at = datetime('now') WHERE id = ?1")
    .bind(id, to, publicId, publishedAt, s.email)
    .run();
  await audit(s.email, `record.${to === "removed" ? "takedown" : to === "review" ? "review" : to}`, "record", id, {
    status: { from, to },
    reason: reason || undefined,
  });
  redirect(`${back}?saved=1`);
}

/** Turn a citizen report into a draft record. The raw text goes to internal notes only. */
export async function convertReport(form: FormData) {
  const s = await requirePerm("hatemap_reports");
  const d = await db();
  const id = Number(str(form, "report_id"));
  const rep = await d.prepare("SELECT * FROM hm_reports WHERE id = ?1").bind(id).first<{ category: string; municipality: string; occurred_on: string | null; description: string; source_url: string | null; record_id: number | null }>();
  if (!rep) redirect("/admin/hatemap/?tab=reports&error=notfound");
  if (rep.record_id) redirect(`/admin/hatemap/record/${rep.record_id}/`);
  const row = await d
    .prepare(
      `INSERT INTO hm_records (category, source_type, verification, status, municipality, occurred_on, internal_notes, evidence_json, report_id, created_by, updated_by)
       VALUES (?1, 'citizen', 'signal', 'draft', ?2, ?3, ?4, ?5, ?6, ?7, ?7) RETURNING id`,
    )
    .bind(
      rep.category ?? "other",
      isMunicipality(rep.municipality) ? rep.municipality : "",
      rep.occurred_on ?? "",
      `Citizen report #${id} (do not publish this text; write a summary without personal data):\n\n${rep.description}`,
      JSON.stringify(rep.source_url ? [{ url: rep.source_url, public: false }] : []),
      id,
      s.email,
    )
    .first<{ id: number }>();
  await d.prepare("UPDATE hm_reports SET status = 'converted', record_id = ?2, handled_by = ?3, handled_at = datetime('now') WHERE id = ?1").bind(id, row!.id, s.email).run();
  await audit(s.email, "report.convert", "report", id, { record: row!.id });
  await audit(s.email, "record.create", "record", row!.id, { fromReport: id });
  redirect(`/admin/hatemap/record/${row!.id}/`);
}

export async function setReportStatus(form: FormData) {
  const s = await requirePerm("hatemap_reports");
  const id = Number(str(form, "report_id"));
  const status = str(form, "status");
  if (!["new", "in_review", "rejected", "spam"].includes(status)) redirect(`/admin/hatemap/report/${id}/`);
  await (await db())
    .prepare("UPDATE hm_reports SET status = ?2, notes = ?3, handled_by = ?4, handled_at = datetime('now') WHERE id = ?1")
    .bind(id, status, str(form, "notes", 2000) || null, s.email)
    .run();
  await audit(s.email, `report.${status}`, "report", id);
  redirect(`/admin/hatemap/report/${id}/?saved=1`);
}

/** Data minimisation: remove the reporter's contact details once they are no longer needed. */
export async function purgeContact(form: FormData) {
  const s = await requirePerm("hatemap_reports");
  const id = Number(str(form, "report_id"));
  await (await db()).prepare("UPDATE hm_reports SET contact = NULL, contact_ok = 0 WHERE id = ?1").bind(id).run();
  await audit(s.email, "report.purge_contact", "report", id);
  redirect(`/admin/hatemap/report/${id}/?saved=1`);
}

/* ───────────── Corrections, appeals and removal requests ───────────── */
export async function createCase(form: FormData) {
  const s = await requirePerm("cases");
  const kind = str(form, "kind");
  const description = str(form, "description", 4000);
  if (!["correction", "appeal", "removal"].includes(kind) || !description) redirect("/admin/hatemap/cases/?error=1");
  const d = await db();
  // Accept either the internal number or the public ID (HM-2026-0001).
  const ref = str(form, "record", 40);
  let recordId: number | null = null;
  if (ref) {
    const r = await d.prepare("SELECT id FROM hm_records WHERE id = ?1 OR public_id = ?2").bind(Number(ref.replace(/^#/, "")) || -1, ref.toUpperCase()).first<{ id: number }>();
    recordId = r?.id ?? null;
  }
  const urgency = str(form, "urgency") === "urgent" ? "urgent" : "normal";
  const row = await d
    .prepare(
      `INSERT INTO hm_cases (kind, urgency, record_id, requester, contact, description, received_via, created_by)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) RETURNING id`,
    )
    .bind(kind, urgency, recordId, str(form, "requester", 200) || null, str(form, "contact", 200) || null, description, str(form, "received_via", 60) || null, s.email)
    .first<{ id: number }>();
  await audit(s.email, "case.open", "case", row!.id, { kind, urgency, record: recordId });
  redirect(`/admin/hatemap/cases/${row!.id}/`);
}

/**
 * Decide a case. When upheld, the linked record can be taken down or reopened for
 * correction in the same step, and both decisions are logged.
 */
export async function resolveCase(form: FormData) {
  const s = await requirePerm("cases");
  const d = await db();
  const id = Number(str(form, "id"));
  const status = str(form, "status");
  const resolution = str(form, "resolution", 4000);
  const effect = str(form, "effect");
  if (!["open", "in_review", "upheld", "dismissed"].includes(status)) redirect(`/admin/hatemap/cases/${id}/`);
  const closing = status === "upheld" || status === "dismissed";
  if (closing && !resolution) redirect(`/admin/hatemap/cases/${id}/?error=reason`);
  const c = await d.prepare("SELECT id, record_id FROM hm_cases WHERE id = ?1").bind(id).first<{ id: number; record_id: number | null }>();
  if (!c) redirect("/admin/hatemap/cases/");

  await d
    .prepare("UPDATE hm_cases SET status = ?2, resolution = ?3, resolved_by = CASE WHEN ?4 THEN ?5 END, resolved_at = CASE WHEN ?4 THEN datetime('now') END WHERE id = ?1")
    .bind(id, status, resolution || null, closing ? 1 : 0, s.email)
    .run();
  await audit(s.email, `case.${status}`, "case", id, { reason: resolution || undefined });

  if (status === "upheld" && c.record_id && (effect === "removed" || effect === "review")) {
    const r = await d.prepare("SELECT status FROM hm_records WHERE id = ?1").bind(c.record_id).first<{ status: RecordStatus }>();
    if (r && TRANSITIONS[r.status]?.includes(effect)) {
      await d.prepare("UPDATE hm_records SET status = ?2, updated_by = ?3, updated_at = datetime('now') WHERE id = ?1").bind(c.record_id, effect, s.email).run();
      await audit(s.email, effect === "removed" ? "record.takedown" : "record.review", "record", c.record_id, {
        status: { from: r.status, to: effect },
        reason: `Case #${id}: ${resolution}`.slice(0, 1000),
      });
    }
  }
  redirect(`/admin/hatemap/cases/${id}/?saved=1`);
}

export async function purgeCaseContact(form: FormData) {
  const s = await requirePerm("cases");
  const id = Number(str(form, "id"));
  await (await db()).prepare("UPDATE hm_cases SET contact = NULL WHERE id = ?1").bind(id).run();
  await audit(s.email, "case.purge_contact", "case", id);
  redirect(`/admin/hatemap/cases/${id}/?saved=1`);
}
