import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CREDENTIAL_CATALOG,
  CREDENTIAL_GROUPS,
  type CredentialGroup,
} from "@/lib/credentialCatalog";
import { isDashboardConfigured, isAuthed } from "@/lib/dashboardAuth";
import {
  GROWTH_AGENTS_WORKFLOW,
  getLatestWorkflowRunWithJobs,
  isGithubConfigured,
  listActionsSecretNames,
  listActionsVariables,
  listAllOpenIssues,
  listIssueComments,
  type GithubIssue,
  type GithubIssueComment,
  type GithubWorkflowJob,
  type GithubWorkflowRun,
} from "@/lib/github";
import { getInstagramOverview, isMetaConfigured, type InstagramOverview } from "@/lib/meta";
import {
  closeIssueAction,
  decideAction,
  login,
  logout,
  markContactedAction,
  runAgentsNowAction,
} from "./actions";
import { SetupAssistantChat } from "./SetupAssistantChat";

export const dynamic = "force-dynamic";

const AGENT_JOB_LABELS: Record<string, string> = {
  "lead-finder": "Lead Finder",
  outreach: "Outreach",
  "social-content": "Social Content",
  "search-traffic": "Search & Traffic",
  leader: "Leader",
};

const AGENT_JOB_ORDER = ["lead-finder", "outreach", "social-content", "search-traffic", "leader"];

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

function ActivityBlock({ comments }: { comments: GithubIssueComment[] }) {
  if (comments.length === 0) return null;
  const recent = [...comments].reverse().slice(0, 5);
  return (
    <div className="space-y-2 border-t border-white/10 pt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-white/40">
        Activity (replies, sends, bookings)
      </p>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {recent.map((c) => (
          <div key={c.id} className="rounded-md bg-white/5 px-3 py-2">
            <p className="mb-1 text-xs text-white/40">
              {c.user?.login ?? "Unknown"} · {new Date(c.created_at).toLocaleString()}
            </p>
            <pre className="whitespace-pre-wrap font-sans text-sm text-white/70">{c.body}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function IssueCard({ issue, comments }: { issue: GithubIssue; comments?: GithubIssueComment[] }) {
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

        {comments ? <ActivityBlock comments={comments} /> : null}

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

function Section({
  title,
  issues,
  commentsByIssue,
}: {
  title: string;
  issues: GithubIssue[];
  commentsByIssue?: Map<number, GithubIssueComment[]>;
}) {
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
            <IssueCard key={issue.number} issue={issue} comments={commentsByIssue?.get(issue.number)} />
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

function AgentStatusSection({
  data,
  error,
}: {
  data: { run: GithubWorkflowRun; jobs: GithubWorkflowJob[] } | null;
  error: string | null;
}) {
  const jobsByName = new Map(data?.jobs.map((j) => [j.name, j]) ?? []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Agents</h2>
        <form action={runAgentsNowAction}>
          <Button type="submit" size="sm">
            Run all agents now
          </Button>
        </form>
      </div>

      {error ? (
        <p className="text-sm text-amber-300/80">
          Couldn&apos;t load agent status: {error} Your <code className="text-amber-200">GH_TOKEN</code>{" "}
          may need Actions read access.
        </p>
      ) : !data ? (
        <p className="text-sm text-white/40">
          No runs yet — agents run every 6h via cron, or use the button above.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {AGENT_JOB_ORDER.map((jobName) => {
            const job = jobsByName.get(jobName);
            const isFailure = job?.conclusion === "failure";
            return (
              <div
                key={jobName}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{AGENT_JOB_LABELS[jobName]}</p>
                  <p className="text-xs text-white/40">
                    {job?.completed_at
                      ? new Date(job.completed_at).toLocaleString()
                      : job?.started_at
                        ? `Started ${new Date(job.started_at).toLocaleString()}`
                        : "Not run yet"}
                  </p>
                </div>
                <Badge
                  variant={job?.conclusion === "success" ? "accent" : "outline"}
                  className={isFailure ? "border-red-400/30 bg-red-400/10 text-red-300" : undefined}
                >
                  {job ? job.conclusion ?? job.status : "—"}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

function InstagramSection({
  configured,
  overview,
  error,
}: {
  configured: boolean;
  overview: InstagramOverview | null;
  error: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instagram</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!configured ? (
          <p className="text-sm text-white/60">
            Set <code className="text-emerald-300">META_PAGE_ACCESS_TOKEN</code> and{" "}
            <code className="text-emerald-300">META_IG_USER_ID</code> as website env vars to show
            follower and engagement data here.
          </p>
        ) : error ? (
          <p className="text-sm text-amber-300/80">Couldn&apos;t load Instagram data: {error}</p>
        ) : overview ? (
          <>
            <div className="flex flex-wrap items-center gap-4">
              {overview.profile.profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={overview.profile.profilePictureUrl}
                  alt={overview.profile.username}
                  className="h-14 w-14 rounded-full border border-white/10"
                />
              ) : null}
              <div>
                <p className="font-medium text-white">@{overview.profile.username}</p>
                {overview.profile.name ? (
                  <p className="text-sm text-white/50">{overview.profile.name}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Followers" value={overview.profile.followersCount} />
              <Stat label="Following" value={overview.profile.followsCount ?? "—"} />
              <Stat label="Posts" value={overview.profile.mediaCount} />
              <Stat label="Avg likes + comments / post" value={overview.totals.avgLikes + overview.totals.avgComments} />
            </div>

            {overview.media.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                  Recent posts
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {overview.media.map((m) => (
                    <a
                      key={m.id}
                      href={m.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block overflow-hidden rounded-lg border border-white/10"
                    >
                      {m.thumbnailUrl || m.mediaUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.thumbnailUrl ?? m.mediaUrl ?? ""}
                          alt={m.caption ?? "Instagram post"}
                          className="aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-square w-full bg-white/5" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                        {m.likeCount} likes · {m.commentsCount} comments
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CredentialsChecklist({
  secretNames,
  variables,
  error,
}: {
  secretNames: string[];
  variables: Record<string, string>;
  error: string | null;
}) {
  const groups = new Map<CredentialGroup, typeof CREDENTIAL_CATALOG>();
  for (const cred of CREDENTIAL_CATALOG) {
    groups.set(cred.group, [...(groups.get(cred.group) ?? []), cred]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credentials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <p className="text-sm text-amber-300/80">
            Couldn&apos;t load credential status: {error} Your{" "}
            <code className="text-amber-200">GH_TOKEN</code> may need Secrets/Variables read access.
          </p>
        ) : (
          Array.from(groups.entries()).map(([group, creds]) => (
            <div key={group} className="space-y-2">
              <h3 className="text-sm font-medium text-white/70">{CREDENTIAL_GROUPS[group]}</h3>
              <div className="space-y-1.5">
                {creds.map((cred) => {
                  const configured =
                    cred.kind === "secret"
                      ? secretNames.includes(cred.name)
                      : Boolean(variables[cred.name]);
                  return (
                    <div key={cred.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-white/70">{cred.label}</span>
                      {configured ? (
                        cred.kind === "variable" ? (
                          <span className="max-w-[55%] truncate text-xs text-emerald-300">
                            {variables[cred.name]}
                          </span>
                        ) : (
                          <Badge variant="accent">set</Badge>
                        )
                      ) : (
                        <Badge variant="outline">missing</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
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

  // Only leads that have actually been emailed can have a reply worth showing —
  // fetching comments for every open issue would be a lot of extra GitHub calls
  // for no benefit on fresh, not-yet-contacted leads.
  const repliableLeadNumbers = groups.leads
    .filter((i) => labelNames(i).some((l) => l === "status:contacted" || l === "status:meeting-booked"))
    .map((i) => i.number);
  let commentsByIssue = new Map<number, GithubIssueComment[]>();
  try {
    const results = await Promise.all(
      repliableLeadNumbers.map(async (number) => [number, await listIssueComments(number)] as const),
    );
    commentsByIssue = new Map(results);
  } catch {
    // best-effort — the board still renders without reply/activity history
  }

  let agentRunData: { run: GithubWorkflowRun; jobs: GithubWorkflowJob[] } | null = null;
  let agentStatusError: string | null = null;
  try {
    agentRunData = await getLatestWorkflowRunWithJobs(GROWTH_AGENTS_WORKFLOW);
  } catch (error) {
    agentStatusError = error instanceof Error ? error.message : "Unknown error.";
  }

  let secretNames: string[] = [];
  let variables: Record<string, string> = {};
  let credentialsError: string | null = null;
  try {
    [secretNames, variables] = await Promise.all([listActionsSecretNames(), listActionsVariables()]);
  } catch (error) {
    credentialsError = error instanceof Error ? error.message : "Unknown error.";
  }

  const metaConfigured = isMetaConfigured();
  let instagramOverview: InstagramOverview | null = null;
  let instagramError: string | null = null;
  if (metaConfigured) {
    try {
      instagramOverview = await getInstagramOverview();
    } catch (error) {
      instagramError = error instanceof Error ? error.message : "Unknown error.";
    }
  }

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

      <div className="mb-12">
        <AgentStatusSection data={agentRunData} error={agentStatusError} />
      </div>

      <div className="mb-12">
        <InstagramSection
          configured={metaConfigured}
          overview={instagramOverview}
          error={instagramError}
        />
      </div>

      <div className="mb-12 grid gap-6 lg:grid-cols-2">
        <CredentialsChecklist
          secretNames={secretNames}
          variables={variables}
          error={credentialsError}
        />
        <SetupAssistantChat />
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
        <Section title="Leads" issues={groups.leads} commentsByIssue={commentsByIssue} />
        <Section title="Social content" issues={groups.social} />
        <Section title="Search & traffic digests" issues={groups.search} />
        <Section title="Leader run log" issues={groups.leaderReports} />
        {groups.other.length > 0 ? <Section title="Other" issues={groups.other} /> : null}
      </div>
    </Shell>
  );
}
