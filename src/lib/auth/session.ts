import { cookies } from "next/headers";
import { RoleType } from "@prisma/client";
import crypto from "crypto";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  locale: string;
}

const SESSION_COOKIE_NAME = "kaa_session_token";

/**
 * Reads SESSION_SECRET lazily (never a hardcoded fallback — a fallback string
 * would be public the moment this repository is public). Throws only when a
 * session is actually signed or verified, so it never breaks `next build` or
 * unrelated routes that merely import this module.
 */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is not set (or shorter than 32 characters). Set a strong random value in the deployment environment before serving traffic."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function verify(payload: string, signature: string): boolean {
  const expectedSignature = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

/**
 * Get the current authenticated user session from cookie (or null if unauthenticated or tampered).
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  // Only the signed `${payload}.${signature}` format is accepted. An earlier
  // version also accepted an unsigned base64 payload with no signature check
  // at all, which let anyone construct an arbitrary session (including
  // SUPER_ADMIN) by hand. That fallback has been removed intentionally.
  const [payload, signature] = sessionToken.split(".");
  if (!payload || !signature) {
    return null;
  }

  try {
    if (!verify(payload, signature)) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as { user: SessionUser; expiresAt: number };
    if (!decoded?.user || !decoded.expiresAt || decoded.expiresAt <= Date.now()) return null;
    return decoded.user;
  } catch {
    return null;
  }
}

/**
 * Create a cryptographically signed HMAC session for a user.
 */
export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + 60 * 60 * 24 * 7 * 1000;
  const payload = Buffer.from(JSON.stringify({ user, expiresAt })).toString("base64url");
  const signature = sign(payload);
  const token = `${payload}.${signature}`;

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Terminate the user session.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
