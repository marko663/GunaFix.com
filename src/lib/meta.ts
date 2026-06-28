// Read-only Meta Graph API client for the dashboard's Instagram follower/engagement
// section. Separate from automation/src/lib/meta.mjs (which posts on the agents'
// behalf) — this only reads public profile + media fields. Needs
// META_PAGE_ACCESS_TOKEN and META_IG_USER_ID set as website env vars, same names as
// the GitHub Actions secrets the growth agents use but configured independently
// (same pattern as ANTHROPIC_API_KEY — see src/lib/setupAssistant.ts).

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v21.0";

export type InstagramProfile = {
  username: string;
  name: string | null;
  profilePictureUrl: string | null;
  followersCount: number;
  followsCount: number | null;
  mediaCount: number;
};

export type InstagramMedia = {
  id: string;
  caption: string | null;
  mediaType: string;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  permalink: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
};

export type InstagramOverview = {
  profile: InstagramProfile;
  media: InstagramMedia[];
  totals: {
    avgLikes: number;
    avgComments: number;
    totalEngagement: number;
    topPost: InstagramMedia | null;
  };
};

export function isMetaConfigured() {
  return Boolean(process.env.META_PAGE_ACCESS_TOKEN && process.env.META_IG_USER_ID);
}

function accessToken() {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) throw new Error("META_PAGE_ACCESS_TOKEN is not set");
  return token;
}

function igUserId() {
  const id = process.env.META_IG_USER_ID;
  if (!id) throw new Error("META_IG_USER_ID is not set");
  return id;
}

type GraphProfileResponse = {
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
};

type GraphMediaResponse = {
  data: Array<{
    id: string;
    caption?: string;
    media_type: string;
    media_url?: string;
    thumbnail_url?: string;
    permalink: string;
    timestamp: string;
    like_count?: number;
    comments_count?: number;
  }>;
};

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("access_token", accessToken());

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Meta Graph API error: ${data.error?.message || res.statusText}`);
  }
  return data as T;
}

export async function getInstagramOverview(mediaLimit = 12): Promise<InstagramOverview> {
  const id = igUserId();

  const [profileRaw, mediaRaw] = await Promise.all([
    graphGet<GraphProfileResponse>(`/${id}`, {
      fields: "username,name,profile_picture_url,followers_count,follows_count,media_count",
    }),
    graphGet<GraphMediaResponse>(`/${id}/media`, {
      fields:
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
      limit: String(mediaLimit),
    }),
  ]);

  const profile: InstagramProfile = {
    username: profileRaw.username,
    name: profileRaw.name ?? null,
    profilePictureUrl: profileRaw.profile_picture_url ?? null,
    followersCount: profileRaw.followers_count ?? 0,
    followsCount: profileRaw.follows_count ?? null,
    mediaCount: profileRaw.media_count ?? 0,
  };

  const media: InstagramMedia[] = (mediaRaw.data || []).map((m) => ({
    id: m.id,
    caption: m.caption ?? null,
    mediaType: m.media_type,
    mediaUrl: m.media_url ?? null,
    thumbnailUrl: m.thumbnail_url ?? null,
    permalink: m.permalink,
    timestamp: m.timestamp,
    likeCount: m.like_count ?? 0,
    commentsCount: m.comments_count ?? 0,
  }));

  const totalLikes = media.reduce((sum, m) => sum + m.likeCount, 0);
  const totalComments = media.reduce((sum, m) => sum + m.commentsCount, 0);
  const topPost = media.length
    ? media.reduce((top, m) =>
        m.likeCount + m.commentsCount > top.likeCount + top.commentsCount ? m : top,
      )
    : null;

  return {
    profile,
    media,
    totals: {
      avgLikes: media.length ? Math.round(totalLikes / media.length) : 0,
      avgComments: media.length ? Math.round(totalComments / media.length) : 0,
      totalEngagement: totalLikes + totalComments,
      topPost,
    },
  };
}
