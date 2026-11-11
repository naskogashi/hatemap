import { getCloudflareContext } from "@opennextjs/cloudflare";
import { formLang } from "@hatemap-host";
import { audit, rateLimit } from "@hatemap/lib/records";
import { CATEGORIES, isKey, isMunicipality, label, municipalityName } from "@hatemap/lib/taxonomy";
import { hatemapReportEmail, recipients, sendMail } from "@hatemap/lib/email";
import { hatemapPath } from "@hatemap-host";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

/**
 * Citizen / partner report (reporting layer).
 * - Plain HTML form POST, works without JavaScript.
 * - Honeypot + rate limit (5 reports per hour per anonymised client).
 * - Stored only in the protected hm_reports table; never published automatically.
 * - Moderators are notified by email WITHOUT the report content.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const lang = formLang(form.get("lang"));
  const back = (status: string) => new Response(null, { status: 303, headers: { Location: `${hatemapPath(lang, "report")}?form=${status}` } });
  const str = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);

  if (form.get("website")) return back("ok"); // bots get a silent success
  const { env, ctx } = await getCloudflareContext({ async: true });

  // Rate limit on a salted hash of the client IP (the IP itself is never stored).
  const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${env.SESSION_SECRET ?? ""}|${day}|${ip}`));
  const ipKey = Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
  if (!(await rateLimit(`hm-report:${ipKey}`, 5, 3600))) return back("limit");

  const category = str("category", 40);
  const municipality = str("municipality", 40);
  const occurred = str("occurred_on", 10);
  const description = str("description", 3000);
  const sourceUrl = str("source_url", 500);
  const contact = str("contact", 200);
  const contactOk = form.get("contact_ok") === "1";

  if (!isKey(CATEGORIES, category) || !(isMunicipality(municipality) || municipality === "unknown") || description.length < 10) return back("error");
  if (occurred && !/^\d{4}-\d{2}(-\d{2})?$/.test(occurred)) return back("error");
  if (sourceUrl && !/^https?:\/\/\S+$/i.test(sourceUrl)) return back("error");
  if (contact && !EMAIL_RE.test(contact)) return back("error");

  const row = await env.DB.prepare(
    `INSERT INTO hm_reports (lang, category, municipality, occurred_on, description, source_url, contact, contact_ok)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) RETURNING id`,
  )
    .bind(lang, category, municipality, occurred || null, description, sourceUrl || null, contact && contactOk ? contact : null, contactOk ? 1 : 0)
    .first<{ id: number }>();
  const id = row!.id;
  ctx.waitUntil(audit("public", "report.received", "report", id, { lang }));

  const mail = hatemapReportEmail({
    id,
    category: label(CATEGORIES, category, "sq"),
    municipality: municipality === "unknown" ? "E panjohur" : municipalityName(municipality, "sq"),
    occurred,
    adminUrl: `${new URL(req.url).origin}/admin/hatemap/report/${id}/`,
  });
  ctx.waitUntil(
    sendMail(env, { to: recipients(env), ...mail }).then((r) => {
      if (!r.ok) console.error("hatemap notification failed:", r.error);
    }),
  );
  return back("ok");
}
