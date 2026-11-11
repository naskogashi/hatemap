-- HateMap schema for Cloudflare D1 (SQLite).
-- Apply once: wrangler d1 execute <db> --file=packages/hatemap/migrations/0001_hatemap.sql
-- The host app provides users and sessions (see README: host contract).
-- hm_audit is append-only (triggers); only access-log rows older than 90 days may be deleted.

CREATE TABLE IF NOT EXISTS hm_reports (
  id             INTEGER PRIMARY KEY,
  received_at    TEXT NOT NULL DEFAULT (datetime('now')),
  lang           TEXT NOT NULL,
  category       TEXT,
  municipality   TEXT,
  occurred_on    TEXT,                 -- YYYY-MM or YYYY-MM-DD as given by the reporter
  description    TEXT NOT NULL,
  source_url     TEXT,
  contact        TEXT,                 -- optional; deleted by the purge action / retention rule
  contact_ok     INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_review','converted','rejected','spam')),
  record_id      INTEGER,
  handled_by     TEXT,
  handled_at     TEXT,
  notes          TEXT
);

CREATE TABLE IF NOT EXISTS hm_records (
  id              INTEGER PRIMARY KEY,
  public_id       TEXT UNIQUE,
  category        TEXT NOT NULL,
  affected_group  TEXT,
  source_type     TEXT NOT NULL,
  verification    TEXT NOT NULL CHECK (verification IN ('verified','credible','allegation','narrative','signal')),
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','redacted','rejected','removed')),
  sensitivity     TEXT NOT NULL DEFAULT 'normal' CHECK (sensitivity IN ('normal','high')),
  municipality    TEXT NOT NULL,
  occurred_on     TEXT NOT NULL,
  title_sq        TEXT, title_en TEXT, title_sr TEXT,
  summary_sq      TEXT, summary_en TEXT, summary_sr TEXT,
  evidence_json   TEXT,
  internal_notes  TEXT,
  report_id       INTEGER REFERENCES hm_reports(id) ON DELETE SET NULL,
  created_by      TEXT,
  updated_by      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  published_at    TEXT
);

CREATE TABLE IF NOT EXISTS hm_audit (
  id         INTEGER PRIMARY KEY,
  at         TEXT NOT NULL DEFAULT (datetime('now')),
  actor      TEXT NOT NULL,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  INTEGER,
  details    TEXT
);

CREATE TABLE IF NOT EXISTS hm_cases (
  id           INTEGER PRIMARY KEY,
  kind         TEXT NOT NULL CHECK (kind IN ('correction','appeal','removal')),
  urgency      TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal','urgent')),
  record_id    INTEGER,
  requester    TEXT,                 -- name or organisation, optional
  contact      TEXT,                 -- optional; purge when the case is closed
  description  TEXT NOT NULL,
  received_via TEXT,                 -- email, phone, form, internal â€¦
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_review','upheld','dismissed')),
  resolution   TEXT,
  created_by   TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_by  TEXT,
  resolved_at  TEXT
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key           TEXT PRIMARY KEY,
  window_start  INTEGER NOT NULL,
  count         INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_hm_audit_at ON hm_audit(at DESC);

CREATE INDEX IF NOT EXISTS ix_hm_audit_entity ON hm_audit(entity, entity_id, at DESC);

CREATE INDEX IF NOT EXISTS ix_hm_cases_status ON hm_cases(status, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_hm_records_public ON hm_records(status, occurred_on DESC);

CREATE INDEX IF NOT EXISTS ix_hm_reports_status ON hm_reports(status, received_at DESC);

CREATE TRIGGER IF NOT EXISTS hm_audit_no_delete BEFORE DELETE ON hm_audit
WHEN NOT (OLD.entity = 'access' AND OLD.at < datetime('now', '-90 days'))
BEGIN
  SELECT RAISE(ABORT, 'audit log is append-only');
END;

CREATE TRIGGER IF NOT EXISTS hm_audit_no_update BEFORE UPDATE ON hm_audit
BEGIN
  SELECT RAISE(ABORT, 'audit log is append-only');
END;
