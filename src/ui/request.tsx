import { hatemapPath, routePath, type Lang } from "@hatemap-host";
import { Container } from "@hatemap-host";

/**
 * Public correction / appeal / removal request (HateMap governance).
 * Anyone affected by a record can ask for it to be corrected, appeal a
 * classification, or ask for removal. Requests land in the protected
 * hm_cases queue (/admin/hatemap/cases/); nothing changes automatically.
 * Plain HTML form, works without JavaScript.
 */
const T = {
  sq: {
    title: "Kërkoni korrigjim ose heqje",
    lead: "Nëse një regjistrim në HateMap është i pasaktë, ju prek drejtpërdrejt, ose mund të vërë dikë në rrezik, na tregoni. Çdo kërkesë shqyrtohet nga staf i trajnuar dhe vendimi regjistrohet.",
    kind: "Çfarë kërkoni?",
    kinds: {
      correction: ["Korrigjim", "Një fakt, datë, vend ose klasifikim është i gabuar."],
      appeal: ["Ankesë", "Nuk pajtoheni me vendimin ose me statusin e verifikimit."],
      removal: ["Heqje", "Regjistrimi duhet hequr, p.sh. sepse identifikon dikë ose krijon rrezik."],
    },
    record: "ID-ja e regjistrimit (nëse e dini)",
    recordHint: "P.sh. HM-2026-0001. E gjeni në kartën e regjistrimit në hartë.",
    description: "Shpjegoni kërkesën",
    descriptionHint: "Çfarë është e pasaktë dhe çfarë duhet të ndryshojë. Mos shkruani më shumë të dhëna personale se sa duhen.",
    urgent: "Dikush mund të jetë në rrezik për shkak të këtij regjistrimi",
    urgentHint: "Kërkesat urgjente shqyrtohen të parat. Në rrezik të menjëhershëm telefononi 192 (Policia).",
    name: "Emri ose organizata (opsionale)",
    email: "Email për përgjigje (opsionale)",
    emailHint: "Pa email nuk mund t'ju përgjigjemi. E përdorim vetëm për këtë kërkesë dhe e fshijmë pas mbylljes së saj.",
    send: "Dërgo kërkesën",
    privacy: "Kërkesa ruhet në sistemin e mbrojtur të HateMap dhe shihet vetëm nga stafi i autorizuar.",
    thanksTitle: "Kërkesa u pranua",
    thanks: "Faleminderit. Kërkesa juaj do të shqyrtohet nga ekipi ynë. Nëse keni lënë email, do t'ju njoftojmë për vendimin.",
    error: "Kontrolloni fushat: zgjidhni llojin dhe shkruani së paku disa fjali.",
    limit: "Shumë kërkesa nga kjo lidhje. Provoni pas një ore ose na shkruani me email.",
    back: "Kthehu te harta",
  },
  en: {
    title: "Request a correction or removal",
    lead: "If a HateMap record is inaccurate, concerns you directly, or could put someone at risk, tell us. Every request is reviewed by trained staff and the decision is recorded.",
    kind: "What are you asking for?",
    kinds: {
      correction: ["Correction", "A fact, date, place or classification is wrong."],
      appeal: ["Appeal", "You disagree with a decision or the verification status."],
      removal: ["Removal", "The record should come down, e.g. because it identifies someone or creates a risk."],
    },
    record: "Record ID (if you know it)",
    recordHint: "E.g. HM-2026-0001. It is shown on the record card on the map.",
    description: "Explain your request",
    descriptionHint: "What is wrong and what should change. Please share no more personal data than needed.",
    urgent: "Someone may be at risk because of this record",
    urgentHint: "Urgent requests are reviewed first. In immediate danger call 192 (Police).",
    name: "Name or organisation (optional)",
    email: "Email for our reply (optional)",
    emailHint: "Without an email we cannot reply. We use it only for this request and erase it after the request is closed.",
    send: "Send request",
    privacy: "Your request is stored in the protected HateMap system and seen only by authorized staff.",
    thanksTitle: "Request received",
    thanks: "Thank you. Our team will review your request. If you left an email, we will tell you the decision.",
    error: "Please check the form: choose a type and write at least a few sentences.",
    limit: "Too many requests from this connection. Try again in an hour or email us.",
    back: "Back to the map",
  },
  sr: {
    title: "Zatražite ispravku ili uklanjanje",
    lead: "Ako je zapis na HateMap-u netačan, direktno vas se tiče ili može nekoga dovesti u opasnost, javite nam. Svaki zahtev pregleda obučeno osoblje, a odluka se beleži.",
    kind: "Šta tražite?",
    kinds: {
      correction: ["Ispravka", "Činjenica, datum, mesto ili klasifikacija nije tačna."],
      appeal: ["Žalba", "Ne slažete se sa odlukom ili statusom verifikacije."],
      removal: ["Uklanjanje", "Zapis treba ukloniti, npr. jer nekoga identifikuje ili stvara rizik."],
    },
    record: "ID zapisa (ako ga znate)",
    recordHint: "Npr. HM-2026-0001. Prikazan je na kartici zapisa na mapi.",
    description: "Objasnite zahtev",
    descriptionHint: "Šta nije tačno i šta treba promeniti. Ne delite više ličnih podataka nego što je potrebno.",
    urgent: "Neko može biti u opasnosti zbog ovog zapisa",
    urgentHint: "Hitni zahtevi se pregledaju prvi. U neposrednoj opasnosti pozovite 192 (Policija).",
    name: "Ime ili organizacija (opciono)",
    email: "Imejl za odgovor (opciono)",
    emailHint: "Bez imejla ne možemo da odgovorimo. Koristimo ga samo za ovaj zahtev i brišemo ga nakon zatvaranja zahteva.",
    send: "Pošalji zahtev",
    privacy: "Vaš zahtev se čuva u zaštićenom HateMap sistemu i vidi ga samo ovlašćeno osoblje.",
    thanksTitle: "Zahtev je primljen",
    thanks: "Hvala. Naš tim će pregledati vaš zahtev. Ako ste ostavili imejl, obavestićemo vas o odluci.",
    error: "Proverite formular: izaberite vrstu i napišite bar nekoliko rečenica.",
    limit: "Previše zahteva sa ove veze. Pokušajte za sat vremena ili nam pišite imejlom.",
    back: "Nazad na mapu",
  },
} as const;

export const HATEMAP_REQUEST_TITLE = (l: Lang) => T[l].title;
export const HATEMAP_REQUEST_LINK = { sq: "Kërkoni korrigjim ose heqje", en: "Request a correction or removal", sr: "Zatražite ispravku ili uklanjanje" } as const;

const field =
  "mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-muted transition focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15";

export function HatemapRequest({ lang, status, record }: { lang: Lang; status?: string; record?: string }) {
  const t = T[lang];
  if (status === "ok") {
    return (
      <div className="hm-dash">
        <Container className="max-w-3xl py-16">
          <div className="rounded-3xl border border-line bg-paper-2 p-8">
            <h1 className="text-3xl font-extrabold text-ink">{t.thanksTitle}</h1>
            <p className="mt-3 text-lg text-ink-soft">{t.thanks}</p>
          </div>
          <p className="mt-8">
            <a href={hatemapPath(lang)} className="font-semibold text-accent-ink hover:underline">← {t.back}</a>
          </p>
        </Container>
      </div>
    );
  }
  return (
    <div className="hm-dash">
      <Container className="max-w-3xl py-10 lg:py-14">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">
          <span aria-hidden className="inline-block h-[3px] w-8 bg-accent" /> EX-Sbunker HateMap
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{t.title}</h1>
        <p className="mt-4 text-lg text-ink-soft">{t.lead}</p>
        {status === "error" || status === "limit" ? (
          <p role="alert" className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {status === "limit" ? t.limit : t.error}
          </p>
        ) : null}

        <form method="post" action="/api/hatemap/request/" className="mt-8 grid gap-6 rounded-3xl border border-line bg-paper-2 p-6 sm:p-8">
          <input type="hidden" name="lang" value={lang} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

          <fieldset>
            <legend className="text-base font-bold text-ink">{t.kind}</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(Object.keys(t.kinds) as (keyof typeof t.kinds)[]).map((k) => (
                <label key={k} className="flex cursor-pointer flex-col gap-1 rounded-2xl border border-line bg-paper p-4 transition hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent/10">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    <input type="radio" name="kind" value={k} required className="accent-[#f79009]" />
                    {t.kinds[k][0]}
                  </span>
                  <span className="text-sm text-ink-soft">{t.kinds[k][1]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm font-medium text-ink">
            {t.record}
            <input name="record" defaultValue={record ?? ""} maxLength={40} placeholder="HM-2026-0001" className={field} />
            <span className="mt-1 block text-xs text-muted">{t.recordHint}</span>
          </label>

          <label className="block text-sm font-medium text-ink">
            {t.description} *
            <textarea name="description" required minLength={20} maxLength={3000} rows={6} className={`${field} resize-y`} />
            <span className="mt-1 block text-xs text-muted">{t.descriptionHint}</span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-line bg-paper p-4 text-sm">
            <input type="checkbox" name="urgent" value="1" className="mt-0.5 accent-[#f79009]" />
            <span>
              <span className="font-semibold text-ink">{t.urgent}</span>
              <span className="mt-0.5 block text-muted">{t.urgentHint}</span>
            </span>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              {t.name}
              <input name="requester" maxLength={200} autoComplete="name" className={field} />
            </label>
            <label className="block text-sm font-medium text-ink">
              {t.email}
              <input name="contact" type="email" maxLength={200} autoComplete="email" className={field} />
            </label>
          </div>
          <p className="-mt-3 text-xs text-muted">{t.emailHint}</p>

          <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-xs leading-relaxed text-muted">
              {t.privacy}{" "}
              <a href={routePath("privacy", lang)} className="underline underline-offset-2 hover:text-accent-ink">↗</a>
            </p>
            <button type="submit" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-[#101828] transition hover:bg-brand-400">
              {t.send} →
            </button>
          </div>
        </form>
        <p className="mt-8">
          <a href={hatemapPath(lang)} className="font-semibold text-accent-ink hover:underline">← {t.back}</a>
        </p>
      </Container>
    </div>
  );
}
