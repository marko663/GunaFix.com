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

async function adsHeaders() {
  if (!config.googleAdsDeveloperToken || !config.googleAdsCustomerId) {
    throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN and GOOGLE_ADS_CUSTOMER_ID must be set");
  }
  const token = await accessToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    "developer-token": config.googleAdsDeveloperToken,
    "content-type": "application/json",
  };
  if (config.googleAdsLoginCustomerId) {
    headers["login-customer-id"] = config.googleAdsLoginCustomerId;
  }
  return headers;
}

async function gaqlSearch(query) {
  const headers = await adsHeaders();
  const url = `https://googleads.googleapis.com/${config.googleAdsApiVersion}/customers/${config.googleAdsCustomerId}/googleAds:search`;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ query }) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Ads API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.results || [];
}

/** Spend/clicks/impressions/conversions across all campaigns for the last N days, plus each campaign's current daily budget. */
export async function getAdsSummary(days = 7) {
  const query = `
    SELECT campaign.name, campaign.campaign_budget, campaign_budget.amount_micros,
      metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
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
      budgetResourceName: r.campaign?.campaignBudget,
      budgetAmountMicros: Number(r.campaignBudget?.amountMicros || 0),
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

/** Lowers a campaign's daily budget. Only ever called after the owner approves a specific cut via a permission request — never raises spend automatically. */
export async function cutCampaignBudget({ budgetResourceName, newAmountMicros }) {
  const headers = await adsHeaders();
  const url = `https://googleads.googleapis.com/${config.googleAdsApiVersion}/customers/${config.googleAdsCustomerId}/campaignBudgets:mutate`;
  const body = {
    operations: [
      {
        updateMask: "amount_micros",
        update: { resourceName: budgetResourceName, amountMicros: String(Math.round(newAmountMicros)) },
      },
    ],
  };
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Ads API error ${res.status}: ${text}`);
  }
  return res.json();
}
