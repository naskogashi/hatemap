import { evidence, listPublic, localized, publicMonth, type HmRecord, type PublicFilters } from "@hatemap/lib/records";
import { CATEGORIES, GROUPS, MUNICIPALITIES, SOURCES, VERIFICATION, label, municipalityName, type Option } from "@hatemap/lib/taxonomy";
import { CONTACT_LABEL, HTML_LANG, hatemapPath, routePath, type Lang } from "@hatemap-host";
import { Container, Eyebrow } from "@hatemap-host";
import { HATEMAP_REQUEST_LINK } from "@hatemap/ui/request";
import KOSOVO from "@hatemap/data/kosovo-map.json";

/* ───────────── UI strings ───────────── */
const HM = {
  sq: {
    eyebrow: "Paralajmërim i hershëm",
    title: "Harta e urrejtjes në Kosovë",
    lead: "Incidente, kërcënime, diskriminim dhe narrativa të dëmshme, të shqyrtuara nga ekipi i Sbunker dhe të publikuara vetëm kur plotësojnë pragun e verifikimit. Vendndodhjet tregohen vetëm në nivel komune.",
    report: "Raporto një rast",
    methodology: "Metodologjia",
    filters: "Filtro",
    apply: "Apliko",
    reset: "Pastro",
    keyword: "Fjalë kyçe",
    municipality: "Komuna",
    category: "Kategoria",
    group: "Grupi i prekur",
    source: "Burimi",
    verification: "Verifikimi",
    from: "Nga muaji",
    to: "Deri në muajin",
    all: "Të gjitha",
    records: "Regjistrime",
    published: "regjistrime të publikuara gjithsej",
    noRecords: "Nuk ka regjistrime të publikuara për këto filtra.",
    mapTitle: "Regjistrimet sipas komunës",
    mapNote: "Rrathët tregojnë numrin e regjistrimeve në komunë, jo vendndodhje të sakta.",
    byCategory: "Sipas kategorisë",
    evidence: "Burime",
    translationNote: "Në shqip",
    limits:
      "Kjo hartë nuk mat përhapjen e plotë të urrejtjes në Kosovë. Ajo përfshin vetëm raste të shqyrtuara dhe të publikuara sipas metodologjisë. Pretendimet nuk nënkuptojnë përgjegjësi të askujt.",
    // report page
    reportTitle: "Raporto një rast",
    reportLead: "Përdorni këtë formular për të na njoftuar për një incident, kërcënim, diskriminim ose narrativë të dëmshme. Çdo raport shqyrtohet nga ekipi ynë dhe asgjë nuk publikohet automatikisht.",
    warnTitle: "Para se të dërgoni",
    warn: [
      "Mos shkruani emra, adresa, numra telefoni ose të dhëna që identifikojnë viktimat apo dëshmitarët.",
      "Mos ngarkoni foto të personave. Mjafton një përshkrim i shkurtër dhe, nëse ka, një link publik.",
      "Kjo nuk është shërbim emergjence. Nëse dikush është në rrezik tani, telefononi 112 ose Policinë e Kosovës 192.",
    ],
    what: "Çfarë ndodhi?",
    whatHint: "Përshkruani shkurt rastin, pa të dhëna personale.",
    when: "Kur ndodhi? (përafërsisht)",
    link: "Link publik (opsional)",
    linkHint: "P.sh. artikull, postim publik në rrjete sociale.",
    contact: "Email për kontakt (opsional)",
    contactHint: "Vetëm nëse pranoni që t’ju kontaktojmë për sqarime. Fshihet pas shqyrtimit.",
    consent: "Pranoj të kontaktohem nga ekipi i Sbunker për këtë raport.",
    send: "Dërgo raportin",
    thanksTitle: "Faleminderit. Raporti juaj u pranua.",
    thanks: "Ekipi ynë do ta shqyrtojë raportin. Publikimi bëhet vetëm pas verifikimit dhe pa të dhëna që mund t’ju identifikojnë.",
    help: "Ndihmë dhe referim",
    helpItems: [
      ["Emergjenca", "112"],
      ["Policia e Kosovës", "192"],
      ["Avokati i Popullit", "ombudspersonkosovo.org"],
    ],
    tooMany: "Keni dërguar shumë raporte në pak kohë. Ju lutemi provoni sërish më vonë.",
    error: "Raporti nuk u dërgua. Ju lutemi plotësoni fushat e kërkuara dhe provoni përsëri.",
    choose: "Zgjidhni…",
    unknown: "Nuk e di",
  },
  en: {
    eyebrow: "Early warning",
    title: "Hate map of Kosovo",
    lead: "Incidents, threats, discrimination and harmful narratives, reviewed by the Sbunker team and published only when they meet the verification threshold. Locations are shown at municipality level only.",
    report: "Report a case",
    methodology: "Methodology",
    filters: "Filter",
    apply: "Apply",
    reset: "Clear",
    keyword: "Keyword",
    municipality: "Municipality",
    category: "Category",
    group: "Affected group",
    source: "Source",
    verification: "Verification",
    from: "From month",
    to: "To month",
    all: "All",
    records: "Records",
    published: "published records in total",
    noRecords: "No published records match these filters.",
    mapTitle: "Records by municipality",
    mapNote: "Circles show the number of records in a municipality, not exact locations.",
    byCategory: "By category",
    evidence: "Sources",
    translationNote: "In Albanian",
    limits:
      "This map does not measure the overall prevalence of hate in Kosovo. It only includes cases reviewed and published under the methodology. Allegations do not imply anyone's responsibility.",
    reportTitle: "Report a case",
    reportLead: "Use this form to tell us about an incident, threat, discrimination or harmful narrative. Every report is reviewed by our team and nothing is published automatically.",
    warnTitle: "Before you send",
    warn: [
      "Do not include names, addresses, phone numbers or details that identify victims or witnesses.",
      "Do not upload photos of people. A short description and, if available, a public link are enough.",
      "This is not an emergency service. If someone is in danger now, call 112 or Kosovo Police 192.",
    ],
    what: "What happened?",
    whatHint: "Briefly describe the case, without personal data.",
    when: "When did it happen? (approximately)",
    link: "Public link (optional)",
    linkHint: "E.g. an article or a public social media post.",
    contact: "Contact email (optional)",
    contactHint: "Only if you agree to be contacted for clarification. Deleted after review.",
    consent: "I agree to be contacted by the Sbunker team about this report.",
    send: "Send report",
    thanksTitle: "Thank you. Your report has been received.",
    thanks: "Our team will review it. Publication happens only after verification and without details that could identify you.",
    help: "Help and referral",
    helpItems: [
      ["Emergency", "112"],
      ["Kosovo Police", "192"],
      ["Ombudsperson Institution", "ombudspersonkosovo.org"],
    ],
    tooMany: "You have sent too many reports in a short time. Please try again later.",
    error: "The report was not sent. Please fill in the required fields and try again.",
    choose: "Choose…",
    unknown: "I don't know",
  },
  sr: {
    eyebrow: "Rano upozoravanje",
    title: "Mapa mržnje na Kosovu",
    lead: "Incidenti, pretnje, diskriminacija i štetni narativi koje pregleda tim Sbunker i objavljuje samo kada ispune prag verifikacije. Lokacije se prikazuju samo na nivou opštine.",
    report: "Prijavi slučaj",
    methodology: "Metodologija",
    filters: "Filtriraj",
    apply: "Primeni",
    reset: "Obriši",
    keyword: "Ključna reč",
    municipality: "Opština",
    category: "Kategorija",
    group: "Pogođena grupa",
    source: "Izvor",
    verification: "Verifikacija",
    from: "Od meseca",
    to: "Do meseca",
    all: "Sve",
    records: "Zapisi",
    published: "objavljenih zapisa ukupno",
    noRecords: "Nema objavljenih zapisa za ove filtere.",
    mapTitle: "Zapisi po opštinama",
    mapNote: "Krugovi pokazuju broj zapisa u opštini, a ne tačne lokacije.",
    byCategory: "Po kategoriji",
    evidence: "Izvori",
    translationNote: "Na albanskom",
    limits:
      "Ova mapa ne meri ukupnu rasprostranjenost mržnje na Kosovu. Obuhvata samo slučajeve pregledane i objavljene prema metodologiji. Navodi ne podrazumevaju ničiju odgovornost.",
    reportTitle: "Prijavi slučaj",
    reportLead: "Koristite ovaj obrazac da nas obavestite o incidentu, pretnji, diskriminaciji ili štetnom narativu. Svaku prijavu pregleda naš tim i ništa se ne objavljuje automatski.",
    warnTitle: "Pre slanja",
    warn: [
      "Ne navodite imena, adrese, brojeve telefona ili podatke koji identifikuju žrtve ili svedoke.",
      "Ne šaljite fotografije osoba. Dovoljan je kratak opis i, ako postoji, javni link.",
      "Ovo nije hitna služba. Ako je neko sada u opasnosti, pozovite 112 ili Kosovsku policiju 192.",
    ],
    what: "Šta se dogodilo?",
    whatHint: "Ukratko opišite slučaj, bez ličnih podataka.",
    when: "Kada se dogodilo? (približno)",
    link: "Javni link (opciono)",
    linkHint: "Npr. članak ili javna objava na društvenim mrežama.",
    contact: "Email za kontakt (opciono)",
    contactHint: "Samo ako pristajete da vas kontaktiramo radi pojašnjenja. Briše se nakon pregleda.",
    consent: "Pristajem da me tim Sbunker kontaktira u vezi sa ovom prijavom.",
    send: "Pošalji prijavu",
    thanksTitle: "Hvala. Vaša prijava je primljena.",
    thanks: "Naš tim će je pregledati. Objava sledi samo nakon verifikacije i bez podataka koji bi mogli da vas identifikuju.",
    help: "Pomoć i upućivanje",
    helpItems: [
      ["Hitna pomoć", "112"],
      ["Kosovska policija", "192"],
      ["Institucija Ombudsmana", "ombudspersonkosovo.org"],
    ],
    tooMany: "Poslali ste previše prijava u kratkom roku. Pokušajte ponovo kasnije.",
    error: "Prijava nije poslata. Popunite obavezna polja i pokušajte ponovo.",
    choose: "Izaberite…",
    unknown: "Ne znam",
  },
} as const;

/* ───────────── Dashboard strings (concept + SPLC-style controls) ───────────── */
const DASH = {
  sq: {
    heroA: "Së bashku për një",
    heroB: "Kosovë",
    heroC: "më të sigurt.",
    lead: "HateMap i EX-Sbunker monitoron dhe ekspozon gjuhën e urrejtjes dhe incidentet e motivuara nga urrejtja. Eksploroni rastet e shqyrtuara, kuptoni prirjet dhe ndihmoni të ndërtojmë një shoqëri më gjithëpërfshirëse.",
    report: "Raporto një incident",
    how: "Si funksionon",
    statTotal: "Regjistrime",
    statVerified: "Të verifikuara",
    statMunicipalities: "Komuna me raste",
    statSince: "Monitorim që nga",
    mapTitle: "Harta e incidenteve",
    mapSub: "Përmbledhje e regjistrimeve të publikuara sipas komunës",
    allYears: "Të gjitha vitet",
    filters: "Filtrat",
    clearAll: "Pastro të gjitha",
    allTypes: "Të gjitha llojet",
    allMunicipalities: "Të gjitha komunat",
    allTime: "Gjithë kohën",
    allGroups: "Të gjitha grupet",
    allSources: "Të gjitha burimet",
    allVerification: "Të gjitha statuset",
    verifiedOnly: "Vetëm të verifikuarat",
    apply: "Apliko filtrat",
    keyword: "Kërko në regjistrime",
    legend: "Legjenda",
    high: "E lartë",
    medium: "Mesatare",
    low: "E ulët",
    none: "Pa të dhëna",
    highR: "100+ regjistrime",
    mediumR: "20 deri 99",
    lowR: "1 deri 19",
    noneR: "Pa regjistrime",
    byType: "Sipas llojit",
    recent: "Regjistrimet e fundit",
    viewAll: "Shiko të gjitha",
    records: "regjistrime",
    home: "Pamja e plotë",
    zoomIn: "Zmadho",
    zoomOut: "Zvogëlo",
    selected: "Komuna e zgjedhur",
    showAll: "Shfaq të gjitha komunat",
    attribution: "Kufijtë: geoBoundaries / OpenStreetMap (CC BY-SA)",
  },
  en: {
    heroA: "Together for a safer",
    heroB: "Kosovo.",
    heroC: "",
    lead: "EX-Sbunker HateMap monitors and exposes hate speech and hate-motivated incidents. Explore reviewed cases, understand trends, and help build a more inclusive society.",
    report: "Report an incident",
    how: "How it works",
    statTotal: "Records",
    statVerified: "Verified",
    statMunicipalities: "Municipalities with cases",
    statSince: "Tracking since",
    mapTitle: "Incident map",
    mapSub: "Overview of published records by municipality",
    allYears: "All years",
    filters: "Filters",
    clearAll: "Clear all",
    allTypes: "All incident types",
    allMunicipalities: "All municipalities",
    allTime: "All time",
    allGroups: "All affected groups",
    allSources: "All sources",
    allVerification: "All statuses",
    verifiedOnly: "Verified only",
    apply: "Apply filters",
    keyword: "Search records",
    legend: "Legend",
    high: "High",
    medium: "Medium",
    low: "Low",
    none: "No data",
    highR: "100+ records",
    mediumR: "20 to 99",
    lowR: "1 to 19",
    noneR: "No records",
    byType: "By type",
    recent: "Recent records",
    viewAll: "View all",
    records: "records",
    home: "Full view",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    selected: "Selected municipality",
    showAll: "Show all municipalities",
    attribution: "Boundaries: geoBoundaries / OpenStreetMap (CC BY-SA)",
  },
  sr: {
    heroA: "Zajedno za bezbednije",
    heroB: "Kosovo.",
    heroC: "",
    lead: "EX-Sbunker HateMap prati i razotkriva govor mržnje i incidente motivisane mržnjom. Istražite pregledane slučajeve, razumite trendove i pomozite da izgradimo inkluzivnije društvo.",
    report: "Prijavi incident",
    how: "Kako funkcioniše",
    statTotal: "Zapisi",
    statVerified: "Verifikovani",
    statMunicipalities: "Opštine sa slučajevima",
    statSince: "Praćenje od",
    mapTitle: "Mapa incidenata",
    mapSub: "Pregled objavljenih zapisa po opštinama",
    allYears: "Sve godine",
    filters: "Filteri",
    clearAll: "Obriši sve",
    allTypes: "Sve vrste incidenata",
    allMunicipalities: "Sve opštine",
    allTime: "Sve vreme",
    allGroups: "Sve pogođene grupe",
    allSources: "Svi izvori",
    allVerification: "Svi statusi",
    verifiedOnly: "Samo verifikovani",
    apply: "Primeni filtere",
    keyword: "Pretraži zapise",
    legend: "Legenda",
    high: "Visok",
    medium: "Srednji",
    low: "Nizak",
    none: "Nema podataka",
    highR: "100+ zapisa",
    mediumR: "20 do 99",
    lowR: "1 do 19",
    noneR: "Bez zapisa",
    byType: "Po vrsti",
    recent: "Najnoviji zapisi",
    viewAll: "Prikaži sve",
    records: "zapisa",
    home: "Ceo prikaz",
    zoomIn: "Uvećaj",
    zoomOut: "Umanji",
    selected: "Izabrana opština",
    showAll: "Prikaži sve opštine",
    attribution: "Granice: geoBoundaries / OpenStreetMap (CC BY-SA)",
  },
} as const;

/* Severity levels (legend from the concept) */
function level(n: number): "high" | "medium" | "low" | "none" {
  return n >= 100 ? "high" : n >= 20 ? "medium" : n >= 1 ? "low" : "none";
}
const LEVEL_COLOR = { high: "#F04438", medium: "#F79009", low: "#FAC515", none: "#667085" } as const;

const CATEGORY_TONE: Record<string, string> = {
  violence: "bg-red-500/15 text-red-500",
  threat: "bg-orange-500/15 text-orange-500",
  vandalism: "bg-amber-500/15 text-amber-500",
  discrimination: "bg-sky-500/15 text-sky-500",
  hate_speech: "bg-blue-500/15 text-blue-500",
  online: "bg-violet-500/15 text-violet-500",
  extremist_narrative: "bg-rose-500/15 text-rose-500",
  anti_gender: "bg-fuchsia-500/15 text-fuchsia-500",
  disinformation: "bg-teal-500/15 text-teal-500",
  other: "bg-slate-500/20 text-ink-soft",
};

function qs(base: string, f: PublicFilters, patch: Partial<Record<string, string | undefined>>): string {
  const p = new URLSearchParams();
  const merged: Record<string, string | undefined> = {
    q: f.q,
    municipality: f.municipality,
    category: f.category,
    group: f.group,
    source: f.source,
    year: f.year,
    verified: f.verifiedOnly ? "1" : undefined,
    ...(f.year ? {} : { from: f.from, to: f.to }),
    ...patch,
  };
  for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

/* ───────────── Kosovo map: municipality shapes (server-rendered SVG) ───────────── */
function KosovoMap({ lang, counts, filters }: { lang: Lang; counts: Record<string, number>; filters: PublicFilters }) {
  const t = DASH[lang];
  const base = hatemapPath(lang);
  const muni = KOSOVO.municipalities as Record<string, { d: string; cx: number; cy: number }>;
  const max = Math.max(1, ...Object.values(counts));
  const keys = Object.keys(muni);
  return (
    <svg id="hm-svg" viewBox={KOSOVO.viewBox} role="img" aria-label={t.mapTitle} className="h-full w-full select-none" data-viewbox={KOSOVO.viewBox}>
      <defs>
        <filter id="hm-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g id="hm-world">
        {keys.map((k) => {
          const n = counts[k] ?? 0;
          const selected = filters.municipality === k;
          const name = municipalityName(k, lang);
          return (
            <a key={k} href={qs(base, filters, { municipality: selected ? undefined : k })} className="hm-muni" data-k={k} data-n={n} aria-label={`${name}: ${n} ${t.records}`}>
              <title>{`${name}: ${n} ${t.records}`}</title>
              <path d={muni[k].d} className={`hm-shape${n ? " has-data" : ""}${selected ? " is-selected" : ""}`} />
            </a>
          );
        })}
        {/* Count bubbles on top of all shapes */}
        {keys.map((k) => {
          const n = counts[k] ?? 0;
          if (!n) return null;
          const lv = level(n);
          const r = 13 + 15 * Math.sqrt(n / max);
          const { cx, cy } = muni[k];
          return (
            <a key={`b-${k}`} href={qs(base, filters, { municipality: filters.municipality === k ? undefined : k })} className="hm-bubble" data-k={k} aria-hidden="true" tabIndex={-1}>
              <circle cx={cx} cy={cy} r={r + 7} fill={LEVEL_COLOR[lv]} opacity="0.18" className="hm-halo" />
              <circle cx={cx} cy={cy} r={r} fill={LEVEL_COLOR[lv]} stroke="rgba(255,255,255,0.85)" strokeWidth="2" filter="url(#hm-glow)" />
              <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize="13" fontWeight="800" fill={lv === "low" ? "#101828" : "#fff"}>
                {n}
              </text>
            </a>
          );
        })}
        {/* Labels for main towns and every municipality with records */}
        {keys
          .filter((k) => (counts[k] ?? 0) > 0 || ["prishtine", "prizren", "peje", "gjakove", "mitrovice_veriut", "ferizaj", "gjilan"].includes(k))
          .map((k) => {
            const n = counts[k] ?? 0;
            const r = n ? 13 + 15 * Math.sqrt(n / max) : 0;
            const { cx, cy } = muni[k];
            return (
              <text key={`l-${k}`} x={cx} y={cy - r - 8} textAnchor="middle" className="hm-label">
                {municipalityName(k, lang)}
              </text>
            );
          })}
      </g>
    </svg>
  );
}

/** Month picker as a plain select ("tetor 2026"), avoiding the browser's dashed month-input placeholder. */
function MonthSelect({ name, value, lang, emptyLabel, className }: { name: string; value?: string; lang: Lang; emptyLabel: string; className: string }) {
  const now = new Date();
  const months: string[] = [];
  let y = now.getUTCFullYear();
  let m = now.getUTCMonth() + 1;
  while (y >= 2023) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return (
    <select name={name} defaultValue={value ?? ""} className={className}>
      <option value="">{emptyLabel}</option>
      {months.map((v) => (
        <option key={v} value={v}>
          {publicMonth(v, lang)}
        </option>
      ))}
    </select>
  );
}

const ICONS = {
  tag: <path d="M3 12V4h8l9 9-8 8-9-9Zm4.5-4.5h.01" />,
  pin: <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  cal: <path d="M4 7h16M4 7v12h16V7M4 7V5h16v2M8 3v4M16 3v4" />,
  users: <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 9a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M21 20a5 5 0 0 0-4-4.9" />,
  source: <path d="M4 5h16v14H4zM8 9h8M8 13h5" />,
  check: <path d="m5 12 4 4 10-10" />,
  shield: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3.5 9 2.5 2.5 4.5-5" />,
  book: <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5Zm0 14a2 2 0 0 1 2-2h14" />,
  doc: <path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7M9 8h3" />,
  map: <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15" />,
  home: <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
};
function Icon({ name, className = "h-[18px] w-[18px]" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {ICONS[name]}
    </svg>
  );
}

function FilterSelect({ icon, name, value, empty, options }: { icon: keyof typeof ICONS; name: string; value?: string; empty: string; options: { key: string; label: string }[] }) {
  return (
    <label className="hm-field">
      <Icon name={icon} />
      <span className="sr-only">{empty}</span>
      <select name={name} defaultValue={value ?? ""} data-autosubmit>
        <option value="">{empty}</option>
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ───────────── Pages ───────────── */
export async function HatemapIndex({ lang, filters }: { lang: Lang; filters: PublicFilters }) {
  const t = HM[lang];
  const d = DASH[lang];
  const base = hatemapPath(lang);
  const data = await listPublic(filters, lang);
  const maxCat = Math.max(1, ...data.byCategory.map((c) => c.n));
  const year = new Date().getUTCFullYear();
  const yearTabs = Array.from(new Set([String(year), ...data.years])).sort().reverse().slice(0, 4);
  const recent = data.records.slice(0, 4);
  const active = !!(filters.q || filters.municipality || filters.category || filters.group || filters.source || filters.year || filters.from || filters.to || filters.verifiedOnly || filters.verification);

  return (
    <div className="hm-dash">
      {/* ── Hero + map + filters ── */}
      <Container className="grid gap-6 py-10 lg:grid-cols-12 lg:py-14 xl:!max-w-[1360px]">
        <div className="flex flex-col justify-start lg:col-span-4 lg:pt-6">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">
            <span aria-hidden className="inline-block h-[3px] w-8 bg-brand-500" /> EX-Sbunker HateMap
          </p>
          <h1 className="font-sans text-4xl font-extrabold leading-[1.04] tracking-tight text-ink sm:text-5xl xl:text-6xl">
            {d.heroA} <span className="text-brand-500">{d.heroB}</span>
            {d.heroC ? " " + d.heroC : null}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">{d.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={hatemapPath(lang, "report")} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-[#101828] shadow-[0_10px_30px_-10px_rgba(247,144,9,0.8)] hover:bg-brand-400">
              <Icon name="shield" /> {d.report}
            </a>
            <a href={hatemapPath(lang, "methodology")} className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 font-semibold text-ink hover:border-brand-400">
              <Icon name="book" /> {d.how}
            </a>
          </div>
          <p className="mt-4 text-sm">
            <a href={hatemapPath(lang, "request")} className="text-ink-soft underline underline-offset-4 hover:text-accent-ink">
              {HATEMAP_REQUEST_LINK[lang]}
            </a>
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-ink/10 sm:grid-cols-4 lg:grid-cols-2">
            {[
              ["doc", data.totalPublished, d.statTotal],
              ["check", data.verifiedCount, d.statVerified],
              ["map", `${data.municipalitiesWithRecords}/38`, d.statMunicipalities],
              ["cal", data.firstYear ?? String(year), d.statSince],
            ].map(([icon, v, l]) => (
              <div key={l as string} className="flex items-center gap-3 bg-paper-2 px-4 py-4">
                <span className="text-muted">
                  <Icon name={icon as keyof typeof ICONS} className="h-6 w-6" />
                </span>
                <div>
                  <dd className="text-lg font-bold text-ink">{v}</dd>
                  <dt className="text-xs text-muted">{l}</dt>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Map card */}
        <section aria-labelledby="hm-map-title" className="relative flex flex-col rounded-3xl border border-line bg-paper-2 p-5 lg:col-span-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="hm-map-title" className="text-lg font-semibold text-ink">
                {d.mapTitle}
              </h2>
              <p className="text-sm text-muted">{d.mapSub}</p>
            </div>
            {/* SPLC-style year control */}
            <nav aria-label="Year" className="flex flex-wrap gap-1 rounded-xl bg-ink/5 p-1 text-xs font-semibold">
              <a href={qs(base, filters, { year: undefined, from: undefined, to: undefined })} className={`rounded-lg px-2.5 py-1.5 ${!filters.year ? "bg-brand-500 text-[#101828]" : "text-ink-soft hover:text-ink"}`}>
                {d.allYears}
              </a>
              {yearTabs.map((y) => (
                <a key={y} href={qs(base, filters, { year: y, from: undefined, to: undefined })} className={`rounded-lg px-2.5 py-1.5 ${filters.year === y ? "bg-brand-500 text-[#101828]" : "text-ink-soft hover:text-ink"}`}>
                  {y}
                </a>
              ))}
            </nav>
          </div>
          <div id="hm-stage" className="relative mt-3 h-[440px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[620px]">
            <div className="absolute inset-0 p-2">
              <KosovoMap lang={lang} counts={data.byMunicipality} filters={filters} />
            </div>
            <div id="hm-tip" role="status" hidden className="pointer-events-none absolute z-10 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#101828] shadow-lg" />
            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5" data-hm-controls hidden>
              <button type="button" data-hm="home" aria-label={d.home} title={d.home} className="hm-ctl">
                <Icon name="home" />
              </button>
              <div className="flex flex-col overflow-hidden rounded-xl border border-line">
                <button type="button" data-hm="in" aria-label={d.zoomIn} title={d.zoomIn} className="hm-ctl rounded-none border-0">
                  <Icon name="plus" />
                </button>
                <button type="button" data-hm="out" aria-label={d.zoomOut} title={d.zoomOut} className="hm-ctl rounded-none border-0 border-t border-line">
                  <Icon name="minus" />
                </button>
              </div>
            </div>
          </div>
          {/* Always takes one line, so selecting a municipality never changes the card height (no layout jump). */}
          {filters.municipality ? (
            <p className="mt-3 flex h-6 items-center gap-2 overflow-hidden whitespace-nowrap text-sm text-ink-soft">
              <span className="truncate">
                {d.selected}: <strong className="text-ink">{municipalityName(filters.municipality, lang)}</strong>
              </span>
              <a href={qs(base, filters, { municipality: undefined })} className="shrink-0 font-semibold text-accent-ink hover:underline">
                {d.showAll}
              </a>
            </p>
          ) : (
            <p aria-hidden className="mt-3 h-6" />
          )}
          <p className="mt-2 text-[11px] text-muted">{d.attribution}</p>
        </section>

        {/* Filters + legend */}
        <aside className="grid content-start gap-4 lg:col-span-3">
          <form method="get" action={base} className="rounded-3xl border border-line bg-paper-2 p-5" data-hm-filters>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">{d.filters}</h2>
              {active ? (
                <a href={base} className="text-sm font-semibold text-accent-ink hover:underline">
                  {d.clearAll}
                </a>
              ) : null}
            </div>
            {filters.year ? <input type="hidden" name="year" value={filters.year} /> : null}
            <div className="grid gap-2.5">
              <label className="hm-field">
                <Icon name="doc" />
                <span className="sr-only">{d.keyword}</span>
                <input name="q" type="search" defaultValue={filters.q ?? ""} maxLength={80} placeholder={d.keyword} />
              </label>
              <FilterSelect icon="tag" name="category" value={filters.category} empty={d.allTypes} options={CATEGORIES.map((c) => ({ key: c.key, label: c.label[lang] }))} />
              <FilterSelect icon="pin" name="municipality" value={filters.municipality} empty={d.allMunicipalities} options={MUNICIPALITIES.map((m) => ({ key: m.key, label: municipalityName(m.key, lang) })).sort((a, b) => a.label.localeCompare(b.label))} />
              <label className="hm-field">
                <Icon name="cal" />
                <span className="sr-only">{t.from}</span>
                <MonthSelect name="from" value={filters.year ? undefined : filters.from} lang={lang} emptyLabel={`${t.from}: ${d.allTime}`} className="" />
              </label>
              <FilterSelect icon="users" name="group" value={filters.group} empty={d.allGroups} options={GROUPS.map((g) => ({ key: g.key, label: g.label[lang] }))} />
              <FilterSelect icon="source" name="source" value={filters.source} empty={d.allSources} options={SOURCES.map((s) => ({ key: s.key, label: s.label[lang] }))} />
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 text-sm text-ink-soft">
              {d.verifiedOnly}
              <input type="checkbox" name="verified" value="1" defaultChecked={!!filters.verifiedOnly} className="hm-switch" data-autosubmit />
            </label>
            <button className="mt-4 w-full rounded-xl bg-ink/10 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-ink/15" data-hm-apply>
              {d.apply}
            </button>
          </form>

          <section className="rounded-3xl border border-line bg-paper-2 p-5">
            <h2 className="mb-3 text-lg font-semibold text-ink">{d.legend}</h2>
            <ul className="grid gap-2 text-sm">
              {(["high", "medium", "low", "none"] as const).map((lv) => (
                <li key={lv} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-ink-soft">
                    <span className="h-3.5 w-3.5 rounded-full" style={{ background: LEVEL_COLOR[lv] }} />
                    {d[lv]}
                  </span>
                  <span className="text-xs text-muted">{d[`${lv}R` as const]}</span>
                </li>
              ))}
            </ul>
          </section>

          {data.byCategory.length ? (
            <section className="rounded-3xl border border-line bg-paper-2 p-5">
              <h2 className="mb-3 text-lg font-semibold text-ink">{d.byType}</h2>
              <ul className="space-y-2.5 text-sm">
                {data.byCategory.map((c) => (
                  <li key={c.k}>
                    <a href={qs(base, filters, { category: filters.category === c.k ? undefined : c.k })} className="block">
                      <span className="flex justify-between text-ink-soft">
                        <span className={filters.category === c.k ? "font-semibold text-ink" : ""}>{label(CATEGORIES, c.k, lang)}</span>
                        <span className="font-semibold text-ink">{c.n}</span>
                      </span>
                      <span className="mt-1 block h-1.5 rounded-full bg-ink/10">
                        <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(c.n / maxCat) * 100}%` }} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </Container>

      {/* ── Recent records ── */}
      <Container className="pb-6 xl:!max-w-[1360px]">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-ink">{d.recent}</h2>
          {data.records.length > 4 ? (
            <a href="#hm-all" className="text-sm font-semibold text-accent-ink hover:underline">
              {d.viewAll} →
            </a>
          ) : null}
        </div>
        {recent.length === 0 ? (
          <p className="rounded-2xl border border-line bg-paper-2 p-8 text-muted">{t.noRecords}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recent.map((r) => (
              <RecordCard key={r.id} r={r} lang={lang} compact />
            ))}
          </ul>
        )}
      </Container>

      {/* ── All records ── */}
      {data.records.length > 4 ? (
        <Container className="pb-10 pt-8 xl:!max-w-[1360px]">
          <div id="hm-all" className="scroll-mt-24" />
          <h2 className="mb-5 text-2xl font-bold text-ink">
            {t.records} <span className="text-muted">({data.records.length})</span>
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {data.records.slice(4).map((r) => (
              <RecordCard key={r.id} r={r} lang={lang} />
            ))}
          </ul>
        </Container>
      ) : null}

      <Container className="pb-14 xl:!max-w-[1360px]">
        <p className="rounded-2xl border border-line bg-paper-2 p-4 text-sm text-muted">{t.limits}</p>
      </Container>
      <script data-keep src="/vendor/hatemap.js?v=9" defer />
    </div>
  );
}

function RecordCard({ r, lang, compact = false }: { r: HmRecord; lang: Lang; compact?: boolean }) {
  const t = HM[lang];
  const loc = localized(r, lang);
  const v = VERIFICATION.find((x) => x.key === r.verification);
  const links = evidence(r).filter((e) => e.public);
  const anchor = r.public_id ?? `r${r.id}`;
  return (
    <li id={anchor} className="flex scroll-mt-24 flex-col rounded-2xl border border-line bg-paper-2 p-5 transition hover:border-brand-500/60" lang={loc.fallback ? HTML_LANG.sq : undefined}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold uppercase tracking-wide ${r.verification === "verified" ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"}`} title={v?.hint?.[lang]}>
          {r.verification === "verified" ? <Icon name="check" className="h-3.5 w-3.5" /> : null}
          {v?.label[lang]}
        </span>
        <span className="text-muted">{publicMonth(r.occurred_on, lang)}</span>
      </div>
      <h3 className="mt-3 text-lg font-bold leading-snug text-ink">{loc.title}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
        <Icon name="pin" className="h-4 w-4" />
        {municipalityName(r.municipality, lang)}
        {r.affected_group ? ` · ${label(GROUPS, r.affected_group, lang)}` : ""}
      </p>
      <p className={`mt-3 text-sm leading-relaxed text-ink-soft ${compact ? "line-clamp-3" : "whitespace-pre-line"}`}>{loc.summary}</p>
      {!compact && links.length ? (
        <p className="mt-3 text-sm">
          <span className="text-muted">{t.evidence}: </span>
          {links.map((e, i) => (
            <span key={e.url}>
              {i ? " · " : ""}
              <a href={e.url} rel="noopener nofollow ugc" target="_blank" className="font-medium text-accent-ink underline-offset-2 hover:underline">
                {e.label || new URL(e.url).hostname}
              </a>
            </span>
          ))}
        </p>
      ) : null}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${CATEGORY_TONE[r.category] ?? CATEGORY_TONE.other}`}>{label(CATEGORIES, r.category, lang)}</span>
        <span className="text-[11px] text-muted">
          {r.public_id}
          {loc.fallback ? ` · ${t.translationNote}` : ""}
        </span>
      </div>
    </li>
  );
}

/** Kosovo map used as a municipality picker on the report form (click fills the select; JS enhancement). */
function PickerMap({ lang }: { lang: Lang }) {
  const muni = KOSOVO.municipalities as Record<string, { d: string; cx: number; cy: number }>;
  return (
    <svg viewBox={KOSOVO.viewBox} data-viewbox={KOSOVO.viewBox} role="group" aria-label={HM[lang].municipality} className="h-full w-full select-none" id="hm-picker">
      {Object.keys(muni).map((k) => (
        <path key={k} d={muni[k].d} className="hm-shape hm-pick" data-pick={k}>
          <title>{municipalityName(k, lang)}</title>
        </path>
      ))}
      {["prishtine", "prizren", "peje", "gjakove", "mitrovice_veriut", "ferizaj", "gjilan"].map((k) => (
        <text key={`l-${k}`} x={muni[k].cx} y={muni[k].cy + 4} textAnchor="middle" className="hm-label">
          {municipalityName(k, lang)}
        </text>
      ))}
    </svg>
  );
}

const STEP = {
  sq: ["Çfarë ndodhi", "Ku dhe kur", "Burimi dhe kontakti (opsionale)", "Klikoni komunën në hartë ose zgjidheni më poshtë"],
  en: ["What happened", "Where and when", "Source and contact (optional)", "Click the municipality on the map or choose it below"],
  sr: ["Šta se dogodilo", "Gde i kada", "Izvor i kontakt (opciono)", "Kliknite opštinu na mapi ili je izaberite ispod"],
} as const;

export function HatemapReport({ lang, status }: { lang: Lang; status?: string }) {
  const t = HM[lang];
  const steps = STEP[lang];
  const field = "hm-field mt-1.5";
  const helpBox = (
    <div className="rounded-3xl border border-line bg-paper-2 p-5 text-sm">
      <h2 className="text-lg font-bold text-ink">{t.help}</h2>
      <ul className="mt-3 grid gap-2">
        {t.helpItems.map(([k, v]) => (
          <li key={k} className="flex items-center justify-between gap-3 rounded-xl bg-ink/5 px-3 py-2">
            <span className="text-ink-soft">{k}</span>
            <strong className="text-ink">{v}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
  if (status === "ok") {
    return (
      <div className="hm-dash">
        <Container className="max-w-3xl py-16">
          <div className="rounded-3xl border border-line bg-paper-2 p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
              <Icon name="check" className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-3xl font-extrabold text-ink">{t.thanksTitle}</h1>
            <p className="mt-3 text-lg text-ink-soft">{t.thanks}</p>
          </div>
          <div className="mt-6">{helpBox}</div>
          <p className="mt-8">
            <a href={hatemapPath(lang)} className="font-semibold text-accent-ink hover:underline">
              ← {t.title}
            </a>
          </p>
        </Container>
      </div>
    );
  }
  const Step = ({ n, title }: { n: number; title: string }) => (
    <h2 className="flex items-center gap-3 text-base font-bold text-ink">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-extrabold text-[#101828]">{n}</span>
      {title}
    </h2>
  );
  return (
    <div className="hm-dash">
      <Container className="grid gap-6 py-10 lg:grid-cols-12 lg:py-14 xl:!max-w-[1360px]">
        <div className="lg:col-span-7">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">
            <span aria-hidden className="inline-block h-[3px] w-8 bg-accent" /> EX-Sbunker HateMap
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{t.reportTitle}</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">{t.reportLead}</p>
          {status === "error" || status === "limit" ? (
            <p role="alert" className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {status === "limit" ? t.tooMany : t.error}
            </p>
          ) : null}

          <form method="post" action="/api/hatemap/report/" className="mt-8 grid gap-6 rounded-3xl border border-line bg-paper-2 p-6 sm:p-8">
            <input type="hidden" name="lang" value={lang} />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

            <Step n={1} title={steps[0]} />
            <label className="text-sm font-medium text-ink">
              {t.category} *
              <span className={field}>
                <Icon name="tag" />
                <select name="category" required defaultValue="">
                  <option value="" disabled>
                    {t.choose}
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label[lang]}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <label className="text-sm font-medium text-ink">
              {t.what} *<span className="block text-xs font-normal text-muted">{t.whatHint}</span>
              <textarea
                name="description"
                required
                minLength={10}
                maxLength={3000}
                rows={6}
                className="mt-1.5 w-full rounded-xl border border-line bg-ink/[0.03] px-4 py-3 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </label>

            <div className="h-px bg-line" />
            <Step n={2} title={steps[1]} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ink">
                {t.municipality} *
                <span className={field}>
                  <Icon name="pin" />
                  <select name="municipality" required defaultValue="" id="hm-pick-select">
                    <option value="" disabled>
                      {t.choose}
                    </option>
                    <option value="unknown">{t.unknown}</option>
                    {MUNICIPALITIES.map((m) => ({ key: m.key, label: municipalityName(m.key, lang) }))
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((m) => (
                        <option key={m.key} value={m.key}>
                          {m.label}
                        </option>
                      ))}
                  </select>
                </span>
              </label>
              <label className="text-sm font-medium text-ink">
                {t.when}
                <span className={field}>
                  <Icon name="cal" />
                  <MonthSelect name="occurred_on" lang={lang} emptyLabel={t.unknown} className="" />
                </span>
              </label>
            </div>

            <div className="h-px bg-line" />
            <Step n={3} title={steps[2]} />
            <label className="text-sm font-medium text-ink">
              {t.link}
              <span className="block text-xs font-normal text-muted">{t.linkHint}</span>
              <span className={field}>
                <Icon name="source" />
                <input name="source_url" type="url" maxLength={500} placeholder="https://" />
              </span>
            </label>
            <label className="text-sm font-medium text-ink">
              {t.contact}
              <span className="block text-xs font-normal text-muted">{t.contactHint}</span>
              <span className={field}>
                <Icon name="users" />
                <input name="contact" type="email" maxLength={200} />
              </span>
            </label>
            <label className="flex items-center justify-between gap-4 text-sm text-ink-soft">
              {t.consent}
              <input type="checkbox" name="contact_ok" value="1" className="hm-switch" />
            </label>
            <div>
              <button className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-[#101828] shadow-[0_10px_30px_-10px_rgba(247,144,9,0.8)] hover:bg-brand-400">
                <Icon name="shield" /> {t.send}
              </button>
            </div>
          </form>
        </div>

        <aside className="grid content-start gap-4 lg:col-span-5">
          <section className="rounded-3xl border border-line bg-paper-2 p-5">
            <h2 className="text-lg font-bold text-ink">{t.municipality}</h2>
            <p className="text-sm text-muted">{steps[3]}</p>
            <div id="hm-pick-stage" className="relative mt-3 aspect-[620/666] w-full overflow-hidden rounded-2xl" style={{ background: "var(--hm-stage)" }}>
              <div className="absolute inset-0 p-2">
                <PickerMap lang={lang} />
              </div>
              {/* Shown by hatemap.js once the map is zoomed to a municipality */}
              <button type="button" data-hm-pick-home hidden aria-label={DASH[lang].home} title={DASH[lang].home} className="hm-ctl absolute bottom-3 right-3">
                <Icon name="home" />
              </button>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink" id="hm-pick-name" aria-live="polite" />
          </section>
          <div className="rounded-3xl border border-accent/40 bg-accent/10 p-5 text-sm text-ink">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Icon name="shield" /> {t.warnTitle}
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
              {t.warn.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          {helpBox}
          <p className="text-sm">
            <a href={hatemapPath(lang, "methodology")} className="font-semibold text-accent-ink hover:underline">
              {t.methodology} →
            </a>
          </p>
        </aside>
      </Container>
      <script data-keep src="/vendor/hatemap.js?v=9" defer />
    </div>
  );
}

const METHOD: Record<Lang, { title: string; sections: { h: string; p: string[] }[] }> = {
  sq: {
    title: "Metodologjia e HateMap",
    sections: [
      { h: "Çfarë regjistrojmë", p: ["HateMap regjistron incidente, kërcënime, diskriminim, gjuhë urrejtjeje, përmbajtje të dëmshme online, narrativa ekstremiste e anti-gjinore dhe sinjale dezinformimi që prekin grupe në Kosovë. Çdo regjistrim ka kategori, grup të prekur, lloj burimi, komunë, muaj dhe status verifikimi."] },
      { h: "Si verifikojmë", p: ["Asnjë raport nuk publikohet automatikisht. Çdo raport shqyrtohet nga staf i trajnuar dhe merr një nga statuset e verifikimit më poshtë. Ne i dallojmë qartë incidentet e verifikuara nga pretendimet, narrativat dhe sinjalet."] },
      { h: "Mbrojtja e njerëzve", p: ["Nuk publikojmë adresa, emra, të dhëna personale ose detaje që mund të identifikojnë viktimat apo raportuesit. Vendndodhja tregohet vetëm në nivel komune dhe data vetëm në nivel muaji. Askush nuk etiketohet publikisht si autor pa bazë të mjaftueshme provash dhe ligjore. Rastet që përfshijnë fëmijë, të mbijetuar të dhunës ose persona të cenueshëm kalojnë shqyrtim të shtuar."] },
      { h: "Korrigjime dhe heqje", p: ["Nëse mendoni se një regjistrim është i pasaktë ose ju rrezikon, na kontaktoni. Ne e shqyrtojmë kërkesën, e korrigjojmë ose e heqim regjistrimin, dhe çdo ndryshim ruhet në regjistrin e auditimit."] },
      { h: "Kufizimet", p: ["HateMap nuk është shërbim emergjence, bazë të dhënash e policisë apo regjistër gjyqësor dhe nuk mat përhapjen e plotë të urrejtjes në Kosovë. Numrat pasqyrojnë vetëm rastet e shqyrtuara dhe të publikuara."] },
    ],
  },
  en: {
    title: "HateMap methodology",
    sections: [
      { h: "What we record", p: ["HateMap records incidents, threats, discrimination, hate speech, harmful online content, extremist and anti-gender narratives and disinformation signals affecting groups in Kosovo. Every record has a category, affected group, source type, municipality, month and verification status."] },
      { h: "How we verify", p: ["No report is published automatically. Every report is reviewed by trained staff and receives one of the verification statuses below. We clearly distinguish verified incidents from allegations, narratives and signals."] },
      { h: "Protecting people", p: ["We do not publish addresses, names, personal data or details that could identify victims or reporters. Location is shown at municipality level only and the date at month level only. No one is publicly labelled as a perpetrator without an adequate evidentiary and legal basis. Cases involving minors, survivors of violence or vulnerable people receive enhanced review."] },
      { h: "Corrections and removal", p: ["If you believe a record is inaccurate or puts you at risk, contact us. We review the request, correct or remove the record, and every change is kept in the audit log."] },
      { h: "Limitations", p: ["HateMap is not an emergency service, a police database or a court record, and it does not measure the overall prevalence of hate in Kosovo. Figures reflect only reviewed and published cases."] },
    ],
  },
  sr: {
    title: "Metodologija HateMap",
    sections: [
      { h: "Šta beležimo", p: ["HateMap beleži incidente, pretnje, diskriminaciju, govor mržnje, štetan onlajn sadržaj, ekstremističke i anti-rodne narative i signale dezinformacija koji pogađaju grupe na Kosovu. Svaki zapis ima kategoriju, pogođenu grupu, vrstu izvora, opštinu, mesec i status verifikacije."] },
      { h: "Kako proveravamo", p: ["Nijedna prijava se ne objavljuje automatski. Svaku prijavu pregleda obučeno osoblje i dobija jedan od statusa verifikacije navedenih ispod. Jasno razlikujemo verifikovane incidente od navoda, narativa i signala."] },
      { h: "Zaštita ljudi", p: ["Ne objavljujemo adrese, imena, lične podatke ili detalje koji mogu identifikovati žrtve ili prijavioce. Lokacija se prikazuje samo na nivou opštine, a datum samo na nivou meseca. Niko se javno ne označava kao počinilac bez odgovarajućeg dokaznog i pravnog osnova. Slučajevi koji uključuju maloletnike, preživele nasilja ili ranjive osobe prolaze pojačan pregled."] },
      { h: "Ispravke i uklanjanje", p: ["Ako smatrate da je neki zapis netačan ili vas izlaže riziku, kontaktirajte nas. Pregledamo zahtev, ispravljamo ili uklanjamo zapis, a svaka promena se čuva u evidenciji izmena."] },
      { h: "Ograničenja", p: ["HateMap nije hitna služba, policijska baza podataka niti sudska evidencija i ne meri ukupnu rasprostranjenost mržnje na Kosovu. Brojevi odražavaju samo pregledane i objavljene slučajeve."] },
    ],
  },
};

/* Methodology page: interactive without JavaScript (radio tabs + <details>), same look as the map dashboard. */
const MX = {
  sq: {
    eyebrow: "Si funksionon HateMap",
    glance: [["0", "raporte të publikuara automatikisht"], ["38", "komuna: vendndodhja më e saktë që shfaqet"], ["1 muaj", "data më e saktë që shfaqet"], ["5", "nivele verifikimi"]],
    processTitle: "Nga raporti te harta",
    processSub: "Çdo regjistrim kalon nëpër të njëjtat pesë hapa. Zgjidhni një hap.",
    step: "Hapi",
    steps: [
      ["Raportimi", "Kushdo mund të dërgojë një raport, edhe në mënyrë anonime. Ekipi ynë regjistron raste edhe nga monitorimi i mediave, partnerët dhe hulumtimet."],
      ["Shqyrtimi", "Një moderator i trajnuar lexon çdo raport, heq të dhënat personale dhe e klasifikon sipas kategorisë, grupit të prekur, burimit dhe komunës."],
      ["Verifikimi", "Kërkojmë konfirmim të pavarur dhe caktojmë një nga pesë nivelet e verifikimit. Pretendimet nuk paraqiten kurrë si fakte."],
      ["Publikimi", "Publikimi kërkon vendim të moderatorit dhe arsyetim me shkrim. Regjistrimet tregojnë vetëm komunën dhe muajin; nëse detajet mund ta rrezikojnë dikë, regjistrimi publikohet i redaktuar."],
      ["Korrigjimi", "Kushdo mund të kërkojë korrigjim, ankim ose heqje. Çdo ndryshim arsyetohet dhe ruhet në një regjistër auditimi që nuk mund të ndryshohet."],
    ],
    verifyTitle: "Pesë nivele verifikimi",
    verifySub: "Çdo regjistrim i publikuar tregon sa të sigurt jemi. Hapni një nivel për të parë çfarë do të thotë.",
    certainty: "Siguria",
    protectTitle: "Mbrojtja e njerëzve",
    protect: [
      ["pin", "Vetëm komuna", "Asnjëherë adresa apo vendi i saktë."],
      ["cal", "Vetëm muaji", "Asnjëherë dita e saktë."],
      ["users", "Pa emra", "Pa emra, foto apo detaje që identifikojnë viktimat ose raportuesit."],
      ["shield", "Pa etiketa pa prova", "Askush nuk quhet autor pa bazë të mjaftueshme provash dhe ligjore."],
      ["check", "Kujdes i shtuar", "Rastet me fëmijë, të mbijetuar të dhunës ose persona të cenueshëm kalojnë shqyrtim shtesë."],
      ["doc", "Kontakti fshihet", "Të dhënat e kontaktit të raportuesit fshihen 6 muaj pas mbylljes së rastit."],
    ],
    classifyTitle: "Si klasifikojmë",
    classifySub: "Çdo regjistrim merr një kategori, një grup të prekur dhe një lloj burimi.",
    ctaTitle: "Keni parë diçka?",
    ctaText: "Raportojeni. Ekipi ynë shqyrton çdo raport dhe asgjë nuk publikohet pa verifikim.",
    mapLink: "Hap hartën",
  },
  en: {
    eyebrow: "How HateMap works",
    glance: [["0", "reports published automatically"], ["38", "municipalities: the most precise location shown"], ["1 month", "the most precise date shown"], ["5", "verification levels"]],
    processTitle: "From report to map",
    processSub: "Every record goes through the same five steps. Select a step.",
    step: "Step",
    steps: [
      ["Report", "Anyone can send a report, anonymously if they wish. Our team also records cases from media monitoring, partners and research."],
      ["Review", "A trained moderator reads every report, removes personal data and classifies it by category, affected group, source and municipality."],
      ["Verify", "We look for independent confirmation and assign one of five verification levels. Allegations are never presented as facts."],
      ["Publish", "Publishing needs a moderator's decision and a written reason. Records show only the municipality and month; if details could put someone at risk, the record is published redacted."],
      ["Correct", "Anyone can ask for a correction, appeal or removal. Every change is explained and kept in an audit log that cannot be altered."],
    ],
    verifyTitle: "Five levels of verification",
    verifySub: "Each published record shows how certain we are. Open a level to see what it means.",
    certainty: "Certainty",
    protectTitle: "Protecting people",
    protect: [
      ["pin", "Municipality only", "Never an address or exact place."],
      ["cal", "Month only", "Never the exact day."],
      ["users", "No names", "No names, photos or details that identify victims or reporters."],
      ["shield", "No labels without proof", "No one is named as a perpetrator without an adequate evidentiary and legal basis."],
      ["check", "Extra care", "Cases involving minors, survivors of violence or vulnerable people get an additional review."],
      ["doc", "Contact erased", "A reporter's contact details are deleted 6 months after the case is closed."],
    ],
    classifyTitle: "How we classify",
    classifySub: "Every record gets one category, one affected group and one source type.",
    ctaTitle: "Seen something?",
    ctaText: "Report it. Our team reviews every report, and nothing is published without verification.",
    mapLink: "Open the map",
  },
  sr: {
    eyebrow: "Kako HateMap funkcioniše",
    glance: [["0", "prijava objavljenih automatski"], ["38", "opština: najpreciznija prikazana lokacija"], ["1 mesec", "najprecizniji prikazani datum"], ["5", "nivoa verifikacije"]],
    processTitle: "Od prijave do mape",
    processSub: "Svaki zapis prolazi kroz istih pet koraka. Izaberite korak.",
    step: "Korak",
    steps: [
      ["Prijava", "Svako može poslati prijavu, i anonimno. Naš tim beleži slučajeve i iz praćenja medija, od partnera i iz istraživanja."],
      ["Pregled", "Obučeni moderator čita svaku prijavu, uklanja lične podatke i razvrstava je po kategoriji, pogođenoj grupi, izvoru i opštini."],
      ["Provera", "Tražimo nezavisnu potvrdu i dodeljujemo jedan od pet nivoa verifikacije. Navodi se nikada ne predstavljaju kao činjenice."],
      ["Objava", "Za objavu je potrebna odluka moderatora i pisano obrazloženje. Zapisi prikazuju samo opštinu i mesec; ako bi detalji mogli nekoga da ugroze, zapis se objavljuje redigovan."],
      ["Ispravka", "Svako može zatražiti ispravku, žalbu ili uklanjanje. Svaka promena se obrazlaže i čuva u evidenciji izmena koja se ne može menjati."],
    ],
    verifyTitle: "Pet nivoa verifikacije",
    verifySub: "Svaki objavljeni zapis pokazuje koliko smo sigurni. Otvorite nivo da vidite šta znači.",
    certainty: "Sigurnost",
    protectTitle: "Zaštita ljudi",
    protect: [
      ["pin", "Samo opština", "Nikada adresa ili tačno mesto."],
      ["cal", "Samo mesec", "Nikada tačan dan."],
      ["users", "Bez imena", "Bez imena, fotografija ili detalja koji identifikuju žrtve ili prijavioce."],
      ["shield", "Bez etiketa bez dokaza", "Niko se ne označava kao počinilac bez odgovarajućeg dokaznog i pravnog osnova."],
      ["check", "Dodatna pažnja", "Slučajevi sa maloletnicima, preživelima nasilja ili ranjivim osobama prolaze dodatni pregled."],
      ["doc", "Kontakt se briše", "Kontakt podaci prijavioca brišu se 6 meseci nakon zatvaranja slučaja."],
    ],
    classifyTitle: "Kako razvrstavamo",
    classifySub: "Svaki zapis dobija jednu kategoriju, jednu pogođenu grupu i jednu vrstu izvora.",
    ctaTitle: "Videli ste nešto?",
    ctaText: "Prijavite. Naš tim pregleda svaku prijavu i ništa se ne objavljuje bez provere.",
    mapLink: "Otvori mapu",
  },
} as const;

const VERIFY_COLOR: Record<string, string> = { verified: "#12b76a", credible: "#2e90fa", allegation: "#f79009", narrative: "#9e77ed", signal: "#98a2b3" };
const STEP_ICON = ["shield", "doc", "check", "map", "book"] as const;

export function HatemapMethodology({ lang }: { lang: Lang }) {
  const m = METHOD[lang];
  const x = MX[lang];
  const t = HM[lang];
  const tabs: [string, string, Option[]][] = [
    ["cat", t.category, CATEGORIES],
    ["grp", t.group, GROUPS],
    ["src", t.source, SOURCES],
  ];
  const card = "rounded-3xl border border-line bg-paper-2";
  return (
    <div className="hm-dash">
      {/* ── Hero ── */}
      <Container className="grid gap-8 py-10 lg:grid-cols-12 lg:py-14 xl:!max-w-[1360px]">
        <div className="lg:col-span-7">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">
            <span aria-hidden className="inline-block h-[3px] w-8 bg-brand-500" /> {x.eyebrow}
          </p>
          <h1 className="font-sans text-4xl font-extrabold leading-[1.04] tracking-tight text-ink sm:text-5xl xl:text-6xl">{m.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{m.sections[0].p[0]}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={hatemapPath(lang)} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-[#101828] shadow-[0_10px_30px_-10px_rgba(247,144,9,0.8)] hover:bg-brand-400">
              <Icon name="map" /> {x.mapLink}
            </a>
            <a href={hatemapPath(lang, "report")} className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 font-semibold text-ink hover:border-brand-400">
              <Icon name="shield" /> {t.report}
            </a>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-px self-end overflow-hidden rounded-2xl border border-line bg-ink/10 lg:col-span-5">
          {x.glance.map(([v, l]) => (
            <div key={l} className="bg-paper-2 px-5 py-5">
              <dd className="text-3xl font-extrabold tracking-tight text-brand-500">{v}</dd>
              <dt className="mt-1 text-sm text-muted">{l}</dt>
            </div>
          ))}
        </dl>
      </Container>

      {/* ── Process: radio tabs, CSS shows the chosen step (styles.css .hm-steps) ── */}
      <Container className="pb-12 xl:!max-w-[1360px]">
        <section className={`hm-steps ${card} p-5 sm:p-8`} aria-labelledby="hm-process">
          <h2 id="hm-process" className="text-2xl font-bold text-ink">{x.processTitle}</h2>
          <p className="mt-1 text-sm text-muted">{x.processSub}</p>
          <div className="hm-progress mt-6" aria-hidden>
            <span />
          </div>
          <div role="radiogroup" aria-label={x.processTitle} className="mt-4 grid grid-cols-5 gap-2">
            {x.steps.map(([name], i) => (
              <span key={name} className="contents">
                <input type="radio" name="hm-step" id={`hm-step-${i + 1}`} className="sr-only" defaultChecked={i === 0} />
                <label htmlFor={`hm-step-${i + 1}`} className="hm-step-tab">
                  <span className="hm-step-num">{i + 1}</span>
                  <span className="hidden text-sm font-semibold sm:block">{name}</span>
                </label>
              </span>
            ))}
          </div>
          {x.steps.map(([name, text], i) => (
            <div key={name} className="hm-step-panel mt-6 rounded-2xl bg-ink/[0.04] p-5 sm:p-6" data-step={i + 1}>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500">
                  <Icon name={STEP_ICON[i]} className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    {x.step} {i + 1} / 5
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-ink">{name}</h3>
                  <p className="mt-2 max-w-3xl leading-relaxed text-ink-soft">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </Container>

      {/* ── Verification levels ── */}
      <Container className="grid gap-6 pb-12 lg:grid-cols-12 xl:!max-w-[1360px]">
        <div className="lg:col-span-4">
          <h2 className="text-2xl font-bold text-ink">{x.verifyTitle}</h2>
          <p className="mt-2 leading-relaxed text-ink-soft">{x.verifySub}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{m.sections[1].p[0]}</p>
        </div>
        <div className="grid content-start gap-3 lg:col-span-8">
          {VERIFICATION.map((v, i) => (
            <details key={v.key} className={`hm-acc ${card} rounded-2xl`} open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center gap-4 p-4 sm:p-5">
                <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: VERIFY_COLOR[v.key] }} />
                <span className="flex-1 font-semibold text-ink">{v.label[lang]}</span>
                <span className="hidden items-center gap-1 sm:flex" title={x.certainty} aria-label={`${x.certainty}: ${5 - i}/5`}>
                  {[0, 1, 2, 3, 4].map((d) => (
                    <span key={d} className="h-1.5 w-5 rounded-full" style={{ background: d < 5 - i ? VERIFY_COLOR[v.key] : "color-mix(in srgb, var(--ink) 12%, transparent)" }} />
                  ))}
                </span>
                <span aria-hidden className="hm-acc-chev text-muted">
                  <Icon name="plus" className="h-4 w-4" />
                </span>
              </summary>
              {v.hint ? <p className="px-4 pb-5 pl-[3.25rem] text-ink-soft sm:px-5 sm:pl-[3.4rem]">{v.hint[lang]}</p> : null}
            </details>
          ))}
        </div>
      </Container>

      {/* ── Protecting people ── */}
      <Container className="pb-12 xl:!max-w-[1360px]">
        <h2 className="text-2xl font-bold text-ink">{x.protectTitle}</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {x.protect.map(([icon, h, p]) => (
            <li key={h} className={`${card} flex gap-4 rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-brand-500/60`}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500">
                <Icon name={icon as keyof typeof ICONS} />
              </span>
              <div>
                <h3 className="font-semibold text-ink">{h}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{p}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      {/* ── Classification: radio tabs ── */}
      <Container className="pb-12 xl:!max-w-[1360px]">
        <section className={`hm-tabs ${card} p-5 sm:p-8`} aria-labelledby="hm-classify">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="hm-classify" className="text-2xl font-bold text-ink">{x.classifyTitle}</h2>
              <p className="mt-1 text-sm text-muted">{x.classifySub}</p>
            </div>
            <div role="radiogroup" aria-label={x.classifyTitle} className="flex flex-wrap gap-1 rounded-xl bg-ink/5 p-1 text-sm font-semibold">
              {tabs.map(([id, name], i) => (
                <span key={id} className="contents">
                  <input type="radio" name="hm-tab" id={`hm-tab-${id}`} className="sr-only" defaultChecked={i === 0} />
                  <label htmlFor={`hm-tab-${id}`} className="hm-tab">
                    {name}
                  </label>
                </span>
              ))}
            </div>
          </div>
          {tabs.map(([id, , opts]) => (
            <ul key={id} className="hm-tab-panel mt-6 flex-wrap gap-2.5" data-tab={id}>
              {opts.map((o) => (
                <li
                  key={o.key}
                  title={o.hint?.[lang]}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${id === "cat" ? (CATEGORY_TONE[o.key] ?? CATEGORY_TONE.other) : "border border-line text-ink hover:border-brand-500/60"}`}
                >
                  {o.label[lang]}
                </li>
              ))}
            </ul>
          ))}
        </section>
      </Container>

      {/* ── Corrections + limitations ── */}
      <Container className="grid gap-4 pb-12 md:grid-cols-2 xl:!max-w-[1360px]">
        <section className={`${card} p-6`}>
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
            <Icon name="check" /> {m.sections[3].h}
          </h2>
          <p className="mt-3 leading-relaxed text-ink-soft">{m.sections[3].p[0]}</p>
          <a href={hatemapPath(lang, "request")} className="mt-4 inline-block font-semibold text-accent-ink hover:underline">
            {HATEMAP_REQUEST_LINK[lang]} →
          </a>
        </section>
        <section className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
            <Icon name="book" /> {m.sections[4].h}
          </h2>
          <p className="mt-3 leading-relaxed text-ink-soft">{m.sections[4].p[0]}</p>
        </section>
      </Container>

      {/* ── Call to action ── */}
      <Container className="pb-14 xl:!max-w-[1360px]">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#101828] p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold">{x.ctaTitle}</h2>
            <p className="mt-2 max-w-xl text-[#cecfd2]">{x.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={hatemapPath(lang, "report")} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-[#101828] hover:bg-brand-400">
              <Icon name="shield" /> {t.report}
            </a>
            <a href={routePath("contact", lang)} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-semibold text-white hover:border-brand-400">
              {CONTACT_LABEL[lang]} →
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}

export const HATEMAP_TITLES = { index: (l: Lang) => HM[l].title, report: (l: Lang) => HM[l].reportTitle, methodology: (l: Lang) => METHOD[l].title, lead: (l: Lang) => HM[l].lead };

/* ───────────── Front-page card (same map design, compact) ───────────── */
const MINI = {
  sq: { title: "HateMap", sub: "Regjistrimet e publikuara sipas komunës", open: "Hap hartën", report: "Raporto", records: "regjistrime", verified: "të verifikuara" },
  en: { title: "HateMap", sub: "Published records by municipality", open: "Open the map", report: "Report", records: "records", verified: "verified" },
  sr: { title: "HateMap", sub: "Objavljeni zapisi po opštinama", open: "Otvori mapu", report: "Prijavi", records: "zapisa", verified: "verifikovanih" },
} as const;

export async function HatemapMiniCard({ lang }: { lang: Lang }) {
  const m = MINI[lang];
  const data = await listPublic({}, lang, 1);
  return (
    <section aria-label={m.title} className="flex flex-col rounded-3xl border border-line bg-paper-2 p-5 shadow-[0_30px_70px_-40px_rgba(247,144,9,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">{m.title}</h2>
          <p className="text-sm text-muted">{m.sub}</p>
        </div>
        <p className="text-right text-sm text-muted">
          <span className="block text-2xl font-extrabold text-ink">{data.totalPublished}</span>
          {m.records} · {data.verifiedCount} {m.verified}
        </p>
      </div>
      <div className="relative mt-3 aspect-[620/666] w-full overflow-hidden rounded-2xl" style={{ background: "var(--hm-stage)" }}>
        <div className="absolute inset-0 p-2">
          <KosovoMap lang={lang} counts={data.byMunicipality} filters={{}} />
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {(["high", "medium", "low", "none"] as const).map((lv) => (
          <li key={lv} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: LEVEL_COLOR[lv] }} />
            {DASH[lang][lv]}
          </li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a href={hatemapPath(lang)} className="rounded-xl border border-line px-4 py-2.5 text-center text-sm font-semibold text-ink hover:border-accent">
          {m.open} →
        </a>
        <a href={hatemapPath(lang, "report")} className="rounded-xl bg-accent px-4 py-2.5 text-center text-sm font-semibold text-[#101828] hover:bg-brand-400">
          {m.report}
        </a>
      </div>
    </section>
  );
}
