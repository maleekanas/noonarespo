export type RecommendationCategory =
  | "READING"
  | "PHONICS"
  | "TAJWEED"
  | "WRITING"
  | "HABIT";

export type RecommendationPriority = "HIGH" | "MEDIUM" | "ENCOURAGEMENT";

export interface LearningRecommendation {
  id: string;
  studentId: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  titleAr: string;
  titleEn: string;
  rationaleAr: string;
  suggestedActionAr: string;
  estimatedMinutesPerDay: number;
  curatedResourceTitleAr?: string;
  curatedResourceType?: "STORY" | "AUDIO_DRILL" | "WORKSHEET";
}

export interface CEFRMilestoneItem {
  code: string;
  titleAr: string;
  isAchieved: boolean;
  evidenceAr: string;
}

export interface StudentMilestoneProgress {
  studentId: string;
  currentLevel: string;
  targetLevel: string;
  targetLevelTitleAr: string;
  overallProgressPercent: number;
  milestones: CEFRMilestoneItem[];
}

export interface CuratedLearningResource {
  id: string;
  titleAr: string;
  descriptionAr: string;
  type: "STORY" | "AUDIO_DRILL" | "WORKSHEET";
  ageGroup: "AGE_4_6" | "AGE_7_10" | "AGE_11_13" | "AGE_14_16";
  durationMinutes: number;
  icon: string;
}

class InMemoryRecommendationRepository {
  private recommendations: Map<string, LearningRecommendation[]> = new Map();
  private milestones: Map<string, StudentMilestoneProgress> = new Map();
  private curatedResources: CuratedLearningResource[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed for Zayd (student-1, age 7-10, A1 level)
    this.recommendations.set("student-1", [
      {
        id: "rec-1",
        studentId: "student-1",
        category: "TAJWEED",
        priority: "HIGH",
        titleAr: "تعزيز حروف القلقلة في سورة الفلق",
        titleEn: "Strengthen Qalqalah Recitation",
        rationaleAr: "بناءً على التلاوة الصوتية الأخيرة، أظهر زيد طلاقة ممتازة مع حاجة لضبط زمن سكون القاف في (الفلق) و(خلق).",
        suggestedActionAr: "تخصيص 5 دقائق يومياً في استوديو القرآن للاستماع إلى نموذج الشيخ وتكرار آيات سورة الفلق 3 مرات.",
        estimatedMinutesPerDay: 5,
        curatedResourceTitleAr: "استوديو التلاوة: سورة الفلق وأحكام القلقلة",
        curatedResourceType: "AUDIO_DRILL",
      },
      {
        id: "rec-2",
        studentId: "student-1",
        category: "READING",
        priority: "MEDIUM",
        titleAr: "قراءة قصة 'رحلة في واحة النخيل' لزيادة الطلاقة",
        titleEn: "Read 'Journey in Palm Oasis' for Fluency",
        rationaleAr: "بلغ معدل القراءة الشفوية 38 كلمة في الدقيقة؛ قراءة قصة مصورة يومية تدعم سرعة الاستيعاب إلى 50 كلمة.",
        suggestedActionAr: "قراءة مشتركة بصوت مسموع مع ولي الأمر قبل النوم بمعدل صفحتين يومياً.",
        estimatedMinutesPerDay: 10,
        curatedResourceTitleAr: "قصة مصورة: رحلة في واحة النخيل (مستوى A1)",
        curatedResourceType: "STORY",
      },
      {
        id: "rec-3",
        studentId: "student-1",
        category: "HABIT",
        priority: "ENCOURAGEMENT",
        titleAr: "الحفاظ على شعلة الحماس للأسبوع الثالث",
        titleEn: "Maintain Daily Learning Streak",
        rationaleAr: "زيد في اليوم الخامس على التوالي من النشاط اليومي! استمرارية التعلم لمدة 7 أيام متتالية تفتح وسام شعلة التميز الذهبي.",
        suggestedActionAr: "ممارسة جولة واحدة مدتها 3 دقائق في ألعاب الحركات أو التحدث مع المرشد فصيح (AI).",
        estimatedMinutesPerDay: 3,
        curatedResourceTitleAr: "محادثة قصيرة مع المرشد فصيح (+10 XP)",
        curatedResourceType: "AUDIO_DRILL",
      },
    ]);

    // Seed Milestones for Zayd
    this.milestones.set("student-1", {
      studentId: "student-1",
      currentLevel: "A1",
      targetLevel: "A2",
      targetLevelTitleAr: "المستوى A2: الانطلاق والطلاقة التعبيرية",
      overallProgressPercent: 72,
      milestones: [
        {
          code: "M1_PHONICS",
          titleAr: "إتقان نطق الحروف الـ 28 بجميع الحركات الثلاث والسكون",
          isAchieved: true,
          evidenceAr: "تم الإنجاز بنسبة 100% في اختبار تحديد المستوى واستوديو الحروف",
        },
        {
          code: "M2_READING_WORDS",
          titleAr: "قراءة نصوص قصيرة مشكولة بسرعة تفوق 35 كلمة في الدقيقة",
          isAchieved: true,
          evidenceAr: "سجل 38 كلمة/دقيقة في تقييم القراءة الأسبوعي الأخير",
        },
        {
          code: "M3_QURAN_JUZ_AMMA",
          titleAr: "حفظ وتجويد قصار السور (الفاتحة، الإخلاص، الفلق، الناس)",
          isAchieved: false,
          evidenceAr: "تم إتقان الفاتحة والإخلاص (2 من 4 سور مكتملة)",
        },
        {
          code: "M4_CONVERSATION",
          titleAr: "إجراء محادثة حوارية تلقائية من 5 جُمل مع المعلم",
          isAchieved: false,
          evidenceAr: "متبقي جلسة تطبيقية واحدة مع المرشد فصيح أو المعلم",
        },
      ],
    });

    // Curated resources catalog
    this.curatedResources = [
      {
        id: "res-1",
        titleAr: "قصة مصورة: رحلة في واحة النخيل",
        descriptionAr: "قصة تفاعلية مبهجة لتعليم المفردات التراثية والطبيعية بالتشكيل الكامل.",
        type: "STORY",
        ageGroup: "AGE_7_10",
        durationMinutes: 10,
        icon: "🌴",
      },
      {
        id: "res-2",
        titleAr: "تدريب صوتي: حروف القلقلة قطب جد",
        descriptionAr: "تمارين استماع تفاعلية تميز بين القلقلة الصغرى في وسط الكلمة والكبرى عند الوقف.",
        type: "AUDIO_DRILL",
        ageGroup: "AGE_7_10",
        durationMinutes: 5,
        icon: "🎙️",
      },
      {
        id: "res-3",
        titleAr: "بطاقات كتابة الخط العربي على السطر",
        descriptionAr: "كراسة تدريبية رقمية قابلة للتنزيل لتعليم استقرار الحروف على خط الأساس.",
        type: "WORKSHEET",
        ageGroup: "AGE_7_10",
        durationMinutes: 15,
        icon: "✍️",
      },
    ];
  }

  async getRecommendationsByStudentId(studentId: string): Promise<LearningRecommendation[]> {
    return this.recommendations.get(studentId) || [];
  }

  async getMilestonesByStudentId(studentId: string): Promise<StudentMilestoneProgress | null> {
    return this.milestones.get(studentId) || null;
  }

  async getCuratedResources(ageGroup?: "AGE_4_6" | "AGE_7_10" | "AGE_11_13" | "AGE_14_16"): Promise<CuratedLearningResource[]> {
    if (!ageGroup) return this.curatedResources;
    return this.curatedResources.filter((r) => r.ageGroup === ageGroup);
  }

  async addRecommendation(rec: LearningRecommendation): Promise<LearningRecommendation> {
    const list = this.recommendations.get(rec.studentId) || [];
    list.push(rec);
    this.recommendations.set(rec.studentId, list);
    return rec;
  }
}

export const recommendationRepository = new InMemoryRecommendationRepository();
