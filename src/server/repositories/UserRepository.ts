import {
  DomainUser,
  DomainStudentProfile,
  DomainParentProfile,
  DomainTeacherProfile,
  DomainParentStudentRelationship,
} from "./types";
import { RoleType, UserStatus, AgeGroup, RelationshipType } from "@prisma/client";

// In-Memory persistent store for development & testing
class InMemoryUserRepository {
  private users: Map<string, DomainUser> = new Map();
  private studentProfiles: Map<string, DomainStudentProfile> = new Map();
  private parentProfiles: Map<string, DomainParentProfile> = new Map();
  private teacherProfiles: Map<string, DomainTeacherProfile> = new Map();
  private relationships: Map<string, DomainParentStudentRelationship> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // 1. Super Admin
    this.users.set("user-superadmin", {
      id: "user-superadmin",
      email: "superadmin@kidsarabicacademy.internal",
      passwordHash: "Password123!",
      status: UserStatus.ACTIVE,
      localePreference: "ar",
      mfaEnabled: false,
      role: RoleType.SUPER_ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. Teachers
    // Teacher 1: Ustadh Ahmed (Reading & Tajweed)
    this.users.set("user-teacher-1", {
      id: "user-teacher-1",
      email: "ustadh.ahmed@kidsarabicacademy.internal",
      passwordHash: "Password123!",
      status: UserStatus.ACTIVE,
      localePreference: "ar",
      mfaEnabled: false,
      role: RoleType.TEACHER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.teacherProfiles.set("teacher-1", {
      id: "teacher-1",
      userId: "user-teacher-1",
      firstName: "أحمد",
      lastName: "المنصوري",
      bioAr: "أستاذ متخصص في تعليم القراءة والتجويد بخبرة 12 عاماً للأطفال",
      bioEn: "Specialist Arabic & Tajweed instructor with 12 years of experience for children",
      experienceYears: 12,
      hourlyRateMinorUnits: 3000,
      languagesSpoken: "Arabic, English",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Teacher 2: Ustadha Fatima (Writing & Children's Literature)
    this.users.set("user-teacher-2", {
      id: "user-teacher-2",
      email: "ustadha.fatima@kidsarabicacademy.internal",
      passwordHash: "Password123!",
      status: UserStatus.ACTIVE,
      localePreference: "ar",
      mfaEnabled: false,
      role: RoleType.TEACHER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.teacherProfiles.set("teacher-2", {
      id: "teacher-2",
      userId: "user-teacher-2",
      firstName: "فاطمة",
      lastName: "الزهراء الشامي",
      bioAr: "معلمة متخصصة في الخط العربي، التعبير الإبداعي، وأدب الأطفال العربي بخبرة 9 أعوام",
      bioEn: "Specialist instructor in Arabic calligraphy, creative writing, and children's literature with 9 years experience",
      experienceYears: 9,
      hourlyRateMinorUnits: 2800,
      languagesSpoken: "Arabic, French, English",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Teacher 3: Sheikh Mahmoud (Quranic Sciences, Qira'at & Islamic Studies)
    this.users.set("user-teacher-3", {
      id: "user-teacher-3",
      email: "sheikh.mahmoud@kidsarabicacademy.internal",
      passwordHash: "Password123!",
      status: UserStatus.ACTIVE,
      localePreference: "ar",
      mfaEnabled: false,
      role: RoleType.TEACHER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.teacherProfiles.set("teacher-3", {
      id: "teacher-3",
      userId: "user-teacher-3",
      firstName: "محمود",
      lastName: "الأزهري",
      bioAr: "قارئ مجاز بالقراءات العشر ومتخصص في تدريس السيرة النبوية والدراسات الإسلامية للناشئة",
      bioEn: "Certified Quran reciter in the Ten Qira'at and educator in Islamic Studies & Seerah with 15 years experience",
      experienceYears: 15,
      hourlyRateMinorUnits: 3200,
      languagesSpoken: "Arabic, English",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Teacher 4: Ustadha Layla (Early Foundations & Spoken Arabic)
    this.users.set("user-teacher-4", {
      id: "user-teacher-4",
      email: "ustadha.layla@kidsarabicacademy.internal",
      passwordHash: "Password123!",
      status: UserStatus.ACTIVE,
      localePreference: "ar",
      mfaEnabled: false,
      role: RoleType.TEACHER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.teacherProfiles.set("teacher-4", {
      id: "teacher-4",
      userId: "user-teacher-4",
      firstName: "ليلى",
      lastName: "نور الدين",
      bioAr: "خبيرة تأسيس الطفولة المبكرة، الأناشيد التعليمية، وتنمية الطلاقة الشفوية والاستماع",
      bioEn: "Early childhood Arabic specialist focusing on phonics games, spoken fluency, and audio comprehension with 8 years experience",
      experienceYears: 8,
      hourlyRateMinorUnits: 2700,
      languagesSpoken: "Arabic, English, Dutch",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Parent: Tariq
    this.users.set("user-parent-1", {
      id: "user-parent-1",
      email: "parent.tariq@example.com",
      passwordHash: "Password123!",
      status: UserStatus.ACTIVE,
      localePreference: "ar",
      mfaEnabled: false,
      role: RoleType.PARENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.parentProfiles.set("parent-1", {
      id: "parent-1",
      userId: "user-parent-1",
      firstName: "طارق",
      lastName: "المنصور",
      phoneNumber: "+966501234567",
      emergencyContactName: "فاطمة المنصور",
      emergencyPhone: "+966509876543",
      billingAddress: "الرياض، المملكة العربية السعودية",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Students: Zayd Tariq & Maryam Tariq
    this.users.set("user-student-1", {
      id: "user-student-1",
      email: "zayd@kidsarabicacademy.internal",
      passwordHash: "Password123!",
      status: UserStatus.ACTIVE,
      localePreference: "ar",
      mfaEnabled: false,
      role: RoleType.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.studentProfiles.set("student-1", {
      id: "student-1",
      userId: "user-student-1",
      firstName: "زيد",
      lastName: "طارق",
      dateOfBirth: new Date("2018-05-14"), // 8 years old
      gender: "ذكر",
      nativeLanguage: "ar",
      ageGroup: AgeGroup.AGE_7_10,
      notesInternal: "طالب ذكي ونبيه، يحتاج تدريب إضافي على مخارج الحروف المفخمة",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.users.set("user-student-2", {
      id: "user-student-2",
      email: "maryam@kidsarabicacademy.internal",
      passwordHash: "Password123!",
      status: UserStatus.ACTIVE,
      localePreference: "ar",
      mfaEnabled: false,
      role: RoleType.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.studentProfiles.set("student-2", {
      id: "student-2",
      userId: "user-student-2",
      firstName: "مريم",
      lastName: "طارق",
      dateOfBirth: new Date("2021-08-20"), // 5 years old
      gender: "أنثى",
      nativeLanguage: "ar",
      ageGroup: AgeGroup.AGE_4_6,
      notesInternal: "تتعلم بسرعة من خلال الأناشيد والألعاب التفاعلية",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Link Parent to Zayd and Maryam
    this.relationships.set("rel-1", {
      id: "rel-1",
      parentId: "parent-1",
      studentId: "student-1",
      relationshipType: RelationshipType.FATHER,
      isPrimaryContact: true,
      consentGivenAt: new Date(),
    });

    this.relationships.set("rel-2", {
      id: "rel-2",
      parentId: "parent-1",
      studentId: "student-2",
      relationshipType: RelationshipType.FATHER,
      isPrimaryContact: true,
      consentGivenAt: new Date(),
    });
  }

  // Queries
  async findUserByEmail(email: string): Promise<DomainUser | null> {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  async findParentProfileByUserId(userId: string): Promise<DomainParentProfile | null> {
    for (const p of this.parentProfiles.values()) {
      if (p.userId === userId) return p;
    }
    return null;
  }

  async findParentProfileById(id: string): Promise<DomainParentProfile | null> {
    return this.parentProfiles.get(id) || null;
  }

  async findStudentProfileById(id: string): Promise<DomainStudentProfile | null> {
    return this.studentProfiles.get(id) || null;
  }

  async findTeacherProfileById(id: string): Promise<DomainTeacherProfile | null> {
    return this.teacherProfiles.get(id) || null;
  }

  async getAllTeachers(): Promise<DomainTeacherProfile[]> {
    return Array.from(this.teacherProfiles.values());
  }

  async getLinkedChildren(parentId: string): Promise<DomainStudentProfile[]> {
    const studentIds: string[] = [];
    for (const rel of this.relationships.values()) {
      if (rel.parentId === parentId) {
        studentIds.push(rel.studentId);
      }
    }
    return studentIds
      .map((id) => this.studentProfiles.get(id))
      .filter((s): s is DomainStudentProfile => Boolean(s));
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
    const studentId = "student-" + (this.studentProfiles.size + 1);
    const userId = "user-" + studentId;

    const user: DomainUser = {
      id: userId,
      email: `${data.firstName.toLowerCase()}.${studentId}@kidsarabicacademy.internal`,
      passwordHash: "Password123!",
      status: UserStatus.ACTIVE,
      localePreference: "ar",
      mfaEnabled: false,
      role: RoleType.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userId, user);

    const profile: DomainStudentProfile = {
      id: studentId,
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      ageGroup: data.ageGroup,
      nativeLanguage: data.nativeLanguage || "ar",
      notesInternal: data.notesInternal,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.studentProfiles.set(studentId, profile);

    const relId = "rel-" + (this.relationships.size + 1);
    this.relationships.set(relId, {
      id: relId,
      parentId,
      studentId,
      relationshipType: data.relationshipType,
      isPrimaryContact: true,
      consentGivenAt: new Date(),
    });

    return profile;
  }
}

// Export singleton instance
export const userRepository = new InMemoryUserRepository();
