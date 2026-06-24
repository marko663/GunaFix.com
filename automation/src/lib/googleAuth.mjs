// Google OAuth2 helpers: refresh-token grant (Gmail — user-consented apps)
// and service-account JWT grant (GA4 Data API, Search Console API). Built
// on Node's built-in crypto + fetch, no googleapis dependency.

import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

/** Exchange a long-lived OAuth refresh token for a short-lived access token. */
export async function getAccessTokenFromRefreshToken({ clientId, clientSecret, refreshToken }) {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google token refresh failed ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Mint an access token for a GCP service account (JWT-bearer grant). */
export async function getServiceAccountAccessToken({ clientEmail, privateKey, scope }) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: clientEmail,
    scope,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claimSet))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const normalizedKey = privateKey.includes("\\n") ? privateKey.replace(/\\n/g, "\n") : privateKey;
  const signature = signer.sign(normalizedKey).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwt = `${unsigned}.${signature}`;

  const params = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Service account token request failed ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}
