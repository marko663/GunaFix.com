// Password gate for the live /dashboard page. There's no user database —
// a single shared secret (DASHBOARD_PASSWORD) controls access, same as the
// growth agents' own GH_TOKEN setup. The session cookie holds an HMAC of a
// fixed message keyed by that password, not the password itself, so
// rotating DASHBOARD_PASSWORD instantly invalidates every existing cookie.

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "gf_dashboard_auth";
const SESSION_MESSAGE = "dashboard-session";

export function isDashboardConfigured() {
  return Boolean(process.env.DASHBOARD_PASSWORD);
}

function sessionToken(password: string) {
  return createHmac("sha256", password).update(SESSION_MESSAGE).digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyPassword(submitted: string) {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return false;
  return safeEqual(submitted, expected);
}

export async function isAuthed() {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return false;
  const store = await cookies();
  const cookie = store.get(AUTH_COOKIE_NAME)?.value;
  if (!cookie) return false;
  return safeEqual(cookie, sessionToken(expected));
}

export async function setAuthCookie() {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return;
  const store = await cookies();
  store.set({
    name: AUTH_COOKIE_NAME,
    value: sessionToken(expected),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
}
