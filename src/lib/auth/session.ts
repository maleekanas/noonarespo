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

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function verify(payload: string, signature: string): boolean {
  const expectedSignature = sign(payload);
  if (signature.length !== expectedSignature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  try {
    const parts = sessionToken.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    if (!payload || !signature || !verify(payload, signature)) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const token = `${payload}.${sign(payload)}`;

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
