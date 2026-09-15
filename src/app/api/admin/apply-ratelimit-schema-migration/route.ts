import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export const runtime = "nodejs";
// Same reasoning as the other apply-*-schema-migration routes: force this to
// run only when actually requested, not during the Vercel build's
// static-render pass.
export const dynamic = "force-dynamic";

// TEMPORARY, SECRET-PROTECTED, ONE-TIME UTILITY.
//
// This project uses `prisma db push` (no migrations folder) and nothing in
// package.json/Vercel build settings runs it automatically on deploy. Adding
// the new RateLimitAttempt model to prisma/schema.prisma therefore does NOT,
// by itself, create the table on the live Neon database. This route applies
// exactly that schema change with raw SQL, so the site owner can trigger it
// from a browser without shell/DB access.
//
// It is idempotent (IF NOT EXISTS everywhere) and gated by the same
// SEED_ADMIN_SECRET already used by the other one-time admin routes. Delete
// this file (or unset the env var) once you've visited it once successfully.

export async function GET(request: NextRequest) {
  const configuredSecret = process.env.SEED_ADMIN_SECRET;
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "SEED_ADMIN_SECRET is not configured on the server." },
      { status: 500 }
    );
  }

  const providedSecret = request.nextUrl.searchParams.get("secret");
  if (!providedSecret || providedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const statements = [
    `CREATE TABLE IF NOT EXISTS "rate_limit_attempts" (
      "id" TEXT NOT NULL,
      "key" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "rate_limit_attempts_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE INDEX IF NOT EXISTS "rate_limit_attempts_key_createdAt_idx" ON "rate_limit_attempts"("key", "createdAt");`,
  ];

  const applied: string[] = [];
  try {
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
      applied.push(statement);
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: "Migration failed partway through.",
        detail: err instanceof Error ? err.message : String(err),
        appliedBeforeFailure: applied,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Rate limit schema migration applied successfully (safe to re-run).",
    appliedStatements: applied,
    reminder:
      "Delete this route (src/app/api/admin/apply-ratelimit-schema-migration) or remove SEED_ADMIN_SECRET from Vercel once you're done.",
  });
}
