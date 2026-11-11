import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requirePerm } from "@hatemap-host";
import type { HmRecord, HmReport } from "@hatemap/lib/records";
import { CATEGORIES, RECORD_STATUSES, RECORD_STATUS_LABEL, VERIFICATION, can, label, municipalityName } from "@hatemap/lib/taxonomy";
import { hatemapPath } from "@hatemap-host";
import { dt, getT } from "@hatemap/admin/i18n";
import { AdminShell, Badge, Card, Empty, Icon, Notice, Stat, Tabs, btnPrimary, btnSecondary, cardCls, tdCls, thCls } from "@hatemap/admin/kit";
import { CASE_KIND, CaseStatusBadge, RecordStatusBadge, ReportStatusBadge, VerificationBadge } from "@hatemap/admin/labels";

export const dynamic = "force-dynamic";

type Counts = Record<string, number>;

export default async function HatemapAdmin({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string; error?: string }> }) {
  const s = await requirePerm("hatemap_read");
  const t = await getT();
  const canReports = can(s.role, "hatemap_reports");
  const canEdit = can(s.role, "hatemap_edit");
  const sp = await searchParams;
  const tab = sp.tab === "reports" && canReports ? "reports" : sp.tab === "records" ? "records" : "overview";
  const status = sp.status;
  const { env } = await getCloudflareContext({ async: true });
  const d = env.DB;

  const [countsRes, reportsRes, recordsRes, queueRes, casesRes, verRes] = await d.batch([
    d.prepare(
      `SELECT 'report_' || status AS k, COUNT(*) AS n FROM hm_reports GROUP BY status
       UNION ALL SELECT 'record_' || status, COUNT(*) FROM hm_records GROUP BY status
       UNION ALL SELECT 'case_' || status, COUNT(*) FROM hm_cases GROUP BY status`,
    ),
    d.prepare(
      `SELECT id, received_at, lang, category, municipality, occurred_on, status, record_id, substr(description, 1, 160) AS description
       FROM hm_reports WHERE (?1 IS NULL AND status IN ('new','in_review')) OR status = ?1 ORDER BY received_at DESC LIMIT 200`,
    ).bind(tab === "reports" && canReports ? (status ?? null) : "__none__"),
    d.prepare(`SELECT * FROM hm_records WHERE ?1 IS NULL OR status = ?1 ORDER BY updated_at DESC LIMIT 300`).bind(tab === "records" ? (status ?? null) : "__none__"),
    d.prepare(`SELECT * FROM hm_records WHERE status IN ('review','draft') ORDER BY status = 'review' DESC, sensitivity = 'high' DESC, updated_at ASC LIMIT 8`),
    d.prepare(`SELECT id, kind, urgency, status, record_id, created_at FROM hm_cases WHERE status IN ('open','in_review') ORDER BY urgency = 'urgent' DESC, created_at ASC LIMIT 6`),
    d.prepare(`SELECT verification AS k, COUNT(*) AS n FROM hm_records WHERE status IN ('published','redacted') GROUP BY verification`),
  ]);
  const c: Counts = Object.fromEntries((countsRes.results as { k: string; n: number }[]).map((r) => [r.k, r.n]));
  const reports = reportsRes.results as (HmReport & { description: string })[];
  const records = recordsRes.results as HmRecord[];
  const queue = queueRes.results as HmRecord[];
  const cases = casesRes.results as { id: number; kind: string; urgency: string; status: string; record_id: number | null; created_at: string }[];
  const ver = Object.fromEntries((verRes.results as { k: string; n: number }[]).map((r) => [r.k, r.n]));
  const publicTotal = (c.record_published ?? 0) + (c.record_redacted ?? 0);

  return (
    <AdminShell
      title={tab === "reports" ? t("Raportet qytetare", "Citizen reports") : tab === "records" ? t("Regjistrimet", "Records") : t("Paneli i moderimit", "Moderation dashboard")}
      eyebrow="HateMap"
      active={tab === "reports" ? "hm-reports" : tab === "records" ? "hm-records" : "hm-overview"}
      actions={
        <>
          <a href={hatemapPath(t.lang === "en" ? "en" : "sq")} target="_blank" rel="noopener" className={btnSecondary}>
            <Icon name="external" /> {t("Harta publike", "Public map")}
          </a>
          {canEdit ? (
            <a href="/admin/hatemap/record/new/" className={btnPrimary}>
              <Icon name="plus" /> {t("Regjistrim i ri", "New record")}
            </a>
          ) : null}
        </>
      }
    >
      {sp.error === "notfound" ? <Notice tone="bad" className="mb-6">{t("Nuk u gjet.", "Not found.")}</Notice> : null}

      {tab === "overview" ? (
        <>
          <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {canReports ? (
              <Stat label={t("Raporte të reja", "New reports")} value={c.report_new ?? 0} tone="bad" href="/admin/hatemap/?tab=reports" hint={t(`${c.report_in_review ?? 0} në shqyrtim`, `${c.report_in_review ?? 0} in review`)} />
            ) : (
              <Stat label={t("Draft", "Drafts")} value={c.record_draft ?? 0} tone="neutral" href="/admin/hatemap/?tab=records&status=draft" />
            )}
            <Stat label={t("Presin vendim", "Awaiting decision")} value={c.record_review ?? 0} tone="warn" href="/admin/hatemap/?tab=records&status=review" hint={t(`${c.record_draft ?? 0} draft`, `${c.record_draft ?? 0} drafts`)} />
            <Stat label={t("Publike", "Public")} value={publicTotal} tone="ok" href="/admin/hatemap/?tab=records&status=published" hint={t(`${c.record_redacted ?? 0} të redaktuara`, `${c.record_redacted ?? 0} redacted`)} />
            <Stat label={t("Raste të hapura", "Open cases")} value={(c.case_open ?? 0) + (c.case_in_review ?? 0)} tone="accent" href={can(s.role, "cases") ? "/admin/hatemap/cases/" : undefined} hint={t(`${c.record_removed ?? 0} të hequra`, `${c.record_removed ?? 0} taken down`)} />
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card
              className="lg:col-span-2"
              title={t("Radha e shqyrtimit", "Review queue")}
              actions={<a href="/admin/hatemap/?tab=records&status=review" className="text-xs font-medium text-accent-ink hover:underline">{t("Të gjitha", "View all")}</a>}
            >
              {queue.length === 0 ? (
                <p className="text-sm text-muted">{t("Asgjë nuk pret vendim.", "Nothing is waiting for a decision.")}</p>
              ) : (
                <ul className="-my-2 divide-y divide-[color:var(--line)]">
                  {queue.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                      <RecordStatusBadge status={r.status} lang={t.lang} />
                      <a href={`/admin/hatemap/record/${r.id}/`} className="min-w-0 flex-1 truncate font-medium text-ink hover:text-accent-ink">
                        {r.title_sq || r.title_en || t("(pa titull)", "(untitled)")}
                      </a>
                      {r.sensitivity === "high" ? <Badge tone="bad">{t("ndjeshmëri e lartë", "high sensitivity")}</Badge> : null}
                      <span className="text-xs text-muted">{municipalityName(r.municipality, "sq") || "?"} · {dt(r.updated_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="space-y-6">
              {can(s.role, "cases") ? (
                <Card title={t("Korrigjime & ankesa", "Corrections & appeals")} actions={<a href="/admin/hatemap/cases/" className="text-xs font-medium text-accent-ink hover:underline">{t("Hap", "Open")}</a>}>
                  {cases.length === 0 ? (
                    <p className="text-sm text-muted">{t("Nuk ka raste të hapura.", "No open cases.")}</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {cases.map((k) => (
                        <li key={k.id} className="flex items-center gap-2">
                          <a href={`/admin/hatemap/cases/${k.id}/`} className="min-w-0 flex-1 truncate font-medium hover:text-accent-ink">
                            #{k.id} {CASE_KIND[k.kind]?.[t.lang]}
                          </a>
                          {k.urgency === "urgent" ? <Badge tone="bad">{t("urgjent", "urgent")}</Badge> : null}
                          <CaseStatusBadge status={k.status} lang={t.lang} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              ) : null}
              <Card title={t("Publike sipas verifikimit", "Public by verification")}>
                <ul className="space-y-2.5 text-sm">
                  {VERIFICATION.map((v) => {
                    const n = ver[v.key] ?? 0;
                    return (
                      <li key={v.key}>
                        <div className="flex items-center justify-between gap-2">
                          <VerificationBadge value={v.key} lang={t.lang} />
                          <span className="font-semibold tabular-nums">{n}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-3">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${publicTotal ? (n / publicTotal) * 100 : 0}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </div>
          </div>

          <Notice tone="info" className="mt-8">
            <strong>{t("Asnjë publikim automatik.", "No automatic publishing.")}</strong>{" "}
            {t(
              "Çdo regjistrim kalon Draft → Në shqyrtim → vendim i shprehur (Publiko, Publiko të redaktuar, Refuzo). Çdo vendim kërkon arsye dhe ruhet në historikun e pandryshueshëm.",
              "Every record goes Draft → In review → an explicit decision (Publish, Publish redacted, Reject). Each decision needs a reason and is kept in the tamper-proof history.",
            )}
          </Notice>
        </>
      ) : null}

      {tab === "reports" ? (
        <>
          <div className="mb-5">
            <Tabs
              items={[
                { href: "/admin/hatemap/?tab=reports", label: t("Të hapura", "Open"), active: !status, count: (c.report_new ?? 0) + (c.report_in_review ?? 0) },
                { href: "/admin/hatemap/?tab=reports&status=converted", label: t("Të shndërruara", "Converted"), active: status === "converted", count: c.report_converted ?? 0 },
                { href: "/admin/hatemap/?tab=reports&status=rejected", label: t("Refuzuar", "Rejected"), active: status === "rejected", count: c.report_rejected ?? 0 },
                { href: "/admin/hatemap/?tab=reports&status=spam", label: "Spam", active: status === "spam", count: c.report_spam ?? 0 },
              ]}
            />
          </div>
          <Notice tone="warn" className="mb-5">
            {t("Konfidenciale. Raportet qytetare nuk publikohen kurrë drejtpërdrejt.", "Confidential. Citizen reports are never published directly.")}
          </Notice>
          <div className={`${cardCls} overflow-x-auto`}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th className={thCls}>#</th>
                  <th className={thCls}>{t("Marrë", "Received")}</th>
                  <th className={thCls}>{t("Kategoria", "Category")}</th>
                  <th className={thCls}>{t("Komuna", "Municipality")}</th>
                  <th className={thCls}>{t("Përshkrimi", "Description")}</th>
                  <th className={thCls}>{t("Statusi", "Status")}</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td className={tdCls}>
                      <a href={`/admin/hatemap/report/${r.id}/`} className="font-semibold text-accent-ink hover:underline">#{r.id}</a>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-muted`}>{dt(r.received_at)}</td>
                    <td className={tdCls}>{label(CATEGORIES, r.category, t.lang)}</td>
                    <td className={tdCls}>{r.municipality === "unknown" ? t("E panjohur", "Unknown") : municipalityName(r.municipality, "sq")}</td>
                    <td className={`${tdCls} max-w-sm text-ink-soft`}>{r.description}…</td>
                    <td className={tdCls}><ReportStatusBadge status={r.status} lang={t.lang} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reports.length === 0 ? <Empty>{t("Nuk ka raporte këtu.", "No reports here.")}</Empty> : null}
          </div>
        </>
      ) : null}

      {tab === "records" ? (
        <>
          <div className="mb-5">
            <Tabs
              items={[
                { href: "/admin/hatemap/?tab=records", label: t("Të gjitha", "All"), active: !status },
                ...RECORD_STATUSES.map((st) => ({
                  href: `/admin/hatemap/?tab=records&status=${st}`,
                  label: RECORD_STATUS_LABEL[st][t.lang],
                  active: status === st,
                  count: c[`record_${st}`] ?? 0,
                })),
              ]}
            />
          </div>
          <div className={`${cardCls} overflow-x-auto`}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th className={thCls}>ID</th>
                  <th className={thCls}>{t("Titulli", "Title")}</th>
                  <th className={thCls}>{t("Komuna · data", "Municipality · date")}</th>
                  <th className={thCls}>{t("Verifikimi", "Verification")}</th>
                  <th className={thCls}>{t("Statusi", "Status")}</th>
                  <th className={thCls}>{t("Ndryshuar", "Updated")}</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className={`${tdCls} whitespace-nowrap font-mono text-xs text-muted`}>{r.public_id ?? `#${r.id}`}</td>
                    <td className={`${tdCls} max-w-sm`}>
                      <a href={`/admin/hatemap/record/${r.id}/`} className="font-medium text-ink hover:text-accent-ink">
                        {r.title_sq || r.title_en || t("(pa titull)", "(untitled)")}
                      </a>
                      {r.sensitivity === "high" ? <span className="ml-2"><Badge tone="bad">{t("ndjeshmëri e lartë", "high sensitivity")}</Badge></span> : null}
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-muted`}>{municipalityName(r.municipality, "sq") || "?"} · {r.occurred_on || "?"}</td>
                    <td className={tdCls}><VerificationBadge value={r.verification} lang={t.lang} /></td>
                    <td className={tdCls}><RecordStatusBadge status={r.status} lang={t.lang} /></td>
                    <td className={`${tdCls} whitespace-nowrap text-xs text-muted`}>
                      {dt(r.updated_at)}
                      <br />
                      {r.updated_by}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 ? <Empty>{t("Nuk ka regjistrime këtu.", "No records here.")}</Empty> : null}
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}
