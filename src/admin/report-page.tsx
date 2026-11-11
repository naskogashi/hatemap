import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { requirePerm } from "@hatemap-host";
import type { HmReport } from "@hatemap/lib/records";
import { CATEGORIES, label, municipalityName } from "@hatemap/lib/taxonomy";
import { dt, getT } from "@hatemap/admin/i18n";
import { AdminShell, Card, Notice, btnPrimary, btnSecondary, inputCls, labelCls } from "@hatemap/admin/kit";
import { convertReport, purgeContact, setReportStatus } from "@hatemap/admin/actions";
import { AuditLog } from "@hatemap/admin/audit-log";
import { ReportStatusBadge } from "@hatemap/admin/labels";

export const dynamic = "force-dynamic";

export default async function ReportView({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requirePerm("hatemap_reports");
  const t = await getT();
  const { id } = await params;
  const { saved } = await searchParams;
  const { env } = await getCloudflareContext({ async: true });
  const r = await env.DB.prepare("SELECT * FROM hm_reports WHERE id = ?1").bind(Number(id)).first<HmReport>();
  if (!r) notFound();

  return (
    <AdminShell title={`${t("Raporti qytetar", "Citizen report")} #${r.id}`} eyebrow="HateMap" active="hm-reports" actions={<ReportStatusBadge status={r.status} lang={t.lang} />}>
      <p className="mb-6 text-sm">
        <a href="/admin/hatemap/?tab=reports" className="text-accent-ink hover:underline">← {t("Raportet", "Reports")}</a>
      </p>
      {saved ? <Notice tone="ok" className="mb-6">{t("U ruajt.", "Saved.")}</Notice> : null}
      <Notice tone="bad" className="mb-6">
        {t(
          "Konfidencial. Ky tekst nuk publikohet kurrë drejtpërdrejt. Kur krijoni regjistrim publik, shkruani një përmbledhje pa emra, adresa ose detaje identifikuese.",
          "Confidential. This text is never published directly. When you create a public record, write a summary without names, addresses or identifying details.",
        )}
      </Notice>
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-5 lg:col-span-2">
          <Card>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div><dt className="text-xs text-muted">{t("Marrë", "Received")}</dt><dd className="mt-0.5 font-medium">{dt(r.received_at)}</dd></div>
              <div><dt className="text-xs text-muted">{t("Kategoria", "Category")}</dt><dd className="mt-0.5 font-medium">{label(CATEGORIES, r.category, t.lang)}</dd></div>
              <div><dt className="text-xs text-muted">{t("Komuna", "Municipality")}</dt><dd className="mt-0.5 font-medium">{r.municipality === "unknown" ? t("E panjohur", "Unknown") : municipalityName(r.municipality, "sq")}</dd></div>
              <div><dt className="text-xs text-muted">{t("Koha", "When")}</dt><dd className="mt-0.5 font-medium">{r.occurred_on ?? "?"}</dd></div>
            </dl>
          </Card>
          <Card title={`${t("Përshkrimi", "Description")} (${r.lang})`}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed" lang={r.lang === "sr" ? "sr-Latn" : r.lang}>{r.description}</p>
            {r.source_url ? (
              <p className="mt-4 text-sm">
                Link: <a href={r.source_url} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-accent-ink underline">{r.source_url}</a>
              </p>
            ) : null}
          </Card>
          <Card title={t("Kontakti i raportuesit", "Reporter contact")}>
            {r.contact ? (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <a href={`mailto:${r.contact}`} className="text-accent-ink underline">{r.contact}</a>
                <form action={purgeContact}>
                  <input type="hidden" name="report_id" value={r.id} />
                  <button className={btnSecondary}>{t("Fshi kontaktin (minimizim i të dhënave)", "Erase contact (data minimisation)")}</button>
                </form>
              </div>
            ) : (
              <p className="text-sm text-muted">{t("Nuk ka kontakt, ose është fshirë.", "No contact given, or it was erased.")}</p>
            )}
            <p className="mt-3 text-xs text-muted">{t("Kontakti fshihet automatikisht 6 muaj pas mbylljes së raportit, ose më së voni 12 muaj pas marrjes.", "Contact details are erased automatically 6 months after the report is closed, or at the latest 12 months after it was received.")}</p>
          </Card>
        </section>
        <aside className="space-y-5">
          {r.record_id ? (
            <a href={`/admin/hatemap/record/${r.record_id}/`} className="notice notice-ok block font-medium">
              {t("Ky raport është shndërruar në regjistrimin", "This report was converted to record")} #{r.record_id} →
            </a>
          ) : (
            <Card title={t("Krijo regjistrim", "Create record")}>
              <form action={convertReport}>
                <input type="hidden" name="report_id" value={r.id} />
                <p className="text-sm text-ink-soft">{t("Krijo një regjistrim draft nga ky raport. Teksti origjinal ruhet vetëm në shënimet e brendshme.", "Create a draft record from this report. The original text is kept only in the internal notes.")}</p>
                <button className={`${btnPrimary} mt-3`}>{t("Krijo regjistrim draft", "Create draft record")}</button>
              </form>
            </Card>
          )}
          <Card title={t("Triazhi", "Triage")}>
            <form action={setReportStatus} className="grid gap-3 text-sm">
              <input type="hidden" name="report_id" value={r.id} />
              <label className={labelCls}>
                {t("Statusi", "Status")}
                <select name="status" defaultValue={r.status === "converted" ? "in_review" : r.status} className={inputCls}>
                  <option value="new">{t("I ri", "New")}</option>
                  <option value="in_review">{t("Në shqyrtim", "In review")}</option>
                  <option value="rejected">{t("Refuzuar", "Rejected")}</option>
                  <option value="spam">Spam</option>
                </select>
              </label>
              <label className={labelCls}>
                {t("Shënime të brendshme", "Internal notes")}
                <textarea name="notes" rows={3} defaultValue={r.notes ?? ""} className={inputCls} />
              </label>
              <button className={`${btnSecondary} justify-self-start`}>{t("Ruaj", "Save")}</button>
            </form>
          </Card>
          <AuditLog entity="report" id={r.id} />
        </aside>
      </div>
    </AdminShell>
  );
}
