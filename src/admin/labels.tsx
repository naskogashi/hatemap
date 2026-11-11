import { RECORD_STATUS_LABEL, VERIFICATION, type AdminLang, type RecordStatus } from "@hatemap/lib/taxonomy";
import { Badge, type Tone } from "@hatemap/admin/kit";

type L = Record<AdminLang, string>;

export const RECORD_TONE: Record<RecordStatus, Tone> = {
  draft: "neutral",
  review: "warn",
  published: "ok",
  redacted: "info",
  rejected: "neutral",
  removed: "bad",
};

export const REPORT_STATUS: Record<string, { label: L; tone: Tone }> = {
  new: { label: { sq: "I ri", en: "New" }, tone: "bad" },
  in_review: { label: { sq: "Në shqyrtim", en: "In review" }, tone: "warn" },
  converted: { label: { sq: "U bë regjistrim", en: "Converted to record" }, tone: "ok" },
  rejected: { label: { sq: "Refuzuar", en: "Rejected" }, tone: "neutral" },
  spam: { label: { sq: "Spam", en: "Spam" }, tone: "neutral" },
};

export const CASE_KIND: Record<string, L> = {
  correction: { sq: "Kërkesë për korrigjim", en: "Correction request" },
  appeal: { sq: "Ankesë", en: "Appeal" },
  removal: { sq: "Kërkesë për heqje", en: "Removal request" },
};

export const CASE_STATUS: Record<string, { label: L; tone: Tone }> = {
  open: { label: { sq: "E hapur", en: "Open" }, tone: "bad" },
  in_review: { label: { sq: "Në shqyrtim", en: "In review" }, tone: "warn" },
  upheld: { label: { sq: "E pranuar", en: "Upheld" }, tone: "ok" },
  dismissed: { label: { sq: "E refuzuar", en: "Dismissed" }, tone: "neutral" },
};

export const VERIFICATION_TONE: Record<string, Tone> = {
  verified: "ok",
  credible: "info",
  allegation: "warn",
  narrative: "accent",
  signal: "neutral",
};

export function RecordStatusBadge({ status, lang }: { status: string; lang: AdminLang }) {
  const s = status as RecordStatus;
  return <Badge tone={RECORD_TONE[s] ?? "neutral"}>{RECORD_STATUS_LABEL[s]?.[lang] ?? status}</Badge>;
}

export function VerificationBadge({ value, lang }: { value: string; lang: AdminLang }) {
  const o = VERIFICATION.find((v) => v.key === value);
  return <Badge tone={VERIFICATION_TONE[value] ?? "neutral"}>{o?.label[lang] ?? value}</Badge>;
}

export function ReportStatusBadge({ status, lang }: { status: string; lang: AdminLang }) {
  const s = REPORT_STATUS[status];
  return <Badge tone={s?.tone ?? "neutral"}>{s?.label[lang] ?? status}</Badge>;
}

export function CaseStatusBadge({ status, lang }: { status: string; lang: AdminLang }) {
  const s = CASE_STATUS[status];
  return <Badge tone={s?.tone ?? "neutral"}>{s?.label[lang] ?? status}</Badge>;
}

/** Human-readable audit actions. Unknown actions fall back to their code. */
export const ACTION_LABEL: Record<string, L> = {
  "record.create": { sq: "Krijoi regjistrimin", en: "Created record" },
  "record.update": { sq: "Ndryshoi regjistrimin", en: "Edited record" },
  "record.correct": { sq: "Korrigjoi regjistrimin publik", en: "Corrected public record" },
  "record.review": { sq: "Dërgoi për shqyrtim", en: "Sent to review" },
  "record.published": { sq: "Publikoi", en: "Published" },
  "record.redacted": { sq: "Publikoi të redaktuar", en: "Published redacted" },
  "record.draft": { sq: "E ktheu në draft", en: "Sent back to draft" },
  "record.rejected": { sq: "Refuzoi", en: "Rejected" },
  "record.takedown": { sq: "E hoqi nga publiku", en: "Took down" },
  "record.publish_blocked": { sq: "Publikimi u bllokua", en: "Publication blocked" },
  "report.convert": { sq: "E shndërroi në regjistrim", en: "Converted to record" },
  "report.new": { sq: "Shënoi si të ri", en: "Marked new" },
  "report.in_review": { sq: "Shënoi në shqyrtim", en: "Marked in review" },
  "report.rejected": { sq: "Refuzoi raportin", en: "Rejected report" },
  "report.spam": { sq: "Shënoi si spam", en: "Marked as spam" },
  "report.purge_contact": { sq: "Fshiu kontaktin", en: "Erased contact details" },
  "case.open": { sq: "Hapi rastin", en: "Opened case" },
  "case.in_review": { sq: "Rasti në shqyrtim", en: "Case in review" },
  "case.upheld": { sq: "Pranoi rastin", en: "Upheld case" },
  "case.dismissed": { sq: "Refuzoi rastin", en: "Dismissed case" },
  "case.open_again": { sq: "Rihapi rastin", en: "Reopened case" },
  "case.purge_contact": { sq: "Fshiu kontaktin", en: "Erased contact details" },
  "user.create": { sq: "Krijoi përdoruesin", en: "Created user" },
  "user.update": { sq: "Ndryshoi përdoruesin", en: "Updated user" },
  "auth.login": { sq: "Hyrje", en: "Signed in" },
  "auth.logout": { sq: "Dalje", en: "Signed out" },
  "auth.failed": { sq: "Hyrje e dështuar", en: "Failed sign-in" },
  "auth.locked": { sq: "Hyrja u bllokua (shumë tentime)", en: "Sign-in blocked (too many attempts)" },
  "content.save": { sq: "Ruajti përmbajtjen", en: "Saved content" },
  "content.create": { sq: "Krijoi përmbajtje", en: "Created content" },
  "content.featured": { sq: "Ndryshoi imazhin/datën", en: "Changed image/date" },
  "content.confirm_group": { sq: "Konfirmoi përkthimet", en: "Confirmed translations" },
  "media.upload": { sq: "Ngarkoi media", en: "Uploaded media" },
  "media.delete": { sq: "Fshiu media", en: "Deleted media" },
  "media.move": { sq: "Zhvendosi skedarët në adresa të shkurtra", en: "Moved files to short addresses" },
  "content.delete": { sq: "Fshiu përmbajtje", en: "Deleted content" },
  "backup.create": { sq: "Kopje rezervë", en: "Backup created" },
  "backup.failed": { sq: "Kopja rezervë dështoi", en: "Backup failed" },
  "backup.download": { sq: "Shkarkoi kopjen rezervë", en: "Downloaded backup" },
  "security.revoke_sessions": { sq: "Nxori të gjithë nga sistemi", en: "Signed everyone out" },
  "incident.open": { sq: "Hapi incident sigurie", en: "Opened security incident" },
  "incident.update": { sq: "Përditësoi incidentin", en: "Updated incident" },
};

export function actionLabel(action: string, lang: AdminLang) {
  return ACTION_LABEL[action]?.[lang] ?? action;
}

export function actionTone(action: string): Tone {
  if (/takedown|failed|locked|blocked|rejected|spam|revoke|incident/.test(action)) return "bad";
  if (/published|upheld|login|backup\.create/.test(action)) return "ok";
  if (/redacted/.test(action)) return "info";
  if (/review|correct/.test(action)) return "warn";
  return "neutral";
}
