// GitHub Issues used as a zero-infrastructure CRM/lead board and as the
// run-log for the leader agent. Plain REST via fetch, no Octokit.

import { config } from "../config.mjs";

const API_URL = "https://api.github.com";

function authHeaders() {
  return {
    Authorization: `Bearer ${config.githubToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "content-type": "application/json",
  };
}

function assertReady() {
  if (!config.githubToken) throw new Error("GH_TOKEN is not set");
  if (!config.githubRepo) throw new Error("GITHUB_REPOSITORY is not set");
}

async function ghFetch(path, opts = {}) {
  assertReady();
  const res = await fetch(`${API_URL}/repos/${config.githubRepo}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub API error ${res.status} ${path}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

/** Find an existing open issue whose title exactly matches (used to dedupe leads). */
export async function findIssueByTitle(title, label) {
  assertReady();
  const q = encodeURIComponent(
    `repo:${config.githubRepo} is:issue "${title}" in:title ${label ? `label:"${label}"` : ""}`
  );
  const res = await fetch(`${API_URL}/search/issues?q=${q}`, { headers: authHeaders() });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.items || []).find((i) => i.title === title) || null;
}

export async function createIssue({ title, body, labels = [] }) {
  return ghFetch("/issues", {
    method: "POST",
    body: JSON.stringify({ title, body, labels }),
  });
}

export async function addIssueComment(issueNumber, body) {
  return ghFetch(`/issues/${issueNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function setIssueLabels(issueNumber, labels) {
  return ghFetch(`/issues/${issueNumber}/labels`, {
    method: "PUT",
    body: JSON.stringify({ labels }),
  });
}

export async function listIssuesByLabel(label, state = "open") {
  assertReady();
  const params = new URLSearchParams({ labels: label, state, per_page: "100" });
  return ghFetch(`/issues?${params.toString()}`);
}

export async function getIssue(issueNumber) {
  return ghFetch(`/issues/${issueNumber}`);
}

export async function listIssueComments(issueNumber) {
  return ghFetch(`/issues/${issueNumber}/comments?per_page=100`);
}

/** All open issues across every label (used by the local dashboard). Excludes PRs, which the REST API otherwise mixes into /issues. */
export async function listAllOpenIssues() {
  assertReady();
  const params = new URLSearchParams({ state: "open", per_page: "100" });
  const issues = await ghFetch(`/issues?${params.toString()}`);
  return issues.filter((issue) => !issue.pull_request);
}

export async function closeIssue(issueNumber) {
  return ghFetch(`/issues/${issueNumber}`, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" }),
  });
}

export async function ensureLabelsExist(labels) {
  const palette = {
    lead: "0e8a16",
    "status:new": "fbca04",
    "status:drafted": "1d76db",
    "status:contacted": "5319e7",
    "status:needs-contact-info": "d93f0b",
    "leader-report": "5319e7",
    urgent: "b60205",
    "social-content": "0052cc",
    "search-traffic": "0052cc",
    "awaiting-permission": "fbca04",
    "decision:granted": "0e8a16",
    "decision:denied": "b60205",
  };
  for (const name of labels) {
    try {
      await ghFetch(`/labels/${encodeURIComponent(name)}`);
    } catch {
      try {
        await ghFetch("/labels", {
          method: "POST",
          body: JSON.stringify({ name, color: palette[name] || "ededed" }),
        });
      } catch {
        // label creation races across parallel jobs are fine to ignore
      }
    }
  }
}
