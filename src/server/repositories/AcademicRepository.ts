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
  private isDbAvailable: boolean = true;
  private lastDbFailureTime: number = 0;
  private readonly DB_RETRY_INTERVAL_MS = 60000;

  private canQueryDb(): boolean {
    if (!this.isDbAvailable) {
      if (Date.now() - this.lastDbFailureTime > this.DB_RETRY_INTERVAL_MS) {
        this.isDbAvailable = true;
        return true;
      }
      return false;
    }
    return true;
  }

  private handleDbError() {
    this.isDbAvailable = false;
    this.lastDbFailureTime = Date.now();
  }

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

    // 2. Accredited Courses (4 age-group tracks per program = 28 courses)
    const courses: DomainCourse[] = [
      // Program 1: Foundations (prog-foundations)
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
        titleAr: "الأصوات والتراكيب التأسيسية (7-10 سنوات)",
        titleEn: "Foundational Phonemes & Word Building (Ages 7-10)",
        descriptionAr: "إتقان أشكال الحروف في مواضعها المختلفة والحركات القصيرة والطويلة",
        descriptionEn: "Mastery of letter forms in all positions and short vowel diacritics",
      },
      {
        id: "course-foundations-navigators",
        programId: "prog-foundations",
        titleAr: "تأصيل قواعد الإملاء وبناء الكلمة (11-13 سنة)",
        titleEn: "Orthography Foundations & Word Construction (Ages 11-13)",
        descriptionAr: "إتقان رسم الهمزات وقواعد الإملاء الصعبة وتحليل بنية الكلمة الصرفية",
        descriptionEn: "Mastery of hamza orthography, complex spelling conventions, and morphological roots",
      },
      {
        id: "course-foundations-scholars",
        programId: "prog-foundations",
        titleAr: "فقه اللغة وأسرار البناء النحوي والصرفي (14-16 سنة)",
        titleEn: "Arabic Philology & Morpho-Syntax (Ages 14-16)",
        descriptionAr: "دراسة معمقة لأصول النحو العربي وفقه المعاجم والمصادر وبناء التراكيب البلاغية",
        descriptionEn: "Advanced study of syntactic architecture, classical lexicography, and rhetorical structures",
      },

      // Program 2: Reading (prog-reading)
      {
        id: "course-reading-sprouts",
        programId: "prog-reading",
        titleAr: "القراءة المبكرة والوعي الصوتي للبراعم (4-6 سنوات)",
        titleEn: "Early Reading & Phonemic Awareness for Sprouts (Ages 4-6)",
        descriptionAr: "التهجئة التفاعلية، ربط الصوت بالرمز، وقراءة الكلمات البسيطة المصورة",
        descriptionEn: "Interactive blending, phoneme-grapheme mapping, and reading simple sight words",
      },
      {
        id: "course-reading-explorers",
        programId: "prog-reading",
        titleAr: "القراءة والطلاقة للمستكشفين (7-10 سنوات)",
        titleEn: "Reading Fluency for Junior Explorers (Ages 7-10)",
        descriptionAr: "منهج تفاعلي يركز على الطلاقة القرائية وقراءة القصص الهادفة",
        descriptionEn: "Interactive curriculum focusing on reading speed, phonics, and comprehension",
      },
      {
        id: "course-reading-analytical",
        programId: "prog-reading",
        titleAr: "القراءة التحليلية والتذوق الأدبي (11-13 سنة)",
        titleEn: "Analytical Reading & Literature Appreciation (Ages 11-13)",
        descriptionAr: "قراءة نصوص متقدمة واستنتاج المعاني وتذوق البلاغة العربية",
        descriptionEn: "Advanced text analysis, contextual comprehension, and literary appreciation",
      },
      {
        id: "course-reading-scholars",
        programId: "prog-reading",
        titleAr: "روائع الأدب العربي والتحليل النقدي (14-16 سنة)",
        titleEn: "Arabic Literary Masterpieces & Critical Analysis (Ages 14-16)",
        descriptionAr: "القراءة النقدية لنصوص من عيون الأدب العربي القديم والمعاصر واستيعاب السياق الحضاري",
        descriptionEn: "Critical and analytical reading of classical and contemporary Arabic masterpieces",
      },

      // Program 3: Writing (prog-writing)
      {
        id: "course-writing-sprouts",
        programId: "prog-writing",
        titleAr: "ما قبل الكتابة والتهيئة العضلية للبراعم (4-6 سنوات)",
        titleEn: "Pre-Writing & Fine Motor Readiness for Sprouts (Ages 4-6)",
        descriptionAr: "تنمية التآزر البصري الحركي، مسك القلم السليم، وتتبع مسارات الحروف المنقطة",
        descriptionEn: "Visual-motor integration, proper pencil grip, and dotted letter path tracing",
      },
      {
        id: "course-writing-naskh",
        programId: "prog-writing",
        titleAr: "جماليات الخط العربي وقواعد النسخ (7-10 سنوات)",
        titleEn: "Naskh Calligraphy & Handwriting Aesthetics (Ages 7-10)",
        descriptionAr: "تحسين الخط العربي، ضبط حركة القلم على السطر، ومحاكاة النماذج الأصيلة",
        descriptionEn: "Arabic penmanship mastery, baseline alignment, and authentic Naskh script",
      },
      {
        id: "course-writing-creative",
        programId: "prog-writing",
        titleAr: "التعبير الإنشائي والقصصي للرواد (11-13 سنة)",
        titleEn: "Narrative Composition & Mini-Essays (Ages 11-13)",
        descriptionAr: "بناء الجمل المتناسقة، توظيف علامات الترقيم، وتأليف القصص والمقالات المصغرة",
        descriptionEn: "Sentence synthesis, paragraph cohesion, punctuation, and narrative essay writing",
      },
      {
        id: "course-writing-scholars",
        programId: "prog-writing",
        titleAr: "خط الرقعة والديواني والمقالة الفكرية (14-16 سنة)",
        titleEn: "Ruq'ah, Diwani Calligraphy & Argumentative Essays (Ages 14-16)",
        descriptionAr: "إتقان خطي الرقعة والديواني، وصياغة مقالات فكرية ونقدية متماسكة ذات حجج وبراهين",
        descriptionEn: "Mastering Ruq'ah and Diwani scripts alongside argumentative and critical essays",
      },

      // Program 4: Speaking (prog-speaking)
      {
        id: "course-speaking-sprouts",
        programId: "prog-speaking",
        titleAr: "التعبير الشفهي والمحادثة باللعب للبراعم (4-6 سنوات)",
        titleEn: "Oral Expression & Playful Dialogue for Sprouts (Ages 4-6)",
        descriptionAr: "التحدث عن الصور، التعبير عن الذات باللغة الفصحى، وبناء الثقة في التحدث",
        descriptionEn: "Picture storytelling, expressing needs and feelings in simple Standard Arabic",
      },
      {
        id: "course-speaking-junior",
        programId: "prog-speaking",
        titleAr: "المتحدث الفصيح الصغير (7-10 سنوات)",
        titleEn: "The Eloquent Young Speaker (Ages 7-10)",
        descriptionAr: "فصول حوارية تفاعلية لتنمية مهارات التحدث والتعبير عن النفس بطلاقة",
        descriptionEn: "Interactive conversational sessions to build confidence and natural spoken fluency",
      },
      {
        id: "course-speaking-dialogue",
        programId: "prog-speaking",
        titleAr: "فنون الخطابة والعرض والإلقاء (11-13 سنة)",
        titleEn: "Public Speaking, Presentations & Debates (Ages 11-13)",
        descriptionAr: "مواقف حياتية وحوارات تفاعلية ومناظرات مصغرة تعزز الحجة والبيان",
        descriptionEn: "Real-world conversational scenarios, structured presentations, and classroom debates",
      },
      {
        id: "course-speaking-scholars",
        programId: "prog-speaking",
        titleAr: "المناظرات الفكرية والبلاغة والارتجال (14-16 سنة)",
        titleEn: "Intellectual Debates, Rhetoric & Impromptu Speaking (Ages 14-16)",
        descriptionAr: "تدريب متقدم على فن المناظرة، الإقناع المنطقي، والخطابة الارتجالية الفصيحة",
        descriptionEn: "Advanced training in debate logic, persuasive rhetoric, and impromptu classical oratory",
      },

      // Program 5: Listening (prog-listening)
      {
        id: "course-listening-phonemes",
        programId: "prog-listening",
        titleAr: "أذن واعية وأصوات ممتعة للبراعم (4-6 سنوات)",
        titleEn: "Attentive Ear & Auditory Discovery (Ages 4-6)",
        descriptionAr: "تنمية حاسة الاستماع والتمييز الصوتي بين الحروف المتشابهة ومخارجها",
        descriptionEn: "Auditory discrimination, minimal pairs phoneme practice, and listening agility",
      },
      {
        id: "course-listening-comprehension",
        programId: "prog-listening",
        titleAr: "الاستماع النشط وفهم الحكايات المسموعة (7-10 سنوات)",
        titleEn: "Active Auditory Comprehension & Story Listening (Ages 7-10)",
        descriptionAr: "الاستماع للقصص التراثية واستخلاص الأفكار الرئيسة والتفاصيل الدقيقة",
        descriptionEn: "Listening to Arabic folklore and classic stories with comprehension checkpoints",
      },
      {
        id: "course-listening-navigators",
        programId: "prog-listening",
        titleAr: "الاستماع النقدي وتحليل الحوارات الإذاعية (11-13 سنة)",
        titleEn: "Critical Listening & Audio Analysis (Ages 11-13)",
        descriptionAr: "تحليل النبر والتنغيم واستخلاص الدلالات الضمنية في المواد الصوتية المعقدة",
        descriptionEn: "Analyzing intonation, subtext, and implied meanings in complex audio discussions",
      },
      {
        id: "course-listening-scholars",
        programId: "prog-listening",
        titleAr: "فقه السماع وتحليل المحاضرات الفكرية (14-16 سنة)",
        titleEn: "Academic Discourse & Classical Listening (Ages 14-16)",
        descriptionAr: "استيعاب المحاضرات الأكاديمية والندوات والمناظرات واستخلاص الحجج العقلية",
        descriptionEn: "Comprehending academic lectures and seminars, evaluating rational arguments",
      },

      // Program 6: Quran & Tajweed (prog-quran)
      {
        id: "course-quran-sprouts",
        programId: "prog-quran",
        titleAr: "براعم القرآن وحفظ قصار السور بالترديد (4-6 سنوات)",
        titleEn: "Quran Sprouts & Short Surah Chanting (Ages 4-6)",
        descriptionAr: "التلقين الصوتي الشفهي من سورة الفاتحة إلى سورة الناس مع تصحيح المخارج",
        descriptionEn: "Oral repetition of short surahs (Al-Fatiha to An-Nas) with phoneme precision",
      },
      {
        id: "course-quran-juz-amma",
        programId: "prog-quran",
        titleAr: "نور البيان وتلاوة جزء عم (7-10 سنوات)",
        titleEn: "Noor Al-Bayan & Juz Amma Recitation (Ages 7-10)",
        descriptionAr: "تلاوة وحفظ جزء عم مع أحكام التجويد الأساسية ومخارج الحروف السليمة",
        descriptionEn: "Quranic recitation of Juz Amma with foundational Tajweed rules and correct Makharij",
      },
      {
        id: "course-quran-tajweed",
        programId: "prog-quran",
        titleAr: "تجويد جزء تبارك والإتقان الصوتي (11-13 سنة)",
        titleEn: "Juz Tabarak & Applied Tajweed Mastery (Ages 11-13)",
        descriptionAr: "تطبيق قواعد التجويد الملونة (النون الساكنة، المدود، القلقلة) وتثبيت جزء تبارك",
        descriptionEn: "Applied color-coded Tajweed (Noon Sakinah, Madd, Qalqalah) and Juz Tabarak",
      },
      {
        id: "course-quran-scholars",
        programId: "prog-quran",
        titleAr: "تأصيل علم التجويد والمقامات والوقف والابتداء (14-16 سنة)",
        titleEn: "Advanced Tajweed Acoustics & Waqf Mastery (Ages 14-16)",
        descriptionAr: "دراسة متن الجزرية وأحكام الوقف والابتداء المتقدمة ومخارج وصفات الحروف التفصيلية",
        descriptionEn: "Study of classical Tajweed texts (Al-Jazariyyah), detailed phonological acoustics, and waqf",
      },

      // Program 7: Islamic Studies (prog-islamic)
      {
        id: "course-islamic-sprouts",
        programId: "prog-islamic",
        titleAr: "براعم الإيمان والآداب المصورة (4-6 سنوات)",
        titleEn: "Sprouts of Faith & Illustrated Manners (Ages 4-6)",
        descriptionAr: "أذكار الصباح والمساء المصورة، آداب الطعام والنوم، وغرس محبة الله ورسوله",
        descriptionEn: "Illustrated morning and evening adhkar, daily manners, and loving Allah and His Prophet",
      },
      {
        id: "course-islamic-akhlaq",
        programId: "prog-islamic",
        titleAr: "أخلاق المسلم الصغير وقصص الأنبياء (7-10 سنوات)",
        titleEn: "Young Muslim Ethics & Prophetic Stories (Ages 7-10)",
        descriptionAr: "غرس القيم والآداب الإسلامية (الصدق، بر الوالدين، الأمانة) وقصص الرسل المصورة",
        descriptionEn: "Islamic morals (honesty, filial piety, trustworthiness) and illustrated prophetic stories",
      },
      {
        id: "course-islamic-seerah",
        programId: "prog-islamic",
        titleAr: "السيرة النبوية وأعلام الحضارة الإسلامية (11-13 سنة)",
        titleEn: "Prophetic Biography & Islamic Civilization Heroes (Ages 11-13)",
        descriptionAr: "محطات سيرة الحبيب المصطفى ﷺ وتاريخ أعلام الحضارة والاكتشافات العلمية",
        descriptionEn: "Milestones of the Prophet's ﷺ life and historic Muslim scholars and scientific discoveries",
      },
      {
        id: "course-islamic-scholars",
        programId: "prog-islamic",
        titleAr: "الفكر الإسلامي المعاصر وقضايا الهوية والأخلاق (14-16 سنة)",
        titleEn: "Contemporary Islamic Thought, Identity & Ethics (Ages 14-16)",
        descriptionAr: "ترسيخ الهوية الإسلامية، مناقشة القضايا الفكرية المعاصرة، وفلسفة الأخلاق",
        descriptionEn: "Consolidating Islamic worldview, navigating contemporary ethical issues and intellectual challenges",
      },
    ];

    for (const course of courses) {
      this.fallbackCourses.set(course.id, course);
    }

    // 3. Course Levels (4 age-group levels per program = 28 levels)
    const levels: DomainCourseLevel[] = [
      // 1. Foundations Levels
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
      {
        id: "level-b1-foundations",
        courseId: "course-foundations-navigators",
        levelCode: "B1",
        titleAr: "المستوى المتوسط - قواعد الإملاء ورسم الهمزات",
        titleEn: "Level B1 - Orthography & Hamza Rules",
        targetAge: AgeGroup.AGE_11_13,
      },
      {
        id: "level-b2-foundations",
        courseId: "course-foundations-scholars",
        levelCode: "B2",
        titleAr: "المستوى المتقدم - النحو التطبيقي وفقه اللغة",
        titleEn: "Level B2 - Applied Syntax & Classical Lexicography",
        targetAge: AgeGroup.AGE_14_16,
      },

      // 2. Reading Levels
      {
        id: "level-pre-a1-reading",
        courseId: "course-reading-sprouts",
        levelCode: "PRE_A1",
        titleAr: "المستوى التمهيدي - التهجئة المبكرة والوعي الصوتي",
        titleEn: "Pre-A1 - Early Blending & Sight Words",
        targetAge: AgeGroup.AGE_4_6,
      },
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
      {
        id: "level-b2-reading",
        courseId: "course-reading-scholars",
        levelCode: "B2",
        titleAr: "المستوى الرابع (B2) - عيون الأدب العربي والتحليل النقدي",
        titleEn: "Level B2 - Classical Poetry & Literary Critique",
        targetAge: AgeGroup.AGE_14_16,
      },

      // 3. Writing Levels
      {
        id: "level-pre-a1-writing",
        courseId: "course-writing-sprouts",
        levelCode: "PRE_A1",
        titleAr: "المستوى التمهيدي - مسك القلم وتتبع المسارات",
        titleEn: "Pre-A1 - Pen Control & Letter Tracing",
        targetAge: AgeGroup.AGE_4_6,
      },
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
      {
        id: "level-b1-writing",
        courseId: "course-writing-creative",
        levelCode: "B1",
        titleAr: "المستوى الثالث (B1) - التعبير الإنشائي والقصصي",
        titleEn: "Level B1 - Creative Writing & Essay Synthesis",
        targetAge: AgeGroup.AGE_11_13,
      },
      {
        id: "level-b2-writing",
        courseId: "course-writing-scholars",
        levelCode: "B2",
        titleAr: "المستوى الرابع (B2) - خط الرقعة والديواني والمقالة الفكرية",
        titleEn: "Level B2 - Advanced Scripts & Rhetorical Writing",
        targetAge: AgeGroup.AGE_14_16,
      },

      // 4. Speaking Levels
      {
        id: "level-pre-a1-speaking",
        courseId: "course-speaking-sprouts",
        levelCode: "PRE_A1",
        titleAr: "المستوى التمهيدي - التعبير الشفهي باللعب والصور",
        titleEn: "Pre-A1 - Picture Talking & Self-Expression",
        targetAge: AgeGroup.AGE_4_6,
      },
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
      {
        id: "level-b1-speaking",
        courseId: "course-speaking-dialogue",
        levelCode: "B1",
        titleAr: "المستوى الثالث (B1) - الإلقاء وفنون التقديم والمناظرة",
        titleEn: "Level B1 - Eloquent Presentation & Reasoned Dialogue",
        targetAge: AgeGroup.AGE_11_13,
      },
      {
        id: "level-b2-speaking",
        courseId: "course-speaking-scholars",
        levelCode: "B2",
        titleAr: "المستوى الرابع (B2) - المناظرات الفكرية والبلاغة والارتجال",
        titleEn: "Level B2 - Persuasive Oratory & Dialectical Debates",
        targetAge: AgeGroup.AGE_14_16,
      },

      // 5. Listening Levels
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
      {
        id: "level-b1-listening",
        courseId: "course-listening-navigators",
        levelCode: "B1",
        titleAr: "المستوى الثالث (B1) - الاستماع النقدي وتحليل الحوارات",
        titleEn: "Level B1 - Critical Audio Comprehension & Intonation",
        targetAge: AgeGroup.AGE_11_13,
      },
      {
        id: "level-b2-listening",
        courseId: "course-listening-scholars",
        levelCode: "B2",
        titleAr: "المستوى الرابع (B2) - فقه السماع وتحليل المحاضرات الأكاديمية",
        titleEn: "Level B2 - Academic Discourse & Dialectical Listening",
        targetAge: AgeGroup.AGE_14_16,
      },

      // 6. Quran Levels
      {
        id: "level-pre-a1-quran",
        courseId: "course-quran-sprouts",
        levelCode: "PRE_A1",
        titleAr: "المستوى التمهيدي - حفظ قصار السور بالترديد والتلقين",
        titleEn: "Pre-A1 - Oral Repetition: Short Surahs & Makharij",
        targetAge: AgeGroup.AGE_4_6,
      },
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
      {
        id: "level-b1-quran",
        courseId: "course-quran-tajweed",
        levelCode: "B1",
        titleAr: "المستوى الثالث (B1) - أحكام الميم وتثبيت جزء تبارك",
        titleEn: "Level B1 - Meem Sakinah, Madd & Juz Tabarak",
        targetAge: AgeGroup.AGE_11_13,
      },
      {
        id: "level-b2-quran",
        courseId: "course-quran-scholars",
        levelCode: "B2",
        titleAr: "المستوى الرابع (B2) - تأصيل علم التجويد والوقف والابتداء",
        titleEn: "Level B2 - Advanced Tajweed Acoustics & Memorization",
        targetAge: AgeGroup.AGE_14_16,
      },

      // 7. Islamic Studies Levels
      {
        id: "level-pre-a1-islamic",
        courseId: "course-islamic-sprouts",
        levelCode: "PRE_A1",
        titleAr: "المستوى التمهيدي - أذكار الطفل المسلم والآداب المصورة",
        titleEn: "Pre-A1 - Morning Adhkar, Kindness & Cleanliness",
        targetAge: AgeGroup.AGE_4_6,
      },
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
      {
        id: "level-b1-islamic",
        courseId: "course-islamic-seerah",
        levelCode: "B1",
        titleAr: "المستوى الثالث (B1) - العقيدة وسير أولي العزم والعلماء",
        titleEn: "Level B1 - Sound Creed, Resolute Prophets & Scholars",
        targetAge: AgeGroup.AGE_11_13,
      },
      {
        id: "level-b2-islamic",
        courseId: "course-islamic-scholars",
        levelCode: "B2",
        titleAr: "المستوى الرابع (B2) - الفكر الإسلامي المعاصر وقضايا الهوية",
        titleEn: "Level B2 - Applied Islamic Ethics & Worldview",
        targetAge: AgeGroup.AGE_14_16,
      },
    ];

    for (const lvl of levels) {
      this.fallbackLevels.set(lvl.id, lvl);
    }

    // 4. Active Micro-Cohorts across All 7 Programs & All 4 Age Groups (capped at max 6)
    const classGroups: DomainClassGroup[] = [
      // --- Foundations Cohorts ---
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
        name: "فصل السنابل الخضراء (A1 - وصل الحروف 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-foundations-b1-cohort1",
        courseLevelId: "level-b1-foundations",
        name: "فصل رواد الإملاء (B1 - قواعد الكتابة 11-13 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-foundations-b2-cohort1",
        courseLevelId: "level-b2-foundations",
        name: "فصل فرسان اللغة (B2 - النحو المعمق 14-16 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },

      // --- Reading Cohorts ---
      {
        id: "class-reading-pre-a1-cohort1",
        courseLevelId: "level-pre-a1-reading",
        name: "فصل عصافير الجنة (Pre-A1 - التهجئة المبكرة 4-6 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-reading-a1-cohort1",
        courseLevelId: "level-a1-reading",
        name: "فصل النجوم (A1 - القراءة والطلاقة 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-reading-a2-cohort1",
        courseLevelId: "level-a2-reading",
        name: "فصل فرسان القراءة (A2 - القصص والطلاقة 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-reading-b1-cohort1",
        courseLevelId: "level-b1-reading",
        name: "فصل نقاد الأدب (B1 - القراءة التحليلية 11-13 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-reading-b2-cohort1",
        courseLevelId: "level-b2-reading",
        name: "فصل رواد البلاغة (B2 - عيون الأدب العربي 14-16 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },

      // --- Writing Cohorts ---
      {
        id: "class-writing-pre-a1-cohort1",
        courseLevelId: "level-pre-a1-writing",
        name: "فصل أقلام البراعم (Pre-A1 - تتبع مسارات الحروف 4-6 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-writing-a1-cohort1",
        courseLevelId: "level-a1-writing",
        name: "فصل خطاطي المستقبل (A1 - تحسين الخط العربي 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-writing-a2-cohort1",
        courseLevelId: "level-a2-writing",
        name: "فصل البيان والإنشاء (A2 - التعبير الكتابي 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-writing-b1-cohort1",
        courseLevelId: "level-b1-writing",
        name: "فصل فرسان القلم (B1 - الإنشاء والقصة 11-13 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-writing-b2-cohort1",
        courseLevelId: "level-b2-writing",
        name: "فصل الأدباء الشباب (B2 - المقالة الفكرية والخطوط 14-16 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },

      // --- Speaking Cohorts ---
      {
        id: "class-speaking-pre-a1-cohort1",
        courseLevelId: "level-pre-a1-speaking",
        name: "فصل البلابل المغردة (Pre-A1 - المحادثة باللعب 4-6 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-speaking-a1-cohort1",
        courseLevelId: "level-a1-speaking",
        name: "فصل الفصحاء الصغار (A1 - المحادثة اليومية 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-speaking-a2-cohort1",
        courseLevelId: "level-a2-speaking",
        name: "فصل منابر الخطابة (A2 - الإلقاء والحوار 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-speaking-b1-cohort1",
        courseLevelId: "level-b1-speaking",
        name: "فصل خطباء الغد (B1 - المناظرة والإلقاء 11-13 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-speaking-b2-cohort1",
        courseLevelId: "level-b2-speaking",
        name: "فصل منتدى الفرسان (B2 - المناظرات الفكرية 14-16 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },

      // --- Listening Cohorts ---
      {
        id: "class-listening-pre-a1-cohort1",
        courseLevelId: "level-pre-a1-listening",
        name: "فصل المستمع الذكي (Pre-A1 - تمييز الأصوات 4-6 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-listening-a1-cohort1",
        courseLevelId: "level-a1-listening",
        name: "فصل الاستيعاب والتحليل الصوتي (A1 - الاستماع النشط 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-listening-b1-cohort1",
        courseLevelId: "level-b1-listening",
        name: "فصل الأذن الناقدة (B1 - تحليل المحتوى الصوتي 11-13 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-listening-b2-cohort1",
        courseLevelId: "level-b2-listening",
        name: "فصل مجالس السماع (B2 - تحليل المحاضرات الأكاديمية 14-16 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },

      // --- Quran & Tajweed Cohorts ---
      {
        id: "class-quran-pre-a1-cohort1",
        courseLevelId: "level-pre-a1-quran",
        name: "حلقة براعم النور (Pre-A1 - قصار السور بالترديد 4-6 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-quran-a1-cohort1",
        courseLevelId: "level-a1-quran",
        name: "حلقة الفردوس (A1 - حفظ وتجويد قصار السور 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-quran-a2-cohort1",
        courseLevelId: "level-a2-quran",
        name: "حلقة الماهر بالقرآن (A2 - تلاوة وأحكام متقدمة 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-quran-b1-cohort1",
        courseLevelId: "level-b1-quran",
        name: "حلقة حفاظ الرواد (B1 - جزء تبارك والتجويد 11-13 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-quran-b2-cohort1",
        courseLevelId: "level-b2-quran",
        name: "حلقة الإتقان والإجازة (B2 - علم التجويد والوقف 14-16 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },

      // --- Islamic Studies Cohorts ---
      {
        id: "class-islamic-pre-a1-cohort1",
        courseLevelId: "level-pre-a1-islamic",
        name: "فصل زهور الإيمان (Pre-A1 - الآداب المصورة 4-6 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-islamic-a1-cohort1",
        courseLevelId: "level-a1-islamic",
        name: "فصل رواد الأخلاق والقيم (A1 - القيم النبوية 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-islamic-a2-cohort1",
        courseLevelId: "level-a2-islamic",
        name: "فصل بناة الحضارة الإسلامية (A2 - السيرة النبوية 7-10 سنوات)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-islamic-b1-cohort1",
        courseLevelId: "level-b1-islamic",
        name: "فصل قادة الغد (B1 - العقيدة وتاريخ الحضارة 11-13 سنة)",
        classType: ClassType.GROUP,
        capacityMax: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "class-islamic-b2-cohort1",
        courseLevelId: "level-b2-islamic",
        name: "فصل علماء المستقبل (B2 - الفكر الإسلامي والهوية 14-16 سنة)",
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
      {
        id: "ta-15",
        teacherId: "teacher-4",
        classGroupId: "class-foundations-b1-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
      {
        id: "ta-16",
        teacherId: "teacher-4",
        classGroupId: "class-foundations-b2-cohort1",
        role: TeacherRoleInClass.PRIMARY,
        createdAt: new Date(),
      },
    ];

    for (const ta of teacherAssignments) {
      this.fallbackTeacherAssignments.set(ta.id, ta);
    }

    // Ensure every fallback class group has at least one primary specialist teacher assigned
    const defaultTeacherIds = ["teacher-1", "teacher-2", "teacher-3", "teacher-4"];
    let teacherIdx = 0;
    for (const cg of classGroups) {
      const hasAssignment = Array.from(this.fallbackTeacherAssignments.values()).some(
        (ta) => ta.classGroupId === cg.id
      );
      if (!hasAssignment) {
        const id = "ta-" + (this.fallbackTeacherAssignments.size + 1);
        this.fallbackTeacherAssignments.set(id, {
          id,
          teacherId: defaultTeacherIds[teacherIdx % defaultTeacherIds.length],
          classGroupId: cg.id,
          role: TeacherRoleInClass.PRIMARY,
          createdAt: new Date(),
        });
        teacherIdx++;
      }
    }
  }

  // --- Queries ---

  async getAllPrograms(): Promise<DomainProgram[]> {
    if (this.canQueryDb()) {
      try {
        const rows = await prisma.program.findMany({ orderBy: { titleAr: "asc" } });
        if (rows && rows.length > 0) return rows;
      } catch {
        this.handleDbError();
      }
    }
    return Array.from(this.fallbackPrograms.values());
  }

  async getProgramById(id: string): Promise<DomainProgram | null> {
    if (this.canQueryDb()) {
      try {
        const row = await prisma.program.findUnique({ where: { id } });
        if (row) return row;
      } catch {
        this.handleDbError();
      }
    }
    return this.fallbackPrograms.get(id) || Array.from(this.fallbackPrograms.values()).find((p) => p.type === id) || null;
  }

  async getAllCourses(): Promise<DomainCourse[]> {
    if (this.canQueryDb()) {
      try {
        const rows = await prisma.course.findMany();
        if (rows && rows.length > 0) return rows;
      } catch {
        this.handleDbError();
      }
    }
    return Array.from(this.fallbackCourses.values());
  }

  async getCourseById(id: string): Promise<DomainCourse | null> {
    if (this.canQueryDb()) {
      try {
        const row = await prisma.course.findUnique({ where: { id } });
        if (row) return row;
      } catch {
        this.handleDbError();
      }
    }
    return this.fallbackCourses.get(id) || null;
  }

  async getCoursesByProgramId(programId: string): Promise<DomainCourse[]> {
    if (this.canQueryDb()) {
      try {
        const rows = await prisma.course.findMany({ where: { programId } });
        if (rows && rows.length > 0) return rows;
      } catch {
        this.handleDbError();
      }
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
    if (this.canQueryDb()) {
      try {
        const rows = await prisma.courseLevel.findMany();
        if (rows && rows.length > 0) return rows;
      } catch {
        this.handleDbError();
      }
    }
    return Array.from(this.fallbackLevels.values());
  }

  async getLevelById(id: string): Promise<DomainCourseLevel | null> {
    if (this.canQueryDb()) {
      try {
        const row = await prisma.courseLevel.findUnique({ where: { id } });
        if (row) return row;
      } catch {
        this.handleDbError();
      }
    }
    return this.fallbackLevels.get(id) || null;
  }

  async getLevelsByCourseId(courseId: string): Promise<DomainCourseLevel[]> {
    if (this.canQueryDb()) {
      try {
        const rows = await prisma.courseLevel.findMany({ where: { courseId } });
        if (rows && rows.length > 0) return rows;
      } catch {
        this.handleDbError();
      }
    }
    return Array.from(this.fallbackLevels.values()).filter((l) => l.courseId === courseId);
  }

  async getAllClassGroups(): Promise<DomainClassGroup[]> {
    if (this.canQueryDb()) {
      try {
        const rows = await prisma.classGroup.findMany();
        if (rows && rows.length > 0) return rows;
      } catch {
        this.handleDbError();
      }
    }
    return Array.from(this.fallbackClassGroups.values());
  }

  async getClassGroupById(id: string): Promise<DomainClassGroup | null> {
    if (this.canQueryDb()) {
      try {
        const row = await prisma.classGroup.findUnique({ where: { id } });
        if (row) return row;
      } catch {
        this.handleDbError();
      }
    }
    return this.fallbackClassGroups.get(id) || null;
  }

  async getClassGroupsBySchoolId(schoolId: string): Promise<DomainClassGroup[]> {
    if (this.canQueryDb()) {
      try {
        return await prisma.classGroup.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" } });
      } catch {
        this.handleDbError();
      }
    }
    return Array.from(this.fallbackClassGroups.values()).filter((cg) => cg.schoolId === schoolId);
  }

  async getEnrollmentsByClassGroupId(classGroupId: string): Promise<DomainClassEnrollment[]> {
    if (this.canQueryDb()) {
      try {
        const rows = await prisma.classEnrollment.findMany({
          where: { classGroupId, status: EnrollmentStatus.ACTIVE },
        });
        if (rows && rows.length > 0) return rows;
      } catch {
        this.handleDbError();
      }
    }
    return Array.from(this.fallbackEnrollments.values()).filter(
      (e) => e.classGroupId === classGroupId && e.status === EnrollmentStatus.ACTIVE
    );
  }

  async getEnrollmentsByStudentId(studentId: string): Promise<DomainClassEnrollment[]> {
    if (this.canQueryDb()) {
      try {
        const rows = await prisma.classEnrollment.findMany({ where: { studentId } });
        if (rows && rows.length > 0) return rows;
      } catch {
        this.handleDbError();
      }
    }
    return Array.from(this.fallbackEnrollments.values()).filter((e) => e.studentId === studentId);
  }

  async getTeacherAssignmentsByClassGroupId(classGroupId: string): Promise<DomainTeacherAssignment[]> {
    if (this.canQueryDb()) {
      try {
        const rows = await prisma.teacherAssignment.findMany({ where: { classGroupId } });
        if (rows && rows.length > 0) return rows;
      } catch {
        this.handleDbError();
      }
    }
    return Array.from(this.fallbackTeacherAssignments.values()).filter((ta) => ta.classGroupId === classGroupId);
  }

  async getTeacherAssignmentsByTeacherId(teacherId: string): Promise<DomainTeacherAssignment[]> {
    if (this.canQueryDb()) {
      try {
        const rows = await prisma.teacherAssignment.findMany({ where: { teacherId } });
        if (rows && rows.length > 0) return rows;
      } catch {
        this.handleDbError();
      }
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

  async updateClassGroup(
    id: string,
    data: {
      name?: string;
      capacityMax?: number;
      courseLevelId?: string;
      classType?: ClassType;
      schoolId?: string | null;
    }
  ): Promise<DomainClassGroup | null> {
    try {
      return await prisma.classGroup.update({
        where: { id },
        data: {
          name: data.name,
          capacityMax: data.capacityMax,
          courseLevelId: data.courseLevelId,
          classType: data.classType,
          schoolId: data.schoolId,
        },
      });
    } catch {
      const existing = this.fallbackClassGroups.get(id);
      if (!existing) return null;
      const updated: DomainClassGroup = {
        ...existing,
        ...data,
      };
      this.fallbackClassGroups.set(id, updated);
      return updated;
    }
  }

  async deleteClassGroup(id: string): Promise<boolean> {
    try {
      await prisma.classGroup.delete({ where: { id } });
      return true;
    } catch {
      return this.fallbackClassGroups.delete(id);
    }
  }

  async unenrollStudent(studentId: string, classGroupId: string): Promise<boolean> {
    try {
      await prisma.classEnrollment.updateMany({
        where: { studentId, classGroupId },
        data: { status: EnrollmentStatus.DROPPED },
      });
      return true;
    } catch {
      for (const [id, enr] of this.fallbackEnrollments.entries()) {
        if (enr.studentId === studentId && enr.classGroupId === classGroupId) {
          enr.status = EnrollmentStatus.DROPPED;
          this.fallbackEnrollments.set(id, enr);
        }
      }
      return true;
    }
  }
}

export const academicRepository = new AcademicRepository();
