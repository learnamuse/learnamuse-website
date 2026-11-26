/**
 * Contact form client — the ONLY interface between the UI and the contact backend.
 *
 * The site is a static export on GitHub Pages, so the form posts cross-origin to a
 * Cloudflare Worker (see /worker). Endpoint + optional Turnstile key come from env at build:
 *   NEXT_PUBLIC_CONTACT_ENDPOINT     e.g. https://contact.learnamuse.workers.dev/contact
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY   optional; when set the UI must render Turnstile and pass the token
 *
 * When CONTACT_ENABLED is false the UI should still render the form but explain that
 * messages go via the Bale bot / Telegram instead (and link them), rather than failing silently.
 */

import { MESSAGES, validateContactFields } from "../../worker/src/validation";

export type ContactInput = {
  name: string;
  phone: string; // Iranian mobile, Persian or Latin digits accepted (normalized server-side)
  message?: string;
  wantsCollaboration: boolean;
  turnstileToken?: string;
  /** Honeypot — render as a visually hidden input named "website"; humans leave it empty. */
  website?: string;
};

export type ContactField = "name" | "phone" | "message";

export type ContactResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<ContactField, string>> };

export const CONTACT_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "";
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
export const CONTACT_ENABLED = CONTACT_ENDPOINT.length > 0;

/** Client-side validation mirroring the Worker's rules. Returns Persian messages. */
export function validateContact(input: ContactInput): Partial<Record<ContactField, string>> {
  // Same pure module the Worker uses (worker/src/validation.ts), so the rules can't drift.
  return validateContactFields(input).fieldErrors;
}

const TIMEOUT_MS = 15_000;
const CLIENT_ERRORS = {
  disabled: "فرم تماس هنوز راه‌اندازی نشده است. لطفاً از راه ربات لرناموز در بله یا تلگرام با ما در ارتباط باشید.",
  timeout: "پاسخی از سرور دریافت نشد. لطفاً دوباره تلاش کنید.",
  network: "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.",
  rateLimited: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند دقیقه دیگر دوباره تلاش کنید.",
  server: "ارسال پیام با خطا روبه‌رو شد. لطفاً کمی بعد دوباره تلاش کنید یا از راه ربات لرناموز در بله با ما در ارتباط باشید.",
} as const;

const FIELDS: readonly ContactField[] = ["name", "phone", "message"];

/** Accept only a well-formed ContactResult from the network; anything else is treated as unknown. */
function asContactResult(data: unknown): ContactResult | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.ok === true) return { ok: true };
  if (d.ok !== false || typeof d.error !== "string" || !d.error) return null;
  const result: ContactResult = { ok: false, error: d.error };
  if (d.fieldErrors && typeof d.fieldErrors === "object") {
    const fe: Partial<Record<ContactField, string>> = {};
    for (const f of FIELDS) {
      const v = (d.fieldErrors as Record<string, unknown>)[f];
      if (typeof v === "string" && v) fe[f] = v;
    }
    if (Object.keys(fe).length) result.fieldErrors = fe;
  }
  return result;
}

/** POST the form to the Worker. Never throws; network errors become { ok: false }. */
export async function submitContact(input: ContactInput): Promise<ContactResult> {
  if (!CONTACT_ENABLED) return { ok: false, error: CLIENT_ERRORS.disabled };

  // Honeypot filled: behave like success without bothering the server.
  if (input.website && input.website.trim() !== "") return { ok: true };

  const { fieldErrors } = validateContactFields(input);
  if (Object.keys(fieldErrors).length) return { ok: false, error: MESSAGES.invalidForm, fieldErrors };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        phone: input.phone,
        message: input.message ?? "",
        wantsCollaboration: input.wantsCollaboration === true,
        turnstileToken: input.turnstileToken || undefined,
        website: input.website ?? "",
      }),
      signal: controller.signal,
      mode: "cors",
      credentials: "omit",
    });
    // A non-JSON/unknown body (e.g. an HTML error page from a proxy) is never treated as success.
    const parsed = asContactResult(await res.json().catch(() => null));
    if (parsed) return parsed;
    return { ok: false, error: res.status === 429 ? CLIENT_ERRORS.rateLimited : CLIENT_ERRORS.server };
  } catch (err) {
    const aborted = controller.signal.aborted || (err instanceof DOMException && err.name === "AbortError");
    return { ok: false, error: aborted ? CLIENT_ERRORS.timeout : CLIENT_ERRORS.network };
  } finally {
    clearTimeout(timer);
  }
}
