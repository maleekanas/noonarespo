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

export async function requireStudentProfile(locale: string) {
  const session = await requireSession(locale);
  if (session.role !== RoleType.STUDENT) {
    redirect(`/${locale}/login`);
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
  });

  if (!profile) {
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

// SCHOOL_ADMIN is intentionally NOT in this list. It used to be treated
// identically to the platform-wide admin roles, which meant a school
// admin (once real accounts exist) would see and manage every school's
// students, classes and reports through /admin -- not just their own.
// SCHOOL_ADMIN now has its own scoped area (requireSchoolAdminSession,
// below) gating a separate /school-admin route instead.
const ADMIN_ROLES: RoleType[] = [
  RoleType.SUPER_ADMIN,
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

/**
 * Gates the school-scoped /school-admin area. Resolves the *real*
 * AdministratorProfile row for the logged-in user (never trusting a
 * schoolId embedded in the session cookie itself, the same reasoning as
 * requireParentProfile/requireTeacherProfile above) so a school admin's
 * scope always reflects their current database assignment -- including
 * if a super-admin ever reassigns them to a different school.
 */
export async function requireSchoolAdminSession(
  locale: string
): Promise<{ session: SessionUser; schoolId: string }> {
  const session = await requireSession(locale);
  if (session.role !== RoleType.SCHOOL_ADMIN) {
    redirect(`/${locale}/login`);
  }

  const profile = await prisma.administratorProfile.findUnique({
    where: { userId: session.id },
  });

  if (!profile || !profile.schoolId) {
    // A SCHOOL_ADMIN account with no school assigned is a data problem
    // (every school admin must be created scoped to a school -- see
    // SchoolRepository.createSchoolAdmin), not a normal access-denied case.
    redirect(`/${locale}`);
  }

  return { session, schoolId: profile.schoolId };
}
