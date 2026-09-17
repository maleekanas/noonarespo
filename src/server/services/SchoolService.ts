import { AgeGroup } from "@prisma/client";
import {
  schoolRepository,
  PartnerSchool,
  RosterStudentInput,
  OnboardedStudentAccount,
  OnboardedSchoolAdminAccount,
} from "../repositories/SchoolRepository";
import { getDictionary } from "@/lib/localization";

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
    locale?: string;
  }): Promise<{
    school: PartnerSchool;
    createdAccounts: OnboardedStudentAccount[];
    feedback: string;
  }> {
    const { school, createdAccounts } = await schoolRepository.onboardRoster(
      params.schoolId,
      params.students,
      params.ageGroup
    );

    const locale = params.locale || "ar";
    const isAr = locale === "ar";
    const dict = getDictionary(locale);
    const schoolName = isAr ? school.nameAr : school.nameEn;
    const feedback = dict.schoolManagementClient.onboardFeedbackTemplate
      .replace("{count}", String(createdAccounts.length))
      .replace("{schoolName}", schoolName)
      .replace("{seats}", String(school.licenseSeatsTotal - school.licenseSeatsUsed));

    return {
      school,
      createdAccounts,
      feedback,
    };
  }

  async allocateAdditionalSeats(params: {
    schoolId: string;
    additionalSeats: number;
  }): Promise<PartnerSchool> {
    return schoolRepository.allocateSeats(params.schoolId, params.additionalSeats);
  }

  /**
   * Creates the first (or an additional) real SCHOOL_ADMIN login for a
   * partner school, scoped to that school only. Without this there was no
   * way to actually populate the SCHOOL_ADMIN role with a real account --
   * see requireSchoolAdminSession for what that scoping now enforces.
   */
  async createSchoolAdmin(params: {
    schoolId: string;
    fullName: string;
    email?: string;
  }): Promise<OnboardedSchoolAdminAccount> {
    return schoolRepository.createSchoolAdmin(params.schoolId, {
      fullName: params.fullName,
      email: params.email,
    });
  }
}

export const schoolService = new SchoolService();
