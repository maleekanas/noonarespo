import { AgeGroup } from "@prisma/client";
import {
  schoolRepository,
  PartnerSchool,
  RosterStudentInput,
  OnboardedStudentAccount,
} from "../repositories/SchoolRepository";

export interface InstitutionalOverviewKPIs {
  totalPartners: number;
  totalSeatsLicensed: number;
  totalSeatsUsed: number;
  overallUtilizationPercentage: number;
  totalInstitutionalClasses: number;
  totalEnrolledStudents: number;
}

export class SchoolService {
  async getAllSchools(): Promise<PartnerSchool[]> {
    return schoolRepository.getAllSchools();
  }

  async getSchoolDetails(id: string): Promise<PartnerSchool | null> {
    return schoolRepository.getSchoolById(id);
  }

  async getInstitutionalKPIs(): Promise<InstitutionalOverviewKPIs> {
    const schools = await schoolRepository.getAllSchools();
    const totalPartners = schools.length;
    const totalSeatsLicensed = schools.reduce((acc, s) => acc + s.licenseSeatsTotal, 0);
    const totalSeatsUsed = schools.reduce((acc, s) => acc + s.licenseSeatsUsed, 0);
    const totalInstitutionalClasses = schools.reduce((acc, s) => acc + s.classesCount, 0);
    const totalEnrolledStudents = schools.reduce((acc, s) => acc + s.studentsCount, 0);

    const overallUtilizationPercentage =
      totalSeatsLicensed > 0
        ? Math.round((totalSeatsUsed / totalSeatsLicensed) * 100)
        : 0;

    return {
      totalPartners,
      totalSeatsLicensed,
      totalSeatsUsed,
      overallUtilizationPercentage,
      totalInstitutionalClasses,
      totalEnrolledStudents,
    };
  }

  /**
   * Creates a real student account for every name in the roster and links
   * it to the school -- see SchoolRepository.onboardRoster for why this
   * used to just be a counter increment.
   */
  async onboardBatchRoster(params: {
    schoolId: string;
    students: RosterStudentInput[];
    ageGroup: AgeGroup;
  }): Promise<{
    school: PartnerSchool;
    createdAccounts: OnboardedStudentAccount[];
    messageAr: string;
    messageEn: string;
  }> {
    const { school, createdAccounts } = await schoolRepository.onboardRoster(
      params.schoolId,
      params.students,
      params.ageGroup
    );

    return {
      school,
      createdAccounts,
      messageAr: `تم إنشاء ${createdAccounts.length} حساب طالب حقيقي بنجاح في ${school.nameAr}. المقاعد المتبقية: ${school.licenseSeatsTotal - school.licenseSeatsUsed}`,
      messageEn: `${createdAccounts.length} real student accounts were created in ${school.nameEn}. Remaining seats: ${school.licenseSeatsTotal - school.licenseSeatsUsed}`,
    };
  }

  async allocateAdditionalSeats(params: {
    schoolId: string;
    additionalSeats: number;
  }): Promise<PartnerSchool> {
    return schoolRepository.allocateSeats(params.schoolId, params.additionalSeats);
  }
}

export const schoolService = new SchoolService();
