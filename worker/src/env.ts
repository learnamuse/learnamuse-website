/**
 * Minimal structural types for the Cloudflare bindings we use, so the Worker needs no
 * @cloudflare/workers-types dependency. Every binding is optional.
 */

/** Workers Rate Limiting binding (wrangler.toml [[ratelimits]]). */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface D1Like {
  prepare(query: string): { bind(...values: unknown[]): { run(): Promise<unknown> } };
}

export interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

export interface Env {
  /** Comma-separated list of allowed browser origins (exact match). */
  ALLOWED_ORIGINS?: string;
  /** Primary delivery: Bale Bot API (the Learnamuse bot, ble.ir/LearnamuseBot). */
  BALE_BOT_TOKEN?: string;
  /** Admin channel/group id the bot posts to (the bot must be a member/admin there). */
  BALE_CHAT_ID?: string;
  /** Bale Bot API base URL, default https://tapi.bale.ai (override only for local testing). */
  BALE_API_BASE?: string;
  /** Optional secondary delivery: Telegram Bot API. */
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  /** Telegram Bot API base URL, default https://api.telegram.org (override only for local testing). */
  TELEGRAM_API_BASE?: string;
  /** When set, a valid Cloudflare Turnstile token is required. */
  TURNSTILE_SECRET?: string;
  /** Preferred rate limiter: Workers Rate Limiting binding. */
  CONTACT_RATE_LIMITER?: RateLimitBinding;
  /** Fallback rate limiter (fixed window) and optional message archive. */
  RATE_LIMIT_KV?: KVLike;
  /** Requests per window for the KV fallback (default 5 per 600 s). */
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW_SECONDS?: string;
  /** Optional archive: KV namespace or D1 database (see schema.sql). */
  MESSAGES_KV?: KVLike;
  DB?: D1Like;
}
