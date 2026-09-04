import {
  DomainAssignment,
  DomainAssignmentSubmission,
  DomainTeacherFeedback,
} from "./types";
import { SubmissionStatus } from "@prisma/client";

class InMemoryAssignmentRepository {
  private assignments: Map<string, DomainAssignment> = new Map();
  private submissions: Map<string, DomainAssignmentSubmission> = new Map();
  private feedbacks: Map<string, DomainTeacherFeedback> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // 1. Initial homework for class-reading-a1-cohort1
    const hw1: DomainAssignment = {
      id: "hw-1",
      classGroupId: "class-reading-a1-cohort1",
      titleAr: "تسجيل صوتي: قراءة سورة الإخلاص مع أحكام القلقلة",
      titleEn: "Voice Recording: Surah Al-Ikhlas with Qalqalah Rules",
      instructions: "استمع إلى المقطع النموذجي بصوت المعلم، ثم سجّل قراءتك المتقنة بصوت واضح ورفعه للمراجعة.",
      voicePromptUrl: "https://audio.kidsarabicacademy.internal/prompts/surah-ikhlas-model.mp3",
      dueDateUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
    this.assignments.set(hw1.id, hw1);

    const hw2: DomainAssignment = {
      id: "hw-2",
      classGroupId: "class-reading-a1-cohort1",
      titleAr: "تدريب الخط: كتابة 3 جمل تشتمل على حرفي (الصاد والضاد)",
      titleEn: "Handwriting: 3 Sentences containing Letters (Sad & Dad)",
      instructions: "اكتب الجمل في كراستك بخط النسخ الجميل والتقط صورة واضحة للصفحة وارفعها هنا.",
      dueDateUtc: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
    this.assignments.set(hw2.id, hw2);

    const hwWriting: DomainAssignment = {
      id: "hw-writing-1",
      classGroupId: "class-writing-a1-cohort1",
      titleAr: "لوحة الحروف المستقرة والنازلة على السطر",
      titleEn: "Ruled Baseline Handwriting Sheet (Naskh)",
      instructions: "اكتب الحروف النازلة عن السطر (ر، ز، و، م، ي) مع تطبيق التوازن والمسافات المتساوية.",
      dueDateUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
    this.assignments.set(hwWriting.id, hwWriting);

    const hwSpeaking: DomainAssignment = {
      id: "hw-speaking-1",
      classGroupId: "class-speaking-a1-cohort1",
      titleAr: "مقطع محادثة: التعريف بالنفس والحديث عن كتابي المفضل",
      titleEn: "Spoken Speech: Self-Introduction & Favorite Book",
      instructions: "سجل مقطعاً صوتياً مدته دقيقة تتحدث فيه بالفصحى عن نفسك وكتابك المفضل وتطلعاتك.",
      dueDateUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
    this.assignments.set(hwSpeaking.id, hwSpeaking);

    const hwQuran: DomainAssignment = {
      id: "hw-quran-1",
      classGroupId: "class-quran-a1-cohort1",
      titleAr: "تلاوة سورة الفلق وسورة الناس بأحكام القلقلة والإخفاء",
      titleEn: "Recitation of Surah Al-Falaq & An-Nas with Tajweed",
      instructions: "سجل تلاوتك العذبة لسورتي الفلق والناس مع مراعاة قلقلة حرف القاف والدال والباء.",
      dueDateUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
    this.assignments.set(hwQuran.id, hwQuran);

    const hwIslamic: DomainAssignment = {
      id: "hw-islamic-1",
      classGroupId: "class-islamic-a1-cohort1",
      titleAr: "أركان الإسلام الخمسة وتطبيق آداب بر الوالدين",
      titleEn: "Five Pillars of Islam & Daily Filial Kindness Reflection",
      instructions: "اكتب عملاً طيباً قمت به اليوم لإدخال السرور على قلب والديك واذكر ركناً من أركان الإسلام.",
      dueDateUtc: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
    this.assignments.set(hwIslamic.id, hwIslamic);

    // 2. Submission from student-1 for hw-1
    const sub1: DomainAssignmentSubmission = {
      id: "sub-1",
      assignmentId: "hw-1",
      studentId: "student-1",
      audioUrl: "https://audio.kidsarabicacademy.internal/submissions/zayd-ikhlas.mp3",
      textContent: "تم التسجيل بحمد الله يا أستاذي الفاضل",
      status: SubmissionStatus.GRADED,
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    };
    this.submissions.set(sub1.id, sub1);

    // 3. Feedback from teacher-1
    const fb1: DomainTeacherFeedback = {
      id: "fb-1",
      submissionId: "sub-1",
      teacherId: "teacher-1",
      score: 100,
      parentVisibleFeedback: "ما شاء الله تبارك الله، قراءة ممتازة ومخارج حروف متقنة ونطق سليم لحروف القلقلة. استمر يا بطل!",
      internalTeacherNotes: "أتقن مخرج حرف القاف، ينتقل للدرس التالي مباشرة.",
      createdAt: new Date(),
    };
    this.feedbacks.set(fb1.id, fb1);
  }

  // Queries
  async getAllAssignments(): Promise<DomainAssignment[]> {
    return Array.from(this.assignments.values());
  }

  async getAssignmentsByClassGroupId(classGroupId: string): Promise<DomainAssignment[]> {
    return Array.from(this.assignments.values()).filter((a) => a.classGroupId === classGroupId);
  }

  async getAssignmentById(id: string): Promise<DomainAssignment | null> {
    return this.assignments.get(id) || null;
  }

  async getSubmission(assignmentId: string, studentId: string): Promise<DomainAssignmentSubmission | null> {
    for (const sub of this.submissions.values()) {
      if (sub.assignmentId === assignmentId && sub.studentId === studentId) {
        return sub;
      }
    }
    return null;
  }

  async getSubmissionsByAssignmentId(assignmentId: string): Promise<DomainAssignmentSubmission[]> {
    return Array.from(this.submissions.values()).filter((s) => s.assignmentId === assignmentId);
  }

  async getSubmissionsByStudentId(studentId: string): Promise<DomainAssignmentSubmission[]> {
    return Array.from(this.submissions.values()).filter((s) => s.studentId === studentId);
  }

  async getFeedbackBySubmissionId(submissionId: string): Promise<DomainTeacherFeedback | null> {
    for (const fb of this.feedbacks.values()) {
      if (fb.submissionId === submissionId) return fb;
    }
    return null;
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
    const id = "hw-" + (this.assignments.size + 1);
    const assignment: DomainAssignment = {
      id,
      classGroupId: data.classGroupId,
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      instructions: data.instructions,
      voicePromptUrl: data.voicePromptUrl,
      dueDateUtc: data.dueDateUtc,
      createdAt: new Date(),
    };
    this.assignments.set(id, assignment);
    return assignment;
  }

  async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    audioUrl?: string;
    textContent?: string;
  }): Promise<DomainAssignmentSubmission> {
    const existingSub = await this.getSubmission(data.assignmentId, data.studentId);
    if (existingSub) {
      existingSub.audioUrl = data.audioUrl || existingSub.audioUrl;
      existingSub.textContent = data.textContent || existingSub.textContent;
      existingSub.status = SubmissionStatus.SUBMITTED;
      existingSub.submittedAt = new Date();
      this.submissions.set(existingSub.id, existingSub);
      return existingSub;
    }

    const id = "sub-" + (this.submissions.size + 1);
    const submission: DomainAssignmentSubmission = {
      id,
      assignmentId: data.assignmentId,
      studentId: data.studentId,
      audioUrl: data.audioUrl,
      textContent: data.textContent,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
    };
    this.submissions.set(id, submission);
    return submission;
  }

  async gradeSubmission(data: {
    submissionId: string;
    teacherId: string;
    score: number;
    parentVisibleFeedback: string;
    internalTeacherNotes?: string;
  }): Promise<DomainTeacherFeedback> {
    const submission = this.submissions.get(data.submissionId);
    if (submission) {
      submission.status = SubmissionStatus.GRADED;
      this.submissions.set(submission.id, submission);
    }

    let feedback = await this.getFeedbackBySubmissionId(data.submissionId);
    if (feedback) {
      feedback.score = data.score;
      feedback.parentVisibleFeedback = data.parentVisibleFeedback;
      feedback.internalTeacherNotes = data.internalTeacherNotes;
      this.feedbacks.set(feedback.id, feedback);
      return feedback;
    }

    const id = "fb-" + (this.feedbacks.size + 1);
    feedback = {
      id,
      submissionId: data.submissionId,
      teacherId: data.teacherId,
      score: data.score,
      parentVisibleFeedback: data.parentVisibleFeedback,
      internalTeacherNotes: data.internalTeacherNotes,
      createdAt: new Date(),
    };
    this.feedbacks.set(id, feedback);
    return feedback;
  }
}

export const assignmentRepository = new InMemoryAssignmentRepository();
