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
There's no database: every page load reads straight from the GitHub Issues
board the agents use as their CRM, and every button (Approve/Deny, Mark
contacted, Close) writes straight back to it.

Set these to enable it:
- `DASHBOARD_PASSWORD` — the shared password that gates the page.
- `GH_TOKEN` — a GitHub token with Issues read/write on this repo.
- `GITHUB_REPOSITORY` — defaults to `marko663/gunafix.com`.

Without `DASHBOARD_PASSWORD` set, the page just shows it's not configured.

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
