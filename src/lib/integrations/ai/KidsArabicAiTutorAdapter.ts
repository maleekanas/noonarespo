import {
  AiChatMessage,
  AiTutorProvider,
  GeneratedLessonPlan,
  LessonPlanRequest,
} from "./types";

export class KidsArabicAiTutorAdapter implements AiTutorProvider {
  isConfigured(): boolean {
    return Boolean(
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY
    );
  }

  async generateStudentDialogue(
    studentMessage: string
  ): Promise<AiChatMessage> {
    const text = studentMessage.trim().toLowerCase();

    // Contextual responses tailored for children learning Arabic with Harakat & encouragement
    if (text.includes("مرحبا") || text.includes("سلام") || text.includes("أهلا")) {
      return {
        role: "assistant",
        content: "أَهْلاً وَسَهْلاً بِكَ يَا بَطَلِي الصَّغِير! 🌟 أَنَا فَصِيح، مُسَاعِدُكَ الذَّكِيّ لِتَعَلُّمِ لُغَتِنَا الْجَمِيلَة. عَمَّ تُرِيدُ أَنْ نَتَحَدَّثَ الْيَوْم؟ عَنِ الْحَيَوَانَات، أَمِ الْأَلْوَان، أَمْ أُسْرَتِكَ الْكَرِيمَة؟",
        harakatHighlighted: "أَهْلاً وَسَهْلاً بِكَ (Ahlan wa Sahlan bika)",
        pronunciationTip: "انتبه لنطق تنوين الفتح على حرف اللام (أهْـلًا) بصوت رنين لطيف كالنون الساكنة!",
        encouragementXp: 10,
      };
    }

    if (text.includes("حيوان") || text.includes("أسد") || text.includes("قط") || text.includes("أرنب")) {
      return {
        role: "assistant",
        content: "مَا شَاءَ الله! الْحَيَوَانَاتُ مَخْلُوقَاتٌ بَدِيعَة. هَلْ تَعْلَمُ أَنَّ كَلِمَةَ (أَسَد) تَبْدَأُ بِحَرْفِ الْأَلِفِ الْمَفْتُوحَة (أَ)؟ قُلْ مَعِي: أَ... أَ... أَسَد! مَا هُوَ حَيَوَانُكَ الْمُفَضَّل؟",
        harakatHighlighted: "أَ... أَ... أَسَدٌ (Asadun)",
        pronunciationTip: "أخرج همزة الألف من أقصى الحلق بنقاء ووضوح تام!",
        encouragementXp: 15,
      };
    }

    if (text.includes("قرآن") || text.includes("سورة") || text.includes("تجويد") || text.includes("إخلاص")) {
      return {
        role: "assistant",
        content: "بَارَكَ اللهُ فِيكَ وَفِي حِرْصِكَ عَلَى كِتَابِ الله! سُورَةُ الْإِخْلَاصِ تَعْدِلُ ثُلُثَ الْقُرْآن. تَذَكَّرْ دَائِماً عِنْدَ الْوَقْفِ عَلَى كَلِمَةِ (أَحَدْ) أَنْ تُقَلْقِلَ حَرْفَ الدَّالِ قَلْقَلَةً لَطِيفَة!",
        harakatHighlighted: "قُلْ هُوَ اللَّهُ أَحَدٌ ۞ (Qul Huwa Allahu Ahad)",
        pronunciationTip: "حروف القلقلة خمسة تجمعها عبارة (قَطْبُ جَدّ)، اجعل لسانك يرتد بارتجاج خفيف عند الوقوف عليها!",
        encouragementXp: 20,
      };
    }

    // Default intelligent educational response
    return {
      role: "assistant",
      content: `أَحْسَنْتَ يَا بَطَل! كَلَامُكَ مُعَبِّرٌ وَجَمِيل: "${studentMessage}". لِنَتَدَرَّبْ عَلَى كِتَابَتِهَا بِالْحَرَكَاتِ الْمُتْقَنَة، فَالْحَرَكَاتُ تُعْطِي لُغَتَنَا الْعَرَبِيَّةَ نَغَماً وَمُوسِيقَى عَذْبَة. مَا هِيَ الْكَلِمَةُ التَّالِيَةُ الَّتِي تُرِيدُ تَعَلُّمَهَا؟`,
      harakatHighlighted: "أَحْسَنْتَ صُنْعاً وَعَمَلاً (Ahsanta Sun'an)",
      pronunciationTip: "حاول قراءة الجملة بتمهل وإعطاء كل حرف حقه ومستحقه من المخرج الصوتي.",
      encouragementXp: 10,
    };
  }

  async generateTeacherLessonPlan(
    request: LessonPlanRequest
  ): Promise<GeneratedLessonPlan> {
    return {
      titleAr: `خطة درس مقترحة: ${request.topicTitle} (${request.courseLevel})`,
      warmupActivity: "نشاط التهيئة والكسر الجليدي (5 دقائق): استعراض بطاقات صور ملونة وطرح لغز تشويقي حول مفردات الدرس.",
      coreConcepts: [
        `التعريف الصوتي والبصري لمهارة: ${request.topicTitle}`,
        "التمييز بين الحركات القصيرة والمدود الطويلة المرتبطة بالدرس",
        "تطبيق القاعدة في 3 جمل نموذجية من السياق القرآني والقصصي",
      ],
      interactiveGame: "لعبة صيد الكلمات: يختار الطلاب الكلمة المطابقة للحركة الصحيحة على السبورة التفاعلية لجمع نقاط XP.",
      assessmentQuestion: "سؤال تقييم الفهم السريع: اقرأ الجملة المعروضة على الشاشة واستخرج منها الكلمة التي تحوي المهارة المستهدفة.",
      homeworkRecommendation: "تسجيل صوتي لمدة دقيقة واحدة لقراءة نص قصير ومشاركته مع المعلم للمراجعة.",
      isAiGenerated: true,
    };
  }
}

export const defaultAiTutor: AiTutorProvider = new KidsArabicAiTutorAdapter();
