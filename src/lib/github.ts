// Minimal GitHub Issues REST client for the live /dashboard page. Mirrors
// automation/src/lib/github.mjs (the growth agents' own client) so the
// dashboard reads/writes the exact same Issues board, just from the
// website instead of locally. Server-only — never import from a client
// component (it needs GH_TOKEN).

export type GithubLabel = { name: string };

export type GithubIssue = {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  closed_at: string | null;
  labels: GithubLabel[];
  pull_request?: unknown;
};

const API_URL = "https://api.github.com";

function githubRepo() {
  return process.env.GITHUB_REPOSITORY || "marko663/gunafix.com";
}

function authHeaders() {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error("GH_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "content-type": "application/json",
  };
}

async function ghFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_URL}/repos/${githubRepo()}${path}`, {
    ...opts,
    cache: "no-store",
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub API error ${res.status} ${path}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

/** All open issues across every label. Excludes PRs, which the REST API otherwise mixes into /issues. */
export async function listAllOpenIssues(): Promise<GithubIssue[]> {
  const params = new URLSearchParams({ state: "open", per_page: "100" });
  const issues: GithubIssue[] = await ghFetch(`/issues?${params.toString()}`);
  return issues.filter((issue) => !issue.pull_request);
}

export async function addIssueComment(issueNumber: number, body: string) {
  return ghFetch(`/issues/${issueNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function setIssueLabels(issueNumber: number, labels: string[]) {
  return ghFetch(`/issues/${issueNumber}/labels`, {
    method: "PUT",
    body: JSON.stringify({ labels }),
  });
}

export async function closeIssue(issueNumber: number) {
  return ghFetch(`/issues/${issueNumber}`, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" }),
  });
}

export function isGithubConfigured() {
  return Boolean(process.env.GH_TOKEN);
}
