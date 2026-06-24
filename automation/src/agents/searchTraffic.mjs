// Search & Traffic agent — pulls GA4 website traffic and Google Search
// Console organic performance, posts a running digest to a pinned GitHub
// issue, and flags it `urgent` when it spots an anomaly (traffic cliff,
// organic clicks collapsing, rankings sliding, etc.).
// It never contacts the owner directly — only the leader agent does that —
// it just labels the issue so the leader notices on its next run.

import { config } from "../config.mjs";
import { getTrafficSummary } from "../lib/ga4.mjs";
import { getSearchConsoleSummary } from "../lib/searchConsole.mjs";
import { findIssueByTitle, createIssue, addIssueComment, setIssueLabels, ensureLabelsExist } from "../lib/github.mjs";

const DIGEST_TITLE = "[Digest] Search & Traffic";

function formatTraffic(t) {
  const pct = t.sessionsChangePct === null ? "n/a" : `${t.sessionsChangePct.toFixed(1)}%`;
  return [
    `**Website traffic (last ${t.days} days vs previous ${t.days} days)**`,
    `- Sessions: ${t.sessions} (${pct} change)`,
    `- Users: ${t.users}`,
    `- Conversions: ${t.conversions}`,
    `- Top sources: ${t.topSources.map((s) => `${s.source} (${s.sessions})`).join(", ") || "n/a"}`,
  ].join("\n");
}

function formatSearchConsole(s) {
  const pct = s.clicksChangePct === null ? "n/a" : `${s.clicksChangePct.toFixed(1)}%`;
  return [
    `**Google Search Console (last ${s.days} days vs previous ${s.days} days)**`,
    `- Clicks: ${s.clicks} (${pct} change) | Impressions: ${s.impressions}`,
    `- CTR: ${s.ctr.toFixed(2)}% | Avg position: ${s.position.toFixed(1)}`,
    s.topQueries.length
      ? `- Top queries:\n${s.topQueries.map((q) => `  - "${q.query}": ${q.clicks} clicks, pos ${q.position.toFixed(1)}`).join("\n")}`
      : "- No query data in this window.",
  ].join("\n");
}

function detectAnomalies({ traffic, search }) {
  const anomalies = [];
  if (traffic && traffic.sessionsChangePct !== null && traffic.sessionsChangePct <= -40) {
    anomalies.push(`Website sessions dropped ${Math.abs(traffic.sessionsChangePct).toFixed(0)}% vs the prior period.`);
  }
  if (search && search.clicksChangePct !== null && search.clicksChangePct <= -40) {
    anomalies.push(`Organic search clicks dropped ${Math.abs(search.clicksChangePct).toFixed(0)}% vs the prior period.`);
  }
  if (search && search.positionChange !== null && search.positionChange <= -5) {
    anomalies.push(`Average search ranking position slipped by ${Math.abs(search.positionChange).toFixed(1)} spots — may be worth a content/SEO review.`);
  }
  return anomalies;
}

async function run() {
  const haveGa4 = config.ga4PropertyId && config.ga4ClientEmail && config.ga4PrivateKey;
  const haveSearchConsole = config.searchConsoleSiteUrl && config.ga4ClientEmail && config.ga4PrivateKey;

  if (!haveGa4 && !haveSearchConsole) {
    console.log("[searchTraffic] skip — neither GA4 nor Search Console credentials are set");
    return;
  }
  if (!config.githubToken || !config.githubRepo) {
    console.log("[searchTraffic] skip — GH_TOKEN/GITHUB_REPOSITORY not set");
    return;
  }

  await ensureLabelsExist(["search-traffic", "urgent"]);

  let traffic = null;
  let search = null;

  if (haveGa4) {
    try {
      traffic = await getTrafficSummary(7);
    } catch (err) {
      console.error(`[searchTraffic] GA4 fetch failed: ${err.message}`);
    }
  }
  if (haveSearchConsole) {
    try {
      search = await getSearchConsoleSummary(7);
    } catch (err) {
      console.error(`[searchTraffic] Search Console fetch failed: ${err.message}`);
    }
  }

  if (!traffic && !search) {
    console.log("[searchTraffic] no data fetched successfully, nothing to post");
    return;
  }

  const anomalies = detectAnomalies({ traffic, search });
  const sections = [`Snapshot at ${new Date().toISOString()}`, ""];
  if (traffic) sections.push(formatTraffic(traffic), "");
  if (search) sections.push(formatSearchConsole(search), "");
  if (anomalies.length) {
    sections.push("**⚠ Anomalies detected:**", ...anomalies.map((a) => `- ${a}`));
  }
  const body = sections.join("\n");

  let issue = await findIssueByTitle(DIGEST_TITLE, "search-traffic");
  if (!issue) {
    issue = await createIssue({ title: DIGEST_TITLE, body, labels: ["search-traffic"] });
  } else {
    await addIssueComment(issue.number, body);
  }

  const currentLabels = issue.labels?.map((l) => (typeof l === "string" ? l : l.name)) || ["search-traffic"];
  if (anomalies.length && !currentLabels.includes("urgent")) {
    await setIssueLabels(issue.number, [...currentLabels, "urgent"]);
  }

  console.log(`[searchTraffic] digest posted${anomalies.length ? ` — ${anomalies.length} anomaly(ies) flagged urgent` : ""}`);
}

run().catch((err) => {
  console.error("[searchTraffic] fatal error:", err);
  process.exitCode = 1;
});
