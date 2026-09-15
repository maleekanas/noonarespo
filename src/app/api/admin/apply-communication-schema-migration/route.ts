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
// the new Conversation/Message/MeetingRequest/Notification models to
// prisma/schema.prisma therefore does NOT, by itself, create the tables on
// the live Neon database. This route applies exactly that schema change with
// raw SQL, so the site owner can trigger it from a browser without
// shell/DB access.
//
// Notification.userId is intentionally NOT a foreign key: the app writes
// either a ParentProfile.id or a TeacherProfile.id into that column
// depending on who the notification is for, so it can't point at a single
// table. Message.senderId is the same kind of polymorphic id.
//
// This route does not seed the old in-memory demo conversation/messages/
// meeting/notifications ("parent-1"/"teacher-1"/"student-1") -- those ids
// don't correspond to real profile rows in the live database, so inserting
// them would violate the new foreign key constraints. Tables start empty;
// real conversations/meetings/notifications appear as real parents and
// teachers use the app.
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
    `CREATE TABLE IF NOT EXISTS "conversations" (
      "id" TEXT NOT NULL,
      "parentId" TEXT NOT NULL,
      "teacherId" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
    );`,
    `DO $$ BEGIN
      ALTER TABLE "conversations"
        ADD CONSTRAINT "conversations_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "parent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN
      ALTER TABLE "conversations"
        ADD CONSTRAINT "conversations_teacherId_fkey"
        FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN
      ALTER TABLE "conversations"
        ADD CONSTRAINT "conversations_studentId_fkey"
        FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "conversations_parentId_teacherId_studentId_key" ON "conversations"("parentId", "teacherId", "studentId");`,

    `CREATE TABLE IF NOT EXISTS "messages" (
      "id" TEXT NOT NULL,
      "conversationId" TEXT NOT NULL,
      "senderId" TEXT NOT NULL,
      "senderRole" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "isRead" BOOLEAN NOT NULL DEFAULT false,
      "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
    );`,
    `DO $$ BEGIN
      ALTER TABLE "messages"
        ADD CONSTRAINT "messages_conversationId_fkey"
        FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `CREATE INDEX IF NOT EXISTS "messages_conversationId_idx" ON "messages"("conversationId");`,

    `CREATE TABLE IF NOT EXISTS "meeting_requests" (
      "id" TEXT NOT NULL,
      "parentId" TEXT NOT NULL,
      "teacherId" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "requestedTimeUtc" TIMESTAMP(3) NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "notes" TEXT,
      "meetingUrl" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "meeting_requests_pkey" PRIMARY KEY ("id")
    );`,
    `DO $$ BEGIN
      ALTER TABLE "meeting_requests"
        ADD CONSTRAINT "meeting_requests_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "parent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN
      ALTER TABLE "meeting_requests"
        ADD CONSTRAINT "meeting_requests_teacherId_fkey"
        FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN
      ALTER TABLE "meeting_requests"
        ADD CONSTRAINT "meeting_requests_studentId_fkey"
        FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

    `CREATE TABLE IF NOT EXISTS "notifications" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "linkUrl" TEXT,
      "isRead" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId");`,
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
    message: "Communication schema migration applied successfully (safe to re-run).",
    appliedStatements: applied,
    reminder:
      "Delete this route (src/app/api/admin/apply-communication-schema-migration) or remove SEED_ADMIN_SECRET from Vercel once you're done.",
  });
}
