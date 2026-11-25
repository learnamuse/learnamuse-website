# Learnamuse contact Worker

Cloudflare Worker that receives the website's contact form and forwards it to Telegram.
The website is a static export on GitHub Pages, so the form posts cross-origin to this Worker.

```
POST /contact   {"name","phone","message?","wantsCollaboration","turnstileToken?","website?"}
GET  /health    {"ok":true}
```

Every response body matches `ContactResult` in `src/lib/contact-client.ts`:
`{ "ok": true }` or `{ "ok": false, "error": "…", "fieldErrors": { … } }`.

| Status | When |
|---|---|
| 200 | Delivered (or honeypot hit: the response says success, but the message is dropped) |
| 204 | CORS preflight |
| 400 | Malformed JSON, or the body is not an object |
| 403 | Origin not allowed, or Turnstile failed |
| 404 / 405 | Unknown path or method |
| 413 | Body larger than 10 KB |
| 415 | Content-Type is not `application/json` |
| 422 | Validation failed (`fieldErrors` has Persian messages) |
| 429 | Rate limited (`Retry-After: 60`) |
| 502 / 503 | Telegram failed / no delivery channel configured |

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
- **Delivery**: a Persian HTML message goes to Telegram through the Bot API. User input is HTML-escaped. Optionally, each message is also archived in KV (`MESSAGES_KV`, 180-day TTL) or in D1 (`DB`, see `schema.sql`). If either archive is present, a Telegram outage does not lose messages.
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

## Deploy

1. Create a Telegram bot with [@BotFather](https://t.me/BotFather) and add it to the chat or group that should receive messages. To get the chat id, send the bot a message and open `https://api.telegram.org/bot<TOKEN>/getUpdates`. Group ids start with `-100…`.
2. Log in and set the secrets:
   ```bash
   cd worker
   npx wrangler login
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put TELEGRAM_CHAT_ID
   # optional: create a Turnstile widget for learnamuse.com + learnamuse.github.io, then
   npx wrangler secret put TURNSTILE_SECRET
   ```
3. Deploy: `npm run deploy`. Note the URL that is printed, for example `https://learnamuse-contact.<account>.workers.dev`.
4. Check it:
   ```bash
   curl -i -X POST https://learnamuse-contact.<account>.workers.dev/contact \
     -H 'Origin: https://learnamuse.com' -H 'Content-Type: application/json' \
     -d '{"name":"تست","phone":"09120000000","message":"سلام","wantsCollaboration":false}'
   ```
5. In the GitHub repo, go to **Settings → Secrets and variables → Actions → Variables** and add:
   - `NEXT_PUBLIC_CONTACT_ENDPOINT` = `https://learnamuse-contact.<account>.workers.dev/contact`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the Turnstile *site* key (only if you set `TURNSTILE_SECRET`)

   Then re-run the **Deploy to GitHub Pages** workflow. Until the endpoint variable exists, the form tells visitors to use Telegram or email instead.

### Deploy from GitHub Actions (optional)

`.github/workflows/worker-deploy.yml` deploys on pushes to `main` that touch `worker/**`. It is skipped until you add:

- Secret `CLOUDFLARE_API_TOKEN`: create it from the "Edit Cloudflare Workers" template.
- Variable `CLOUDFLARE_ACCOUNT_ID`.

The Worker secrets (`TELEGRAM_*`, `TURNSTILE_SECRET`) stay in Cloudflare and are not needed in GitHub.

### Custom domain for the Worker (optional)

To serve the Worker from a hostname like `contact.learnamuse.com`, add a route or custom domain in the Cloudflare dashboard. Then update `NEXT_PUBLIC_CONTACT_ENDPOINT` to match.
