import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AgeGroup, RoleType } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

export type InstitutionType =
  | "ISLAMIC_SCHOOL"
  | "COMMUNITY_CENTER"
  | "HOMESCHOOL_COOP";

export type ContractStatus = "ACTIVE" | "PENDING_RENEWAL" | "TRIAL";

export interface PartnerSchool {
  id: string;
  nameAr: string;
  nameEn: string;
  type: InstitutionType;
  country: string;
  city: string;
  licenseSeatsTotal: number;
  licenseSeatsUsed: number;
  classesCount: number;
  studentsCount: number;
  contactPerson: string;
  contactEmail: string;
  contractStatus: ContractStatus;
  curriculumTrackAr: string;
  createdAt: Date;
}

export interface RosterStudentInput {
  fullName: string;
  email?: string;
}

export interface OnboardedStudentAccount {
  fullName: string;
  email: string;
  tempPassword: string;
}

// Rough midpoint age used only to seed a placeholder date of birth for
// institutional roster imports, which supply an age band rather than an
// exact birthdate. Flagged on the profile via notesInternal so staff know
// to correct it once the real birthdate is available.
const AGE_GROUP_MIDPOINT_YEARS: Record<AgeGroup, number> = {
  AGE_4_6: 5,
  AGE_7_10: 8,
  AGE_11_13: 12,
  AGE_14_16: 15,
};

class SchoolRepository {
  async getAllSchools(): Promise<PartnerSchool[]> {
    const rows = await prisma.partnerSchool.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { students: true } } },
    });
    return rows.map((row) => this.toSchool(row));
  }

  async getSchoolById(id: string): Promise<PartnerSchool | null> {
    const row = await prisma.partnerSchool.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    });
    return row ? this.toSchool(row) : null;
  }

  async addSchool(school: PartnerSchool): Promise<PartnerSchool> {
    const row = await prisma.partnerSchool.create({
      data: {
        id: school.id,
        nameAr: school.nameAr,
        nameEn: school.nameEn,
        type: school.type,
        country: school.country,
        city: school.city,
        licenseSeatsTotal: school.licenseSeatsTotal,
        licenseSeatsUsed: school.licenseSeatsUsed,
        classesCount: school.classesCount,
        studentsCount: school.studentsCount,
        contactPerson: school.contactPerson,
        contactEmail: school.contactEmail,
        contractStatus: school.contractStatus,
        curriculumTrackAr: school.curriculumTrackAr,
        createdAt: school.createdAt,
      },
      include: { _count: { select: { students: true } } },
    });
    return this.toSchool(row);
  }

  async allocateSeats(schoolId: string, additionalSeats: number): Promise<PartnerSchool> {
    const existing = await prisma.partnerSchool.findUnique({ where: { id: schoolId } });
    if (!existing) throw new Error(`School not found: ${schoolId}`);

    const row = await prisma.partnerSchool.update({
      where: { id: schoolId },
      data: { licenseSeatsTotal: { increment: additionalSeats } },
      include: { _count: { select: { students: true } } },
    });
    return this.toSchool(row);
  }

  /**
   * Creates a real login (User + StudentProfile + STUDENT role) for every
   * name in the roster, linked to this school via schoolId. This replaces
   * the previous behaviour, which only incremented a counter and never
   * created an actual account -- a school that "onboarded" 30 students
   * this way had 30 nonexistent logins and 0 real students. There is no
   * parent on these accounts (institutional students are managed by the
   * school admin, not an individual parent) -- the generated credentials
   * are returned here so the admin can hand them out.
   */
  async onboardRoster(
    schoolId: string,
    students: RosterStudentInput[],
    ageGroup: AgeGroup
  ): Promise<{ school: PartnerSchool; createdAccounts: OnboardedStudentAccount[] }> {
    const existing = await prisma.partnerSchool.findUnique({ where: { id: schoolId } });
    if (!existing) throw new Error(`School not found: ${schoolId}`);
    if (students.length === 0) {
      throw new Error("Roster is empty -- add at least one student name.");
    }
    if (existing.licenseSeatsUsed + students.length > existing.licenseSeatsTotal) {
      throw new Error(
        `Insufficient license seats. Available: ${existing.licenseSeatsTotal - existing.licenseSeatsUsed}, Requested: ${students.length}`
      );
    }

    const studentRole = await prisma.role.findUnique({ where: { name: RoleType.STUDENT } });
    if (!studentRole) {
      throw new Error(
        "The STUDENT role does not exist in the database yet. Run the seed script (npm run db:seed) first."
      );
    }

    const birthYearsAgo = AGE_GROUP_MIDPOINT_YEARS[ageGroup];
    const placeholderDateOfBirth = new Date();
    placeholderDateOfBirth.setFullYear(placeholderDateOfBirth.getFullYear() - birthYearsAgo, 0, 1);

    const createdAccounts: OnboardedStudentAccount[] = [];

    await prisma.$transaction(async (tx) => {
      for (const entry of students) {
        const [firstName, ...rest] = entry.fullName.trim().split(/\s+/);
        const lastName = rest.join(" ") || "Student";
        const tempPassword = crypto.randomBytes(6).toString("base64url"); // ~8 readable chars, handed to the school admin once
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        const emailSlug =
          firstName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "")
            .slice(0, 20) || "student";
        const email =
          entry.email?.trim() ||
          `${emailSlug}.${crypto.randomBytes(3).toString("hex")}@${schoolId}.students.arabickidsacademy.internal`;

        const createdStudent = await tx.studentProfile.create({
          data: {
            firstName: firstName || "Student",
            lastName,
            dateOfBirth: placeholderDateOfBirth,
            ageGroup,
            nativeLanguage: "ar",
            schoolId,
            notesInternal:
              "Onboarded via institutional batch roster import -- birthdate is a placeholder derived from the selected age band; confirm the real birthdate with the school.",
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

        createdAccounts.push({ fullName: entry.fullName.trim(), email, tempPassword });
      }

      await tx.partnerSchool.update({
        where: { id: schoolId },
        data: { licenseSeatsUsed: { increment: students.length } },
      });
    });

    const updatedRow = await prisma.partnerSchool.findUniqueOrThrow({
      where: { id: schoolId },
      include: { _count: { select: { students: true } } },
    });

    return { school: this.toSchool(updatedRow), createdAccounts };
  }

  private toSchool(row: {
    id: string;
    nameAr: string;
    nameEn: string;
    type: string;
    country: string;
    city: string;
    licenseSeatsTotal: number;
    licenseSeatsUsed: number;
    classesCount: number;
    studentsCount: number;
    contactPerson: string;
    contactEmail: string;
    contractStatus: string;
    curriculumTrackAr: string;
    createdAt: Date;
    _count?: { students: number };
  }): PartnerSchool {
    return {
      id: row.id,
      nameAr: row.nameAr,
      nameEn: row.nameEn,
      type: row.type as InstitutionType,
      country: row.country,
      city: row.city,
      licenseSeatsTotal: row.licenseSeatsTotal,
      licenseSeatsUsed: row.licenseSeatsUsed,
      classesCount: row.classesCount,
      // Real count of linked student accounts when available, rather than the
      // legacy stored counter, which could drift or (for pre-existing seed
      // rows) reflect nothing real at all.
      studentsCount: row._count ? row._count.students : row.studentsCount,
      contactPerson: row.contactPerson,
      contactEmail: row.contactEmail,
      contractStatus: row.contractStatus as ContractStatus,
      curriculumTrackAr: row.curriculumTrackAr,
      createdAt: row.createdAt,
    };
  }
}

export const schoolRepository = new SchoolRepository();
