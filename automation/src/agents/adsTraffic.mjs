// Ads & Traffic agent — pulls GA4 website traffic and Google Ads performance,
// posts a running digest to a pinned GitHub issue, and flags it `urgent` when
// it spots an anomaly (traffic cliff, spend with zero conversions, etc.).
// It never contacts the owner directly — only the leader agent does that —
// it just labels the issue so the leader notices on its next run.

import { config } from "../config.mjs";
import { getTrafficSummary } from "../lib/ga4.mjs";
import { getAdsSummary, cutCampaignBudget } from "../lib/googleAds.mjs";
import {
  findIssueByTitle,
  createIssue,
  addIssueComment,
  setIssueLabels,
  listIssuesByLabel,
  ensureLabelsExist,
} from "../lib/github.mjs";
import { requestPermission, resolvePermissions } from "../lib/permissions.mjs";

const DIGEST_TITLE = "[Digest] Ads & Traffic";
const MIN_BUDGET_MICROS = 1_000_000; // never propose cutting a campaign's daily budget below $1

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

function formatAds(a) {
  return [
    `**Google Ads (last ${a.days} days)**`,
    `- Spend: $${a.costUsd.toFixed(2)}`,
    `- Clicks: ${a.clicks} | Impressions: ${a.impressions} | CTR: ${a.ctr.toFixed(2)}%`,
    `- Conversions: ${a.conversions}`,
    a.byCampaign.length
      ? a.byCampaign.map((c) => `  - ${c.name}: $${c.costUsd.toFixed(2)}, ${c.clicks} clicks, ${c.conversions} conv`).join("\n")
      : "  - No active campaigns with spend in this window.",
  ].join("\n");
}

function detectAnomalies({ traffic, ads }) {
  const anomalies = [];
  if (traffic && traffic.sessionsChangePct !== null && traffic.sessionsChangePct <= -40) {
    anomalies.push(`Website sessions dropped ${Math.abs(traffic.sessionsChangePct).toFixed(0)}% vs the prior period.`);
  }
  if (ads && ads.costUsd >= 20 && ads.conversions === 0) {
    anomalies.push(`Google Ads spent $${ads.costUsd.toFixed(2)} with zero conversions.`);
  }
  if (ads && ads.clicks > 0 && ads.ctr < 0.5) {
    anomalies.push(`Google Ads CTR is unusually low (${ads.ctr.toFixed(2)}%) — ad copy or targeting may need review.`);
  }
  return anomalies;
}

/** Per-campaign zero-conversion spend gets a specific, reversible action proposed (a 50% budget cut) instead of just a generic flag. */
function findBudgetCutCandidates(ads) {
  if (!ads) return [];
  return ads.byCampaign.filter(
    (c) => c.costUsd >= 20 && c.conversions === 0 && c.budgetResourceName && c.budgetAmountMicros > MIN_BUDGET_MICROS
  );
}

async function proposeBudgetCuts(candidates) {
  // Skip campaigns with a request still pending, or one the owner denied in the last 24h (avoid re-asking every 6h run).
  const recent = await listIssuesByLabel("permission:ad-budget", "all").catch(() => []);
  const cutoffMs = Date.now() - 24 * 60 * 60 * 1000;
  const skipTitles = new Set(
    recent
      .filter((i) => {
        const labels = i.labels.map((l) => l.name);
        const deniedRecently = labels.includes("decision:denied") && i.closed_at && new Date(i.closed_at).getTime() > cutoffMs;
        return i.state === "open" || deniedRecently;
      })
      .map((i) => i.title)
  );

  for (const c of candidates) {
    const title = `[Permission] Cut ad budget — ${c.name}`;
    if (skipTitles.has(title)) continue;

    const newAmountMicros = Math.max(Math.round(c.budgetAmountMicros / 2), MIN_BUDGET_MICROS);
    await requestPermission({
      type: "ad-budget",
      title,
      question: `**${c.name}** spent $${c.costUsd.toFixed(2)} in the last 7 days with zero conversions. Want me to cut its daily budget in half (from $${(
        c.budgetAmountMicros / 1_000_000
      ).toFixed(2)} to $${(newAmountMicros / 1_000_000).toFixed(2)}) to limit further wasted spend?`,
      context: `Clicks: ${c.clicks} | Impressions: ${c.impressions}`,
      payload: { campaignName: c.name, budgetResourceName: c.budgetResourceName, newAmountMicros },
    });
  }
}

async function applyApprovedBudgetCuts() {
  const resolved = await resolvePermissions("ad-budget");
  for (const { decision, payload } of resolved) {
    if (decision !== "granted" || !payload) continue;
    try {
      await cutCampaignBudget(payload);
      console.log(`[adsTraffic] cut budget for "${payload.campaignName}" per owner approval`);
    } catch (err) {
      console.error(`[adsTraffic] failed to apply approved budget cut for "${payload.campaignName}": ${err.message}`);
    }
  }
}

async function run() {
  const haveGa4 = config.ga4PropertyId && config.ga4ClientEmail && config.ga4PrivateKey;
  const haveAds =
    config.googleAdsDeveloperToken && config.googleAdsCustomerId && config.googleAdsClientId && config.googleAdsRefreshToken;

  if (!haveGa4 && !haveAds) {
    console.log("[adsTraffic] skip — neither GA4 nor Google Ads credentials are set");
    return;
  }
  if (!config.githubToken || !config.githubRepo) {
    console.log("[adsTraffic] skip — GH_TOKEN/GITHUB_REPOSITORY not set");
    return;
  }

  await ensureLabelsExist(["ads-traffic", "urgent"]);

  if (haveAds) await applyApprovedBudgetCuts();

  let traffic = null;
  let ads = null;

  if (haveGa4) {
    try {
      traffic = await getTrafficSummary(7);
    } catch (err) {
      console.error(`[adsTraffic] GA4 fetch failed: ${err.message}`);
    }
  }
  if (haveAds) {
    try {
      ads = await getAdsSummary(7);
    } catch (err) {
      console.error(`[adsTraffic] Google Ads fetch failed: ${err.message}`);
    }
  }

  if (!traffic && !ads) {
    console.log("[adsTraffic] no data fetched successfully, nothing to post");
    return;
  }

  const anomalies = detectAnomalies({ traffic, ads });
  const sections = [`Snapshot at ${new Date().toISOString()}`, ""];
  if (traffic) sections.push(formatTraffic(traffic), "");
  if (ads) sections.push(formatAds(ads), "");
  if (anomalies.length) {
    sections.push("**⚠ Anomalies detected:**", ...anomalies.map((a) => `- ${a}`));
  }
  const body = sections.join("\n");

  let issue = await findIssueByTitle(DIGEST_TITLE, "ads-traffic");
  if (!issue) {
    issue = await createIssue({ title: DIGEST_TITLE, body, labels: ["ads-traffic"] });
  } else {
    await addIssueComment(issue.number, body);
  }

  const currentLabels = issue.labels?.map((l) => (typeof l === "string" ? l : l.name)) || ["ads-traffic"];
  if (anomalies.length && !currentLabels.includes("urgent")) {
    await setIssueLabels(issue.number, [...currentLabels, "urgent"]);
  }

  const budgetCutCandidates = findBudgetCutCandidates(ads);
  if (budgetCutCandidates.length) await proposeBudgetCuts(budgetCutCandidates);

  console.log(`[adsTraffic] digest posted${anomalies.length ? ` — ${anomalies.length} anomaly(ies) flagged urgent` : ""}`);
}

run().catch((err) => {
  console.error("[adsTraffic] fatal error:", err);
  process.exitCode = 1;
});
