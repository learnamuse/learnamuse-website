import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker, {
  ERRORS,
  checkRateLimit,
  escapeHtml,
  formatPlainMessage,
  formatTehranTime,
  formatTelegramMessage,
  handleRequest,
  type Env,
} from "../src/index";
import type { KVLike } from "../src/env";
import { MESSAGES } from "../src/validation";

const ORIGIN = "https://learnamuse.com";
const valid = { name: "سارا <رحیمی>", phone: "۰۹۱۲۳۴۵۶۷۸۹", message: "سلام & درود", wantsCollaboration: true };

function req(body: unknown, init: { origin?: string | null; method?: string; type?: string; headers?: Record<string, string> } = {}) {
  const headers: Record<string, string> = { "CF-Connecting-IP": "203.0.113.7", ...init.headers };
  if (init.origin !== null) headers.Origin = init.origin ?? ORIGIN;
  if (init.type !== "") headers["Content-Type"] = init.type ?? "application/json";
  const method = init.method ?? "POST";
  return new Request("https://contact.example.workers.dev/contact", {
    method,
    headers,
    body: method === "POST" || method === "PUT" ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
  });
}

const baseEnv = (): Env => ({ BALE_BOT_TOKEN: "BALETOKEN", BALE_CHAT_ID: "5550001" });
const bothEnv = (): Env => ({ ...baseEnv(), TELEGRAM_BOT_TOKEN: "TOKEN", TELEGRAM_CHAT_ID: "-100123" });
const telegramOnly = (): Env => ({ TELEGRAM_BOT_TOKEN: "TOKEN", TELEGRAM_CHAT_ID: "-100123" });
const BALE_URL = "https://tapi.bale.ai/botBALETOKEN/sendMessage";
const TG_URL = "https://api.telegram.org/botTOKEN/sendMessage";
const bodyOf = (url: string) => {
  const call = fetchMock.mock.calls.find(([u]) => String(u) === url);
  return call ? JSON.parse((call[1] as RequestInit).body as string) : undefined;
};

function memoryKV(): KVLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    put: async (k, v) => void data.set(k, v),
  };
}

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn(async (url: string | URL | Request) => {
    const u = String(url);
    if (u.startsWith("https://tapi.bale.ai/")) return Response.json({ ok: true, result: { message_id: 1 } });
    if (u.startsWith("https://api.telegram.org/")) return Response.json({ ok: true });
    if (u.includes("turnstile")) return Response.json({ success: true });
    throw new Error(`unexpected fetch ${u}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("routing and CORS", () => {
  it("answers preflight for allowed origins", async () => {
    const res = await handleRequest(req(null, { method: "OPTIONS", type: "" }), baseEnv());
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Content-Type");
  });

  it("rejects disallowed or missing origins", async () => {
    for (const origin of ["https://evil.example", null]) {
      const res = await handleRequest(req(valid, { origin }), baseEnv());
      expect(res.status).toBe(403);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
      expect(await res.json()).toEqual({ ok: false, error: ERRORS.forbiddenOrigin });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses ALLOWED_ORIGINS from env when set", async () => {
    const env = { ...baseEnv(), ALLOWED_ORIGINS: "https://a.example, https://b.example/" };
    expect((await handleRequest(req(valid, { origin: "https://b.example" }), env)).status).toBe(200);
    expect((await handleRequest(req(valid), env)).status).toBe(403);
  });

  it("404s unknown paths and 405s other methods", async () => {
    const r404 = await handleRequest(new Request("https://x.dev/nope", { headers: { Origin: ORIGIN } }), baseEnv());
    expect(r404.status).toBe(404);
    const r405 = await handleRequest(req(null, { method: "GET", type: "" }), baseEnv());
    expect(r405.status).toBe(405);
    expect((await r405.json()).ok).toBe(false);
  });

  it("serves /health", async () => {
    const res = await handleRequest(new Request("https://x.dev/health"), {});
    expect(await res.json()).toEqual({ ok: true });
  });

  it("default export delegates to handleRequest", async () => {
    const res = await worker.fetch(req(valid), baseEnv(), { waitUntil: () => {} });
    expect(res.status).toBe(200);
  });
});

describe("request parsing", () => {
  it("requires JSON content type", async () => {
    const res = await handleRequest(req(valid, { type: "text/plain" }), baseEnv());
    expect(res.status).toBe(415);
  });

  it("rejects malformed and non-object JSON", async () => {
    for (const body of ["{nope", "[1,2]", "null", '"str"']) {
      const res = await handleRequest(req(body), baseEnv());
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ ok: false, error: ERRORS.badRequest });
    }
  });

  it("rejects bodies over 10KB", async () => {
    const res = await handleRequest(req({ ...valid, message: "x".repeat(11_000) }), baseEnv());
    expect(res.status).toBe(413);
    expect((await res.json()).error).toBe(ERRORS.tooLarge);
  });

  it("rejects over-declared Content-Length without reading", async () => {
    const res = await handleRequest(req(valid, { headers: { "Content-Length": "999999" } }), baseEnv());
    expect(res.status).toBe(413);
  });
});

describe("validation", () => {
  it("returns 422 with Persian field errors", async () => {
    const res = await handleRequest(req({ name: "a", phone: "123", message: "x".repeat(2001), wantsCollaboration: false }), baseEnv());
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      ok: false,
      error: MESSAGES.invalidForm,
      fieldErrors: { name: MESSAGES.nameTooShort, phone: MESSAGES.phoneInvalid, message: MESSAGES.messageTooLong },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("spam protection", () => {
  it("honeypot: pretends success but sends nothing", async () => {
    const res = await handleRequest(req({ ...valid, website: "http://spam" }), baseEnv());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires a valid Turnstile token when TURNSTILE_SECRET is set", async () => {
    const env = { ...baseEnv(), TURNSTILE_SECRET: "secret" };
    const missing = await handleRequest(req(valid), env);
    expect(missing.status).toBe(403);
    expect((await missing.json()).error).toBe(ERRORS.turnstile);

    fetchMock.mockImplementationOnce(async () => Response.json({ success: false }));
    expect((await handleRequest(req({ ...valid, turnstileToken: "bad" }), env)).status).toBe(403);

    const good = await handleRequest(req({ ...valid, turnstileToken: "good" }), env);
    expect(good.status).toBe(200);
    const [url, init] = fetchMock.mock.calls.find(([u]) => String(u).includes("turnstile"))!;
    expect(String(url)).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const form = (init as RequestInit).body as FormData;
    expect(form.get("secret")).toBe("secret");
    expect(form.get("remoteip")).toBe("203.0.113.7");
  });

  it("rate limits via the Workers Rate Limiting binding", async () => {
    const limit = vi.fn(async () => ({ success: false }));
    const res = await handleRequest(req(valid), { ...baseEnv(), CONTACT_RATE_LIMITER: { limit } });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(await res.json()).toEqual({ ok: false, error: ERRORS.rateLimited });
    expect(limit).toHaveBeenCalledWith({ key: "contact:203.0.113.7" });
  });

  it("KV fixed-window fallback allows RATE_LIMIT_MAX per window and hashes the IP", async () => {
    const kv = memoryKV();
    const env: Env = { RATE_LIMIT_KV: kv, RATE_LIMIT_MAX: "2", RATE_LIMIT_WINDOW_SECONDS: "600" };
    const t = 1_700_000_000_000;
    expect(await checkRateLimit(env, "1.2.3.4", t)).toBe(true);
    expect(await checkRateLimit(env, "1.2.3.4", t)).toBe(true);
    expect(await checkRateLimit(env, "1.2.3.4", t)).toBe(false);
    expect(await checkRateLimit(env, "5.6.7.8", t)).toBe(true);
    expect(await checkRateLimit(env, "1.2.3.4", t + 600_000)).toBe(true);
    expect([...kv.data.keys()].some((k) => k.includes("1.2.3.4"))).toBe(false);
  });
});

describe("delivery", () => {
  it("sends a plain-text Persian message to the Bale admin chat", async () => {
    const res = await handleRequest(req(valid), baseEnv());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toBe(BALE_URL);
    const payload = bodyOf(BALE_URL);
    expect(payload.chat_id).toBe("5550001");
    expect(payload.parse_mode).toBeUndefined();
    expect(payload.text).toMatch(/^📩 پیام جدید از وب‌سایت لرناموز\n/);
    expect(payload.text).toContain("👤 نام: سارا <رحیمی>"); // plain text: no escaping
    expect(payload.text).toContain("📱 موبایل: 09123456789"); // normalized
    expect(payload.text).toContain("🤝 تمایل به همکاری آموزشی: بله");
    expect(payload.text).toContain("💬 پیام:\nسلام & درود");
    expect(payload.text).toContain("🌐 صفحه: https://learnamuse.com");
  });

  it("honours BALE_API_BASE (local testing)", async () => {
    fetchMock.mockImplementation(async () => Response.json({ ok: true }));
    await handleRequest(req(valid), { ...baseEnv(), BALE_API_BASE: "http://127.0.0.1:9999/" });
    expect(String(fetchMock.mock.calls[0][0])).toBe("http://127.0.0.1:9999/botBALETOKEN/sendMessage");
  });

  it("sends to Bale and Telegram when both are configured", async () => {
    const res = await handleRequest(req(valid), bothEnv());
    expect(res.status).toBe(200);
    expect(bodyOf(BALE_URL).text).toContain("سارا <رحیمی>");
    const tg = bodyOf(TG_URL);
    expect(tg.chat_id).toBe("-100123");
    expect(tg.parse_mode).toBe("HTML");
    expect(tg.text).toContain("سارا &lt;رحیمی&gt;");
    expect(tg.text).toContain("<code>09123456789</code>");
    expect(tg.text).toContain("سلام &amp; درود");
  });

  it("succeeds when one of two channels fails", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      String(url).startsWith("https://tapi.bale.ai/") ? new Response("down", { status: 503 }) : Response.json({ ok: true }),
    );
    expect((await handleRequest(req(valid), bothEnv())).status).toBe(200);
  });

  it("treats a Bot API ok:false body as a failure", async () => {
    fetchMock.mockImplementation(async () => Response.json({ ok: false, error_code: 400, description: "chat not found" }));
    expect((await handleRequest(req(valid), baseEnv())).status).toBe(502);
  });

  it("works with Telegram only (legacy setup)", async () => {
    const res = await handleRequest(req(valid), telegramOnly());
    expect(res.status).toBe(200);
    expect(bodyOf(TG_URL).parse_mode).toBe("HTML");
  });

  it("returns 502 when every channel fails and nothing is archived", async () => {
    fetchMock.mockImplementation(async () => new Response("bad", { status: 400 }));
    const res = await handleRequest(req(valid), bothEnv());
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: ERRORS.unavailable });
  });

  it("returns 503 when no delivery channel is configured", async () => {
    const res = await handleRequest(req(valid), {});
    expect(res.status).toBe(503);
  });

  it("succeeds when delivery fails but the message is archived in KV", async () => {
    fetchMock.mockImplementation(async () => {
      throw new Error("network");
    });
    const kv = memoryKV();
    const res = await handleRequest(req(valid), { ...baseEnv(), MESSAGES_KV: kv });
    expect(res.status).toBe(200);
    const [key, value] = [...kv.data.entries()][0];
    expect(key).toMatch(/^msg:/);
    expect(JSON.parse(value)).toMatchObject({ name: "سارا <رحیمی>", phone: "09123456789", wantsCollaboration: true });
  });

  it("archives to D1 when bound", async () => {
    const run = vi.fn(async () => ({}));
    const bind = vi.fn((...values: unknown[]) => (void values, { run }));
    const prepare = vi.fn((query: string) => (void query, { bind }));
    const res = await handleRequest(req(valid), { ...baseEnv(), DB: { prepare } });
    expect(res.status).toBe(200);
    expect(prepare.mock.calls[0][0]).toContain("INSERT INTO contact_messages");
    expect(bind.mock.calls[0]).toContain("09123456789");
    expect(run).toHaveBeenCalled();
  });

  it("never logs PII", async () => {
    await handleRequest(req(valid), baseEnv());
    const logged = (console.log as unknown as ReturnType<typeof vi.fn>).mock.calls.flat().join(" ");
    expect(logged).not.toContain("0912");
    expect(logged).not.toContain("سارا");
    expect(logged).not.toContain("203.0.113.7");
  });
});

describe("formatting helpers", () => {
  it("escapeHtml", () => {
    expect(escapeHtml(`<b>"x" & y</b>`)).toBe("&lt;b&gt;&quot;x&quot; &amp; y&lt;/b&gt;");
  });
  it("formats the time as a Jalali date in Asia/Tehran", () => {
    // 2026-11-26T11:00Z = Thursday 5 Azar 1405, 14:30 Tehran time
    expect(formatTehranTime(new Date("2026-11-26T11:00:00Z"))).toBe("پنجشنبه ۵ آذر ۱۴۰۵، ساعت ۱۴:۳۰");
  });
  it("plain message marks a call-back request without text", () => {
    const text = formatPlainMessage({ name: "علی", phone: "09121112233", message: "", wantsCollaboration: false }, new Date(0), null);
    expect(text).toContain("(بدون متن — فقط درخواست تماس)");
    expect(text).toContain("تمایل به همکاری آموزشی: خیر");
    expect(text).toContain("🌐 صفحه: ارتباط با ما");
  });
  it("omits empty message section", () => {
    const text = formatTelegramMessage({ name: "علی", phone: "09121112233", message: "", wantsCollaboration: false }, new Date(0), null);
    expect(text).not.toContain("پیام:</b>");
    expect(text).toContain("خیر");
  });
});
