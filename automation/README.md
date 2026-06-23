# GunaFix Growth Agents

24/7 background automation that grows the GunaFix business: finds local
businesses with outdated websites, drafts personalized outreach emails for
your approval, writes short-form video scripts/captions for social, and
keeps an eye on website traffic + Google Ads performance. One **leader**
agent rolls everything up and is the only one allowed to email you directly
— and only when something actually needs your attention.

This is a separate, dependency-free Node package (plain `.mjs`, Node's
built-in `fetch`/`http`/`crypto` only) so it never touches the Next.js
site's `tsconfig`, build, or `node_modules`. It runs on a schedule via
[`.github/workflows/growth-agents.yml`](../.github/workflows/growth-agents.yml)
— GitHub Actions cron is the "24/7," since this isn't a process you keep
running yourself.

## How it fits together

| Agent | File | Does | Can contact you directly? |
|---|---|---|---|
| Lead Finder | `src/agents/leadFinder.mjs` | Searches local businesses (Google Places), audits their site, opens a GitHub Issue per qualifying lead | No |
| Outreach | `src/agents/outreach.mjs` | Drafts a personalized cold email per lead with Claude, saves it as a **Gmail draft**, and asks permission to send it for you | No — emails only go out as a draft, or after you say yes (see below) |
| Social Content | `src/agents/socialContent.mjs` | Writes a short video script + IG/TikTok/Facebook captions, files it as an Issue to film, and asks permission to auto-post the FB caption | No — posts only after you say yes |
| Ads & Traffic | `src/agents/adsTraffic.mjs` | Posts a GA4 + Google Ads digest, flags the issue `urgent` on anomalies, and asks permission to cut a campaign's budget on a zero-conversion spend anomaly | No — only ever cuts spend, and only after you say yes |
| **Leader** | `src/agents/leader.mjs` | Rolls up the run, emails you immediately on anything `urgent` (including permission requests from the agents above), posts a run log, acknowledges any other reply you leave on an urgent issue | **Yes — the only one** |

## Two-way permission requests

Some agents need a one-time "yes" before they touch something irreversible (sending an email, spending ad budget, posting publicly). Instead of a separate channel, this rides the same GitHub Issues board:

1. An agent calls `requestPermission()` (`src/lib/permissions.mjs`), which files a GitHub issue labeled `awaiting-permission` + `urgent` with a plain-language question. The `urgent` label means the Leader's existing immediate-email alert fires on it — no separate notification path.
2. You reply on that issue with a comment containing **yes**/**approve** or **no**/**deny** — or click **Approve**/**Deny** in the local dashboard's "Needs your decision" section, which just posts the same kind of comment.
3. The next time the owning agent runs (every 6h via cron, or `workflow_dispatch` from the Actions tab for an immediate check), `resolvePermissions()` picks up your reply, closes the issue, and hands the agent back what it needs to act.

Today this covers: auto-sending a specific outreach draft, auto-posting a specific Facebook caption, and cutting a specific campaign's budget in half on a zero-conversion anomaly. Nothing escalates spend or posts automatically without you saying yes first.

Anything else labeled `urgent` that isn't a structured permission request (e.g. a traffic-cliff anomaly with no proposed fix) — replying on that issue just gets you an acknowledgment from the Leader; there's no free-form instruction parser yet.

Leads live as GitHub Issues (labels: `lead`, `status:new` →
`status:drafted` / `status:needs-contact-info` / `status:contacted`) — a
free CRM with no database to run. Move a lead to `status:contacted`
yourself once you've sent the drafted email.

**Nothing emails a prospect automatically.** Outreach only ever creates a
Gmail draft; you review and hit send. This was an explicit choice so a bad
draft can never go out under your name.

**No phone calls.** There's no Twilio/telephony wired up, so "leader
contacts you fast" currently means an immediate, clearly-flagged email
(subject prefixed `[URGENT]`) rather than an actual call. If you want real
calls, add a Twilio account and a small `lib/twilio.mjs` that the leader
calls instead of/alongside `sendEmail` in `handleUrgentItems()`.

## Setup checklist

Every credential below is optional independently — each agent logs
`[skip] ... missing X` and exits cleanly if it's not configured, so you can
turn pieces on one at a time. Add these as **GitHub Actions secrets**
(Settings → Secrets and variables → Actions → *Secrets*) or **variables**
(*Variables* tab, for non-sensitive values) on this repo.

### 1. Anthropic (drafts outreach copy, scripts, audit summaries)
- Secret: `ANTHROPIC_API_KEY` — from https://console.anthropic.com

### 2. GitHub (lead board + run log)
- Nothing to add — the default `GITHUB_TOKEN` Actions provides already
  works; the workflow grants it `issues: write`.

### 3. Google Places API (lead sourcing)
- Enable "Places API" in a Google Cloud project, create an API key.
- Secret: `GOOGLE_PLACES_API_KEY`
- Optional variables to steer search: `LEAD_CATEGORIES` (comma-separated,
  e.g. `plumber,dentist,roofing contractor`), `LEAD_REGIONS` (comma-separated
  `City State`), `LEADS_PER_RUN` (default 15). Defaults are intentionally
  broad/general across many industries and US cities.

### 4. Gmail API (outreach drafts + leader's urgent emails)
1. In Google Cloud Console, create an OAuth client of type **Desktop app**
   and enable the **Gmail API**.
2. Locally (not in CI):
   ```bash
   cd automation
   GMAIL_CLIENT_ID=xxx GMAIL_CLIENT_SECRET=yyy node src/scripts/getGmailRefreshToken.mjs
   ```
3. Open the printed URL, sign in with the Gmail account you want
   drafts/alerts to come from, approve access.
4. The script prints a refresh token — save it.
5. Secrets: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`.
   Variable: `SENDER_EMAIL` (defaults to `OWNER_EMAIL` if unset).

### 5. GA4 Data API (website traffic digest)
1. In Google Cloud Console, create a service account, enable the
   **Google Analytics Data API**.
2. In GA4 (Admin → Property Access Management), add that service account's
   email as a **Viewer**.
3. Secrets: `GA4_PROPERTY_ID` (numeric, Admin → Property details),
   `GA4_CLIENT_EMAIL` (service account email), `GA4_PRIVATE_KEY` (from the
   service account's JSON key — paste the `private_key` field, including
   the `\n`s, as-is).

### 6. Google Ads API (ads performance digest)
1. Apply for a developer token in the Google Ads API Center (test accounts
   work immediately; production access requires Google's review).
2. Create an OAuth client (type **Desktop app**) and get a refresh token
   for an account with access to the Ads account (same flow shape as the
   Gmail script — adapt `getGmailRefreshToken.mjs` with scope
   `https://www.googleapis.com/auth/adwords`, or reuse Google's own
   `generate_user_credentials.py` tool from the Ads API client docs).
3. Secrets: `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID` (no
   dashes), `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`,
   `GOOGLE_ADS_REFRESH_TOKEN`. If the customer is managed under an MCC,
   also set `GOOGLE_ADS_LOGIN_CUSTOMER_ID`.
4. Check `src/config.mjs`'s `googleAdsApiVersion` against
   https://developers.google.com/google-ads/api/docs/release-notes
   occasionally — Google retires old API versions on a fixed schedule.

### 7. Meta Graph API (optional FB/IG auto-features)
1. In Meta Business Suite, generate a long-lived Page access token for your
   Facebook Page, and connect the linked Instagram Business account.
2. Secrets: `META_PAGE_ACCESS_TOKEN`, `META_PAGE_ID`, `META_IG_USER_ID`.
3. This currently only powers the Facebook-conversations "contacts
   overview" in `socialContent.mjs`. `lib/meta.mjs` also has
   `postFacebookText`/`postInstagramImage`/`postInstagramVideo` ready to
   wire into an agent once you have an actual video file hosted somewhere
   public — see the TikTok note below.

**TikTok is intentionally not auto-posted.** TikTok's Content Posting API
requires an app audit before it can publish on your behalf, so
`socialContent.mjs` only produces a ready script + caption for you to
upload by hand.

## Running locally

```bash
cd automation
export $(grep -v '^#' .env.local | xargs)   # after copying .env.example to .env.local
node src/agents/leadFinder.mjs
node src/agents/outreach.mjs
node src/agents/socialContent.mjs
node src/agents/adsTraffic.mjs
node src/agents/leader.mjs
```

## Local dashboard

The Issues tab works, but it's not the friendliest thing to check from a
phone. `src/dashboard/server.mjs` is a small local web server (Node's
built-in `http`, no framework) that renders the same leads/drafts/social
content/run-log board as a single page, with one-click buttons for the
common actions ("Mark contacted", "Close"). **There is no local database —
every page load reads live from GitHub and every button writes straight
back to it**, so the dashboard can never drift out of sync with the Issues
tab; it's just a faster window onto the same data.

1. Create a GitHub personal access token with `repo` scope (classic), or a
   fine-grained token with **Issues: Read and write** on this repo, at
   https://github.com/settings/tokens — locally there's no auto-provided
   `GITHUB_TOKEN` like in Actions, so this is required.
2. Set `GH_TOKEN=<that token>` and `GITHUB_REPOSITORY=owner/repo` in
   `.env.local` (or export them directly).
3. Run it:
   ```bash
   cd automation
   export $(grep -v '^#' .env.local | xargs)
   npm run dashboard
   ```
4. Open `http://localhost:4040` (override with `DASHBOARD_PORT`).

Outreach emails still have to be sent by hand from Gmail — the dashboard
only mirrors GitHub, it doesn't touch the draft-only outreach flow.

## Running on GitHub Actions

Already wired up in `.github/workflows/growth-agents.yml`: runs every 6
hours via cron, plus `workflow_dispatch` for manual "run it now" from the
Actions tab. Add the secrets/variables above and it starts working — pieces
without credentials just no-op until you add them.
