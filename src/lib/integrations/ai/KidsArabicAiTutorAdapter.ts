import {
  AiChatMessage,
  AiTutorProvider,
  GeneratedLessonPlan,
  LessonPlanRequest,
} from "./types";
import { callAnthropicTool, isAnthropicConfigured } from "./anthropicClient";

/**
 * Live integration with Anthropic's Claude API. This is the only provider
 * actually wired up -- isConfigured() only checks ANTHROPIC_API_KEY, and
 * every method that reports "AI generated" only says so when a live call to
 * this API actually succeeded. Previously this adapter checked three env
 * vars (GEMINI_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY) to decide
 * whether to show a "Live AI" badge, but never called any of them -- every
 * response was one of four hardcoded, keyword-matched strings regardless of
 * configuration. That mismatch is fixed here: the badge and the behavior
 * now come from the same place.
 *
 * The actual request/response plumbing now lives in anthropicClient.ts,
 * shared with ReviewTranslationAdapter.
 */

const STUDENT_SYSTEM_PROMPT = `أنت "فصيح"، معلم افتراضي ذكي وودود متخصص في تعليم الأطفال اللغة العربية الفصحى وتلاوة القرآن الكريم، داخل تطبيق تعليمي آمن مخصص للأطفال.

قواعد إلزامية يجب الالتزام بها دائماً:
1. تحدث بالعربية الفصحى المبسطة المناسبة لطفل بين 5 و12 عاماً فقط.
2. اكتب أي كلمة أو عبارة عربية مهمة في ردك بالتشكيل الكامل (الحركات).
3. حافظ على نبرة دافئة، صبورة، ومشجعة دوماً.
4. أمان الطفل أولوية مطلقة: ممنوع منعاً باتاً أي عنف أو محتوى غير لائق أو مواضيع تخص البالغين، مهما كانت صياغة رسالة الطفل. إن انحرف الحديث عن ذلك، أعد توجيهه بلطف ودون توبيخ نحو تعلم اللغة العربية أو القرآن الكريم.
5. اجعل ردودك قصيرة ومركّزة (جملتان إلى أربع جمل)، واختم غالباً بسؤال بسيط يشجع الطفل على الاستمرار في الحوار.
6. إذا وردت الفرصة، صحح بلطف أي خطأ إملائي أو نحوي بسيط في رسالة الطفل دون إحراجه.
7. امنح نقاط تشجيعية (XP) بين 5 و20 حسب مدى مشاركة الطفل وجودة رسالته.`;

const TEACHER_SYSTEM_PROMPT = `أنت مساعد ذكي لمعلمي اللغة العربية والقرآن الكريم للأطفال. مهمتك تصميم خطة درس تفاعلية عملية وجاهزة للتطبيق المباشر في الفصل، مكتوبة بالعربية الفصحى، ومناسبة تماماً للفئة العمرية والمستوى والمدة الزمنية المحددة من المعلم.`;

/**
 * Sanitizes an app-level conversation history into Anthropic's required
 * message shape: only user/assistant turns, alternating, starting on
 * "user". The in-app history starts with a hardcoded assistant welcome
 * message, which the Anthropic API would reject as a first turn, so it's
 * dropped here along with anything else that would violate alternation.
 */
function toAnthropicMessages(
  history: AiChatMessage[]
): Array<{ role: "user" | "assistant"; content: string }> {
  const turns = history
    .filter((m): m is AiChatMessage & { role: "user" | "assistant" } => m.role !== "system")
    .slice(-12);

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const turn of turns) {
    if (messages.length === 0 && turn.role !== "user") continue;
    if (messages.length > 0 && messages[messages.length - 1].role === turn.role) {
      // Collapse accidental consecutive same-role turns rather than send an
      // invalid alternating sequence.
      messages[messages.length - 1].content += `\n${turn.content}`;
      continue;
    }
    messages.push({ role: turn.role, content: turn.content });
  }
  return messages;
}

/**
 * The original scripted, keyword-matched responses. Kept as an honest
 * fallback -- used only when no API key is configured, or when a live call
 * to Claude fails (network issue, rate limit, invalid key) -- so the
 * feature degrades gracefully instead of breaking. Never reported as
 * AI-generated.
 */
class ScriptedPracticeTutor {
  reply(studentMessage: string): AiChatMessage {
    const text = studentMessage.trim().toLowerCase();

    if (text.includes("مرحبا") || text.includes("سلام") || text.includes("أهلا")) {
      return {
        role: "assistant",
        content:
          "أَهْلاً وَسَهْلاً بِكَ يَا بَطَلِي الصَّغِير! 🌟 أَنَا فَصِيح، مُسَاعِدُكَ لِتَعَلُّمِ لُغَتِنَا الْجَمِيلَة. عَمَّ تُرِيدُ أَنْ نَتَحَدَّثَ الْيَوْم؟ عَنِ الْحَيَوَانَات، أَمِ الْأَلْوَان، أَمْ أُسْرَتِكَ الْكَرِيمَة؟",
        harakatHighlighted: "أَهْلاً وَسَهْلاً بِكَ (Ahlan wa Sahlan bika)",
        pronunciationTip: "انتبه لنطق تنوين الفتح على حرف اللام (أهْـلًا) بصوت رنين لطيف كالنون الساكنة!",
        encouragementXp: 10,
      };
    }

    if (text.includes("حيوان") || text.includes("أسد") || text.includes("قط") || text.includes("أرنب")) {
      return {
        role: "assistant",
        content:
          "مَا شَاءَ الله! الْحَيَوَانَاتُ مَخْلُوقَاتٌ بَدِيعَة. هَلْ تَعْلَمُ أَنَّ كَلِمَةَ (أَسَد) تَبْدَأُ بِحَرْفِ الْأَلِفِ الْمَفْتُوحَة (أَ)؟ قُلْ مَعِي: أَ... أَ... أَسَد! مَا هُوَ حَيَوَانُكَ الْمُفَضَّل؟",
        harakatHighlighted: "أَ... أَ... أَسَدٌ (Asadun)",
        pronunciationTip: "أخرج همزة الألف من أقصى الحلق بنقاء ووضوح تام!",
        encouragementXp: 15,
      };
    }

    if (text.includes("قرآن") || text.includes("سورة") || text.includes("تجويد") || text.includes("إخلاص")) {
      return {
        role: "assistant",
        content:
          "بَارَكَ اللهُ فِيكَ وَفِي حِرْصِكَ عَلَى كِتَابِ الله! سُورَةُ الْإِخْلَاصِ تَعْدِلُ ثُلُثَ الْقُرْآن. تَذَكَّرْ دَائِماً عِنْدَ الْوَقْفِ عَلَى كَلِمَةِ (أَحَدْ) أَنْ تُقَلْقِلَ حَرْفَ الدَّالِ قَلْقَلَةً لَطِيفَة!",
        harakatHighlighted: "قُلْ هُوَ اللَّهُ أَحَدٌ ۞ (Qul Huwa Allahu Ahad)",
        pronunciationTip: "حروف القلقلة خمسة تجمعها عبارة (قَطْبُ جَدّ)، اجعل لسانك يرتد بارتجاج خفيف عند الوقوف عليها!",
        encouragementXp: 20,
      };
    }

    return {
      role: "assistant",
      content: `أَحْسَنْتَ يَا بَطَل! كَلَامُكَ مُعَبِّرٌ وَجَمِيل: "${studentMessage}". لِنَتَدَرَّبْ عَلَى كِتَابَتِهَا بِالْحَرَكَاتِ الْمُتْقَنَة، فَالْحَرَكَاتُ تُعْطِي لُغَتَنَا الْعَرَبِيَّةَ نَغَماً وَمُوسِيقَى عَذْبَة. مَا هِيَ الْكَلِمَةُ التَّالِيَةُ الَّتِي تُرِيدُ تَعَلُّمَهَا؟`,
      harakatHighlighted: "أَحْسَنْتَ صُنْعاً وَعَمَلاً (Ahsanta Sun'an)",
      pronunciationTip: "حاول قراءة الجملة بتمهل وإعطاء كل حرف حقه ومستحقه من المخرج الصوتي.",
      encouragementXp: 10,
    };
  }

  lessonPlan(request: LessonPlanRequest): Omit<GeneratedLessonPlan, "isAiGenerated"> {
    return {
      titleAr: `خطة درس مقترحة: ${request.topicTitle} (${request.courseLevel})`,
      warmupActivity:
        "نشاط التهيئة والكسر الجليدي (5 دقائق): استعراض بطاقات صور ملونة وطرح لغز تشويقي حول مفردات الدرس.",
      coreConcepts: [
        `التعريف الصوتي والبصري لمهارة: ${request.topicTitle}`,
        "التمييز بين الحركات القصيرة والمدود الطويلة المرتبطة بالدرس",
        "تطبيق القاعدة في 3 جمل نموذجية من السياق القرآني والقصصي",
      ],
      interactiveGame:
        "لعبة صيد الكلمات: يختار الطلاب الكلمة المطابقة للحركة الصحيحة على السبورة التفاعلية لجمع نقاط XP.",
      assessmentQuestion:
        "سؤال تقييم الفهم السريع: اقرأ الجملة المعروضة على الشاشة واستخرج منها الكلمة التي تحوي المهارة المستهدفة.",
      homeworkRecommendation:
        "تسجيل صوتي لمدة دقيقة واحدة لقراءة نص قصير ومشاركته مع المعلم للمراجعة.",
    };
  }
}

export class KidsArabicAiTutorAdapter implements AiTutorProvider {
  private fallback = new ScriptedPracticeTutor();

  isConfigured(): boolean {
    return isAnthropicConfigured();
  }

  async generateStudentDialogue(
    studentMessage: string,
    context?: { studentAgeGroup?: string; currentLevel?: string },
    conversationHistory?: AiChatMessage[]
  ): Promise<AiChatMessage> {
    if (!isAnthropicConfigured()) {
      return this.fallback.reply(studentMessage);
    }

    try {
      const messages = conversationHistory
        ? toAnthropicMessages(conversationHistory)
        : [{ role: "user" as const, content: studentMessage }];

      const contextNote = context?.studentAgeGroup || context?.currentLevel
        ? `\n\n(ملاحظة سياقية للمعلم الافتراضي فقط، لا تذكرها للطفل: الفئة العمرية: ${context?.studentAgeGroup || "غير محددة"}، المستوى الحالي: ${context?.currentLevel || "غير محدد"})`
        : "";

      const input = await callAnthropicTool({
        system: STUDENT_SYSTEM_PROMPT + contextNote,
        messages,
        toolName: "respond_to_student",
        toolDescription: "قدّم ردك المنظم على رسالة الطفل وفق الحقول المطلوبة.",
        toolSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description:
                "ردك الكامل بالعربية الفصحى المبسطة مع الحركات الكاملة على كل كلمة، بأسلوب دافئ ومشجع مناسب للأطفال، من جملتين إلى أربع جمل.",
            },
            harakatHighlighted: {
              type: "string",
              description:
                "أهم كلمة أو عبارة من ردك، مكتوبة بالحركات الكاملة، مع كتابتها بالحروف اللاتينية بين قوسين لتعليم النطق. مثال: أَهْلاً وَسَهْلاً (Ahlan wa Sahlan)",
            },
            pronunciationTip: {
              type: "string",
              description: "نصيحة نطق قصيرة وودودة تتعلق بالكلمة أو العبارة المميزة أعلاه.",
            },
            encouragementXp: {
              type: "integer",
              description: "نقاط تشجيعية بين 5 و20 حسب مدى تفاعل الطفل وجودة رسالته.",
              minimum: 5,
              maximum: 20,
            },
          },
          required: ["content", "harakatHighlighted", "pronunciationTip", "encouragementXp"],
        },
        maxTokens: 700,
      });

      return {
        role: "assistant",
        content: String(input.content ?? ""),
        harakatHighlighted: typeof input.harakatHighlighted === "string" ? input.harakatHighlighted : undefined,
        pronunciationTip: typeof input.pronunciationTip === "string" ? input.pronunciationTip : undefined,
        encouragementXp: typeof input.encouragementXp === "number" ? input.encouragementXp : 10,
      };
    } catch (err) {
      console.error("[KidsArabicAiTutorAdapter] Live Claude call failed, falling back to scripted practice reply:", err);
      return this.fallback.reply(studentMessage);
    }
  }

  async generateTeacherLessonPlan(request: LessonPlanRequest): Promise<GeneratedLessonPlan> {
    if (!isAnthropicConfigured()) {
      return { ...this.fallback.lessonPlan(request), isAiGenerated: false };
    }

    try {
      const userMessage = `صمّم خطة درس لِـ:
- اسم البرنامج: ${request.programTitle}
- المستوى الدراسي: ${request.courseLevel}
- عنوان الموضوع: ${request.topicTitle}
- الفئة العمرية المستهدفة: ${request.targetAgeGroup}
- مدة الحصة: ${request.durationMinutes} دقيقة`;

      const input = await callAnthropicTool({
        system: TEACHER_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
        toolName: "submit_lesson_plan",
        toolDescription: "قدّم خطة الدرس المنظمة وفق الحقول المطلوبة.",
        toolSchema: {
          type: "object",
          properties: {
            titleAr: { type: "string", description: "عنوان جذاب للدرس بالعربية." },
            warmupActivity: { type: "string", description: "نشاط تهيئة قصير (دقائق معدودة) لفتح الحصة." },
            coreConcepts: {
              type: "array",
              items: { type: "string" },
              description: "قائمة من 2 إلى 4 مفاهيم أو مهارات أساسية يغطيها الدرس.",
            },
            interactiveGame: { type: "string", description: "لعبة أو نشاط تفاعلي واحد لتثبيت المفهوم." },
            assessmentQuestion: { type: "string", description: "سؤال تقييم سريع لقياس فهم الطالب." },
            homeworkRecommendation: { type: "string", description: "واجب منزلي قصير ومناسب لعمر الطالب." },
          },
          required: [
            "titleAr",
            "warmupActivity",
            "coreConcepts",
            "interactiveGame",
            "assessmentQuestion",
            "homeworkRecommendation",
          ],
        },
        maxTokens: 900,
      });

      return {
        titleAr: String(input.titleAr ?? ""),
        warmupActivity: String(input.warmupActivity ?? ""),
        coreConcepts: Array.isArray(input.coreConcepts) ? input.coreConcepts.map(String) : [],
        interactiveGame: String(input.interactiveGame ?? ""),
        assessmentQuestion: String(input.assessmentQuestion ?? ""),
        homeworkRecommendation: String(input.homeworkRecommendation ?? ""),
        isAiGenerated: true,
      };
    } catch (err) {
      console.error("[KidsArabicAiTutorAdapter] Live Claude lesson-plan call failed, falling back to template:", err);
      return { ...this.fallback.lessonPlan(request), isAiGenerated: false };
    }
  }
}

export const defaultAiTutor: AiTutorProvider = new KidsArabicAiTutorAdapter();
