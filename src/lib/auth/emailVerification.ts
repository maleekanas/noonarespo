import crypto from "crypto";
import { prisma } from "@/lib/database/prisma";
import { UserStatus } from "@prisma/client";

// Same pattern as passwordReset.ts: a random token is emailed, only its
// sha256 hash is ever persisted, and it's single-use. Backs the "verified
// email" requirement for new self-service registrations (most notably the
// public 1-day free trial) -- UserStatus.PENDING_VERIFICATION already
// existed in the schema but was never actually used anywhere until this.
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours -- generous on purpose,
// since a verification link is often opened well after signup (checked a
// different device, got distracted, etc.), unlike a password-reset link
// which is used within minutes of being requested.

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Creates an email verification token for a user and returns the RAW token
 * (to be emailed, never stored).
 */
export async function createEmailVerificationToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return rawToken;
}

/**
 * Read-only check used when rendering the verify-email page, so loading
 * (or reloading, or an email-security-scanner prefetching) the page never
 * consumes the token -- only the explicit "Confirm My Email" submit does.
 */
export async function isVerificationTokenValid(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });
  return Boolean(record && !record.usedAt && record.expiresAt.getTime() > Date.now());
}

/**
 * Validates the token, marks it used, and flips the account from
 * PENDING_VERIFICATION to ACTIVE -- all in one step, called only when the
 * user submits the confirmation form, so a token can only ever be spent
 * once even if the email link is opened multiple times.
 */
export async function verifyAndConsumeEmailToken(
  rawToken: string
): Promise<{ userId: string; email: string } | null> {
  if (!rawToken) return null;
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  const [, user] = await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { status: UserStatus.ACTIVE },
    }),
  ]);

  return { userId: user.id, email: user.email };
}
