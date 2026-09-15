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

class SchoolRepository {
  async getAllSchools(): Promise<PartnerSchool[]> {
    const rows = await prisma.partnerSchool.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((row) => this.toSchool(row));
  }

  async getSchoolById(id: string): Promise<PartnerSchool | null> {
    const row = await prisma.partnerSchool.findUnique({ where: { id } });
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
    });
    return this.toSchool(row);
  }

  async allocateSeats(schoolId: string, additionalSeats: number): Promise<PartnerSchool> {
    const existing = await prisma.partnerSchool.findUnique({ where: { id: schoolId } });
    if (!existing) throw new Error(`School not found: ${schoolId}`);

    const row = await prisma.partnerSchool.update({
      where: { id: schoolId },
      data: { licenseSeatsTotal: { increment: additionalSeats } },
    });
    return this.toSchool(row);
  }

  async onboardStudents(schoolId: string, count: number): Promise<PartnerSchool> {
    const existing = await prisma.partnerSchool.findUnique({ where: { id: schoolId } });
    if (!existing) throw new Error(`School not found: ${schoolId}`);
    if (existing.licenseSeatsUsed + count > existing.licenseSeatsTotal) {
      throw new Error(
        `Insufficient license seats. Available: ${existing.licenseSeatsTotal - existing.licenseSeatsUsed}, Requested: ${count}`
      );
    }

    const row = await prisma.partnerSchool.update({
      where: { id: schoolId },
      data: {
        licenseSeatsUsed: { increment: count },
        studentsCount: { increment: count },
      },
    });
    return this.toSchool(row);
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
      studentsCount: row.studentsCount,
      contactPerson: row.contactPerson,
      contactEmail: row.contactEmail,
      contractStatus: row.contractStatus as ContractStatus,
      curriculumTrackAr: row.curriculumTrackAr,
      createdAt: row.createdAt,
    };
  }
}

export const schoolRepository = new SchoolRepository();
