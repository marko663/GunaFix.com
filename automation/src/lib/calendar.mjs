// Google Calendar API client: books a real meeting + sends a calendar
// invite when a lead replies to an outreach email. Reuses the same Gmail
// OAuth refresh token (requires the calendar.events scope in addition to
// gmail.compose/gmail.readonly — see scripts/getGmailRefreshToken.mjs).
// Plain fetch, no googleapis dependency, consistent with the rest of
// automation/.

import { config } from "../config.mjs";
import { getAccessTokenFromRefreshToken } from "./googleAuth.mjs";

const API_BASE = "https://www.googleapis.com/calendar/v3";
const BUSINESS_HOUR_START = 9; // 9am local
const BUSINESS_HOUR_END = 17; // 5pm local
const SLOT_MINUTES = 30;
const SEARCH_DAYS_AHEAD = 14;
const MIN_NOTICE_MS = 60 * 60 * 1000; // don't book sooner than 1h out

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

async function calendarFetch(path, accessTok, opts = {}) {
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
    throw new Error(`Calendar API error ${res.status} ${path}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

function hourInZone(date, timeZone) {
  return Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone }).format(date)) % 24;
}

function weekdayInZone(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(date);
}

/**
 * Walks forward in 30-minute steps from ~1h from now, skipping weekends and
 * outside-business-hours slots (9am-5pm in `timeZone`), and returns the
 * first slot with no conflict on the owner's primary calendar (checked via
 * the freeBusy API).
 */
export async function findNextAvailableSlot({ timeZone = config.ownerTimezone, durationMinutes = SLOT_MINUTES } = {}) {
  if (!timeZone) throw new Error("OWNER_TIMEZONE is not set");
  const tok = await accessToken();

  const now = new Date(Date.now() + MIN_NOTICE_MS);
  const horizon = new Date(now.getTime() + SEARCH_DAYS_AHEAD * 24 * 60 * 60 * 1000);

  const freebusy = await calendarFetch("/freeBusy", tok, {
    method: "POST",
    body: JSON.stringify({
      timeMin: now.toISOString(),
      timeMax: horizon.toISOString(),
      items: [{ id: "primary" }],
    }),
  });
  const busy = (freebusy.calendars?.primary?.busy || []).map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));

  const stepMs = SLOT_MINUTES * 60000;
  let candidate = new Date(Math.ceil(now.getTime() / stepMs) * stepMs);
  const steps = Math.ceil((horizon.getTime() - candidate.getTime()) / stepMs);

  for (let i = 0; i < steps; i++) {
    const isWeekday = !["Sat", "Sun"].includes(weekdayInZone(candidate, timeZone));
    const hour = hourInZone(candidate, timeZone);
    const inBusinessHours = hour >= BUSINESS_HOUR_START && hour < BUSINESS_HOUR_END;

    if (isWeekday && inBusinessHours) {
      const slotEndMs = candidate.getTime() + durationMinutes * 60000;
      const conflict = busy.some((b) => candidate.getTime() < b.end && slotEndMs > b.start);
      if (!conflict) {
        return { start: candidate, end: new Date(slotEndMs), timeZone };
      }
    }
    candidate = new Date(candidate.getTime() + stepMs);
  }
  throw new Error(`no open business-hours slot found in the next ${SEARCH_DAYS_AHEAD} days`);
}

/** Creates a real Calendar event on the owner's primary calendar and emails the attendee a real invite (sendUpdates: "all"). */
export async function createCalendarEvent({ summary, description, start, end, timeZone, attendeeEmail }) {
  const tok = await accessToken();
  return calendarFetch("/calendars/primary/events?sendUpdates=all", tok, {
    method: "POST",
    body: JSON.stringify({
      summary,
      description,
      start: { dateTime: start.toISOString(), timeZone },
      end: { dateTime: end.toISOString(), timeZone },
      attendees: [{ email: attendeeEmail }],
    }),
  });
}

/** e.g. "Thursday, June 26 at 2:00 PM EDT" — for slotting straight into an email reply. */
export function formatSlot(slot) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: slot.timeZone,
    timeZoneName: "short",
  }).format(slot.start);
}
