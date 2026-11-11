import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requirePerm } from "@hatemap-host";
import { dt, getT } from "@hatemap/admin/i18n";
import { AdminShell, Badge, Card, Empty, Notice, Tabs, btnPrimary, cardCls, inputCls, labelCls, tdCls, thCls } from "@hatemap/admin/kit";
import { createCase } from "@hatemap/admin/actions";
import { CASE_KIND, CaseStatusBadge } from "@hatemap/admin/labels";

export const dynamic = "force-dynamic";

type Row = { id: number; kind: string; urgency: string; status: string; record_id: number | null; public_id: string | null; requester: string | null; created_at: string; resolved_at: string | null };

export default async function Cases({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
  await requirePerm("cases");
  const t = await getT();
  const { status, error } = await searchParams;
  const { env } = await getCloudflareContext({ async: true });
  const rows = (
    await env.DB.prepare(
      `SELECT c.id, c.kind, c.urgency, c.status, c.record_id, r.public_id, c.requester, c.created_at, c.resolved_at
       FROM hm_cases c LEFT JOIN hm_records r ON r.id = c.record_id
       WHERE (?1 IS NULL AND c.status IN ('open','in_review')) OR c.status = ?1
       ORDER BY c.urgency = 'urgent' DESC, c.created_at DESC LIMIT 300`,
    )
      .bind(status ?? null)
      .all<Row>()
  ).results;

  return (
    <AdminShell title={t("Korrigjime, ankesa & heqje", "Corrections, appeals & removals")} eyebrow="HateMap" active="hm-cases">
      {error ? <Notice tone="bad" className="mb-6">{t("Plotësoni llojin dhe përshkrimin.", "Fill in the type and description.")}</Notice> : null}
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-5">
            <Tabs
              items={[
                { href: "/admin/hatemap/cases/", label: t("Të hapura", "Open"), active: !status },
                { href: "/admin/hatemap/cases/?status=upheld", label: t("Të pranuara", "Upheld"), active: status === "upheld" },
                { href: "/admin/hatemap/cases/?status=dismissed", label: t("Të refuzuara", "Dismissed"), active: status === "dismissed" },
              ]}
            />
          </div>
          <div className={`${cardCls} overflow-x-auto`}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th className={thCls}>#</th>
                  <th className={thCls}>{t("Lloji", "Type")}</th>
                  <th className={thCls}>{t("Regjistrimi", "Record")}</th>
                  <th className={thCls}>{t("Hapur", "Opened")}</th>
                  <th className={thCls}>{t("Statusi", "Status")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td className={tdCls}>
                      <a href={`/admin/hatemap/cases/${c.id}/`} className="font-semibold text-accent-ink hover:underline">#{c.id}</a>
                    </td>
                    <td className={tdCls}>
                      <span className="font-medium">{CASE_KIND[c.kind]?.[t.lang]}</span>
                      {c.urgency === "urgent" ? <span className="ml-2"><Badge tone="bad">{t("urgjent", "urgent")}</Badge></span> : null}
                      {c.requester ? <span className="block text-xs text-muted">{c.requester}</span> : null}
                    </td>
                    <td className={`${tdCls} font-mono text-xs`}>
                      {c.record_id ? <a href={`/admin/hatemap/record/${c.record_id}/`} className="hover:text-accent-ink">{c.public_id ?? `#${c.record_id}`}</a> : <span className="text-muted">-</span>}
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-muted`}>{dt(c.created_at)}</td>
                    <td className={tdCls}><CaseStatusBadge status={c.status} lang={t.lang} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 ? <Empty>{t("Nuk ka raste këtu.", "No cases here.")}</Empty> : null}
          </div>
        </section>

        <aside className="space-y-5">
          <Card title={t("Regjistro një kërkesë", "Log a request")}>
            <form action={createCase} className="grid gap-3">
              <label className={labelCls}>
                {t("Lloji", "Type")}
                <select name="kind" className={inputCls} defaultValue="correction">
                  {Object.entries(CASE_KIND).map(([k, v]) => (
                    <option key={k} value={k}>{v[t.lang]}</option>
                  ))}
                </select>
              </label>
              <label className={labelCls}>
                {t("Regjistrimi (ID publike ose #)", "Record (public ID or #)")}
                <input name="record" placeholder="HM-2026-0001" className={inputCls} />
              </label>
              <label className={labelCls}>
                {t("Urgjenca", "Urgency")}
                <select name="urgency" className={inputCls} defaultValue="normal">
                  <option value="normal">{t("Normale", "Normal")}</option>
                  <option value="urgent">{t("Urgjente: rrezik për sigurinë e dikujt", "Urgent: risk to someone's safety")}</option>
                </select>
              </label>
              <label className={labelCls}>
                {t("Kërkuesi (opsional)", "Requester (optional)")}
                <input name="requester" maxLength={200} className={inputCls} />
              </label>
              <label className={labelCls}>
                {t("Kontakti (opsional)", "Contact (optional)")}
                <input name="contact" maxLength={200} className={inputCls} />
              </label>
              <label className={labelCls}>
                {t("Marrë përmes", "Received via")}
                <select name="received_via" className={inputCls} defaultValue="email">
                  <option value="email">Email</option>
                  <option value="phone">{t("Telefon", "Phone")}</option>
                  <option value="in_person">{t("Personalisht", "In person")}</option>
                  <option value="partner">{t("Partner", "Partner")}</option>
                  <option value="internal">{t("Brendshëm (staf)", "Internal (staff)")}</option>
                </select>
              </label>
              <label className={labelCls}>
                {t("Përshkrimi", "Description")} <span className="text-accent-ink">*</span>
                <textarea name="description" required rows={4} maxLength={4000} className={inputCls} />
              </label>
              <button className={`${btnPrimary} justify-self-start`}>{t("Hap rastin", "Open case")}</button>
            </form>
          </Card>
          <Notice tone="info">
            {t(
              "Nëse ka rrezik për sigurinë e dikujt, mos prisni: hapni regjistrimin dhe zgjidhni “Hiq nga publiku”. Pastaj dokumentoni rastin këtu.",
              "If someone's safety is at risk, don't wait: open the record and choose “Take down from public view”. Then document the case here.",
            )}
          </Notice>
        </aside>
      </div>
    </AdminShell>
  );
}
