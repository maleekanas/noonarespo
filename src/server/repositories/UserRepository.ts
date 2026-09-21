import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  DomainUser,
  DomainStudentProfile,
  DomainParentProfile,
  DomainTeacherProfile,
  DomainAdministratorProfile,
} from "./types";
import { RoleType, AgeGroup, RelationshipType } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

/**
 * Prisma-backed repository for identity/profile data (parents, children,
 * teachers) and the parent<->child linking that a real family's dashboard
 * depends on.
 *
 * This used to be an in-memory, module-level Map seeded only with fixed
 * demo ids ("parent-1", "student-1", ...) -- meaning a REAL parent's
 * session (whose id is a real database uuid, resolved via
 * requireParentProfile) never matched anything in the Maps. A real
 * parent adding a real child (parent/children/page.tsx's handleAddChild)
 * wrote only into that in-memory structure, which is wiped on every
 * serverless cold start / redeploy -- so the child silently vanished.
 * Every method below now reads and writes the real Prisma tables
 * instead, so this is actually durable for real families.
 */
class UserRepository {
  async findUserByEmail(email: string): Promise<DomainUser | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
      localePreference: user.localePreference,
      mfaEnabled: user.mfaEnabled,
      role: user.userRoles[0]?.role.name ?? RoleType.PARENT,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findUserById(id: string): Promise<DomainUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
      localePreference: user.localePreference,
      mfaEnabled: user.mfaEnabled,
      role: user.userRoles[0]?.role.name ?? RoleType.PARENT,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Self-service account settings, used by every role from the shared
   * /account page (src/app/[locale]/(dashboard)/account/page.tsx) -- this
   * is what lets the founder move the seeded super-admin account off its
   * placeholder @kidsarabicacademy.internal address onto a real inbox they
   * control, and what any logged-in user (parent, teacher, student, admin,
   * school admin) uses to change their own password without having to log
   * out and go through the forgot-password email flow.
   */
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async updateEmail(userId: string, newEmail: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { email: newEmail.toLowerCase() } });
  }

  async findParentProfileByUserId(userId: string): Promise<DomainParentProfile | null> {
    return prisma.parentProfile.findUnique({ where: { userId } });
  }

  async findParentProfileById(id: string): Promise<DomainParentProfile | null> {
    return prisma.parentProfile.findUnique({ where: { id } });
  }

  async findStudentProfileById(id: string): Promise<DomainStudentProfile | null> {
    return prisma.studentProfile.findUnique({ where: { id } });
  }

  async findTeacherProfileById(id: string): Promise<DomainTeacherProfile | null> {
    return prisma.teacherProfile.findUnique({ where: { id } });
  }

  async findStudentProfileByUserId(userId: string): Promise<DomainStudentProfile | null> {
    return prisma.studentProfile.findUnique({ where: { userId } });
  }

  async findTeacherProfileByUserId(userId: string): Promise<DomainTeacherProfile | null> {
    return prisma.teacherProfile.findUnique({ where: { userId } });
  }

  async findAdministratorProfileByUserId(userId: string): Promise<DomainAdministratorProfile | null> {
    return prisma.administratorProfile.findUnique({ where: { userId } });
  }

  async getAllTeachers(): Promise<any[]> {
    return prisma.teacherProfile.findMany({
      include: {
        user: { select: { email: true, status: true } },
      },
      orderBy: { firstName: "asc" },
    });
  }

  async getAllStudents(): Promise<any[]> {
    return prisma.studentProfile.findMany({
      include: {
        user: { select: { email: true, status: true } },
      },
      orderBy: { firstName: "asc" },
    });
  }

  /**
   * Every parent account's contact info, for admin-triggered account-wide
   * notices (e.g. a price or policy change the Terms of Service promises to
   * email parents about -- see ACCOUNT_NOTICE in NotificationPayload). Only
   * ACTIVE users are included: a suspended or deleted account shouldn't be
   * emailed, and an account without a confirmed email address isn't a real
   * delivery target.
   */
  async getAllParentsWithContact(): Promise<
    Array<{ parentId: string; userId: string; name: string; email: string }>
  > {
    const parents = await prisma.parentProfile.findMany({
      where: { user: { status: "ACTIVE" } },
      include: { user: { select: { email: true } } },
      orderBy: { firstName: "asc" },
    });
    return parents.map((p) => ({
      parentId: p.id,
      userId: p.userId,
      name: `${p.firstName} ${p.lastName}`,
      email: p.user.email,
    }));
  }

  async updateTeacherProfile(
    teacherId: string,
    data: Partial<
      Pick<DomainTeacherProfile, "hourlyRateMinorUnits" | "isActive" | "isCertified" | "employmentType">
    >
  ): Promise<DomainTeacherProfile | null> {
    // findTeacherProfileById() returns a fresh, detached object from each
    // Prisma read -- unlike the old in-memory Map, mutating the returned
    // object no longer writes anything back. Admin actions that used to do
    // exactly that (updateTeacherRate/updateTeacherActiveStatus) now need
    // a real write, which is what this does.
    try {
      return await prisma.teacherProfile.update({ where: { id: teacherId }, data });
    } catch {
      return null;
    }
  }

  async findPrimaryParentIdByStudentId(studentId: string): Promise<string | null> {
    const relationship = await prisma.parentStudentRelationship.findFirst({
      where: { studentId },
      orderBy: { isPrimaryContact: "desc" },
    });
    return relationship?.parentId ?? null;
  }

  async getLinkedChildren(parentId: string): Promise<DomainStudentProfile[]> {
    const relationships = await prisma.parentStudentRelationship.findMany({
      where: { parentId },
      include: { student: true },
      orderBy: { createdAt: "asc" },
    });
    return relationships.map((rel) => rel.student);
  }

  // Mutations
  async createChildWithParentLink(
    parentId: string,
    data: {
      firstName: string;
      lastName: string;
      dateOfBirth: Date;
      gender?: string;
      ageGroup: AgeGroup;
      nativeLanguage?: string;
      notesInternal?: string;
      relationshipType: RelationshipType;
    }
  ): Promise<DomainStudentProfile> {
    // A child does not sign in on their own in this product today (there
    // is no child-facing signup flow), but StudentProfile still requires
    // a backing User row (1:1, same as Parent/Teacher). We mint an
    // internal, non-guessable placeholder account for it -- the same
    // pattern the previous in-memory version used, except the password is
    // now a real random value that is bcrypt-hashed and never handed to
    // anyone, rather than a shared literal string.
    const studentRole = await prisma.role.findUnique({ where: { name: RoleType.STUDENT } });
    if (!studentRole) {
      throw new Error(
        "The STUDENT role does not exist in the database yet. Run the seed script (npm run db:seed) first."
      );
    }

    const randomPassword = crypto.randomBytes(24).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, 10);
    const emailSlug = data.firstName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 24) || "child";
    const email = `${emailSlug}.${crypto.randomBytes(4).toString("hex")}@kidsarabicacademy.internal`;

    const student = await prisma.$transaction(async (tx) => {
      const createdStudent = await tx.studentProfile.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          ageGroup: data.ageGroup,
          nativeLanguage: data.nativeLanguage || "ar",
          notesInternal: data.notesInternal,
          user: {
            create: {
              email,
              passwordHash,
              localePreference: "ar",
            },
          },
        },
      });

      await tx.userRole.create({
        data: { userId: createdStudent.userId, roleId: studentRole.id },
      });

      await tx.parentStudentRelationship.create({
        data: {
          parentId,
          studentId: createdStudent.id,
          relationshipType: data.relationshipType,
          isPrimaryContact: true,
        },
      });

      return createdStudent;
    });

    return student;
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
