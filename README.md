# Confluence Signals

A free-hosted forex + gold signal dashboard. Users unlock it with an
access key that only you (the admin) can generate. Prices come from
Twelve Data, an automated Vercel Cron job rescans the market every 15
minutes using an MMR (Measured Move Ratio, range ÷ 2.6) rule engine,
and Gemini writes a short plain-English explanation of each computed
score — Gemini does **not** invent the score itself.

**This is an educational tool, not financial advice.** No entry is
certain — see the disclaimer baked into the UI.

## What "always free" actually means here

- **Hosting:** Vercel's free (Hobby) tier — no server to keep alive,
  code runs on-demand as serverless functions.
- **Data:** Twelve Data free tier — 800 requests/day, 8/minute. The
  scanner paces itself to stay under this, which is why it checks
  **2 timeframes** (4h for bias, 15min for the entry) instead of all
  five in your reference material. You can add more timeframes if you
  upgrade the data plan later (just edit `TIMEFRAME_PAIR` in
  `app/api/cron/scan/route.ts`).
- **Storage:** Upstash Redis free tier, via Vercel's integration —
  stores access keys and the latest cached signals.
- **Gemini:** your existing key, used only for narration text.

Free tiers can rate-limit or occasionally cold-start slowly — "always
live" here means "always reachable, auto-scales, no server to
babysit," not "zero limits."

## 1. Get your free accounts/keys

1. **Twelve Data** — sign up free at https://twelvedata.com, copy your API key.
2. **Gemini** — you already have this (https://aistudio.google.com/apikey).
3. **Vercel** — sign up free at https://vercel.com (GitHub login is easiest).
4. **Upstash Redis** — easiest path: add it *from inside Vercel* (step 4 below) and it configures itself. Or sign up separately free at https://upstash.com.

## 2. Push this project to GitHub

Create a new empty GitHub repo, then from this folder:

```bash
git init
git add .
git commit -m "Confluence signals app"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 3. Import into Vercel

1. In Vercel, "Add New Project" → import your GitHub repo.
2. Framework preset: Next.js (auto-detected).
3. Don't deploy yet — add environment variables first (next step).

## 4. Add Upstash Redis (free) via Vercel

In your Vercel project → **Storage** tab → **Create Database** →
choose **Upstash Redis** → follow the prompts. This automatically
sets `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for you.

## 5. Set the remaining environment variables

Project → **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `TWELVE_DATA_API_KEY` | from step 1 |
| `GEMINI_API_KEY` | your existing key |
| `ADMIN_SECRET` | make up a long random password — this is YOUR login for `/admin` |
| `CRON_SECRET` | make up another random string |

For `CRON_SECRET` to actually protect the cron endpoint, also add it
under Vercel's **Cron Jobs** settings (Vercel auto-sends it as a
Bearer token to your cron route when configured there) — see
https://vercel.com/docs/cron-jobs/manage-cron-jobs for the current
steps, since this UI occasionally changes.

## 6. Deploy

Click Deploy. Vercel will also read `vercel.json` and register the
cron job (`/api/cron/scan`, every 15 minutes) automatically.

## 7. Use it

- **You (admin):** go to `https://<your-app>.vercel.app/admin`, log in
  with `ADMIN_SECRET`, click "Generate new key," and send that key to
  a user.
- **Users:** go to `https://<your-app>.vercel.app`, paste the key,
  see live signals. The dashboard auto-refreshes every 60 seconds
  from the cached scan (the scan itself runs every 15 minutes).

To force an immediate scan instead of waiting for the cron schedule,
visit `/api/cron/scan` in a browser once (it'll run without the
`Authorization` header check only if you haven't set `CRON_SECRET` —
for a quick first test you can temporarily leave `CRON_SECRET` unset,
then add it back before sharing the app).

## Editing the tracked pairs or the scoring logic

- Symbols scanned: `lib/pairs.ts`
- MMR + scoring math: `lib/mmr.ts`
- Gemini prompt: `lib/gemini.ts`
- Timeframes used by the automated scan: `app/api/cron/scan/route.ts`

## Local development

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Note: the cron job doesn't run automatically in local dev — hit
`http://localhost:3000/api/cron/scan` manually to populate signals.
