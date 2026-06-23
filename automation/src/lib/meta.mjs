// Meta Graph API client — optional auto-posting to the Facebook Page and
// Instagram Business account. Requires a long-lived page access token the
// owner generates in Meta Business Suite (see automation/README.md).
// TikTok is intentionally NOT auto-posted here — its Content Posting API
// requires an app audit, so social-content.mjs just produces a ready
// script/caption for manual upload instead.

import { config } from "../config.mjs";

function assertFacebookReady() {
  if (!config.metaPageAccessToken || !config.metaPageId) {
    throw new Error("META_PAGE_ACCESS_TOKEN and META_PAGE_ID must be set");
  }
}

function assertInstagramReady() {
  if (!config.metaPageAccessToken || !config.metaIgUserId) {
    throw new Error("META_PAGE_ACCESS_TOKEN and META_IG_USER_ID must be set");
  }
}

const graphUrl = (path) => `https://graph.facebook.com/${config.metaGraphApiVersion}${path}`;

async function graphPost(path, params) {
  const url = graphUrl(path);
  const body = new URLSearchParams({ ...params, access_token: config.metaPageAccessToken });
  const res = await fetch(url, { method: "POST", body });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Meta Graph API error: ${JSON.stringify(data.error || data)}`);
  }
  return data;
}

export async function postFacebookText({ message, link }) {
  assertFacebookReady();
  return graphPost(`/${config.metaPageId}/feed`, { message, ...(link ? { link } : {}) });
}

export async function postInstagramImage({ imageUrl, caption }) {
  assertInstagramReady();
  const container = await graphPost(`/${config.metaIgUserId}/media`, {
    image_url: imageUrl,
    caption,
  });
  return graphPost(`/${config.metaIgUserId}/media_publish`, { creation_id: container.id });
}

/** videoUrl must be a publicly reachable URL (e.g. hosted in repo releases or cloud storage). */
export async function postInstagramVideo({ videoUrl, caption }) {
  assertInstagramReady();
  const container = await graphPost(`/${config.metaIgUserId}/media`, {
    video_url: videoUrl,
    caption,
    media_type: "REELS",
  });
  // Video containers process asynchronously; poll status before publishing.
  let status = "IN_PROGRESS";
  for (let i = 0; i < 10 && status === "IN_PROGRESS"; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const url = `${graphUrl(`/${container.id}`)}?fields=status_code&access_token=${config.metaPageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    status = data.status_code;
  }
  if (status !== "FINISHED") {
    throw new Error(`Instagram video container did not finish processing (status: ${status})`);
  }
  return graphPost(`/${config.metaIgUserId}/media_publish`, { creation_id: container.id });
}
