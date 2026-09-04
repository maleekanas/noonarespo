export interface LiveSessionGradeEntry {
  id: string;
  studentId: string;
  studentName: string;
  classGroupId: string;
  classGroupName: string;
  sessionDate: Date;
  wordsPerMinute: number;
  makharijScore: number; // 0-100%
  participationStars: number; // 1 to 5
  teacherNotesAr: string;
  parentAlertSent: boolean;
  xpAwarded: number;
  createdAt: Date;
}

class InMemoryGradebookRepository {
  private gradeEntries: Map<string, LiveSessionGradeEntry> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    this.gradeEntries.set("grade-1", {
      id: "grade-1",
      studentId: "student-1", // Zayd
      studentName: "زيد طارق",
      classGroupId: "class-reading-a1-cohort1",
      classGroupName: "فصل النجوم (A1 - القراءة والطلاقة)",
      sessionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      wordsPerMinute: 38,
      makharijScore: 92,
      participationStars: 5,
      teacherNotesAr: "مشاركة تفاعلية ممتازة وطلاقة واضحة في نطق الكلمات الثلاثية المشكولة.",
      parentAlertSent: true,
      xpAwarded: 20,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    });

    this.gradeEntries.set("grade-2", {
      id: "grade-2",
      studentId: "student-2", // Maryam
      studentName: "مريم طارق",
      classGroupId: "class-sprouts-cohort1",
      classGroupName: "فصل الفراشات (براعم 4-6 سنوات - التأسيس)",
      sessionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      wordsPerMinute: 24,
      makharijScore: 88,
      participationStars: 4,
      teacherNotesAr: "تجاوب رائع مع أنشودة الحروف وتعرف دقيق على حرف الجيم.",
      parentAlertSent: true,
      xpAwarded: 20,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    });

    this.gradeEntries.set("grade-3", {
      id: "grade-3",
      studentId: "student-1", // Zayd
      studentName: "زيد طارق",
      classGroupId: "class-quran-a1-cohort1",
      classGroupName: "حلقة الفردوس (A1 - حفظ وتجويد قصار السور)",
      sessionDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      wordsPerMinute: 32,
      makharijScore: 96,
      participationStars: 5,
      teacherNotesAr: "تلاوة خاشعة ومتقنة لسورة الإخلاص مع إبراز قلقلة الدال في (أحد والصمد). بارك الله فيه.",
      parentAlertSent: true,
      xpAwarded: 25,
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    });
  }

  async getAllGrades(): Promise<LiveSessionGradeEntry[]> {
    return Array.from(this.gradeEntries.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getGradesByClassGroupId(classGroupId: string): Promise<LiveSessionGradeEntry[]> {
    return Array.from(this.gradeEntries.values())
      .filter((g) => g.classGroupId === classGroupId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGradesByStudentId(studentId: string): Promise<LiveSessionGradeEntry[]> {
    return Array.from(this.gradeEntries.values())
      .filter((g) => g.studentId === studentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createGradeEntry(
    entry: Omit<LiveSessionGradeEntry, "id" | "createdAt">
  ): Promise<LiveSessionGradeEntry> {
    const id = "grade-" + (this.gradeEntries.size + 1);
    const full: LiveSessionGradeEntry = {
      ...entry,
      id,
      createdAt: new Date(),
    };
    this.gradeEntries.set(id, full);
    return full;
  }
}

export const gradebookRepository = new InMemoryGradebookRepository();
