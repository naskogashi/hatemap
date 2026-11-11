# HateMap

HateMap is an open-source tool for documenting hate incidents, hate speech and related signals in Kosovo. It was built for [EX-Sbunker](https://ex-sbunker.org) and runs on Next.js (App Router) on Cloudflare Workers with D1.

It is not a live map of raw reports. Every record goes through human review and gets an explicit verification status before anything is published, and nothing is ever published automatically.

## What it does

- **Public map and list**: a server-rendered SVG map of Kosovo's 38 municipalities, with filters for year, category, affected group, source and verification status. It works without JavaScript; `public/hatemap.js` adds tooltips, zoom and instant filters.
- **Citizen reports**: an anonymous form. The text and the reporter's contact are visible only in the protected admin.
- **Correction, appeal and removal requests**: a public form. Requests go into a cases queue and nothing changes until a moderator decides.
- **Moderation dashboard**:
  - Records move through `draft → review → published | redacted | rejected | removed`.
  - Every decision needs a written reason, and an edit to a public record needs a correction note.
  - Verification levels are `verified`, `credible`, `allegation`, `narrative` and `signal`.
  - A redacted record appears on the map without its details.
- **Roles (RBAC)**:
  - `admin`: everything.
  - `moderator`: review and decide.
  - `analyst`: read-only, public evidence only.
- **Audit trail**: the `hm_audit` table is append-only, enforced by SQLite triggers. Every edit, decision, status change, sign-in and data purge is logged.
- **Data protection**:
  - Staff email notifications never include report text or contact details.
  - Rate limits use a salted daily hash of the IP; the IP itself is never stored.
  - Personal data is erased on a schedule (`src/lib/retention.ts`), following Kosovo Law No. 06/L-082 Art. 4 and GDPR Art. 5(1)(e):

    | Data | Erased |
    | --- | --- |
    | Reporter contact | 6 months after the report is closed, at most 12 months after receipt |
    | Case contact | 6 months after the case is resolved |
    | Access log | after 90 days |
- **Languages**: the public pages are in Albanian, English and Serbian (Latin). The admin is in Albanian and English.

## Layout

```
src/lib/taxonomy.ts      categories, groups, sources, verification, municipalities, roles + permissions, workflow
src/lib/records.ts       queries, filters, redaction, audit(), rateLimit(), public IDs
src/lib/retention.ts     daily retention statements
src/lib/email.ts         staff notifications
src/ui/public.tsx        HatemapIndex, HatemapReport, HatemapMethodology, HatemapMiniCard
src/ui/request.tsx       HatemapRequest (correction / appeal / removal)
src/admin/*              moderation pages, server actions, audit log, UI primitives
src/api/report.ts        POST handler for citizen reports
src/api/request.ts       POST handler for correction requests
src/data/kosovo-map.json municipality outlines (scripts/build-kosovo-map.ts, from OpenStreetMap / geoBoundaries data)
migrations/0001_hatemap.sql
public/hatemap.js        progressive enhancement for the map
styles.css               map and admin styles
```

## Using it in a Next.js app

HateMap is source code, not a published npm package. Copy or vendor it into your project (for example as `packages/hatemap`), then wire it in like this.

**1. Path aliases** (`tsconfig.json`):

```json
"paths": {
  "@hatemap/*": ["./packages/hatemap/src/*"],
  "@hatemap-host": ["./src/hatemap-host.ts"]
}
```

**2. Host adapter**: create `src/hatemap-host.ts`. Everything site-specific comes through this one module:

| Export | What it is |
| --- | --- |
| `type Lang` | `"sq" \| "en" \| "sr"` |
| `HTML_LANG` | `Record<Lang, string>`, the `lang` attribute per language |
| `hatemapPath(lang, sub?)` | public URL of the map; `sub` is `"report" \| "methodology" \| "request"` |
| `routePath("contact" \| "privacy", lang)` | URLs of your contact and privacy pages |
| `CONTACT_EMAIL`, `CONTACT_LABEL` | contact address, and the `Record<Lang, string>` link label |
| `Container`, `Eyebrow` | your layout components (`{ className?, children }`) |
| `formLang(value)` | form value → `Lang` (default `"sq"`) |
| `requirePerm(perm)` | returns `{ uid, email, role, name }` or redirects to your login; checks `can(role, perm)` from `taxonomy.ts` |
| `AdminShell` | your admin layout: `{ title, eyebrow?, active?, actions?, children }` |
| `emailLayout`, `esc`, `sendMail(env, mail)`, `recipients(env)` | your email helpers |

**3. Routes**: re-export the pages and handlers. Keep segment config literal in each file:

```ts
// app/admin/hatemap/page.tsx (likewise record/[id], report/[id], cases, cases/[id])
export const dynamic = "force-dynamic";
export { default } from "@hatemap/admin/overview-page";

// app/api/hatemap/report/route.ts (and request/route.ts)
export { POST } from "@hatemap/api/report";
```

Render the public components (`HatemapIndex`, `HatemapReport`, `HatemapMethodology`, `HatemapRequest`) on the URLs your `hatemapPath` returns, then:

- Serve `public/hatemap.js` at `/vendor/hatemap.js`.
- Import `styles.css` after Tailwind, and add `@source` for `src/`.
- Run `retentionStatements(db)` daily, for example from a Workers cron trigger.

**4. Database**: `wrangler d1 execute <db> --file=packages/hatemap/migrations/0001_hatemap.sql`. Users and sessions belong to your app; HateMap only needs the `role` in the session.

**5. Bindings**: `DB` (D1) and `SESSION_SECRET` (salt for the rate-limit hash).

## Contributing

Issues and pull requests are welcome. Please never include real report content, personal data or screenshots of the admin in issues.

## License

Code: [GNU Affero General Public License v3.0](LICENSE). If you run a modified version as a public service, you must publish your changes under the same license.

Map data (`scripts/data/`, `src/data/kosovo-map.json`): municipal boundaries from [geoBoundaries](https://www.geoboundaries.org/) (gbOpen XKX ADM2), derived from OpenStreetMap, under CC BY-SA 2.0. © OpenStreetMap contributors.

© 2026 EX-Sbunker
