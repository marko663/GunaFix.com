// Outreach agent — for every lead issue that has a known contact email,
// asks Claude to draft a short personalized cold email and SENDS IT FOR
// REAL right away, from the owner's own Gmail account. There is no
// draft/approval step — the owner explicitly chose real, automatic, high-volume
// sending over a review queue, so every run drains the full backlog of
// status:new leads with a known email. Moves the issue straight to
// status:contacted and posts the sent text as a comment for visibility.
//
// Because this sends unsolicited commercial email automatically, every send
// includes a CAN-SPAM footer (business name + BUSINESS_PHYSICAL_ADDRESS) and
// every run first checks prior sends' Gmail threads for an "unsubscribe"-style
// reply, suppressing that lead permanently (label: do-not-contact) before
// anything new goes out.

import { config, requireFields } from "../config.mjs";
import { askClaude } from "../lib/anthropic.mjs";
import { sendEmail, getThread } from "../lib/gmail.mjs";
import { listIssuesByLabel, addIssueComment, setIssueLabels, ensureLabelsExist, listIssueComments } from "../lib/github.mjs";

const OPT_OUT_RE = /\b(unsubscribe|remove me|take me off|stop emailing|not interested|do not contact|no thanks)\b/i;

function extractEmailFromBody(body) {
  const match = body.match(/\*\*Emails found on site:\*\*\s*(.+)/);
  if (!match) return null;
  return match[1].split(",")[0].trim();
}

function extractField(body, label) {
  const match = body.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`));
  return match ? match[1].trim() : null;
}

function embedThreadId(threadId) {
  return `\n\n<!-- gmail-thread\n${JSON.stringify({ threadId })}\n-->`;
}

function extractThreadId(body) {
  const m = (body || "").match(/<!-- gmail-thread\n([\s\S]+?)\n-->/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]).threadId || null;
  } catch {
    return null;
  }
}

function complianceFooter() {
  const lines = ["", "—", config.businessPhysicalAddress ? `${config.businessName} · ${config.businessPhysicalAddress}` : config.businessName];
  lines.push('Reply "unsubscribe" and we will not contact you again.');
  return lines.join("\n");
}

function buildPrompt({ name, website, issues }) {
  return `You are writing a short, friendly, non-pushy cold outreach email on behalf of ${config.ownerName}, who runs ${config.businessName} (${config.businessUrl}), an AI-accelerated web development studio.

The recipient is "${name}", a local business whose website (${website}) was found to have these problems:
${issues.map((i) => `- ${i}`).join("\n")}

Write a brief email (under 150 words) that:
- Opens with something specific and genuine about their business (not generic flattery)
- Mentions 1-2 of the concrete website issues in plain, non-technical language
- Briefly offers a free quick website review / modern rebuild, no hard sell
- Has a low-friction call to action (reply, or a quick call)
- Signs off as ${config.ownerName}, ${config.businessName}

Respond with EXACTLY this format, nothing else:
SUBJECT: <subject line>
BODY:
<email body text>`;
}

function parseDraft(text) {
  const subjectMatch = text.match(/SUBJECT:\s*(.+)/);
  const bodyMatch = text.match(/BODY:\s*([\s\S]+)/);
  if (!subjectMatch || !bodyMatch) return null;
  return { subject: subjectMatch[1].trim(), body: bodyMatch[1].trim() };
}

/** Scans prior sends' Gmail threads for an unsubscribe-style reply and permanently suppresses that lead. */
async function checkOptOuts() {
  const contacted = await listIssuesByLabel("status:contacted").catch(() => []);
  const leads = contacted.filter(
    (i) => i.labels.some((l) => l.name === "lead") && !i.labels.some((l) => l.name === "do-not-contact")
  );

  let suppressed = 0;
  for (const issue of leads) {
    const comments = await listIssueComments(issue.number).catch(() => []);
    let threadId = null;
    for (const c of comments) {
      const id = extractThreadId(c.body);
      if (id) threadId = id; // last embedded thread id wins, in case of repeat contact
    }
    if (!threadId) continue;
    try {
      const messages = await getThread(threadId);
      const replies = messages.slice(1); // first message is our own outgoing email
      const optOut = replies.find((m) => OPT_OUT_RE.test(m.body) || OPT_OUT_RE.test(m.snippet));
      if (!optOut) continue;

      await setIssueLabels(issue.number, [...issue.labels.map((l) => l.name), "do-not-contact"]);
      await addIssueComment(issue.number, "**Unsubscribe reply detected** — marked do-not-contact, this lead will not be emailed again.");
      suppressed++;
      console.log(`[outreach] suppressed #${issue.number} — unsubscribe reply`);
    } catch (err) {
      console.error(`[outreach] opt-out check failed for #${issue.number}: ${err.message}`);
    }
  }
  if (suppressed) console.log(`[outreach] ${suppressed} lead(s) suppressed this run`);
}

async function run() {
  if (!requireFields(config, ["anthropicApiKey"], "outreach (anthropic)")) return;
  if (!requireFields(config, ["githubToken", "githubRepo"], "outreach (github)")) return;
  if (
    !requireFields(
      config,
      ["gmailClientId", "gmailClientSecret", "gmailRefreshToken"],
      "outreach (gmail) — leads will stay queued until configured"
    )
  )
    return;
  if (!config.businessPhysicalAddress) {
    console.log(
      "[outreach] WARNING: BUSINESS_PHYSICAL_ADDRESS is not set — sending real commercial email without a postal address in the footer is a CAN-SPAM violation in the US. Set it as soon as possible."
    );
  }

  await ensureLabelsExist(["status:contacted", "do-not-contact"]);
  await checkOptOuts();

  const issues = await listIssuesByLabel("status:new");
  const leadIssues = issues.filter((i) => i.labels.some((l) => l.name === "lead"));
  console.log(`[outreach] ${leadIssues.length} new lead(s) to evaluate`);

  let sent = 0;
  for (const issue of leadIssues) {
    const email = extractEmailFromBody(issue.body || "");
    if (!email) {
      console.log(`[outreach] skip #${issue.number} — no email on file yet`);
      continue;
    }

    const name = extractField(issue.body, "Business") || issue.title;
    const website = extractField(issue.body, "Website") || "";
    const issuesSection = (issue.body.match(/\*\*Issues found:\*\*\n([\s\S]+?)\n-\s\*\*Emails/) || [])[1] || "";
    const issuesList = issuesSection
      .split("\n")
      .map((l) => l.replace(/^\s*-\s*/, "").trim())
      .filter(Boolean);

    try {
      const raw = await askClaude(buildPrompt({ name, website, issues: issuesList.length ? issuesList : ["outdated website"] }));
      const parsed = parseDraft(raw);
      if (!parsed) {
        console.error(`[outreach] could not parse Claude output for #${issue.number}`);
        continue;
      }

      const body = `${parsed.body}${complianceFooter()}`;
      const result = await sendEmail({ to: email, subject: parsed.subject, body });

      await setIssueLabels(
        issue.number,
        issue.labels.map((l) => l.name).map((l) => (l === "status:new" ? "status:contacted" : l))
      );
      await addIssueComment(
        issue.number,
        `**Sent** from ${config.senderEmail || config.ownerEmail} just now.\n\n**To:** ${email}\n**Subject:** ${parsed.subject}\n\n${body}${embedThreadId(result.threadId)}`
      );
      sent++;
      console.log(`[outreach] sent email for #${issue.number} (${name})`);
    } catch (err) {
      console.error(`[outreach] error on #${issue.number}: ${err.message}`);
    }
  }

  console.log(`[outreach] done — ${sent} email(s) sent`);
}

run().catch((err) => {
  console.error("[outreach] fatal error:", err);
  process.exitCode = 1;
});
