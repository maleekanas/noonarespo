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
// the new RoadmapNodeProgress model to prisma/schema.prisma therefore does
// NOT, by itself, create the table on the live Neon database. This route
// applies exactly that schema change with raw SQL, so the site owner can
// trigger it from a browser without shell/DB access.
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
    `CREATE TABLE IF NOT EXISTS "roadmap_node_progress" (
      "id" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "nodeId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'LOCKED',
      "starsEarned" INTEGER NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "roadmap_node_progress_pkey" PRIMARY KEY ("id")
    );`,
    `DO $$ BEGIN
      ALTER TABLE "roadmap_node_progress"
        ADD CONSTRAINT "roadmap_node_progress_studentId_fkey"
        FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "roadmap_node_progress_studentId_nodeId_key" ON "roadmap_node_progress"("studentId", "nodeId");`,
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
    message: "Roadmap schema migration applied successfully (safe to re-run).",
    appliedStatements: applied,
    reminder:
      "Delete this route (src/app/api/admin/apply-roadmap-schema-migration) or remove SEED_ADMIN_SECRET from Vercel once you're done.",
  });
}
