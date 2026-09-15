import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { RoleType, ProgramType, AgeGroup, ClassType, TeacherRoleInClass } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORARY, SECRET-PROTECTED, ONE-TIME UTILITY.
//
// AcademicRepository (courses, levels, class groups, teacher assignments)
// was an in-memory-only catalog -- real, until now nothing ever wrote this
// catalog into the actual database, even though the schema has supported
// it all along. This route seeds it for real, once, so that a real child
// (added through /register + /parent/children, now durable) can actually
// be enrolled into a real class taught by a real teacher.
//
// Gated by SEED_ADMIN_SECRET (already set in Vercel for the earlier
// seed-test-parent / apply-billing-schema-migration routes). Safe to call
// more than once: teachers are upserted by email, programs are upserted
// by type, and the course/level/class-group/assignment tree is only
// created the first time (skipped if any course already exists). Delete
// this file (or unset the env var) once you no longer need it.

const DEFAULT_PASSWORD = "Password123!"; // matches prisma/seed.ts's existing teacher accounts

const TEACHERS = [
  {
    email: "ustadha.fatima@kidsarabicacademy.internal",
    firstName: "فاطمة",
    lastName: "الزهراء الشامي",
    bioAr: "معلمة متخصصة في الخط العربي، التعبير الإبداعي، وأدب الأطفال العربي بخبرة 9 أعوام",
    bioEn: "Specialist instructor in Arabic calligraphy, creative writing, and children's literature with 9 years experience",
    experienceYears: 9,
    hourlyRateMinorUnits: 2800,
    languagesSpoken: "Arabic, French, English",
  },
  {
    email: "sheikh.mahmoud@kidsarabicacademy.internal",
    firstName: "محمود",
    lastName: "الأزهري",
    bioAr: "قارئ مجاز بالقراءات العشر ومتخصص في تدريس السيرة النبوية والدراسات الإسلامية للناشئة",
    bioEn: "Certified Quran reciter in the Ten Qira'at and educator in Islamic Studies & Seerah with 15 years experience",
    experienceYears: 15,
    hourlyRateMinorUnits: 3200,
    languagesSpoken: "Arabic, English",
  },
  {
    email: "ustadha.layla@kidsarabicacademy.internal",
    firstName: "ليلى",
    lastName: "نور الدين",
    bioAr: "خبيرة تأسيس الطفولة المبكرة، الأناشيد التعليمية، وتنمية الطلاقة الشفوية والاستماع",
    bioEn: "Early childhood Arabic specialist focusing on phonics games, spoken fluency, and audio comprehension with 8 years experience",
    experienceYears: 8,
    hourlyRateMinorUnits: 2700,
    languagesSpoken: "Arabic, English, Dutch",
  },
];

const PROGRAMS: { type: ProgramType; titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string }[] = [
  {
    type: ProgramType.ARABIC_FOUNDATIONS,
    titleAr: "أساسيات اللغة العربية",
    titleEn: "Arabic Foundations",
    descriptionAr: "التعرف على الحروف، أصواتها، بناء المفردات، وتدريبات القراءة الأولى للأطفال الصغار.",
    descriptionEn: "Alphabet recognition, letter sounds, vocabulary building, and initial reading practice.",
  },
  {
    type: ProgramType.READING_PROGRAM,
    titleAr: "برنامج القراءة والطلاقة",
    titleEn: "Reading & Fluency Program",
    descriptionAr: "الصوتيات، الطلاقة القرائية، الفهم والاستيعاب، والتعلم القائم على القصص الممتعة.",
    descriptionEn: "Phonics, reading fluency, reading comprehension, and story-based learning.",
  },
  {
    type: ProgramType.WRITING_PROGRAM,
    titleAr: "برنامج الكتابة والخط",
    titleEn: "Writing & Penmanship Program",
    descriptionAr: "تحسين الخط العربي، تركيب الجمل، التعبير الإبداعي، والتطبيقات النحوية المبسطة.",
    descriptionEn: "Handwriting, sentence formation, creative writing, and grammar practice.",
  },
  {
    type: ProgramType.SPEAKING_PROGRAM,
    titleAr: "برنامج المحادثة والنطق",
    titleEn: "Speaking & Conversation Program",
    descriptionAr: "تصحيح مخارج الحروف، الحوار اليومي التفاعلي، والتحدث بثقة أمام الجمهور.",
    descriptionEn: "Pronunciation refinement, interactive daily conversation, and public speaking.",
  },
  {
    type: ProgramType.LISTENING_PROGRAM,
    titleAr: "برنامج الاستماع والفهم",
    titleEn: "Listening & Comprehension Program",
    descriptionAr: "الاستماع إلى الحكايات، التمارين الصوتية، والتفاعل المباشر مع النصوص المسموعة.",
    descriptionEn: "Story listening, audio exercises, and interactive listening comprehension.",
  },
  {
    type: ProgramType.QURAN_TAJWEED,
    titleAr: "برنامج القرآن الكريم والتجويد",
    titleEn: "Quran & Tajweed Program",
    descriptionAr: "القراءة المتقنة، الحفظ والتثبيت، أحكام التجويد العملية، والمراجعة الدورية.",
    descriptionEn: "Quran reading, memorization, practical Tajweed rules, and systematic revision.",
  },
  {
    type: ProgramType.ISLAMIC_STUDIES,
    titleAr: "برنامج الدراسات الإسلامية",
    titleEn: "Islamic Studies for Children",
    descriptionAr: "المعارف الإسلامية الأساسية، قصص الأنبياء المصورة، وغرس القيم والأخلاق النبيلة.",
    descriptionEn: "Basic Islamic knowledge, illustrated prophetic stories, and core moral values.",
  },
];

const COURSES = [
  { key: "foundations-sprouts", programType: ProgramType.ARABIC_FOUNDATIONS, titleAr: "حروف وكلمات لبراعمنا الصغار", titleEn: "Alphabet and Words for Little Sprouts", descriptionAr: "منهج مرح قائم على التعلم باللعب والأغاني التعليمية والتعرف على الحروف", descriptionEn: "Playful early foundation curriculum through songs, games, and letter recognition" },
  { key: "foundations-sound", programType: ProgramType.ARABIC_FOUNDATIONS, titleAr: "التأسيس القرائي السليم", titleEn: "Sound Reading Foundations", descriptionAr: "إتقان مخارج الحروف وأشكالها في جميع مواقع الكلمة والحركات القصيرة", descriptionEn: "Mastery of letter forms in all positions and short vowel diacritics" },
  { key: "reading-explorers", programType: ProgramType.READING_PROGRAM, titleAr: "القراءة والطلاقة للمستكشفين", titleEn: "Reading Fluency for Junior Explorers", descriptionAr: "منهج تفاعلي يركز على الطلاقة القرائية وقراءة القصص الهادفة", descriptionEn: "Interactive curriculum focusing on reading speed, phonics, and comprehension" },
  { key: "reading-analytical", programType: ProgramType.READING_PROGRAM, titleAr: "القراءة التحليلية والتذوق الأدبي", titleEn: "Analytical Reading & Literature Appreciation", descriptionAr: "قراءة نصوص متقدمة واستنتاج المعاني وتذوق البلاغة العربية", descriptionEn: "Advanced text analysis, contextual comprehension, and literary appreciation" },
  { key: "writing-naskh", programType: ProgramType.WRITING_PROGRAM, titleAr: "جماليات الخط العربي وقواعد النسخ", titleEn: "Naskh Calligraphy & Handwriting Aesthetics", descriptionAr: "تحسين الخط العربي، ضبط حركة القلم على السطر، ومحاكاة النماذج الأصيلة", descriptionEn: "Arabic penmanship mastery, baseline alignment, and authentic Naskh script" },
  { key: "writing-creative", programType: ProgramType.WRITING_PROGRAM, titleAr: "التعبير الكتابي وتأليف النصوص", titleEn: "Creative Writing & Sentence Composition", descriptionAr: "بناء الجمل المتناسقة، توظيف علامات الترقيم، وتأليف القصص المصورة", descriptionEn: "Sentence synthesis, paragraph cohesion, punctuation, and creative storytelling" },
  { key: "speaking-junior", programType: ProgramType.SPEAKING_PROGRAM, titleAr: "المتحدث الفصيح الصغير", titleEn: "The Eloquent Young Speaker", descriptionAr: "فصول حوارية تفاعلية لتنمية مهارات التحدث والتعبير عن النفس بطلاقة", descriptionEn: "Interactive conversational sessions to build confidence and natural spoken fluency" },
  { key: "speaking-dialogue", programType: ProgramType.SPEAKING_PROGRAM, titleAr: "المحادثة الحياتية والفصاحة التلقائية", titleEn: "Daily Conversation & Spontaneous Eloquence", descriptionAr: "مواقف حياتية تحاكي الواقع باللغة العربية الفصحى مع المرشد الذكي فصيح", descriptionEn: "Real-world conversational scenarios in Standard Arabic with the AI tutor Faseeh" },
  { key: "listening-phonemes", programType: ProgramType.LISTENING_PROGRAM, titleAr: "أذن واعية وأصوات ممتعة", titleEn: "Attentive Ear & Auditory Discovery", descriptionAr: "تنمية حاسة الاستماع والتمييز الصوتي بين الحروف المتشابهة ومخارجها", descriptionEn: "Auditory discrimination, minimal pairs phoneme practice, and listening agility" },
  { key: "listening-comprehension", programType: ProgramType.LISTENING_PROGRAM, titleAr: "الاستماع النشط وفهم الحكايات المسموعة", titleEn: "Active Auditory Comprehension & Story Listening", descriptionAr: "الاستماع للقصص التراثية واستخلاص الأفكار الرئيسة والتفاصيل الدقيقة", descriptionEn: "Listening to Arabic folklore and classic stories with comprehension checkpoints" },
  { key: "quran-juz-amma", programType: ProgramType.QURAN_TAJWEED, titleAr: "نور البيان وتلاوة جزء عم", titleEn: "Noor Al-Bayan & Juz Amma Recitation", descriptionAr: "تلاوة وحفظ جزء عم مع أحكام التجويد الأساسية ومخارج الحروف السليمة", descriptionEn: "Quranic recitation of Juz Amma with foundational Tajweed rules and correct Makharij" },
  { key: "quran-tajweed", programType: ProgramType.QURAN_TAJWEED, titleAr: "التجويد المصور وحلقات التثبيت", titleEn: "Visual Applied Tajweed & Memorization Mastery", descriptionAr: "تطبيق قواعد التجويد الملونة (النون الساكنة، المدود، القلقلة) وتثبيت الحفظ", descriptionEn: "Applied color-coded Tajweed (Noon Sakinah, Madd, Qalqalah) with retention tracking" },
  { key: "islamic-akhlaq", programType: ProgramType.ISLAMIC_STUDIES, titleAr: "أخلاق المسلم الصغير وقصص الأنبياء", titleEn: "Young Muslim Ethics & Prophetic Stories", descriptionAr: "غرس القيم والآداب الإسلامية (الصدق، بر الوالدين، الأمانة) وقصص الرسل المصورة", descriptionEn: "Islamic morals (honesty, filial piety, trustworthiness) and illustrated prophetic stories" },
  { key: "islamic-seerah", programType: ProgramType.ISLAMIC_STUDIES, titleAr: "السيرة النبوية والقيم المعاصرة", titleEn: "Prophetic Biography, Values & Modern Character", descriptionAr: "محطات سيرة الحبيب المصطفى م وتطبيق تعاليمها في الحياة اليومية المعاصرة", descriptionEn: "Milestones of the Prophet's life and practical contemporary application" },
];

const LEVELS = [
  { key: "pre-a1-sprouts", courseKey: "foundations-sprouts", levelCode: "PRE_A1", titleAr: "المستوى التمهيدي - التعرف على أصوات الحروف", titleEn: "Pre-A1 - Letter Sounds & Recognition", targetAge: AgeGroup.AGE_4_6 },
  { key: "a1-foundations", courseKey: "foundations-sound", levelCode: "A1", titleAr: "المستوى الأول - وصل الحروف والحركات القصيرة", titleEn: "Level A1 - Letter Connections & Short Vowels", targetAge: AgeGroup.AGE_7_10 },
  { key: "a1-reading", courseKey: "reading-explorers", levelCode: "A1", titleAr: "المستوى الأول (A1) - الحروف والكلمات المركبة", titleEn: "Level A1 - Compound Letters & Words", targetAge: AgeGroup.AGE_7_10 },
  { key: "a2-reading", courseKey: "reading-explorers", levelCode: "A2", titleAr: "المستوى الثاني (A2) - القصص المصورة والطلاقة", titleEn: "Level A2 - Short Stories & Reading Fluency", targetAge: AgeGroup.AGE_7_10 },
  { key: "b1-reading", courseKey: "reading-analytical", levelCode: "B1", titleAr: "المستوى الثالث (B1) - القراءة التحليلية والفهم المتقدم", titleEn: "Level B1 - Analytical Reading & Advanced Comprehension", targetAge: AgeGroup.AGE_11_13 },
  { key: "a1-writing", courseKey: "writing-naskh", levelCode: "A1", titleAr: "المستوى الأول (A1) - ضبط رسم الحروف على السطر", titleEn: "Level A1 - Baseline Stroke Mechanics & Penmanship", targetAge: AgeGroup.AGE_7_10 },
  { key: "a2-writing", courseKey: "writing-creative", levelCode: "A2", titleAr: "المستوى الثاني (A2) - تركيب الجمل وعلامات الترقيم", titleEn: "Level A2 - Sentence Construction & Punctuation", targetAge: AgeGroup.AGE_7_10 },
  { key: "a1-speaking", courseKey: "speaking-junior", levelCode: "A1", titleAr: "المستوى الأول (A1) - التعارف والتعبير اليومي", titleEn: "Level A1 - Daily Greetings & Self-Introduction", targetAge: AgeGroup.AGE_7_10 },
  { key: "a2-speaking", courseKey: "speaking-dialogue", levelCode: "A2", titleAr: "المستوى الثاني (A2) - الحوارات الحياتية وفنون الإلقاء", titleEn: "Level A2 - Situational Dialogues & Public Presentation", targetAge: AgeGroup.AGE_7_10 },
  { key: "pre-a1-listening", courseKey: "listening-phonemes", levelCode: "PRE_A1", titleAr: "المستوى التمهيدي - التمييز السمعي للأصوات المتقاربة", titleEn: "Pre-A1 - Phonemic Discrimination & Minimal Pairs", targetAge: AgeGroup.AGE_4_6 },
  { key: "a1-listening", courseKey: "listening-comprehension", levelCode: "A1", titleAr: "المستوى الأول (A1) - استماع الحكايات وتتبع التوجيهات", titleEn: "Level A1 - Audio Story Following & Direct Instruction", targetAge: AgeGroup.AGE_7_10 },
  { key: "a1-quran", courseKey: "quran-juz-amma", levelCode: "A1", titleAr: "المستوى الأول (A1) - قصار السور وأحكام القلقلة", titleEn: "Level A1 - Short Surahs & Qalqalah Mastery", targetAge: AgeGroup.AGE_7_10 },
  { key: "a2-quran", courseKey: "quran-tajweed", levelCode: "A2", titleAr: "المستوى الثاني (A2) - أحكام النون الساكنة والمدود", titleEn: "Level A2 - Noon Sakinah, Tanween & Madd", targetAge: AgeGroup.AGE_7_10 },
  { key: "a1-islamic", courseKey: "islamic-akhlaq", levelCode: "A1", titleAr: "المستوى الأول (A1) - أركان الإسلام والآداب اليومية", titleEn: "Level A1 - Pillars of Islam & Daily Adab", targetAge: AgeGroup.AGE_7_10 },
  { key: "a2-islamic", courseKey: "islamic-seerah", levelCode: "A2", titleAr: "المستوى الثاني (A2) - أركان الإيمان وقصص أولي العزم", titleEn: "Level A2 - Pillars of Faith & Resolute Prophets", targetAge: AgeGroup.AGE_7_10 },
];

const CLASS_GROUPS = [
  { key: "reading-a1-cohort1", levelKey: "a1-reading", name: "فصل النجوم (A1 - القراءة والطلاقة)" },
  { key: "reading-a2-cohort1", levelKey: "a2-reading", name: "فصل فرسان القراءة (A2 - القصص والطلاقة)" },
  { key: "sprouts-cohort1", levelKey: "pre-a1-sprouts", name: "فصل الفراشات (براعم 4-6 سنوات - التأسيس)" },
  { key: "foundations-a1-cohort1", levelKey: "a1-foundations", name: "فصل السنابل الخضراء (A1 - وصل الحروف)" },
  { key: "writing-a1-cohort1", levelKey: "a1-writing", name: "فصل خطاطي المستقبل (A1 - تحسين الخط العربي)" },
  { key: "writing-a2-cohort1", levelKey: "a2-writing", name: "فصل البيان والإنشاء (A2 - التعبير الكتابي)" },
  { key: "speaking-a1-cohort1", levelKey: "a1-speaking", name: "فصل الفصحاء الصغار (A1 - المحادثة اليومية)" },
  { key: "speaking-a2-cohort1", levelKey: "a2-speaking", name: "فصل منابر الخطابة (A2 - الإلقاء والحوار التفاعلي)" },
  { key: "listening-pre-a1-cohort1", levelKey: "pre-a1-listening", name: "فصل المستمع الذكي (Pre-A1 - تمييز الأصوات)" },
  { key: "listening-a1-cohort1", levelKey: "a1-listening", name: "فصل الاستيعاب والتحليل الصوتي (A1 - الاستماع النشط)" },
  { key: "quran-a1-cohort1", levelKey: "a1-quran", name: "حلقة الفردوس (A1 - حفظ وتجويد قصار السور)" },
  { key: "quran-a2-cohort1", levelKey: "a2-quran", name: "حلقة الماهر بالقرآن (A2 - تلاوة وأحكام متقدمة)" },
  { key: "islamic-a1-cohort1", levelKey: "a1-islamic", name: "فصل رواد الأخلاق والقيم (A1 - القيم النبوية)" },
  { key: "islamic-a2-cohort1", levelKey: "a2-islamic", name: "فصل بناة الحضارة الإسلامية (A2 - السيرة النبوية)" },
];

const TEACHER_ASSIGNMENTS = [
  { teacherEmail: "ustadh.ahmed@kidsarabicacademy.internal", classGroupKey: "reading-a1-cohort1" },
  { teacherEmail: "ustadh.ahmed@kidsarabicacademy.internal", classGroupKey: "reading-a2-cohort1" },
  { teacherEmail: "ustadh.ahmed@kidsarabicacademy.internal", classGroupKey: "quran-a1-cohort1" },
  { teacherEmail: "ustadha.fatima@kidsarabicacademy.internal", classGroupKey: "writing-a1-cohort1" },
  { teacherEmail: "ustadha.fatima@kidsarabicacademy.internal", classGroupKey: "writing-a2-cohort1" },
  { teacherEmail: "ustadha.fatima@kidsarabicacademy.internal", classGroupKey: "islamic-a1-cohort1" },
  { teacherEmail: "ustadha.fatima@kidsarabicacademy.internal", classGroupKey: "islamic-a2-cohort1" },
  { teacherEmail: "sheikh.mahmoud@kidsarabicacademy.internal", classGroupKey: "quran-a2-cohort1" },
  { teacherEmail: "sheikh.mahmoud@kidsarabicacademy.internal", classGroupKey: "speaking-a2-cohort1" },
  { teacherEmail: "ustadha.layla@kidsarabicacademy.internal", classGroupKey: "sprouts-cohort1" },
  { teacherEmail: "ustadha.layla@kidsarabicacademy.internal", classGroupKey: "foundations-a1-cohort1" },
  { teacherEmail: "ustadha.layla@kidsarabicacademy.internal", classGroupKey: "speaking-a1-cohort1" },
  { teacherEmail: "ustadha.layla@kidsarabicacademy.internal", classGroupKey: "listening-pre-a1-cohort1" },
  { teacherEmail: "ustadha.layla@kidsarabicacademy.internal", classGroupKey: "listening-a1-cohort1" },
];

export async function GET(request: NextRequest) {
  const configuredSecret = process.env.SEED_ADMIN_SECRET;
  if (!configuredSecret) {
    return NextResponse.json({ error: "SEED_ADMIN_SECRET is not configured on the server." }, { status: 500 });
  }

  const providedSecret = request.nextUrl.searchParams.get("secret");
  if (!providedSecret || providedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const teacherRole = await prisma.role.findUnique({ where: { name: RoleType.TEACHER } });
  if (!teacherRole) {
    return NextResponse.json(
      { error: "The TEACHER role does not exist yet. Run the normal seed script (npm run db:seed) at least once first." },
      { status: 500 }
    );
  }

  // 1. Ensure all 4 teachers exist (teacher-1 / Ahmed is already created by
  // prisma/seed.ts -- this upserts it too, harmlessly, and adds the 3 that
  // only ever existed in the in-memory demo data).
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  for (const t of TEACHERS) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        passwordHash,
        localePreference: "ar",
        teacherProfile: {
          create: {
            firstName: t.firstName,
            lastName: t.lastName,
            bioAr: t.bioAr,
            bioEn: t.bioEn,
            experienceYears: t.experienceYears,
            hourlyRateMinorUnits: t.hourlyRateMinorUnits,
            languagesSpoken: t.languagesSpoken,
          },
        },
      },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: teacherRole.id } },
      update: {},
      create: { userId: user.id, roleId: teacherRole.id },
    });
  }

  const allTeacherProfiles = await prisma.teacherProfile.findMany({ include: { user: true } });
  const teacherIdByEmail = new Map(allTeacherProfiles.map((t) => [t.user.email, t.id]));

  // 2. Ensure all 7 programs exist (prisma/seed.ts already creates these;
  // upserting here too makes this route self-contained either way).
  const programIdByType = new Map<ProgramType, string>();
  for (const p of PROGRAMS) {
    const program = await prisma.program.upsert({
      where: { type: p.type },
      update: {},
      create: p,
    });
    programIdByType.set(p.type, program.id);
  }

  // 3. Courses -> Levels -> Class Groups -> Teacher Assignments, only the
  // first time this runs (no natural unique key to upsert these against).
  const existingCourseCount = await prisma.course.count();
  let catalogSeeded = false;

  if (existingCourseCount === 0) {
    const courseIdByKey = new Map<string, string>();
    for (const c of COURSES) {
      const programId = programIdByType.get(c.programType);
      if (!programId) continue;
      const created = await prisma.course.create({
        data: { programId, titleAr: c.titleAr, titleEn: c.titleEn, descriptionAr: c.descriptionAr, descriptionEn: c.descriptionEn },
      });
      courseIdByKey.set(c.key, created.id);
    }

    const levelIdByKey = new Map<string, string>();
    for (const l of LEVELS) {
      const courseId = courseIdByKey.get(l.courseKey);
      if (!courseId) continue;
      const created = await prisma.courseLevel.create({
        data: { courseId, levelCode: l.levelCode, titleAr: l.titleAr, titleEn: l.titleEn, targetAge: l.targetAge },
      });
      levelIdByKey.set(l.key, created.id);
    }

    const classGroupIdByKey = new Map<string, string>();
    for (const cg of CLASS_GROUPS) {
      const courseLevelId = levelIdByKey.get(cg.levelKey);
      if (!courseLevelId) continue;
      const created = await prisma.classGroup.create({
        data: { courseLevelId, name: cg.name, classType: ClassType.GROUP, capacityMax: 6, isActive: true },
      });
      classGroupIdByKey.set(cg.key, created.id);
    }

    for (const ta of TEACHER_ASSIGNMENTS) {
      const teacherId = teacherIdByEmail.get(ta.teacherEmail);
      const classGroupId = classGroupIdByKey.get(ta.classGroupKey);
      if (!teacherId || !classGroupId) continue;
      await prisma.teacherAssignment.upsert({
        where: { teacherId_classGroupId: { teacherId, classGroupId } },
        update: {},
        create: { teacherId, classGroupId, role: TeacherRoleInClass.PRIMARY },
      });
    }

    catalogSeeded = true;
  }

  return NextResponse.json({
    message: catalogSeeded
      ? "Academic catalog seeded: 7 programs, 14 courses, 15 levels, 14 class groups, 14 teacher assignments, 4 teachers."
      : "Courses already existed -- catalog seeding skipped (teachers/programs were still ensured/upserted).",
    reminder: "Delete this route (src/app/api/admin/seed-academic-catalog) or remove SEED_ADMIN_SECRET from Vercel once you're done.",
  });
}
