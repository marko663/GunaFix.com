// Single source of truth for every credential the growth agents
// (.github/workflows/growth-agents.yml) read via `secrets.*` / `vars.*`.
// Drives three things on the dashboard: the credentials checklist card,
// the setup-assistant chat's whitelist of names it's allowed to write, and
// its system prompt. Never invent a name outside this list when writing to
// GitHub — that's what stops a chat-driven write from touching an unrelated
// secret like GH_TOKEN or DASHBOARD_PASSWORD.

export type CredentialKind = "secret" | "variable";

export type CredentialGroup =
  | "anthropic"
  | "google-places"
  | "gmail"
  | "ga4"
  | "search-console"
  | "meta"
  | "business";

export type CredentialDef = {
  name: string;
  kind: CredentialKind;
  group: CredentialGroup;
  label: string;
  description: string;
};

export const CREDENTIAL_GROUPS: Record<CredentialGroup, string> = {
  anthropic: "Anthropic (outreach copy, scripts, audit summaries)",
  "google-places": "Google Places API (lead sourcing)",
  gmail: "Gmail API (outreach drafts + urgent alerts)",
  ga4: "GA4 Data API (website traffic digest)",
  "search-console": "Google Search Console (organic search digest)",
  meta: "Meta Graph API (Facebook/Instagram)",
  business: "Business info (used in outreach copy & alerts)",
};

export const CREDENTIAL_CATALOG: CredentialDef[] = [
  {
    name: "ANTHROPIC_API_KEY",
    kind: "secret",
    group: "anthropic",
    label: "Anthropic API key",
    description: "From console.anthropic.com. Drafts outreach emails, video scripts, and digests.",
  },
  {
    name: "GOOGLE_PLACES_API_KEY",
    kind: "secret",
    group: "google-places",
    label: "Google Places API key",
    description: "Google Cloud project with the Places API enabled. Used to find local-business leads.",
  },
  {
    name: "GMAIL_CLIENT_ID",
    kind: "secret",
    group: "gmail",
    label: "Gmail OAuth client ID",
    description: "From a Google Cloud Desktop-app OAuth client with the Gmail API enabled.",
  },
  {
    name: "GMAIL_CLIENT_SECRET",
    kind: "secret",
    group: "gmail",
    label: "Gmail OAuth client secret",
    description: "Paired with GMAIL_CLIENT_ID, from the same OAuth client.",
  },
  {
    name: "GMAIL_REFRESH_TOKEN",
    kind: "secret",
    group: "gmail",
    label: "Gmail refresh token",
    description: "Printed by automation/src/scripts/getGmailRefreshToken.mjs after a one-time local sign-in.",
  },
  {
    name: "SENDER_EMAIL",
    kind: "variable",
    group: "gmail",
    label: "Sender email",
    description: "The Gmail address drafts/alerts come from. Defaults to OWNER_EMAIL if unset.",
  },
  {
    name: "GA4_PROPERTY_ID",
    kind: "secret",
    group: "ga4",
    label: "GA4 property ID",
    description: "Numeric ID from GA4 Admin → Property details.",
  },
  {
    name: "GA4_CLIENT_EMAIL",
    kind: "secret",
    group: "ga4",
    label: "GA4 service account email",
    description: "Service account with Viewer access on the GA4 property (also reused for Search Console).",
  },
  {
    name: "GA4_PRIVATE_KEY",
    kind: "secret",
    group: "ga4",
    label: "GA4 service account private key",
    description: "The private_key field from that service account's JSON key, including the \\n's, pasted as-is.",
  },
  {
    name: "SEARCH_CONSOLE_SITE_URL",
    kind: "variable",
    group: "search-console",
    label: "Search Console site URL",
    description: "Exact property as it appears in Search Console, e.g. https://gunafix.com/ or sc-domain:gunafix.com.",
  },
  {
    name: "META_PAGE_ACCESS_TOKEN",
    kind: "secret",
    group: "meta",
    label: "Meta Page access token",
    description: "Long-lived Page access token from Meta Business Suite.",
  },
  {
    name: "META_PAGE_ID",
    kind: "secret",
    group: "meta",
    label: "Meta Page ID",
    description: "The Facebook Page ID the access token is for.",
  },
  {
    name: "META_IG_USER_ID",
    kind: "secret",
    group: "meta",
    label: "Instagram Business user ID",
    description: "The Instagram Business account connected to that Facebook Page.",
  },
  {
    name: "BUSINESS_NAME",
    kind: "variable",
    group: "business",
    label: "Business name",
    description: "Used in outreach email copy and alert subjects.",
  },
  {
    name: "BUSINESS_URL",
    kind: "variable",
    group: "business",
    label: "Business URL",
    description: "Your site's URL, referenced in outreach copy.",
  },
  {
    name: "OWNER_NAME",
    kind: "variable",
    group: "business",
    label: "Owner name",
    description: "Used as the sign-off name in outreach emails.",
  },
  {
    name: "OWNER_EMAIL",
    kind: "variable",
    group: "business",
    label: "Owner email",
    description: "Where the Leader agent sends urgent alerts.",
  },
];

export function findCredential(name: string): CredentialDef | undefined {
  return CREDENTIAL_CATALOG.find((c) => c.name === name);
}

export function isWritableCredentialName(name: string): boolean {
  return CREDENTIAL_CATALOG.some((c) => c.name === name);
}
