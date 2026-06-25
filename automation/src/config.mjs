// Central env/config access for all growth agents. Every credential is
// optional at import time — each agent checks what it needs and skips (with
// a clear log line) instead of crashing, so partially-configured runs still
// do useful work.

function env(name, fallback) {
  const v = process.env[name];
  return v === undefined || v === "" ? fallback : v;
}

export const config = {
  // Identity / business info
  businessName: env("BUSINESS_NAME", "GunaFix"),
  businessUrl: env("BUSINESS_URL", "https://gunafix.com"),
  ownerName: env("OWNER_NAME", "Marko"),
  ownerEmail: env("OWNER_EMAIL", "markoguna9@gmail.com"),
  senderEmail: env("SENDER_EMAIL"), // Gmail address outreach is sent from
  businessPhysicalAddress: env("BUSINESS_PHYSICAL_ADDRESS"), // CAN-SPAM: required postal address for commercial email footers

  // Anthropic (Claude) — used for drafting outreach copy, audit summaries, social captions
  anthropicApiKey: env("ANTHROPIC_API_KEY"),
  anthropicModel: env("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
  anthropicFastModel: env("ANTHROPIC_FAST_MODEL", "claude-haiku-4-5"),

  // GitHub — used as the lead-tracking board (Issues) and for posting the leader's run reports
  githubToken: env("GH_TOKEN", env("GITHUB_TOKEN")),
  githubRepo: env("GITHUB_REPOSITORY"), // "owner/repo", set automatically by Actions

  // Google Places API — lead sourcing (business name/phone/website/address)
  googlePlacesApiKey: env("GOOGLE_PLACES_API_KEY"),

  // Gmail API (OAuth2 user refresh token) — create outreach drafts + leader urgent emails
  gmailClientId: env("GMAIL_CLIENT_ID"),
  gmailClientSecret: env("GMAIL_CLIENT_SECRET"),
  gmailRefreshToken: env("GMAIL_REFRESH_TOKEN"),

  // GA4 Data API — website traffic reporting
  ga4PropertyId: env("GA4_PROPERTY_ID"),
  ga4ClientEmail: env("GA4_CLIENT_EMAIL"), // service account
  ga4PrivateKey: env("GA4_PRIVATE_KEY"),

  // Google Search Console API — organic search performance reporting.
  // Reuses the GA4 service account (ga4ClientEmail/ga4PrivateKey) below —
  // just add that same service account as a user in Search Console too.
  searchConsoleSiteUrl: env("SEARCH_CONSOLE_SITE_URL"), // e.g. "https://gunafix.com/" or "sc-domain:gunafix.com"

  // Meta Graph API — optional FB/IG auto-posting
  metaPageAccessToken: env("META_PAGE_ACCESS_TOKEN"),
  metaPageId: env("META_PAGE_ID"),
  metaIgUserId: env("META_IG_USER_ID"),
  metaGraphApiVersion: env("META_GRAPH_API_VERSION", "v21.0"),

  // Lead sourcing defaults — broad/general per owner's explicit choice
  leadCategories: env(
    "LEAD_CATEGORIES",
    "plumber,electrician,dentist,lawyer,roofing contractor,hair salon,restaurant,auto repair shop,real estate agency,accounting firm,landscaping company,chiropractor,veterinarian,hvac contractor,bakery"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  leadRegions: env(
    "LEAD_REGIONS",
    "Chicago IL,Houston TX,Phoenix AZ,Philadelphia PA,San Antonio TX,Columbus OH,Charlotte NC,Indianapolis IN,Denver CO,Nashville TN"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  leadsPerRun: Number(env("LEADS_PER_RUN", "20")),
  // How many distinct category+region searches leadFinder runs per invocation —
  // the main lever for daily lead volume (each search costs a Places API call).
  leadSearchesPerRun: Number(env("LEAD_SEARCHES_PER_RUN", "8")),
};

export function requireFields(obj, fields, label) {
  const missing = fields.filter((f) => !obj[f]);
  if (missing.length > 0) {
    console.log(`[skip] ${label}: missing ${missing.join(", ")}`);
    return false;
  }
  return true;
}
