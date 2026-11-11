/**
 * Storage limitation (Kosovo Law No. 06/L-082 Art. 4, GDPR Art. 5(1)(e)): personal data
 * is kept only as long as its purpose needs it. The law sets no fixed periods; ours are:
 *   reporter contact  6 months after the report is closed, at most 12 months after receipt
 *   case contact      6 months after the case is resolved
 *   access log        90 days (security monitoring)
 * Run daily, e.g. from a Workers cron trigger: `await db.batch(retentionStatements(db))`.
 */
export function retentionStatements(db: D1Database): D1PreparedStatement[] {
  return [
    db.prepare(
      `UPDATE hm_reports SET contact = NULL, contact_ok = 0 WHERE contact IS NOT NULL AND (
         received_at < datetime('now', '-12 months')
         OR (status IN ('converted','rejected','spam') AND handled_at < datetime('now', '-6 months')))`,
    ),
    db.prepare("UPDATE hm_cases SET contact = NULL WHERE contact IS NOT NULL AND status IN ('upheld','dismissed') AND resolved_at < datetime('now', '-6 months')"),
    db.prepare("DELETE FROM hm_audit WHERE entity = 'access' AND at < datetime('now', '-90 days')"),
  ];
}
