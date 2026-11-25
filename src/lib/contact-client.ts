/**
 * Contact form client — the ONLY interface between the UI and the contact backend.
 *
 * The site is a static export on GitHub Pages, so the form posts cross-origin to a
 * Cloudflare Worker (see /worker). Endpoint + optional Turnstile key come from env at build:
 *   NEXT_PUBLIC_CONTACT_ENDPOINT     e.g. https://contact.learnamuse.workers.dev/contact
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY   optional; when set the UI must render Turnstile and pass the token
 *
 * When CONTACT_ENABLED is false the UI should still render the form but explain that
 * messages go via Telegram/email instead (and link them), rather than failing silently.
 */

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
  // Implemented by the backend agent (must match worker/src validation exactly).
  void input;
  return {};
}

/** POST the form to the Worker. Never throws; network errors become { ok: false }. */
export async function submitContact(input: ContactInput): Promise<ContactResult> {
  // Implemented by the backend agent.
  void input;
  return { ok: false, error: "فرم تماس هنوز راه‌اندازی نشده است." };
}
