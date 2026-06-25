# GunaFix Growth Agents

24/7 background automation that grows the GunaFix business: finds local
businesses with outdated websites, and sends each one a personalized cold
outreach email for real — automatically, in real time, from your own Gmail
account, no draft/approval step. It also writes short-form video
scripts/captions for social, and keeps an eye on website traffic + Google
Search Console performance. One **leader** agent rolls everything up and is
the only one allowed to email you directly — and only when something
actually needs your attention.

**⚠️ Outreach sends real, unreviewed email automatically, at volume.** This
was an explicit choice (real Gmail sending + a daily volume target) over the
safer draft-and-approve design this project started with. Before turning it
on, read "Real sending — what this means for your Gmail account" below.

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
| Outreach | `src/agents/outreach.mjs` | Drafts a personalized cold email per lead with Claude and **sends it for real**, immediately, from your own Gmail account. Watches each sent thread for replies: posts the full reply text to the issue, auto-drafts and sends a response, and books a real slot on your Google Calendar (if `OWNER_TIMEZONE` is set). Detects "unsubscribe" replies and permanently suppresses that lead | No — it emails *leads*, not you; see below |
| Social Content | `src/agents/socialContent.mjs` | Writes a short video script + IG/TikTok/Facebook captions, files it as an Issue to film, and asks permission to auto-post the FB caption | No — posts only after you say yes |
| Search & Traffic | `src/agents/searchTraffic.mjs` | Posts a GA4 + Google Search Console digest and flags the issue `urgent` on anomalies (traffic cliffs, organic click drops, ranking slides) | No |
| **Leader** | `src/agents/leader.mjs` | Rolls up the run, emails you immediately on anything `urgent` (including permission requests from the agents above), posts a run log, acknowledges any other reply you leave on an urgent issue | **Yes — the only one** |

## Two-way permission requests

Some agents need a one-time "yes" before they touch something irreversible (sending an email, posting publicly). Instead of a separate channel, this rides the same GitHub Issues board:

1. An agent calls `requestPermission()` (`src/lib/permissions.mjs`), which files a GitHub issue labeled `awaiting-permission` + `urgent` with a plain-language question. The `urgent` label means the Leader's existing immediate-email alert fires on it — no separate notification path.
2. You reply on that issue with a comment containing **yes**/**approve** or **no**/**deny** — or click **Approve**/**Deny** in the local dashboard's "Needs your decision" section, which just posts the same kind of comment.
3. The next time the owning agent runs (every 6h via cron, or `workflow_dispatch` from the Actions tab for an immediate check), `resolvePermissions()` picks up your reply, closes the issue, and hands the agent back what it needs to act.

Today this covers: auto-posting a specific Facebook caption. Outreach used
to ask permission before sending too, but per an explicit choice to make
sending real and high-volume, it no longer does — see below.

Anything else labeled `urgent` that isn't a structured permission request (e.g. a traffic-cliff anomaly with no proposed fix) — replying on that issue just gets you an acknowledgment from the Leader; there's no free-form instruction parser yet.

Leads live as GitHub Issues (labels: `lead`, `status:new` →
`status:needs-contact-info` / `status:contacted` → `status:meeting-booked`
once a reply gets auto-booked, plus `do-not-contact` once a lead
unsubscribes, and `contact:guessed` on leads where no real email was found
on their site — see below) — a free CRM with no database to run.

## Automatic reply handling + meeting booking

Every outreach run also re-checks every `status:contacted` lead's Gmail
thread for a reply (`checkReplies()` in `outreach.mjs`):

- **Any reply** (other than an unsubscribe) gets posted to the issue in
  full — visible on both dashboards under "Activity (replies, sends,
  bookings)" — then Claude drafts a short, warm response and it's sent for
  real, in the same thread, with no review step (`respondAndBook()`).
- **If `OWNER_TIMEZONE` is set**, that response also books a real meeting:
  `src/lib/calendar.mjs` queries your Google Calendar's free/busy via the
  same Gmail OAuth token (it needs the `calendar.events` scope too — see
  step 4 below), walks forward in 30-minute slots up to 14 days out
  skipping weekends and anything outside 9am–5pm in your timezone, picks
  the first open one, and creates a real Calendar event with the lead as an
  attendee (so they get a real invite). The issue moves to
  `status:meeting-booked` and the comment says exactly when.
- **If `OWNER_TIMEZONE` isn't set**, or no slot/booking attempt fails, the
  reply still goes out — it just asks the lead to propose a time instead of
  booking one automatically.
- **Unsubscribe-style replies** still short-circuit all of this: the lead is
  marked `do-not-contact` and nothing is sent back.

This only catches replies in the *same thread* as a prior send, and only
once per lead — there's no reschedule/multi-turn conversation handling yet,
so a second reply on an already-`status:meeting-booked` thread won't get an
automatic response.

## Real sending — what this means for your Gmail account

Outreach sends every drafted email immediately and automatically, from
whatever Gmail account you authorized (`GMAIL_REFRESH_TOKEN` — see setup
below), with no per-email review. This is a deliberate tradeoff for real,
high-volume, real-time sending instead of the safer draft-and-approve flow.
A few real risks worth knowing before you turn the volume up:

- **Account risk.** Personal Gmail accounts aren't built for bulk outbound
  email. Sending many near-identical cold emails per day is the kind of
  pattern Google's abuse detection looks for, and can get the account
  rate-limited or suspended well before Gmail's documented 500/day cap.
  Watch the account for warnings, and consider a Google Workspace account
  (higher limits, built for business sending) if volume keeps climbing.
- **Legal compliance (US CAN-SPAM).** Commercial email needs a valid
  physical postal address and a working opt-out. Set
  `BUSINESS_PHYSICAL_ADDRESS` — every send appends it plus an unsubscribe
  line. Outreach also re-checks every previously-contacted lead's Gmail
  thread each run and labels it `do-not-contact` (permanently skipped) the
  moment it sees an "unsubscribe"-style reply. This only catches replies in
  the *same thread* as a prior send — it's not a general suppression list.
- **Deliverability.** Sending 200+/day from a brand-new sending pattern
  tends to land in spam at first ("reputation warm-up"). Going out steadily
  over the day (the `*/15 * * * *` outreach schedule) rather than in one
  burst helps, but expect some tuning.
- **Volume is bounded by real leads with a real email on file**, not by
  outreach itself — it sends to every `status:new` lead it has an address
  for, every run, with no cap. Hitting a daily target depends on Lead
  Finder sourcing that many qualifying businesses with a discoverable email
  (see `LEAD_SEARCHES_PER_RUN` below) — actual yield varies by
  category/region and isn't guaranteed.

**No phone calls.** There's no Twilio/telephony wired up, so "leader
contacts you fast" currently means an immediate, clearly-flagged email
(subject prefixed `[URGENT]`) rather than an actual call. If you want real
calls, add a Twilio account and a small `lib/twilio.mjs` that the leader
calls instead of/alongside `sendEmail` in `handleUrgentItems()`.

## Hitting the daily volume target

`DAILY_EMAIL_TARGET` (default 200) is a target outreach is paced against,
**not a guaranteed number** — there's no way to guarantee it, because the
real bottleneck is how many qualifying local businesses with a usable email
Lead Finder turns up that day, not how fast outreach can send. Two things
work together to get as close to the target as the available leads allow:

- **Pacing (`src/lib/dailyPace.mjs`).** A pinned `[Outreach] Daily Send
  Counter` issue tracks how many emails have actually gone out today
  (resets at UTC midnight). Every Lead Finder run reads it, compares against
  how far through the day it is, and searches harder than
  `LEAD_SEARCHES_PER_RUN` when behind pace — up to 3x, capped so a bad day
  doesn't blow out Places API billing trying to catch up in one run. The
  leader's run log now shows `Emails sent today: X / Y target` so you can
  see at a glance whether a given day is on track.
- **Email-discovery fallback.** Previously a lead with no email scraped off
  its site just sat stuck in `status:needs-contact-info` forever. Now Lead
  Finder makes one fallback guess (`info@<their domain>`) and labels that
  issue `contact:guessed` so it's still visible as lower-confidence. There's
  no retry/bounce-handling — a wrong guess just goes nowhere once, it isn't
  repeated — but guessed addresses do bounce more often than scraped ones,
  which is a real deliverability/reputation cost, so treat the
  `contact:guessed` label as a signal worth watching, not a free volume
  lever to lean on hard.

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
  `City State`), `LEADS_PER_RUN` (results scanned per search, default 20),
  `LEAD_SEARCHES_PER_RUN` (distinct searches per run, default 8 — this is
  the main daily-volume lever; each search is a billed Places API call, so
  raise it gradually and watch your Google Cloud billing). Defaults are
  intentionally broad/general across many industries and US cities.
- `DAILY_EMAIL_TARGET` (default 200) — see "Hitting the daily volume
  target" below for how Lead Finder uses this to pace its own search
  aggressiveness against outreach's actual send rate.

### 4. Gmail API (real outreach sends + leader's urgent emails + reply auto-booking)
1. In Google Cloud Console, create an OAuth client of type **Desktop app**
   and enable the **Gmail API** and the **Google Calendar API** (the same
   account's primary calendar is used for auto-booking).
2. Locally (not in CI):
   ```bash
   cd automation
   GMAIL_CLIENT_ID=xxx GMAIL_CLIENT_SECRET=yyy node src/scripts/getGmailRefreshToken.mjs
   ```
3. Open the printed URL, sign in with **the Gmail account you want outreach
   to send from** (the `From:` header is whatever `SENDER_EMAIL`/`OWNER_EMAIL`
   is set to, but Gmail will only actually send as an address this account is
   authorized for — they need to match), approve access. The requested
   scope covers sending, reading replies (unsubscribe detection), and
   `calendar.events` (auto-booking a meeting on reply).
4. The script prints a refresh token — save it. **If you already had a
   GMAIL_REFRESH_TOKEN from before this feature**, it was issued with fewer
   scopes (compose, or compose+readonly) — re-run the script and replace it,
   or reply-detection/auto-booking won't work.
5. Secrets: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`.
   Variables: `SENDER_EMAIL` (defaults to `OWNER_EMAIL` if unset),
   `BUSINESS_PHYSICAL_ADDRESS` (required by US CAN-SPAM law for the
   footer on every outreach email — see "Real sending" above), and
   `OWNER_TIMEZONE` (IANA tz, e.g. `America/New_York` — required for
   automatic meeting booking on reply; see "Automatic reply handling +
   meeting booking" above. Without it, outreach still auto-replies but asks
   the lead to propose a time instead of booking one for them).

### 5. GA4 Data API (website traffic digest)
1. In Google Cloud Console, create a service account, enable the
   **Google Analytics Data API**.
2. In GA4 (Admin → Property Access Management), add that service account's
   email as a **Viewer**.
3. Secrets: `GA4_PROPERTY_ID` (numeric, Admin → Property details),
   `GA4_CLIENT_EMAIL` (service account email), `GA4_PRIVATE_KEY` (from the
   service account's JSON key — paste the `private_key` field, including
   the `\n`s, as-is).

### 6. Google Search Console API (organic search performance digest)
Reuses the same service account from step 5 (GA4) — no separate OAuth app
or token needed.
1. In [Search Console](https://search.google.com/search-console), go to
   Settings → **Users and permissions** → Add user, and add the
   `GA4_CLIENT_EMAIL` service account email (Restricted access is enough).
2. In Google Cloud Console, enable the **Search Console API** on the same
   project as the GA4 service account.
3. Variable: `SEARCH_CONSOLE_SITE_URL` — the exact property as it appears
   in Search Console, e.g. `https://gunafix.com/` (URL-prefix property) or
   `sc-domain:gunafix.com` (Domain property).

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
node src/agents/searchTraffic.mjs
node src/agents/leader.mjs
```

## Dashboard

The Issues tab works, but it's not the friendliest thing to check from a
phone. The recommended way to act on leads, drafts and permission requests
day-to-day is the live `/dashboard` page on the actual website (see the root
`README.md`'s "Growth agents dashboard" section) — set `DASHBOARD_PASSWORD`,
`GH_TOKEN`, `GITHUB_REPOSITORY` and `ANTHROPIC_API_KEY` on the site's hosting
provider and it's reachable from anywhere, no local process to keep running.
That page also shows each agent's last run status, lets you trigger an
immediate run, and has a chat where you can paste credentials in plain
language and have them written straight to this list of secrets/variables
below — see `src/lib/credentialCatalog.ts` on the website for the exact set
it knows how to write.

`src/dashboard/server.mjs` is the original local version: a small local web
server (Node's built-in `http`, no framework) that renders the same
leads/drafts/social content/run-log board as a single page, with one-click
buttons for the common actions ("Mark contacted", "Close"). It's kept around
as a dev/debug fallback when you'd rather not expose the page publicly, or
want to poke at the GitHub API without touching the live site. **There is no
local database — every page load reads live from GitHub and every button
writes straight back to it**, so either dashboard can never drift out of
sync with the Issues tab or with each other; they're just two windows onto
the same data.

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

Outreach now sends for real on its own schedule — neither dashboard is in
that loop, they only mirror GitHub.

## Running on GitHub Actions

Already wired up in `.github/workflows/growth-agents.yml`, with three
schedules instead of one cadence for everything: outreach drains its send
queue every 15 minutes (real-time sending), Lead Finder sources new leads
hourly (kept slower since it's the one with a real per-call Google Cloud
cost), and social content/search-traffic/leader stay on the original every-6-hours
cadence. `workflow_dispatch` still works for manual "run it now" from the
Actions tab. Add the secrets/variables above and it starts working — pieces
without credentials just no-op until you add them.
