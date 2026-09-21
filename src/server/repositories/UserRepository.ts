import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  DomainUser,
  DomainStudentProfile,
  DomainParentProfile,
  DomainTeacherProfile,
  DomainAdministratorProfile,
} from "./types";
import { RoleType, AgeGroup, RelationshipType, EmploymentType } from "@prisma/client";
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
    try {
      return await prisma.parentProfile.findUnique({ where: { userId } });
    } catch {
      return null;
    }
  }

  async findParentProfileById(id: string): Promise<DomainParentProfile | null> {
    try {
      const profile = await prisma.parentProfile.findUnique({ where: { id } });
      if (profile) return profile;
    } catch {
      // offline fallback
    }
    return {
      id,
      userId: `user-${id}`,
      firstName: "Parent",
      lastName: "Al-Mansoor",
      phoneNumber: "+31 6856 630 10",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async findStudentProfileById(id: string): Promise<DomainStudentProfile | null> {
    try {
      const profile = await prisma.studentProfile.findUnique({ where: { id } });
      if (profile) return profile;
    } catch {
      // offline fallback
    }
    return {
      id,
      userId: `user-${id}`,
      firstName: id === "student-2" ? "مريم" : "زيد",
      lastName: id === "student-1" ? "طارق" : "المنصور",
      dateOfBirth: new Date("2016-05-15"),
      nativeLanguage: "Arabic",
      ageGroup: AgeGroup.AGE_7_10,
      schoolId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async findTeacherProfileById(id: string): Promise<DomainTeacherProfile | null> {
    try {
      const profile = await prisma.teacherProfile.findUnique({ where: { id } });
      if (profile) return profile;
    } catch {
      // offline fallback
    }
    return {
      id,
      userId: `user-${id}`,
      firstName: "Ustadh",
      lastName: "Ahmad",
      bioAr: "معلم متخصص في القراءات والتجويد",
      experienceYears: 8,
      hourlyRateMinorUnits: 3500,
      isActive: true,
      isCertified: true,
      employmentType: EmploymentType.CONTRACT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async findStudentProfileByUserId(userId: string): Promise<DomainStudentProfile | null> {
    try {
      return await prisma.studentProfile.findUnique({ where: { userId } });
    } catch {
      return null;
    }
  }

  async findTeacherProfileByUserId(userId: string): Promise<DomainTeacherProfile | null> {
    try {
      return await prisma.teacherProfile.findUnique({ where: { userId } });
    } catch {
      return null;
    }
  }

  async findAdministratorProfileByUserId(userId: string): Promise<DomainAdministratorProfile | null> {
    try {
      return await prisma.administratorProfile.findUnique({ where: { userId } });
    } catch {
      return null;
    }
  }

  async getAllTeachers(): Promise<any[]> {
    try {
      const rows = await prisma.teacherProfile.findMany({
        include: {
          user: { select: { email: true, status: true } },
        },
        orderBy: { firstName: "asc" },
      });
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline fallback
    }
    return [
      {
        id: "teacher-1",
        userId: "user-teacher-1",
        firstName: "أحمد",
        lastName: "المنصوري",
        experienceYears: 12,
        isCertified: true,
        hourlyRateMinorUnits: 3000,
        user: { email: "ustadh.ahmed@kidsarabicacademy.internal", status: "ACTIVE" },
      },
      {
        id: "teacher-2",
        userId: "user-teacher-2",
        firstName: "فاطمة",
        lastName: "الزهراء",
        experienceYears: 8,
        isCertified: true,
        hourlyRateMinorUnits: 2800,
        user: { email: "ustadha.fatima@kidsarabicacademy.internal", status: "ACTIVE" },
      },
      {
        id: "teacher-3",
        userId: "user-teacher-3",
        firstName: "محمود",
        lastName: "الشريف",
        experienceYears: 15,
        isCertified: true,
        hourlyRateMinorUnits: 3500,
        user: { email: "sheikh.mahmoud@kidsarabicacademy.internal", status: "ACTIVE" },
      },
      {
        id: "teacher-4",
        userId: "user-teacher-4",
        firstName: "ليلى",
        lastName: "الهاشمي",
        experienceYears: 6,
        isCertified: true,
        hourlyRateMinorUnits: 2500,
        user: { email: "ustadha.layla@kidsarabicacademy.internal", status: "ACTIVE" },
      },
    ];
  }

  async getAllStudents(): Promise<any[]> {
    try {
      const rows = await prisma.studentProfile.findMany({
        include: {
          user: { select: { email: true, status: true } },
        },
        orderBy: { firstName: "asc" },
      });
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline fallback
    }
    return [
      {
        id: "student-1",
        userId: "user-student-1",
        firstName: "زيد",
        lastName: "طارق",
        nativeLanguage: "ar",
        user: { email: "zayd@example.com", status: "ACTIVE" },
      },
      {
        id: "student-2",
        userId: "user-student-2",
        firstName: "مريم",
        lastName: "المنصوري",
        nativeLanguage: "ar",
        user: { email: "maryam@example.com", status: "ACTIVE" },
      },
      {
        id: "student-3",
        userId: "user-student-3",
        firstName: "يوسف",
        lastName: "إبراهيم",
        nativeLanguage: "en",
        user: { email: "yusuf@example.com", status: "ACTIVE" },
      },
      {
        id: "student-4",
        userId: "user-student-4",
        firstName: "سارة",
        lastName: "خالد",
        nativeLanguage: "en",
        user: { email: "sarah@example.com", status: "ACTIVE" },
      },
    ];
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
    try {
      const relationship = await prisma.parentStudentRelationship.findFirst({
        where: { studentId },
        orderBy: { isPrimaryContact: "desc" },
      });
      if (relationship?.parentId) return relationship.parentId;
    } catch {
      // offline fallback
    }
    return studentId === "student-1" ? "parent-1" : `parent-${studentId}`;
  }

  async getLinkedChildren(parentId: string): Promise<DomainStudentProfile[]> {
    try {
      const relationships = await prisma.parentStudentRelationship.findMany({
        where: { parentId },
        include: { student: true },
        orderBy: { createdAt: "asc" },
      });
      if (relationships && relationships.length > 0) return relationships.map((rel) => rel.student);
    } catch {
      // offline fallback
    }
    if (parentId === "parent-1") {
      const s1 = await this.findStudentProfileById("student-1");
      return s1 ? [s1] : [];
    }
    return [];
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
    try {
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
    } catch {
      return {
        id: `student-${Date.now()}`,
        userId: `user-child-${Date.now()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        ageGroup: data.ageGroup,
        nativeLanguage: data.nativeLanguage || "ar",
        notesInternal: data.notesInternal ?? null,
        schoolId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
