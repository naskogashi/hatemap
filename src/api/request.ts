import { getCloudflareContext } from "@opennextjs/cloudflare";
import { formLang } from "@hatemap-host";
import { audit, rateLimit } from "@hatemap/lib/records";
import { hatemapCaseEmail, recipients, sendMail } from "@hatemap/lib/email";
import { hatemapPath } from "@hatemap-host";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

/**
 * Public correction / appeal / removal request → hm_cases (never changes a record by itself).
 * Honeypot + rate limit (5 per hour per anonymised client). Staff are notified
 * by email WITHOUT the request text or the requester's contact details.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const lang = formLang(form.get("lang"));
  const back = (status: string) => new Response(null, { status: 303, headers: { Location: `${hatemapPath(lang, "request")}?form=${status}` } });
  const str = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);

  if (form.get("website")) return back("ok"); // bots get a silent success
  const { env, ctx } = await getCloudflareContext({ async: true });

  // Rate limit on a salted daily hash of the IP (the IP itself is never stored).
  const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${env.SESSION_SECRET ?? ""}|${day}|${ip}`));
  const ipKey = Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
  if (!(await rateLimit(`hm-request:${ipKey}`, 5, 3600))) return back("limit");

  const kind = str("kind", 20);
  const description = str("description", 3000);
  const contact = str("contact", 200);
  const ref = str("record", 40).toUpperCase();
  if (!["correction", "appeal", "removal"].includes(kind) || description.length < 20) return back("error");
  if (contact && !EMAIL_RE.test(contact)) return back("error");

  // Link to the record only if the ID matches a public one (never reveal non-public records).
  const rec = ref
    ? await env.DB.prepare("SELECT id FROM hm_records WHERE public_id = ?1 AND status IN ('published','redacted')").bind(ref).first<{ id: number }>()
    : null;
  const urgency = form.get("urgent") === "1" ? "urgent" : "normal";
  const row = await env.DB.prepare(
    `INSERT INTO hm_cases (kind, urgency, record_id, requester, contact, description, received_via, created_by)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'public_form', 'public') RETURNING id`,
  )
    .bind(kind, urgency, rec?.id ?? null, str("requester", 200) || null, contact || null, ref && !rec ? `[Record ID given: ${ref}]\n\n${description}` : description)
    .first<{ id: number }>();
  const id = row!.id;
  ctx.waitUntil(audit("public", "case.open", "case", id, { kind, urgency, record: rec?.id ?? null, lang }));

  const mail = hatemapCaseEmail({ id, kind, urgent: urgency === "urgent", adminUrl: `${new URL(req.url).origin}/admin/hatemap/cases/${id}/` });
  ctx.waitUntil(
    sendMail(env, { to: recipients(env), ...mail }).then((r) => {
      if (!r.ok) console.error("hatemap case notification failed:", r.error);
    }),
  );
  return back("ok");
}
