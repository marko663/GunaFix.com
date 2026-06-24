// Google Search Console API client (service-account auth) — organic search
// clicks/impressions/position for the leader's digest and anomaly checks.
// Reuses the same GCP service account as ga4.mjs: add it as a user under
// Search Console → Settings → Users and permissions (Restricted is enough),
// no separate OAuth app needed.
// Docs: https://developers.google.com/webmaster-tools/v1/searchanalytics/query

import { config } from "../config.mjs";
import { getServiceAccountAccessToken } from "./googleAuth.mjs";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
// Search Console data is incomplete for the most recent ~2 days, so windows
// end a few days back instead of "today".
const REPORTING_LAG_DAYS = 3;

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

async function query(body) {
  if (!config.searchConsoleSiteUrl || !config.ga4ClientEmail || !config.ga4PrivateKey) {
    throw new Error("SEARCH_CONSOLE_SITE_URL, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY must all be set");
  }
  const token = await getServiceAccountAccessToken({
    clientEmail: config.ga4ClientEmail,
    privateKey: config.ga4PrivateKey,
    scope: SCOPE,
  });
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    config.searchConsoleSiteUrl
  )}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Search Console API error ${res.status}: ${text}`);
  }
  return res.json();
}

/** A single aggregate row (no dimensions) for a date range — totals, not broken out. */
async function totalsFor(startDate, endDate) {
  const data = await query({ startDate, endDate });
  const row = data.rows?.[0];
  return {
    clicks: Number(row?.clicks || 0),
    impressions: Number(row?.impressions || 0),
    ctr: Number(row?.ctr || 0) * 100,
    position: Number(row?.position || 0),
  };
}

/** Clicks/impressions/CTR/avg position for the last N days, the same window before it for comparison, and top queries. */
export async function getSearchConsoleSummary(days = 7) {
  const end = daysAgo(REPORTING_LAG_DAYS);
  const start = daysAgo(REPORTING_LAG_DAYS + days - 1);
  const prevEnd = daysAgo(REPORTING_LAG_DAYS + days);
  const prevStart = daysAgo(REPORTING_LAG_DAYS + days * 2 - 1);

  const [current, previous, topQueriesData] = await Promise.all([
    totalsFor(isoDate(start), isoDate(end)),
    totalsFor(isoDate(prevStart), isoDate(prevEnd)),
    query({
      startDate: isoDate(start),
      endDate: isoDate(end),
      dimensions: ["query"],
      rowLimit: 10,
    }),
  ]);

  const topQueries = (topQueriesData.rows || [])
    .map((r) => ({
      query: r.keys?.[0],
      clicks: Number(r.clicks || 0),
      impressions: Number(r.impressions || 0),
      position: Number(r.position || 0),
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  return {
    days,
    ...current,
    prevClicks: previous.clicks,
    prevImpressions: previous.impressions,
    clicksChangePct: previous.clicks ? ((current.clicks - previous.clicks) / previous.clicks) * 100 : null,
    positionChange: previous.position ? previous.position - current.position : null, // positive = ranking improved
    topQueries,
  };
}
