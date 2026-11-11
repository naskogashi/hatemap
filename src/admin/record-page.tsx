import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { requirePerm } from "@hatemap-host";
import { evidence, type HmRecord } from "@hatemap/lib/records";
import {
  CATEGORIES, GROUPS, MUNICIPALITIES, PUBLIC_STATUSES, SOURCES, TRANSITIONS, TRANSITION_LABEL, VERIFICATION,
  can, publicationBlockers, type AdminLang, type Option, type RecordStatus,
} from "@hatemap/lib/taxonomy";
import { hatemapPath } from "@hatemap-host";
import { dt, getT } from "@hatemap/admin/i18n";
import { AdminShell, Badge, Card, Notice, btnPrimary, inputCls, labelCls } from "@hatemap/admin/kit";
import { decideRecord, saveRecord } from "@hatemap/admin/actions";
import { AuditLog } from "@hatemap/admin/audit-log";
import { RecordStatusBadge, VerificationBadge } from "@hatemap/admin/labels";

export const dynamic = "force-dynamic";

function Pick({ name, title, options, value, required, lang }: { name: string; title: string; options: Option[]; value?: string | null; required?: boolean; lang: AdminLang }) {
  return (
    <label className={labelCls}>
      {title}
      {required ? <span className="text-accent-ink"> *</span> : ""}
      <select name={name} defaultValue={value ?? ""} className={inputCls}>
        {!required ? <option value="">{lang === "en" ? "(none)" : "(asnjë)"}</option> : <option value="" disabled>{lang === "en" ? "Choose…" : "Zgjidhni…"}</option>}
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label[lang]}
          </option>
        ))}
      </select>
    </label>
  );
}

export default async function RecordEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; blocked?: string; error?: string }> }) {
  const session = await requirePerm("hatemap_read");
  const t = await getT();
  const { id } = await params;
  const { saved, blocked, error } = await searchParams;
  const canEdit = can(session.role, "hatemap_edit");
  const isNew = id === "new";
  if (isNew && !canEdit) notFound();
  const { env } = await getCloudflareContext({ async: true });
  const r = isNew ? null : await env.DB.prepare("SELECT * FROM hm_records WHERE id = ?1").bind(Number(id)).first<HmRecord>();
  if (!isNew && !r) notFound();
  const status = (r?.status ?? "draft") as RecordStatus;
  const isPublic = PUBLIC_STATUSES.includes(status);
  const blockers = r ? publicationBlockers(r, session.role, t.lang) : [];
  // Analysts see public sources only; internal sources may identify people.
  const ev = r ? evidence(r).filter((e) => canEdit || e.public) : [];
  const muni: Option[] = MUNICIPALITIES.map((m) => ({ key: m.key, label: { sq: m.sq, en: m.sq, sr: m.sr } }));
  const transitions = (r ? TRANSITIONS[status] : []).filter((to) => (to === "published" || to === "redacted" ? can(session.role, "hatemap_publish") : true));

  const errors: Record<string, string> = {
    note: t("Ky regjistrim është publik: shkruani shënimin e korrigjimit.", "This record is public: enter a correction note."),
    reason: t("Shkruani arsyen e vendimit.", "Enter the reason for the decision."),
    transition: t("Ky ndryshim statusi nuk lejohet.", "That status change is not allowed."),
    perm: t("Nuk keni të drejtë për këtë vendim.", "You are not allowed to make this decision."),
  };

  return (
    <AdminShell
      title={isNew ? t("Regjistrim i ri", "New record") : r!.title_sq || r!.title_en || (r!.public_id ?? `#${r!.id}`)}
      eyebrow={isNew ? "HateMap" : `HateMap · ${r!.public_id ?? `#${r!.id}`}`}
      active="hm-records"
      actions={
        r ? (
          <div className="flex flex-wrap items-center gap-2">
            <RecordStatusBadge status={status} lang={t.lang} />
            <VerificationBadge value={r.verification} lang={t.lang} />
            {r.sensitivity === "high" ? <Badge tone="bad">{t("ndjeshmëri e lartë", "high sensitivity")}</Badge> : null}
          </div>
        ) : undefined
      }
    >
      <p className="mb-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <a href="/admin/hatemap/?tab=records" className="text-accent-ink hover:underline">← {t("Regjistrimet", "Records")}</a>
        {r?.report_id && can(session.role, "hatemap_reports") ? (
          <a href={`/admin/hatemap/report/${r.report_id}/`} className="text-accent-ink hover:underline">{t("Raporti burimor", "Source report")} #{r.report_id}</a>
        ) : null}
        {isPublic && r?.public_id ? (
          <a href={`${hatemapPath("sq")}#${r.public_id}`} target="_blank" rel="noopener" className="text-accent-ink hover:underline">{t("Shiko në hartë", "View on map")} ↗</a>
        ) : null}
        {r ? <span className="text-muted">{t("Krijuar", "Created")} {dt(r.created_at)} · {r.created_by}</span> : null}
      </p>
      {saved ? <Notice tone="ok" className="mb-4">{t("U ruajt.", "Saved.")}</Notice> : null}
      {blocked ? <Notice tone="bad" className="mb-4">{t("Nuk u publikua", "Not published")}: {blocked}</Notice> : null}
      {error && errors[error] ? <Notice tone="bad" className="mb-4">{errors[error]}</Notice> : null}
      {!canEdit ? <Notice tone="info" className="mb-4">{t("Vetëm lexim (roli Analist).", "Read-only (Analyst role).")}</Notice> : null}

      <div className="grid gap-8 lg:grid-cols-3">
        <form action={saveRecord} className="lg:col-span-2">
          <fieldset disabled={!canEdit} className="grid content-start gap-5">
            <input type="hidden" name="id" value={r?.id ?? ""} />
            <fieldset className="adm-fieldset sm:grid-cols-2">
              <legend>{t("Klasifikimi", "Classification")}</legend>
              <Pick name="category" title={t("Kategoria", "Category")} options={CATEGORIES} value={r?.category} required lang={t.lang} />
              <Pick name="verification" title={t("Statusi i verifikimit", "Verification status")} options={VERIFICATION} value={r?.verification ?? "signal"} required lang={t.lang} />
              <Pick name="affected_group" title={t("Grupi i prekur", "Affected group")} options={GROUPS} value={r?.affected_group} lang={t.lang} />
              <Pick name="source_type" title={t("Lloji i burimit", "Source type")} options={SOURCES} value={r?.source_type ?? "sbunker"} required lang={t.lang} />
              <Pick name="municipality" title={t("Komuna (vendndodhje e përgjithësuar)", "Municipality (generalised location)")} options={muni} value={r?.municipality} required lang={t.lang} />
              <label className={labelCls}>
                {t("Data e ngjarjes", "Date of event")} <span className="text-accent-ink">*</span>
                <input name="occurred_on" type="date" defaultValue={r?.occurred_on && r.occurred_on.length === 10 ? r.occurred_on : r?.occurred_on ? `${r.occurred_on}-01` : ""} className={inputCls} />
                <span className="mt-1 block text-xs font-normal text-muted">{t("Publikisht shfaqet vetëm muaji.", "Only the month is shown publicly.")}</span>
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                {t("Ndjeshmëria", "Sensitivity")}
                <select name="sensitivity" defaultValue={r?.sensitivity ?? "normal"} className={inputCls}>
                  <option value="normal">{t("Normale", "Normal")}</option>
                  <option value="high">{t("E lartë (fëmijë, të mbijetuar, persona të cenueshëm, kërcënime urgjente): publikimi kërkon administrator", "High (children, survivors, vulnerable people, urgent threats): publication needs an administrator")}</option>
                </select>
              </label>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted">
                  {VERIFICATION.find((v) => v.key === (r?.verification ?? "signal"))?.hint?.[t.lang]}
                </p>
              </div>
            </fieldset>

            {(["sq", "en", "sr"] as const).map((l) => (
              <fieldset key={l} className="adm-fieldset">
                <legend>
                  {t("Teksti publik", "Public text")} · {l === "sq" ? t("Shqip (i detyrueshëm)", "Albanian (required)") : l === "en" ? "English" : "Srpski (latinica)"}
                </legend>
                <label className={labelCls}>
                  {t("Titulli", "Title")}
                  <input name={`title_${l}`} defaultValue={r?.[`title_${l}`] ?? ""} maxLength={200} className={inputCls} lang={l === "sr" ? "sr-Latn" : l} />
                </label>
                <label className={labelCls}>
                  {t("Përmbledhja", "Summary")} <span className="font-normal text-muted">({t("pa emra, adresa ose detaje identifikuese", "no names, addresses or identifying details")})</span>
                  <textarea name={`summary_${l}`} defaultValue={r?.[`summary_${l}`] ?? ""} rows={4} maxLength={2000} className={inputCls} lang={l === "sr" ? "sr-Latn" : l} />
                </label>
              </fieldset>
            ))}

            <fieldset className="adm-fieldset">
              <legend>{t("Burimet dhe shënimet", "Sources and notes")}</legend>
              <label className={labelCls}>
                {t("Burimet", "Sources")}{" "}
                <span className="font-normal text-muted">
                  ({t("një për rresht", "one per line")}: <code>https://… | {t("etiketa", "label")} | public</code>; {t("pa “public” mbeten të brendshme", "without “public” they stay internal")})
                </span>
                <textarea
                  name="evidence"
                  rows={4}
                  defaultValue={ev.map((e) => [e.url, e.label ?? "", e.public ? "public" : ""].filter((x, i) => i === 0 || x).join(" | ")).join("\n")}
                  className={`${inputCls} font-mono text-xs`}
                />
              </label>
              {canEdit ? (
                <label className={labelCls}>
                  {t("Shënime të brendshme", "Internal notes")} <span className="font-normal text-muted">({t("nuk publikohen kurrë", "never published")})</span>
                  <textarea name="internal_notes" rows={5} defaultValue={r?.internal_notes ?? ""} className={inputCls} />
                </label>
              ) : null}
            </fieldset>

            {canEdit ? (
              <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-paper-2/95 p-4 shadow-lg backdrop-blur">
                {isPublic ? (
                  <label className={`${labelCls} min-w-64 flex-1`}>
                    {t("Shënimi i korrigjimit", "Correction note")} <span className="text-accent-ink">*</span>
                    <input name="change_note" maxLength={1000} placeholder={t("Çfarë u korrigjua dhe pse", "What was corrected and why")} className={inputCls} />
                  </label>
                ) : (
                  <p className="flex-1 text-xs text-muted">{t("Ruajtja nuk e ndryshon statusin. Përdorni panelin e vendimit.", "Saving never changes the status. Use the decision panel.")}</p>
                )}
                <button className={btnPrimary}>{isNew ? t("Krijo draft", "Create draft") : isPublic ? t("Ruaj korrigjimin", "Save correction") : t("Ruaj", "Save")}</button>
              </div>
            ) : null}
          </fieldset>
        </form>

        <aside className="space-y-5">
          {r && canEdit ? (
            <Card title={t("Vendimi editorial", "Editorial decision")}>
              <form action={decideRecord} className="grid gap-3">
                <input type="hidden" name="id" value={r.id} />
                <fieldset className="grid gap-2">
                  <legend className="sr-only">{t("Statusi i ri", "New status")}</legend>
                  {transitions.map((to) => (
                    <label key={to} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line px-3 py-2 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/10">
                      {/* Nothing preselected: every decision is a deliberate choice. */}
                      <input type="radio" name="to" value={to} required className="mt-0.5 accent-[#f79009]" />
                      <span>{TRANSITION_LABEL[to][t.lang]}</span>
                    </label>
                  ))}
                </fieldset>
                <label className={labelCls}>
                  {t("Arsyeja", "Reason")}
                  <textarea name="reason" rows={3} maxLength={1000} className={inputCls} placeholder={t("E detyrueshme për çdo vendim përveç dërgimit për shqyrtim", "Required for every decision except sending to review")} />
                </label>
                <button className={btnPrimary}>{t("Regjistro vendimin", "Record decision")}</button>
              </form>
            </Card>
          ) : null}

          <Card title={t("Kontrolli para publikimit", "Pre-publication check")}>
            {r ? (
              blockers.length ? (
                <ul className="space-y-1.5 text-sm">
                  {blockers.map((b) => (
                    <li key={b} className="flex gap-2"><span className="dot dot-bad mt-1.5 shrink-0" aria-hidden />{b}</li>
                  ))}
                </ul>
              ) : (
                <p className="flex gap-2 text-sm"><span className="dot dot-ok mt-1.5 shrink-0" aria-hidden />{t("Plotëson standardin e metadatave.", "Meets the metadata standard.")}</p>
              )
            ) : (
              <p className="text-sm text-muted">{t("Ruajeni fillimisht si draft.", "Save it as a draft first.")}</p>
            )}
            <ul className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-muted">
              <li>{t("Asnjë publikim automatik: vendimi merret nga stafi i trajnuar.", "No automatic publishing: trained staff decide.")}</li>
              <li>{t("Vendndodhja vetëm në nivel komune; data publike vetëm në nivel muaji.", "Location only at municipality level; public date only by month.")}</li>
              <li>{t("“I redaktuar” numërohet në hartë pa titull, përmbledhje e burime.", "“Redacted” is counted on the map without title, summary or sources.")}</li>
              <li>{t("Mos etiketoni persona si autorë pa bazë provash dhe ligjore.", "Never label people as perpetrators without evidence and legal basis.")}</li>
            </ul>
          </Card>
          {r ? <AuditLog entity="record" id={r.id} /> : null}
        </aside>
      </div>
    </AdminShell>
  );
}
