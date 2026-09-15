import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  DomainUser,
  DomainStudentProfile,
  DomainParentProfile,
  DomainTeacherProfile,
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

  async getAllTeachers(): Promise<DomainTeacherProfile[]> {
    // Intentionally unfiltered (including inactive teachers) -- this is
    // used by the admin teacher-management page, which needs to see and
    // be able to re-activate an inactive teacher, not just active ones.
    return prisma.teacherProfile.findMany({ orderBy: { firstName: "asc" } });
  }

  async updateTeacherProfile(
    teacherId: string,
    data: Partial<Pick<DomainTeacherProfile, "hourlyRateMinorUnits" | "isActive">>
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
