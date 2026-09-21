import {
  DomainAssignment,
  DomainAssignmentSubmission,
  DomainTeacherFeedback,
} from "./types";
import { SubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

/**
 * Prisma-backed repository for homework assignments, student submissions,
 * and teacher feedback. Previously in-memory, seeded only against fixed
 * demo class groups and "student-1" -- a real teacher's assignment, a
 * real child's submission, or a real teacher's grading never persisted.
 */
class AssignmentRepository {
  private fallbackAssignments: Map<string, DomainAssignment> = new Map();

  constructor() {
    this.seedFallbackAssignments();
  }

  private seedFallbackAssignments() {
    const hwList: DomainAssignment[] = [
      // AGE_4_6 (Sprouts) Homework
      {
        id: "hw-sprouts-1",
        classGroupId: "class-foundations-pre-a1-sprouts",
        titleAr: "تسجيل صوتي: نطق أصوات الحروف بحركة الفتحة (أ، ب، ت، ث)",
        titleEn: "Voice Recording: Letter Sounds with Fatha (Alif to Thaa)",
        instructions: "استمع إلى أنشودة الحروف ثم سجل نطقك الجميل لأصوات الحروف الأربعة بصوت واضح ومرح.",
        voicePromptUrl: "https://audio.arabickidsacademy.com/prompts/sprouts-letters-model.mp3",
        dueDateUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "hw-sprouts-2",
        classGroupId: "class-foundations-pre-a1-sprouts",
        titleAr: "نشاط التلوين والتتبع: كراسة تتبع حرف الألف والباء",
        titleEn: "Coloring & Tracing Activity: Alif & Baa Ruled Sheet",
        instructions: "اطبع ورقة التتبع ولون الحيوانات اللطيفة (الأسد والبطة) وتتبع الحروف باتجاه الأسهم.",
        dueDateUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "hw-sprouts-3",
        classGroupId: "class-listening-pre-a1-sprouts",
        titleAr: "الاستماع والمطابقة: أصوات الحيوانات في المزرعة",
        titleEn: "Listen & Match: Farm Animal Sounds & Names in Arabic",
        instructions: "استمع إلى المقطع الصوتي وطابق صوت كل حيوان مع اسمه العربي في ورقة العمل.",
        voicePromptUrl: "https://audio.arabickidsacademy.com/prompts/farm-animals.mp3",
        dueDateUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },

      // AGE_7_10 (Explorers) Homework
      {
        id: "hw-1",
        classGroupId: "class-reading-a1-cohort1",
        titleAr: "تسجيل صوتي: قراءة سورة الإخلاص مع أحكام القلقلة",
        titleEn: "Voice Recording: Surah Al-Ikhlas with Qalqalah Rules",
        instructions: "استمع إلى المقطع النموذجي بصوت المعلم، ثم سجّل قراءتك المتقنة بصوت واضح ورفعه للمراجعة.",
        voicePromptUrl: "https://audio.arabickidsacademy.com/prompts/surah-ikhlas-model.mp3",
        dueDateUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "hw-2",
        classGroupId: "class-reading-a1-cohort1",
        titleAr: "تدريب الخط: كتابة 3 جمل تشتمل على حرفي (الصاد والضاد)",
        titleEn: "Handwriting: 3 Sentences containing Letters (Sad & Dad)",
        instructions: "اكتب الجمل في كراستك بخط النسخ الجميل والتقط صورة واضحة للصفحة وارفعها هنا.",
        dueDateUtc: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "hw-writing-1",
        classGroupId: "class-writing-a1-cohort1",
        titleAr: "لوحة الحروف المستقرة والنازلة على السطر",
        titleEn: "Ruled Baseline Handwriting Sheet (Naskh)",
        instructions: "اكتب الحروف النازلة عن السطر (ر، ز، و، م، ي) مع تطبيق التوازن والمسافات المتساوية.",
        dueDateUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "hw-speaking-1",
        classGroupId: "class-speaking-a1-cohort1",
        titleAr: "مقطع محادثة: التعريف بالنفس والحديث عن كتابي المفضل",
        titleEn: "Spoken Speech: Self-Introduction & Favorite Book",
        instructions: "سجل مقطعاً صوتياً مدته دقيقة تتحدث فيه بالفصحى عن نفسك وكتابك المفضل وتطلعاتك.",
        dueDateUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "hw-quran-1",
        classGroupId: "class-quran-a1-cohort1",
        titleAr: "تلاوة سورة الفلق وسورة الناس بأحكام القلقلة والإخفاء",
        titleEn: "Recitation of Surah Al-Falaq & An-Nas with Tajweed",
        instructions: "سجل تلاوتك العذبة لسورتي الفلق والناس مع مراعاة قلقلة حرف القاف والدال والباء.",
        dueDateUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "hw-islamic-1",
        classGroupId: "class-islamic-a1-cohort1",
        titleAr: "أركان الإسلام الخمسة وتطبيق آداب بر الوالدين",
        titleEn: "Five Pillars of Islam & Daily Filial Kindness Reflection",
        instructions: "اكتب عملاً طيباً قمت به اليوم لإدخال السرور على قلب والديك واذكر ركناً من أركان الإسلام.",
        dueDateUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },

      // AGE_11_13 (Pioneers) Homework
      {
        id: "hw-pioneers-1",
        classGroupId: "class-reading-b1-cohort1",
        titleAr: "تحليل أدبي: استخراج الأفكار الرئيسة والعبر في قصة يوسف عليه السلام",
        titleEn: "Literary Analysis: Main Themes & Lessons in Prophet Yusuf Narrative",
        instructions: "اقرأ قصة يوسف في المكتبة الرقمية واكتب ملخصاً تحليلياً من 100 كلمة يبرز قيمة العفو عند المقدرة.",
        dueDateUtc: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "hw-pioneers-2",
        classGroupId: "class-writing-b1-cohort1",
        titleAr: "التعبير الإنشائي: كتابة قصة خيالية قصيرة موظفاً أدوات الربط",
        titleEn: "Creative Writing: Short Fiction Utilizing Transitional Connectors",
        instructions: "ألف قصة من 8 أسطر تحوي مقدمة وعقدة وخاتمة مع استخدام (بينما، فجأة، ثم، أخيراً) وعلامات الترقيم.",
        dueDateUtc: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "hw-pioneers-3",
        classGroupId: "class-quran-b1-cohort1",
        titleAr: "تلاوة وتجويد: أحكام الميم الساكنة في سورة الأعلى وسورة الغاشية",
        titleEn: "Tajweed Recitation: Meem Sakinah Rules in Surah Al-A'la & Al-Ghashiyah",
        instructions: "سجل تلاوتك في مختبر القرآن مع تطبيق الإخفاء والإدغام الشفوي وضبط الغنة حركتين.",
        voicePromptUrl: "https://audio.arabickidsacademy.com/prompts/meem-sakinah-model.mp3",
        dueDateUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },

      // AGE_14_16 (Scholars) Homework
      {
        id: "hw-scholars-1",
        classGroupId: "class-reading-b2-cohort1",
        titleAr: "التحليل البلاغي والنقدي: التشبيه والاستعارة في خطبة طارق بن زياد",
        titleEn: "Rhetorical & Critical Analysis: Simile & Metaphor in Tariq ibn Ziyad's Speech",
        instructions: "حلل 3 صور بيانية في الخطبة التاريخية مبيناً أثرها في إقناع الجيش واستنهاض الهمم.",
        dueDateUtc: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "hw-scholars-2",
        classGroupId: "class-writing-b2-cohort1",
        titleAr: "كتابة مقالة حجاجية: دور اللغة العربية في الهوية الحضارية المعاصرة",
        titleEn: "Argumentative Essay: The Role of Arabic in Contemporary Cultural Identity",
        instructions: "اكتب مقالة أكاديمية من 250 كلمة تشتمل على أطروحة وأدلة تاريخية وعقلية ودحض للاعتراضات.",
        dueDateUtc: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "hw-scholars-3",
        classGroupId: "class-speaking-b2-cohort1",
        titleAr: "تسجيل مناظرة مرئية أو صوتية: التكنولوجيا واللغة بين الإثراء والتحدي",
        titleEn: "Speech/Debate Submission: Technology & Language - Enrichment vs Challenges",
        instructions: "سجل خطاباً إقناعياً مدته 3 دقائق باللغة الفصحى الرصينة مدعماً بحجج منطقية وإحصاءات.",
        dueDateUtc: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
    ];

    for (const hw of hwList) {
      this.fallbackAssignments.set(hw.id, hw);
    }
  }

  // Queries
  async getAllAssignments(): Promise<DomainAssignment[]> {
    try {
      const rows = await prisma.assignment.findMany();
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline fallback
    }
    return Array.from(this.fallbackAssignments.values());
  }

  async getAssignmentsByClassGroupId(classGroupId: string): Promise<DomainAssignment[]> {
    try {
      const rows = await prisma.assignment.findMany({ where: { classGroupId } });
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline fallback
    }
    return Array.from(this.fallbackAssignments.values()).filter((a) => a.classGroupId === classGroupId);
  }

  async getAssignmentById(id: string): Promise<DomainAssignment | null> {
    try {
      const row = await prisma.assignment.findUnique({ where: { id } });
      if (row) return row;
    } catch {
      // offline fallback
    }
    return this.fallbackAssignments.get(id) || null;
  }

  async getSubmission(assignmentId: string, studentId: string): Promise<DomainAssignmentSubmission | null> {
    try {
      return await prisma.assignmentSubmission.findUnique({
        where: { assignmentId_studentId: { assignmentId, studentId } },
      });
    } catch {
      return null;
    }
  }

  async getSubmissionsByAssignmentId(assignmentId: string): Promise<DomainAssignmentSubmission[]> {
    try {
      return await prisma.assignmentSubmission.findMany({ where: { assignmentId } });
    } catch {
      return [];
    }
  }

  async getSubmissionsByStudentId(studentId: string): Promise<DomainAssignmentSubmission[]> {
    try {
      return await prisma.assignmentSubmission.findMany({ where: { studentId } });
    } catch {
      return [];
    }
  }

  async getFeedbackBySubmissionId(submissionId: string): Promise<DomainTeacherFeedback | null> {
    try {
      return await prisma.teacherFeedback.findUnique({ where: { submissionId } });
    } catch {
      return null;
    }
  }

  /**
   * Averages real teacher-assigned scores (0-100) across a student's graded
   * submissions. Submissions still awaiting grading have no TeacherFeedback
   * row and are excluded from the average rather than counted as 0.
   */
  async getStudentHomeworkSummary(studentId: string): Promise<{
    averageScorePercentage: number | null;
    gradedCount: number;
    totalSubmissions: number;
  }> {
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { studentId },
      include: { feedback: true },
    });
    const graded = submissions.filter((s) => s.feedback !== null);
    const averageScorePercentage =
      graded.length > 0
        ? Math.round(
            graded.reduce((sum, s) => sum + (s.feedback?.score ?? 0), 0) / graded.length
          )
        : null;

    return {
      averageScorePercentage,
      gradedCount: graded.length,
      totalSubmissions: submissions.length,
    };
  }

  /**
   * The most recent piece of teacher feedback left for a student, with
   * enough joined context (teacher name, course title) to render a
   * "latest evaluation" card without a second round-trip.
   */
  async getLatestFeedbackForStudent(studentId: string) {
    return prisma.teacherFeedback.findFirst({
      where: { submission: { studentId } },
      include: {
        teacher: true,
        submission: {
          include: {
            assignment: {
              include: {
                classGroup: {
                  include: { courseLevel: { include: { course: true } } },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Mutations
  async createAssignment(data: {
    classGroupId: string;
    titleAr: string;
    titleEn: string;
    instructions: string;
    voicePromptUrl?: string;
    dueDateUtc: Date;
  }): Promise<DomainAssignment> {
    return prisma.assignment.create({
      data: {
        classGroupId: data.classGroupId,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        instructions: data.instructions,
        voicePromptUrl: data.voicePromptUrl,
        dueDateUtc: data.dueDateUtc,
      },
    });
  }

  async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    audioUrl?: string;
    textContent?: string;
  }): Promise<DomainAssignmentSubmission> {
    return prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId: data.assignmentId, studentId: data.studentId } },
      update: {
        audioUrl: data.audioUrl,
        textContent: data.textContent,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      create: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        audioUrl: data.audioUrl,
        textContent: data.textContent,
        status: SubmissionStatus.SUBMITTED,
      },
    });
  }

  async gradeSubmission(data: {
    submissionId: string;
    teacherId: string;
    score: number;
    parentVisibleFeedback: string;
    internalTeacherNotes?: string;
  }): Promise<DomainTeacherFeedback> {
    await prisma.assignmentSubmission.update({
      where: { id: data.submissionId },
      data: { status: SubmissionStatus.GRADED },
    });

    return prisma.teacherFeedback.upsert({
      where: { submissionId: data.submissionId },
      update: {
        score: data.score,
        parentVisibleFeedback: data.parentVisibleFeedback,
        internalTeacherNotes: data.internalTeacherNotes,
      },
      create: {
        submissionId: data.submissionId,
        teacherId: data.teacherId,
        score: data.score,
        parentVisibleFeedback: data.parentVisibleFeedback,
        internalTeacherNotes: data.internalTeacherNotes,
      },
    });
  }
}

export const assignmentRepository = new AssignmentRepository();
