import crypto from "crypto";
import { prisma } from "@/lib/database/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Creates a password reset token for a user and returns the RAW token (to be
 * emailed, never stored). Only its sha256 hash is persisted, same principle
 * as password hashing -- a leaked database row can't be used to reset an
 * account.
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return rawToken;
}

/**
 * Read-only check used when rendering the reset-password page, so simply
 * loading (or reloading) the page never consumes the token.
 */
export async function isResetTokenValid(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });
  return Boolean(record && !record.usedAt && record.expiresAt.getTime() > Date.now());
}

/**
 * Validates the token and marks it used in one step. Called only when the
 * user actually submits a new password, so a token can only ever be spent
 * once even if the link is opened multiple times.
 */
export async function verifyAndConsumeResetToken(rawToken: string): Promise<{ userId: string } | null> {
  if (!rawToken) return null;
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { userId: record.userId };
}
