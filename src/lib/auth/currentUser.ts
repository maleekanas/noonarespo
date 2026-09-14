import { redirect } from "next/navigation";
import { RoleType } from "@prisma/client";
import { getSession, type SessionUser } from "./session";
import { prisma } from "@/lib/database/prisma";

/**
 * Every function here does two things at once: (1) confirms someone is
 * actually logged in with the right role, redirecting to /login if not,
 * and (2) resolves the *real* profile row for that logged-in person from
 * the database, instead of ever trusting a hardcoded demo id.
 *
 * These were introduced because every dashboard page previously used a
 * literal "parent-1" / "teacher-1" string regardless of who was logged
 * in (or whether anyone was logged in at all) -- every visitor saw and
 * could act on the same demo family's data. Use these instead of ever
 * writing a hardcoded id again.
 */

export async function requireSession(locale: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }
  return session;
}

export async function requireParentProfile(locale: string) {
  const session = await requireSession(locale);
  if (session.role !== RoleType.PARENT) {
    redirect(`/${locale}/login`);
  }

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: session.id },
  });

  if (!profile) {
    // A PARENT-role account with no parent profile row is a data problem,
    // not a normal "not logged in" case -- send them home rather than
    // looping them back through login.
    redirect(`/${locale}`);
  }

  return { session, profile };
}

export async function requireTeacherProfile(locale: string) {
  const session = await requireSession(locale);
  if (session.role !== RoleType.TEACHER) {
    redirect(`/${locale}/login`);
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: session.id },
  });

  if (!profile) {
    redirect(`/${locale}`);
  }

  return { session, profile };
}

const ADMIN_ROLES: RoleType[] = [
  RoleType.SUPER_ADMIN,
  RoleType.SCHOOL_ADMIN,
  RoleType.ACADEMIC_ADMIN,
  RoleType.FINANCE_ADMIN,
];

export async function requireAdminSession(locale: string): Promise<SessionUser> {
  const session = await requireSession(locale);
  if (!ADMIN_ROLES.includes(session.role)) {
    redirect(`/${locale}/login`);
  }
  return session;
}
