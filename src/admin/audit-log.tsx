import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { AuditEntity } from "@hatemap/lib/records";
import { getT, dt } from "@hatemap/admin/i18n";
import { Badge, Card } from "@hatemap/admin/kit";
import { actionLabel, actionTone } from "@hatemap/admin/labels";

type Row = { at: string; actor: string; action: string; details: string | null };

/** Timeline of decisions for one record / report / case (append-only audit trail). */
export async function AuditLog({ entity, id }: { entity: AuditEntity; id: number }) {
  const { env } = await getCloudflareContext({ async: true });
  const t = await getT();
  const rows = (
    await env.DB.prepare("SELECT at, actor, action, details FROM hm_audit WHERE entity = ?1 AND entity_id = ?2 ORDER BY id DESC LIMIT 100").bind(entity, id).all<Row>()
  ).results;
  return (
    <Card title={t("Historiku i vendimeve", "Decision history")} actions={<span className="text-xs text-muted">{t("vetëm shtim", "append-only")}</span>}>
      {rows.length === 0 ? <p className="text-sm text-muted">{t("Asnjë veprim ende.", "No actions yet.")}</p> : null}
      <ol className="relative space-y-4 border-l border-line pl-5">
        {rows.map((r, i) => (
          <li key={i} className="relative text-sm">
            <span className={`dot dot-${actionTone(r.action)} absolute -left-[25px] top-1.5 ring-4 ring-[color:var(--paper-2)]`} aria-hidden />
            <AuditDetails row={r} lang={t.lang} />
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function AuditDetails({ row, lang, showAction = true }: { row: Row; lang: "sq" | "en"; showAction?: boolean }) {
  const showMeta = showAction;
  let d: Record<string, unknown> = {};
  try {
    d = row.details ? JSON.parse(row.details) : {};
  } catch {}
  const t = (sq: string, en: string) => (lang === "en" ? en : sq);
  const status = d.status as { from?: string | null; to?: string } | undefined;
  return (
    <div className="min-w-0">
      {showAction ? <p className="font-semibold text-ink">{actionLabel(row.action, lang)}</p> : null}
      {showMeta ? (
        <p className="text-xs text-muted">
          {dt(row.at)} · {row.actor}
        </p>
      ) : null}
      {status?.to ? (
        <p className="mt-1 text-xs text-ink-soft">
          {t("Statusi", "Status")}: {status.from ?? t("i ri", "new")} → <strong>{status.to}</strong>
        </p>
      ) : null}
      {Array.isArray(d.changed) && d.changed.length ? (
        <p className="mt-1 text-xs text-ink-soft">
          {t("Fushat", "Fields")}: {(d.changed as string[]).join(", ")}
        </p>
      ) : null}
      {d.reason ? <p className="mt-1.5 rounded-md bg-paper-3 px-2 py-1 text-xs text-ink">“{String(d.reason)}”</p> : null}
      {d.blocked ? (
        <p className="mt-1">
          <Badge tone="bad">{String(d.blocked)}</Badge>
        </p>
      ) : null}
    </div>
  );
}
