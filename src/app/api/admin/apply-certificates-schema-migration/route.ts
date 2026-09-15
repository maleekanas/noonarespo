import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export const runtime = "nodejs";
// Same reasoning as the other apply-*-schema-migration routes: force this to
// run only when actually requested, not during the Vercel build's
// static-render pass.
export const dynamic = "force-dynamic";

// TEMPORARY, SECRET-PROTECTED, ONE-TIME UTILITY.
//
// The Certificate model has been in prisma/schema.prisma since before this
// round of migrations, so the "certificates" table most likely already
// exists on the live Neon database from an earlier `prisma db push`. This
// route is here defensively (idempotent, IF NOT EXISTS) in case it doesn't
// -- CertificateService now actually writes real rows here (it used to
// fabricate every certificate on the fly), so this table has to exist
// before that code path runs.
//
// It is gated by the same SEED_ADMIN_SECRET already used by the other
// one-time admin routes. Delete this file (or unset the env var) once
// you've visited it once successfully.

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
    `CREATE TABLE IF NOT EXISTS "certificates" (
      "id" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "verificationCode" TEXT NOT NULL,
      "titleEn" TEXT NOT NULL,
      "titleAr" TEXT NOT NULL,
      "studentNameSnapshot" TEXT NOT NULL,
      "courseNameSnapshot" TEXT NOT NULL,
      "pdfUrl" TEXT,
      "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
    );`,
    `DO $$ BEGIN
      ALTER TABLE "certificates"
        ADD CONSTRAINT "certificates_studentId_fkey"
        FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "certificates_verificationCode_key" ON "certificates"("verificationCode");`,
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
    message: "Certificates schema migration applied successfully (safe to re-run).",
    appliedStatements: applied,
    reminder:
      "Delete this route (src/app/api/admin/apply-certificates-schema-migration) or remove SEED_ADMIN_SECRET from Vercel once you're done.",
  });
}
