"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  CONTACT_ENABLED,
  TURNSTILE_SITE_KEY,
  submitContact,
  validateContact,
  type ContactField,
  type ContactInput,
} from "@/lib/contact-client";
import { Check, Telegram, Mail } from "@/components/ui/icons";

export type FieldDef = {
  key: "name" | "phone" | "message" | "wantsCollaboration";
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
};

type Status = "idle" | "submitting" | "success" | "error";
type Errors = Partial<Record<ContactField, string>>;

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const EMPTY = { name: "", phone: "", message: "", wantsCollaboration: false, website: "" };

export function ContactForm({
  fields,
  submitLabel,
  telegram,
  telegramHandle,
  email,
}: {
  fields: FieldDef[];
  submitLabel: string;
  telegram: string;
  telegramHandle: string;
  email: string;
}) {
  const uid = useId();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const [token, setToken] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const turnstileEl = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  // --- Cloudflare Turnstile (only when a site key is configured) ---------------------------
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !CONTACT_ENABLED) return;
    let cancelled = false;
    const mount = () => {
      if (cancelled || !window.turnstile || !turnstileEl.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(turnstileEl.current, {
        sitekey: TURNSTILE_SITE_KEY,
        language: "fa",
        theme: "auto",
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    if (window.turnstile) {
      mount();
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = TURNSTILE_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", mount);
    }
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, []);

  const resetTurnstile = useCallback(() => {
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    setToken("");
  }, []);

  const focusFirstError = (errs: Errors) => {
    const first = (["name", "phone", "message"] as ContactField[]).find((k) => errs[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setFormError("");

    const input: ContactInput = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      message: values.message.trim() || undefined,
      wantsCollaboration: values.wantsCollaboration,
      website: values.website,
      turnstileToken: token || undefined,
    };

    const errs = validateContact(input);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }

    if (!CONTACT_ENABLED) {
      setStatus("error");
      setFormError("ارسال آنلاین فرم فعلاً فعال نیست. لطفاً پیام‌تان را از راه تلگرام یا ایمیل برای ما بفرستید.");
      statusRef.current?.focus();
      return;
    }
    if (TURNSTILE_SITE_KEY && !token) {
      setStatus("error");
      setFormError("لطفاً تأیید امنیتی پایین فرم را کامل کنید.");
      statusRef.current?.focus();
      return;
    }

    setStatus("submitting");
    const res = await submitContact(input);
    if (res.ok) {
      setStatus("success");
      setValues(EMPTY);
      setErrors({});
      resetTurnstile();
      // statusRef focus happens after render (see effect below)
    } else {
      setStatus("error");
      setFormError(res.error);
      if (res.fieldErrors) {
        setErrors(res.fieldErrors);
        focusFirstError(res.fieldErrors);
      } else {
        statusRef.current?.focus();
      }
      resetTurnstile();
    }
  }

  useEffect(() => {
    if (status === "success") statusRef.current?.focus();
  }, [status]);

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    if (k in errors) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  if (status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-center rounded-card border border-brand/40 bg-brand-soft px-6 py-12 text-center outline-none"
      >
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-brand text-brand-ink">
          <Check className="size-8" />
        </span>
        <h2 className="mt-5 text-2xl font-black text-ink">پیام‌تون رسید!</h2>
        <p className="mt-3 max-w-sm leading-8 text-ink-2">ممنون که با ما در ارتباط هستید. به‌زودی جواب‌تون رو می‌دیم.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-line bg-surface px-5 py-2.5 font-bold text-ink hover:border-brand"
        >
          ارسال پیام دیگر
        </button>
      </div>
    );
  }

  const fieldId = (k: string) => `${uid}-${k}`;
  const errId = (k: string) => `${uid}-${k}-error`;
  const inputCls = (invalid: boolean) =>
    `mt-2 block w-full rounded-2xl border bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-3 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 ${
      invalid ? "border-red-500 dark:border-red-400" : "border-line"
    }`;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6" aria-describedby={`${uid}-req`}>
      {!CONTACT_ENABLED && (
        <div className="rounded-2xl border border-gold/50 bg-gold-soft p-4 text-sm leading-7 text-ink">
          <p className="font-bold">ارسال آنلاین فرم به‌زودی فعال می‌شود.</p>
          <p className="mt-1 text-ink-2">
            تا آن موقع، سریع‌ترین راه ارتباط با ما{" "}
            <a href={telegram} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-strong underline underline-offset-4">
              تلگرام <span dir="ltr">{telegramHandle}</span>
            </a>{" "}
            یا ایمیل{" "}
            <a href={`mailto:${email}`} className="font-bold text-brand-strong underline underline-offset-4">
              <span dir="ltr" className="whitespace-nowrap">{email}</span>
            </a>{" "}
            است.
          </p>
        </div>
      )}

      <p id={`${uid}-req`} className="text-sm text-ink-3">
        فیلدهای ستاره‌دار <span aria-hidden="true">(*)</span> ضروری هستند.
      </p>

      {fields.map((f) => {
        if (f.key === "wantsCollaboration") {
          return (
            <div key={f.key} className="flex items-start gap-3 rounded-2xl border border-line bg-surface-2/60 p-4">
              <input
                id={fieldId(f.key)}
                name={f.key}
                type="checkbox"
                checked={values.wantsCollaboration}
                onChange={(e) => set("wantsCollaboration", e.target.checked)}
                className="mt-1 size-5 shrink-0 cursor-pointer rounded accent-[var(--brand-strong)]"
              />
              <label htmlFor={fieldId(f.key)} className="cursor-pointer leading-7 text-ink">
                {f.label}
              </label>
            </div>
          );
        }
        const k = f.key as ContactField;
        const err = errors[k];
        const common = {
          id: fieldId(k),
          name: k,
          required: f.required,
          placeholder: f.placeholder,
          value: values[k],
          "aria-invalid": err ? true : undefined,
          "aria-describedby": err ? errId(k) : undefined,
          className: inputCls(Boolean(err)),
        } as const;
        return (
          <div key={f.key}>
            <label htmlFor={fieldId(k)} className="block font-bold text-ink">
              {f.label}
              {f.required && (
                <span className="ms-1 text-brand-strong" aria-hidden="true">
                  *
                </span>
              )}
              {!f.required && <span className="ms-2 text-sm font-normal text-ink-3">(اختیاری)</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea {...common} rows={5} onChange={(e) => set(k, e.target.value)} className={`${common.className} resize-y`} />
            ) : (
              <input
                {...common}
                type={f.type === "tel" ? "tel" : "text"}
                inputMode={f.type === "tel" ? "tel" : undefined}
                autoComplete={k === "name" ? "name" : k === "phone" ? "tel" : undefined}
                dir={f.type === "tel" ? "ltr" : undefined}
                onChange={(e) => set(k, e.target.value)}
                className={`${common.className} ${f.type === "tel" ? "text-right" : ""}`}
              />
            )}
            {err && (
              <p id={errId(k)} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-400">
                <span aria-hidden="true">●</span>
                {err}
              </p>
            )}
          </div>
        );
      })}

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={`${uid}-website`}>وب‌سایت</label>
        <input
          id={`${uid}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      {TURNSTILE_SITE_KEY && CONTACT_ENABLED && <div ref={turnstileEl} dir="rtl" className="min-h-[65px]" />}

      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {status === "error" && formError && (
          <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm leading-7 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <p className="font-bold">{formError}</p>
            <p className="mt-1">
              راه‌های دیگر:{" "}
              <a href={telegram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold underline underline-offset-4">
                <Telegram className="size-4" />
                تلگرام
              </a>{" "}
              ·{" "}
              <a href={`mailto:${email}`} className="inline-flex items-center gap-1 font-bold underline underline-offset-4">
                <Mail className="size-4" />
                ایمیل
              </a>
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        aria-busy={status === "submitting"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-base font-bold text-brand-ink transition-colors hover:bg-brand-strong hover:text-white disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-44"
      >
        {status === "submitting" ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-brand-ink/30 border-t-brand-ink" aria-hidden="true" />
            در حال ارسال…
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
