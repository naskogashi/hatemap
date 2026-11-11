import type { ReactNode } from "react";
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
    emailHint: "Pa email nuk mund t'ju përgjigjemi. E përdorim vetëm për këtë kërkesë dhe e fshijmë 6 muaj pas zgjidhjes së saj.",
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
    name: "Name or organization (optional)",
    email: "Email for our reply (optional)",
    emailHint: "Without an email we cannot reply. We use it only for this request and erase it 6 months after the request is resolved.",
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
    emailHint: "Bez imejla ne možemo da odgovorimo. Koristimo ga samo za ovaj zahtev i brišemo ga 6 meseci nakon rešavanja zahteva.",
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

/* Extra copy for the interactive request page (tips per request type, what happens next). */
const X = {
  sq: {
    eyebrow: "HateMap · Llogaridhënia",
    step: ["Çfarë kërkoni?", "Cili regjistrim?", "Shpjegimi", "Si t'ju përgjigjemi"],
    tipsTitle: "Çfarë të shkruani",
    tips: {
      correction: ["Shënoni ID-në e regjistrimit.", "Tregoni saktësisht cili detaj është i gabuar.", "Nëse mundeni, shtoni një burim publik me informacionin e saktë."],
      appeal: ["Tregoni me cilin vendim nuk pajtoheni (p.sh. statusi i verifikimit ose kategoria).", "Shpjegoni pse.", "Shtoni çdo informacion të ri që nuk e kishim."],
      removal: ["Tregoni kush mund të identifikohet ose të rrezikohet, pa ndarë më shumë të dhëna personale se sa duhen.", "Nëse dikush është në rrezik, shënoni kutinë e urgjencës më poshtë.", "Ndonjëherë mjafton redaktimi: detajet fshihen dhe regjistrimi mbetet anonim."],
    },
    chooseFirst: "Zgjidhni më sipër llojin e kërkesës për të parë këshillat.",
    urgentNote: "Nëse dikush është në rrezik tani, mos prisni përgjigjen tonë: telefononi 112 ose Policinë e Kosovës 192.",
    nextTitle: "Çfarë ndodh më pas",
    next: [
      ["Pranohet", "Kërkesa hyn në një radhë të mbrojtur. Asgjë në hartë nuk ndryshon automatikisht."],
      ["Shqyrtohet", "Stafi i trajnuar kontrollon regjistrimin, burimet dhe shpjegimin tuaj. Kërkesat urgjente shqyrtohen të parat."],
      ["Vendoset", "E korrigjojmë, e redaktojmë, e heqim ose e mbajmë regjistrimin dhe e shkruajmë arsyen."],
      ["Ju përgjigjemi", "Nëse keni lënë email, ju njoftojmë për vendimin. Emaili fshihet 6 muaj pas zgjidhjes së kërkesës."],
    ],
    methodology: "Lexoni metodologjinë",
  },
  en: {
    eyebrow: "HateMap · Accountability",
    step: ["What are you asking for?", "Which record?", "Your explanation", "How we can reply"],
    tipsTitle: "What to write",
    tips: {
      correction: ["Give the record ID.", "Say exactly which detail is wrong.", "If you can, add a public source with the correct information."],
      appeal: ["Say which decision you disagree with (e.g. the verification status or category).", "Explain why.", "Add any new information we did not have."],
      removal: ["Tell us who could be identified or put at risk, without sharing more personal data than needed.", "If someone is in danger, tick the urgent box below.", "Sometimes redaction is enough: details are hidden and the record stays anonymous."],
    },
    chooseFirst: "Choose the type of request above to see tips.",
    urgentNote: "If someone is in danger right now, do not wait for our reply: call 112 or Kosovo Police 192.",
    nextTitle: "What happens next",
    next: [
      ["Received", "Your request goes into a protected queue. Nothing on the map changes automatically."],
      ["Reviewed", "Trained staff check the record, its sources and your explanation. Urgent requests go first."],
      ["Decided", "We correct, redact, remove or keep the record, and write down the reason."],
      ["Answered", "If you left an email, we tell you the decision. The email is erased 6 months after the request is resolved."],
    ],
    methodology: "Read the methodology",
  },
  sr: {
    eyebrow: "HateMap · Odgovornost",
    step: ["Šta tražite?", "Koji zapis?", "Vaše objašnjenje", "Kako da vam odgovorimo"],
    tipsTitle: "Šta da napišete",
    tips: {
      correction: ["Navedite ID zapisa.", "Recite tačno koji detalj nije tačan.", "Ako možete, dodajte javni izvor sa tačnom informacijom."],
      appeal: ["Navedite sa kojom odlukom se ne slažete (npr. status verifikacije ili kategorija).", "Objasnite zašto.", "Dodajte nove informacije koje nismo imali."],
      removal: ["Recite ko bi mogao biti identifikovan ili ugrožen, bez deljenja više ličnih podataka nego što je potrebno.", "Ako je neko u opasnosti, označite polje za hitnost ispod.", "Ponekad je dovoljno redigovanje: detalji se skrivaju, a zapis ostaje anoniman."],
    },
    chooseFirst: "Izaberite vrstu zahteva iznad da vidite savete.",
    urgentNote: "Ako je neko sada u opasnosti, ne čekajte naš odgovor: pozovite 112 ili Kosovsku policiju 192.",
    nextTitle: "Šta se dešava dalje",
    next: [
      ["Prijem", "Vaš zahtev ulazi u zaštićeni red. Ništa se na mapi ne menja automatski."],
      ["Pregled", "Obučeno osoblje proverava zapis, izvore i vaše objašnjenje. Hitni zahtevi se pregledaju prvi."],
      ["Odluka", "Zapis ispravljamo, redigujemo, uklanjamo ili zadržavamo i beležimo razlog."],
      ["Odgovor", "Ako ste ostavili imejl, obaveštavamo vas o odluci. Imejl se briše 6 meseci nakon rešavanja zahteva."],
    ],
    methodology: "Pročitajte metodologiju",
  },
} as const;

const KIND_ICON: Record<string, string> = {
  correction: "M4 20h4L19 9l-4-4L4 16v4Zm11-15 4 4",
  appeal: "M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0L7 7Zm10 0-3 7a3 3 0 0 0 6 0l-3-7M8 21h8",
  removal: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6",
};
const Svg = ({ d, className = "h-5 w-5" }: { d: string; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d={d} />
  </svg>
);
const StepHead = ({ n, children }: { n: number; children: ReactNode }) => (
  <span className="flex items-center gap-3 text-base font-bold text-ink">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-sm font-extrabold text-[#101828]">{n}</span>
    {children}
  </span>
);

function NextSteps({ lang }: { lang: Lang }) {
  const x = X[lang];
  return (
    <ol className="relative grid gap-5">
      <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px bg-line" />
      {x.next.map(([h, p], i) => (
        <li key={h} className="relative flex gap-4">
          <span className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-500/60 bg-paper-2 text-sm font-bold text-brand-500">{i + 1}</span>
          <div>
            <p className="font-semibold text-ink">{h}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{p}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function HatemapRequest({ lang, status, record }: { lang: Lang; status?: string; record?: string }) {
  const t = T[lang];
  const x = X[lang];
  const kinds = Object.keys(t.kinds) as (keyof typeof t.kinds)[];
  if (status === "ok") {
    return (
      <div className="hm-dash">
        <Container className="grid gap-6 py-14 lg:grid-cols-12 xl:!max-w-[1360px]">
          <div className="rounded-3xl border border-line bg-paper-2 p-8 lg:col-span-7">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-[#101828]">
              <Svg d="m5 12 4 4 10-10" className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{t.thanksTitle}</h1>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">{t.thanks}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={hatemapPath(lang)} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-[#101828] hover:bg-brand-400">← {t.back}</a>
              <a href={hatemapPath(lang, "methodology")} className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 font-semibold text-ink hover:border-brand-400">{x.methodology}</a>
            </div>
          </div>
          <aside className="rounded-3xl border border-line bg-paper-2 p-6 lg:col-span-5">
            <h2 className="mb-5 text-lg font-bold text-ink">{x.nextTitle}</h2>
            <NextSteps lang={lang} />
          </aside>
        </Container>
      </div>
    );
  }
  return (
    <div className="hm-dash">
      <Container className="py-10 lg:py-14 xl:!max-w-[1360px]">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">
          <span aria-hidden className="inline-block h-[3px] w-8 bg-brand-500" /> {x.eyebrow}
        </p>
        <h1 className="max-w-4xl font-sans text-4xl font-extrabold leading-[1.04] tracking-tight text-ink sm:text-5xl">{t.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-soft">{t.lead}</p>
        {status === "error" || status === "limit" ? (
          <p role="alert" className="mt-6 max-w-3xl rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {status === "limit" ? t.limit : t.error}
          </p>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          {/* The form reacts to choices without JavaScript (styles.css .hm-req) */}
          <form method="post" action="/api/hatemap/request/" className="hm-req grid content-start gap-8 rounded-3xl border border-line bg-paper-2 p-6 sm:p-8 lg:col-span-7">
            <input type="hidden" name="lang" value={lang} />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

            <fieldset>
              <legend>
                <StepHead n={1}>{x.step[0]}</StepHead>
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {kinds.map((k) => (
                  <label key={k} className="hm-kind group relative flex cursor-pointer flex-col gap-2 rounded-2xl border border-line bg-paper p-4 transition hover:-translate-y-0.5 hover:border-brand-400 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500">
                    <input type="radio" name="kind" value={k} required className="peer sr-only" />
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500 transition group-has-[:checked]:bg-brand-500 group-has-[:checked]:text-[#101828]">
                      <Svg d={KIND_ICON[k]} />
                    </span>
                    <span className="font-semibold text-ink">{t.kinds[k][0]}</span>
                    <span className="text-sm leading-snug text-ink-soft">{t.kinds[k][1]}</span>
                    <span aria-hidden className="absolute right-3 top-3 hidden h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[#101828] group-has-[:checked]:flex">
                      <Svg d="m5 12 4 4 10-10" className="h-3.5 w-3.5" />
                    </span>
                  </label>
                ))}
              </div>
              {/* Tips for the chosen type */}
              <div className="mt-4 rounded-2xl bg-ink/[0.04] p-4 text-sm">
                <p className="hm-tip-empty text-muted">{x.chooseFirst}</p>
                {kinds.map((k) => (
                  <div key={k} className="hm-tip" data-kind={k}>
                    <p className="font-semibold text-ink">
                      {x.tipsTitle}: {t.kinds[k][0]}
                    </p>
                    <ul className="mt-2 grid gap-1.5">
                      {x.tips[k].map((tip) => (
                        <li key={tip} className="flex gap-2 text-ink-soft">
                          <span className="mt-0.5 text-brand-500">
                            <Svg d="m5 12 4 4 10-10" className="h-4 w-4" />
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </fieldset>

            <label className="block text-sm font-medium text-ink">
              <StepHead n={2}>{x.step[1]}</StepHead>
              <span className="mt-3 block">{t.record}</span>
              <input name="record" defaultValue={record ?? ""} maxLength={40} placeholder="HM-2026-0001" className={`${field} font-mono`} />
              <span className="mt-1 block text-xs text-muted">{t.recordHint}</span>
            </label>

            <div className="grid gap-4">
              <label className="block text-sm font-medium text-ink">
                <StepHead n={3}>{x.step[2]}</StepHead>
                <span className="mt-3 block">{t.description} *</span>
                <textarea name="description" required minLength={20} maxLength={3000} rows={6} className={`${field} resize-y`} />
                <span className="mt-1 block text-xs text-muted">{t.descriptionHint}</span>
              </label>
              <label className="hm-urgent flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-paper p-4 text-sm transition has-[:checked]:border-red-500/60 has-[:checked]:bg-red-500/10">
                <input type="checkbox" name="urgent" value="1" className="mt-0.5 h-4 w-4 accent-red-500" />
                <span>
                  <span className="font-semibold text-ink">{t.urgent}</span>
                  <span className="mt-0.5 block text-muted">{t.urgentHint}</span>
                </span>
              </label>
              <p className="hm-urgent-note rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500" role="note">
                {x.urgentNote}
              </p>
            </div>

            <div className="grid gap-4">
              <StepHead n={4}>{x.step[3]}</StepHead>
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
              <p className="-mt-1 text-xs text-muted">{t.emailHint}</p>
            </div>

            <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs leading-relaxed text-muted">
                {t.privacy}{" "}
                <a href={routePath("privacy", lang)} className="underline underline-offset-2 hover:text-accent-ink">↗</a>
              </p>
              <button type="submit" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-[#101828] shadow-[0_10px_30px_-10px_rgba(247,144,9,0.8)] transition hover:bg-brand-400">
                {t.send} →
              </button>
            </div>
          </form>

          <aside className="grid content-start gap-4 lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
            <section className="rounded-3xl border border-line bg-paper-2 p-6">
              <h2 className="mb-5 text-lg font-bold text-ink">{x.nextTitle}</h2>
              <NextSteps lang={lang} />
            </section>
            <section className="rounded-3xl border border-line bg-paper-2 p-6 text-sm">
              <div className="flex flex-wrap gap-x-5 gap-y-2 font-semibold">
                <a href={hatemapPath(lang)} className="text-accent-ink hover:underline">← {t.back}</a>
                <a href={hatemapPath(lang, "methodology")} className="text-accent-ink hover:underline">{x.methodology} →</a>
              </div>
            </section>
          </aside>
        </div>
      </Container>
    </div>
  );
}
