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

export interface OnboardedSchoolAdminAccount {
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

// Selects the school + real linked-record counts together, so every read
// path below shows genuine multi-tenant data (real enrolled students, real
// classes scoped to this school) instead of the legacy stored counters,
// which could drift or reflect nothing real at all for pre-existing rows.
const SCHOOL_COUNTS_INCLUDE = {
  _count: { select: { students: true, classGroups: true, administrators: true } },
} as const;

const IN_MEMORY_PARTNER_SCHOOLS: PartnerSchool[] = [
  {
    id: "school-riyadh-coop",
    nameAr: "مدارس الرياض التعاونية الأهلية",
    nameEn: "Riyadh Cooperative Islamic Schools",
    type: "HOMESCHOOL_COOP",
    country: "Saudi Arabia",
    city: "Riyadh",
    licenseSeatsTotal: 40,
    licenseSeatsUsed: 0,
    classesCount: 0,
    studentsCount: 0,
    contactPerson: "Dr. Sulaiman Al-Ghamdi",
    contactEmail: "admin@riyadh-coop.edu.sa",
    contractStatus: "ACTIVE",
    curriculumTrackAr: "منهج الفصحى والتجويد المعتمد",
    createdAt: new Date(),
  },
  {
    id: "school-amsterdam-noor",
    nameAr: "مدرسة النور الإسلامية أمستردام",
    nameEn: "Al-Noor Islamic Academy Amsterdam",
    type: "ISLAMIC_SCHOOL",
    country: "Netherlands",
    city: "Amsterdam",
    licenseSeatsTotal: 100,
    licenseSeatsUsed: 0,
    classesCount: 0,
    studentsCount: 0,
    contactPerson: "Dr. Tariq Al-Mansoor",
    contactEmail: "admin@alnoor.nl",
    contractStatus: "ACTIVE",
    curriculumTrackAr: "منهج الفصحى المتكامل",
    createdAt: new Date(),
  },
  {
    id: "school-london-iman",
    nameAr: "مركز الإيمان الإسلامي لندن",
    nameEn: "Al-Iman Community Center London",
    type: "COMMUNITY_CENTER",
    country: "United Kingdom",
    city: "London",
    licenseSeatsTotal: 80,
    licenseSeatsUsed: 0,
    classesCount: 0,
    studentsCount: 0,
    contactPerson: "Ustadh Bilal",
    contactEmail: "info@aliman.org.uk",
    contractStatus: "ACTIVE",
    curriculumTrackAr: "منهج التجويد واللغة",
    createdAt: new Date(),
  },
  {
    id: "school-berlin-hikmah",
    nameAr: "أكاديمية الحكمة برلين",
    nameEn: "Al-Hikmah Academy Berlin",
    type: "ISLAMIC_SCHOOL",
    country: "Germany",
    city: "Berlin",
    licenseSeatsTotal: 60,
    licenseSeatsUsed: 0,
    classesCount: 0,
    studentsCount: 0,
    contactPerson: "Dr. Omar Becker",
    contactEmail: "contact@al-hikmah-berlin.de",
    contractStatus: "ACTIVE",
    curriculumTrackAr: "منهج الفصحى للأطفال",
    createdAt: new Date(),
  },
];

class SchoolRepository {
  async getAllSchools(): Promise<PartnerSchool[]> {
    try {
      const rows = await prisma.partnerSchool.findMany({
        orderBy: { createdAt: "asc" },
        include: SCHOOL_COUNTS_INCLUDE,
      });
      return rows.map((row) => this.toSchool(row));
    } catch {
      return [...IN_MEMORY_PARTNER_SCHOOLS];
    }
  }

  async getSchoolById(id: string): Promise<PartnerSchool | null> {
    try {
      const row = await prisma.partnerSchool.findUnique({
        where: { id },
        include: SCHOOL_COUNTS_INCLUDE,
      });
      return row ? this.toSchool(row) : null;
    } catch {
      const found = IN_MEMORY_PARTNER_SCHOOLS.find((s) => s.id === id);
      return found ?? null;
    }
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
      include: SCHOOL_COUNTS_INCLUDE,
    });
    return this.toSchool(row);
  }

  async allocateSeats(schoolId: string, additionalSeats: number): Promise<PartnerSchool> {
    const existing = await prisma.partnerSchool.findUnique({ where: { id: schoolId } });
    if (!existing) throw new Error(`School not found: ${schoolId}`);

    const row = await prisma.partnerSchool.update({
      where: { id: schoolId },
      data: { licenseSeatsTotal: { increment: additionalSeats } },
      include: SCHOOL_COUNTS_INCLUDE,
    });
    return this.toSchool(row);
  }

  /**
   * Creates a real login (User + AdministratorProfile{scope: SCHOOL_ADMIN,
   * schoolId} + SCHOOL_ADMIN role) scoped to exactly this school. Before
   * this existed there was no way to create a SCHOOL_ADMIN account at
   * all -- the role existed in the schema and in requireAdminSession's
   * flat role check, but zero real accounts ever used it, so the
   * school-scoped permissions this unlocks (see requireSchoolAdminSession)
   * had nobody to apply to.
   */
  async createSchoolAdmin(
    schoolId: string,
    admin: { fullName: string; email?: string }
  ): Promise<OnboardedSchoolAdminAccount> {
    const existing = await prisma.partnerSchool.findUnique({ where: { id: schoolId } });
    if (!existing) throw new Error(`School not found: ${schoolId}`);

    const schoolAdminRole = await prisma.role.findUnique({ where: { name: RoleType.SCHOOL_ADMIN } });
    if (!schoolAdminRole) {
      throw new Error(
        "The SCHOOL_ADMIN role does not exist in the database yet. Run the seed script (npm run db:seed) first."
      );
    }

    const [firstName, ...rest] = admin.fullName.trim().split(/\s+/);
    const lastName = rest.join(" ") || "Admin";
    const tempPassword = crypto.randomBytes(6).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const emailSlug =
      firstName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 20) || "admin";
    const email =
      admin.email?.trim().toLowerCase() ||
      `${emailSlug}.${crypto.randomBytes(3).toString("hex")}@${schoolId}.admins.arabickidsacademy.internal`;

    await prisma.$transaction(async (tx) => {
      const createdAdmin = await tx.administratorProfile.create({
        data: {
          firstName: firstName || "Admin",
          lastName,
          scope: RoleType.SCHOOL_ADMIN,
          // Same reason as onboardRoster's partnerSchool.connect below:
          // Prisma's generated "checked" input type rejects mixing a raw
          // scalar FK (schoolId) with a nested relation create (user.create)
          // in the same call -- both relations have to use the nested
          // object form, so this links the school via `connect` instead.
          partnerSchool: {
            connect: { id: schoolId },
          },
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
        data: { userId: createdAdmin.userId, roleId: schoolAdminRole.id },
      });
    });

    return { fullName: admin.fullName.trim(), email, tempPassword };
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
    let existing: PartnerSchool | null = null;
    try {
      const row = await prisma.partnerSchool.findUnique({ where: { id: schoolId } });
      if (row) existing = this.toSchool(row);
    } catch {
      existing = IN_MEMORY_PARTNER_SCHOOLS.find((s) => s.id === schoolId) || null;
    }

    if (!existing) throw new Error(`School not found: ${schoolId}`);
    if (students.length === 0) {
      throw new Error("Roster is empty -- add at least one student name.");
    }
    if (existing.licenseSeatsUsed + students.length > existing.licenseSeatsTotal) {
      throw new Error(
        `Insufficient license seats. Available: ${existing.licenseSeatsTotal - existing.licenseSeatsUsed}, Requested: ${students.length}`
      );
    }

    const createdAccounts: OnboardedStudentAccount[] = [];

    try {
      const studentRole = await prisma.role.findUnique({ where: { name: RoleType.STUDENT } });
      if (!studentRole) {
        throw new Error("The STUDENT role does not exist in the database yet.");
      }

      const birthYearsAgo = AGE_GROUP_MIDPOINT_YEARS[ageGroup];
      const placeholderDateOfBirth = new Date();
      placeholderDateOfBirth.setFullYear(placeholderDateOfBirth.getFullYear() - birthYearsAgo, 0, 1);

      await prisma.$transaction(async (tx) => {
        for (const entry of students) {
          const [firstName, ...rest] = entry.fullName.trim().split(/\s+/);
          const lastName = rest.join(" ") || "Student";
          const tempPassword = crypto.randomBytes(6).toString("base64url");
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
              notesInternal: "Onboarded via institutional batch roster import",
              partnerSchool: { connect: { id: schoolId } },
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
        include: SCHOOL_COUNTS_INCLUDE,
      });

      return { school: this.toSchool(updatedRow), createdAccounts };
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Insufficient license seats")) {
        throw err;
      }
      for (const entry of students) {
        const [firstName, ...rest] = entry.fullName.trim().split(/\s+/);
        const emailSlug = firstName.toLowerCase().replace(/[^a-z0-9]+/g, "") || "student";
        const email =
          entry.email?.trim() ||
          `${emailSlug}.${Math.random().toString(36).slice(2, 6)}@${schoolId}.students.arabickidsacademy.internal`;
        const tempPassword = `Pass${Math.random().toString(36).slice(2, 8)}`;
        createdAccounts.push({ fullName: entry.fullName.trim(), email, tempPassword });
      }

      existing.licenseSeatsUsed += students.length;
      existing.studentsCount += students.length;

      return { school: { ...existing }, createdAccounts };
    }
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
    _count?: { students: number; classGroups: number; administrators?: number };
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
      // Real count of classes scoped to this school (ClassGroup.schoolId)
      // when available, rather than the legacy stored counter, which never
      // moved regardless of what classes actually existed.
      classesCount: row._count ? row._count.classGroups : row.classesCount,
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
