import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isDashboardConfigured, isAuthed } from "@/lib/dashboardAuth";
import { isGithubConfigured, listAllOpenIssues, type GithubIssue } from "@/lib/github";
import {
  closeIssueAction,
  decideAction,
  login,
  logout,
  markContactedAction,
} from "./actions";

export const dynamic = "force-dynamic";

function labelNames(issue: GithubIssue) {
  return issue.labels.map((l) => l.name);
}

function categorize(issues: GithubIssue[]) {
  const groups = {
    permissions: [] as GithubIssue[],
    urgent: [] as GithubIssue[],
    leads: [] as GithubIssue[],
    social: [] as GithubIssue[],
    search: [] as GithubIssue[],
    leaderReports: [] as GithubIssue[],
    other: [] as GithubIssue[],
  };
  for (const issue of issues) {
    const labels = labelNames(issue);
    if (labels.includes("awaiting-permission")) groups.permissions.push(issue);
    else if (labels.includes("urgent")) groups.urgent.push(issue);
    else if (labels.includes("lead")) groups.leads.push(issue);
    else if (labels.includes("social-content")) groups.social.push(issue);
    else if (labels.includes("search-traffic")) groups.search.push(issue);
    else if (labels.includes("leader-report")) groups.leaderReports.push(issue);
    else groups.other.push(issue);
  }
  return groups;
}

function IssueCard({ issue }: { issue: GithubIssue }) {
  const labels = labelNames(issue);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white hover:text-emerald-300"
          >
            #{issue.number} {issue.title}
          </a>
          <div className="flex flex-wrap gap-2">
            {labels.map((l) => (
              <Badge key={l} variant={l === "urgent" ? "accent" : "outline"}>
                {l}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {issue.body ? (
          <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-sm text-white/70">
            {issue.body}
          </pre>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {labels.includes("awaiting-permission") ? (
            <>
              <form action={decideAction}>
                <input type="hidden" name="number" value={issue.number} />
                <input type="hidden" name="decision" value="granted" />
                <Button type="submit" size="sm">
                  Approve
                </Button>
              </form>
              <form action={decideAction}>
                <input type="hidden" name="number" value={issue.number} />
                <input type="hidden" name="decision" value="denied" />
                <Button type="submit" size="sm" variant="outline">
                  Deny
                </Button>
              </form>
            </>
          ) : null}

          {labels.includes("lead") && !labels.includes("status:contacted") ? (
            <form action={markContactedAction}>
              <input type="hidden" name="number" value={issue.number} />
              <input type="hidden" name="currentLabels" value={labels.join(",")} />
              <Button type="submit" size="sm" variant="outline">
                Mark contacted
              </Button>
            </form>
          ) : null}

          {!labels.includes("leader-report") &&
          !labels.includes("search-traffic") &&
          !labels.includes("awaiting-permission") ? (
            <form action={closeIssueAction}>
              <input type="hidden" name="number" value={issue.number} />
              <Button type="submit" size="sm" variant="ghost">
                Close
              </Button>
            </form>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Section({ title, issues }: { title: string; issues: GithubIssue[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">
        {title} <span className="text-white/40">({issues.length})</span>
      </h2>
      {issues.length === 0 ? (
        <p className="text-sm text-white/40">Nothing here.</p>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <IssueCard key={issue.number} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">{children}</div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!isDashboardConfigured()) {
    return (
      <Shell>
        <Card>
          <CardHeader>
            <CardTitle>Dashboard not configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/60">
              Set the <code className="text-emerald-300">DASHBOARD_PASSWORD</code> environment
              variable to enable this page.
            </p>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  const authed = await isAuthed();

  if (!authed) {
    const params = await searchParams;
    const hasError = params.error === "1";

    return (
      <Shell>
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle>Growth Agents Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={login} className="space-y-4">
              <Input type="password" name="password" placeholder="Password" required autoFocus />
              {hasError ? (
                <p className="text-sm text-red-400">Incorrect password.</p>
              ) : null}
              <Button type="submit" className="w-full">
                Log in
              </Button>
            </form>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  if (!isGithubConfigured()) {
    return (
      <Shell>
        <Card>
          <CardHeader>
            <CardTitle>GitHub not configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/60">
              Set <code className="text-emerald-300">GH_TOKEN</code> (and optionally{" "}
              <code className="text-emerald-300">GITHUB_REPOSITORY</code>) to load the leads and
              run-log board.
            </p>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  let issues: GithubIssue[];
  try {
    issues = await listAllOpenIssues();
  } catch (error) {
    return (
      <Shell>
        <Card>
          <CardHeader>
            <CardTitle>Couldn&apos;t load issues from GitHub</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/60">
              {error instanceof Error ? error.message : "Unknown error."} Double-check{" "}
              <code className="text-emerald-300">GH_TOKEN</code> is a valid, unexpired token with
              Issues read/write access on this repo.
            </p>
          </CardContent>
        </Card>
      </Shell>
    );
  }
  const groups = categorize(issues);

  return (
    <Shell>
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Growth Agents Dashboard
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Live mirror of the GitHub Issues board — actions here write straight back to GitHub,
            nothing is stored on this site.
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" size="sm" variant="ghost">
            Log out
          </Button>
        </form>
      </div>

      <div className="space-y-12">
        {groups.permissions.length > 0 ? (
          <p className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-white/70">
            Approve/Deny posts your reply — the agents apply it on their next run (every 6h, or
            trigger <code className="text-emerald-300">workflow_dispatch</code> on the Growth
            Agents workflow for an immediate check).
          </p>
        ) : null}
        <Section title="Needs your decision" issues={groups.permissions} />
        <Section title="Urgent" issues={groups.urgent} />
        <Section title="Leads" issues={groups.leads} />
        <Section title="Social content" issues={groups.social} />
        <Section title="Search & traffic digests" issues={groups.search} />
        <Section title="Leader run log" issues={groups.leaderReports} />
        {groups.other.length > 0 ? <Section title="Other" issues={groups.other} /> : null}
      </div>
    </Shell>
  );
}
