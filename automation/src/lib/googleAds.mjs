// Google Ads API client (GAQL search via REST) — ad spend/clicks/conversions
// for the leader's digest and anomaly checks.
// Docs: https://developers.google.com/google-ads/api/docs/query/overview
// NOTE: googleAdsApiVersion in config.mjs may need bumping as Google retires
// old API versions — check the release notes link above if requests start 404ing.

import { config } from "../config.mjs";
import { getAccessTokenFromRefreshToken } from "./googleAuth.mjs";

async function accessToken() {
  if (!config.googleAdsClientId || !config.googleAdsClientSecret || !config.googleAdsRefreshToken) {
    throw new Error("GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN must all be set");
  }
  return getAccessTokenFromRefreshToken({
    clientId: config.googleAdsClientId,
    clientSecret: config.googleAdsClientSecret,
    refreshToken: config.googleAdsRefreshToken,
  });
}

async function gaqlSearch(query) {
  if (!config.googleAdsDeveloperToken || !config.googleAdsCustomerId) {
    throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN and GOOGLE_ADS_CUSTOMER_ID must be set");
  }
  const token = await accessToken();
  const url = `https://googleads.googleapis.com/${config.googleAdsApiVersion}/customers/${config.googleAdsCustomerId}/googleAds:search`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "developer-token": config.googleAdsDeveloperToken,
    "content-type": "application/json",
  };
  if (config.googleAdsLoginCustomerId) {
    headers["login-customer-id"] = config.googleAdsLoginCustomerId;
  }
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ query }) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Ads API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.results || [];
}

/** Spend/clicks/impressions/conversions across all campaigns for the last N days. */
export async function getAdsSummary(days = 7) {
  const query = `
    SELECT campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
    FROM campaign
    WHERE segments.date DURING LAST_${days}_DAYS
  `.replace(/LAST_\d+_DAYS/, days <= 7 ? "LAST_7_DAYS" : "LAST_30_DAYS");

  const rows = await gaqlSearch(query);

  let impressions = 0;
  let clicks = 0;
  let costMicros = 0;
  let conversions = 0;
  const byCampaign = [];

  for (const r of rows) {
    const m = r.metrics || {};
    impressions += Number(m.impressions || 0);
    clicks += Number(m.clicks || 0);
    costMicros += Number(m.costMicros || 0);
    conversions += Number(m.conversions || 0);
    byCampaign.push({
      name: r.campaign?.name,
      impressions: Number(m.impressions || 0),
      clicks: Number(m.clicks || 0),
      costUsd: Number(m.costMicros || 0) / 1_000_000,
      conversions: Number(m.conversions || 0),
    });
  }

  return {
    days,
    impressions,
    clicks,
    costUsd: costMicros / 1_000_000,
    conversions,
    ctr: impressions ? (clicks / impressions) * 100 : 0,
    byCampaign,
  };
}
