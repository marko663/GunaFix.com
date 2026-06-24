# GunaFix

Marketing website for GunaFix, an AI-accelerated web development studio.
Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and hand-rolled
shadcn/ui-style components on Radix primitives.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content

All copy, services, industries, technologies, pricing tiers and FAQ live in
one place: `src/data/content.ts`. Edit that file to update text anywhere on
the site, individual `/services/[slug]`, `/industries/[slug]` and
`/technologies/[slug]` pages are generated from it automatically, each with
its own SEO title and meta description.

## Contact form & booking

`src/app/api/contact/route.ts` handles both the contact form and the "Book a
call" request form. Copy `.env.example` to `.env.local` and set
`RESEND_API_KEY` (from [resend.com](https://resend.com)) to actually deliver
submissions by email. Without it, submissions are logged to the server
console so the forms still work end-to-end in development.

## Growth agents dashboard

`/dashboard` is a live, password-gated page on this site for running the
24/7 growth agents in `automation/` (lead finder, outreach, social content,
search & traffic, leader) — see `automation/README.md` for what they do.
There's no database: every page load reads straight from GitHub (the Issues
board the agents use as their CRM, and the Actions API for run status and
secrets/variables), and every action on the page writes straight back to it.

The page has four parts:
- **Issues board** — leads, outreach drafts, social content, search/traffic
  digests and permission requests, grouped by label. Approve/Deny, Mark
  contacted and Close write straight back to GitHub Issues.
- **Agents** — last run status/conclusion per agent job (all 5 agents run
  as jobs inside the single `growth-agents.yml` workflow), plus a "Run all
  agents now" button that fires `workflow_dispatch` for an immediate run
  instead of waiting for the 6h cron. Since the agents are jobs in one
  workflow rather than separate workflows, this always runs the whole
  pipeline — there's no per-agent trigger.
- **Credentials checklist** — every secret/variable the agents need (see
  `automation/README.md`), with a configured/missing status for each.
- **Setup assistant** — a chat box: paste an API key, token, or config value
  in plain language and Claude matches it to the right credential and writes
  it straight to this repo's GitHub Actions secrets/variables. Secret values
  are written via libsodium-sealed-box encryption (GitHub's required scheme)
  and are never echoed back in the chat. Only credential names from the
  fixed catalog in `src/lib/credentialCatalog.ts` can be written — the
  assistant can't write to arbitrary secret names.

Set these to enable it:
- `DASHBOARD_PASSWORD` — the shared password that gates the page.
- `GH_TOKEN` — a GitHub token covering Issues, Actions (runs + dispatch) and
  Secrets/Variables read/write on this repo — see `.env.example` for exact
  scopes.
- `GITHUB_REPOSITORY` — defaults to `marko663/gunafix.com`.
- `ANTHROPIC_API_KEY` — required for the setup assistant chat only; the rest
  of the dashboard works without it.

Without `DASHBOARD_PASSWORD` set, the page just shows it's not configured.
Without `GH_TOKEN`, it shows GitHub isn't configured. Without
`ANTHROPIC_API_KEY`, the rest of the dashboard still works — only the chat
is disabled.

## Before going live

- Have a lawyer review `src/app/privacy/page.tsx` and `src/app/terms/page.tsx`,
  they're solid starting templates, not legal advice.
- Set a real `CONTACT_EMAIL` / `RESEND_API_KEY` in production.
- Update `siteConfig.url` in `src/data/content.ts` if the production domain
  changes.

## Build

```bash
npm run build
npm run start
```
