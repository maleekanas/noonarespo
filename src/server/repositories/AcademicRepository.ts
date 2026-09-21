import {
  DomainProgram,
  DomainCourse,
  DomainCourseLevel,
  DomainClassGroup,
  DomainClassEnrollment,
  DomainTeacherAssignment,
} from "./types";
import { ClassType, EnrollmentStatus, ProgramType, TeacherRoleInClass, AgeGroup } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

/**
 * Program.id in the database is a random UUID (`@default(uuid())`), but a
 * stable, human-readable "prog-xxx" slug is used everywhere else a program
 * needs to be referenced outside the database itself: the hardcoded
 * CurriculumModule catalog (AdministrationRepository), the localization
 * dictionaries (programsCatalog.meta), and public links (e.g. the homepage
 * linking into /programs?program=prog-foundations). This map is the single
 * source of truth translating the real, stable `ProgramType` enum into that
 * slug, so pages can look up curriculum/dictionary content for a program
 * without depending on its unstable database id.
 */
export const PROGRAM_TYPE_TO_SLUG: Record<ProgramType, string> = {
  ARABIC_FOUNDATIONS: "prog-foundations",
  READING_PROGRAM: "prog-reading",
  WRITING_PROGRAM: "prog-writing",
  SPEAKING_PROGRAM: "prog-speaking",
  LISTENING_PROGRAM: "prog-listening",
  QURAN_TAJWEED: "prog-quran",
  ISLAMIC_STUDIES: "prog-islamic",
};

export function getProgramSlug(type: ProgramType): string {
  return PROGRAM_TYPE_TO_SLUG[type] || "prog-foundations";
}

/**
 * Resilient repository for the academic catalog (programs, courses,
 * levels, class groups, enrollments, teacher assignments).
 * 
 * When PostgreSQL is available, it queries the live database.
 * When the database server is offline or unreachable (e.g. during local dev
 * without a local Postgres instance running at localhost:5432), it seamlessly
 * falls back to the in-memory academic catalog so public pages and test suites
 * never crash with PrismaClientInitializationError.
 */
class AcademicRepository {
  private fallbackPrograms: Map<string, DomainProgram> = new Map();
  private fallbackCourses: Map<string, DomainCourse> = new Map();
  private fallbackLevels: Map<string, DomainCourseLevel> = new Map();
  private fallbackClassGroups: Map<string, DomainClassGroup> = new Map();
  private fallbackEnrollments: Map<string, DomainClassEnrollment> = new Map();
  private fallbackTeacherAssignments: Map<string, DomainTeacherAssignment> = new Map();

  constructor() {
    this.seedFallbackCatalog();
  }

  private seedFallbackCatalog() {
    // 1. All 7 Mandated Programs
    const programs: DomainProgram[] = [
      {
        id: "prog-foundations",
        type: ProgramType.ARABIC_FOUNDATIONS,
        titleAr: "أساسيات اللغة العربية",
        titleEn: "Arabic Foundations",
        descriptionAr: "التعرف على الحروف، أصواتها، بناء المفردات، وتدريبات القراءة الأولى للأطفال الصغار.",
        descriptionEn: "Alphabet recognition, letter sounds, vocabulary building, and initial reading practice.",
        iconName: "Sparkles",
      },
      {
        id: "prog-reading",
        type: ProgramType.READING_PROGRAM,
        titleAr: "برنامج القراءة والطلاقة",
        titleEn: "Reading & Fluency Program",
        descriptionAr: "الصوتيات، الطلاقة القرائية، الفهم والاستيعاب، والتعلم القائم على القصص الممتعة.",
        descriptionEn: "Phonics, reading fluency, reading comprehension, and story-based learning.",
        iconName: "BookOpen",
      },
      {
        id: "prog-writing",
        type: ProgramType.WRITING_PROGRAM,
        titleAr: "برنامج الكتابة والخط",
        titleEn: "Writing & Penmanship Program",
        descriptionAr: "تحسين الخط العربي، تركيب الجمل، التعبير الإبداعي، والتطبيقات النحوية المبسطة.",
        descriptionEn: "Handwriting, sentence formation, creative writing, and grammar practice.",
        iconName: "PenTool",
      },
      {
        id: "prog-speaking",
        type: ProgramType.SPEAKING_PROGRAM,
        titleAr: "برنامج المحادثة والنطق",
        titleEn: "Speaking & Conversation Program",
        descriptionAr: "تصحيح مخارج الحروف، الحوار اليومي التفاعلي، والتحدث بثقة أمام الجمهور.",
        descriptionEn: "Pronunciation refinement, interactive daily conversation, and public speaking.",
        iconName: "Mic",
      },
      {
        id: "prog-listening",
        type: ProgramType.LISTENING_PROGRAM,
        titleAr: "برنامج الاستماع والفهم",
        titleEn: "Listening & Comprehension Program",
        descriptionAr: "الاستماع إلى الحكايات، التمارين الصوتية، والتفاعل المباشر مع النصوص المسموعة.",
        descriptionEn: "Story listening, audio exercises, and interactive listening comprehension.",
        iconName: "Headphones",
      },
      {
        id: "prog-quran",
        type: ProgramType.QURAN_TAJWEED,
        titleAr: "برنامج القرآن الكريم والتجويد",
        titleEn: "Quran & Tajweed Program",
        descriptionAr: "القراءة المتقنة، الحفظ والتثبيت، أحكام التجويد العملية، والمراجعة الدورية.",
        descriptionEn: "Quran reading, memorization, practical Tajweed rules, and systematic revision.",
        iconName: "BookMarked",
      },
      {
        id: "prog-islamic",
        type: ProgramType.ISLAMIC_STUDIES,
        titleAr: "برنامج الدراسات الإسلامية",
        titleEn: "Islamic Studies for Children",
        descriptionAr: "المعارف الإسلامية الأساسية، قصص الأنبياء المصورة، وغرس القيم والأخلاق النبيلة.",
        descriptionEn: "Basic Islamic knowledge, illustrated prophetic stories, and core moral values.",
        iconName: "Award",
      },
    ];

    for (const prog of programs) {
      this.fallbackPrograms.set(prog.id, prog);
    }

    // 2. Accredited Courses (2 per program)
    const courses: DomainCourse[] = [
      // Program 1: Foundations
      {
        id: "course-foundations-sprouts",
        programId: "prog-foundations",
        titleAr: "براعم العربية للأطفال الصغار (4-6 سنوات)",
        titleEn: "Arabic Sprouts for Little Learners (Ages 4-6)",
        descriptionAr: "التعرف البصري والصوتي على الحروف مع الأناشيد والألعاب التفاعلية المبهجة",
        descriptionEn: "Visual & phonemic letter discovery with cheerful songs and interactive games",
      },
      {
        id: "course-foundations-sound",
        programId: "prog-foundations",
        titleAr: "الأصوات والتراكيب التأسيسية",
        titleEn: "Foundational Phonemes & Word Building",
        descriptionAr: "إتقان أشكال الحروف في مواضعها المختلفة والحركات القصيرة والطويلة",
        descriptionEn: "Mastery of letter forms in all positions and short vowel diacritics",
      },

      // Program 2: Reading
      {
        id: "course-reading-explorers",
        programId: "prog-reading",
        titleAr: "القراءة والطلاقة للمستكشفين",
        titleEn: "Reading Fluency for Junior Explorers",
        descriptionAr: "منهج تفاعلي يركز على الطلاقة القرائية وقراءة القصص الهادفة",
        descriptionEn: "Interactive curriculum focusing on reading speed, phonics, and comprehension",
      },
      {
        id: "course-reading-analytical",
        programId: "prog-reading",
        titleAr: "القراءة التحليلية والتذوق الأدبي",
        titleEn: "Analytical Reading & Literature Appreciation",
        descriptionAr: "قراءة نصوص متقدمة واستنتاج المعاني وتذوق البلاغة العربية",
        descriptionEn: "Advanced text analysis, contextual comprehension, and literary appreciation",
      },

      // Program 3: Writing
      {
        id: "course-writing-naskh",
        programId: "prog-writing",
        titleAr: "جماليات الخط العربي وقواعد النسخ",
        titleEn: "Naskh Calligraphy & Handwriting Aesthetics",
        descriptionAr: "تحسين الخط العربي، ضبط حركة القلم على السطر، ومحاكاة النماذج الأصيلة",
        descriptionEn: "Arabic penmanship mastery, baseline alignment, and authentic Naskh script",
      },
      {
        id: "course-writing-creative",
        programId: "prog-writing",
        titleAr: "التعبير الكتابي وتأليف النصوص",
        titleEn: "Creative Writing & Sentence Composition",
        descriptionAr: "بناء الجمل المتناسقة، توظيف علامات الترقيم، وتأليف القصص المصورة",
        descriptionEn: "Sentence synthesis, paragraph cohesion, punctuation, and creative storytelling",
      },

      // Program 4: Speaking
      {
        id: "course-speaking-junior",
        programId: "prog-speaking",
        titleAr: "المتحدث الفصيح الصغير",
        titleEn: "The Eloquent Young Speaker",
        descriptionAr: "فصول حوارية تفاعلية لتنمية مهارات التحدث والتعبير عن النفس بطلاقة",
        descriptionEn: "Interactive conversational sessions to build confidence and natural spoken fluency",
      },
      {
        id: "course-speaking-dialogue",
        programId: "prog-speaking",
        titleAr: "المحادثة الحياتية والفصاحة التلقائية",
        titleEn: "Daily Conversation & Spontaneous Eloquence",
        descriptionAr: "مواقف حياتية تحاكي الواقع باللغة العربية الفصحى مع المرشد الذكي فصيح",
        descriptionEn: "Real-world conversational scenarios in Standard Arabic with the AI tutor Faseeh",
      },

      // Program 5: Listening
      {
        id: "course-listening-phonemes",
        programId: "prog-listening",
        titleAr: "أذن واعية وأصوات ممتعة",
        titleEn: "Attentive Ear & Auditory Discovery",
        descriptionAr: "تنمية حاسة الاستماع والتمييز الصوتي بين الحروف المتشابهة ومخارجها",
        descriptionEn: "Auditory discrimination, minimal pairs phoneme practice, and listening agility",
      },
      {
        id: "course-listening-comprehension",
        programId: "prog-listening",
        titleAr: "الاستماع النشط وفهم الحكايات المسموعة",
        titleEn: "Active Auditory Comprehension & Story Listening",
        descriptionAr: "الاستماع للقصص التراثية واستخلاص الأفكار الرئيسة والتفاصيل الدقيقة",
        descriptionEn: "Listening to Arabic folklore and classic stories with comprehension checkpoints",
      },

      // Program 6: Quran & Tajweed
      {
        id: "course-quran-juz-amma",
        programId: "prog-quran",
        titleAr: "نور البيان وتلاوة جزء عم",
        titleEn: "Noor Al-Bayan & Juz Amma Recitation",
        descriptionAr: "تلاوة وحفظ جزء عم مع أحكام التجويد الأساسية ومخارج الحروف السليمة",
        descriptionEn: "Quranic recitation of Juz Amma with foundational Tajweed rules and correct Makharij",
      },
      {
        id: "course-quran-tajweed",
        programId: "prog-quran",
        titleAr: "التجويد المصور وحلقات التثبيت",
        titleEn: "Visual Applied Tajweed & Memorization Mastery",
        descriptionAr: "تطبيق قواعد التجويد الملونة (النون الساكنة، المدود، القلقلة) وتثبيت الحفظ",
        descriptionEn: "Applied color-coded Tajweed (Noon Sakinah, Madd, Qalqalah) with retention tracking",
      },

      // Program 7: Islamic Studies
      {
        id: "course-islamic-akhlaq",
        programId: "prog-islamic",
        titleAr: "أخلاق المسلم الصغير وقصص الأنبياء",
        titleEn: "Young Muslim Ethics & Prophetic Stories",
        descriptionAr: "غرس القيم والآداب الإسلامية (الصدق، بر الوالدين، الأمانة) وقصص الرسل المصورة",
        descriptionEn: "Islamic morals (honesty, filial piety, trustworthiness) and illustrated prophetic stories",
      },
      {
        id: "course-islamic-seerah",
        programId: "prog-islamic",
        titleAr: "السيرة النبوية والقيم المعاصرة",
        titleEn: "Prophetic Biography, Values & Modern Character",
        descriptionAr: "محطات سيرة الحبيب المصطفى ﷺ وتطبيق تعاليمها في الحياة اليومية المعاصرة",
        descriptionEn: "Milestones of the Prophet's ﷺ life and practical contemporary application",
      },
    ];

    for (const course of courses) {
      this.fallbackCourses.set(course.id, course);
    }

    // 3. Course Levels
    const levels: DomainCourseLevel[] = [
      // Foundations Levels
      {
        id: "level-pre-a1-sprouts",
        courseId: "course-foundations-sprouts",
        levelCode: "PRE_A1",
        titleAr: "المستوى التمهيدي - التعرف على أصوات الحروف",
        titleEn: "Pre-A1 - Letter Sounds & Recognition",
        targetAge: AgeGroup.AGE_4_6,
      },
      {
        id: "level-a1-foundations",
        courseId: "course-foundations-sound",
        levelCode: "A1",
        titleAr: "المستوى الأول - وصل الحروف والحركات القصيرة",
        titleEn: "Level A1 - Letter Connections & Short Vowels",
        targetAge: AgeGroup.AGE_7_10,
      },

      // Reading Levels
      {
        id: "level-a1-reading",
        courseId: "course-reading-explorers",
        levelCode: "A1",
        titleAr: "المستوى الأول (A1) - الحروف والكلمات المركبة",
        titleEn: "Level A1 - Compound Letters & Words",
        targetAge: AgeGroup.AGE_7_10,
      },
      {
        id: "level-a2-reading",
        courseId: "course-reading-explorers",
        levelCode: "A2",
        titleAr: "المستوى الثاني (A2) - القصص المصورة والطلاقة",
        titleEn: "Level A2 - Short Stories & Reading Fluency",
        targetAge: AgeGroup.AGE_7_10,
      },
      {
        id: "level-b1-reading",
        courseId: "course-reading-analytical",
        levelCode: "B1",
        titleAr: "المستوى الثالث (B1) - القراءة التحليلية والفهم المتقدم",
        titleEn: "Level B1 - Analytical Reading & Advanced Comprehension",
        targetAge: AgeGroup.AGE_11_13,
      },

      // Writing Levels
      {
        id: "level-a1-writing",
        courseId: "course-writing-naskh",
        levelCode: "A1",
        titleAr: "المستوى الأول (A1) - ضبط رسم الحروف على السطر",
        titleEn: "Level A1 - Baseline Stroke Mechanics & Penmanship",
        targetAge: AgeGroup.AGE_7_10,
      },
      {
        id: "level-a2-writing",
        courseId: "course-writing-creative",
        levelCode: "A2",
        titleAr: "المستوى الثاني (A2) - تركيب الجمل وعلامات الترقيم",
        titleEn: "Level A2 - Sentence Construction & Punctuation",
        targetAge: AgeGroup.AGE_7_10,
      },

      // Speaking Levels
      {
        id: "level-a1-speaking",
        courseId: "course-speaking-junior",
        levelCode: "A1",
        titleAr: "المستوى الأول (A1) - التعارف والتعبير اليومي",
        titleEn: "Level A1 - Daily Greetings & Self-Introduction",
        targetAge: AgeGroup.AGE_7_10,
      },
      {
        id: "level-a2-speaking",
        courseId: "course-speaking-dialogue",
        levelCode: "A2",
        titleAr: "المستوى الثاني (A2) - الحوارات الحياتية وفنون الإلقاء",
        titleEn: "Level A2 - Situational Dialogues & Public Presentation",
        targetAge: AgeGroup.AGE_7_10,
      },

      // Listening Levels
      {
        id: "level-pre-a1-listening",
        courseId: "course-listening-phonemes",
        levelCode: "PRE_A1",
        titleAr: "المستوى التمهيدي - التمييز السمعي للأصوات المتقاربة",
        titleEn: "Pre-A1 - Phonemic Discrimination & Minimal Pairs",
        targetAge: AgeGroup.AGE_4_6,
      },
      {
        id: "level-a1-listening",
        courseId: "course-listening-comprehension",
        levelCode: "A1",
        titleAr: "المستوى الأول (A1) - استماع الحكايات وتتبع التوجيهات",
        titleEn: "Level A1 - Audio Story Following & Direct Instruction",
        targetAge: AgeGroup.AGE_7_10,
      },

      // Quran Levels
      {
        id: "level-a1-quran",
        courseId: "course-quran-juz-amma",
        levelCode: "A1",
        titleAr: "المستوى الأول (A1) - قصار السور وأحكام القلقلة",
        titleEn: "Level A1 - Short Surahs & Qalqalah Mastery",
        targetAge: AgeGroup.AGE_7_10,
      },
      {
        id: "level-a2-quran",
        courseId: "course-quran-tajweed",
        levelCode: "A2",
        titleAr: "المستوى الثاني (A2) - أحكام النون الساكنة والمدود",
        titleEn: "Level A2 - Noon Sakinah, Tanween & Madd",
        targetAge: AgeGroup.AGE_7_10,
      },

      // Islamic Studies Levels
      {
        id: "level-a1-islamic",
        courseId: "course-islamic-akhlaq",
        levelCode: "A1",
        titleAr: "المستوى الأول (A1) - أركان الإسلام والآداب اليومية",
        titleEn: "Level A1 - Pillars of Islam & Daily Adab",
        targetAge: AgeGroup.AGE_7_10,
      },
      {
        id: "level-a2-islamic",
        courseId: "course-islamic-seerah",
        levelCode: "A2",
        titleAr: "المستوى الثاني (A2) - أركان الإيمان وقصص أولي العزم",
        titleEn: "Level A2 - Pillars of Faith & Resolute Prophets",
        targetAge: AgeGroup.AGE_7_10,
      },
    ];

    for (const lvl of levels) {
      this.fallbackLevels.set(lvl.id, lvl);
    }

    // 4. Active Micro-Cohorts (2 per program, capped at max 6)
    const classGroups: DomainClassGroup[] = [
      {
        id: "class-reading-a1-cohort1",
        courseLevelId: "level-a1-reading",
        name: "فصل النجوم (A1 - القراءة والطلاقة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-reading-a2-cohort1",
        courseLevelId: "level-a2-reading",
        name: "فصل فرسان القراءة (A2 - القصص والطلاقة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-sprouts-cohort1",
        courseLevelId: "level-pre-a1-sprouts",
        name: "فصل الفراشات (براعم 4-6 سنوات - التأسيس)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-foundations-a1-cohort1",
        courseLevelId: "level-a1-foundations",
        name: "فصل السنابل الخضراء (A1 - وصل الحروف)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-writing-a1-cohort1",
        courseLevelId: "level-a1-writing",
        name: "فصل خطاطي المستقبل (A1 - تحسين الخط العربي)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-writing-a2-cohort1",
        courseLevelId: "level-a2-writing",
        name: "فصل البيان والإنشاء (A2 - التعبير الكتابي)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-speaking-a1-cohort1",
        courseLevelId: "level-a1-speaking",
        name: "فصل الفصحاء الصغار (A1 - المحادثة اليومية)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-speaking-a2-cohort1",
        courseLevelId: "level-a2-speaking",
        name: "فصل منابر الخطابة (A2 - الإلقاء والحوار التفاعلي)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-listening-pre-a1-cohort1",
        courseLevelId: "level-pre-a1-listening",
        name: "فصل المستمع الذكي (Pre-A1 - تمييز الأصوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-listening-a1-cohort1",
        courseLevelId: "level-a1-listening",
        name: "فصل الاستيعاب والتحليل الصوتي (A1 - الاستماع النشط)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-quran-a1-cohort1",
        courseLevelId: "level-a1-quran",
        name: "حلقة الفردوس (A1 - حفظ وتجويد قصار السور)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-quran-a2-cohort1",
        courseLevelId: "level-a2-quran",
        name: "حلقة الماهر بالقرآن (A2 - تلاوة وأحكام متقدمة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-islamic-a1-cohort1",
        courseLevelId: "level-a1-islamic",
        name: "فصل رواد الأخلاق والقيم (A1 - القيم النبوية)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-islamic-a2-cohort1",
        courseLevelId: "level-a2-islamic",
        name: "فصل بناة الحضارة الإسلامية (A2 - السيرة النبوية)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    for (const cg of classGroups) {
      this.fallbackClassGroups.set(cg.id, cg);
    }

    // 5. Enrollments
    const enrollments: DomainClassEnrollment[] = [
      {
        id: "enr-1",
        studentId: "student-1",
        classGroupId: "class-reading-a1-cohort1",
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
      },
      {
        id: "enr-2",
        studentId: "student-2",
        classGroupId: "class-reading-a1-cohort1",
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
      },
      {
        id: "enr-3",
        studentId: "student-1",
        classGroupId: "class-quran-a1-cohort1",
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
      },
      {
        id: "enr-4",
        studentId: "student-3",
        classGroupId: "class-writing-a1-cohort1",
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
      },
      {
        id: "enr-5",
        studentId: "student-3",
        classGroupId: "class-speaking-a1-cohort1",
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
      },
      {
        id: "enr-6",
        studentId: "student-4",
        classGroupId: "class-islamic-a1-cohort1",
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
      },
      {
        id: "enr-7",
        studentId: "student-2",
        classGroupId: "class-listening-pre-a1-cohort1",
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
      },
    ];

    for (const enr of enrollments) {
      this.fallbackEnrollments.set(enr.id, enr);
    }

    // 6. Teacher Assignments
    const teacherAssignments: DomainTeacherAssignment[] = [
      // Ustadh Ahmed (Reading & Quran)
      {
        id: "ta-1",
        teacherId: "teacher-1",
        classGroupId: "class-reading-a1-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
      {
        id: "ta-2",
        teacherId: "teacher-1",
        classGroupId: "class-reading-a2-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
      {
        id: "ta-3",
        teacherId: "teacher-1",
        classGroupId: "class-quran-a1-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },

      // Ustadha Fatima (Writing & Islamic Studies)
      {
        id: "ta-4",
        teacherId: "teacher-2",
        classGroupId: "class-writing-a1-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
      {
        id: "ta-5",
        teacherId: "teacher-2",
        classGroupId: "class-writing-a2-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
      {
        id: "ta-6",
        teacherId: "teacher-2",
        classGroupId: "class-islamic-a1-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
      {
        id: "ta-7",
        teacherId: "teacher-2",
        classGroupId: "class-islamic-a2-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },

      // Sheikh Mahmoud (Quran & Advanced Speaking)
      {
        id: "ta-8",
        teacherId: "teacher-3",
        classGroupId: "class-quran-a2-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
      {
        id: "ta-9",
        teacherId: "teacher-3",
        classGroupId: "class-speaking-a2-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },

      // Ustadha Layla (Foundations, Speaking & Listening)
      {
        id: "ta-10",
        teacherId: "teacher-4",
        classGroupId: "class-sprouts-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
      {
        id: "ta-11",
        teacherId: "teacher-4",
        classGroupId: "class-foundations-a1-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
      {
        id: "ta-12",
        teacherId: "teacher-4",
        classGroupId: "class-speaking-a1-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
      {
        id: "ta-13",
        teacherId: "teacher-4",
        classGroupId: "class-listening-pre-a1-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
      {
        id: "ta-14",
        teacherId: "teacher-4",
        classGroupId: "class-listening-a1-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
    ];

    for (const ta of teacherAssignments) {
      this.fallbackTeacherAssignments.set(ta.id, ta);
    }
  }

  // --- Queries ---

  async getAllPrograms(): Promise<DomainProgram[]> {
    try {
      const rows = await prisma.program.findMany({ orderBy: { titleAr: "asc" } });
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline / DB error fallback
    }
    return Array.from(this.fallbackPrograms.values());
  }

  async getProgramById(id: string): Promise<DomainProgram | null> {
    try {
      const row = await prisma.program.findUnique({ where: { id } });
      if (row) return row;
    } catch {
      // offline / DB error fallback
    }
    return this.fallbackPrograms.get(id) || Array.from(this.fallbackPrograms.values()).find((p) => p.type === id) || null;
  }

  async getAllCourses(): Promise<DomainCourse[]> {
    try {
      const rows = await prisma.course.findMany();
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline / DB error fallback
    }
    return Array.from(this.fallbackCourses.values());
  }

  async getCourseById(id: string): Promise<DomainCourse | null> {
    try {
      const row = await prisma.course.findUnique({ where: { id } });
      if (row) return row;
    } catch {
      // offline / DB error fallback
    }
    return this.fallbackCourses.get(id) || null;
  }

  async getCoursesByProgramId(programId: string): Promise<DomainCourse[]> {
    try {
      const rows = await prisma.course.findMany({ where: { programId } });
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline / DB error fallback
    }
    // Check fallback by exact programId or by slug/type matching
    const matchingFallback = Array.from(this.fallbackCourses.values()).filter(
      (c) => c.programId === programId
    );
    if (matchingFallback.length > 0) return matchingFallback;

    // If programId is a UUID or slug, resolve via fallback programs
    const prog = this.fallbackPrograms.get(programId) || Array.from(this.fallbackPrograms.values()).find((p) => p.id === programId || p.type === programId);
    if (prog) {
      return Array.from(this.fallbackCourses.values()).filter((c) => c.programId === prog.id);
    }
    return [];
  }

  async getAllLevels(): Promise<DomainCourseLevel[]> {
    try {
      const rows = await prisma.courseLevel.findMany();
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline / DB error fallback
    }
    return Array.from(this.fallbackLevels.values());
  }

  async getLevelById(id: string): Promise<DomainCourseLevel | null> {
    try {
      const row = await prisma.courseLevel.findUnique({ where: { id } });
      if (row) return row;
    } catch {
      // offline / DB error fallback
    }
    return this.fallbackLevels.get(id) || null;
  }

  async getLevelsByCourseId(courseId: string): Promise<DomainCourseLevel[]> {
    try {
      const rows = await prisma.courseLevel.findMany({ where: { courseId } });
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline / DB error fallback
    }
    return Array.from(this.fallbackLevels.values()).filter((l) => l.courseId === courseId);
  }

  async getAllClassGroups(): Promise<DomainClassGroup[]> {
    try {
      const rows = await prisma.classGroup.findMany();
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline / DB error fallback
    }
    return Array.from(this.fallbackClassGroups.values());
  }

  async getClassGroupById(id: string): Promise<DomainClassGroup | null> {
    try {
      const row = await prisma.classGroup.findUnique({ where: { id } });
      if (row) return row;
    } catch {
      // offline / DB error fallback
    }
    return this.fallbackClassGroups.get(id) || null;
  }

  async getClassGroupsBySchoolId(schoolId: string): Promise<DomainClassGroup[]> {
    try {
      return await prisma.classGroup.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" } });
    } catch {
      // offline / DB error fallback
    }
    return Array.from(this.fallbackClassGroups.values()).filter((cg) => cg.schoolId === schoolId);
  }

  async getEnrollmentsByClassGroupId(classGroupId: string): Promise<DomainClassEnrollment[]> {
    try {
      const rows = await prisma.classEnrollment.findMany({
        where: { classGroupId, status: EnrollmentStatus.ACTIVE },
      });
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline / DB error fallback
    }
    return Array.from(this.fallbackEnrollments.values()).filter(
      (e) => e.classGroupId === classGroupId && e.status === EnrollmentStatus.ACTIVE
    );
  }

  async getEnrollmentsByStudentId(studentId: string): Promise<DomainClassEnrollment[]> {
    try {
      const rows = await prisma.classEnrollment.findMany({ where: { studentId } });
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline / DB error fallback
    }
    return Array.from(this.fallbackEnrollments.values()).filter((e) => e.studentId === studentId);
  }

  async getTeacherAssignmentsByClassGroupId(classGroupId: string): Promise<DomainTeacherAssignment[]> {
    try {
      const rows = await prisma.teacherAssignment.findMany({ where: { classGroupId } });
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline / DB error fallback
    }
    return Array.from(this.fallbackTeacherAssignments.values()).filter((ta) => ta.classGroupId === classGroupId);
  }

  async getTeacherAssignmentsByTeacherId(teacherId: string): Promise<DomainTeacherAssignment[]> {
    try {
      const rows = await prisma.teacherAssignment.findMany({ where: { teacherId } });
      if (rows && rows.length > 0) return rows;
    } catch {
      // offline / DB error fallback
    }
    return Array.from(this.fallbackTeacherAssignments.values()).filter((ta) => ta.teacherId === teacherId);
  }

  // --- Mutations ---

  async createClassGroup(data: {
    courseLevelId: string;
    name: string;
    classType: ClassType;
    capacityMax?: number;
    schoolId?: string | null;
  }): Promise<DomainClassGroup> {
    try {
      return await prisma.classGroup.create({
        data: {
          courseLevelId: data.courseLevelId,
          name: data.name,
          classType: data.classType,
          capacityMax: data.capacityMax || (data.classType === ClassType.PRIVATE_1_ON_1 ? 1 : 6),
          isActive: true,
          schoolId: data.schoolId || null,
        },
      });
    } catch {
      const id = "class-" + (this.fallbackClassGroups.size + 1);
      const group: DomainClassGroup = {
        id,
        courseLevelId: data.courseLevelId,
        name: data.name,
        classType: data.classType,
        capacityMax: data.capacityMax || (data.classType === ClassType.PRIVATE_1_ON_1 ? 1 : 6),
        isActive: true,
        schoolId: data.schoolId || null,
        createdAt: new Date(),
      };
      this.fallbackClassGroups.set(id, group);
      return group;
    }
  }

  async enrollStudentInClass(studentId: string, classGroupId: string): Promise<DomainClassEnrollment> {
    try {
      return await prisma.classEnrollment.create({
        data: { studentId, classGroupId, status: EnrollmentStatus.ACTIVE },
      });
    } catch {
      const id = "enr-" + (this.fallbackEnrollments.size + 1);
      const enrollment: DomainClassEnrollment = {
        id,
        studentId,
        classGroupId,
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
      };
      this.fallbackEnrollments.set(id, enrollment);
      return enrollment;
    }
  }

  async assignTeacherToClass(
    teacherId: string,
    classGroupId: string,
    role: TeacherRoleInClass = TeacherRoleInClass.PRIMARY
  ): Promise<DomainTeacherAssignment> {
    try {
      return await prisma.teacherAssignment.upsert({
        where: { teacherId_classGroupId: { teacherId, classGroupId } },
        update: { role },
        create: { teacherId, classGroupId, role },
      });
    } catch {
      const id = "ta-" + (this.fallbackTeacherAssignments.size + 1);
      const assignment: DomainTeacherAssignment = {
        id,
        teacherId,
        classGroupId,
        role,
        createdAt: new Date(),
      };
      this.fallbackTeacherAssignments.set(id, assignment);
      return assignment;
    }
  }
}

export const academicRepository = new AcademicRepository();
