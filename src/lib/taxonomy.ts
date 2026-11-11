/**
 * HateMap taxonomy (Kosovo-specific classification framework).
 * Framework-free so it can be used by pages, admin and API routes.
 * Keys are stored in the database; labels are trilingual.
 */
import type { Lang } from "@hatemap-host";

export type Label = Record<Lang, string>;
export type Option = { key: string; label: Label; hint?: Label };

/** What happened (incidents, threats, discrimination, online content, narratives, signals). */
export const CATEGORIES: Option[] = [
  { key: "violence", label: { sq: "Dhunë fizike", en: "Physical violence", sr: "Fizičko nasilje" } },
  { key: "threat", label: { sq: "Kërcënim ose frikësim", en: "Threat or intimidation", sr: "Pretnja ili zastrašivanje" } },
  { key: "vandalism", label: { sq: "Dëmtim prone ose simbolesh", en: "Vandalism or property damage", sr: "Vandalizam ili oštećenje imovine" } },
  { key: "discrimination", label: { sq: "Diskriminim", en: "Discrimination", sr: "Diskriminacija" } },
  { key: "hate_speech", label: { sq: "Gjuhë urrejtjeje publike", en: "Public hate speech", sr: "Javni govor mržnje" } },
  { key: "online", label: { sq: "Përmbajtje e dëmshme online", en: "Harmful online content", sr: "Štetan onlajn sadržaj" } },
  { key: "extremist_narrative", label: { sq: "Narrativë ekstremiste", en: "Extremist narrative", sr: "Ekstremistički narativ" } },
  { key: "anti_gender", label: { sq: "Narrativë anti-gjinore", en: "Anti-gender narrative", sr: "Anti-rodni narativ" } },
  { key: "disinformation", label: { sq: "Sinjal dezinformimi", en: "Disinformation signal", sr: "Signal dezinformacije" } },
  { key: "other", label: { sq: "Tjetër", en: "Other", sr: "Drugo" } },
];

/** Who was targeted (never individuals). */
export const GROUPS: Option[] = [
  { key: "albanian", label: { sq: "Shqiptarët", en: "Albanians", sr: "Albanci" } },
  { key: "serb", label: { sq: "Serbët", en: "Serbs", sr: "Srbi" } },
  { key: "rae", label: { sq: "Romët, ashkalitë, egjiptianët", en: "Roma, Ashkali, Egyptians", sr: "Romi, Aškalije, Egipćani" } },
  { key: "bosniak", label: { sq: "Boshnjakët", en: "Bosniaks", sr: "Bošnjaci" } },
  { key: "turkish", label: { sq: "Turqit", en: "Turks", sr: "Turci" } },
  { key: "gorani", label: { sq: "Goranët", en: "Gorani", sr: "Goranci" } },
  { key: "religious", label: { sq: "Komunitet fetar", en: "Religious community", sr: "Verska zajednica" } },
  { key: "women", label: { sq: "Gratë", en: "Women", sr: "Žene" } },
  { key: "lgbti", label: { sq: "Personat LGBTI+", en: "LGBTI+ people", sr: "LGBTI+ osobe" } },
  { key: "journalists", label: { sq: "Gazetarët dhe media", en: "Journalists and media", sr: "Novinari i mediji" } },
  { key: "activists", label: { sq: "Aktivistët dhe shoqëria civile", en: "Activists and civil society", sr: "Aktivisti i civilno društvo" } },
  { key: "political", label: { sq: "Aktorë politikë", en: "Political actors", sr: "Politički akteri" } },
  { key: "migrants", label: { sq: "Migrantët dhe refugjatët", en: "Migrants and refugees", sr: "Migranti i izbeglice" } },
  { key: "disability", label: { sq: "Personat me aftësi të kufizuara", en: "Persons with disabilities", sr: "Osobe sa invaliditetom" } },
  { key: "youth", label: { sq: "Fëmijët dhe të rinjtë", en: "Children and youth", sr: "Deca i mladi" } },
  { key: "general", label: { sq: "Publiku i gjerë", en: "General public", sr: "Šira javnost" } },
  { key: "other", label: { sq: "Tjetër", en: "Other", sr: "Drugo" } },
];

export const SOURCES: Option[] = [
  { key: "sbunker", label: { sq: "Monitorimi i Sbunker", en: "Sbunker monitoring", sr: "Sbunker monitoring" } },
  { key: "media", label: { sq: "Raport mediatik", en: "Media report", sr: "Medijski izveštaj" } },
  { key: "civil_society", label: { sq: "Organizatë e shoqërisë civile", en: "Civil society organisation", sr: "Organizacija civilnog društva" } },
  { key: "institution", label: { sq: "Burim institucional", en: "Institutional source", sr: "Institucionalni izvor" } },
  { key: "social_media", label: { sq: "Monitorim i rrjeteve sociale", en: "Social media monitoring", sr: "Praćenje društvenih mreža" } },
  { key: "citizen", label: { sq: "Raport qytetar", en: "Citizen report", sr: "Prijava građana" } },
  { key: "partner", label: { sq: "Partner raportues", en: "Reporting partner", sr: "Partner za izveštavanje" } },
  { key: "research", label: { sq: "Hulumtim", en: "Research", sr: "Istraživanje" } },
];

/** Verification statuses (allegations ≠ verified incidents ≠ narratives ≠ signals). */
export const VERIFICATION: Option[] = [
  {
    key: "verified",
    label: { sq: "Incident i verifikuar", en: "Verified incident", sr: "Verifikovan incident" },
    hint: {
      sq: "Konfirmuar nga së paku dy burime të pavarura ose nga një burim zyrtar.",
      en: "Confirmed by at least two independent sources or an official source.",
      sr: "Potvrđeno iz najmanje dva nezavisna izvora ili iz zvaničnog izvora.",
    },
  },
  {
    key: "credible",
    label: { sq: "I besueshëm, i paverifikuar", en: "Credible, not yet verified", sr: "Verodostojno, neverifikovano" },
    hint: {
      sq: "Burim i besueshëm, por pa konfirmim të pavarur.",
      en: "Reliable source, but not independently confirmed.",
      sr: "Pouzdan izvor, ali bez nezavisne potvrde.",
    },
  },
  {
    key: "allegation",
    label: { sq: "Pretendim", en: "Allegation", sr: "Navod" },
    hint: {
      sq: "Pretendim publik që nuk është vërtetuar. Nuk nënkupton përgjegjësi të askujt.",
      en: "A public claim that has not been established. It does not imply anyone's responsibility.",
      sr: "Javna tvrdnja koja nije utvrđena. Ne podrazumeva ničiju odgovornost.",
    },
  },
  {
    key: "narrative",
    label: { sq: "Narrativë e dokumentuar", en: "Documented narrative", sr: "Dokumentovani narativ" },
    hint: {
      sq: "Narrativë e dëmshme e dokumentuar në hapësirën publike, jo një incident i vetëm.",
      en: "A harmful narrative documented in public space, not a single incident.",
      sr: "Štetan narativ dokumentovan u javnom prostoru, a ne pojedinačni incident.",
    },
  },
  {
    key: "signal",
    label: { sq: "Sinjal për hetim të mëtejshëm", en: "Signal for further investigation", sr: "Signal za dalju proveru" },
    hint: {
      sq: "Shenjë paralajmëruese e hershme që kërkon monitorim të mëtejshëm.",
      en: "An early-warning sign that requires further monitoring.",
      sr: "Rani znak upozorenja koji zahteva dalje praćenje.",
    },
  },
];

/** The 38 municipalities of Kosovo with approximate centroids (generalised location, never exact). */
export const MUNICIPALITIES: { key: string; sq: string; sr: string; lat: number; lon: number }[] = [
  { key: "prishtine", sq: "Prishtinë", sr: "Priština", lat: 42.663, lon: 21.165 },
  { key: "prizren", sq: "Prizren", sr: "Prizren", lat: 42.213, lon: 20.739 },
  { key: "peje", sq: "Pejë", sr: "Peć", lat: 42.659, lon: 20.288 },
  { key: "gjakove", sq: "Gjakovë", sr: "Đakovica", lat: 42.381, lon: 20.431 },
  { key: "mitrovice", sq: "Mitrovicë e Jugut", sr: "Južna Mitrovica", lat: 42.882, lon: 20.871 },
  { key: "mitrovice_veriut", sq: "Mitrovicë e Veriut", sr: "Severna Mitrovica", lat: 42.902, lon: 20.86 },
  { key: "ferizaj", sq: "Ferizaj", sr: "Uroševac", lat: 42.37, lon: 21.155 },
  { key: "gjilan", sq: "Gjilan", sr: "Gnjilane", lat: 42.464, lon: 21.469 },
  { key: "vushtrri", sq: "Vushtrri", sr: "Vučitrn", lat: 42.823, lon: 20.968 },
  { key: "podujeve", sq: "Podujevë", sr: "Podujevo", lat: 42.911, lon: 21.193 },
  { key: "suhareke", sq: "Suharekë", sr: "Suva Reka", lat: 42.359, lon: 20.825 },
  { key: "rahovec", sq: "Rahovec", sr: "Orahovac", lat: 42.399, lon: 20.654 },
  { key: "fushe_kosove", sq: "Fushë Kosovë", sr: "Kosovo Polje", lat: 42.636, lon: 21.093 },
  { key: "lipjan", sq: "Lipjan", sr: "Lipljan", lat: 42.524, lon: 21.126 },
  { key: "drenas", sq: "Drenas", sr: "Glogovac", lat: 42.624, lon: 20.894 },
  { key: "skenderaj", sq: "Skenderaj", sr: "Srbica", lat: 42.747, lon: 20.789 },
  { key: "malisheve", sq: "Malishevë", sr: "Mališevo", lat: 42.483, lon: 20.746 },
  { key: "kamenice", sq: "Kamenicë", sr: "Kamenica", lat: 42.578, lon: 21.58 },
  { key: "viti", sq: "Viti", sr: "Vitina", lat: 42.322, lon: 21.358 },
  { key: "decan", sq: "Deçan", sr: "Dečani", lat: 42.54, lon: 20.288 },
  { key: "istog", sq: "Istog", sr: "Istok", lat: 42.781, lon: 20.488 },
  { key: "kline", sq: "Klinë", sr: "Klina", lat: 42.622, lon: 20.578 },
  { key: "dragash", sq: "Dragash", sr: "Dragaš", lat: 42.062, lon: 20.653 },
  { key: "kacanik", sq: "Kaçanik", sr: "Kačanik", lat: 42.232, lon: 21.259 },
  { key: "shtime", sq: "Shtime", sr: "Štimlje", lat: 42.433, lon: 21.04 },
  { key: "obiliq", sq: "Obiliq", sr: "Obilić", lat: 42.687, lon: 21.07 },
  { key: "leposaviq", sq: "Leposaviq", sr: "Leposavić", lat: 43.103, lon: 20.802 },
  { key: "zubin_potok", sq: "Zubin Potok", sr: "Zubin Potok", lat: 42.914, lon: 20.689 },
  { key: "zvecan", sq: "Zveçan", sr: "Zvečan", lat: 42.907, lon: 20.84 },
  { key: "shterpce", sq: "Shtërpcë", sr: "Štrpce", lat: 42.24, lon: 21.027 },
  { key: "novoberde", sq: "Novobërdë", sr: "Novo Brdo", lat: 42.616, lon: 21.433 },
  { key: "gracanice", sq: "Graçanicë", sr: "Gračanica", lat: 42.6, lon: 21.193 },
  { key: "ranillug", sq: "Ranillug", sr: "Ranilug", lat: 42.492, lon: 21.599 },
  { key: "partesh", sq: "Partesh", sr: "Parteš", lat: 42.403, lon: 21.433 },
  { key: "kllokot", sq: "Kllokot", sr: "Klokot", lat: 42.367, lon: 21.374 },
  { key: "junik", sq: "Junik", sr: "Junik", lat: 42.476, lon: 20.278 },
  { key: "mamushe", sq: "Mamushë", sr: "Mamuša", lat: 42.325, lon: 20.727 },
  { key: "hani_elezit", sq: "Hani i Elezit", sr: "Elez Han", lat: 42.149, lon: 21.297 },
];

export function municipalityName(key: string | null | undefined, lang: Lang): string {
  const m = MUNICIPALITIES.find((x) => x.key === key);
  if (!m) return key ?? "";
  return lang === "sr" ? m.sr : m.sq;
}

export function label(list: Option[], key: string | null | undefined, lang: Lang): string {
  return list.find((o) => o.key === key)?.label[lang] ?? key ?? "";
}

export function isKey(list: Option[], key: unknown): key is string {
  return typeof key === "string" && list.some((o) => o.key === key);
}

export function isMunicipality(key: unknown): key is string {
  return typeof key === "string" && MUNICIPALITIES.some((m) => m.key === key);
}

export type AdminLang = "sq" | "en";

/** Publication rules (safeguarding). Returns the reasons a record cannot be published yet. */
export function publicationBlockers(
  r: { category?: string; source_type?: string; verification?: string; municipality?: string; occurred_on?: string; title_sq?: string | null; summary_sq?: string | null; sensitivity?: string },
  role: string,
  lang: AdminLang = "sq",
): string[] {
  const t = (sq: string, en: string) => (lang === "en" ? en : sq);
  const out: string[] = [];
  if (!isKey(CATEGORIES, r.category)) out.push(t("Mungon kategoria", "Category is missing"));
  if (!isKey(SOURCES, r.source_type)) out.push(t("Mungon lloji i burimit", "Source type is missing"));
  if (!isKey(VERIFICATION, r.verification)) out.push(t("Mungon statusi i verifikimit", "Verification status is missing"));
  if (!isMunicipality(r.municipality)) out.push(t("Mungon komuna", "Municipality is missing"));
  if (!/^\d{4}-\d{2}/.test(r.occurred_on ?? "")) out.push(t("Mungon data (viti dhe muaji)", "Date (year and month) is missing"));
  if (!r.title_sq?.trim() || !r.summary_sq?.trim()) out.push(t("Mungon titulli ose përmbledhja në shqip", "Albanian title or summary is missing"));
  if (r.sensitivity === "high" && role !== "admin") out.push(t("Rast me ndjeshmëri të lartë: kërkohet miratimi i administratorit", "High-sensitivity case: an administrator must approve publication"));
  return out;
}

/* ───────────── Roles and permissions (RBAC) ───────────── */
export const ROLES = {
  admin: { sq: "Administrator", en: "Administrator" },
  editor: { sq: "Redaktor", en: "Editor" },
  moderator: { sq: "Moderator", en: "Moderator" },
  analyst: { sq: "Analist", en: "Analyst" },
} as const;
export type Role = keyof typeof ROLES;

/** Single source of truth for who may do what. Admin always has every permission. */
export const PERMISSIONS = {
  content: { roles: ["editor"], sq: "Faqet, postimet, media dhe mesazhet", en: "Pages, posts, media and messages" },
  hatemap_read: { roles: ["moderator", "analyst"], sq: "Shikimi i regjistrimeve HateMap dhe statistikave", en: "View HateMap records and statistics" },
  hatemap_reports: { roles: ["moderator"], sq: "Raportet qytetare konfidenciale", en: "Confidential citizen reports" },
  hatemap_edit: { roles: ["moderator"], sq: "Klasifikimi dhe redaktimi i regjistrimeve", en: "Classify and edit records" },
  hatemap_publish: { roles: ["moderator"], sq: "Vendimet e publikimit (jo ndjeshmëri e lartë)", en: "Publication decisions (not high sensitivity)" },
  hatemap_publish_high: { roles: [], sq: "Publikimi i rasteve me ndjeshmëri të lartë", en: "Publish high-sensitivity cases" },
  cases: { roles: ["moderator"], sq: "Korrigjimet, ankesat dhe heqjet", en: "Corrections, appeals and removals" },
  audit: { roles: [], sq: "Regjistri i plotë i auditimit", en: "Full audit log" },
  users: { roles: [], sq: "Përdoruesit dhe rolet", en: "Users and roles" },
  security: { roles: [], sq: "Siguria, kopjet rezervë, incidentet", en: "Security, backups, incidents" },
} as const satisfies Record<string, { roles: readonly Role[]; sq: string; en: string }>;
export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | undefined | null, perm: Permission): boolean {
  if (!role) return false;
  return role === "admin" || (PERMISSIONS[perm].roles as readonly Role[]).includes(role);
}

/* ───────────── Publication workflow ───────────── */
export const RECORD_STATUSES = ["draft", "review", "published", "redacted", "rejected", "removed"] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export const RECORD_STATUS_LABEL: Record<RecordStatus, Record<AdminLang, string>> = {
  draft: { sq: "Draft", en: "Draft" },
  review: { sq: "Në shqyrtim", en: "In review" },
  published: { sq: "Publikuar", en: "Published" },
  redacted: { sq: "Publikuar i redaktuar", en: "Published, redacted" },
  rejected: { sq: "Refuzuar", en: "Rejected" },
  removed: { sq: "Hequr", en: "Taken down" },
};

/** Allowed transitions. Nothing reaches the public without an explicit human decision. */
export const TRANSITIONS: Record<RecordStatus, RecordStatus[]> = {
  draft: ["review", "rejected"],
  review: ["published", "redacted", "draft", "rejected"],
  published: ["redacted", "removed", "review"],
  redacted: ["published", "removed", "review"],
  removed: ["review"],
  rejected: ["draft"],
};

export const TRANSITION_LABEL: Record<RecordStatus, Record<AdminLang, string>> = {
  review: { sq: "Dërgo për shqyrtim / rihap për korrigjim", en: "Send to review / reopen for correction" },
  published: { sq: "Publiko", en: "Publish" },
  redacted: { sq: "Publiko të redaktuar (pa titull e përmbledhje)", en: "Publish redacted (title and summary withheld)" },
  draft: { sq: "Kthe në draft", en: "Send back to draft" },
  rejected: { sq: "Refuzo", en: "Reject" },
  removed: { sq: "Hiq nga publiku (takedown)", en: "Take down from public view" },
};

export const PUBLIC_STATUSES: RecordStatus[] = ["published", "redacted"];
