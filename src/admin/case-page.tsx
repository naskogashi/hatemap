import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { requirePerm } from "@hatemap-host";
import { dt, getT } from "@hatemap/admin/i18n";
import { AdminShell, Badge, Card, Notice, btnPrimary, btnSecondary, inputCls, labelCls } from "@hatemap/admin/kit";
import { purgeCaseContact, resolveCase } from "@hatemap/admin/actions";
import { AuditLog } from "@hatemap/admin/audit-log";
import { CASE_KIND, CASE_STATUS, CaseStatusBadge, RecordStatusBadge } from "@hatemap/admin/labels";

export const dynamic = "force-dynamic";

type Case = {
  id: number; kind: string; urgency: string; record_id: number | null; requester: string | null; contact: string | null;
  description: string; received_via: string | null; status: string; resolution: string | null; created_by: string | null;
  created_at: string; resolved_by: string | null; resolved_at: string | null;
};

export default async function CaseView({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requirePerm("cases");
  const t = await getT();
  const { id } = await params;
  const { saved, error } = await searchParams;
  const { env } = await getCloudflareContext({ async: true });
  const c = await env.DB.prepare("SELECT * FROM hm_cases WHERE id = ?1").bind(Number(id)).first<Case>();
  if (!c) notFound();
  const rec = c.record_id
    ? await env.DB.prepare("SELECT id, public_id, status, title_sq FROM hm_records WHERE id = ?1").bind(c.record_id).first<{ id: number; public_id: string | null; status: string; title_sq: string | null }>()
    : null;

  return (
    <AdminShell
      title={`${CASE_KIND[c.kind]?.[t.lang] ?? c.kind} #${c.id}`}
      eyebrow="HateMap"
      active="hm-cases"
      actions={
        <div className="flex gap-2">
          {c.urgency === "urgent" ? <Badge tone="bad">{t("urgjent", "urgent")}</Badge> : null}
          <CaseStatusBadge status={c.status} lang={t.lang} />
        </div>
      }
    >
      <p className="mb-6 text-sm">
        <a href="/admin/hatemap/cases/" className="text-accent-ink hover:underline">← {t("Rastet", "Cases")}</a>
      </p>
      {saved ? <Notice tone="ok" className="mb-6">{t("U ruajt.", "Saved.")}</Notice> : null}
      {error === "reason" ? <Notice tone="bad" className="mb-6">{t("Shkruani arsyetimin e vendimit.", "Write the reasoning for the decision.")}</Notice> : null}

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-5 lg:col-span-2">
          <Card>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div><dt className="text-xs text-muted">{t("Hapur", "Opened")}</dt><dd className="mt-0.5 font-medium">{dt(c.created_at)}</dd></div>
              <div><dt className="text-xs text-muted">{t("Nga", "By")}</dt><dd className="mt-0.5 truncate font-medium">{c.created_by}</dd></div>
              <div><dt className="text-xs text-muted">{t("Marrë përmes", "Received via")}</dt><dd className="mt-0.5 font-medium">{c.received_via ?? "-"}</dd></div>
              <div><dt className="text-xs text-muted">{t("Kërkuesi", "Requester")}</dt><dd className="mt-0.5 font-medium">{c.requester ?? "-"}</dd></div>
            </dl>
          </Card>
          <Card title={t("Kërkesa", "Request")}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.description}</p>
          </Card>
          <Card title={t("Regjistrimi i lidhur", "Linked record")}>
            {rec ? (
              <a href={`/admin/hatemap/record/${rec.id}/`} className="flex flex-wrap items-center gap-3 text-sm hover:text-accent-ink">
                <span className="font-mono text-xs">{rec.public_id ?? `#${rec.id}`}</span>
                <span className="font-medium">{rec.title_sq ?? t("(pa titull)", "(untitled)")}</span>
                <RecordStatusBadge status={rec.status} lang={t.lang} />
              </a>
            ) : (
              <p className="text-sm text-muted">{t("Asnjë regjistrim i lidhur.", "No linked record.")}</p>
            )}
          </Card>
          <Card title={t("Kontakti", "Contact")}>
            {c.contact ? (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span>{c.contact}</span>
                <form action={purgeCaseContact}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className={btnSecondary}>{t("Fshi kontaktin", "Erase contact")}</button>
                </form>
              </div>
            ) : (
              <p className="text-sm text-muted">{t("Nuk ka kontakt, ose është fshirë.", "No contact, or it was erased.")}</p>
            )}
          </Card>
          {c.resolution ? (
            <Card title={t("Vendimi", "Decision")}>
              <p className="whitespace-pre-wrap text-sm">{c.resolution}</p>
              {c.resolved_at ? <p className="mt-2 text-xs text-muted">{dt(c.resolved_at)} · {c.resolved_by}</p> : null}
            </Card>
          ) : null}
        </section>

        <aside className="space-y-5">
          <Card title={t("Vendos", "Decide")}>
            <form action={resolveCase} className="grid gap-3">
              <input type="hidden" name="id" value={c.id} />
              <label className={labelCls}>
                {t("Statusi", "Status")}
                <select name="status" defaultValue={c.status} className={inputCls}>
                  {Object.entries(CASE_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label[t.lang]}</option>
                  ))}
                </select>
              </label>
              {rec ? (
                <label className={labelCls}>
                  {t("Nëse pranohet, veprimi mbi regjistrimin", "If upheld, action on the record")}
                  <select name="effect" defaultValue={c.kind === "removal" ? "removed" : "review"} className={inputCls}>
                    <option value="none">{t("Asnjë", "None")}</option>
                    <option value="review">{t("Rihap për korrigjim (hiqet nga publiku)", "Reopen for correction (leaves public view)")}</option>
                    <option value="removed">{t("Hiq nga publiku (takedown)", "Take down from public view")}</option>
                  </select>
                </label>
              ) : null}
              <label className={labelCls}>
                {t("Arsyetimi", "Reasoning")}
                <textarea name="resolution" rows={4} maxLength={4000} defaultValue={c.resolution ?? ""} className={inputCls} placeholder={t("I detyrueshëm kur pranohet ose refuzohet", "Required when upholding or dismissing")} />
              </label>
              <button className={`${btnPrimary} justify-self-start`}>{t("Ruaj vendimin", "Save decision")}</button>
            </form>
          </Card>
          <AuditLog entity="case" id={c.id} />
        </aside>
      </div>
    </AdminShell>
  );
}
