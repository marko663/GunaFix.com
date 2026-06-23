// Gmail API client: creates outreach DRAFTS (never auto-sent — the owner
// reviews and hits send themselves) and sends the leader's urgent alert
// emails. OAuth2 user refresh-token flow; see scripts/getGmailRefreshToken.mjs
// for the one-time setup to obtain GMAIL_REFRESH_TOKEN.

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
  return res.json();
}

/** Creates a Gmail draft. Outreach is ALWAYS draft-only — the owner approves and sends manually. */
export async function createDraft({ to, subject, body }) {
  const tok = await accessToken();
  const from = config.senderEmail || config.ownerEmail;
  const raw = buildRawMessage({ from, to, subject, body });
  return gmailFetch("/drafts", tok, {
    method: "POST",
    body: JSON.stringify({ message: { raw } }),
  });
}

/** Sends an email immediately. Reserved for the leader's own urgent alerts to the owner — never used for outreach. */
export async function sendEmail({ to, subject, body }) {
  const tok = await accessToken();
  const from = config.senderEmail || config.ownerEmail;
  const raw = buildRawMessage({ from, to, subject, body });
  return gmailFetch("/messages/send", tok, {
    method: "POST",
    body: JSON.stringify({ raw }),
  });
}
