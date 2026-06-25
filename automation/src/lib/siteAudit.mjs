// Heuristic "is this website outdated?" audit. No headless browser — just
// fetches the HTML and checks cheap, reliable signals. Good enough to triage
// leads worth a human (or Claude-drafted) outreach email.

const CURRENT_YEAR = new Date().getFullYear();

export async function auditWebsite(url) {
  const issues = [];
  let html = "";
  let finalUrl = url;
  let usedHttps = url.startsWith("https://");

  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: { "user-agent": "Mozilla/5.0 (compatible; GunaFixAuditBot/1.0)" },
    });
    finalUrl = res.url || url;
    usedHttps = finalUrl.startsWith("https://");
    if (!res.ok) {
      issues.push(`Site responded with HTTP ${res.status}`);
    }
    html = await res.text();
  } catch (err) {
    issues.push(`Site unreachable: ${err.message}`);
    return { score: 100, issues, reachable: false, finalUrl };
  }

  if (!usedHttps) {
    issues.push("No HTTPS (insecure connection, browsers flag it)");
  }

  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  if (!hasViewport) {
    issues.push("No responsive viewport meta tag (likely not mobile-friendly)");
  }

  const hasMetaDescription = /<meta[^>]+name=["']description["']/i.test(html);
  if (!hasMetaDescription) {
    issues.push("Missing meta description (hurts SEO/click-through)");
  }

  const copyrightMatch = html.match(/(?:©|\(c\)|copyright)\s*(\d{4})/i);
  if (copyrightMatch) {
    const year = Number(copyrightMatch[1]);
    if (year > 1990 && year < CURRENT_YEAR - 2) {
      issues.push(`Footer copyright year looks stale (${year})`);
    }
  }

  const usesFlash = /\.swf\b|application\/x-shockwave-flash/i.test(html);
  if (usesFlash) issues.push("References Flash content (dead technology)");

  const usesTables = /<table[^>]*>[\s\S]*<table[^>]*>/i.test(html);
  if (usesTables) issues.push("Heavy nested-table layout (old-school markup)");

  const hasFramesets = /<frameset|<frame\s/i.test(html);
  if (hasFramesets) issues.push("Uses HTML framesets (very outdated)");

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    issues.push("Missing or empty <title> tag");
  }

  const score = Math.min(100, issues.length * 18);
  const emails = extractEmails(html);

  return { score, issues, reachable: true, finalUrl, emails };
}

export function isOutdated(auditResult) {
  return !auditResult.reachable || auditResult.score >= 36;
}

/** Single-pattern fallback guess (info@domain) for sites where no real email was found in the HTML — unverified, and outreach only ever sends to it once (no bounce handling/retry exists), so a wrong guess just goes nowhere instead of repeating. */
export function guessContactEmail(website) {
  try {
    const host = new URL(website).hostname.replace(/^www\./, "");
    if (!host.includes(".")) return null;
    return `info@${host}`;
  } catch {
    return null;
  }
}

/** Pulls plausible contact emails out of raw HTML (mailto: links + bare text matches). */
export function extractEmails(html) {
  const found = new Set();
  const mailtoRe = /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const bareRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  for (const re of [mailtoRe, bareRe]) {
    for (const match of html.matchAll(re)) {
      const email = (match[1] || match[0]).toLowerCase();
      if (!/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(email)) {
        found.add(email);
      }
    }
  }
  return [...found];
}
