// One-time local helper to obtain a Gmail OAuth2 refresh token.
//
// Run locally (NOT in CI):
//   GMAIL_CLIENT_ID=... GMAIL_CLIENT_SECRET=... node src/scripts/getGmailRefreshToken.mjs
//
// Prerequisites: a Google Cloud OAuth client (type "Desktop app") with the
// Gmail API enabled, and http://localhost:53682 added as an authorized
// redirect URI. See automation/README.md for the full walkthrough.

import { createServer } from "node:http";

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}`;
// compose+send to actually send outreach, readonly so outreach can detect unsubscribe replies
const SCOPE = "https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.readonly";

const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in your environment first.");
  process.exit(1);
}

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPE);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");

console.log("\n1. Open this URL in a browser, sign in with the Gmail account outreach/alerts should send from, and approve access:\n");
console.log(authUrl.toString());
console.log(`\n2. Waiting for the redirect to ${REDIRECT_URI} ...\n`);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");

  if (!code) {
    res.writeHead(400, { "content-type": "text/plain" });
    res.end("No authorization code received. Check the terminal and try again.");
    return;
  }

  res.writeHead(200, { "content-type": "text/plain" });
  res.end("Success — you can close this tab and return to the terminal.");
  server.close();

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }).toString(),
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Token exchange failed:", data);
      process.exit(1);
    }
    console.log(
      "\nIf you already had a GMAIL_REFRESH_TOKEN from before outreach sent for real, it was issued with only the compose scope — replace it with this new one so unsubscribe-detection works too.\n"
    );
    console.log("Success! Save this as the GMAIL_REFRESH_TOKEN GitHub secret:\n");
    console.log(data.refresh_token);
    console.log("\n(If refresh_token is missing, the account was already authorized before — revoke access at https://myaccount.google.com/permissions and run this script again.)\n");
    process.exit(0);
  } catch (err) {
    console.error("Token exchange request failed:", err);
    process.exit(1);
  }
});

server.listen(PORT);
