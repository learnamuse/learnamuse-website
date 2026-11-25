/**
 * Contact form validation — the SINGLE source of truth for the rules.
 *
 * Imported by the Cloudflare Worker (worker/src/index.ts) and by the website
 * (src/lib/contact-client.ts), so client and server always agree.
 * Keep this module pure: no imports, no Node/Workers/DOM-specific APIs.
 */

export type ContactField = "name" | "phone" | "message";
export type FieldErrors = Partial<Record<ContactField, string>>;

export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  messageMax: 2000,
  /** Max request body size accepted by the Worker, in bytes. */
  bodyMaxBytes: 10 * 1024,
} as const;

export const MESSAGES = {
  nameRequired: "لطفاً نام خود را وارد کنید.",
  nameTooShort: `نام باید دست‌کم ${toPersianDigits(LIMITS.nameMin)} حرف باشد.`,
  nameTooLong: `نام نباید بیشتر از ${toPersianDigits(LIMITS.nameMax)} حرف باشد.`,
  phoneRequired: "لطفاً شمارهٔ موبایل خود را وارد کنید.",
  phoneInvalid: "شمارهٔ موبایل معتبر نیست. نمونهٔ درست: ۰۹۱۲۳۴۵۶۷۸۹",
  messageTooLong: `پیام نباید بیشتر از ${toPersianDigits(LIMITS.messageMax)} نویسه باشد.`,
  invalidForm: "لطفاً خطاهای فرم را برطرف کنید.",
} as const;

/** Convert Persian (۰-۹) and Arabic-Indic (٠-٩) digits to Latin digits. */
export function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

export function toPersianDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => String.fromCharCode(0x06f0 + Number(d)));
}

/** Count user-perceived characters roughly (code points, so emoji count once). */
const charLength = (s: string) => Array.from(s).length;

/** Trim and collapse whitespace runs to one space (ZWNJ is not whitespace and is kept). */
export function normalizeName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/**
 * Normalize an Iranian mobile number to 09xxxxxxxxx, or return null if invalid.
 * Accepts Persian/Arabic digits, spaces, dashes, dots, parentheses, and the prefixes
 * +98, 0098, 98 or 0 (or none: a bare 9xxxxxxxxx).
 */
export function normalizeIranMobile(raw: string): string | null {
  const s = toLatinDigits(raw)
    .replace(/[\s‌‏‎\-.()]/g, "")
    .replace(/^\+/, "00");
  const m = /^(?:0098|98|0)?(9\d{9})$/.exec(s);
  return m ? `0${m[1]}` : null;
}

export type NormalizedContact = {
  name: string;
  phone: string;
  message: string;
  wantsCollaboration: boolean;
};

/**
 * Validate raw input (unknown types allowed — this also runs on untrusted JSON).
 * Returns per-field Persian error messages and, when valid, the normalized value.
 */
export function validateContactFields(input: {
  name?: unknown;
  phone?: unknown;
  message?: unknown;
  wantsCollaboration?: unknown;
}): { fieldErrors: FieldErrors; value: NormalizedContact | null } {
  const fieldErrors: FieldErrors = {};

  const name = typeof input.name === "string" ? normalizeName(input.name) : "";
  if (!name) fieldErrors.name = MESSAGES.nameRequired;
  else if (charLength(name) < LIMITS.nameMin) fieldErrors.name = MESSAGES.nameTooShort;
  else if (charLength(name) > LIMITS.nameMax) fieldErrors.name = MESSAGES.nameTooLong;

  const rawPhone = typeof input.phone === "string" ? input.phone.trim() : "";
  const phone = rawPhone ? normalizeIranMobile(rawPhone) : null;
  if (!rawPhone) fieldErrors.phone = MESSAGES.phoneRequired;
  else if (!phone) fieldErrors.phone = MESSAGES.phoneInvalid;

  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (charLength(message) > LIMITS.messageMax) fieldErrors.message = MESSAGES.messageTooLong;

  const ok = Object.keys(fieldErrors).length === 0;
  return {
    fieldErrors,
    value: ok ? { name, phone: phone!, message, wantsCollaboration: input.wantsCollaboration === true } : null,
  };
}
