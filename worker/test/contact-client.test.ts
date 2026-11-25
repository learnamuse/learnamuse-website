/**
 * Tests the website's src/lib/contact-client.ts against the Worker handler, proving the
 * client and server agree (shared validation module, ContactResult shape).
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { handleRequest } from "../src/index";
import { MESSAGES } from "../src/validation";

type Client = typeof import("../../src/lib/contact-client");
let client: Client;
const ENDPOINT = "https://contact.example.workers.dev/contact";

beforeAll(async () => {
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT = ENDPOINT;
  client = await import("../../src/lib/contact-client");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const valid = { name: "سارا رحیمی", phone: "۰۹۱۲۳۴۵۶۷۸۹", message: "سلام", wantsCollaboration: false };

describe("validateContact", () => {
  it("matches the worker rules", () => {
    expect(client.validateContact(valid)).toEqual({});
    expect(client.validateContact({ ...valid, name: "x", phone: "0912" })).toEqual({
      name: MESSAGES.nameTooShort,
      phone: MESSAGES.phoneInvalid,
    });
  });
});

describe("submitContact", () => {
  it("is enabled when the endpoint env var is set", () => {
    expect(client.CONTACT_ENABLED).toBe(true);
  });

  it("returns field errors without calling the network", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const r = await client.submitContact({ ...valid, phone: "" });
    expect(r).toEqual({ ok: false, error: MESSAGES.invalidForm, fieldErrors: { phone: MESSAGES.phoneRequired } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("round-trips through the real worker handler", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const telegram = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      if (url === ENDPOINT) {
        const req = new Request(url, { ...init, headers: { ...(init.headers as Record<string, string>), Origin: "https://learnamuse.com" } });
        return handleRequest(req, { TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1" });
      }
      return telegram();
    });
    expect(await client.submitContact(valid)).toEqual({ ok: true });
    expect(telegram).toHaveBeenCalledOnce();
  });

  it("passes through server errors and maps unknown responses", async () => {
    vi.stubGlobal("fetch", async () => Response.json({ ok: false, error: "خطا", fieldErrors: { name: "نام", bogus: 1 } }, { status: 422 }));
    expect(await client.submitContact(valid)).toEqual({ ok: false, error: "خطا", fieldErrors: { name: "نام" } });

    vi.stubGlobal("fetch", async () => new Response("<html>", { status: 429 }));
    const r429 = await client.submitContact(valid);
    expect(r429.ok).toBe(false);
    if (!r429.ok) expect(r429.error).toContain("چند دقیقه");

    vi.stubGlobal("fetch", async () => new Response("<html>", { status: 200 }));
    expect((await client.submitContact(valid)).ok).toBe(false);
  });

  it("maps network errors and never throws", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("Failed to fetch");
    });
    const r = await client.submitContact(valid);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("اینترنت");
  });

  it("times out after 15s", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", (_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      }),
    );
    const p = client.submitContact(valid);
    await vi.advanceTimersByTimeAsync(15_000);
    const r = await p;
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("پاسخی");
  });

  it("honeypot short-circuits to success", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await client.submitContact({ ...valid, website: "x" })).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
