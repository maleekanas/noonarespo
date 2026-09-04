import {
  schoolRepository,
  PartnerSchool,
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

  async onboardBatchRoster(params: {
    schoolId: string;
    studentCount: number;
  }): Promise<{
    school: PartnerSchool;
    messageAr: string;
    messageEn: string;
  }> {
    const updated = await schoolRepository.onboardStudents(
      params.schoolId,
      params.studentCount
    );

    return {
      school: updated,
      messageAr: `تم تسجيل دفعة من ${params.studentCount} طالباً بنجاح في ${updated.nameAr}. المقاعد المتبقية: ${updated.licenseSeatsTotal - updated.licenseSeatsUsed}`,
      messageEn: `Batch of ${params.studentCount} students successfully onboarded to ${updated.nameEn}. Remaining seats: ${updated.licenseSeatsTotal - updated.licenseSeatsUsed}`,
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
