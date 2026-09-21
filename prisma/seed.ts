import { PrismaClient, RoleType, ProgramType, AgeGroup, PlanType, BillingInterval } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Kids Arabic Academy database...");

  // 1. Seed Roles
  const roles = Object.values(RoleType);
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `System role for ${roleName}`,
      },
    });
  }
  console.log("✅ Roles seeded.");

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 2. Seed Admin Users
  const superAdminUser = await prisma.user.upsert({
    where: { email: "superadmin@arabickidsacademy.com" },
    update: {},
    create: {
      email: "superadmin@arabickidsacademy.com",
      passwordHash: defaultPasswordHash,
      localePreference: "ar",
      adminProfile: {
        create: {
          firstName: "طارق",
          lastName: "المشرف",
          scope: RoleType.SUPER_ADMIN,
        },
      },
    },
  });

  const superRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleType.SUPER_ADMIN } });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdminUser.id, roleId: superRole.id } },
    update: {},
    create: { userId: superAdminUser.id, roleId: superRole.id },
  });

  // 3. Seed Teachers
  const teacherRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleType.TEACHER } });
  const teacher1User = await prisma.user.upsert({
    where: { email: "ustadh.ahmed@kidsarabicacademy.internal" },
    update: {},
    create: {
      email: "ustadh.ahmed@kidsarabicacademy.internal",
      passwordHash: defaultPasswordHash,
      localePreference: "ar",
      teacherProfile: {
        create: {
          firstName: "أحمد",
          lastName: "المنصوري",
          bioAr: "أستاذ متخصص في تعليم القراءة والتجويد بخبرة 12 عاماً للأطفال",
          bioEn: "Specialist Arabic & Tajweed instructor with 12 years of experience for children",
          hourlyRateMinorUnits: 3000, // $30.00
          languagesSpoken: "Arabic, English",
        },
      },
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: teacher1User.id, roleId: teacherRole.id } },
    update: {},
    create: { userId: teacher1User.id, roleId: teacherRole.id },
  });

  // 4. Seed Programs (7 tracks from PROJECT_BRIEF.md)
  const programsData = [
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

  for (const prog of programsData) {
    await prisma.program.upsert({
      where: { type: prog.type },
      update: prog,
      create: prog,
    });
  }
  console.log("✅ 7 Academic Programs seeded.");

  // 5. Seed Achievement Badges
  const badgesData = [
    {
      code: "READING_CHAMPION",
      titleAr: "بطل القراءة",
      titleEn: "Reading Champion",
      iconUrl: "/badges/reading-champion.svg",
      xpReward: 150,
    },
    {
      code: "GRAMMAR_MASTER",
      titleAr: "فارس النحو",
      titleEn: "Grammar Master",
      iconUrl: "/badges/grammar-master.svg",
      xpReward: 200,
    },
    {
      code: "QURAN_STAR",
      titleAr: "نجم القرآن",
      titleEn: "Quran Star",
      iconUrl: "/badges/quran-star.svg",
      xpReward: 250,
    },
    {
      code: "PERFECT_ATTENDANCE",
      titleAr: "الملتزم المتميز",
      titleEn: "Perfect Attendance",
      iconUrl: "/badges/perfect-attendance.svg",
      xpReward: 100,
    },
  ];

  for (const badge of badgesData) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    });
  }
  console.log("✅ Gamification Badges seeded.");

  // 6. Seed Plans (reduced by 35%)
  const plansData = [
    {
      type: PlanType.GROUP,
      nameAr: "الباقة الجماعية (فصول تفاعلية صغيرة)",
      nameEn: "Group Classes (Small Cohort)",
      priceMinorUnits: 5135, // $51.35 / month (was $79.00 - 35% off)
      interval: BillingInterval.MONTHLY,
    },
    {
      type: PlanType.PRIVATE_1_ON_1,
      nameAr: "باقة الدروس الخاصة (معلم خاص)",
      nameEn: "Private 1-on-1 Lessons",
      priceMinorUnits: 9685, // $96.85 / month (was $149.00 - 35% off)
      interval: BillingInterval.MONTHLY,
    },
    {
      type: PlanType.FAMILY,
      nameAr: "الباقة العائلية (متعدد الأطفال)",
      nameEn: "Family Plan (Multi-Child)",
      priceMinorUnits: 8385, // $83.85 / month (was $129.00 - 35% off)
      interval: BillingInterval.MONTHLY,
    },
  ];

  for (const plan of plansData) {
    await prisma.plan.create({
      data: plan,
    });
  }
  console.log("✅ Subscription Plans seeded.");

  // 7. Seed Partner Schools (B2B institutional licenses)
  // These start with 0 seats used -- no demo student accounts are pre-linked
  // to them, so the admin's B2B dashboard reflects reality (a school with a
  // license and no roster imported yet) rather than a fabricated headcount.
  // Run the "Onboard Roster" flow in /admin/schools to create real, linked
  // student accounts against these licenses.
  const partnerSchoolsData = [
    {
      id: "school-riyadh-coop",
      nameAr: "تعاونية الرياض لتعليم العربية",
      nameEn: "Riyadh Arabic Learning Co-op",
      type: "HOMESCHOOL_COOP",
      country: "Saudi Arabia",
      city: "Riyadh",
      licenseSeatsTotal: 40,
      licenseSeatsUsed: 0,
      classesCount: 0,
      studentsCount: 0,
      contactPerson: "Fatimah Al-Otaibi",
      contactEmail: "fatimah@riyadh-coop.example.org",
      contractStatus: "ACTIVE",
      curriculumTrackAr: "المسار التأسيسي والقرآن الكريم",
    },
    {
      id: "school-al-noor-istanbul",
      nameAr: "مدرسة النور الإسلامية - إسطنبول",
      nameEn: "Al-Noor Islamic School - Istanbul",
      type: "ISLAMIC_SCHOOL",
      country: "Turkey",
      city: "Istanbul",
      licenseSeatsTotal: 120,
      licenseSeatsUsed: 0,
      classesCount: 0,
      studentsCount: 0,
      contactPerson: "Ahmed Yilmaz",
      contactEmail: "ahmed@alnoor-istanbul.example.org",
      contractStatus: "ACTIVE",
      curriculumTrackAr: "المسار الأكاديمي الكامل",
    },
    {
      id: "school-toronto-community-center",
      nameAr: "مركز تورونتو المجتمعي الإسلامي",
      nameEn: "Toronto Islamic Community Center",
      type: "COMMUNITY_CENTER",
      country: "Canada",
      city: "Toronto",
      licenseSeatsTotal: 75,
      licenseSeatsUsed: 0,
      classesCount: 0,
      studentsCount: 0,
      contactPerson: "Yusuf Ibrahim",
      contactEmail: "yusuf@toronto-icc.example.org",
      contractStatus: "TRIAL",
      curriculumTrackAr: "مسار نهاية الأسبوع",
    },
    {
      id: "school-london-weekend",
      nameAr: "مدرسة لندن لعطلة نهاية الأسبوع",
      nameEn: "London Weekend Arabic School",
      type: "COMMUNITY_CENTER",
      country: "United Kingdom",
      city: "London",
      licenseSeatsTotal: 60,
      licenseSeatsUsed: 0,
      classesCount: 0,
      studentsCount: 0,
      contactPerson: "Amina Khan",
      contactEmail: "amina@london-weekend.example.org",
      contractStatus: "PENDING_RENEWAL",
      curriculumTrackAr: "المسار التأسيسي",
    },
  ];

  for (const school of partnerSchoolsData) {
    await prisma.partnerSchool.upsert({
      where: { id: school.id },
      update: {},
      create: school,
    });
  }
  console.log("✅ Partner schools (B2B) seeded.");

  console.log("🚀 Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
