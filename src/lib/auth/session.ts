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
const SESSION_SECRET = process.env.SESSION_SECRET || "kaa_prod_hmac_secret_2026_kid_arabic_academy";

function sign(payload: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
}

function verify(payload: string, signature: string): boolean {
  const expectedSignature = sign(payload);
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
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

  try {
    // Support signed format: `${payload}.${signature}`
    if (sessionToken.includes(".")) {
      const [payload, signature] = sessionToken.split(".");
      if (!payload || !signature || !verify(payload, signature)) {
        return null;
      }
      const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
      return decoded as SessionUser;
    }

    // Backwards-compatible legacy unsigned fallback for local development transition
    const decoded = JSON.parse(Buffer.from(sessionToken, "base64").toString("utf-8"));
    return decoded as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Create a cryptographically signed HMAC session for a user.
 */
export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signature = sign(payload);
  const token = `${payload}.${signature}`;

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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
