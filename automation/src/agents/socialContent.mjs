// Social Content agent — drafts a short-form video script + platform
// captions (Instagram Reels, TikTok, Facebook) with Claude and files it as a
// GitHub issue ready for the owner to film/upload. This agent does NOT
// auto-post: producing an actual video file is out of scope for a script
// runner, and TikTok's Content Posting API requires an app audit anyway.
// If Meta Page credentials are present, it also pulls a quick snapshot of
// Facebook Page conversations into a running "social contacts overview"
// issue — best-effort, since IG/TikTok don't expose an equivalent public API.

import { config, requireFields } from "../config.mjs";
import { askClaude } from "../lib/anthropic.mjs";
import { createIssue, addIssueComment, findIssueByTitle, ensureLabelsExist } from "../lib/github.mjs";

const TOPICS = [
  "the 5 second rule: why a slow website loses customers before they even read your offer",
  "before/after: what an outdated website silently costs a local business in trust",
  "3 signs your website is scaring customers away (and how to fix them fast)",
  "why 'mobile-friendly' isn't optional anymore for local businesses",
  "what AI-accelerated web development means and why it gets sites built 10x faster",
  "a 30-second look at what makes a website feel 'modern' vs 'dated'",
];

function pickTopic() {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

function buildPrompt(topic) {
  return `You are a short-form video content writer for ${config.businessName} (${config.businessUrl}), an AI-accelerated web development studio. Write a 30-45 second vertical video script about: "${topic}".

Respond with EXACTLY this format, nothing else:
HOOK: <first 3 seconds, must grab attention>
SCRIPT:
<full spoken script, broken into short lines, 30-45 seconds when read aloud>
CAPTION_IG: <Instagram Reels caption with 4-6 relevant hashtags>
CAPTION_TIKTOK: <TikTok caption with 3-5 relevant hashtags, more casual tone>
CAPTION_FB: <Facebook caption, slightly longer/more descriptive, no hashtags>`;
}

function parseScript(text) {
  const get = (label, stopLabels) => {
    const stopPattern = stopLabels.length ? `(?=${stopLabels.map((s) => `${s}:`).join("|")})` : "$";
    const re = new RegExp(`${label}:\\s*([\\s\\S]+?)\\s*${stopPattern}`, "m");
    const m = text.match(re);
    return m ? m[1].trim() : null;
  };
  return {
    hook: get("HOOK", ["SCRIPT"]),
    script: get("SCRIPT", ["CAPTION_IG"]),
    captionIg: get("CAPTION_IG", ["CAPTION_TIKTOK"]),
    captionTiktok: get("CAPTION_TIKTOK", ["CAPTION_FB"]),
    captionFb: get("CAPTION_FB", []),
  };
}

async function generateContentIssue() {
  const topic = pickTopic();
  console.log(`[socialContent] generating script for topic: "${topic}"`);
  const raw = await askClaude(buildPrompt(topic));
  const parsed = parseScript(raw);
  if (!parsed.script) {
    console.error("[socialContent] could not parse Claude script output");
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  const title = `[Social] ${date} — ${topic.slice(0, 60)}`;
  const body = [
    `**Topic:** ${topic}`,
    "",
    `**Hook:**\n${parsed.hook || "-"}`,
    "",
    `**Script:**\n${parsed.script}`,
    "",
    `**Instagram Reels caption:**\n${parsed.captionIg || "-"}`,
    "",
    `**TikTok caption:**\n${parsed.captionTiktok || "-"}`,
    "",
    `**Facebook caption:**\n${parsed.captionFb || "-"}`,
    "",
    "_Generated automatically. Film this, then post to IG/TikTok/Facebook manually (or wire up auto-posting once a video file/host is available)._",
  ].join("\n");

  await createIssue({ title, body, labels: ["social-content", "status:new"] });
  console.log(`[socialContent] filed content issue: ${title}`);
}

async function updateContactsOverview() {
  if (!config.metaPageAccessToken || !config.metaPageId) {
    console.log("[socialContent] skip contacts overview — META_PAGE_ACCESS_TOKEN/META_PAGE_ID not set");
    return;
  }
  try {
    const url = `https://graph.facebook.com/${config.metaGraphApiVersion}/${config.metaPageId}/conversations?fields=participants,updated_time&access_token=${config.metaPageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(JSON.stringify(data.error || data));

    const rows = (data.data || []).map((c) => {
      const participant = (c.participants?.data || []).find((p) => p.id !== config.metaPageId);
      return `- ${participant?.name || "unknown"} — last activity ${c.updated_time}`;
    });

    const title = "[Social] Contacts overview (Facebook Page conversations)";
    const body = [
      `Snapshot at ${new Date().toISOString()}`,
      "",
      rows.length ? rows.join("\n") : "No open conversations.",
      "",
      "_Instagram/TikTok don't expose an equivalent public conversations API, so this overview is Facebook-only for now._",
    ].join("\n");

    const existing = await findIssueByTitle(title, "social-content");
    if (existing) {
      await addIssueComment(existing.number, body);
    } else {
      await createIssue({ title, body, labels: ["social-content"] });
    }
    console.log("[socialContent] updated contacts overview");
  } catch (err) {
    console.error(`[socialContent] contacts overview failed: ${err.message}`);
  }
}

async function run() {
  if (!requireFields(config, ["anthropicApiKey"], "socialContent (anthropic)")) return;
  if (!requireFields(config, ["githubToken", "githubRepo"], "socialContent (github)")) return;

  await ensureLabelsExist(["social-content", "status:new"]);
  await generateContentIssue();
  await updateContactsOverview();
}

run().catch((err) => {
  console.error("[socialContent] fatal error:", err);
  process.exitCode = 1;
});
