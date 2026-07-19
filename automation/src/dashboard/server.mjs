// GunaFix Growth Agent Hub — local web server
// Voice-driven dashboard with credentials manager, agent memory, live logs, CRM
// Run: node src/dashboard/server.mjs   (or: npm start / pm2 start)

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");  // repo root
const AUTO_ROOT = path.resolve(__dirname, "../..");  // automation/
const ENV_FILE = path.join(AUTO_ROOT, ".env");
const DATA_DIR = path.join(AUTO_ROOT, "data");
const MEMORY_FILE = path.join(DATA_DIR, "memory.json");

const PORT = Number(process.env.DASHBOARD_PORT || 3000);

// ─── env helpers ───────────────────────────────────────────────────────────────

function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const lines = fs.readFileSync(ENV_FILE, "utf8").split("\n");
  const out = {};
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

function saveEnvFile(updates) {
  const existing = loadEnvFile();
  const merged = { ...existing, ...updates };
  const content = Object.entries(merged)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n";
  fs.mkdirSync(path.dirname(ENV_FILE), { recursive: true });
  fs.writeFileSync(ENV_FILE, content, "utf8");
  // apply to current process.env so next agent spawn picks them up
  for (const [k, v] of Object.entries(merged)) process.env[k] = v;
}

function applyEnvFile() {
  const vars = loadEnvFile();
  for (const [k, v] of Object.entries(vars)) {
    if (!process.env[k]) process.env[k] = v;
  }
}

applyEnvFile();

// ─── memory ────────────────────────────────────────────────────────────────────

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadMemory() {
  ensureDataDir();
  if (!fs.existsSync(MEMORY_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8")); }
  catch { return []; }
}

function appendMemory(entry) {
  ensureDataDir();
  const mem = loadMemory();
  mem.push({ ...entry, ts: new Date().toISOString() });
  // keep last 5000 entries
  const trimmed = mem.slice(-5000);
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(trimmed, null, 2), "utf8");
  return trimmed;
}

function getMemorySummary(n = 20) {
  const mem = loadMemory();
  return mem.slice(-n).reverse();
}

// ─── SSE broadcast ─────────────────────────────────────────────────────────────

const sseClients = new Set();

function broadcast(type, data) {
  const payload = `data: ${JSON.stringify({ type, ...data })}\n\n`;
  for (const res of sseClients) {
    try { res.write(payload); } catch { sseClients.delete(res); }
  }
}

// ─── agent runner ──────────────────────────────────────────────────────────────

const AGENTS = [
  { id: "lead-finder",    label: "Lead Finder",    script: "src/agents/leadFinder.mjs",    schedule: "6h"  },
  { id: "outreach",       label: "Outreach",       script: "src/agents/outreach.mjs",       schedule: "30m" },
  { id: "social-content", label: "Social Content", script: "src/agents/socialContent.mjs", schedule: "24h" },
  { id: "search-traffic", label: "Search & Traffic", script: "src/agents/searchTraffic.mjs", schedule: "24h" },
  { id: "leader",         label: "Leader Digest",  script: "src/agents/leader.mjs",         schedule: "6h"  },
];

const runningAgents = new Map(); // id → child process

function runAgent(agentId) {
  if (runningAgents.has(agentId)) return { ok: false, msg: "already running" };
  const agent = AGENTS.find((a) => a.id === agentId);
  if (!agent) return { ok: false, msg: "unknown agent" };

  broadcast("agent-start", { agentId, label: agent.label, ts: new Date().toISOString() });
  appendMemory({ type: "agent-run", agentId, label: agent.label });

  const env = { ...process.env };
  const child = spawn("node", [agent.script], { cwd: AUTO_ROOT, env, stdio: ["ignore", "pipe", "pipe"] });
  runningAgents.set(agentId, child);

  function onLine(stream, isErr) {
    let buf = "";
    stream.on("data", (chunk) => {
      buf += chunk.toString();
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        broadcast("agent-log", { agentId, line, isErr });
        // detect email-sent event in agent output
        if (/\[outreach\].*draft created|email.*sent|draft.*gmail/i.test(line)) {
          appendMemory({ type: "email-sent", agentId, line });
        }
        if (/\[lead\]|lead found|new lead/i.test(line)) {
          appendMemory({ type: "lead-found", agentId, line });
        }
      }
    });
  }
  onLine(child.stdout, false);
  onLine(child.stderr, true);

  child.on("exit", (code) => {
    runningAgents.delete(agentId);
    broadcast("agent-done", { agentId, code, ts: new Date().toISOString() });
  });

  return { ok: true };
}

// ─── scheduler ─────────────────────────────────────────────────────────────────

const lastRun = {};

function scheduleMs(s) {
  const m = s.match(/^(\d+)(m|h)$/);
  if (!m) return null;
  return Number(m[1]) * (m[2] === "h" ? 3600000 : 60000);
}

setInterval(() => {
  const now = Date.now();
  for (const agent of AGENTS) {
    const interval = scheduleMs(agent.schedule);
    if (!interval) continue;
    const last = lastRun[agent.id] || 0;
    if (now - last >= interval) {
      lastRun[agent.id] = now;
      if (!runningAgents.has(agent.id)) {
        console.log(`[scheduler] auto-running ${agent.id}`);
        runAgent(agent.id);
      }
    }
  }
}, 60_000); // check every minute

// ─── Claude chat ───────────────────────────────────────────────────────────────

async function claudeChat(userMessage, history) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return "I don't have an Anthropic API key yet. Please add ANTHROPIC_API_KEY in the Credentials tab.";
  }

  const mem = getMemorySummary(30);
  const memText = mem.length
    ? mem.map((e) => `[${e.ts}] ${e.type}: ${e.line || e.label || e.agentId || ""}`).join("\n")
    : "No activity yet.";

  const runningList = [...runningAgents.keys()].join(", ") || "none";
  const agentList = AGENTS.map((a) => `${a.id} (${a.schedule})`).join(", ");

  const system = `You are GUNA — the GunaFix Unified Navigation Agent. You are the central intelligence for Marko Guna's business-growth automation system at GunaFix.com. Speak like JARVIS: calm, precise, British-inflected phrasing, always respectful, slightly formal. Never rambling. Built for voice — keep answers tight and clear.

═══════════════════════════════════════════════════════════
OWNER
═══════════════════════════════════════════════════════════
Name: Marko Guna (address as "Mr. Guna" in formal moments, "Marko" when casual)
Business: GunaFix.com — a service business that helps other local businesses grow
Email: markoguna9@gmail.com
GitHub repo: marko663/GunaFix.com (private — all agent data lives here as Issues)

═══════════════════════════════════════════════════════════
THE 5 GROWTH AGENTS  (all run as Node.js scripts, zero external deps)
═══════════════════════════════════════════════════════════

1. LEAD FINDER  [lead-finder]  — schedule: every 6 hours
   PURPOSE: Discovers new potential clients who need website/growth help.
   HOW: Calls Google Places API with rotating categories and regions. Each run
   searches up to 8 category+region pairs (e.g. "dentist" in "London UK"), pulls
   20 businesses per search, scrapes their website for a contact email, then opens
   a GitHub Issue labelled "lead" for every business that (a) has no website or a
   poor one and (b) hasn't been seen before. Falls back to pattern-guessing emails
   (info@, hello@, contact@) when no email is visible.
   CREDENTIALS NEEDED: GOOGLE_PLACES_API_KEY, GH_TOKEN, GITHUB_REPOSITORY
   OUTPUT: One GitHub Issue per lead, with business name, phone, address, website,
   scraped email (if found), and a short "why they need help" note.

2. OUTREACH  [outreach]  — schedule: every 30 minutes
   PURPOSE: Sends cold-outreach emails to leads, paces to 200 emails/day target,
   detects replies and books meetings.
   HOW: Reads open "lead" Issues that haven't been contacted yet. For each one,
   calls Claude (Haiku) to draft a personalised cold email referencing their
   specific business. Creates a Gmail draft via Gmail API OAuth2. Tracks daily
   send count in a GitHub variable (OUTREACH_SENT_TODAY + OUTREACH_DATE). Detects
   opt-outs and unsubscribes in reply threads and closes those Issues. When a
   positive reply is detected, calls Claude to draft a meeting-booking reply and
   labels the Issue "status:meeting-booked".
   CREDENTIALS NEEDED: ANTHROPIC_API_KEY, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET,
   GMAIL_REFRESH_TOKEN, SENDER_EMAIL, BUSINESS_PHYSICAL_ADDRESS, GH_TOKEN,
   GITHUB_REPOSITORY, OWNER_TIMEZONE
   OUTPUT: Gmail drafts (ready to review+send), Issue labels updated to
   "status:contacted" or "status:meeting-booked", reply comments on Issues.

3. SOCIAL CONTENT  [social-content]  — schedule: every 24 hours
   PURPOSE: Generates and auto-posts social media content (Facebook + Instagram).
   HOW: Calls Claude to write a short engaging post relevant to GunaFix's audience
   (local business owners). Posts to Facebook Page via Meta Graph API. If an
   Instagram User ID is configured, cross-posts there too. Opens a GitHub Issue
   labelled "social-content" with the post text for the record.
   CREDENTIALS NEEDED: ANTHROPIC_API_KEY, META_PAGE_ACCESS_TOKEN, META_PAGE_ID,
   META_IG_USER_ID (optional), GH_TOKEN, GITHUB_REPOSITORY
   OUTPUT: Live Facebook/Instagram post + Issue tracking it.

4. SEARCH & TRAFFIC  [search-traffic]  — schedule: every 24 hours
   PURPOSE: Reports on GunaFix.com's own organic search performance and GA4 traffic.
   HOW: Calls Google Search Console API (reuses the GA4 service account) to pull
   clicks, impressions, CTR, and average position for the top 20 queries in the
   last 7 days. Also pulls GA4 session/user data. Writes a Markdown digest as a
   GitHub Issue labelled "search-traffic". Flags any query where position dropped
   more than 3 spots week-over-week.
   CREDENTIALS NEEDED: GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY,
   SEARCH_CONSOLE_SITE_URL, GH_TOKEN, GITHUB_REPOSITORY
   OUTPUT: Weekly digest Issue with tables of top queries and traffic trends.

5. LEADER DIGEST  [leader]  — schedule: every 6 hours
   PURPOSE: Orchestrates the other agents, sends urgent email alerts to Marko,
   and posts a run-log summary.
   HOW: Reads all open GitHub Issues. Counts leads found, contacted, replied,
   meetings booked. Identifies Issues labelled "urgent" or "awaiting-permission"
   and emails Marko a plain-text summary so he can act. Also triggers the other
   agents indirectly by summarising what needs doing. Posts a "leader-report"
   Issue with full stats.
   CREDENTIALS NEEDED: ANTHROPIC_API_KEY, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET,
   GMAIL_REFRESH_TOKEN, SENDER_EMAIL, OWNER_EMAIL, GH_TOKEN, GITHUB_REPOSITORY
   OUTPUT: Email to Marko + leader-report GitHub Issue.

═══════════════════════════════════════════════════════════
CURRENT SYSTEM STATUS
═══════════════════════════════════════════════════════════
Agents currently running: ${runningList}
Scheduler active: outreach checks every 30 min, lead-finder/leader every 6 h,
social-content/search-traffic every 24 h.

Recent memory (last 30 events):
${memText}

═══════════════════════════════════════════════════════════
AGENT COMMANDS
═══════════════════════════════════════════════════════════
To trigger an agent, include [RUN:agent-id] in your response.
IDs: lead-finder | outreach | social-content | search-traffic | leader

═══════════════════════════════════════════════════════════
CREDENTIALS STATUS (what's configured)
═══════════════════════════════════════════════════════════
Check process.env at runtime. If a user asks "are my keys set?" tell them which
agents can run and which are still waiting for credentials. Agents silently skip
(log [skip]) when their required keys are missing — they never crash.

═══════════════════════════════════════════════════════════
DASHBOARD TABS
═══════════════════════════════════════════════════════════
Dashboard — agent cards with live run status + real-time log stream via SSE
Voice Chat — this interface (you are here)
Memory — full append-only log: agent-run, email-sent, lead-found, chat-command
Credentials — paste API keys here, saved to automation/.env (never in git)
Leads / CRM — live mirror of GitHub Issues; Approve/Deny/Close actions write
              directly back to GitHub

═══════════════════════════════════════════════════════════
BEHAVIOUR RULES
═══════════════════════════════════════════════════════════
- Voice-first: answers must be speakable (no bullet points, no markdown headers)
- If Marko says "run X" or "start X" → emit [RUN:agent-id] and confirm briefly
- If asked for a status report, summarise memory log highlights in 2–3 sentences
- If credentials are missing for a requested action, tell Marko exactly which
  key is needed and that it goes in the Credentials tab
- Never make up data — only report what is in the memory log
- Keep replies under 3 sentences for voice; go longer only if Marko asks for detail`;

  const messages = [
    ...history.slice(-10),
    { role: "user", content: userMessage },
  ];

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system,
      messages,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return `API error: ${err}`;
  }
  const data = await resp.json();
  return data.content?.[0]?.text || "(no response)";
}

// ─── GitHub CRM helpers ────────────────────────────────────────────────────────

async function ghApi(path, opts = {}) {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY || "marko663/GunaFix.com";
  const url = `https://api.github.com/repos/${repo}${path}`;
  const r = await fetch(url, {
    ...opts,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (!r.ok) throw new Error(`GitHub API ${r.status}: ${await r.text()}`);
  return r.json();
}

async function listOpenIssues() {
  const issues = [];
  let page = 1;
  while (true) {
    const batch = await ghApi(`/issues?state=open&per_page=100&page=${page}`);
    if (!batch.length) break;
    issues.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return issues;
}

function escHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── HTML page ─────────────────────────────────────────────────────────────────

function renderHtml() {
  const agentCards = AGENTS.map(
    (a) => `
    <div class="agent-card" id="card-${a.id}">
      <div class="agent-name">${escHtml(a.label)}</div>
      <div class="agent-status" id="status-${a.id}">idle</div>
      <button class="run-btn" onclick="runAgent('${a.id}')">▶ Run now</button>
    </div>`
  ).join("");

  const credFields = [
    ["ANTHROPIC_API_KEY", "Anthropic API Key", "sk-ant-..."],
    ["GITHUB_REPOSITORY", "GitHub Repo", "owner/repo"],
    ["GH_TOKEN", "GitHub Token (GH_TOKEN)", "ghp_..."],
    ["GOOGLE_PLACES_API_KEY", "Google Places API Key", "AIza..."],
    ["GMAIL_CLIENT_ID", "Gmail Client ID", "...apps.googleusercontent.com"],
    ["GMAIL_CLIENT_SECRET", "Gmail Client Secret", "GOCSPX-..."],
    ["GMAIL_REFRESH_TOKEN", "Gmail Refresh Token", "1//0g..."],
    ["SENDER_EMAIL", "Sender Gmail Address", "you@gmail.com"],
    ["GA4_PROPERTY_ID", "GA4 Property ID", "123456789"],
    ["GA4_CLIENT_EMAIL", "GA4 Service Account Email", "sa@project.iam.gserviceaccount.com"],
    ["GA4_PRIVATE_KEY", "GA4 Private Key", "-----BEGIN PRIVATE KEY-----\\n..."],
    ["SEARCH_CONSOLE_SITE_URL", "Search Console Site URL", "https://gunafix.com/"],
    ["META_PAGE_ACCESS_TOKEN", "Meta Page Access Token", "EAAxx..."],
    ["META_PAGE_ID", "Meta Page ID", "123456"],
    ["META_IG_USER_ID", "Instagram User ID", "789012"],
    ["OWNER_TIMEZONE", "Your Timezone", "America/New_York"],
    ["BUSINESS_PHYSICAL_ADDRESS", "Business Physical Address", "123 Main St, City, ST 12345"],
  ];

  const credInputs = credFields
    .map(
      ([k, label, ph]) => `
      <div class="cred-row">
        <label for="cred-${k}">${escHtml(label)}</label>
        <input id="cred-${k}" name="${k}" type="${k.includes("KEY") || k.includes("SECRET") || k.includes("TOKEN") ? "password" : "text"}"
          placeholder="${escHtml(ph)}" autocomplete="off" />
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>GunaFix Agent Hub</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root {
    --bg: #0d0d0f; --card: #18181b; --border: #2a2a2e; --accent: #6366f1;
    --accent2: #22d3ee; --text: #e4e4e7; --muted: #71717a; --ok: #22c55e;
    --warn: #f59e0b; --err: #ef4444; --font: -apple-system, system-ui, sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100vh; }
  nav { display: flex; gap: 4px; padding: 12px 16px; background: var(--card); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
  .nav-btn { background: none; border: 1px solid transparent; color: var(--muted); padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all .15s; }
  .nav-btn:hover, .nav-btn.active { color: var(--text); border-color: var(--border); background: var(--bg); }
  .page { display: none; padding: 24px 16px; max-width: 960px; margin: 0 auto; }
  .page.active { display: block; }
  h2 { font-size: 20px; margin-bottom: 16px; }
  h3 { font-size: 15px; color: var(--muted); margin-bottom: 10px; font-weight: 500; }

  /* agent cards */
  .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .agent-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px; }
  .agent-name { font-weight: 600; margin-bottom: 6px; }
  .agent-status { font-size: 12px; color: var(--muted); margin-bottom: 10px; }
  .agent-status.running { color: var(--accent2); }
  .agent-status.done { color: var(--ok); }
  .agent-status.error { color: var(--err); }
  .run-btn { background: var(--accent); color: #fff; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 13px; width: 100%; }
  .run-btn:hover { opacity: .85; }
  .run-btn:disabled { opacity: .4; cursor: default; }

  /* live log */
  #live-log { background: #0a0a0c; border: 1px solid var(--border); border-radius: 8px; padding: 12px; height: 320px; overflow-y: auto; font-family: monospace; font-size: 12px; line-height: 1.6; }
  .log-line { padding: 1px 0; }
  .log-start { color: var(--accent2); }
  .log-done { color: var(--ok); }
  .log-err { color: var(--err); }
  .log-info { color: var(--text); }

  /* voice chat */
  .voice-area { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; max-width: 640px; }
  #chat-log { height: 300px; overflow-y: auto; margin-bottom: 14px; display: flex; flex-direction: column; gap: 10px; }
  .msg { padding: 10px 14px; border-radius: 10px; max-width: 85%; font-size: 14px; line-height: 1.5; }
  .msg.user { background: var(--accent); color: #fff; align-self: flex-end; }
  .msg.ai { background: var(--card); border: 1px solid var(--border); align-self: flex-start; }
  .voice-controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  #mic-btn { width: 52px; height: 52px; border-radius: 50%; background: var(--accent); border: none; cursor: pointer; font-size: 22px; color: #fff; transition: all .15s; }
  #mic-btn.listening { background: var(--err); animation: pulse 1s infinite; }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,.4); } 50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); } }
  #chat-input { flex: 1; background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 10px 14px; font-size: 14px; outline: none; min-width: 0; }
  #chat-input:focus { border-color: var(--accent); }
  #send-btn { background: var(--accent); color: #fff; border: none; border-radius: 8px; padding: 10px 18px; cursor: pointer; font-size: 14px; }
  #voice-status { font-size: 12px; color: var(--muted); width: 100%; }
  #voice-select { background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 7px; padding: 6px 10px; font-size: 13px; margin-top: 10px; width: 100%; outline: none; }
  #voice-select:focus { border-color: var(--accent); }
  .speaking-wave { display: none; align-items: center; gap: 3px; height: 20px; }
  .speaking-wave.active { display: flex; }
  .speaking-wave span { display: block; width: 3px; border-radius: 2px; background: var(--accent2); animation: wave 0.8s ease-in-out infinite; }
  .speaking-wave span:nth-child(1) { height: 6px; animation-delay: 0s; }
  .speaking-wave span:nth-child(2) { height: 14px; animation-delay: .1s; }
  .speaking-wave span:nth-child(3) { height: 10px; animation-delay: .2s; }
  .speaking-wave span:nth-child(4) { height: 18px; animation-delay: .15s; }
  .speaking-wave span:nth-child(5) { height: 8px; animation-delay: .05s; }
  @keyframes wave { 0%,100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }

  /* credentials */
  .cred-form { max-width: 640px; }
  .cred-row { margin-bottom: 14px; }
  .cred-row label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 4px; }
  .cred-row input { width: 100%; background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 7px; padding: 8px 12px; font-size: 14px; outline: none; }
  .cred-row input:focus { border-color: var(--accent); }
  .save-btn { background: var(--ok); color: #fff; border: none; border-radius: 8px; padding: 10px 22px; cursor: pointer; font-size: 14px; font-weight: 600; }
  .save-btn:hover { opacity: .85; }
  #cred-msg { margin-top: 10px; font-size: 13px; }

  /* memory */
  #memory-list { list-style: none; }
  #memory-list li { padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 13px; display: flex; gap: 12px; }
  #memory-list li .mem-ts { color: var(--muted); white-space: nowrap; font-size: 11px; }
  #memory-list li .mem-type { color: var(--accent2); font-weight: 600; min-width: 110px; }
  #memory-list li .mem-detail { color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mem-filter { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
  .mem-filter button { background: var(--card); border: 1px solid var(--border); color: var(--muted); padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
  .mem-filter button.active { border-color: var(--accent); color: var(--accent); }

  /* CRM */
  .crm-issue { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; }
  .crm-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
  .crm-head a { font-weight: 600; color: var(--accent2); text-decoration: none; font-size: 14px; }
  .crm-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
  .chip { background: #27272a; border-radius: 10px; padding: 2px 9px; font-size: 11px; color: var(--muted); }
  .chip.urgent { background: rgba(239,68,68,.15); color: var(--err); }
  .chip.lead { background: rgba(34,211,238,.1); color: var(--accent2); }
  .chip.permission { background: rgba(245,158,11,.15); color: var(--warn); }
  .crm-body { font-size: 13px; color: var(--muted); max-height: 100px; overflow-y: auto; white-space: pre-wrap; }
  .crm-actions { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
  .crm-btn { background: var(--card); border: 1px solid var(--border); color: var(--text); border-radius: 6px; padding: 4px 11px; cursor: pointer; font-size: 12px; }
  .crm-btn:hover { border-color: var(--accent); }
  .crm-section { margin-bottom: 28px; }
  .crm-section h3 { font-size: 14px; color: var(--muted); margin-bottom: 10px; border-bottom: 1px solid var(--border); padding-bottom: 4px; }

  /* util */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .badge-green { background: rgba(34,197,94,.15); color: var(--ok); }
  .badge-blue { background: rgba(99,102,241,.15); color: var(--accent); }
  #toast { position: fixed; bottom: 20px; right: 20px; background: var(--ok); color: #fff; padding: 10px 18px; border-radius: 8px; font-size: 14px; opacity: 0; transition: opacity .3s; pointer-events: none; }
  #toast.show { opacity: 1; }
  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .empty-state { color: var(--muted); font-size: 14px; padding: 24px 0; text-align: center; }
</style>
</head>
<body>

<nav>
  <button class="nav-btn active" onclick="showPage('dashboard')">Dashboard</button>
  <button class="nav-btn" onclick="showPage('chat')">Voice Chat</button>
  <button class="nav-btn" onclick="showPage('memory')">Memory</button>
  <button class="nav-btn" onclick="showPage('credentials')">Credentials</button>
  <button class="nav-btn" onclick="showPage('crm')">Leads / CRM</button>
</nav>

<!-- DASHBOARD -->
<div id="page-dashboard" class="page active">
  <h2>GunaFix Growth Agents</h2>
  <h3>Agent Status</h3>
  <div class="agents-grid">
    ${agentCards}
  </div>
  <h3>Live Log</h3>
  <div id="live-log"><span class="log-info" style="color:var(--muted)">Waiting for agent activity…</span></div>
</div>

<!-- VOICE CHAT -->
<div id="page-chat" class="page">
  <h2>Voice Chat</h2>
  <div class="voice-area">
    <div id="chat-log"></div>
    <div class="voice-controls">
      <button id="mic-btn" title="Click to speak">🎤</button>
      <input id="chat-input" type="text" placeholder="Or type a message…" />
      <button id="send-btn">Send</button>
      <div class="speaking-wave" id="speaking-wave">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
    <div id="voice-status">Click the mic to start speaking</div>
    <select id="voice-select"><option value="">Loading voices…</option></select>
  </div>
</div>

<!-- MEMORY -->
<div id="page-memory" class="page">
  <h2>Memory Log</h2>
  <div class="mem-filter">
    <button class="active" onclick="filterMem('all', this)">All</button>
    <button onclick="filterMem('agent-run', this)">Agent Runs</button>
    <button onclick="filterMem('email-sent', this)">Emails Sent</button>
    <button onclick="filterMem('email-reply', this)">Replies</button>
    <button onclick="filterMem('lead-found', this)">Leads</button>
    <button onclick="filterMem('chat-command', this)">Commands</button>
    <button onclick="loadMemory()">↻ Refresh</button>
  </div>
  <ul id="memory-list"><li><span class="empty-state">Loading…</span></li></ul>
</div>

<!-- CREDENTIALS -->
<div id="page-credentials" class="page">
  <h2>Credentials</h2>
  <p style="color:var(--muted);font-size:13px;margin-bottom:20px">
    Saved to <code>automation/.env</code> (never committed). Leave blank to keep existing value.
    Changes take effect immediately for the next agent run.
  </p>
  <form class="cred-form" id="cred-form">
    ${credInputs}
    <button type="submit" class="save-btn">Save credentials</button>
    <div id="cred-msg"></div>
  </form>
</div>

<!-- CRM -->
<div id="page-crm" class="page">
  <h2>Leads &amp; CRM</h2>
  <p style="color:var(--muted);font-size:13px;margin-bottom:16px">Live mirror of GitHub Issues. Actions write directly to GitHub.</p>
  <div id="crm-content"><div class="empty-state"><span class="spinner"></span> Loading…</div></div>
</div>

<div id="toast"></div>

<script>
// ─── nav ───────────────────────────────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  event.currentTarget.classList.add('active');
  if (id === 'memory') loadMemory();
  if (id === 'crm') loadCrm();
  if (id === 'credentials') loadCredValues();
}

// ─── toast ─────────────────────────────────────────────────────────────────
function toast(msg, color = '#22c55e') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.background = color;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

// ─── SSE ──────────────────────────────────────────────────────────────────
const logEl = document.getElementById('live-log');
const es = new EventSource('/sse');
es.onmessage = (e) => {
  const d = JSON.parse(e.data);
  handleSSE(d);
};
es.onerror = () => addLog('Connection to server lost — refresh page', 'err');

function handleSSE(d) {
  if (d.type === 'agent-start') {
    setAgentStatus(d.agentId, 'running', '⟳ Running…');
    addLog('▶ ' + d.label + ' started', 'start');
  } else if (d.type === 'agent-log') {
    addLog((d.isErr ? '⚠ ' : '') + d.line, d.isErr ? 'err' : 'info');
  } else if (d.type === 'agent-done') {
    const ok = d.code === 0;
    setAgentStatus(d.agentId, ok ? 'done' : 'error', ok ? '✓ Done' : '✗ Error (code ' + d.code + ')');
    addLog('■ Agent finished (exit ' + d.code + ')', ok ? 'done' : 'err');
    setTimeout(() => setAgentStatus(d.agentId, '', 'idle'), 8000);
  }
}

function addLog(text, cls) {
  const line = document.createElement('div');
  line.className = 'log-line log-' + (cls || 'info');
  const ts = new Date().toLocaleTimeString();
  line.textContent = '[' + ts + '] ' + text;
  // remove placeholder
  const ph = logEl.querySelector('.log-info[style]');
  if (ph) ph.remove();
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

function setAgentStatus(id, cls, text) {
  const el = document.getElementById('status-' + id);
  const btn = document.querySelector('#card-' + id + ' .run-btn');
  if (!el) return;
  el.className = 'agent-status ' + cls;
  el.textContent = text;
  if (btn) btn.disabled = cls === 'running';
}

// ─── run agent ────────────────────────────────────────────────────────────
async function runAgent(id) {
  const r = await fetch('/run/' + id, { method: 'POST' });
  const j = await r.json();
  if (!j.ok) toast(j.msg, '#ef4444');
}

// ─── memory ───────────────────────────────────────────────────────────────
let memFilter = 'all';

async function loadMemory() {
  const r = await fetch('/api/memory');
  const items = await r.json();
  renderMemory(items);
}

function filterMem(type, btn) {
  memFilter = type;
  document.querySelectorAll('.mem-filter button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadMemory();
}

function renderMemory(items) {
  const list = document.getElementById('memory-list');
  const filtered = memFilter === 'all' ? items : items.filter(i => i.type === memFilter);
  if (!filtered.length) {
    list.innerHTML = '<li><span class="empty-state">No entries yet.</span></li>';
    return;
  }
  list.innerHTML = filtered.map(i => \`<li>
    <span class="mem-ts">\${new Date(i.ts).toLocaleString()}</span>
    <span class="mem-type">\${i.type}</span>
    <span class="mem-detail">\${escHtml(i.line || i.label || i.agentId || '')}</span>
  </li>\`).join('');
}

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── credentials ──────────────────────────────────────────────────────────
async function loadCredValues() {
  try {
    const r = await fetch('/api/creds');
    const vals = await r.json();
    for (const [k, v] of Object.entries(vals)) {
      const el = document.getElementById('cred-' + k);
      if (el && v) el.placeholder = '(saved)';
    }
  } catch {}
}

document.getElementById('cred-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {};
  new FormData(e.target).forEach((v, k) => { if (v.trim()) data[k] = v.trim(); });
  const r = await fetch('/api/creds', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(data) });
  const j = await r.json();
  const msg = document.getElementById('cred-msg');
  if (j.ok) {
    msg.style.color = '#22c55e';
    msg.textContent = '✓ Saved! Agents will use these on next run.';
    // re-check placeholders
    await loadCredValues();
    // clear inputs
    e.target.querySelectorAll('input').forEach(i => i.value = '');
  } else {
    msg.style.color = '#ef4444';
    msg.textContent = 'Error: ' + j.error;
  }
});

// ─── CRM ──────────────────────────────────────────────────────────────────
async function loadCrm() {
  const el = document.getElementById('crm-content');
  el.innerHTML = '<div class="empty-state"><span class="spinner"></span> Loading…</div>';
  try {
    const r = await fetch('/api/crm');
    const j = await r.json();
    if (j.error) { el.innerHTML = '<div class="empty-state">Error: ' + escHtml(j.error) + '</div>'; return; }
    renderCrm(j.issues, el);
  } catch (err) {
    el.innerHTML = '<div class="empty-state">Failed to load: ' + escHtml(err.message) + '</div>';
  }
}

function renderCrm(issues, container) {
  const groups = { permissions: [], urgent: [], leads: [], other: [] };
  for (const i of issues) {
    const lbls = i.labels.map(l => typeof l === 'string' ? l : l.name);
    if (lbls.includes('awaiting-permission')) groups.permissions.push({issue:i,lbls});
    else if (lbls.includes('urgent')) groups.urgent.push({issue:i,lbls});
    else if (lbls.includes('lead')) groups.leads.push({issue:i,lbls});
    else groups.other.push({issue:i,lbls});
  }
  const sections = [
    ['Needs Decision', groups.permissions],
    ['Urgent', groups.urgent],
    ['Leads', groups.leads],
    ['Other', groups.other],
  ];
  container.innerHTML = sections.map(([title, items]) => {
    if (!items.length) return '';
    return \`<div class="crm-section"><h3>\${title} (\${items.length})</h3>\${items.map(renderCrmIssue).join('')}</div>\`;
  }).join('') || '<div class="empty-state">No open issues.</div>';
}

function renderCrmIssue({issue, lbls}) {
  const chips = lbls.map(l => {
    const cls = l === 'urgent' ? 'chip urgent' : l === 'lead' ? 'chip lead' : l === 'awaiting-permission' ? 'chip permission' : 'chip';
    return \`<span class="\${cls}">\${escHtml(l)}</span>\`;
  }).join('');
  const actions = [];
  if (lbls.includes('awaiting-permission')) {
    actions.push(\`<button class="crm-btn" onclick="crmAction(\${issue.number},'approve')">✓ Approve</button>\`);
    actions.push(\`<button class="crm-btn" onclick="crmAction(\${issue.number},'deny')">✗ Deny</button>\`);
  }
  if (lbls.includes('lead') && !lbls.includes('status:contacted')) {
    actions.push(\`<button class="crm-btn" onclick="crmAction(\${issue.number},'contacted',\${JSON.stringify(lbls)})">Mark contacted</button>\`);
  }
  if (!lbls.includes('leader-report')) {
    actions.push(\`<button class="crm-btn" onclick="crmAction(\${issue.number},'close')">Close</button>\`);
  }
  return \`<div class="crm-issue">
    <div class="crm-head"><a href="\${issue.html_url}" target="_blank" rel="noopener">#\${issue.number} \${escHtml(issue.title)}</a></div>
    <div class="crm-chips">\${chips}</div>
    <div class="crm-body">\${escHtml(issue.body||'')}</div>
    \${actions.length ? '<div class="crm-actions">' + actions.join('') + '</div>' : ''}
  </div>\`;
}

async function crmAction(number, action, labels) {
  const r = await fetch('/api/crm/action', {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({number, action, labels})
  });
  const j = await r.json();
  if (j.ok) { toast('Done'); setTimeout(loadCrm, 600); }
  else toast('Error: ' + j.error, '#ef4444');
}

// ─── voice chat ───────────────────────────────────────────────────────────
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const micBtn = document.getElementById('mic-btn');
const sendBtn = document.getElementById('send-btn');
const voiceStatus = document.getElementById('voice-status');
let chatHistory = [];
let listening = false;
let recognition = null;
let speaking = false;

// init speech recognition
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    chatInput.value = transcript;
    if (e.results[e.results.length - 1].isFinal) {
      stopListening();
      if (transcript.trim()) sendMessage(transcript.trim());
    }
  };
  recognition.onerror = (e) => {
    voiceStatus.textContent = 'Mic error: ' + e.error;
    stopListening();
  };
  recognition.onend = () => stopListening();
} else {
  micBtn.disabled = true;
  voiceStatus.textContent = 'Speech recognition not available in this browser (use Chrome)';
}

function startListening() {
  if (speaking) return;
  if (!recognition) return;
  listening = true;
  micBtn.classList.add('listening');
  micBtn.textContent = '🔴';
  voiceStatus.textContent = 'Listening…';
  chatInput.value = '';
  recognition.start();
}

function stopListening() {
  listening = false;
  micBtn.classList.remove('listening');
  micBtn.textContent = '🎤';
  voiceStatus.textContent = 'Click mic to speak';
  try { recognition && recognition.stop(); } catch {}
}

micBtn.addEventListener('click', () => {
  if (listening) stopListening();
  else startListening();
});

sendBtn.addEventListener('click', () => {
  const text = chatInput.value.trim();
  if (text) { sendMessage(text); chatInput.value = ''; }
});

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (text) { sendMessage(text); chatInput.value = ''; }
  }
});

function addChatMsg(role, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return div;
}

async function sendMessage(text) {
  addChatMsg('user', text);
  chatHistory.push({ role: 'user', content: text });
  voiceStatus.textContent = 'Thinking…';
  const typingDiv = addChatMsg('ai', '…');

  try {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: {'content-type':'application/json'},
      body: JSON.stringify({ message: text, history: chatHistory.slice(-10) })
    });
    const j = await r.json();
    const reply = j.reply || 'Sorry, something went wrong.';
    typingDiv.textContent = reply;
    chatHistory.push({ role: 'assistant', content: reply });

    // trigger any agents mentioned in reply
    const runs = reply.match(/\\[RUN:([a-z-]+)\\]/g);
    if (runs) {
      for (const r of runs) {
        const id = r.slice(5, -1);
        await runAgent(id);
      }
    }

    // speak reply
    speakText(reply.replace(/\\[RUN:[a-z-]+\\]/g, '').trim());
    voiceStatus.textContent = 'Click mic to speak';
  } catch (err) {
    typingDiv.textContent = 'Error: ' + err.message;
    voiceStatus.textContent = 'Error occurred';
  }
}

// ─── voice selection ──────────────────────────────────────────────────────────
// Priority list: JARVIS-style — deep, calm, British male voice
const VOICE_PRIORITY = [
  /Google UK English Male/i,  // closest to JARVIS — British, clear, authoritative
  /Daniel/i,                  // macOS British male
  /Arthur/i,                  // macOS UK male
  /Google UK English/i,       // generic UK fallback
  /Oliver/i,                  // UK male
  /James/i,                   // UK male
  /Fred/i,                    // deep US male
  /Microsoft Ryan/i,          // MS natural UK male
  /Microsoft George/i,        // MS UK male
  /Alex/i,                    // macOS US male
  /Google US English/i,
];

let selectedVoiceName = localStorage.getItem('claudeVoice') || '';

function pickBestVoice(voices) {
  // if user picked one, honour it
  if (selectedVoiceName) {
    const found = voices.find(v => v.name === selectedVoiceName);
    if (found) return found;
  }
  // else walk priority list
  for (const pattern of VOICE_PRIORITY) {
    const found = voices.find(v => pattern.test(v.name));
    if (found) return found;
  }
  // fallback: first English voice
  return voices.find(v => /en/i.test(v.lang)) || voices[0] || null;
}

function populateVoiceSelect() {
  if (!window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices().filter(v => /en/i.test(v.lang));
  const sel = document.getElementById('voice-select');
  if (!voices.length) return;
  const best = pickBestVoice(voices);
  sel.innerHTML = voices.map(v =>
    \`<option value="\${v.name}" \${v === best ? 'selected' : ''}>\${v.name} (\${v.lang})</option>\`
  ).join('');
  if (!selectedVoiceName && best) selectedVoiceName = best.name;
}

document.getElementById('voice-select').addEventListener('change', (e) => {
  selectedVoiceName = e.target.value;
  localStorage.setItem('claudeVoice', selectedVoiceName);
  // preview the chosen voice
  speakText('Voice systems online. Standing by for your command, Mr. Guna.');
});

window.speechSynthesis && window.speechSynthesis.addEventListener('voiceschanged', populateVoiceSelect);
// Chrome loads voices async; trigger once immediately too
populateVoiceSelect();

function speakText(text) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.97;    // measured, deliberate — JARVIS never rushes
  utt.pitch = 0.80;   // deep, calm, authoritative
  utt.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const voice = pickBestVoice(voices);
  if (voice) utt.voice = voice;
  speaking = true;
  const wave = document.getElementById('speaking-wave');
  if (wave) wave.classList.add('active');
  utt.onend = () => {
    speaking = false;
    if (wave) wave.classList.remove('active');
  };
  utt.onerror = () => {
    speaking = false;
    if (wave) wave.classList.remove('active');
  };
  window.speechSynthesis.speak(utt);
}

// ─── greeting on load ─────────────────────────────────────────────────────
window.addEventListener('load', () => {
  const greeting = "Good day, Mr. Guna. All systems are online. Your growth agents are standing by. How may I assist you?";
  addChatMsg('ai', greeting);
  // short delay so browser voices finish loading before speaking
  setTimeout(() => speakText(greeting), 800);
});
</script>
</body>
</html>`;
}

// ─── HTTP routing ─────────────────────────────────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    let buf = "";
    req.on("data", (c) => (buf += c));
    req.on("end", () => resolve(buf));
    req.on("error", reject);
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
}

async function handle(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path_ = url.pathname;
  const method = req.method;

  // SSE
  if (method === "GET" && path_ === "/sse") {
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
      "access-control-allow-origin": "*",
    });
    res.write("data: {\"type\":\"connected\"}\n\n");
    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
    return;
  }

  // dashboard page
  if (method === "GET" && path_ === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(renderHtml());
    return;
  }

  // run agent
  if (method === "POST" && path_.startsWith("/run/")) {
    const agentId = path_.slice(5);
    const result = runAgent(agentId);
    if (result.ok) lastRun[agentId] = Date.now();
    return json(res, result);
  }

  // memory API
  if (method === "GET" && path_ === "/api/memory") {
    const mem = loadMemory().reverse();
    return json(res, mem);
  }

  // credentials GET (return which keys are set)
  if (method === "GET" && path_ === "/api/creds") {
    const vars = loadEnvFile();
    const out = {};
    for (const k of Object.keys(vars)) out[k] = vars[k] ? "set" : "";
    return json(res, out);
  }

  // credentials POST (save)
  if (method === "POST" && path_ === "/api/creds") {
    try {
      const body = JSON.parse(await readBody(req));
      saveEnvFile(body);
      applyEnvFile();
      appendMemory({ type: "credentials-updated", keys: Object.keys(body).join(", ") });
      return json(res, { ok: true });
    } catch (e) {
      return json(res, { ok: false, error: e.message }, 400);
    }
  }

  // chat API
  if (method === "POST" && path_ === "/api/chat") {
    try {
      const body = JSON.parse(await readBody(req));
      const { message, history = [] } = body;
      appendMemory({ type: "chat-command", line: message });
      const reply = await claudeChat(message, history);
      appendMemory({ type: "chat-reply", line: reply.slice(0, 200) });
      return json(res, { reply });
    } catch (e) {
      return json(res, { reply: "Server error: " + e.message });
    }
  }

  // CRM list
  if (method === "GET" && path_ === "/api/crm") {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (!token) return json(res, { error: "GH_TOKEN not set — add it in Credentials" });
    try {
      const issues = await listOpenIssues();
      return json(res, { issues });
    } catch (e) {
      return json(res, { error: e.message });
    }
  }

  // CRM action
  if (method === "POST" && path_ === "/api/crm/action") {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (!token) return json(res, { ok: false, error: "GH_TOKEN not set" });
    try {
      const { number, action, labels = [] } = JSON.parse(await readBody(req));
      if (action === "close") {
        await ghApi(`/issues/${number}`, { method: "PATCH", body: JSON.stringify({ state: "closed", state_reason: "completed" }) });
      } else if (action === "approve" || action === "deny") {
        await ghApi(`/issues/${number}/comments`, { method: "POST", body: JSON.stringify({ body: action === "approve" ? "approve" : "deny" }) });
      } else if (action === "contacted") {
        const next = [...labels.filter((l) => !l.startsWith("status:")), "status:contacted"];
        await ghApi(`/issues/${number}/labels`, { method: "PUT", body: JSON.stringify({ labels: next }) });
      }
      return json(res, { ok: true });
    } catch (e) {
      return json(res, { ok: false, error: e.message });
    }
  }

  res.writeHead(404);
  res.end("Not found");
}

// ─── start ────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  try {
    await handle(req, res);
  } catch (err) {
    console.error("[hub] error:", err);
    res.writeHead(500);
    res.end("Internal error");
  }
});

server.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  GunaFix Agent Hub  →  http://localhost:${PORT}  ║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);
  console.log(`[hub] Memory file: ${MEMORY_FILE}`);
  console.log(`[hub] Env file:    ${ENV_FILE}`);
  console.log(`[hub] Scheduler:   running (outreach every 30m, others every 6h/24h)\n`);
});
