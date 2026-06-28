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
// every run first checks prior sends' Gmail threads for replies: an
// "unsubscribe"-style reply suppresses that lead permanently (label:
// do-not-contact); any other reply gets posted to the issue in full (so it
// shows up on the dashboard) and triggers an automatic Claude-drafted
// response that books a real meeting slot on the owner's Google Calendar
// (label: status:meeting-booked) — see checkReplies()/respondAndBook() below.

import { config, requireFields } from "../config.mjs";
import { askClaude } from "../lib/anthropic.mjs";
import { sendEmail, getThread } from "../lib/gmail.mjs";
import { findNextAvailableSlot, createCalendarEvent, formatSlot } from "../lib/calendar.mjs";
import { listIssuesByLabel, addIssueComment, setIssueLabels, ensureLabelsExist, listIssueComments } from "../lib/github.mjs";
import { recordSends } from "../lib/dailyPace.mjs";

const OPT_OUT_RE = /\b(unsubscribe|remove me|take me off|stop emailing|not interested|do not contact|no thanks)\b/i;

/** Real scraped address takes priority; falls back to the single guessed info@domain address leadFinder leaves when nothing was found on the site. */
function extractContactEmail(body) {
  const real = body.match(/\*\*Emails found on site:\*\*\s*(.+)/);
  if (real) {
    const email = real[1].split(",")[0].trim();
    if (email) return { email, guessed: false };
  }
  const guessed = body.match(/\*\*Guessed email \(unverified\):\*\*\s*(\S+@\S+)/);
  if (guessed) return { email: guessed[1].trim(), guessed: true };
  return null;
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

/** Pulls the bare address out of a Gmail "From" header (`"Name <addr>"` or just `addr`). */
function extractEmailAddress(from) {
  const m = (from || "").match(/<([^>]+)>/);
  return (m ? m[1] : from || "").trim();
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

function buildReplyPrompt({ name, replyText, slotText }) {
  return `You are ${config.ownerName} from ${config.businessName}, replying to "${name}", a local business owner who just replied to your cold outreach email. Their reply:
"""
${replyText}
"""

Write a brief, warm, professional reply (under 120 words) that:
- Directly acknowledges what they said
- Confirms a quick call ${slotText ? `for ${slotText}` : "and asks what day/time works for them"}
${slotText ? "- Mentions they'll get a calendar invite for that time, and can just reply if it doesn't work" : ""}
- Signs off as ${config.ownerName}, ${config.businessName}

Respond with EXACTLY this format, nothing else:
SUBJECT: <subject line>
BODY:
<email body text>`;
}

/**
 * Drafts and sends an automatic reply to a lead who responded to outreach,
 * and — if OWNER_TIMEZONE is configured — books a real slot on the owner's
 * Google Calendar and sends a real invite. Falls back to asking the lead to
 * propose a time if calendar booking isn't available/fails, rather than
 * blocking the reply entirely. Returns true if a meeting was booked.
 */
async function respondAndBook({ issue, name, threadId, replyEmail, replyText }) {
  let slot = null;
  if (requireFields(config, ["ownerTimezone"], `outreach (booking #${issue.number})`)) {
    try {
      slot = await findNextAvailableSlot({ timeZone: config.ownerTimezone });
    } catch (err) {
      console.error(`[outreach] could not find a calendar slot for #${issue.number}: ${err.message}`);
    }
  }
  const slotText = slot ? formatSlot(slot) : null;

  try {
    const raw = await askClaude(buildReplyPrompt({ name, replyText, slotText }));
    const parsed = parseDraft(raw);
    if (!parsed) {
      console.error(`[outreach] could not parse reply draft for #${issue.number}`);
      return false;
    }

    if (slot) {
      await createCalendarEvent({
        summary: `${config.businessName} <> ${name}`,
        description: `Quick call booked automatically after ${name} replied to outreach.\n\n${issue.html_url}`,
        start: slot.start,
        end: slot.end,
        timeZone: slot.timeZone,
        attendeeEmail: replyEmail,
      });
    }

    const result = await sendEmail({ to: replyEmail, subject: parsed.subject, body: parsed.body, threadId });

    if (slot) {
      await setIssueLabels(
        issue.number,
        issue.labels.map((l) => l.name).map((l) => (l === "status:contacted" ? "status:meeting-booked" : l))
      );
    }
    await addIssueComment(
      issue.number,
      `${slot ? `**Meeting booked automatically** for ${slotText} — calendar invite sent to ${replyEmail}.` : "**Auto-reply sent** (no meeting booked — set `OWNER_TIMEZONE` to enable automatic booking)."}\n\n**Reply sent:**\n\n${parsed.body}${embedThreadId(result.threadId)}`
    );
    console.log(`[outreach] ${slot ? `booked meeting for #${issue.number} (${name}) at ${slotText}` : `auto-replied to #${issue.number} (${name}), no booking`}`);
    return Boolean(slot);
  } catch (err) {
    console.error(`[outreach] auto-reply/booking failed for #${issue.number}: ${err.message}`);
    await addIssueComment(issue.number, `Reply received (posted above) but the automatic response failed (${err.message}) — needs a manual follow-up.`).catch(() => {});
    return false;
  }
}

/**
 * Scans prior sends' Gmail threads for new replies. An unsubscribe-style
 * reply permanently suppresses the lead (do-not-contact). Any other reply
 * gets posted to the issue in full (visible on the dashboard) and triggers
 * an automatic response + meeting booking via respondAndBook(). Once a
 * lead reaches status:meeting-booked it's excluded here, so each thread is
 * only auto-replied-to once — there's no reschedule/multi-turn handling yet.
 */
async function checkReplies() {
  const contacted = await listIssuesByLabel("status:contacted").catch(() => []);
  const leads = contacted.filter(
    (i) => i.labels.some((l) => l.name === "lead") && !i.labels.some((l) => l.name === "do-not-contact")
  );

  let suppressed = 0;
  let booked = 0;
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
      const ourAddress = (config.senderEmail || config.ownerEmail || "").toLowerCase();
      const replies = messages.slice(1).filter((m) => extractEmailAddress(m.from).toLowerCase() !== ourAddress);
      if (!replies.length) continue;

      const optOut = replies.find((m) => OPT_OUT_RE.test(m.body) || OPT_OUT_RE.test(m.snippet));
      if (optOut) {
        await setIssueLabels(issue.number, [...issue.labels.map((l) => l.name), "do-not-contact"]);
        await addIssueComment(issue.number, "**Unsubscribe reply detected** — marked do-not-contact, this lead will not be emailed again.");
        suppressed++;
        console.log(`[outreach] suppressed #${issue.number} — unsubscribe reply`);
        continue;
      }

      const latest = replies[replies.length - 1];
      const replyEmail = extractEmailAddress(latest.from);
      const name = extractField(issue.body, "Business") || issue.title;
      await addIssueComment(
        issue.number,
        `**Reply received** from ${latest.from}:\n\n> ${latest.body.trim().split("\n").join("\n> ")}`
      );

      if (await respondAndBook({ issue, name, threadId, replyEmail, replyText: latest.body.trim() })) booked++;
    } catch (err) {
      console.error(`[outreach] reply check failed for #${issue.number}: ${err.message}`);
    }
  }
  if (suppressed) console.log(`[outreach] ${suppressed} lead(s) suppressed this run`);
  if (booked) console.log(`[outreach] ${booked} meeting(s) booked this run`);
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

  await ensureLabelsExist(["status:contacted", "do-not-contact", "status:meeting-booked"]);
  await checkReplies();

  const issues = await listIssuesByLabel("status:new");
  const leadIssues = issues.filter((i) => i.labels.some((l) => l.name === "lead"));
  console.log(`[outreach] ${leadIssues.length} new lead(s) to evaluate`);

  let sent = 0;
  for (const issue of leadIssues) {
    const contact = extractContactEmail(issue.body || "");
    if (!contact) {
      console.log(`[outreach] skip #${issue.number} — no email on file yet`);
      continue;
    }
    const { email, guessed } = contact;

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
        `**Sent** from ${config.senderEmail || config.ownerEmail} just now${guessed ? " (address guessed — not scraped from the site, unverified)" : ""}.\n\n**To:** ${email}\n**Subject:** ${parsed.subject}\n\n${body}${embedThreadId(result.threadId)}`
      );
      sent++;
      console.log(`[outreach] sent email for #${issue.number} (${name})${guessed ? " [guessed address]" : ""}`);
    } catch (err) {
      console.error(`[outreach] error on #${issue.number}: ${err.message}`);
    }
  }

  await recordSends(sent).catch((err) => console.error(`[outreach] could not record daily pace: ${err.message}`));
  console.log(`[outreach] done — ${sent} email(s) sent`);
}

run().catch((err) => {
  console.error("[outreach] fatal error:", err);
  process.exitCode = 1;
});
