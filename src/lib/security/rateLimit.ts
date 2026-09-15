import { headers } from "next/headers";
import { prisma } from "@/lib/database/prisma";

// docs/SECURITY.md has claimed since before this file existed that "API
// routes are rate-limited per IP and user account." That was never true --
// there was no rate limiting anywhere in the codebase, on login, password
// reset requests, registration, or anything else. That meant an attacker
// could brute-force a parent's password, spam a child's account with
// reset-request emails, or mass-create fake accounts with no friction at
// all. This module makes the claim in the docs real.
//
// Implementation is a small Postgres-backed sliding window rather than
// Redis/Upstash, since this app has no cache layer today and a login/
// password-reset volume this size doesn't need one. Each check both prunes
// stale rows for its own key and records the current attempt, so the table
// stays bounded without a separate cron job.

export interface RateLimitResult {
  allowed: boolean;
  /** Only set when allowed is false -- how long until the caller can retry. */
  retryAfterSeconds?: number;
}

/**
 * Best-effort extraction of the caller's IP from the standard proxy headers
 * Vercel (and most reverse proxies) set. Falls back to a constant string
 * rather than throwing -- rate limiting degrades to "no IP-based limiting"
 * rather than breaking the request if headers are ever missing (e.g. local
 * dev without a proxy in front of it).
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      // x-forwarded-for can be a comma-separated chain; the first entry is
      // the original client.
      const first = forwardedFor.split(",")[0]?.trim();
      if (first) return first;
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) return realIp;
  } catch {
    // headers() throws outside a request context (e.g. some test setups) --
    // fall through to the constant below.
  }
  return "unknown";
}

/**
 * Checks and records an attempt against a rate-limit key (e.g.
 * "login:ip:1.2.3.4" or "login:email:parent@example.com"). Returns
 * allowed:false without recording a new attempt once the window's cap is
 * already reached, so a caller stuck at the limit doesn't keep resetting
 * their own window by retrying.
 */
export async function checkRateLimit(
  key: string,
  options: { max: number; windowSeconds: number }
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - options.windowSeconds * 1000);

  // Prune this key's stale rows opportunistically. Best-effort: a failure
  // here should never block the actual rate-limit decision.
  try {
    await prisma.rateLimitAttempt.deleteMany({
      where: { key, createdAt: { lt: windowStart } },
    });
  } catch {
    // ignore -- worst case the table grows a little until the next prune
  }

  const currentCount = await prisma.rateLimitAttempt.count({
    where: { key, createdAt: { gte: windowStart } },
  });

  if (currentCount >= options.max) {
    const oldestInWindow = await prisma.rateLimitAttempt.findFirst({
      where: { key, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
    });
    const retryAfterSeconds = oldestInWindow
      ? Math.max(
          1,
          Math.ceil(
            (oldestInWindow.createdAt.getTime() + options.windowSeconds * 1000 - Date.now()) / 1000
          )
        )
      : options.windowSeconds;
    return { allowed: false, retryAfterSeconds };
  }

  await prisma.rateLimitAttempt.create({ data: { key } });
  return { allowed: true };
}

/** Named windows shared across the auth pages that call into this module. */
export const RATE_LIMITS = {
  LOGIN_PER_IP: { max: 20, windowSeconds: 15 * 60 },
  LOGIN_PER_EMAIL: { max: 8, windowSeconds: 15 * 60 },
  REGISTER_PER_IP: { max: 6, windowSeconds: 60 * 60 },
  FORGOT_PASSWORD_PER_IP: { max: 10, windowSeconds: 60 * 60 },
  FORGOT_PASSWORD_PER_EMAIL: { max: 3, windowSeconds: 60 * 60 },
  RESET_PASSWORD_SUBMIT_PER_IP: { max: 20, windowSeconds: 60 * 60 },
} as const;
