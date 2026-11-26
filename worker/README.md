# Learnamuse contact Worker

Cloudflare Worker that receives the website's contact form and forwards it to the **admin chat of the Learnamuse Bale bot** ([ble.ir/LearnamuseBot](https://ble.ir/LearnamuseBot)), and optionally to Telegram as well.
The bot's own web API runs only on the local network, so the website can't post to it directly; this Worker calls the public Bale Bot API (`https://tapi.bale.ai/bot<TOKEN>/sendMessage`) with the same bot token instead.
The website is a static export on GitHub Pages, so the form posts cross-origin to this Worker.

```
POST /contact   {"name","phone","message?","wantsCollaboration","turnstileToken?","website?"}
GET  /health    {"ok":true}
```

Every response body matches `ContactResult` in `src/lib/contact-client.ts`:
`{ "ok": true }` or `{ "ok": false, "error": "…", "fieldErrors": { … } }`.

| Status | When |
|---|---|
| 200 | Delivered to at least one channel or archived (or honeypot hit: the response says success, but the message is dropped) |
| 204 | CORS preflight |
| 400 | Malformed JSON, or the body is not an object |
| 403 | Origin not allowed, or Turnstile failed |
| 404 / 405 | Unknown path or method |
| 413 | Body larger than 10 KB |
| 415 | Content-Type is not `application/json` |
| 422 | Validation failed (`fieldErrors` has Persian messages) |
| 429 | Rate limited (`Retry-After: 60`) |
| 502 / 503 | Every configured channel failed / no delivery channel configured (and nothing archived) |

## How it works

- **Validation**: `src/validation.ts` is the only copy of the rules. The website imports the same file, so client and server can't disagree. The rules:
  - Name: 2 to 80 characters, with whitespace collapsed.
  - Phone: an Iranian mobile number. Persian and Arabic digits are accepted, as are the prefixes `+98`, `0098`, `98` and `0`. It is normalized to `09xxxxxxxxx`.
  - Message: optional, at most 2000 characters.
- **CORS**: only exact origins listed in `ALLOWED_ORIGINS` are allowed (set in `wrangler.toml` `[vars]`). Requests without an `Origin` header are rejected.
- **Spam protection**:
  - The hidden `website` field is a honeypot.
  - Cloudflare Turnstile is checked when the `TURNSTILE_SECRET` secret is set.
  - Each IP is rate limited. This uses the **Workers Rate Limiting binding** (`[[ratelimits]]` `CONTACT_RATE_LIMITER`, 5 requests per 60 s), which is configured in `wrangler.toml`. If that binding is removed, a KV fixed-window limiter is used instead (`RATE_LIMIT_KV` binding, default 5 per 600 s, best effort because KV is eventually consistent). The IP is hashed before it is used as a KV key.
- **Delivery**: each message is sent, in parallel, to every configured channel:
  - **Bale** (primary, `BALE_BOT_TOKEN` + `BALE_CHAT_ID`): plain text, no `parse_mode` — the bot's own admin notices are sent the same way, and plain text means user input can't inject markup and needs no escaping.
  - **Telegram** (optional, `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`): the same content as HTML, with user input HTML-escaped.

  The request succeeds if at least one delivery succeeds or the message was archived. A Bot API reply of `{"ok":false}` counts as a failure; each call times out after 10 s. Optionally, each message is also archived in KV (`MESSAGES_KV`, 180-day TTL) or in D1 (`DB`, see `schema.sql`), so a messenger outage does not lose messages.

  Sample message (Bale):
  ```
  📩 پیام جدید از وب‌سایت لرناموز

  👤 نام: سارا رحیمی
  📱 موبایل: 09123456789
  🤝 تمایل به همکاری آموزشی: بله ✅

  💬 پیام:
  سلام! می‌خواهم دربارهٔ کلاس زبان بپرسم.

  🕒 زمان: پنجشنبه ۵ آذر ۱۴۰۵، ساعت ۱۴:۳۰
  🌐 صفحه: https://learnamuse.github.io › ارتباط با ما
  ```
  The phone is always normalized to a bare `09xxxxxxxxx` so admins can tap or copy it to call. The time is a Jalali date in Asia/Tehran. An empty message shows «(بدون متن — فقط درخواست تماس)».
- **Logs**: only an outcome and a status code are logged. Names, phones, messages and IPs are never logged.

## Develop and test

```bash
cd worker
npm ci
npm test            # vitest, no network (fetch is mocked); also tests src/lib/contact-client.ts
npm run typecheck
cp .dev.vars.example .dev.vars && npm run dev   # local server on http://localhost:8787
```

`wrangler dev` needs the `workerd` binary. If npm blocked its install script, run `npm approve-scripts workerd` (or `npm rebuild workerd`).

### End-to-end test without real messengers

`BALE_API_BASE` (and `TELEGRAM_API_BASE`) override the Bot API host, so you can point the Worker at a fake Bale server that just records `sendMessage` calls. Never set them in production.

```bash
# 1. a fake Bale API on :8788 that prints every call, e.g.
node -e 'require("http").createServer((q,r)=>{let b="";q.on("data",c=>b+=c);q.on("end",()=>{console.log(q.url,b);r.setHeader("Content-Type","application/json");r.end("{\"ok\":true,\"result\":{}}")})}).listen(8788)'
# 2. the Worker, pointed at it
npx wrangler dev --port 8787 --var BALE_BOT_TOKEN:fake --var BALE_CHAT_ID:1 --var BALE_API_BASE:http://127.0.0.1:8788
# 3. the site, built against the local Worker in its own build dir (from the repo root)
NEXT_PUBLIC_CONTACT_ENDPOINT=http://127.0.0.1:8787/contact NEXT_DIST_DIR=.next-contact npx next build
npx serve .next-contact -l 3000     # http://localhost:3000 is in ALLOWED_ORIGINS
```

## Deploy

You need: a Cloudflare account, the Learnamuse Bale bot's token, and the id of the admin channel/group the bot already reports to.

1. **Get the Bale values.**
   - `BALE_BOT_TOKEN`: the token of the Learnamuse bot (the same one the bot server uses; from Bale's BotFather). Copy it straight into the prompt in step 2 — don't paste it into files, chats or commits.
   - `BALE_CHAT_ID`: the admin channel/group id. Use the bot's existing `ADMIN_CHANNEL_ID` value (the owner knows it). The bot must be a member (for a channel: an admin with permission to post) of that chat — it already is if the bot's own admin notices arrive there. To use a different chat, add the bot to it and read the chat id from the bot's updates.
2. **Log in and set the secrets:**
   ```bash
   cd worker
   npx wrangler login
   npx wrangler secret put BALE_BOT_TOKEN
   npx wrangler secret put BALE_CHAT_ID
   # optional second channel (Telegram bot from @BotFather + its chat id, groups start with -100…):
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put TELEGRAM_CHAT_ID
   # optional: create a Turnstile widget for learnamuse.com + learnamuse.github.io, then
   npx wrangler secret put TURNSTILE_SECRET
   ```
3. **Deploy:** `npm run deploy`. Note the URL that is printed, for example `https://learnamuse-contact.<account>.workers.dev`.
4. **Check it** — a test message should appear in the Bale admin chat:
   ```bash
   curl -i -X POST https://learnamuse-contact.<account>.workers.dev/contact \
     -H 'Origin: https://learnamuse.github.io' -H 'Content-Type: application/json' \
     -d '{"name":"تست","phone":"09120000000","message":"پیام آزمایشی","wantsCollaboration":false}'
   ```
   `200 {"ok":true}` means delivered. `502` means Bale rejected the call: check the token, the chat id, and that the bot is a member/admin of that chat (`npx wrangler tail` shows only the outcome, never the message).
5. In the GitHub repo, go to **Settings → Secrets and variables → Actions → Variables** and add:
   - `NEXT_PUBLIC_CONTACT_ENDPOINT` = `https://learnamuse-contact.<account>.workers.dev/contact`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the Turnstile *site* key (only if you set `TURNSTILE_SECRET`)

   Then re-run the **Deploy to GitHub Pages** workflow (Actions → Deploy to GitHub Pages → Run workflow). Until the endpoint variable exists, the form tells visitors to use the Bale bot or Telegram instead.

`ALLOWED_ORIGINS` in `wrangler.toml` already lists `https://learnamuse.github.io` (the Pages site, whatever its path) and `https://learnamuse.com`. Add any other origin that hosts the form.

### Deploy from GitHub Actions (optional)

`.github/workflows/worker-deploy.yml` deploys on pushes to `main` that touch `worker/**`. It is skipped until you add:

- Secret `CLOUDFLARE_API_TOKEN`: create it from the "Edit Cloudflare Workers" template.
- Variable `CLOUDFLARE_ACCOUNT_ID`.

The Worker secrets (`BALE_*`, `TELEGRAM_*`, `TURNSTILE_SECRET`) stay in Cloudflare (set once with `wrangler secret put`; deploys keep them) and are not needed in GitHub.

### Custom domain for the Worker (optional)

To serve the Worker from a hostname like `contact.learnamuse.com`, add a route or custom domain in the Cloudflare dashboard. Then update `NEXT_PUBLIC_CONTACT_ENDPOINT` to match.
