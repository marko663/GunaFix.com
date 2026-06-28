// Tracks outreach's daily email-send count against config.dailyEmailTarget,
// using a single pinned GitHub issue as the counter — same zero-database
// pattern as the leader's run-log (state lives in a hidden JSON marker in
// the issue body, rewritten in place each time instead of growing forever).
//
// outreach.mjs calls recordSends() after every run. leadFinder.mjs calls
// getTodayProgress() + pacingMultiplier() to decide how much harder to
// search this run when the day is behind pace — since real send volume is
// bounded by how many leads with a usable email get sourced, not by
// outreach itself (it already drains 100% of what's available every run).

import { config } from "../config.mjs";
import { findIssueByTitle, createIssue, updateIssue } from "./github.mjs";

const COUNTER_TITLE = "[Outreach] Daily Send Counter";
const MARKER_RE = /<!-- daily-pace\n([\s\S]+?)\n-->/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function utcMsSinceMidnight() {
  const now = new Date();
  return now.getUTCHours() * 3600000 + now.getUTCMinutes() * 60000 + now.getUTCSeconds() * 1000;
}

function renderBody(state) {
  return [
    "Tracks emails sent today against the daily target. Read by lead-finder to decide how aggressively to search; rewritten in place each run, resets automatically at UTC midnight.",
    "",
    `**${state.date}: ${state.count} / ${config.dailyEmailTarget} sent**`,
    "",
    `<!-- daily-pace\n${JSON.stringify({ date: state.date, count: state.count })}\n-->`,
  ].join("\n");
}

/** Reads the marker out of the counter issue's body, rolling over to a fresh zero count if the embedded date isn't today (UTC). */
function currentState(issue) {
  const match = (issue.body || "").match(MARKER_RE);
  let marker = null;
  try {
    marker = match ? JSON.parse(match[1]) : null;
  } catch {
    marker = null;
  }
  if (!marker || marker.date !== todayUTC()) return { date: todayUTC(), count: 0 };
  return marker;
}

async function getOrCreateCounter() {
  const issue = await findIssueByTitle(COUNTER_TITLE, "outreach-counter");
  if (issue) return issue;
  return createIssue({
    title: COUNTER_TITLE,
    body: renderBody({ date: todayUTC(), count: 0 }),
    labels: ["outreach-counter"],
  });
}

/** Adds `n` successful sends to today's running count. Call once per outreach run. */
export async function recordSends(n) {
  if (!n) return;
  const issue = await getOrCreateCounter();
  const state = currentState(issue);
  state.count += n;
  await updateIssue(issue.number, { body: renderBody(state) });
}

/** Read-only — how many emails have gone out today vs. the target, with no write. */
export async function getTodayProgress() {
  const issue = await getOrCreateCounter();
  const state = currentState(issue);
  return { sentToday: state.count, target: config.dailyEmailTarget };
}

/**
 * How much harder lead-finder should search this run to catch up, based on
 * how far through the UTC day we are vs. how many emails have actually gone
 * out. 1 = on pace, no change. Capped at 3x so catching up doesn't blow out
 * Places API billing in one run.
 */
export function pacingMultiplier({ sentToday, target }) {
  if (!target || target <= 0) return 1;
  const fractionOfDay = Math.min(1, utcMsSinceMidnight() / MS_PER_DAY);
  const expectedByNow = target * fractionOfDay;
  if (sentToday >= expectedByNow) return 1;
  const deficit = expectedByNow - sentToday;
  return 1 + Math.min(2, deficit / Math.max(1, target * 0.1));
}
