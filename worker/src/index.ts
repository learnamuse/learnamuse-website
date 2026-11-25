/**
 * Learnamuse contact form backend (Cloudflare Worker).
 *
 *   POST /contact   JSON { name, phone, message?, wantsCollaboration, turnstileToken?, website? }
 *   GET  /health    { ok: true }
 *
 * Responses always match ContactResult in src/lib/contact-client.ts:
 *   { ok: true } | { ok: false, error, fieldErrors? }
 */
import type { Env, ExecutionContextLike } from "./env";
import { LIMITS, MESSAGES, validateContactFields, type FieldErrors, type NormalizedContact } from "./validation";

export type { Env } from "./env";

export const DEFAULT_ALLOWED_ORIGINS = [
  "https://learnamuse.com",
  "https://www.learnamuse.com",
  "https://learnamuse.github.io",
  "http://localhost:3000",
];

export const ERRORS = {
  forbiddenOrigin: "این درخواست مجاز نیست.",
  notFound: "مسیر درخواستی یافت نشد.",
  methodNotAllowed: "این نوع درخواست پشتیبانی نمی‌شود.",
  badRequest: "قالب درخواست نامعتبر است.",
  tooLarge: "حجم پیام بیش از حد مجاز است.",
  rateLimited: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند دقیقه دیگر دوباره تلاش کنید.",
  turnstile: "تأیید امنیتی انجام نشد. لطفاً صفحه را تازه کنید و دوباره تلاش کنید.",
  unavailable: "ارسال پیام در حال حاضر ممکن نیست. لطفاً از راه تلگرام یا ایمیل با ما در ارتباط باشید.",
} as const;

type Result = { ok: true } | { ok: false; error: string; fieldErrors?: FieldErrors };

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function allowedOrigins(env: Env): string[] {
  const list = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return list.length ? list : DEFAULT_ALLOWED_ORIGINS;
}

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const h: Record<string, string> = { Vary: "Origin" };
  if (origin && allowedOrigins(env).includes(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}

function json(body: Result, status: number, headers: Record<string, string>, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
      ...extra,
    },
  });
}

function log(outcome: string, status: number) {
  // Never log PII (name/phone/message/IP) — outcome and status only.
  console.log(JSON.stringify({ event: "contact", outcome, status }));
}

/** Read at most `max` bytes of the body; returns null when the body is larger. */
async function readLimited(request: Request, max: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(all);
}

async function sha256Hex(s: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Rate limiting. Prefers the Workers Rate Limiting binding (CONTACT_RATE_LIMITER);
 * falls back to a KV fixed window (RATE_LIMIT_KV, eventually consistent — best effort);
 * with neither binding there is no rate limit. Returns true when the request is allowed.
 */
export async function checkRateLimit(env: Env, ip: string, now = Date.now()): Promise<boolean> {
  if (env.CONTACT_RATE_LIMITER) {
    const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: `contact:${ip}` });
    return success;
  }
  if (env.RATE_LIMIT_KV) {
    const max = Number(env.RATE_LIMIT_MAX) || 5;
    const windowSec = Number(env.RATE_LIMIT_WINDOW_SECONDS) || 600;
    const windowStart = Math.floor(now / 1000 / windowSec);
    const key = `rl:${(await sha256Hex(ip)).slice(0, 32)}:${windowStart}`;
    const count = Number(await env.RATE_LIMIT_KV.get(key)) || 0;
    if (count >= max) return false;
    await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: Math.max(60, windowSec + 60) });
    return true;
  }
  return true;
}

export async function verifyTurnstile(secret: string, token: string, ip: string | null): Promise<boolean> {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body: form });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatTehranTime(date: Date): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", { timeZone: "Asia/Tehran", dateStyle: "full", timeStyle: "short" }).format(date);
  } catch {
    return date.toISOString();
  }
}

export function formatTelegramMessage(c: NormalizedContact, receivedAt: Date, origin: string | null): string {
  const lines = [
    "📩 <b>پیام تازه از فرم تماس لرناموز</b>",
    "",
    `👤 <b>نام:</b> ${escapeHtml(c.name)}`,
    `📱 <b>موبایل:</b> <code>${escapeHtml(c.phone)}</code>`,
    `🤝 <b>تمایل به همکاری:</b> ${c.wantsCollaboration ? "بله" : "خیر"}`,
  ];
  if (c.message) lines.push("", "💬 <b>پیام:</b>", escapeHtml(c.message));
  lines.push("", `🕒 ${escapeHtml(formatTehranTime(receivedAt))}`);
  if (origin) lines.push(`🌐 ${escapeHtml(origin)}`);
  return lines.join("\n");
}

async function sendTelegram(env: Env, text: string): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Optional archive in D1 (binding DB) and/or KV (binding MESSAGES_KV). Returns true if stored anywhere. */
async function archive(env: Env, c: NormalizedContact, receivedAt: Date, origin: string | null): Promise<boolean> {
  const id = crypto.randomUUID();
  const at = receivedAt.toISOString();
  let stored = false;
  if (env.DB) {
    try {
      await env.DB.prepare(
        "INSERT INTO contact_messages (id, received_at, name, phone, message, wants_collaboration, origin) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
        .bind(id, at, c.name, c.phone, c.message, c.wantsCollaboration ? 1 : 0, origin)
        .run();
      stored = true;
    } catch {
      console.log(JSON.stringify({ event: "contact", outcome: "d1_error" }));
    }
  }
  if (env.MESSAGES_KV) {
    try {
      await env.MESSAGES_KV.put(`msg:${at}:${id}`, JSON.stringify({ ...c, receivedAt: at, origin }), {
        expirationTtl: 60 * 60 * 24 * 180,
      });
      stored = true;
    } catch {
      console.log(JSON.stringify({ event: "contact", outcome: "kv_error" }));
    }
  }
  return stored;
}

async function handleContact(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  const origin = request.headers.get("Origin");

  const type = request.headers.get("Content-Type") ?? "";
  if (!/^application\/json\b/i.test(type)) {
    log("bad_content_type", 415);
    return json({ ok: false, error: ERRORS.badRequest }, 415, cors);
  }
  const declared = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declared) && declared > LIMITS.bodyMaxBytes) {
    log("too_large", 413);
    return json({ ok: false, error: ERRORS.tooLarge }, 413, cors);
  }
  const raw = await readLimited(request, LIMITS.bodyMaxBytes);
  if (raw === null) {
    log("too_large", 413);
    return json({ ok: false, error: ERRORS.tooLarge }, 413, cors);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    log("bad_json", 400);
    return json({ ok: false, error: ERRORS.badRequest }, 400, cors);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    log("bad_json", 400);
    return json({ ok: false, error: ERRORS.badRequest }, 400, cors);
  }
  const input = body as Record<string, unknown>;

  // Honeypot: bots fill every field. Pretend success, drop silently.
  if (typeof input.website === "string" && input.website.trim() !== "") {
    log("honeypot", 200);
    return json({ ok: true }, 200, cors);
  }

  const ip = request.headers.get("CF-Connecting-IP");
  if (!(await checkRateLimit(env, ip ?? "unknown"))) {
    log("rate_limited", 429);
    return json({ ok: false, error: ERRORS.rateLimited }, 429, cors, { "Retry-After": "60" });
  }

  const { fieldErrors, value } = validateContactFields(input);
  if (!value) {
    log("invalid", 422);
    return json({ ok: false, error: MESSAGES.invalidForm, fieldErrors }, 422, cors);
  }

  if (env.TURNSTILE_SECRET) {
    const token = typeof input.turnstileToken === "string" ? input.turnstileToken : "";
    if (!token || token.length > 2048 || !(await verifyTurnstile(env.TURNSTILE_SECRET, token, ip))) {
      log("turnstile_failed", 403);
      return json({ ok: false, error: ERRORS.turnstile }, 403, cors);
    }
  }

  const receivedAt = new Date();
  const stored = await archive(env, value, receivedAt, origin);
  const delivered = await sendTelegram(env, formatTelegramMessage(value, receivedAt, origin));
  if (!delivered && !stored) {
    const configured = Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);
    log(configured ? "delivery_failed" : "not_configured", configured ? 502 : 503);
    return json({ ok: false, error: ERRORS.unavailable }, configured ? 502 : 503, cors);
  }
  log(delivered ? "delivered" : "stored_only", 200);
  return json({ ok: true }, 200, cors);
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  const cors = corsHeaders(origin, env);

  if (url.pathname === "/health") {
    return json({ ok: true }, 200, cors);
  }
  if (url.pathname !== "/contact") {
    return json({ ok: false, error: ERRORS.notFound }, 404, cors);
  }

  // Only browsers on our own origins may call /contact. (Origin can be forged by non-browser
  // clients, so this is a CSRF/abuse filter, not authentication — rate limit + Turnstile do the rest.)
  if (!origin || !allowedOrigins(env).includes(origin)) {
    log("forbidden_origin", 403);
    return json({ ok: false, error: ERRORS.forbiddenOrigin }, 403, cors);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== "POST") {
    return json({ ok: false, error: ERRORS.methodNotAllowed }, 405, cors, { Allow: "POST, OPTIONS" });
  }

  try {
    return await handleContact(request, env, cors);
  } catch {
    log("internal_error", 500);
    return json({ ok: false, error: ERRORS.unavailable }, 500, cors);
  }
}

const worker = {
  fetch(request: Request, env: Env, ctx: ExecutionContextLike): Promise<Response> {
    void ctx;
    return handleRequest(request, env);
  },
};

export default worker;
