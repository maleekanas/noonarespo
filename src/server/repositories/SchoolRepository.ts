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

class InMemorySchoolRepository {
  private schools: Map<string, PartnerSchool> = new Map();

  constructor() {
    this.seedSchools();
  }

  private seedSchools() {
    this.schools.set("school-al-noor", {
      id: "school-al-noor",
      nameAr: "أكاديمية النور الإسلامية الدولية",
      nameEn: "Al-Noor International Islamic Academy",
      type: "ISLAMIC_SCHOOL",
      country: "المملكة المتحدة (UK)",
      city: "لندن",
      licenseSeatsTotal: 150,
      licenseSeatsUsed: 138,
      classesCount: 8,
      studentsCount: 138,
      contactPerson: "د. طارق السعدي",
      contactEmail: "admin@alnoor-london.edu",
      contractStatus: "ACTIVE",
      curriculumTrackAr: "منهاج براعم المتكامل (اللغة والقرآن)",
      createdAt: new Date("2026-01-15"),
    });

    this.schools.set("school-al-fath", {
      id: "school-al-fath",
      nameAr: "مدرسة الفتح للغات والقرآن",
      nameEn: "Al-Fath Arabic & Quran School",
      type: "ISLAMIC_SCHOOL",
      country: "هولندا (NL)",
      city: "روتردام",
      licenseSeatsTotal: 80,
      licenseSeatsUsed: 74,
      classesCount: 5,
      studentsCount: 74,
      contactPerson: "أ. فاطمة الزهراء فان دن بيرغ",
      contactEmail: "contact@alfath-rotterdam.nl",
      contractStatus: "ACTIVE",
      curriculumTrackAr: "المسار الأوروبي لغير الناطقين بالعربية",
      createdAt: new Date("2026-02-10"),
    });

    this.schools.set("school-dar-al-hijra", {
      id: "school-dar-al-hijra",
      nameAr: "مجمع دار الهجرة التعليمي المجتمعي",
      nameEn: "Dar Al-Hijra Community Learning Center",
      type: "COMMUNITY_CENTER",
      country: "الولايات المتحدة (USA)",
      city: "دالاس، تكساس",
      licenseSeatsTotal: 120,
      licenseSeatsUsed: 105,
      classesCount: 7,
      studentsCount: 105,
      contactPerson: "المهندس عمر خليل",
      contactEmail: "academy@daralhijra-dallas.org",
      contractStatus: "ACTIVE",
      curriculumTrackAr: "منهاج نهاية الأسبوع المكثف",
      createdAt: new Date("2026-03-01"),
    });

    this.schools.set("school-riyadh-coop", {
      id: "school-riyadh-coop",
      nameAr: "تعاونية التعليم المنزلي الميسر",
      nameEn: "Homeschooling Arabic Cooperative",
      type: "HOMESCHOOL_COOP",
      country: "المملكة العربية السعودية (KSA)",
      city: "الرياض",
      licenseSeatsTotal: 40,
      licenseSeatsUsed: 38,
      classesCount: 3,
      studentsCount: 38,
      contactPerson: "أ. سارة المنصور",
      contactEmail: "homeschool@riyadh-coop.sa",
      contractStatus: "ACTIVE",
      curriculumTrackAr: "مسار الطلاقة المتقدمة والخط العربي",
      createdAt: new Date("2026-04-05"),
    });
  }

  async getAllSchools(): Promise<PartnerSchool[]> {
    return Array.from(this.schools.values());
  }

  async getSchoolById(id: string): Promise<PartnerSchool | null> {
    return this.schools.get(id) || null;
  }

  async addSchool(school: PartnerSchool): Promise<PartnerSchool> {
    this.schools.set(school.id, school);
    return school;
  }

  async allocateSeats(schoolId: string, additionalSeats: number): Promise<PartnerSchool> {
    const school = this.schools.get(schoolId);
    if (!school) throw new Error(`School not found: ${schoolId}`);
    school.licenseSeatsTotal += additionalSeats;
    this.schools.set(schoolId, school);
    return school;
  }

  async onboardStudents(schoolId: string, count: number): Promise<PartnerSchool> {
    const school = this.schools.get(schoolId);
    if (!school) throw new Error(`School not found: ${schoolId}`);
    if (school.licenseSeatsUsed + count > school.licenseSeatsTotal) {
      throw new Error(`Insufficient license seats. Available: ${school.licenseSeatsTotal - school.licenseSeatsUsed}, Requested: ${count}`);
    }
    school.licenseSeatsUsed += count;
    school.studentsCount += count;
    this.schools.set(schoolId, school);
    return school;
  }
}

export const schoolRepository = new InMemorySchoolRepository();
