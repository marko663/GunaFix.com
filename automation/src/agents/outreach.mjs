// Outreach agent — for every lead issue that has a known contact email,
// asks Claude to draft a short personalized cold email, then creates a
// Gmail DRAFT (never sent automatically). The owner reviews and sends it
// themselves from their own Gmail. Moves the issue from status:new to
// status:drafted and posts the draft text as a comment for visibility.

import { config, requireFields } from "../config.mjs";
import { askClaude } from "../lib/anthropic.mjs";
import { createDraft } from "../lib/gmail.mjs";
import { listIssuesByLabel, addIssueComment, setIssueLabels } from "../lib/github.mjs";

function extractEmailFromBody(body) {
  const match = body.match(/\*\*Emails found on site:\*\*\s*(.+)/);
  if (!match) return null;
  return match[1].split(",")[0].trim();
}

function extractField(body, label) {
  const match = body.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`));
  return match ? match[1].trim() : null;
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

  const issues = await listIssuesByLabel("status:new");
  const leadIssues = issues.filter((i) => i.labels.some((l) => l.name === "lead"));
  console.log(`[outreach] ${leadIssues.length} new lead(s) to evaluate`);

  let drafted = 0;
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

      await createDraft({ to: email, subject: parsed.subject, body: parsed.body });
      await addIssueComment(
        issue.number,
        `**Draft created in ${config.senderEmail || config.ownerEmail}'s Gmail drafts.** Review and send manually.\n\n**To:** ${email}\n**Subject:** ${parsed.subject}\n\n${parsed.body}`
      );
      await setIssueLabels(
        issue.number,
        issue.labels.map((l) => l.name).map((l) => (l === "status:new" ? "status:drafted" : l))
      );
      drafted++;
      console.log(`[outreach] drafted email for #${issue.number} (${name})`);
    } catch (err) {
      console.error(`[outreach] error on #${issue.number}: ${err.message}`);
    }
  }

  console.log(`[outreach] done — ${drafted} draft(s) created`);
}

run().catch((err) => {
  console.error("[outreach] fatal error:", err);
  process.exitCode = 1;
});
