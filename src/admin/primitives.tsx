import type { ReactNode } from "react";

/* ───────────── Shared class names ───────────── */
export const inputCls =
  "mt-1.5 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-normal text-ink shadow-xs transition placeholder:text-muted hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20";
export const labelCls = "block text-sm font-medium text-ink";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[#101828] shadow-[0_8px_24px_-10px_rgba(247,144,9,0.9)] transition hover:-translate-y-px hover:bg-brand-400 active:translate-y-0 disabled:opacity-50";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-ink/15 bg-paper-2 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent-ink";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[color:var(--tone-bad)]/40 px-4 py-2.5 text-sm font-semibold text-[color:var(--tone-bad)] transition hover:bg-[color:var(--tone-bad)]/10";
export const cardCls = "rounded-2xl border border-line bg-paper-2";
export const thCls = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted";
export const tdCls = "px-4 py-3 align-top";

/* ───────────── Small components ───────────── */
export type Tone = "ok" | "warn" | "bad" | "info" | "neutral" | "accent";

export function Badge({ tone = "neutral", children, title }: { tone?: Tone; children: ReactNode; title?: string }) {
  return (
    <span className={`tone tone-${tone}`} title={title}>
      {children}
    </span>
  );
}

export function Notice({ tone = "info", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <div role={tone === "bad" ? "alert" : "status"} className={`notice notice-${tone} ${className}`}>
      {children}
    </div>
  );
}

export function Card({ title, children, className = "", actions }: { title?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`${cardCls} ${className}`}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {actions}
        </header>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint, tone, href }: { label: string; value: ReactNode; hint?: ReactNode; tone?: Tone; href?: string }) {
  const inner = (
    <>
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
        {tone ? <span className={`dot dot-${tone}`} aria-hidden /> : null}
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </>
  );
  return href ? (
    <a href={href} className={`${cardCls} block p-4 transition hover:border-accent`}>
      {inner}
    </a>
  ) : (
    <div className={`${cardCls} p-4`}>{inner}</div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-muted">{children}</p>;
}

/** Segmented filter links. Same border width active/inactive, so nothing shifts on click. */
export function Tabs({ items }: { items: { href: string; label: ReactNode; active: boolean; count?: number }[] }) {
  return (
    <nav className="adm-tabs" aria-label="Filter">
      {items.map((i) => (
        <a key={i.href} href={i.href} aria-current={i.active ? "page" : undefined} className="adm-tab">
          {i.label}
          {i.count !== undefined ? <span className="adm-tab-count">{i.count}</span> : null}
        </a>
      ))}
    </nav>
  );
}

/* ───────────── Icons ───────────── */
const ICONS: Record<string, string> = {
  content: "M4 5h16M4 10h16M4 15h10M4 20h7",
  translate: "M4 5h8M8 3v2m3 0c-1 4-4 7-7 8m3-4c1 2 3 3.5 5 4M13 21l4-9 4 9m-6.5-3h5",
  media: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9.5a1 1 0 1 0 0-.01",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14m6-12v14",
  reports: "M12 3 2 20h20zM12 10v4m0 3v.01",
  records: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5",
  cases: "M4 7h16v12H4zM9 7V4h6v3M4 12h16",
  users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M21 19v-1a4 4 0 0 0-3-3.8M16 4.2a3 3 0 0 1 0 5.6",
  audit: "M12 8v4l3 2M3.5 12a8.5 8.5 0 1 0 2.5-6M3 4v4h4",
  shield: "M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6zM9 12l2 2 4-4",
  overview: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  plus: "M12 5v14M5 12h14",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
};

export function Icon({ name, className = "h-4 w-4" }: { name: keyof typeof ICONS | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={ICONS[name] ?? ""} />
    </svg>
  );
}
