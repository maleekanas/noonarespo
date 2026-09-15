import { createHash } from "node:crypto";
import { RoleType, UserStatus, AgeGroup } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";
import { userRepository } from "./UserRepository";

export type AuditActionCategory =
  | "AUTH"
  | "USER_MANAGEMENT"
  | "ACADEMIC"
  | "FINANCE"
  | "SECURITY";

export interface AuditLogEntry {
  id: string;
  category: AuditActionCategory;
  action: string;
  actorId: string;
  actorEmail: string;
  actorRole: RoleType;
  targetEntityId: string;
  targetEntityType: string;
  ipAddress: string;
  timestamp: Date;
  diffSummary?: string;
  hash: string;
}

export interface CurriculumModule {
  id: string;
  programId: string;
  programTitleAr: string;
  programTitleEn: string;
  courseLevelCode: string;
  levelTitleAr: string;
  targetAgeGroup: AgeGroup;
  cefrAlignment: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  weeklyObjectivesAr: string[];
  targetVocabularyCount: number;
  durationWeeks: number;
}

export interface StudentAdminRecord {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  ageGroup: AgeGroup;
  nativeLanguage: string;
  status: UserStatus;
  guardianName: string;
  guardianPhone: string;
  guardianConsentGivenAt: Date | null;
  coppaGdprCompliant: boolean;
  enrolledClassesCount: number;
}

export interface TeacherAdminRecord {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  qualifications: string;
  languagesSpoken: string;
  experienceYears: number;
  hourlyRateMinorUnits: number;
  isActive: boolean;
  assignedClassesCount: number;
  totalHoursTaught: number;
}

// AuditLog.diffJson carries category/actorEmail/actorRole/diffSummary/hash as
// a JSON blob -- the real Prisma AuditLog model (used elsewhere already for
// coarser system logging) only has action/resource/resourceId/userId/
// ipAddress natively, so the extra fields this admin UI needs are packed in
// here rather than requiring another schema migration on an already-live
// table.
interface AuditLogMeta {
  category: AuditActionCategory;
  actorEmail: string;
  actorRole: RoleType;
  diffSummary?: string;
  hash: string;
}

class AdministrationRepository {
  // Curriculum modules are admin-authored reference content (which weekly
  // objectives belong to which program/level) -- the same category as the
  // assessment question bank: losing an admin's freshly-typed module on a
  // cold start is an annoyance to redo, not real user data being lost, so
  // this stays in-memory for now (documented, not fixed, same reasoning as
  // AssessmentBankRepository).
  private curriculumModules: Map<string, CurriculumModule> = new Map();

  constructor() {
    this.seedCurriculumModules();
  }

  private computeHash(
    category: AuditActionCategory,
    action: string,
    actorId: string,
    targetEntityId: string,
    timestamp: Date,
    diffSummary?: string
  ): string {
    const raw = `${category}:${action}:${actorId}:${targetEntityId}:${timestamp.toISOString()}:${diffSummary || ""}`;
    return createHash("sha256").update(raw).digest("hex");
  }

  private seedCurriculumModules() {
    const modules: CurriculumModule[] = [
      // --- Program 1: Arabic Foundations (prog-foundations) ---
      {
        id: "cur-1",
        programId: "prog-foundations",
        programTitleAr: "أساسيات اللغة العربية",
        programTitleEn: "Arabic Foundations",
        courseLevelCode: "PRE_A1",
        levelTitleAr: "المستوى التمهيدي (براعم الحروف)",
        targetAgeGroup: AgeGroup.AGE_4_6,
        cefrAlignment: "CEFR Pre-A1",
        titleAr: "وحدة الحروف الهجائية بالحركات الثلاث",
        titleEn: "Alphabet with Primary Harakat",
        descriptionAr: "التعرف على أشكال الحروف (أ - ي) مع حركات الفتحة والضمة والكسرة ونطقها السليم.",
        weeklyObjectivesAr: [
          "تمييز رسم الحروف المنفصلة والمتصلة",
          "نطق الحرف بالحركات القصيرة نطقاً صحيحاً",
          "ربط الحرف بصور لمفردات مألوفة من بيئة الطفل",
        ],
        targetVocabularyCount: 50,
        durationWeeks: 4,
      },
      {
        id: "cur-1b",
        programId: "prog-foundations",
        programTitleAr: "أساسيات اللغة العربية",
        programTitleEn: "Arabic Foundations",
        courseLevelCode: "PRE_A1",
        levelTitleAr: "المستوى التمهيدي (أشكال الحروف)",
        targetAgeGroup: AgeGroup.AGE_4_6,
        cefrAlignment: "CEFR Pre-A1",
        titleAr: "أشكال الحروف في أول ووسط وآخر الكلمة",
        titleEn: "Letter Forms in Initial, Medial & Final Positions",
        descriptionAr: "تدريب بصري وحركي على تغير رسم الحرف حسب موضعه في الكلمة وقراءة مقاطع ثنائية مشكولة.",
        weeklyObjectivesAr: [
          "التعرف على تغير شكل الحرف حسب موقعه في الكلمة",
          "وصل الحروف ثنائية وثلاثية المقاطع بطلاقة",
          "رسم الحرف بالاتجاه السليم على الشاشة والورق",
        ],
        targetVocabularyCount: 75,
        durationWeeks: 4,
      },
      {
        id: "cur-1c",
        programId: "prog-foundations",
        programTitleAr: "أساسيات اللغة العربية",
        programTitleEn: "Arabic Foundations",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (المدود والحركات الطويلة)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A1",
        titleAr: "الحركات الطويلة والمدود والسكون",
        titleEn: "Long Vowels, Madd Letters & Sukoon",
        descriptionAr: "التفريق السمعي والبصري بين الحركات القصيرة والمدود الثلاثة وإتقان نطق السكون.",
        weeklyObjectivesAr: [
          "التفريق بين الحركات القصيرة والمدود الثلاثة (ا، و، ي)",
          "نطق مقطع المد والممدود بوضوح وسلاسة",
          "قراءة وتهجئة كلمات ثلاثية ورباعية تحوي سكوناً",
        ],
        targetVocabularyCount: 90,
        durationWeeks: 4,
      },

      // --- Program 2: Reading & Fluency (prog-reading) ---
      {
        id: "cur-2",
        programId: "prog-reading",
        programTitleAr: "برنامج القراءة والطلاقة",
        programTitleEn: "Reading & Fluency Program",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (مستكشفو الكلمات)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A1",
        titleAr: "المدود والتنوين وقراءة الجمل القصيرة",
        titleEn: "Madd, Tanween & Short Sentences",
        descriptionAr: "إتقان المدود الثلاثة (الألف والواو والياء) والتنوين والبدء بقراءة قصص مصورة مبسطة.",
        weeklyObjectivesAr: [
          "التفريق بين الحركة القصيرة والمد الطويل",
          "قراءة كلمات مشكولة تحوي تنويناً بالفتح والضم والكسر",
          "قراءة جملة مفيدة مكونة من 3-4 كلمات بطلاقة",
        ],
        targetVocabularyCount: 120,
        durationWeeks: 6,
      },
      {
        id: "cur-2b",
        programId: "prog-reading",
        programTitleAr: "برنامج القراءة والطلاقة",
        programTitleEn: "Reading & Fluency Program",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (اللام الشمسية والقمرية والشدة)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A2",
        titleAr: "اللام الشمسية والقمرية والحرف المشدد والوصل",
        titleEn: "Solar/Lunar Lam, Shaddah & Reading Flow",
        descriptionAr: "الارتقاء بالطلاقة القرائية عبر تمييز اللام الشمسية والقمرية ونطق الشدة وهمزة الوصل.",
        weeklyObjectivesAr: [
          "تمييز اللام الشمسية واللام القمرية نطقاً وكتابة",
          "قراءة الكلمات المشددة بسلاسة ودون تقطع",
          "قراءة فقرة مشكولة من 30 كلمة بسرعة 40 كلمة في الدقيقة",
        ],
        targetVocabularyCount: 150,
        durationWeeks: 6,
      },
      {
        id: "cur-2c",
        programId: "prog-reading",
        programTitleAr: "برنامج القراءة والطلاقة",
        programTitleEn: "Reading & Fluency Program",
        courseLevelCode: "B1",
        levelTitleAr: "المستوى الثالث (فهم المقروء والتذوق الأدبي)",
        targetAgeGroup: AgeGroup.AGE_11_13,
        cefrAlignment: "CEFR B1",
        titleAr: "فهم المقروء واستنتاج المعاني في القصص المصورة",
        titleEn: "Reading Comprehension & Literary Deduction",
        descriptionAr: "القراءة التحليلية للنصوص الأدبية وقصص الأطفال واستخلاص الدروس والقيم المستفادة.",
        weeklyObjectivesAr: [
          "القراءة المعبرة الممثلة للمعنى مع مراعاة علامات الوقف والترقيم",
          "استنتاج الفكرة الرئيسة والمغزى الأخلاقي للنص الأدبي",
          "الإجابة الشفوية والكتابية عن أسئلة الفهم القرائي الاستنتاجية",
        ],
        targetVocabularyCount: 200,
        durationWeeks: 8,
      },

      // --- Program 3: Writing & Penmanship (prog-writing) ---
      {
        id: "cur-3",
        programId: "prog-writing",
        programTitleAr: "برنامج الكتابة والخط العربي",
        programTitleEn: "Writing & Penmanship",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (قواعد خط النسخ والسطر)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A1",
        titleAr: "ضبط رسم الحروف على السطر ومسكة القلم",
        titleEn: "Baseline Stroke Mechanics & Pen Grip",
        descriptionAr: "تدريب الطالب على القواعد الهندسية لخط النسخ والحفاظ على استقرار الحروف على السطر.",
        weeklyObjectivesAr: [
          "التمييز بين الحروف المستقرة على السطر والنازلة عنه",
          "مراعاة المسافات المتساوية بين الكلمات والحروف",
          "التدريب على زاوية مسك القلم السليمة وضبط حجم الحرف",
        ],
        targetVocabularyCount: 90,
        durationWeeks: 4,
      },
      {
        id: "cur-3b",
        programId: "prog-writing",
        programTitleAr: "برنامج الكتابة والخط العربي",
        programTitleEn: "Writing & Penmanship",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (رواد الكتابة والتركيب)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A2",
        titleAr: "قواعد خط النسخ والتركيب الإنشائي",
        titleEn: "Naskh Penmanship & Sentence Composition",
        descriptionAr: "تحسين جودة رسم الحروف على السطر وكتابة فقرات قصيرة تعبر عن اهتمامات الطفل.",
        weeklyObjectivesAr: [
          "مراعاة الحروف المستقرة على السطر والنازلة عنه في الجمل المركبة",
          "كتابة جمل تشتمل على أدوات الربط (و، ثم، فـ) وعلامات الترقيم",
          "تأليف قصة قصيرة من 3 أسطر بالاستعانة بمشاهد مصورة",
        ],
        targetVocabularyCount: 140,
        durationWeeks: 6,
      },
      {
        id: "cur-3c",
        programId: "prog-writing",
        programTitleAr: "برنامج الكتابة والخط العربي",
        programTitleEn: "Writing & Penmanship",
        courseLevelCode: "B1",
        levelTitleAr: "المستوى الثالث (التعبير الإنشائي والقصصي)",
        targetAgeGroup: AgeGroup.AGE_11_13,
        cefrAlignment: "CEFR B1",
        titleAr: "التعبير الكتابي وتأليف القصص والمقالات المصغرة",
        titleEn: "Creative Writing & Narrative Essay Composition",
        descriptionAr: "صياغة نصوص نثرية متكاملة تتضمن مقدمة وعقدة وخاتمة مع إثراء المعجم التعبيري.",
        weeklyObjectivesAr: [
          "صياغة قصة خيالية أو واقعية مكتملة العناصر الفنية",
          "توظيف النعوت والأوصاف البلاغية لإثراء المشهد السردي",
          "مراجعة النص ذاتياً وتصحيح الأخطاء الإملائية والنحوية الشائعة",
        ],
        targetVocabularyCount: 180,
        durationWeeks: 6,
      },

      // --- Program 4: Speaking & Conversation (prog-speaking) ---
      {
        id: "cur-4",
        programId: "prog-speaking",
        programTitleAr: "برنامج المحادثة والنطق",
        programTitleEn: "Speaking & Conversation",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (المتحدث الصغير)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A1",
        titleAr: "التعارف والأسرة والأنشطة اليومية",
        titleEn: "Greetings, Family & Daily Routines",
        descriptionAr: "تدريب الطالب على الحوار التفاعلي باللغة العربية الفصحى البسيطة حول محيطه اليومي.",
        weeklyObjectivesAr: [
          "تقديم النفس والحديث عن العمر والهوايات والأسرة",
          "إجراء حوار قصير مع المعلم والزملاء بالسؤال والجواب",
          "التعبير عن المشاعر والمواقف الحياتية بطلاقة وثقة",
        ],
        targetVocabularyCount: 150,
        durationWeeks: 4,
      },
      {
        id: "cur-4b",
        programId: "prog-speaking",
        programTitleAr: "برنامج المحادثة والنطق",
        programTitleEn: "Speaking & Conversation",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (المواقف الحياتية والمحاكاة)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A2",
        titleAr: "الحوارات الحياتية: في المدرسة والسوق والرحلات",
        titleEn: "Situational Dialogues: School, Market & Travel",
        descriptionAr: "محاكاة مواقف واقعية باللغة الفصحى لتمكين الطالب من التحدث التلقائي دون تردد.",
        weeklyObjectivesAr: [
          "إدارة حوار مكتمل في المتجر وطلب السلع والاستفسار عن الأسعار",
          "وصف معالم رحلة أو نزهة والتعبير عما شاهده الطالب",
          "استخدام أساليب الاستفهام والتعجب والنهي بطلاقة في الحديث",
        ],
        targetVocabularyCount: 190,
        durationWeeks: 6,
      },
      {
        id: "cur-4c",
        programId: "prog-speaking",
        programTitleAr: "برنامج المحادثة والنطق",
        programTitleEn: "Speaking & Conversation",
        courseLevelCode: "B1",
        levelTitleAr: "المستوى الثالث (فنون الخطابة والمناظرة)",
        targetAgeGroup: AgeGroup.AGE_11_13,
        cefrAlignment: "CEFR B1",
        titleAr: "العرض والتقديم والتعبير عن الرأي والمناظرات",
        titleEn: "Public Speaking, Debates & Reasoned Discourse",
        descriptionAr: "تنمية مهارات الإلقاء الخطابي والمناظرة الودية والتعبير عن الآراء بأسلوب مقنع.",
        weeklyObjectivesAr: [
          "إلقاء كلمة قصيرة لمدة دقيقتين أمام الفصل بثقة تامة",
          "المشاركة في مناظرة طلابية مع إيراد الحجج والبراهين بأدب",
          "استخدام نبرات الصوت المناسبة للمواقف والتعبير الجسدي الملائم",
        ],
        targetVocabularyCount: 220,
        durationWeeks: 6,
      },

      // --- Program 5: Listening & Comprehension (prog-listening) ---
      {
        id: "cur-5",
        programId: "prog-listening",
        programTitleAr: "برنامج الاستماع والفهم",
        programTitleEn: "Listening & Comprehension",
        courseLevelCode: "PRE_A1",
        levelTitleAr: "المستوى التمهيدي (أذن واعية)",
        targetAgeGroup: AgeGroup.AGE_4_6,
        cefrAlignment: "CEFR Pre-A1",
        titleAr: "الاستماع للقصص الصوتية وتمييز الأصوات",
        titleEn: "Story Listening & Phonemic Discrimination",
        descriptionAr: "تنمية حاسة الاستماع وتمييز مخارج الحروف المتشابهة من خلال حكايات مصورة ومسموعة.",
        weeklyObjectivesAr: [
          "التمييز السمعي بين الأصوات المتقاربة (س/ص، ت/ط، د/ض)",
          "استخلاص الفكرة الرئيسة من قصة مسموعة لا تتجاوز دقيقتين",
          "الإجابة الشفوية عن أسئلة الفهم الاستماعي المباشرة",
        ],
        targetVocabularyCount: 80,
        durationWeeks: 4,
      },
      {
        id: "cur-5b",
        programId: "prog-listening",
        programTitleAr: "برنامج الاستماع والفهم",
        programTitleEn: "Listening & Comprehension",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (تتبع التوجيهات والاستيعاب)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A1",
        titleAr: "الاستماع للقصص وتتبع التعليمات المركبة",
        titleEn: "Narrative Listening & Following Multi-Step Instructions",
        descriptionAr: "تدريب الطالب على التركيز السمعي واستيعاب الأوامر التعليمية المتتابعة بدقة.",
        weeklyObjectivesAr: [
          "تنفيذ سلسلة تعليمات مسموعة مكونة من 3 خطوات متتابعة",
          "تحديد تسلسل أحداث الحكاية المسموعة من البداية إلى النهاية",
          "التعرف على انفعالات المتحدثين من خلال نبرة الصوت المسموعة",
        ],
        targetVocabularyCount: 130,
        durationWeeks: 6,
      },
      {
        id: "cur-5c",
        programId: "prog-listening",
        programTitleAr: "برنامج الاستماع والفهم",
        programTitleEn: "Listening & Comprehension",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (التحليل السمعي والتلخيص)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A2",
        titleAr: "التحليل السمعي وتلخيص الأفكار والحوارات",
        titleEn: "Auditory Analysis & Spoken Dialogue Summaries",
        descriptionAr: "الاستماع لنصوص وثائقية وحوارات مسجلة وإعادة تلخيصها بأسلوب الطالب الخاص.",
        weeklyObjectivesAr: [
          "استخلاص الحقائق والأرقام والمعلومات الواردة في مقطع صوتي",
          "إعادة سرد قصة مسموعة في 3 جمل محكمة بأسلوب الطالب الخاص",
          "إبداء الرأي ونقد سلوك شخصيات الحوار المسموع بموضوعية",
        ],
        targetVocabularyCount: 170,
        durationWeeks: 6,
      },

      // --- Program 6: Quran Reading & Tajweed (prog-quran) ---
      {
        id: "cur-6",
        programId: "prog-quran",
        programTitleAr: "برنامج القرآن الكريم والتجويد",
        programTitleEn: "Quran & Tajweed",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (نجوم التلاوة)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "Applied Tajweed Level 1",
        titleAr: "حفظ قصار السور وأحكام النون الساكنة والقلقلة",
        titleEn: "Short Surahs, Noon Sakinah & Qalqalah",
        descriptionAr: "حفظ وتثبيت جزء عم مع التطبيق العملي لمخارج الحروف وأحكام الإظهار والإدغام والقلقلة.",
        weeklyObjectivesAr: [
          "حفظ السور من سورة الناس إلى سورة العاديات متقنة",
          "تطبيق حكم القلقلة في حروف (قطب جد) عند الوقف والوصل",
          "تطبيق أحكام النون الساكنة والتنوين (الإظهار الحلقي)",
        ],
        targetVocabularyCount: 100,
        durationWeeks: 8,
      },
      {
        id: "cur-6b",
        programId: "prog-quran",
        programTitleAr: "برنامج القرآن الكريم والتجويد",
        programTitleEn: "Quran & Tajweed",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (أحكام النون والتنوين التامة)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "Applied Tajweed Level 2",
        titleAr: "أحكام النون الساكنة والتنوين (الإدغام والإقلاب والإخفاء)",
        titleEn: "Noon Sakinah Rules: Idgham, Iqlab & Ikhfa",
        descriptionAr: "إتقان الأحكام الأربعة للنون الساكنة والتنوين وتطبيق الغنة بمقدار حركتين في التلاوة.",
        weeklyObjectivesAr: [
          "تطبيق الإدغام بقسميه (بغنة في حروف ينمو، وبغير غنة في ل، ر)",
          "تطبيق حكم الإقلاب مع الميم الصغيرة والإخفاء الحقيقي في 15 حرفاً",
          "حفظ وتثبيت السور من سورة القارعة إلى سورة النبأ بأحكامها",
        ],
        targetVocabularyCount: 130,
        durationWeeks: 8,
      },
      {
        id: "cur-6c",
        programId: "prog-quran",
        programTitleAr: "برنامج القرآن الكريم والتجويد",
        programTitleEn: "Quran & Tajweed",
        courseLevelCode: "B1",
        levelTitleAr: "المستوى الثالث (أحكام الميم والمدود والإتقان)",
        targetAgeGroup: AgeGroup.AGE_11_13,
        cefrAlignment: "Applied Tajweed Level 3",
        titleAr: "أحكام الميم الساكنة وأنواع المدود وتثبيت جزء عم",
        titleEn: "Meem Sakinah, Madd Varieties & Full Juz Amma Mastery",
        descriptionAr: "دراسة أحكام الميم الساكنة وضبط مقادير المدود المتصلة والمنفصلة واللازمة وحفظ جزء عم كاملاً.",
        weeklyObjectivesAr: [
          "تطبيق أحكام الميم الساكنة الثلاثة (الإخفاء والإدغام والإظهار الشفوي)",
          "تمييز مقادير المدود وضبط المد الطبيعي حركتين والفرعي 4-5 حركات",
          "سرد سورة كاملة غيباً أمام المعلم مع مراعاة علامات الوقف والابتداء",
        ],
        targetVocabularyCount: 160,
        durationWeeks: 8,
      },

      // --- Program 7: Islamic Studies & Values (prog-islamic) ---
      {
        id: "cur-7",
        programId: "prog-islamic",
        programTitleAr: "برنامج الدراسات والقيم الإسلامية",
        programTitleEn: "Islamic Studies",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (قيم وأخلاق)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "Islamic Values Foundation",
        titleAr: "أركان الإسلام وسيرة نبينا محمد ﷺ",
        titleEn: "Pillars of Islam & Seerah of Prophet Muhammad (PBUH)",
        descriptionAr: "غرس محبة النبي ﷺ وتطبيق الآداب الإسلامية اليومية (بر الوالدين، الأمانة، الصدق).",
        weeklyObjectivesAr: [
          "شرح أركان الإسلام الخمسة بأسلوب مبسط وتطبيق صفة الوضوء والصلاة",
          "معرفة المحطات البارزة في طفولة وشباب النبي ﷺ وأخلاقه الكريمة",
          "تطبيق أذكار الصباح والمساء وآداب الطعام والنوم في الحياة اليومية",
        ],
        targetVocabularyCount: 90,
        durationWeeks: 6,
      },
      {
        id: "cur-7b",
        programId: "prog-islamic",
        programTitleAr: "برنامج الدراسات والقيم الإسلامية",
        programTitleEn: "Islamic Studies",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (الآداب النبوية والمعاملات)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "Islamic Adab Level 2",
        titleAr: "آداب التعامل اليومي: الصدق، بر الوالدين، وإكرام الجار",
        titleEn: "Daily Islamic Adab: Honesty, Filial Piety & Neighborliness",
        descriptionAr: "تطبيق القيم الإسلامية في المجتمع المدرسي والأسري ومواجهة المواقف المعاصرة بالأخلاق النبوية.",
        weeklyObjectivesAr: [
          "تطبيق خلق الصدق والأمانة في المعاملات المدرسية واليومية",
          "فهم أهمية صلة الرحم وإكرام الجار والرفق بالحيوان",
          "حفظ وفهم 5 أحاديث نبوية شريفة في الأخلاق والسلوك القويم",
        ],
        targetVocabularyCount: 120,
        durationWeeks: 6,
      },
      {
        id: "cur-7c",
        programId: "prog-islamic",
        programTitleAr: "برنامج الدراسات والقيم الإسلامية",
        programTitleEn: "Islamic Studies",
        courseLevelCode: "B1",
        levelTitleAr: "المستوى الثالث (أركان الإيمان وأولو العزم من الرسل)",
        targetAgeGroup: AgeGroup.AGE_11_13,
        cefrAlignment: "Islamic Doctrine & Seerah Level 3",
        titleAr: "أركان الإيمان الستة ومواقف من قصص أولي العزم",
        titleEn: "Six Pillars of Faith & Lessons from Resolute Prophets",
        descriptionAr: "ترسيخ العقيدة الصافية واستلهام العبر والتضحية والصبر من قصص الأنبياء الكرام وتاريخ الحضارة.",
        weeklyObjectivesAr: [
          "شرح أركان الإيمان الستة واستشعار مراقبة الله وحكمته",
          "استخلاص العبر والدروس التربوية من سير أولي العزم من الرسل",
          "إدراك دور المسلم في عمارة الأرض ونشر السلام والخير في مجتمعه",
        ],
        targetVocabularyCount: 150,
        durationWeeks: 8,
      },
    ];

    for (const m of modules) {
      this.curriculumModules.set(m.id, m);
    }
  }

  // --- Audit Log Methods ---
  async addAuditLog(data: {
    category: AuditActionCategory;
    action: string;
    actorId: string;
    actorEmail: string;
    actorRole: RoleType;
    targetEntityId: string;
    targetEntityType: string;
    ipAddress: string;
    diffSummary?: string;
  }): Promise<AuditLogEntry> {
    const timestamp = new Date();
    const hash = this.computeHash(
      data.category,
      data.action,
      data.actorId,
      data.targetEntityId,
      timestamp,
      data.diffSummary
    );

    const meta: AuditLogMeta = {
      category: data.category,
      actorEmail: data.actorEmail,
      actorRole: data.actorRole,
      diffSummary: data.diffSummary,
      hash,
    };

    // actorId is expected to be a real User.id (the logged-in session user),
    // but this must never be allowed to throw and lose the action being
    // logged -- fall back to an unattributed log row if the FK doesn't
    // resolve for any reason.
    const actorExists = await prisma.user.findUnique({ where: { id: data.actorId }, select: { id: true } });

    const row = await prisma.auditLog.create({
      data: {
        userId: actorExists ? data.actorId : null,
        action: data.action,
        resource: data.targetEntityType,
        resourceId: data.targetEntityId,
        ipAddress: data.ipAddress,
        diffJson: JSON.stringify(meta),
        createdAt: timestamp,
      },
    });

    return this.toEntry(row);
  }

  async getAuditLogs(filters?: {
    category?: AuditActionCategory;
    actorRole?: RoleType;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" } });
    let entries = rows.map((row) => this.toEntry(row));

    if (filters?.category) {
      entries = entries.filter((e) => e.category === filters.category);
    }
    if (filters?.actorRole) {
      entries = entries.filter((e) => e.actorRole === filters.actorRole);
    }
    if (filters?.limit) {
      entries = entries.slice(0, filters.limit);
    }

    return entries;
  }

  async verifyLogIntegrity(logId: string): Promise<boolean> {
    const row = await prisma.auditLog.findUnique({ where: { id: logId } });
    if (!row) return false;

    const entry = this.toEntry(row);
    const expectedHash = this.computeHash(
      entry.category,
      entry.action,
      entry.actorId,
      entry.targetEntityId,
      entry.timestamp,
      entry.diffSummary
    );
    return expectedHash === entry.hash;
  }

  private toEntry(row: {
    id: string;
    userId: string | null;
    action: string;
    resource: string;
    resourceId: string | null;
    ipAddress: string | null;
    diffJson: string | null;
    createdAt: Date;
  }): AuditLogEntry {
    let meta: Partial<AuditLogMeta> = {};
    try {
      meta = row.diffJson ? JSON.parse(row.diffJson) : {};
    } catch {
      meta = {};
    }

    return {
      id: row.id,
      category: meta.category || "SECURITY",
      action: row.action,
      actorId: row.userId || "",
      actorEmail: meta.actorEmail || "",
      actorRole: meta.actorRole || RoleType.SUPER_ADMIN,
      targetEntityId: row.resourceId || "",
      targetEntityType: row.resource,
      ipAddress: row.ipAddress || "",
      timestamp: row.createdAt,
      diffSummary: meta.diffSummary,
      hash: meta.hash || "",
    };
  }

  // --- Curriculum Methods ---
  async getAllCurriculumModules(): Promise<CurriculumModule[]> {
    return Array.from(this.curriculumModules.values());
  }

  async getCurriculumModulesByProgram(programId: string): Promise<CurriculumModule[]> {
    return Array.from(this.curriculumModules.values()).filter((m) => m.programId === programId);
  }

  async addCurriculumModule(data: Omit<CurriculumModule, "id">): Promise<CurriculumModule> {
    const id = "cur-" + (this.curriculumModules.size + 1);
    const curModule: CurriculumModule = { id, ...data };
    this.curriculumModules.set(id, curModule);
    return curModule;
  }

  // --- Student & User Governance ---
  // Previously returned 4 hardcoded demo students ("student-1".."student-4")
  // regardless of who was actually registered -- the admin Students page,
  // the school analytics totals, and the GDPR data-export flow were all
  // reading fabricated data disconnected from the real student_profiles
  // table. This now reads real students, their real account status, and
  // their real primary guardian.
  async getAllStudentsAdmin(): Promise<StudentAdminRecord[]> {
    const students = await prisma.studentProfile.findMany({
      include: {
        user: { select: { status: true } },
        enrollments: { select: { id: true } },
        relationships: {
          where: { isPrimaryContact: true },
          include: { parent: { select: { firstName: true, lastName: true, phoneNumber: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return students.map((s) => {
      const primaryRelationship = s.relationships[0];
      return {
        id: s.id,
        userId: s.userId,
        firstName: s.firstName,
        lastName: s.lastName,
        dateOfBirth: s.dateOfBirth,
        ageGroup: s.ageGroup,
        nativeLanguage: s.nativeLanguage,
        status: s.user.status,
        guardianName: primaryRelationship
          ? `${primaryRelationship.parent.firstName} ${primaryRelationship.parent.lastName}`
          : "-",
        guardianPhone: primaryRelationship?.parent.phoneNumber || "-",
        guardianConsentGivenAt: primaryRelationship?.consentGivenAt ?? null,
        coppaGdprCompliant: Boolean(primaryRelationship),
        enrolledClassesCount: s.enrollments.length,
      };
    });
  }

  // Now writes to the real User.status column -- the same column the login
  // page checks (`user.status !== "ACTIVE"` blocks sign-in). A suspension
  // previously only touched an in-memory Map that the real login flow never
  // consulted, so it neither survived a deploy nor actually stopped anyone
  // from signing in.
  async setStudentStatus(studentId: string, status: UserStatus): Promise<void> {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });
    if (!student) {
      throw new Error(`STUDENT_NOT_FOUND: ${studentId}`);
    }

    await prisma.user.update({
      where: { id: student.userId },
      data: { status },
    });
  }

  // --- Teacher Admin ---
  async getAllTeachersAdmin(): Promise<TeacherAdminRecord[]> {
    const teachers = await userRepository.getAllTeachers();
    return teachers.map((t) => ({
      id: t.id,
      userId: t.userId,
      firstName: t.firstName,
      lastName: t.lastName,
      email: "ustadh.ahmed@kidsarabicacademy.internal",
      qualifications: "بكالوريوس لغة عربية ودراسات إسلامية، إجازة بالسند المتصل في قراءة حفص",
      languagesSpoken: t.languagesSpoken || "العربية، الإنجليزية",
      experienceYears: t.experienceYears,
      hourlyRateMinorUnits: t.hourlyRateMinorUnits,
      isActive: t.isActive,
      assignedClassesCount: 1,
      totalHoursTaught: 16,
    }));
  }

  async updateTeacherRate(teacherId: string, newRateMinorUnits: number): Promise<void> {
    await userRepository.updateTeacherProfile(teacherId, { hourlyRateMinorUnits: newRateMinorUnits });
  }

  async updateTeacherActiveStatus(teacherId: string, isActive: boolean): Promise<void> {
    await userRepository.updateTeacherProfile(teacherId, { isActive });
  }
}

export const administrationRepository = new AdministrationRepository();
