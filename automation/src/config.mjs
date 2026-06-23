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
  senderEmail: env("SENDER_EMAIL"), // Gmail address outreach drafts/sends are created from

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

  // Google Ads API — ads performance reporting
  googleAdsDeveloperToken: env("GOOGLE_ADS_DEVELOPER_TOKEN"),
  googleAdsCustomerId: env("GOOGLE_ADS_CUSTOMER_ID"),
  googleAdsLoginCustomerId: env("GOOGLE_ADS_LOGIN_CUSTOMER_ID"),
  googleAdsClientId: env("GOOGLE_ADS_CLIENT_ID"),
  googleAdsClientSecret: env("GOOGLE_ADS_CLIENT_SECRET"),
  googleAdsRefreshToken: env("GOOGLE_ADS_REFRESH_TOKEN"),
  // Bump if Google deprecates this version: https://developers.google.com/google-ads/api/docs/release-notes
  googleAdsApiVersion: env("GOOGLE_ADS_API_VERSION", "v17"),

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
  leadsPerRun: Number(env("LEADS_PER_RUN", "15")),
};

export function requireFields(obj, fields, label) {
  const missing = fields.filter((f) => !obj[f]);
  if (missing.length > 0) {
    console.log(`[skip] ${label}: missing ${missing.join(", ")}`);
    return false;
  }
  return true;
}
