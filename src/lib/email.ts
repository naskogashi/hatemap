/**
 * HateMap staff notifications. Deliberately without report or request text and
 * without contact details: sensitive content stays in the protected admin.
 */
import { emailLayout as layout, esc } from "@hatemap-host";

export { recipients, sendMail } from "@hatemap-host";

export function hatemapCaseEmail(m: { id: number; kind: string; urgent: boolean; adminUrl: string }) {
  // Like reports: no request text and no contact details in email.
  const kind = { correction: "Kërkesë për korrigjim", appeal: "Ankesë", removal: "Kërkesë për heqje" }[m.kind] ?? m.kind;
  const html = layout({
    eyebrow: "HateMap · Korrigjim / ankesë",
    title: `${m.urgent ? "URGJENTE: " : ""}${kind} #${m.id}`,
    intro: "Një kërkesë e re për korrigjim, ankesë ose heqje është dërguar përmes faqes publike. Përmbajtja shihet vetëm në panelin e mbrojtur. Asgjë nuk ndryshon pa vendim të stafit.",
    rows: [
      ["Lloji", esc(kind)],
      ["Urgjenca", m.urgent ? "Urgjente: dikush mund të jetë në rrezik" : "Normale"],
    ],
    cta: { label: "Shqyrto në panel", href: m.adminUrl },
  });
  const text = `${m.urgent ? "URGJENTE: " : ""}${kind} #${m.id}\n\nShqyrto: ${m.adminUrl}\n`;
  return { subject: `${m.urgent ? "🚨 URGJENTE " : ""}HateMap: ${kind.toLowerCase()} #${m.id}`, text, html };
}

export function hatemapReportEmail(m: { id: number; category: string; municipality: string; occurred: string; adminUrl: string }) {
  // Deliberately no description or contact details: sensitive content stays in the protected admin.
  const html = layout({
    eyebrow: "HateMap · Raportim i ri",
    title: `Raport i ri #${m.id} pret shqyrtimin`,
    intro: "Një raport i ri është dërguar përmes formularit të HateMap. Për arsye sigurie, përmbajtja shihet vetëm në panelin e mbrojtur të administrimit. Asgjë nuk publikohet automatikisht.",
    rows: [
      ["Kategoria", esc(m.category)],
      ["Komuna", esc(m.municipality)],
      ["Koha e ngjarjes", esc(m.occurred || "e pacaktuar")],
    ],
    cta: { label: "Shqyrto në panel", href: m.adminUrl },
  });
  const text = `Raport i ri HateMap #${m.id}\nKategoria: ${m.category}\nKomuna: ${m.municipality}\n\nShqyrto: ${m.adminUrl}\n`;
  return { subject: `🗺️ HateMap: raport i ri #${m.id} pret shqyrtimin`, text, html };
}
