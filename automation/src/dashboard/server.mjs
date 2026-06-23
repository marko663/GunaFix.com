// Local dashboard — a read/write mirror of the GitHub Issues board the
// growth agents use as their CRM. There is no local datastore: every render
// fetches live from GitHub, and every button posts straight back to the
// GitHub API. That keeps GitHub as the single source of truth while giving
// a faster, mobile-friendlier view than the Issues tab.

import http from "node:http";
import { config, requireFields } from "../config.mjs";
import { listAllOpenIssues, setIssueLabels, closeIssue } from "../lib/github.mjs";

const PORT = Number(process.env.DASHBOARD_PORT || 4040);

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function labelNames(issue) {
  return issue.labels.map((l) => (typeof l === "string" ? l : l.name));
}

function categorize(issues) {
  const groups = { urgent: [], leads: [], social: [], ads: [], leaderReports: [], other: [] };
  for (const issue of issues) {
    const labels = labelNames(issue);
    if (labels.includes("urgent")) groups.urgent.push(issue);
    else if (labels.includes("lead")) groups.leads.push(issue);
    else if (labels.includes("social-content")) groups.social.push(issue);
    else if (labels.includes("ads-traffic")) groups.ads.push(issue);
    else if (labels.includes("leader-report")) groups.leaderReports.push(issue);
    else groups.other.push(issue);
  }
  return groups;
}

function actionForm(issue, fields, text) {
  const hidden = Object.entries(fields)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${escapeHtml(String(v))}" />`)
    .join("");
  return `<form method="POST" action="/action" class="inline-form">
    <input type="hidden" name="number" value="${issue.number}" />
    ${hidden}
    <button type="submit">${text}</button>
  </form>`;
}

function renderIssue(issue) {
  const labels = labelNames(issue);
  const chips = labels.map((l) => `<span class="chip">${escapeHtml(l)}</span>`).join(" ");

  const actions = [];
  if (labels.includes("lead") && !labels.includes("status:contacted")) {
    actions.push(
      actionForm(
        issue,
        { action: "set-status", label: "status:contacted", currentLabels: labels.join(",") },
        "Mark contacted"
      )
    );
  }
  if (!labels.includes("leader-report") && !labels.includes("ads-traffic")) {
    actions.push(actionForm(issue, { action: "close" }, "Close"));
  }

  return `<div class="issue">
    <div class="issue-head">
      <a href="${issue.html_url}" target="_blank" rel="noopener">#${issue.number} ${escapeHtml(issue.title)}</a>
      <span class="actions">${actions.join(" ")}</span>
    </div>
    <div class="chips">${chips}</div>
    <pre class="body">${escapeHtml(issue.body || "")}</pre>
  </div>`;
}

function renderSection(title, issues) {
  if (issues.length === 0) {
    return `<section><h2>${title} (0)</h2><p class="empty">Nothing here.</p></section>`;
  }
  return `<section><h2>${title} (${issues.length})</h2>${issues.map(renderIssue).join("")}</section>`;
}

async function renderPage() {
  const issues = await listAllOpenIssues();
  const groups = categorize(issues);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(config.businessName)} Growth Agents — Dashboard</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: -apple-system, system-ui, sans-serif; max-width: 880px; margin: 32px auto; padding: 0 16px; color: #1a1a1a; }
  h1 { margin-bottom: 4px; }
  .sub { color: #666; margin-top: 0; }
  section { margin-bottom: 32px; }
  h2 { border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  .issue { border: 1px solid #e2e2e2; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; }
  .issue-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
  .issue-head a { font-weight: 600; text-decoration: none; color: #0a58ca; }
  .chips { margin-top: 6px; }
  .chip { display: inline-block; background: #f1f1f1; border-radius: 12px; padding: 2px 10px; font-size: 12px; margin-right: 4px; color: #444; }
  .body { white-space: pre-wrap; font-family: inherit; font-size: 14px; color: #333; margin-top: 8px; max-height: 200px; overflow-y: auto; }
  .empty { color: #999; font-style: italic; }
  .inline-form { display: inline; margin: 0; }
  button { border: 1px solid #ccc; background: #fff; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 13px; }
  button:hover { background: #f5f5f5; }
  .actions { display: flex; gap: 6px; }
  .refresh { color: #999; font-size: 13px; }
</style>
</head>
<body>
  <h1>${escapeHtml(config.businessName)} Growth Agents</h1>
  <p class="sub">Local mirror of the GitHub Issues board — actions here write straight back to GitHub, nothing is stored locally.
    <a href="https://github.com/${config.githubRepo}/issues" target="_blank" rel="noopener">Open on GitHub →</a></p>
  ${renderSection("Urgent", groups.urgent)}
  ${renderSection("Leads", groups.leads)}
  ${renderSection("Social content", groups.social)}
  ${renderSection("Ads & traffic digests", groups.ads)}
  ${renderSection("Leader run log", groups.leaderReports)}
  ${groups.other.length ? renderSection("Other", groups.other) : ""}
  <p class="refresh"><a href="/">Refresh</a></p>
</body>
</html>`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

async function handleAction(req, res) {
  const raw = await readBody(req);
  const params = new URLSearchParams(raw);
  const number = params.get("number");
  const action = params.get("action");

  try {
    if (action === "close") {
      await closeIssue(number);
    } else if (action === "set-status") {
      const label = params.get("label");
      const currentLabels = (params.get("currentLabels") || "").split(",").filter(Boolean);
      const nextLabels = [...currentLabels.filter((l) => !l.startsWith("status:")), label];
      await setIssueLabels(number, nextLabels);
    }
  } catch (err) {
    console.error(`[dashboard] action failed: ${err.message}`);
  }

  res.writeHead(303, { Location: "/" });
  res.end();
}

async function start() {
  if (!requireFields(config, ["githubToken", "githubRepo"], "dashboard")) {
    console.log(
      "[dashboard] set GH_TOKEN (a personal access token works locally) and GITHUB_REPOSITORY=owner/repo"
    );
    process.exitCode = 1;
    return;
  }

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/") {
        const html = await renderPage();
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(html);
      } else if (req.method === "POST" && req.url === "/action") {
        await handleAction(req, res);
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    } catch (err) {
      console.error("[dashboard] request error:", err);
      res.writeHead(500);
      res.end("Internal error");
    }
  });

  server.listen(PORT, () => {
    console.log(`[dashboard] running at http://localhost:${PORT}`);
  });
}

start();
