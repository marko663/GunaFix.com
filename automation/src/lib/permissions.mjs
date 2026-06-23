// Two-way "ask before acting" channel layered on top of the GitHub Issues
// board. An agent calls requestPermission() to file a yes/no question as an
// issue — it's labeled `urgent`, so the leader's existing email alert fires
// on it like any other urgent item, no separate notification path needed.
// The owner replies on that issue with a plain "yes"/"approve" or "no"/"deny"
// comment (GitHub comment, or the local dashboard's Approve/Deny buttons,
// which just post the same kind of comment). The next time the owning agent
// runs, resolvePermissions(type) picks up the reply, labels the decision,
// and hands back the original payload so the agent can act on it.

import {
  createIssue,
  addIssueComment,
  setIssueLabels,
  closeIssue,
  listIssuesByLabel,
  listIssueComments,
  ensureLabelsExist,
} from "./github.mjs";

const PENDING_LABEL = "awaiting-permission";
const APPROVE_RE = /\b(yes|approve|approved|go ahead|do it|ok|okay)\b/i;
const DENY_RE = /\b(no|deny|denied|don't|stop|skip)\b/i;

function embedPayload(payload) {
  return payload ? `\n\n<!-- permission-payload\n${JSON.stringify(payload)}\n-->` : "";
}

function extractPayload(body) {
  const m = (body || "").match(/<!-- permission-payload\n([\s\S]+?)\n-->/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/** Newest comment wins; a single comment matching both is treated as a deny (safer default). */
function decideFromComments(comments) {
  for (const c of [...comments].reverse()) {
    if (DENY_RE.test(c.body)) return "denied";
    if (APPROVE_RE.test(c.body)) return "granted";
  }
  return null;
}

/** Files a yes/no question as a GitHub issue. `payload` is whatever the caller needs back to act once approved. */
export async function requestPermission({ type, title, question, context = "", payload }) {
  await ensureLabelsExist([PENDING_LABEL, "urgent", `permission:${type}`]);
  const body =
    [
      question,
      context,
      "",
      "Reply on this issue with **yes**/**approve** or **no**/**deny** — the agents check for your reply on every run (every 6h, or trigger `workflow_dispatch` on the Growth Agents workflow for an immediate check).",
    ]
      .filter(Boolean)
      .join("\n\n") + embedPayload(payload);

  return createIssue({ title, body, labels: [PENDING_LABEL, "urgent", `permission:${type}`] });
}

/** Resolves any `permission:<type>` request the owner has replied to. Returns the decision + original payload for each. */
export async function resolvePermissions(type) {
  await ensureLabelsExist(["decision:granted", "decision:denied"]);
  const issues = await listIssuesByLabel(`permission:${type}`).catch(() => []);
  const pending = issues.filter((i) => i.labels.some((l) => l.name === PENDING_LABEL));
  const resolved = [];

  for (const issue of pending) {
    const comments = await listIssueComments(issue.number).catch(() => []);
    const ownerComments = comments.filter((c) => c.user?.type !== "Bot");
    const decision = decideFromComments(ownerComments);
    if (!decision) continue;

    const labels = issue.labels.map((l) => l.name).filter((l) => l !== PENDING_LABEL);
    await setIssueLabels(issue.number, [...labels, `decision:${decision}`]);
    await addIssueComment(
      issue.number,
      decision === "granted" ? "Got it — proceeding." : "Got it — skipping, no action taken."
    );
    await closeIssue(issue.number);
    resolved.push({ issue, decision, payload: extractPayload(issue.body) });
  }

  return resolved;
}
