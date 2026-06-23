// GA4 Data API client (service account auth) — pulls website traffic
// summaries for the leader's digest and anomaly checks.
// Docs: https://developers.google.com/analytics/devguides/reporting/data/v1

import { config } from "../config.mjs";
import { getServiceAccountAccessToken } from "./googleAuth.mjs";

const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

async function runReport(body) {
  if (!config.ga4PropertyId || !config.ga4ClientEmail || !config.ga4PrivateKey) {
    throw new Error("GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY must all be set");
  }
  const token = await getServiceAccountAccessToken({
    clientEmail: config.ga4ClientEmail,
    privateKey: config.ga4PrivateKey,
    scope: SCOPE,
  });
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${config.ga4PropertyId}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GA4 runReport error ${res.status}: ${text}`);
  }
  return res.json();
}

/** Sessions/users/conversions for the last N days, plus the same window before it for comparison. */
export async function getTrafficSummary(days = 7) {
  const current = await runReport({
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "conversions" }],
  });
  const previous = await runReport({
    dateRanges: [{ startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` }],
    metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "conversions" }],
  });
  const topSources = await runReport({
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 5,
  });

  const row = (report) => report.rows?.[0]?.metricValues?.map((m) => Number(m.value)) || [0, 0, 0];
  const [sessions, users, conversions] = row(current);
  const [prevSessions, prevUsers, prevConversions] = row(previous);

  return {
    days,
    sessions,
    users,
    conversions,
    prevSessions,
    prevUsers,
    prevConversions,
    sessionsChangePct: prevSessions ? ((sessions - prevSessions) / prevSessions) * 100 : null,
    topSources: (topSources.rows || []).map((r) => ({
      source: r.dimensionValues[0].value,
      sessions: Number(r.metricValues[0].value),
    })),
  };
}
