// Minimal GitHub Issues REST client for the live /dashboard page. Mirrors
// automation/src/lib/github.mjs (the growth agents' own client) so the
// dashboard reads/writes the exact same Issues board, just from the
// website instead of locally. Server-only — never import from a client
// component (it needs GH_TOKEN).
//
// Also covers the Actions API surface the dashboard's agent-status panel
// and credential-setup chat need: workflow runs/jobs, workflow_dispatch,
// and Actions secrets/variables. Writing secrets requires GH_TOKEN to carry
// repo-level Secrets + Variables + Actions permissions, not just Issues.

import sodium from "libsodium-wrappers";

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

/** The single workflow file all 5 growth agents run as jobs inside — see .github/workflows/growth-agents.yml. */
export const GROWTH_AGENTS_WORKFLOW = "growth-agents.yml";

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

async function rawFetch(path: string, opts: RequestInit = {}) {
  return fetch(`${API_URL}/repos/${githubRepo()}${path}`, {
    ...opts,
    cache: "no-store",
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });
}

async function ghFetch(path: string, opts: RequestInit = {}) {
  const res = await rawFetch(path, opts);
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

export type GithubIssueComment = {
  id: number;
  body: string;
  created_at: string;
  user: { login: string; type: string } | null;
};

/** Full comment history for an issue — used to surface lead replies (and auto-booked meeting confirmations) on the dashboard. */
export async function listIssueComments(issueNumber: number): Promise<GithubIssueComment[]> {
  return ghFetch(`/issues/${issueNumber}/comments?per_page=100`);
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

export type GithubWorkflowJob = {
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  html_url: string;
};

export type GithubWorkflowRun = {
  id: number;
  status: string;
  conclusion: string | null;
  created_at: string;
  html_url: string;
};

export async function getRepoDefaultBranch(): Promise<string> {
  const repo = await ghFetch("");
  return repo.default_branch as string;
}

/** Latest run of a workflow file (e.g. "growth-agents.yml") plus its per-job status. */
export async function getLatestWorkflowRunWithJobs(
  workflowFile: string,
): Promise<{ run: GithubWorkflowRun; jobs: GithubWorkflowJob[] } | null> {
  const params = new URLSearchParams({ per_page: "1" });
  const data = await ghFetch(`/actions/workflows/${workflowFile}/runs?${params.toString()}`);
  const run: GithubWorkflowRun | undefined = data.workflow_runs?.[0];
  if (!run) return null;
  const jobsData = await ghFetch(`/actions/runs/${run.id}/jobs`);
  return { run, jobs: jobsData.jobs ?? [] };
}

/** Fires workflow_dispatch on the repo's default branch. GitHub returns 204 with no run id. */
export async function triggerWorkflowDispatch(workflowFile: string): Promise<void> {
  const ref = await getRepoDefaultBranch();
  await ghFetch(`/actions/workflows/${workflowFile}/dispatches`, {
    method: "POST",
    body: JSON.stringify({ ref }),
  });
}

async function getActionsPublicKey(): Promise<{ key_id: string; key: string }> {
  return ghFetch("/actions/secrets/public-key");
}

/** Encrypts and writes (create-or-update) a repository Actions secret. Value is never readable back. */
export async function setActionsSecret(name: string, value: string): Promise<void> {
  await sodium.ready;
  const { key, key_id } = await getActionsPublicKey();
  const encrypted = sodium.crypto_box_seal(
    sodium.from_string(value),
    sodium.from_base64(key, sodium.base64_variants.ORIGINAL),
  );
  const encrypted_value = sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL);
  await ghFetch(`/actions/secrets/${name}`, {
    method: "PUT",
    body: JSON.stringify({ encrypted_value, key_id }),
  });
}

/** Creates or updates a repository Actions variable (plaintext, non-sensitive config). */
export async function setActionsVariable(name: string, value: string): Promise<void> {
  const patchRes = await rawFetch(`/actions/variables/${name}`, {
    method: "PATCH",
    body: JSON.stringify({ name, value }),
  });
  if (patchRes.status === 404) {
    await ghFetch("/actions/variables", {
      method: "POST",
      body: JSON.stringify({ name, value }),
    });
    return;
  }
  if (!patchRes.ok) {
    const text = await patchRes.text().catch(() => "");
    throw new Error(`GitHub API error ${patchRes.status} /actions/variables/${name}: ${text}`);
  }
}

/** Names of configured repository secrets only — GitHub never exposes secret values via the API. */
export async function listActionsSecretNames(): Promise<string[]> {
  const data = await ghFetch("/actions/secrets?per_page=100");
  return (data.secrets ?? []).map((s: { name: string }) => s.name);
}

/** All repository variables with their plaintext values (variables are non-sensitive by design). */
export async function listActionsVariables(): Promise<Record<string, string>> {
  const data = await ghFetch("/actions/variables?per_page=100");
  const out: Record<string, string> = {};
  for (const v of data.variables ?? []) out[v.name] = v.value;
  return out;
}
