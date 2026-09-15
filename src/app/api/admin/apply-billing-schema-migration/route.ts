import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export const runtime = "nodejs";
// Same reasoning as seed-test-parent: force this to run only when actually
// requested, not during the Vercel build's static-render pass.
export const dynamic = "force-dynamic";

// TEMPORARY, SECRET-PROTECTED, ONE-TIME UTILITY.
//
// This project uses `prisma db push` (no migrations folder) and nothing in
// package.json/Vercel build settings runs it automatically on deploy — see
// PHASE01_MANUAL_EDITS.md / earlier session notes. Adding the two new Stripe
// id columns (ParentProfile.stripeCustomerId, Subscription.stripeSubscriptionId)
// to prisma/schema.prisma therefore does NOT, by itself, add them to the live
// Neon database. This route applies exactly that schema change with raw SQL,
// so the site owner can trigger it from a browser without shell/DB access.
//
// It is idempotent (IF NOT EXISTS everywhere) and gated by the same
// SEED_ADMIN_SECRET already used for seed-test-parent. Delete this file (or
// unset the env var) once you've visited it once successfully.

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
    `ALTER TABLE "parent_profiles" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "parent_profiles_stripeCustomerId_key" ON "parent_profiles"("stripeCustomerId");`,
    `ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");`,
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
    message: "Billing schema migration applied successfully (safe to re-run).",
    appliedStatements: applied,
    reminder:
      "Delete this route (src/app/api/admin/apply-billing-schema-migration) or remove SEED_ADMIN_SECRET from Vercel once you're done.",
  });
}
