// Cloudflare bindings HateMap needs (merged with the host's CloudflareEnv).
interface CloudflareEnv {
  DB: D1Database;
  /** Salt for the anonymised rate-limit key. */
  SESSION_SECRET?: string;
}
