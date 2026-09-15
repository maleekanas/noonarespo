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
// the new VocabularyCardProgress model to prisma/schema.prisma therefore
// does NOT, by itself, create the table on the live Neon database. This
// route applies exactly that schema change with raw SQL, so the site owner
// can trigger it from a browser without shell/DB access.
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
    `CREATE TABLE IF NOT EXISTS "vocabulary_card_progress" (
      "id" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "cardId" TEXT NOT NULL,
      "box" INTEGER NOT NULL DEFAULT 1,
      "consecutiveCorrect" INTEGER NOT NULL DEFAULT 0,
      "totalReviews" INTEGER NOT NULL DEFAULT 0,
      "lastReviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "nextReviewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "vocabulary_card_progress_pkey" PRIMARY KEY ("id")
    );`,
    `DO $$ BEGIN
      ALTER TABLE "vocabulary_card_progress"
        ADD CONSTRAINT "vocabulary_card_progress_studentId_fkey"
        FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "vocabulary_card_progress_studentId_cardId_key" ON "vocabulary_card_progress"("studentId", "cardId");`,
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
    message: "Vocabulary SRS schema migration applied successfully (safe to re-run).",
    appliedStatements: applied,
    reminder:
      "Delete this route (src/app/api/admin/apply-vocabulary-schema-migration) or remove SEED_ADMIN_SECRET from Vercel once you're done.",
  });
}
