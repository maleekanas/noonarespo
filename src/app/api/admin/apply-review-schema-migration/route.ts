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
// the new ParentReview model to prisma/schema.prisma therefore does NOT, by
// itself, create the table on the live Neon database. This route applies
// exactly that schema change with raw SQL, so the site owner can trigger it
// from a browser without shell/DB access.
//
// Note: unlike apply-school-schema-migration, this route does NOT seed the
// two demo reviews the old in-memory repository shipped with ("parent-1" /
// "teacher-1"). Those ids don't correspond to real parent_profiles /
// teacher_profiles rows, so inserting them would either violate the new
// foreign key constraints or attribute fake testimonials to people who
// aren't real customers. The table starts empty; real reviews appear once
// real parents submit them.
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
    `CREATE TABLE IF NOT EXISTS "parent_reviews" (
      "id" TEXT NOT NULL,
      "parentId" TEXT NOT NULL,
      "parentName" TEXT NOT NULL,
      "teacherId" TEXT NOT NULL,
      "teacherName" TEXT NOT NULL,
      "rating" INTEGER NOT NULL,
      "titleAr" TEXT NOT NULL,
      "commentAr" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'APPROVED',
      "adminReplyAr" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "parent_reviews_pkey" PRIMARY KEY ("id")
    );`,
    `DO $$ BEGIN
      ALTER TABLE "parent_reviews"
        ADD CONSTRAINT "parent_reviews_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "parent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN
      ALTER TABLE "parent_reviews"
        ADD CONSTRAINT "parent_reviews_teacherId_fkey"
        FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `CREATE INDEX IF NOT EXISTS "parent_reviews_teacherId_idx" ON "parent_reviews"("teacherId");`,
    `CREATE INDEX IF NOT EXISTS "parent_reviews_parentId_idx" ON "parent_reviews"("parentId");`,
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
    message: "Review schema migration applied successfully (safe to re-run).",
    appliedStatements: applied,
    reminder:
      "Delete this route (src/app/api/admin/apply-review-schema-migration) or remove SEED_ADMIN_SECRET from Vercel once you're done.",
  });
}
