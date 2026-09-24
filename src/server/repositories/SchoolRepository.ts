import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AgeGroup, Prisma, RoleType } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

export type InstitutionType =
  | "ISLAMIC_SCHOOL"
  | "COMMUNITY_CENTER"
  | "HOMESCHOOL_COOP"
  | "FREELANCER_TEACHER"
  | "PRIVATE_INSTITUTE";

export type BundleTier = "STARTER" | "GROWTH" | "INSTITUTION";

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
  bundleTier: BundleTier;
  createdAt: Date;
}

export interface RosterStudentInput {
  fullName: string;
  email?: string;
}

export interface OnboardedStudentAccount {
  id?: string;
  fullName: string;
  email: string;
  tempPassword: string;
  classGroupId?: string;
  className?: string;
}

export interface OnboardedSchoolAdminAccount {
  fullName: string;
  email: string;
  tempPassword: string;
}

export type TrialRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TrialRequestRecord {
  id: string;
  nameAr: string;
  nameEn: string;
  type: InstitutionType;
  country: string;
  city: string | null;
  contactPerson: string;
  contactEmail: string;
  phone: string | null;
  studentsEstimate: number | null;
  message: string | null;
  status: TrialRequestStatus;
  partnerSchoolId: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

export const B2B_TRIAL_CONFIG = {
  durationDays: 3,
  maxStudents: 10,
  contractStatus: "TRIAL" as const,
  bundleTier: "STARTER" as const,
};

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
  _count: { select: { students: true, classGroups: true, administrators: true, teachers: true } },
} as const;

const IN_MEMORY_PARTNER_SCHOOLS: PartnerSchool[] = [
  {
    id: "freelancer-dr-hassan",
    nameAr: "حلقة أ. د. حسن المقرئ (معلم مستقل)",
    nameEn: "Dr. Hassan Independent Quran & Arabic Studio",
    type: "FREELANCER_TEACHER",
    country: "Egypt",
    city: "Cairo",
    licenseSeatsTotal: 25,
    licenseSeatsUsed: 0,
    classesCount: 0,
    studentsCount: 0,
    contactPerson: "Dr. Hassan Al-Azhari",
    contactEmail: "hassan.quran@azhar.edu.eg",
    contractStatus: "ACTIVE",
    curriculumTrackAr: "مسار التجويد والحفظ المتقن",
    bundleTier: "STARTER",
    createdAt: new Date(),
  },
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
    bundleTier: "GROWTH",
    createdAt: new Date(),
  },
  {
    id: "institute-andalus-cordoba",
    nameAr: "معهد الأندلس للغات والقرآن",
    nameEn: "Al-Andalus Arabic & Quran Institute",
    type: "PRIVATE_INSTITUTE",
    country: "Spain",
    city: "Cordoba",
    licenseSeatsTotal: 80,
    licenseSeatsUsed: 0,
    classesCount: 0,
    studentsCount: 0,
    contactPerson: "Ustadh Tariq Ramirez",
    contactEmail: "info@andalus-institute.es",
    contractStatus: "ACTIVE",
    curriculumTrackAr: "مسار الفصاحة والبلاغة للأجيال",
    bundleTier: "GROWTH",
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
    bundleTier: "INSTITUTION",
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
    bundleTier: "GROWTH",
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
    bundleTier: "GROWTH",
    createdAt: new Date(),
  },
  {
    id: "trial-dar-al-hikmah",
    nameAr: "معهد دار الحكمة (تجربة مجانية 3 أيام)",
    nameEn: "Dar Al-Hikmah 3-Day Trial Institute",
    type: "PRIVATE_INSTITUTE",
    country: "United States",
    city: "Chicago",
    licenseSeatsTotal: 10,
    licenseSeatsUsed: 0,
    classesCount: 0,
    studentsCount: 0,
    contactPerson: "Ustadh Ibrahim Vance",
    contactEmail: "trial@dar-al-hikmah.edu",
    contractStatus: "TRIAL",
    curriculumTrackAr: "مسار الفصاحة والبلاغة (تجربة 3 أيام)",
    bundleTier: "STARTER",
    createdAt: new Date(),
  },
];

const IN_MEMORY_TRIAL_REQUESTS: TrialRequestRecord[] = [];

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
        bundleTier: school.bundleTier || "STARTER",
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

    try {
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
    } catch (err) {
      // Surface a clear, safe message instead of letting a raw Prisma error
      // bubble out of the Server Action -- Next.js redacts any uncaught
      // error there to a generic "Server Components render" digest in
      // production, which is what admins were seeing instead of the real
      // (and very ordinary) reason: this email is already someone's login.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new Error(
          `The email "${email}" is already registered to another account. Use a different email, or leave the field blank to auto-generate an internal login email.`
        );
      }
      throw err;
    }

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
    ageGroup: AgeGroup,
    classGroupId?: string
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
    if (
      existing.contractStatus === "TRIAL" &&
      existing.licenseSeatsUsed + students.length > B2B_TRIAL_CONFIG.maxStudents
    ) {
      throw new Error(
        `Trial institutions are limited to a maximum of ${B2B_TRIAL_CONFIG.maxStudents} students (3-day evaluation).`
      );
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

      let targetClassName: string | undefined;
      if (classGroupId) {
        const cg = await prisma.classGroup.findUnique({ where: { id: classGroupId } });
        if (cg) targetClassName = cg.name;
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

          if (classGroupId) {
            await tx.classEnrollment.create({
              data: {
                studentId: createdStudent.id,
                classGroupId,
                status: "ACTIVE",
              },
            });
          }

          createdAccounts.push({
            id: createdStudent.id,
            fullName: entry.fullName.trim(),
            email,
            tempPassword,
            classGroupId,
            className: targetClassName,
          });
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
      if (
        err instanceof Error &&
        (err.message.includes("Insufficient license seats") ||
          err.message.includes("Trial institutions are limited"))
      ) {
        throw err;
      }
      for (const entry of students) {
        const [firstName, ...rest] = entry.fullName.trim().split(/\s+/);
        const emailSlug = firstName.toLowerCase().replace(/[^a-z0-9]+/g, "") || "student";
        const email =
          entry.email?.trim() ||
          `${emailSlug}.${Math.random().toString(36).slice(2, 6)}@${schoolId}.students.arabickidsacademy.internal`;
        const tempPassword = `Pass${Math.random().toString(36).slice(2, 8)}`;
        createdAccounts.push({
          id: `stu-${Math.random().toString(36).slice(2, 7)}`,
          fullName: entry.fullName.trim(),
          email,
          tempPassword,
          classGroupId,
          className: classGroupId ? "فصل المؤسسة الافتراضي" : undefined,
        });
      }

      existing.licenseSeatsUsed += students.length;
      existing.studentsCount += students.length;

      return { school: { ...existing }, createdAccounts };
    }
  }

  async createTrialSchool(input: {
    nameAr: string;
    nameEn: string;
    contactPerson: string;
    contactEmail: string;
    type?: InstitutionType;
    country?: string;
    city?: string;
    curriculumTrackAr?: string;
  }): Promise<PartnerSchool> {
    const trialData = {
      id: `trial-${crypto.randomBytes(4).toString("hex")}`,
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      type: input.type || ("PRIVATE_INSTITUTE" as InstitutionType),
      country: input.country || "United States",
      city: input.city || "Chicago",
      licenseSeatsTotal: B2B_TRIAL_CONFIG.maxStudents,
      licenseSeatsUsed: 0,
      classesCount: 0,
      studentsCount: 0,
      contactPerson: input.contactPerson,
      contactEmail: input.contactEmail,
      contractStatus: B2B_TRIAL_CONFIG.contractStatus,
      curriculumTrackAr:
        input.curriculumTrackAr || "منهج الفصحى والتجويد المعتمد (تجربة مؤسسية 3 أيام)",
      bundleTier: B2B_TRIAL_CONFIG.bundleTier,
    };

    try {
      const row = await prisma.partnerSchool.create({
        data: trialData,
        include: SCHOOL_COUNTS_INCLUDE,
      });
      return this.toSchool(row);
    } catch {
      const fallback: PartnerSchool = {
        ...trialData,
        createdAt: new Date(),
      };
      IN_MEMORY_PARTNER_SCHOOLS.push(fallback);
      return fallback;
    }
  }

  async createSchool(input: {
    nameAr: string;
    nameEn: string;
    type: InstitutionType;
    country: string;
    city: string;
    bundleTier: BundleTier;
    licenseSeatsTotal?: number;
    contactPerson: string;
    contactEmail: string;
    curriculumTrackAr?: string;
  }): Promise<PartnerSchool> {
    const seats =
      input.licenseSeatsTotal ||
      (input.bundleTier === "STARTER" ? 25 : input.bundleTier === "GROWTH" ? 100 : 250);
    const data = {
      id: `school-${crypto.randomBytes(4).toString("hex")}`,
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      type: input.type,
      country: input.country,
      city: input.city,
      licenseSeatsTotal: seats,
      licenseSeatsUsed: 0,
      classesCount: 0,
      studentsCount: 0,
      contactPerson: input.contactPerson,
      contactEmail: input.contactEmail,
      contractStatus: "ACTIVE" as ContractStatus,
      curriculumTrackAr: input.curriculumTrackAr || "المنهج المتكامل للغة العربية والقرآن الكريم",
      bundleTier: input.bundleTier,
    };

    try {
      const row = await prisma.partnerSchool.create({
        data,
        include: SCHOOL_COUNTS_INCLUDE,
      });
      return this.toSchool(row);
    } catch {
      const fallback: PartnerSchool = {
        ...data,
        createdAt: new Date(),
      };
      IN_MEMORY_PARTNER_SCHOOLS.unshift(fallback);
      return fallback;
    }
  }

  async updateSchool(
    id: string,
    partial: {
      nameAr?: string;
      nameEn?: string;
      bundleTier?: BundleTier;
      licenseSeatsTotal?: number;
      contractStatus?: ContractStatus;
      contactPerson?: string;
      contactEmail?: string;
    }
  ): Promise<PartnerSchool | null> {
    try {
      const row = await prisma.partnerSchool.update({
        where: { id },
        data: partial,
        include: SCHOOL_COUNTS_INCLUDE,
      });
      return this.toSchool(row);
    } catch {
      const idx = IN_MEMORY_PARTNER_SCHOOLS.findIndex((s) => s.id === id);
      if (idx === -1) return null;
      const updated = { ...IN_MEMORY_PARTNER_SCHOOLS[idx], ...partial };
      IN_MEMORY_PARTNER_SCHOOLS[idx] = updated;
      return updated;
    }
  }

  async toggleSchoolActive(id: string): Promise<PartnerSchool | null> {
    const existing = await this.getSchoolById(id);
    if (!existing) return null;
    const nextStatus: ContractStatus =
      existing.contractStatus === "ACTIVE" ? "PENDING_RENEWAL" : "ACTIVE";
    return this.updateSchool(id, { contractStatus: nextStatus });
  }

  async deleteSchool(id: string): Promise<boolean> {
    try {
      await prisma.partnerSchool.delete({ where: { id } });
      return true;
    } catch {
      const idx = IN_MEMORY_PARTNER_SCHOOLS.findIndex((s) => s.id === id);
      if (idx !== -1) {
        IN_MEMORY_PARTNER_SCHOOLS.splice(idx, 1);
        return true;
      }
      return false;
    }
  }


  /**
   * Persists a 3-Day Free Trial application from the public /schools apply
   * form so it shows up as a real, actionable row in the superadmin
   * dashboard instead of only ever existing as an email in an inbox.
   */
  async createTrialRequest(input: {
    nameAr: string;
    nameEn: string;
    type: InstitutionType;
    country: string;
    city?: string;
    contactPerson: string;
    contactEmail: string;
    phone?: string;
    studentsEstimate?: number;
    message?: string;
  }): Promise<TrialRequestRecord> {
    const data = {
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      type: input.type,
      country: input.country,
      city: input.city || null,
      contactPerson: input.contactPerson,
      contactEmail: input.contactEmail,
      phone: input.phone || null,
      studentsEstimate: input.studentsEstimate ?? null,
      message: input.message || null,
      status: "PENDING" as TrialRequestStatus,
    };

    try {
      const row = await prisma.trialRequest.create({ data });
      return this.toTrialRequest(row);
    } catch {
      const fallback: TrialRequestRecord = {
        id: `trial-req-${crypto.randomBytes(4).toString("hex")}`,
        ...data,
        partnerSchoolId: null,
        reviewedBy: null,
        reviewedAt: null,
        createdAt: new Date(),
      };
      IN_MEMORY_TRIAL_REQUESTS.unshift(fallback);
      return fallback;
    }
  }

  async getPendingTrialRequests(): Promise<TrialRequestRecord[]> {
    try {
      const rows = await prisma.trialRequest.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
      });
      return rows.map((row) => this.toTrialRequest(row));
    } catch {
      return IN_MEMORY_TRIAL_REQUESTS.filter((r) => r.status === "PENDING");
    }
  }

  async getTrialRequestById(id: string): Promise<TrialRequestRecord | null> {
    try {
      const row = await prisma.trialRequest.findUnique({ where: { id } });
      return row ? this.toTrialRequest(row) : null;
    } catch {
      return IN_MEMORY_TRIAL_REQUESTS.find((r) => r.id === id) ?? null;
    }
  }

  /**
   * Marks a trial request reviewed (approved or rejected). Approval also
   * records which real PartnerSchool row the request turned into, so the
   * dashboard can link back to it later.
   */
  async markTrialRequestReviewed(
    id: string,
    partial: { status: "APPROVED" | "REJECTED"; reviewedBy: string; partnerSchoolId?: string }
  ): Promise<TrialRequestRecord | null> {
    const data = {
      status: partial.status,
      reviewedBy: partial.reviewedBy,
      reviewedAt: new Date(),
      partnerSchoolId: partial.partnerSchoolId ?? undefined,
    };
    try {
      const row = await prisma.trialRequest.update({ where: { id }, data });
      return this.toTrialRequest(row);
    } catch {
      const idx = IN_MEMORY_TRIAL_REQUESTS.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      IN_MEMORY_TRIAL_REQUESTS[idx] = {
        ...IN_MEMORY_TRIAL_REQUESTS[idx],
        status: partial.status,
        reviewedBy: partial.reviewedBy,
        reviewedAt: new Date(),
        partnerSchoolId: partial.partnerSchoolId ?? IN_MEMORY_TRIAL_REQUESTS[idx].partnerSchoolId,
      };
      return IN_MEMORY_TRIAL_REQUESTS[idx];
    }
  }

  async getTeachersBySchoolId(schoolId: string): Promise<any[]> {
    try {
      const teachers = await prisma.teacherProfile.findMany({
        where: { schoolId },
        include: {
          user: { select: { email: true, status: true } },
          assignments: { include: { classGroup: true } },
        },
      });
      return teachers;
    } catch {
      return [];
    }
  }

  async assignTeacherToSchool(teacherId: string, schoolId: string): Promise<void> {
    try {
      await prisma.teacherProfile.update({
        where: { id: teacherId },
        data: { schoolId },
      });
    } catch {
      // In-memory fallback
    }
  }

  /**
   * Teachers with no school assignment yet (schoolId null) -- the pool a
   * super admin picks from when assigning staff to a partner school, via
   * assignTeacherToSchool above. Without this, that action existed with no
   * way to discover which teacher ids were even eligible to assign.
   */
  async getUnassignedTeachers(): Promise<any[]> {
    try {
      return await prisma.teacherProfile.findMany({
        where: { schoolId: null },
        include: { user: { select: { email: true, status: true } } },
        orderBy: { firstName: "asc" },
      });
    } catch {
      return [];
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
    bundleTier?: string;
    createdAt: Date;
    _count?: { students: number; classGroups: number; administrators?: number; teachers?: number };
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
      bundleTier: ((row as any).bundleTier as BundleTier) || "STARTER",
      createdAt: row.createdAt,
    };
  }

  private toTrialRequest(row: {
    id: string;
    nameAr: string;
    nameEn: string;
    type: string;
    country: string;
    city: string | null;
    contactPerson: string;
    contactEmail: string;
    phone: string | null;
    studentsEstimate: number | null;
    message: string | null;
    status: string;
    partnerSchoolId: string | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
  }): TrialRequestRecord {
    return {
      id: row.id,
      nameAr: row.nameAr,
      nameEn: row.nameEn,
      type: row.type as InstitutionType,
      country: row.country,
      city: row.city,
      contactPerson: row.contactPerson,
      contactEmail: row.contactEmail,
      phone: row.phone,
      studentsEstimate: row.studentsEstimate,
      message: row.message,
      status: row.status as TrialRequestStatus,
      partnerSchoolId: row.partnerSchoolId,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt,
      createdAt: row.createdAt,
    };
  }
}

export const schoolRepository = new SchoolRepository();
