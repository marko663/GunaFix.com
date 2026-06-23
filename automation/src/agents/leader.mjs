// Leader agent — the ONLY agent allowed to contact the owner directly.
// Runs last (after lead-finder, outreach, social-content, ads-traffic),
// rolls up what happened in this run, and:
//   - emails the owner immediately if anything is labeled `urgent` (and not
//     already notified) — this is the "fast feedback" channel since there's
//     no telephony integration configured yet.
//   - always posts a run summary as a GitHub issue comment on a pinned
//     "[Leader] Run Log" issue, so there's a single place to see history.
// No telephony/SMS — see automation/README.md for how to add Twilio later
// if the owner wants real phone calls for urgent items.

import { config, requireFields } from "../config.mjs";
import { sendEmail } from "../lib/gmail.mjs";
import {
  findIssueByTitle,
  createIssue,
  addIssueComment,
  setIssueLabels,
  listIssuesByLabel,
  listIssueComments,
  ensureLabelsExist,
} from "../lib/github.mjs";

const RUN_LOG_TITLE = "[Leader] Run Log";

async function gatherCounts() {
  const [newLeads, needsInfo, drafted, socialNew] = await Promise.all([
    listIssuesByLabel("status:new").catch(() => []),
    listIssuesByLabel("status:needs-contact-info").catch(() => []),
    listIssuesByLabel("status:drafted").catch(() => []),
    listIssuesByLabel("social-content").catch(() => []),
  ]);
  return {
    newLeads: newLeads.filter((i) => i.labels.some((l) => l.name === "lead")).length,
    needsInfo: needsInfo.filter((i) => i.labels.some((l) => l.name === "lead")).length,
    drafted: drafted.filter((i) => i.labels.some((l) => l.name === "lead")).length,
    socialNew: socialNew.length,
  };
}

async function handleUrgentItems() {
  const urgentIssues = await listIssuesByLabel("urgent").catch(() => []);
  const unnotified = urgentIssues.filter((i) => !i.labels.some((l) => l.name === "leader-notified"));

  if (unnotified.length === 0) {
    console.log("[leader] no new urgent items");
    return [];
  }

  console.log(`[leader] ${unnotified.length} new urgent item(s) — alerting owner`);

  const canEmail = requireFields(
    config,
    ["gmailClientId", "gmailClientSecret", "gmailRefreshToken"],
    "leader (urgent email)"
  );

  const lines = unnotified.map((i) => `- ${i.title}\n  ${i.html_url}`);
  const subject = `[URGENT] ${config.businessName} growth agents need your attention (${unnotified.length})`;
  const body = [
    `Hi ${config.ownerName},`,
    "",
    "The growth agents flagged something that needs your eyes now:",
    "",
    ...lines,
    "",
    "If an item is asking you something, reply directly on that issue with yes/approve or no/deny (or use the local dashboard's buttons) — the agents check for your reply on every run. Other items are just FYI; a comment on any of them gets acknowledged too.",
    "",
    "— Leader agent",
  ].join("\n");

  if (canEmail) {
    try {
      await sendEmail({ to: config.ownerEmail, subject, body });
      console.log("[leader] urgent email sent");
    } catch (err) {
      console.error(`[leader] failed to send urgent email: ${err.message}`);
    }
  }

  for (const issue of unnotified) {
    const labels = issue.labels.map((l) => l.name);
    await setIssueLabels(issue.number, [...labels, "leader-notified"]).catch(() => {});
  }

  return unnotified;
}

/**
 * General catch-all for items that are `urgent` but not a structured
 * permission request (those resolve themselves via resolvePermissions() in
 * the owning agent). Anything else — e.g. a traffic-cliff anomaly with no
 * proposed action — just gets acknowledged so the owner knows a reply landed,
 * since there's no defined action to execute on free-form text yet.
 */
async function acknowledgeOwnerReplies() {
  const urgentIssues = await listIssuesByLabel("urgent").catch(() => []);
  const acknowledged = [];

  for (const issue of urgentIssues) {
    const labels = issue.labels.map((l) => l.name);
    if (labels.includes("awaiting-permission") || labels.includes("leader-acknowledged")) continue;

    const comments = await listIssueComments(issue.number).catch(() => []);
    const ownerComment = comments.find((c) => c.user?.type !== "Bot");
    if (!ownerComment) continue;

    await addIssueComment(issue.number, "Got it — noted. (Free-form replies aren't auto-actioned yet, but the team has seen this.)");
    await setIssueLabels(issue.number, [...labels, "leader-acknowledged"]);
    acknowledged.push(issue);
  }

  return acknowledged;
}

async function postRunSummary({ counts, urgentHandled, acknowledged }) {
  const body = [
    `Run at ${new Date().toISOString()}`,
    "",
    `- New leads awaiting outreach draft: ${counts.newLeads}`,
    `- Leads still missing contact info: ${counts.needsInfo}`,
    `- Outreach drafts created (lifetime, open): ${counts.drafted}`,
    `- Open social content pieces ready to film: ${counts.socialNew}`,
    `- Urgent items alerted this run: ${urgentHandled.length}`,
    `- Owner replies acknowledged this run: ${acknowledged.length}`,
  ].join("\n");

  let issue = await findIssueByTitle(RUN_LOG_TITLE, "leader-report");
  if (!issue) {
    issue = await createIssue({ title: RUN_LOG_TITLE, body, labels: ["leader-report"] });
  } else {
    await addIssueComment(issue.number, body);
  }
  console.log("[leader] run summary posted");
}

async function run() {
  if (!requireFields(config, ["githubToken", "githubRepo"], "leader (github)")) return;

  await ensureLabelsExist(["leader-notified", "leader-report", "urgent", "leader-acknowledged"]);

  const counts = await gatherCounts();
  const urgentHandled = await handleUrgentItems();
  const acknowledged = await acknowledgeOwnerReplies();
  await postRunSummary({ counts, urgentHandled, acknowledged });
}

run().catch((err) => {
  console.error("[leader] fatal error:", err);
  process.exitCode = 1;
});
