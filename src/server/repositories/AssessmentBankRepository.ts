export type AssessmentFormatType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "WORD_MATCHING"
  | "FILL_IN_THE_BLANK"
  | "ESSAY"
  | "AUDIO_LISTENING"
  | "SPEECH_RECORDING";

export interface BankQuestion {
  id: string;
  type: AssessmentFormatType;
  programId: string;
  courseLevelCode: string;
  titleAr: string;
  titleEn: string;
  promptAr: string;
  promptEn: string;
  options?: string[];
  correctAnswer: string;
  audioPromptUrl?: string;
  points: number;
}

export interface ManagedAssessment {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  courseLevelCode: string;
  classGroupId?: string;
  passingScorePercentage: number;
  durationMinutes: number;
  questionIds: string[];
  isPublished: boolean;
  totalPoints: number;
  createdAt: Date;
}

class InMemoryAssessmentBankRepository {
  private questions: Map<string, BankQuestion> = new Map();
  private assessments: Map<string, ManagedAssessment> = new Map();

  constructor() {
    this.seedQuestions();
    this.seedAssessments();
  }

  private seedQuestions() {
    const defaultQuestions: BankQuestion[] = [
      // 1. Multiple Choice
      {
        id: "bq-1",
        type: "MULTIPLE_CHOICE",
        programId: "prog-foundations",
        courseLevelCode: "PRE_A1",
        titleAr: "التعرف على الحرف الأول",
        titleEn: "Identify First Letter",
        promptAr: "ما هو الحرف الذي تبدأ به كلمة (جَـمَل)؟",
        promptEn: "Which letter starts the word (Jamal - Camel)?",
        options: ["ح", "ج", "خ", "ع"],
        correctAnswer: "ج",
        points: 10,
      },
      // 2. True / False
      {
        id: "bq-2",
        type: "TRUE_FALSE",
        programId: "prog-reading",
        courseLevelCode: "A1",
        titleAr: "حكم التنوين بالفتح",
        titleEn: "Tanween Fath Rule",
        promptAr: "تنوين الفتح يُضاف في آخره ألف زائدة دائماً، مثل: (كتاباً)، إلا في حالات محددة كالتاء المربوطة.",
        promptEn: "Tanween with Fath usually appends an extra Alif (e.g. Kitaban) except on Taa Marbutah.",
        options: ["صحيح ✓", "خطأ ✗"],
        correctAnswer: "صحيح ✓",
        points: 10,
      },
      // 3. Word Matching
      {
        id: "bq-3",
        type: "WORD_MATCHING",
        programId: "prog-foundations",
        courseLevelCode: "PRE_A1",
        titleAr: "مطابقة الكلمة بالصورة والمعنى",
        titleEn: "Word to Meaning Match",
        promptAr: "اختر المعنى الصحيح لمفردة (شَـجَـرَة):",
        promptEn: "Select the correct match for (Shajarah):",
        options: ["نبات ذو جذع وأغصان مورقة", "وسيلة نقل برية", "طائر يطير بجناحين"],
        correctAnswer: "نبات ذو جذع وأغصان مورقة",
        points: 15,
      },
      // 4. Fill in the Blank
      {
        id: "bq-4",
        type: "FILL_IN_THE_BLANK",
        programId: "prog-writing",
        courseLevelCode: "A1",
        titleAr: "إكمال الجملة بحرف الجر المناسب",
        titleEn: "Preposition Fill-in-Blank",
        promptAr: "ذهبَ أحمدُ ___ المدرسةِ صباحاً مبكراً.",
        promptEn: "Ahmad went ___ school early in the morning.",
        options: ["إلى", "على", "في", "عن"],
        correctAnswer: "إلى",
        points: 15,
      },
      // 5. Essay / Short Answer
      {
        id: "bq-5",
        type: "ESSAY",
        programId: "prog-writing",
        courseLevelCode: "A2",
        titleAr: "التعبير والإنشاء القصير",
        titleEn: "Short Creative Expression",
        promptAr: "اكتب جملتين مفيدتين تصف فيهما فصل الربيع وجمال الأزهار.",
        promptEn: "Write two complete sentences describing spring season and flowers.",
        correctAnswer: "فصل الربيع جميل وتتفتح فيه الأزهار العطرة.",
        points: 20,
      },
      // 6. Audio Listening
      {
        id: "bq-6",
        type: "AUDIO_LISTENING",
        programId: "prog-listening",
        courseLevelCode: "A1",
        titleAr: "الاستماع الصوتي لتمييز الحركة",
        titleEn: "Auditory Discrimination",
        promptAr: "استمع إلى المقطع الصوتي، ثم اختر الكلمة التي سمعتها بدقة:",
        promptEn: "Listen to the audio snippet and select the pronounced word:",
        audioPromptUrl: "https://audio.kidsarabicacademy.internal/prompts/listen-tin.mp3",
        options: ["طِينٌ", "تِينٌ", "تِينُ", "دِينٌ"],
        correctAnswer: "تِينٌ",
        points: 15,
      },
      // 7. Speech Recording Simulation
      {
        id: "bq-7",
        type: "SPEECH_RECORDING",
        programId: "prog-quran",
        courseLevelCode: "A1",
        titleAr: "تسجيل صوتي وتطبيق التجويد",
        titleEn: "Tajweed Oral Recitation",
        promptAr: "سجّل تلاوتك لقوله تعالى: (قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ) مع تطبيق قلقلة حرف القاف عند الوقف.",
        promptEn: "Record your recitation of Surah Al-Falaq Ayah 1 with proper Qalqalah on Qaf.",
        audioPromptUrl: "https://audio.kidsarabicacademy.internal/prompts/ayah-falaq-model.mp3",
        correctAnswer: "تسجيل صوتي مطابق للمخارج والقلقلة",
        points: 25,
      },
    ];

    for (const q of defaultQuestions) {
      this.questions.set(q.id, q);
    }
  }

  private seedAssessments() {
    const defaultAssessments: ManagedAssessment[] = [
      {
        id: "exam-midterm-reading-a1",
        titleAr: "اختبار منتصف الفصل: القراءة والطلاقة (المستوى A1)",
        titleEn: "Midterm Exam: Reading & Fluency (Level A1)",
        descriptionAr: "تقييم شامل لمهارات نطق الحروف المشكولة، قراءة الجمل، والاستماع الفاحص.",
        courseLevelCode: "A1",
        classGroupId: "class-reading-a1-cohort1",
        passingScorePercentage: 70,
        durationMinutes: 30,
        questionIds: ["bq-1", "bq-2", "bq-4", "bq-6"],
        isPublished: true,
        totalPoints: 50,
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      },
      {
        id: "exam-quran-tajweed-check",
        titleAr: "التقييم الدوري: أحكام التلاوة والقلقلة (جزء عم)",
        titleEn: "Progress Check: Tajweed & Qalqalah Rules",
        descriptionAr: "اختبار عملي لمهارة التلاوة المتقنة وأحكام النون والقلقلة في قصار السور.",
        courseLevelCode: "A1",
        passingScorePercentage: 75,
        durationMinutes: 20,
        questionIds: ["bq-2", "bq-6", "bq-7"],
        isPublished: true,
        totalPoints: 50,
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      },
      {
        id: "exam-quiz-foundations-weekly",
        titleAr: "كويز أسبوعي: مطابقة الحروف والمفردات الأولى",
        titleEn: "Weekly Quiz: Foundations & Letter Forms",
        descriptionAr: "كويز قصير تنشيطي للأطفال في مرحلة التمهيدي لاختبار تمييز أشكال الحروف.",
        courseLevelCode: "PRE_A1",
        passingScorePercentage: 60,
        durationMinutes: 15,
        questionIds: ["bq-1", "bq-3"],
        isPublished: true,
        totalPoints: 25,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000),
      },
    ];

    for (const a of defaultAssessments) {
      this.assessments.set(a.id, a);
    }
  }

  async getAllQuestions(filters?: {
    type?: AssessmentFormatType;
    courseLevelCode?: string;
    programId?: string;
  }): Promise<BankQuestion[]> {
    let list = Array.from(this.questions.values());
    if (filters?.type) {
      list = list.filter((q) => q.type === filters.type);
    }
    if (filters?.courseLevelCode) {
      list = list.filter((q) => q.courseLevelCode === filters.courseLevelCode);
    }
    if (filters?.programId) {
      list = list.filter((q) => q.programId === filters.programId);
    }
    return list;
  }

  async getQuestionById(id: string): Promise<BankQuestion | null> {
    return this.questions.get(id) || null;
  }

  async getQuestionsByIds(ids: string[]): Promise<BankQuestion[]> {
    return ids
      .map((id) => this.questions.get(id))
      .filter((q): q is BankQuestion => Boolean(q));
  }

  async addQuestion(data: Omit<BankQuestion, "id">): Promise<BankQuestion> {
    const id = "bq-" + (this.questions.size + 1);
    const question: BankQuestion = { id, ...data };
    this.questions.set(id, question);
    return question;
  }

  async getAllAssessments(): Promise<ManagedAssessment[]> {
    return Array.from(this.assessments.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getAssessmentById(id: string): Promise<ManagedAssessment | null> {
    return this.assessments.get(id) || null;
  }

  async createAssessment(data: {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    courseLevelCode: string;
    classGroupId?: string;
    passingScorePercentage: number;
    durationMinutes: number;
    questionIds: string[];
    isPublished?: boolean;
  }): Promise<ManagedAssessment> {
    const id = "exam-" + (this.assessments.size + 1);
    const questions = data.questionIds
      .map((qid) => this.questions.get(qid))
      .filter((q): q is BankQuestion => Boolean(q));
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const assessment: ManagedAssessment = {
      id,
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      descriptionAr: data.descriptionAr,
      courseLevelCode: data.courseLevelCode,
      classGroupId: data.classGroupId,
      passingScorePercentage: data.passingScorePercentage,
      durationMinutes: data.durationMinutes,
      questionIds: data.questionIds,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      totalPoints,
      createdAt: new Date(),
    };

    this.assessments.set(id, assessment);
    return assessment;
  }

  async togglePublishAssessment(id: string): Promise<ManagedAssessment | null> {
    const a = this.assessments.get(id);
    if (!a) return null;
    a.isPublished = !a.isPublished;
    return a;
  }
}

export const assessmentBankRepository = new InMemoryAssessmentBankRepository();
