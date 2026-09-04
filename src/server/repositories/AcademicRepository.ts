import {
  DomainProgram,
  DomainCourse,
  DomainCourseLevel,
  DomainClassGroup,
  DomainClassEnrollment,
  DomainTeacherAssignment,
} from "./types";
import { ProgramType, AgeGroup, ClassType, EnrollmentStatus, TeacherRoleInClass } from "@prisma/client";

class InMemoryAcademicRepository {
  private programs: Map<string, DomainProgram> = new Map();
  private courses: Map<string, DomainCourse> = new Map();
  private levels: Map<string, DomainCourseLevel> = new Map();
  private classGroups: Map<string, DomainClassGroup> = new Map();
  private enrollments: Map<string, DomainClassEnrollment> = new Map();
  private teacherAssignments: Map<string, DomainTeacherAssignment> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // 1. The 7 Programs from PROJECT_BRIEF.md
    const programsData = [
      {
        id: "prog-foundations",
        type: ProgramType.ARABIC_FOUNDATIONS,
        titleAr: "أساسيات اللغة العربية",
        titleEn: "Arabic Foundations",
        descriptionAr: "التعرف على الحروف وأشكالها وأصواتها وبناء المفردات الأولى",
        descriptionEn: "Alphabet recognition, letter forms, and foundational vocabulary",
      },
      {
        id: "prog-reading",
        type: ProgramType.READING_PROGRAM,
        titleAr: "برنامج القراءة والطلاقة",
        titleEn: "Reading & Fluency Program",
        descriptionAr: "الصوتيات، الطلاقة القرائية، وفهم النصوص المصورة",
        descriptionEn: "Phonics, reading fluency, and comprehension",
      },
      {
        id: "prog-writing",
        type: ProgramType.WRITING_PROGRAM,
        titleAr: "برنامج الكتابة والخط العربي",
        titleEn: "Writing & Penmanship",
        descriptionAr: "تحسين الخط العربي، تركيب الجمل، والتعبير الكتابي",
        descriptionEn: "Handwriting, sentence construction, and creative writing",
      },
      {
        id: "prog-speaking",
        type: ProgramType.SPEAKING_PROGRAM,
        titleAr: "برنامج المحادثة والنطق",
        titleEn: "Speaking & Conversation",
        descriptionAr: "تصحيح المخارج، الحوار اليومي، والتحدث بطلاقة",
        descriptionEn: "Pronunciation, daily conversation, and public speaking",
      },
      {
        id: "prog-listening",
        type: ProgramType.LISTENING_PROGRAM,
        titleAr: "برنامج الاستماع والفهم",
        titleEn: "Listening & Comprehension",
        descriptionAr: "الاستماع للقصص، والتمارين الصوتية التفاعلية",
        descriptionEn: "Story listening and interactive auditory exercises",
      },
      {
        id: "prog-quran",
        type: ProgramType.QURAN_TAJWEED,
        titleAr: "برنامج القرآن الكريم والتجويد",
        titleEn: "Quran & Tajweed",
        descriptionAr: "تلاوة متقنة، حفظ وتثبيت، وأحكام التجويد العملية",
        descriptionEn: "Quran reading, memorization, and applied Tajweed",
      },
      {
        id: "prog-islamic",
        type: ProgramType.ISLAMIC_STUDIES,
        titleAr: "برنامج الدراسات والقيم الإسلامية",
        titleEn: "Islamic Studies",
        descriptionAr: "قصص الأنبياء المصورة، والمعارف والقيم الإسلامية الأصيلة",
        descriptionEn: "Prophetic stories and moral Islamic ethics",
      },
    ];

    for (const p of programsData) {
      this.programs.set(p.id, p);
    }

    // 2. Courses (All 7 Programs)
    // Program 1: Foundations
    this.courses.set("course-foundations-sprouts", {
      id: "course-foundations-sprouts",
      programId: "prog-foundations",
      titleAr: "حروف وكلمات لبراعمنا الصغار",
      titleEn: "Alphabet and Words for Little Sprouts",
      descriptionAr: "منهج مرح قائم على التعلم باللعب والأغاني التعليمية والتعرف على الحروف",
      descriptionEn: "Playful early foundation curriculum through songs, games, and letter recognition",
    });
    this.courses.set("course-foundations-sound", {
      id: "course-foundations-sound",
      programId: "prog-foundations",
      titleAr: "التأسيس القرائي السليم",
      titleEn: "Sound Reading Foundations",
      descriptionAr: "إتقان مخارج الحروف وأشكالها في جميع مواقع الكلمة والحركات القصيرة",
      descriptionEn: "Mastery of letter forms in all positions and short vowel diacritics",
    });

    // Program 2: Reading
    this.courses.set("course-reading-explorers", {
      id: "course-reading-explorers",
      programId: "prog-reading",
      titleAr: "القراءة والطلاقة للمستكشفين",
      titleEn: "Reading Fluency for Junior Explorers",
      descriptionAr: "منهج تفاعلي يركز على الطلاقة القرائية وقراءة القصص الهادفة",
      descriptionEn: "Interactive curriculum focusing on reading speed, phonics, and comprehension",
    });
    this.courses.set("course-reading-analytical", {
      id: "course-reading-analytical",
      programId: "prog-reading",
      titleAr: "القراءة التحليلية والتذوق الأدبي",
      titleEn: "Analytical Reading & Literature Appreciation",
      descriptionAr: "قراءة نصوص متقدمة واستنتاج المعاني وتذوق البلاغة العربية",
      descriptionEn: "Advanced text analysis, contextual comprehension, and literary appreciation",
    });

    // Program 3: Writing
    this.courses.set("course-writing-naskh", {
      id: "course-writing-naskh",
      programId: "prog-writing",
      titleAr: "جماليات الخط العربي وقواعد النسخ",
      titleEn: "Naskh Calligraphy & Handwriting Aesthetics",
      descriptionAr: "تحسين الخط العربي، ضبط حركة القلم على السطر، ومحاكاة النماذج الأصيلة",
      descriptionEn: "Arabic penmanship mastery, baseline alignment, and authentic Naskh script",
    });
    this.courses.set("course-writing-creative", {
      id: "course-writing-creative",
      programId: "prog-writing",
      titleAr: "التعبير الكتابي وتأليف النصوص",
      titleEn: "Creative Writing & Sentence Composition",
      descriptionAr: "بناء الجمل المتناسقة، توظيف علامات الترقيم، وتأليف القصص المصورة",
      descriptionEn: "Sentence synthesis, paragraph cohesion, punctuation, and creative storytelling",
    });

    // Program 4: Speaking
    this.courses.set("course-speaking-junior", {
      id: "course-speaking-junior",
      programId: "prog-speaking",
      titleAr: "المتحدث الفصيح الصغير",
      titleEn: "The Eloquent Young Speaker",
      descriptionAr: "فصول حوارية تفاعلية لتنمية مهارات التحدث والتعبير عن النفس بطلاقة",
      descriptionEn: "Interactive conversational sessions to build confidence and natural spoken fluency",
    });
    this.courses.set("course-speaking-dialogue", {
      id: "course-speaking-dialogue",
      programId: "prog-speaking",
      titleAr: "المحادثة الحياتية والفصاحة التلقائية",
      titleEn: "Daily Conversation & Spontaneous Eloquence",
      descriptionAr: "مواقف حياتية تحاكي الواقع باللغة العربية الفصحى مع المرشد الذكي فصيح",
      descriptionEn: "Real-world conversational scenarios in Standard Arabic with the AI tutor Faseeh",
    });

    // Program 5: Listening
    this.courses.set("course-listening-phonemes", {
      id: "course-listening-phonemes",
      programId: "prog-listening",
      titleAr: "أذن واعية وأصوات ممتعة",
      titleEn: "Attentive Ear & Auditory Discovery",
      descriptionAr: "تنمية حاسة الاستماع والتمييز الصوتي بين الحروف المتشابهة ومخارجها",
      descriptionEn: "Auditory discrimination, minimal pairs phoneme practice, and listening agility",
    });
    this.courses.set("course-listening-comprehension", {
      id: "course-listening-comprehension",
      programId: "prog-listening",
      titleAr: "الاستماع النشط وفهم الحكايات المسموعة",
      titleEn: "Active Auditory Comprehension & Story Listening",
      descriptionAr: "الاستماع للقصص التراثية واستخلاص الأفكار الرئيسة والتفاصيل الدقيقة",
      descriptionEn: "Listening to Arabic folklore and classic stories with comprehension checkpoints",
    });

    // Program 6: Quran & Tajweed
    this.courses.set("course-quran-juz-amma", {
      id: "course-quran-juz-amma",
      programId: "prog-quran",
      titleAr: "نور البيان وتلاوة جزء عم",
      titleEn: "Noor Al-Bayan & Juz Amma Recitation",
      descriptionAr: "تلاوة وحفظ جزء عم مع أحكام التجويد الأساسية ومخارج الحروف السليمة",
      descriptionEn: "Quranic recitation of Juz Amma with foundational Tajweed rules and correct Makharij",
    });
    this.courses.set("course-quran-tajweed", {
      id: "course-quran-tajweed",
      programId: "prog-quran",
      titleAr: "التجويد المصور وحلقات التثبيت",
      titleEn: "Visual Applied Tajweed & Memorization Mastery",
      descriptionAr: "تطبيق قواعد التجويد الملونة (النون الساكنة، المدود، القلقلة) وتثبيت الحفظ",
      descriptionEn: "Applied color-coded Tajweed (Noon Sakinah, Madd, Qalqalah) with retention tracking",
    });

    // Program 7: Islamic Studies
    this.courses.set("course-islamic-akhlaq", {
      id: "course-islamic-akhlaq",
      programId: "prog-islamic",
      titleAr: "أخلاق المسلم الصغير وقصص الأنبياء",
      titleEn: "Young Muslim Ethics & Prophetic Stories",
      descriptionAr: "غرس القيم والآداب الإسلامية (الصدق، بر الوالدين، الأمانة) وقصص الرسل المصورة",
      descriptionEn: "Islamic morals (honesty, filial piety, trustworthiness) and illustrated prophetic stories",
    });
    this.courses.set("course-islamic-seerah", {
      id: "course-islamic-seerah",
      programId: "prog-islamic",
      titleAr: "السيرة النبوية والقيم المعاصرة",
      titleEn: "Prophetic Biography, Values & Modern Character",
      descriptionAr: "محطات سيرة الحبيب المصطفى ﷺ وتطبيق تعاليمها في الحياة اليومية المعاصرة",
      descriptionEn: "Milestones of the Prophet's ﷺ life and practical contemporary application",
    });

    // 3. Course Levels (All 7 Programs)
    // Foundations Levels
    this.levels.set("level-pre-a1-sprouts", {
      id: "level-pre-a1-sprouts",
      courseId: "course-foundations-sprouts",
      levelCode: "PRE_A1",
      titleAr: "المستوى التمهيدي - التعرف على أصوات الحروف",
      titleEn: "Pre-A1 - Letter Sounds & Recognition",
      targetAge: AgeGroup.AGE_4_6,
    });
    this.levels.set("level-a1-foundations", {
      id: "level-a1-foundations",
      courseId: "course-foundations-sound",
      levelCode: "A1",
      titleAr: "المستوى الأول - وصل الحروف والحركات القصيرة",
      titleEn: "Level A1 - Letter Connections & Short Vowels",
      targetAge: AgeGroup.AGE_7_10,
    });

    // Reading Levels
    this.levels.set("level-a1-reading", {
      id: "level-a1-reading",
      courseId: "course-reading-explorers",
      levelCode: "A1",
      titleAr: "المستوى الأول (A1) - الحروف والكلمات المركبة",
      titleEn: "Level A1 - Compound Letters & Words",
      targetAge: AgeGroup.AGE_7_10,
    });
    this.levels.set("level-a2-reading", {
      id: "level-a2-reading",
      courseId: "course-reading-explorers",
      levelCode: "A2",
      titleAr: "المستوى الثاني (A2) - القصص المصورة والطلاقة",
      titleEn: "Level A2 - Short Stories & Reading Fluency",
      targetAge: AgeGroup.AGE_7_10,
    });
    this.levels.set("level-b1-reading", {
      id: "level-b1-reading",
      courseId: "course-reading-analytical",
      levelCode: "B1",
      titleAr: "المستوى الثالث (B1) - القراءة التحليلية والفهم المتقدم",
      titleEn: "Level B1 - Analytical Reading & Advanced Comprehension",
      targetAge: AgeGroup.AGE_11_13,
    });

    // Writing Levels
    this.levels.set("level-a1-writing", {
      id: "level-a1-writing",
      courseId: "course-writing-naskh",
      levelCode: "A1",
      titleAr: "المستوى الأول (A1) - ضبط رسم الحروف على السطر",
      titleEn: "Level A1 - Baseline Stroke Mechanics & Penmanship",
      targetAge: AgeGroup.AGE_7_10,
    });
    this.levels.set("level-a2-writing", {
      id: "level-a2-writing",
      courseId: "course-writing-creative",
      levelCode: "A2",
      titleAr: "المستوى الثاني (A2) - تركيب الجمل وعلامات الترقيم",
      titleEn: "Level A2 - Sentence Construction & Punctuation",
      targetAge: AgeGroup.AGE_7_10,
    });

    // Speaking Levels
    this.levels.set("level-a1-speaking", {
      id: "level-a1-speaking",
      courseId: "course-speaking-junior",
      levelCode: "A1",
      titleAr: "المستوى الأول (A1) - التعارف والتعبير اليومي",
      titleEn: "Level A1 - Daily Greetings & Self-Introduction",
      targetAge: AgeGroup.AGE_7_10,
    });
    this.levels.set("level-a2-speaking", {
      id: "level-a2-speaking",
      courseId: "course-speaking-dialogue",
      levelCode: "A2",
      titleAr: "المستوى الثاني (A2) - الحوارات الحياتية وفنون الإلقاء",
      titleEn: "Level A2 - Situational Dialogues & Public Presentation",
      targetAge: AgeGroup.AGE_7_10,
    });

    // Listening Levels
    this.levels.set("level-pre-a1-listening", {
      id: "level-pre-a1-listening",
      courseId: "course-listening-phonemes",
      levelCode: "PRE_A1",
      titleAr: "المستوى التمهيدي - التمييز السمعي للأصوات المتقاربة",
      titleEn: "Pre-A1 - Phonemic Discrimination & Minimal Pairs",
      targetAge: AgeGroup.AGE_4_6,
    });
    this.levels.set("level-a1-listening", {
      id: "level-a1-listening",
      courseId: "course-listening-comprehension",
      levelCode: "A1",
      titleAr: "المستوى الأول (A1) - استماع الحكايات وتتبع التوجيهات",
      titleEn: "Level A1 - Audio Story Following & Direct Instruction",
      targetAge: AgeGroup.AGE_7_10,
    });

    // Quran Levels
    this.levels.set("level-a1-quran", {
      id: "level-a1-quran",
      courseId: "course-quran-juz-amma",
      levelCode: "A1",
      titleAr: "المستوى الأول (A1) - قصار السور وأحكام القلقلة",
      titleEn: "Level A1 - Short Surahs & Qalqalah Mastery",
      targetAge: AgeGroup.AGE_7_10,
    });
    this.levels.set("level-a2-quran", {
      id: "level-a2-quran",
      courseId: "course-quran-tajweed",
      levelCode: "A2",
      titleAr: "المستوى الثاني (A2) - أحكام النون الساكنة والمدود",
      titleEn: "Level A2 - Noon Sakinah, Tanween & Madd",
      targetAge: AgeGroup.AGE_7_10,
    });

    // Islamic Studies Levels
    this.levels.set("level-a1-islamic", {
      id: "level-a1-islamic",
      courseId: "course-islamic-akhlaq",
      levelCode: "A1",
      titleAr: "المستوى الأول (A1) - أركان الإسلام والآداب اليومية",
      titleEn: "Level A1 - Pillars of Islam & Daily Adab",
      targetAge: AgeGroup.AGE_7_10,
    });
    this.levels.set("level-a2-islamic", {
      id: "level-a2-islamic",
      courseId: "course-islamic-seerah",
      levelCode: "A2",
      titleAr: "المستوى الثاني (A2) - أركان الإيمان وقصص أولي العزم",
      titleEn: "Level A2 - Pillars of Faith & Resolute Prophets",
      targetAge: AgeGroup.AGE_7_10,
    });

    // 4. Class Groups (Cohorts across All 7 Programs - max 6 students)
    // Program 2: Reading Cohorts (class-reading-a1-cohort1 first for existing test parity)
    this.classGroups.set("class-reading-a1-cohort1", {
      id: "class-reading-a1-cohort1",
      courseLevelId: "level-a1-reading",
      name: "فصل النجوم (A1 - القراءة والطلاقة)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });
    this.classGroups.set("class-reading-a2-cohort1", {
      id: "class-reading-a2-cohort1",
      courseLevelId: "level-a2-reading",
      name: "فصل فرسان القراءة (A2 - القصص والطلاقة)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });

    // Program 1: Foundations Cohorts
    this.classGroups.set("class-sprouts-cohort1", {
      id: "class-sprouts-cohort1",
      courseLevelId: "level-pre-a1-sprouts",
      name: "فصل الفراشات (براعم 4-6 سنوات - التأسيس)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });
    this.classGroups.set("class-foundations-a1-cohort1", {
      id: "class-foundations-a1-cohort1",
      courseLevelId: "level-a1-foundations",
      name: "فصل السنابل الخضراء (A1 - وصل الحروف)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });

    // Program 3: Writing Cohorts
    this.classGroups.set("class-writing-a1-cohort1", {
      id: "class-writing-a1-cohort1",
      courseLevelId: "level-a1-writing",
      name: "فصل خطاطي المستقبل (A1 - تحسين الخط العربي)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });
    this.classGroups.set("class-writing-a2-cohort1", {
      id: "class-writing-a2-cohort1",
      courseLevelId: "level-a2-writing",
      name: "فصل البيان والإنشاء (A2 - التعبير الكتابي)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });

    // Program 4: Speaking Cohorts
    this.classGroups.set("class-speaking-a1-cohort1", {
      id: "class-speaking-a1-cohort1",
      courseLevelId: "level-a1-speaking",
      name: "فصل الفصحاء الصغار (A1 - المحادثة اليومية)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });
    this.classGroups.set("class-speaking-a2-cohort1", {
      id: "class-speaking-a2-cohort1",
      courseLevelId: "level-a2-speaking",
      name: "فصل منابر الخطابة (A2 - الإلقاء والحوار التفاعلي)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });

    // Program 5: Listening Cohorts
    this.classGroups.set("class-listening-pre-a1-cohort1", {
      id: "class-listening-pre-a1-cohort1",
      courseLevelId: "level-pre-a1-listening",
      name: "فصل المستمع الذكي (Pre-A1 - تمييز الأصوات)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });
    this.classGroups.set("class-listening-a1-cohort1", {
      id: "class-listening-a1-cohort1",
      courseLevelId: "level-a1-listening",
      name: "فصل الاستيعاب والتحليل الصوتي (A1 - الاستماع النشط)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });

    // Program 6: Quran Cohorts
    this.classGroups.set("class-quran-a1-cohort1", {
      id: "class-quran-a1-cohort1",
      courseLevelId: "level-a1-quran",
      name: "حلقة الفردوس (A1 - حفظ وتجويد قصار السور)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });
    this.classGroups.set("class-quran-a2-cohort1", {
      id: "class-quran-a2-cohort1",
      courseLevelId: "level-a2-quran",
      name: "حلقة الماهر بالقرآن (A2 - تلاوة وأحكام متقدمة)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });

    // Program 7: Islamic Studies Cohorts
    this.classGroups.set("class-islamic-a1-cohort1", {
      id: "class-islamic-a1-cohort1",
      courseLevelId: "level-a1-islamic",
      name: "فصل رواد الأخلاق والقيم (A1 - القيم النبوية)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });
    this.classGroups.set("class-islamic-a2-cohort1", {
      id: "class-islamic-a2-cohort1",
      courseLevelId: "level-a2-islamic",
      name: "فصل بناة الحضارة الإسلامية (A2 - السيرة النبوية)",
      classType: ClassType.GROUP,
      capacityMax: 6,
      isActive: true,
      createdAt: new Date(),
    });

    // 5. Enrollments (Real Students across Programs)
    this.enrollments.set("enr-1", {
      id: "enr-1",
      studentId: "student-1", // Zayd
      classGroupId: "class-reading-a1-cohort1",
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
    });
    this.enrollments.set("enr-2", {
      id: "enr-2",
      studentId: "student-2", // Maryam
      classGroupId: "class-sprouts-cohort1",
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
    });
    this.enrollments.set("enr-3", {
      id: "enr-3",
      studentId: "student-1", // Zayd also enrolled in Quran
      classGroupId: "class-quran-a1-cohort1",
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
    });
    this.enrollments.set("enr-4", {
      id: "enr-4",
      studentId: "student-3", // Yusuf
      classGroupId: "class-writing-a1-cohort1",
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
    });
    this.enrollments.set("enr-5", {
      id: "enr-5",
      studentId: "student-3", // Yusuf also in Speaking
      classGroupId: "class-speaking-a1-cohort1",
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
    });
    this.enrollments.set("enr-6", {
      id: "enr-6",
      studentId: "student-4", // Sarah in Islamic Studies
      classGroupId: "class-islamic-a1-cohort1",
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
    });
    this.enrollments.set("enr-7", {
      id: "enr-7",
      studentId: "student-2", // Maryam in Listening
      classGroupId: "class-listening-pre-a1-cohort1",
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
    });

    // 6. Teacher Assignments (Specialist Teachers across All Programs)
    // Ustadh Ahmed (Reading & Quran)
    this.teacherAssignments.set("ta-1", {
      id: "ta-1",
      teacherId: "teacher-1",
      classGroupId: "class-reading-a1-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });
    this.teacherAssignments.set("ta-2", {
      id: "ta-2",
      teacherId: "teacher-1",
      classGroupId: "class-reading-a2-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });
    this.teacherAssignments.set("ta-3", {
      id: "ta-3",
      teacherId: "teacher-1",
      classGroupId: "class-quran-a1-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });

    // Ustadha Fatima (Writing & Islamic Studies)
    this.teacherAssignments.set("ta-4", {
      id: "ta-4",
      teacherId: "teacher-2",
      classGroupId: "class-writing-a1-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });
    this.teacherAssignments.set("ta-5", {
      id: "ta-5",
      teacherId: "teacher-2",
      classGroupId: "class-writing-a2-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });
    this.teacherAssignments.set("ta-6", {
      id: "ta-6",
      teacherId: "teacher-2",
      classGroupId: "class-islamic-a1-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });
    this.teacherAssignments.set("ta-7", {
      id: "ta-7",
      teacherId: "teacher-2",
      classGroupId: "class-islamic-a2-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });

    // Sheikh Mahmoud (Quran & Advanced Speaking)
    this.teacherAssignments.set("ta-8", {
      id: "ta-8",
      teacherId: "teacher-3",
      classGroupId: "class-quran-a2-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });
    this.teacherAssignments.set("ta-9", {
      id: "ta-9",
      teacherId: "teacher-3",
      classGroupId: "class-speaking-a2-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });

    // Ustadha Layla (Foundations, Speaking & Listening)
    this.teacherAssignments.set("ta-10", {
      id: "ta-10",
      teacherId: "teacher-4",
      classGroupId: "class-sprouts-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });
    this.teacherAssignments.set("ta-11", {
      id: "ta-11",
      teacherId: "teacher-4",
      classGroupId: "class-foundations-a1-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });
    this.teacherAssignments.set("ta-12", {
      id: "ta-12",
      teacherId: "teacher-4",
      classGroupId: "class-speaking-a1-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });
    this.teacherAssignments.set("ta-13", {
      id: "ta-13",
      teacherId: "teacher-4",
      classGroupId: "class-listening-pre-a1-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });
    this.teacherAssignments.set("ta-14", {
      id: "ta-14",
      teacherId: "teacher-4",
      classGroupId: "class-listening-a1-cohort1",
      role: TeacherRoleInClass.PRIMARY,
      assignedAt: new Date(),
    });
  }

  // Queries
  async getAllPrograms(): Promise<DomainProgram[]> {
    return Array.from(this.programs.values());
  }

  async getProgramById(id: string): Promise<DomainProgram | null> {
    return this.programs.get(id) || null;
  }

  async getAllCourses(): Promise<DomainCourse[]> {
    return Array.from(this.courses.values());
  }

  async getCourseById(id: string): Promise<DomainCourse | null> {
    return this.courses.get(id) || null;
  }

  async getCoursesByProgramId(programId: string): Promise<DomainCourse[]> {
    return Array.from(this.courses.values()).filter((c) => c.programId === programId);
  }

  async getAllLevels(): Promise<DomainCourseLevel[]> {
    return Array.from(this.levels.values());
  }

  async getLevelById(id: string): Promise<DomainCourseLevel | null> {
    return this.levels.get(id) || null;
  }

  async getLevelsByCourseId(courseId: string): Promise<DomainCourseLevel[]> {
    return Array.from(this.levels.values()).filter((l) => l.courseId === courseId);
  }

  async getAllClassGroups(): Promise<DomainClassGroup[]> {
    return Array.from(this.classGroups.values());
  }

  async getClassGroupById(id: string): Promise<DomainClassGroup | null> {
    return this.classGroups.get(id) || null;
  }

  async getEnrollmentsByClassGroupId(classGroupId: string): Promise<DomainClassEnrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (e) => e.classGroupId === classGroupId && e.status === EnrollmentStatus.ACTIVE
    );
  }

  async getEnrollmentsByStudentId(studentId: string): Promise<DomainClassEnrollment[]> {
    return Array.from(this.enrollments.values()).filter((e) => e.studentId === studentId);
  }

  async getTeacherAssignmentsByClassGroupId(classGroupId: string): Promise<DomainTeacherAssignment[]> {
    return Array.from(this.teacherAssignments.values()).filter((ta) => ta.classGroupId === classGroupId);
  }

  async getTeacherAssignmentsByTeacherId(teacherId: string): Promise<DomainTeacherAssignment[]> {
    return Array.from(this.teacherAssignments.values()).filter((ta) => ta.teacherId === teacherId);
  }

  // Mutations
  async createClassGroup(data: {
    courseLevelId: string;
    name: string;
    classType: ClassType;
    capacityMax?: number;
  }): Promise<DomainClassGroup> {
    const id = "class-" + (this.classGroups.size + 1);
    const group: DomainClassGroup = {
      id,
      courseLevelId: data.courseLevelId,
      name: data.name,
      classType: data.classType,
      capacityMax: data.capacityMax || (data.classType === ClassType.PRIVATE_1_ON_1 ? 1 : 6),
      isActive: true,
      createdAt: new Date(),
    };
    this.classGroups.set(id, group);
    return group;
  }

  async enrollStudentInClass(studentId: string, classGroupId: string): Promise<DomainClassEnrollment> {
    const id = "enr-" + (this.enrollments.size + 1);
    const enrollment: DomainClassEnrollment = {
      id,
      studentId,
      classGroupId,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async assignTeacherToClass(
    teacherId: string,
    classGroupId: string,
    role: TeacherRoleInClass = TeacherRoleInClass.PRIMARY
  ): Promise<DomainTeacherAssignment> {
    const id = "ta-" + (this.teacherAssignments.size + 1);
    const assignment: DomainTeacherAssignment = {
      id,
      teacherId,
      classGroupId,
      role,
      assignedAt: new Date(),
    };
    this.teacherAssignments.set(id, assignment);
    return assignment;
  }
}

export const academicRepository = new InMemoryAcademicRepository();
