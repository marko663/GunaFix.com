// Gmail API client: sends outreach emails for real (directly from the
// owner's own Gmail account — no draft/approval step) and the leader's
// urgent alert emails. Also reads thread replies so outreach can detect
// "unsubscribe"-style responses. OAuth2 user refresh-token flow; see
// scripts/getGmailRefreshToken.mjs for the one-time setup to obtain
// GMAIL_REFRESH_TOKEN (scope: gmail.compose + gmail.readonly).

import { config } from "../config.mjs";
import { getAccessTokenFromRefreshToken } from "./googleAuth.mjs";

const API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

async function accessToken() {
  if (!config.gmailClientId || !config.gmailClientSecret || !config.gmailRefreshToken) {
    throw new Error("GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN must all be set");
  }
  return getAccessTokenFromRefreshToken({
    clientId: config.gmailClientId,
    clientSecret: config.gmailClientSecret,
    refreshToken: config.gmailRefreshToken,
  });
}

function buildRawMessage({ from, to, subject, body }) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    body,
  ];
  const message = lines.join("\r\n");
  return Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function gmailFetch(path, accessTok, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${accessTok}`,
      "content-type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gmail API error ${res.status} ${path}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

/** Sends an email immediately. Used for real outreach sends and the leader's urgent alerts. Pass `threadId` to reply within an existing thread (e.g. an auto-reply to a lead). Returns {id, threadId, ...}. */
export async function sendEmail({ to, subject, body, threadId }) {
  const tok = await accessToken();
  const from = config.senderEmail || config.ownerEmail;
  const raw = buildRawMessage({ from, to, subject, body });
  const payload = threadId ? { raw, threadId } : { raw };
  return gmailFetch("/messages/send", tok, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function decodeBase64Url(data) {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

/** Walks a Gmail message payload for the first text/plain part (falls back to text/html stripped of tags). */
function extractPlainText(payload) {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  for (const part of payload.parts || []) {
    const text = extractPlainText(part);
    if (text) return text;
  }
  if (payload.mimeType === "text/html" && payload.body?.data) {
    return decodeBase64Url(payload.body.data).replace(/<[^>]+>/g, " ");
  }
  return "";
}

/** Fetches a full thread (all messages) with decoded plain-text bodies, oldest first. Requires the gmail.readonly scope. */
export async function getThread(threadId) {
  const tok = await accessToken();
  const thread = await gmailFetch(`/threads/${threadId}?format=full`, tok);
  return (thread.messages || []).map((m) => ({
    id: m.id,
    from: (m.payload?.headers || []).find((h) => h.name === "From")?.value || "",
    snippet: m.snippet || "",
    body: extractPlainText(m.payload),
  }));
}
