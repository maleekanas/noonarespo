import { AgeGroup } from "@prisma/client";

export type InteractiveClassroomTool =
  | "WHITEBOARD"
  | "AUDIO_RECORDER"
  | "PHONICS_CANVAS"
  | "TAJWEED_STUDIO"
  | "WORD_SCRAMBLER"
  | "FLASHCARDS";

export interface CurriculumLesson {
  id: string;
  ageGroup: AgeGroup;
  programId: string;
  programTitleAr: string;
  programTitleEn: string;
  courseLevelCode: string;
  lessonNumber: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  objectivesAr: string[];
  objectivesEn: string[];
  targetVocabulary: string[];
  durationMinutes: number;
  interactiveTools: InteractiveClassroomTool[];
  homeworkTitleAr: string;
  homeworkTitleEn: string;
  libraryStoryId?: string;
  printableId?: string;
}

interface ProgramTemplate {
  programId: string;
  programTitleAr: string;
  programTitleEn: string;
  levelCode: string;
  lessonsPerAgeGroup: Record<
    AgeGroup,
    {
      titleAr: string;
      titleEn: string;
      descAr: string;
      descEn: string;
      objAr: string[];
      objEn: string[];
      vocab: string[];
      tools: InteractiveClassroomTool[];
      hwAr: string;
      hwEn: string;
      storyId?: string;
      libraryStoryId?: string;
      printableId?: string;
    }[]
  >;
}

// 7 Accredited Programs syllabus templates with detailed, pedagogical lessons
const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  // 1. Foundations
  {
    programId: "prog-foundations",
    programTitleAr: "أساسيات اللغة العربية",
    programTitleEn: "Arabic Foundations",
    levelCode: "PRE_A1",
    lessonsPerAgeGroup: {
      AGE_4_6: [
        {
          titleAr: "حرف الألف وصوت الفتحة مع أنشودة الحروف",
          titleEn: "Letter Alif, Short Fatha & Alphabet Chant",
          descAr: "التعرف البصري والصوتي على حرف الألف بحركة الفتحة ورسمه على اللوح التفاعلي.",
          descEn: "Visual and auditory recognition of Alif with Fatha, drawn on the interactive whiteboard.",
          objAr: ["نطق صوت الألف المفتوحة (أَ)", "تمييز رسم الألف المستقر على السطر", "تسمية 3 مفردات تبدأ بالألف"],
          objEn: ["Pronounce Alif with Fatha", "Recognize baseline stroke for Alif", "Name 3 words starting with Alif"],
          vocab: ["أَسَدٌ", "أَرْنَبٌ", "أُمِّي"],
          tools: ["WHITEBOARD", "PHONICS_CANVAS"],
          hwAr: "تلوين حرف الألف وتتبع نقاطه في كراسة الرسم",
          hwEn: "Color and trace letter Alif in the handwriting sheet",
          printableId: "printable-letters-tracing-1",
        },
        {
          titleAr: "حرف الباء وصوت الكسرة والضمة",
          titleEn: "Letter Baa with Kasra and Damma",
          descAr: "اكتشاف حرف الباء ونقطته السفلية مع حركتي الكسرة والضمة.",
          descEn: "Discovering letter Baa and its bottom dot with Kasra and Damma.",
          objAr: ["نطق صوت (بِ، بُ)", "رسم صحن الباء والنقطة", "مطابقة أصوات الباء مع الصور"],
          objEn: ["Pronounce Baa with Kasra and Damma", "Draw Baa bowl and dot", "Match Baa sounds to pictures"],
          vocab: ["بَابٌ", "بِنْتٌ", "بُرْتُقَالٌ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "تسجيل صوتي لنطق حرف الباء بالحركات الثلاث",
          hwEn: "Audio recording of Baa with the 3 short vowels",
        },
        {
          titleAr: "حرف التاء والثاء والتمييز بين النقاط",
          titleEn: "Letters Taa & Thaa: Dot Discrimination",
          descAr: "التمييز بين النقطتين بالأعلى وثلاث نقاط لحرف الثاء اللثوي.",
          descEn: "Differentiating between two upper dots for Taa and three dots for interdental Thaa.",
          objAr: ["نطق حرف الثاء من طرف اللسان", "كتابة حرفي التاء والثاء بالاتجاه الصحيح"],
          objEn: ["Pronounce interdental Thaa accurately", "Write Taa and Thaa with correct stroke direction"],
          vocab: ["تُفَّاحٌ", "تَمْرٌ", "ثَعْلَبٌ", "ثَوْبٌ"],
          tools: ["WHITEBOARD", "PHONICS_CANVAS"],
          hwAr: "تتبع خط التاء والثاء وتلوين الثعلب",
          hwEn: "Trace Taa and Thaa, color the fox",
          printableId: "printable-letters-tracing-1",
        },
        {
          titleAr: "حروف الجيم والحاء والخاء في أول الكلمة",
          titleEn: "Letters Jeem, Haa & Kha in Initial Position",
          descAr: "التعرف على عائلة الجيم والحاء والخاء ومواضع النقاط.",
          descEn: "Introducing the Jeem, Haa, and Kha family and their dot placements.",
          objAr: ["التمييز بين الحاء بدون نقط والجيم والخاء", "نطق صوت الخاء المفخم"],
          objEn: ["Distinguish Haa, Jeem, and Kha", "Pronounce emphatic Kha"],
          vocab: ["جَمَلٌ", "حَلِيبٌ", "خُبْزٌ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "تسجيل نطق كلمات الجمل والحليب والخبز",
          hwEn: "Record pronunciation of Camel, Milk, and Bread",
        },
        {
          titleAr: "عائلة الدال والذال وحروف الانفصال",
          titleEn: "Letters Dal & Dhal and Non-Connecting Letters",
          descAr: "معرفة الحروف التي لا تتصل بما بعدها ورسم الدال والذال.",
          descEn: "Understanding non-connecting letters and drawing Dal and Dhal.",
          objAr: ["إخراج طرف اللسان في حرف الذال", "رسم الدال والذال على السطر"],
          objEn: ["Pronounce interdental Dhal", "Draw Dal and Dhal on baseline"],
          vocab: ["دُبٌّ", "دِيكٌ", "ذُرَةٌ", "ذِئْبٌ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "تلوين الذرة والدب في دفتر الأنشطة",
          hwEn: "Color the corn and bear in the activity book",
        },
        {
          titleAr: "حرفا الراء والزاي والنزول تحت السطر",
          titleEn: "Letters Raa & Zay Descending Below Baseline",
          descAr: "تدريب على الحروف الهلالية التي تهبط تحت السطر.",
          descEn: "Practicing crescent letters that descend below the baseline.",
          objAr: ["رسم الراء والزاي بحركة هلالية رشيقة", "التمييز بين الراء والزاي بالنقطة"],
          objEn: ["Draw crescent stroke for Raa and Zay", "Differentiate with upper dot"],
          vocab: ["رُمَّانٌ", "رَجُلٌ", "زَرَافَةٌ", "زَيْتُونٌ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "تركيب كلمة رمان وزرافة في ورشة الحروف",
          hwEn: "Assemble words Pomegranate and Giraffe in lab",
        },
        {
          titleAr: "حرفا السين والشين ورسم الأسنان الثلاث",
          titleEn: "Letters Seen & Sheen with Three Teeth",
          descAr: "رسم أسنان السين والشين والتمييز بين الصافرة والتفشي.",
          descEn: "Drawing the three teeth of Seen and Sheen with sound distinctions.",
          objAr: ["رسم الأسنان الثلاث المتساوية", "وضع النقاط الثلاث على الشين"],
          objEn: ["Draw 3 even teeth on Seen", "Place 3 dots on Sheen"],
          vocab: ["سَمَكَةٌ", "سَيَّارَةٌ", "شَمْسٌ", "شَجَرَةٌ"],
          tools: ["WHITEBOARD", "PHONICS_CANVAS"],
          hwAr: "تلوين سمكة وشمس وتتبع الأسنان",
          hwEn: "Color fish and sun, trace seen teeth",
          printableId: "printable-everyday-vocabulary-flashcards",
        },
        {
          titleAr: "حرفا الصاد والضاد والحروف المفخمة",
          titleEn: "Emphatic Letters: Sad & Dhad",
          descAr: "تدريب الفم على نطق الصاد والضاد بتفخيم واستعلاء.",
          descEn: "Training articulation for heavy, emphatic Sad and Dhad.",
          objAr: ["تفخيم الصوت عند نطق الصاد والضاد", "رسم بيضة الصاد مع السِّنة والكاسة"],
          objEn: ["Pronounce emphatic Sad and Dhad", "Draw the oval loop and bowl"],
          vocab: ["صَقْرٌ", "صَابُونٌ", "ضِفْدَعٌ", "ضَوْءٌ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "تسجيل صوتي للفرق بين السين والصاد",
          hwEn: "Audio recording of contrast between Seen and Sad",
          printableId: "printable-heavy-letters",
        },
        {
          titleAr: "حرفا الطاء والظاء مع الألف القائمة",
          titleEn: "Letters Taa & Zhaa with Vertical Staff",
          descAr: "رسم جسم الحرف البيضاوي مع الألف الرأسية وإخراج اللسان في الظاء.",
          descEn: "Drawing the oval base with vertical staff and interdental Zhaa.",
          objAr: ["رسم الطاء والظاء باتزان", "إخراج طرف اللسان في حرف الظاء المفخم"],
          objEn: ["Draw balanced Taa and Zhaa", "Articulate emphatic interdental Zhaa"],
          vocab: ["طَائِرَةٌ", "طَمَاطِمُ", "ظَبْيٌ", "ظِلٌّ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "تتبع خط الطاء والظاء في كراسة الخط",
          hwEn: "Trace Taa and Zhaa in calligraphy sheet",
          printableId: "printable-heavy-letters",
        },
        {
          titleAr: "حرفا العين والغين ورسم الرأس الهلالي",
          titleEn: "Letters Ayn & Ghayn: The Crescent Head",
          descAr: "إخراج حرف العين من وسط الحلق وتمييز الغين بنقطتها.",
          descEn: "Producing Ayn from mid-throat and distinguishing Ghayn by its dot.",
          objAr: ["نطق العين الحلقية بوضوح", "رسم رأس العين نصف دائري فوق السطر"],
          objEn: ["Articulate pharyngeal Ayn", "Draw half-circle head above line"],
          vocab: ["عَيْنٌ", "عِنَبٌ", "غَزَالٌ", "غَيْمَةٌ"],
          tools: ["WHITEBOARD", "PHONICS_CANVAS"],
          hwAr: "تلوين العنب والغزالة ومطابقة الأصوات",
          hwEn: "Color grapes and gazelle, match sounds",
        },
        {
          titleAr: "حرفا الفاء والقاف والفرق بين النقطة والنقطتين",
          titleEn: "Letters Faa & Qaaf: Dot & Depth Differences",
          descAr: "التمييز بين الفاء المسطحة المستقرة والقاف العميقة ذات النقطتين.",
          descEn: "Distinguishing flat baseline Faa from deep two-dotted Qaaf.",
          objAr: ["نطق القاف اللهوية المفخمة", "رسم كاسة القاف الهابطة عن السطر"],
          objEn: ["Pronounce uvular Qaaf", "Draw descending bowl of Qaaf"],
          vocab: ["فَرَاشَةٌ", "فِيلٌ", "قَمَرٌ", "قَلَمٌ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "تركيب كلمة قلم وفيل على الشاشة التفاعلية",
          hwEn: "Assemble Qalam and Feel on screen",
          printableId: "printable-everyday-vocabulary-flashcards",
        },
        {
          titleAr: "حروف الكاف واللام والميم والنون",
          titleEn: "Letters Kaaf, Laam, Meem & Noon",
          descAr: "مجموعة الحروف الرشيقة ووصلها في الكلمات القصيرة.",
          descEn: "Graceful letters and connecting them in short words.",
          objAr: ["رسم همزة الكاف الصغيرة", "التمييز بين الألف واللام في الاتصال"],
          objEn: ["Draw miniature Kaaf mark", "Distinguish Alif and Laam in connections"],
          vocab: ["كِتَابٌ", "لَيْمُونٌ", "مَوْزٌ", "نَجْمٌ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "توصيل الحروف بالصور المناسبة",
          hwEn: "Connect letters with matching pictures",
          printableId: "printable-everyday-vocabulary-flashcards",
        },
      ],
      AGE_7_10: [
        {
          titleAr: "المد بالألف والمقارنة مع الحركة القصيرة",
          titleEn: "Alif Madd Elongation vs Short Fatha",
          descAr: "التمييز السمعي والبصري بين زمن الفتحة القصيرة ومد الألف الطويل.",
          descEn: "Auditory and visual distinction between short Fatha and Alif elongation.",
          objAr: ["مد الصوت بمقدار حركتين عند نطق الألف", "قراءة مقاطع ثنائية ممدودة"],
          objEn: ["Elongate sound by 2 counts with Alif", "Read 2-syllable madd words"],
          vocab: ["قَالَ", "نَامَ", "سَارَ", "طَارَ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "تسجيل صوتي للمقارنة بين (قَلَ) و(قَالَ)",
          hwEn: "Voice recording contrasting short and long vowels",
        },
        {
          titleAr: "المد بالواو والياء والتمييز الصوتي",
          titleEn: "Waw and Yaa Madd: Auditory Contrast",
          descAr: "إتقان مد الواو المسبوق بضمة ومد الياء المسبوق بكسرة.",
          descEn: "Mastering Waw madd preceded by Damma and Yaa madd preceded by Kasra.",
          objAr: ["مد الواو بضم الشفتين حركتين", "مد الياء بخفض الفك السفلي حركتين"],
          objEn: ["Elongate Waw with rounded lips", "Elongate Yaa with lowered jaw"],
          vocab: ["يَقُولُ", "نُورٌ", "يَسِيرُ", "كَبِيرٌ"],
          tools: ["WHITEBOARD", "PHONICS_CANVAS"],
          hwAr: "استخراج حروف المد من فقرة قصيرة",
          hwEn: "Extract madd letters from a short passage",
        },
        {
          titleAr: "السكون والمقطع الساكن في الكلمات الثلاثية",
          titleEn: "Sukoon & Closed Syllables in Tri-literal Words",
          descAr: "الوقوف الهادئ على الحرف الساكن ونطقه مع الحرف السابق في مقطع واحد.",
          descEn: "Gentle stop on sukoon and pronouncing it together with preceding letter.",
          objAr: ["نطق المقطع الساكن دون قلقلة زائدة", "تحليل الكلمة إلى مقاطع صوتية"],
          objEn: ["Pronounce closed syllables smoothly", "Deconstruct words into syllables"],
          vocab: ["مَسْـجِدٌ", "بُسْـتَانٌ", "مَدْرَسَـةٌ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "تقطيع 5 كلمات ساكنة إلى مقاطع صوتية",
          hwEn: "Syllabify 5 sukoon words into acoustic units",
          printableId: "printable-tanween-sukoon-coloring",
        },
        {
          titleAr: "التنوين بأنواعه الثلاثة: الفتح والضم والكسر",
          titleEn: "Three Types of Tanween: Fath, Damm & Kasr",
          descAr: "فهم نون التنوين الساكنة التي تلفظ ولا تكتب وتمييز علاماتها.",
          descEn: "Understanding nunation sounded as Noon but written as doubled diacritics.",
          objAr: ["تمييز صوت التنوين المنطوق عن النون الأصلية", "إضافة ألف تنوين الفتح بشكل سليم"],
          objEn: ["Distinguish tanween from genuine noon", "Add alif of fathatain correctly"],
          vocab: ["كِتَابٌ", "كِتَاباً", "كِتَابٍ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "كتابة جملة مشكولة بالتنوين الثلاثي",
          hwEn: "Write sentences containing all 3 tanween marks",
          printableId: "printable-tanween-sukoon-coloring",
        },
        {
          titleAr: "اللام الشمسية واللام القمرية وقواعد النطق",
          titleEn: "Solar & Lunar Lam: Articulation Rules",
          descAr: "إدغام اللام في الحروف الشمسية وإظهارها مع الحروف القمرية.",
          descEn: "Assimilating Lam in solar letters and articulating it in lunar letters.",
          objAr: ["حفظ عبارة (ابغ حجك وخف عقيمه) للحروف القمرية", "تطبيق الشدة على الحرف الشمسي بعد اللام"],
          objEn: ["Memorize lunar mnemonic", "Apply shaddah on solar letters"],
          vocab: ["الشَّمْسُ", "القَمَرُ", "السَّمَاءُ", "الأَرْضُ"],
          tools: ["WHITEBOARD", "PHONICS_CANVAS"],
          hwAr: "تصنيف قائمة من 10 كلمات إلى شمسية وقمرية",
          hwEn: "Classify 10 words into solar and lunar categories",
        },
        {
          titleAr: "الشدة مع الحركات الثلاث وضبط النطق المزدوج",
          titleEn: "Shaddah with 3 Vowels: Geminate Articulation",
          descAr: "تفكيك الحرف المشدد إلى ساكن ومتحرك وضغط القلم عند رسم الشدة.",
          descEn: "Deconstructing doubled letters into stop and vowel components.",
          objAr: ["نطق الحرف المشدد بنبرة صوتية واضحة", "كتابة الشدة فوق وتحت الحرف مع الحركات"],
          objEn: ["Pronounce doubled letters with stress", "Write shaddah with accompanying vowels"],
          vocab: ["مُعَلِّمٌ", "سَلَّمَ", "يُحِبُّ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "تسجيل قراءة نص قصير مشكول بالشدات",
          hwEn: "Record reading a short passage with shaddah",
        },
        {
          titleAr: "التاء المربوطة والمفتوحة والهاء في الوقف والوصل",
          titleEn: "Taa Marbootah, Taa Maftoohah & Haa Rules",
          descAr: "التمييز بين التاء المربوطة والمفتوحة والهاء عند السكون والوصل.",
          descEn: "Distinguishing tied Taa, open Taa, and Haa when pausing and continuing.",
          objAr: ["اختبار الوقف بالسكون لمعرفة التاء المربوطة", "كتابة التاء الصحيحة في نهاية الكلمات"],
          objEn: ["Test with sukoon pause for tied Taa", "Write correct ending letter"],
          vocab: ["مَدْرَسَةٌ", "بِنْتٌ", "مِيَاهٌ", "سَاعَةٌ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "كتابة 6 كلمات تنتهي بالتاء المربوطة والهاء",
          hwEn: "Write 6 words ending in tied Taa and Haa",
        },
        {
          titleAr: "همزة الوصل وهمزة القطع في الأفعال والأسماء",
          titleEn: "Hamzat al-Wasl vs Hamzat al-Qat' Rules",
          descAr: "التمييز بين الهمزة التي تثبت نطقاً ورسماً والهمزة التي تسقط في الوصل.",
          descEn: "Differentiating hamzah that stays from hamzah that drops in speech.",
          objAr: ["استخدام واو العطف للاختبار (وَاسْتَمَعَ / وَأَكَلَ)", "رسم رأس العين الصغير على همزة القطع"],
          objEn: ["Use Waw conjunction test", "Draw hamzah mark on Qat'"],
          vocab: ["أَكَلَ", "اسْتَمَعَ", "ابْنٌ", "إِيمَانٌ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "تصنيف همزات نص قصير إلى وصل وقطع",
          hwEn: "Classify hamzahs in a passage into wasl and qat'",
        },
        {
          titleAr: "الألف اللينة في أواخر الأفعال والأسماء",
          titleEn: "Alif Maqsoorah & Mamdoodah at Word Endings",
          descAr: "متى ترسم الألف اللينة قائمة (ا) ومتى ترسم ياء غير منقوطة (ى).",
          descEn: "When terminal Alif is written tall (Alif) or dotless Yaa (Maqsoorah).",
          objAr: ["إرجاع الفعل الثلاثي للمضارع لمعرفة أصل الألف", "رسم الألف اللينة بشكلها الصحيح"],
          objEn: ["Convert tri-literal verbs to present tense", "Draw correct terminal alif shape"],
          vocab: ["دَعَا - يَدْعُو", "رَمَى - يَرْمِي", "هُدَى", "عَصَا"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "تحويل 4 أفعال ماضية لمعرفة رسم الألف",
          hwEn: "Convert 4 past-tense verbs to determine alif shape",
        },
        {
          titleAr: "أسماء الإشارة والضمائر المنفصلة في جمل مفيدة",
          titleEn: "Demonstrative Pronouns & Independent Pronouns",
          descAr: "توظيف (هذا، هذه، هؤلاء) و(أنا، نحن، هو، هي) في تراكيب عربية سليمة.",
          descEn: "Employing demonstrative and personal pronouns in sound Arabic sentences.",
          objAr: ["استخدام اسم الإشارة المناسب للمفرد والجمع", "بناء جملة اسمية بسيطة تامة المعنى"],
          objEn: ["Select demonstrative by gender and number", "Construct simple nominal sentences"],
          vocab: ["هَذَا كِتَابٌ", "هَذِهِ زَهْرَةٌ", "هَؤُلَاءِ أَصْدِقَائِي"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "تأليف 4 جمل باستخدام أسماء الإشارة",
          hwEn: "Compose 4 sentences using demonstratives",
        },
        {
          titleAr: "أدوات الاستفهام وبناء السؤال والجواب",
          titleEn: "Interrogative Particles: Formulating Questions",
          descAr: "استخدام (مَنْ، مَا، أَيْنَ، مَتَى، كَيْفَ، لِمَاذَا، هَلْ) وعلامة الاستفهام.",
          descEn: "Using Arabic question particles and the question mark correctly.",
          objAr: ["اختيار أداة الاستفهام بحسب المعنى المراد", "صياغة سؤال كامل مع إشارة الاستفهام (؟)"],
          objEn: ["Match question word to context", "Formulate question with question mark"],
          vocab: ["مَنْ أَنْتَ؟", "أَيْنَ تَسْكُنُ؟", "كَيْفَ حَالُكَ؟"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "كتابة حوار قصير من 3 أسئلة وإجاباتها",
          hwEn: "Write a short dialogue with 3 Q&A pairs",
        },
        {
          titleAr: "حروف الجر والاسم المجرور وتراكيب المكان والزمان",
          titleEn: "Prepositions, Genitive Nouns & Spatial Context",
          descAr: "التعرف على (مِنْ، إِلَى، عَنْ، عَلَى، فِي، الباء، اللام) وضبط آخر الاسم بالكسرة.",
          descEn: "Recognizing Arabic prepositions and applying kasra on governed nouns.",
          objAr: ["استخدام حرف الجر المناسب في السياق", "ضبط الاسم بعد حرف الجر بالكسرة"],
          objEn: ["Use correct preposition in context", "Mark governed noun with kasra"],
          vocab: ["فِي الحَدِيقَةِ", "عَلَى المَكْتَبِ", "إِلَى المَدْرَسَةِ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "وضع حروف الجر في فراغات فقرة قصيرة",
          hwEn: "Fill in blanks with appropriate prepositions",
        },
      ],
      AGE_11_13: [
        {
          titleAr: "أقسام الكلام: الاسم والفعل والحرف وعلامات كل قسم",
          titleEn: "Parts of Speech: Noun, Verb, Particle Signs",
          descAr: "التمييز الدقيق بين أقسام الكلمة الثلاثة وعلامات الاسم والفعل الخاصة.",
          descEn: "Rigorous distinction of the three word classes and their morphological markers.",
          objAr: ["تحديد علامات الاسم (ال، التنوين، الجر)", "التمييز بين الفعل الماضي والمضارع والأمر"],
          objEn: ["Identify noun markers", "Distinguish past, present, and imperative verbs"],
          vocab: ["اسْمٌ", "فِعْلٌ", "حَرْفٌ", "عَلَامَةُ الإِعْرَابِ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "تصنيف كلمات نص أدبي إلى أسماء وأفعال وحروف",
          hwEn: "Classify words of a literary text into parts of speech",
        },
        {
          titleAr: "الجملة الاسمية وركناها: المبتدأ والخبر وحالات الإعراب",
          titleEn: "Nominal Sentences: Subject & Predicate Syntax",
          descAr: "تحليل بنية الجملة الاسمية وضبط المبتدأ والخبر بالرفع بالضمة والألف والواو.",
          descEn: "Analyzing nominal sentences with nominative markers (Damma, Alif, Waw).",
          objAr: ["تحديد المبتدأ والخبر في نصوص متنوعة", "إعراب المبتدأ والخبر في حالات الإفراد والمثنى والجمع"],
          objEn: ["Identify subject and predicate", "Parse singular, dual, and plural subjects"],
          vocab: ["المُبْتَدَأُ", "الخَبَرُ", "المَرْفُوعَاتُ", "الضَّمَّةُ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "إعراب 3 جمل اسمية كاملة في كراسة النحو",
          hwEn: "Parse 3 complete nominal sentences",
        },
        {
          titleAr: "الجملة الفعلية: الفعل والفاعل والمفعول به",
          titleEn: "Verbal Sentences: Verb, Subject & Object",
          descAr: "دراسة الجملة التي تبدأ بفعل وضبط الفاعل المرفوع والمفعول به المنصوب.",
          descEn: "Studying verbal sentences, nominative subjects, and accusative objects.",
          objAr: ["ترتيب عناصر الجملة الفعلية القياسية", "ضبط المفعول به بالفتحة والياء والكسرة"],
          objEn: ["Order verbal sentence components", "Mark objects with accusative signs"],
          vocab: ["الفِعْلُ", "الفَاعِلُ", "المَفْعُولُ بِهِ", "المَنْصُوبَاتُ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "تحويل 4 جمل اسمية إلى جمل فعلية مع الضبط",
          hwEn: "Convert 4 nominal sentences to verbal with diacritics",
        },
        {
          titleAr: "الأفعال الخمسة وإعرابها بثبوت النون وحذفها",
          titleEn: "The Five Verbs: Nun Retention & Omission",
          descAr: "صياغة الأفعال الخمسة المتصلة بألف الاثنين وواو الجماعة وياء المخاطبة.",
          descEn: "Formulating the Five Verbs connected to dual Alif, plural Waw, and Yaa.",
          objAr: ["استخراج الأفعال الخمسة من النصوص", "إعراب الأفعال الخمسة في حالات الرفع والنصب والجزم"],
          objEn: ["Extract Five Verbs from prose", "Parse them in nominative, accusative, and jussive"],
          vocab: ["يَفْعَلَانِ", "تَفْعَلَانِ", "يَفْعَلُونَ", "تَفْعَلُونَ", "تَفْعَلِينَ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "إعراب آية قرآنية تشتمل على فعل من الأفعال الخمسة",
          hwEn: "Parse a Quranic verse with one of the Five Verbs",
        },
        {
          titleAr: "الأسماء الخمسة وشروط إعرابها بالحروف",
          titleEn: "The Five Nouns & Inflection with Letters",
          descAr: "دراسة (أبو، أخو، حمو، فو، ذو) والرفع بالواو والنصب بالألف والجر بالياء.",
          descEn: "Studying the Five Nouns inflected with Waw, Alif, and Yaa.",
          objAr: ["معرفة شروط إعراب الأسماء الخمسة بالحروف", "توظيف الأسماء الخمسة في سياقات لغوية بليغة"],
          objEn: ["Identify inflection prerequisites", "Use Five Nouns in eloquent contexts"],
          vocab: ["أَبُوكَ", "أَخَاكَ", "فِيكَ", "ذُو المَالِ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "تركيب 3 جمل تشتمل على اسم من الأسماء الخمسة في حالاته الثلاث",
          hwEn: "Compose 3 sentences using Five Nouns across all 3 cases",
        },
        {
          titleAr: "كان وأخواتها وتأثيرها على المبتدأ والخبر",
          titleEn: "Kana & Its Sisters: Incomplete Verbs Syntax",
          descAr: "دخول الأفعال الناسخة (كان، أصبح، أضحى، ظل، أمسى، بات، صار، ليس) على الجملة الاسمية.",
          descEn: "Entering of defective verbs on nominal sentences, raising subject and making predicate accusative.",
          objAr: ["معرفة معاني كان وأخواتها", "ضبط اسم كان بالرفع وخبرها بالنصب"],
          objEn: ["Learn meanings of Kana sisters", "Apply nominative to subject, accusative to predicate"],
          vocab: ["كَانَ", "أَصْبَحَ", "صَارَ", "لَيْسَ", "اسْمُ كَانَ", "خَبَرُ كَانَ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "إدخال كان وأخواتها على 4 جمل اسمية مع إعادة الضبط",
          hwEn: "Apply Kana and its sisters to 4 sentences with case marks",
        },
        {
          titleAr: "إنّ وأخواتها والحروف الناسخة",
          titleEn: "Inna & Its Sisters: Accusative Particles",
          descAr: "دخول الحروف الناسخة (إنّ، أنّ، كأنّ، لكنّ، ليت، لعلّ) ونصب المبتدأ ورفع الخبر.",
          descEn: "Syntax of Inna and its sisters: making subject accusative and raising predicate.",
          objAr: ["التمييز بين عمل كان وعمل إنّ", "توظيف حروف التوكيد والتشبيه والترجي في التعبير"],
          objEn: ["Contrast Kana and Inna syntax", "Employ emphasis and simile particles in writing"],
          vocab: ["إِنَّ", "كَأَنَّ", "لَيْتَ", "لَعَلَّ", "اسْمُ إِنَّ", "خَبَرُ إِنَّ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "مقارنة إعرابية بين جملة بـ (كان) وجملة بـ (إنّ)",
          hwEn: "Parse comparison between Kana sentence and Inna sentence",
        },
        {
          titleAr: "النعت والمنعوت والمطابقة في الإعراب والتذكير",
          titleEn: "Adjectives & Described Nouns: Concord Rules",
          descAr: "تطابق النعت مع المنعوت في أربعة أوجه: الإعراب والتعريف والعدد والنوع.",
          descEn: "Concord of adjectives in four aspects: case, definiteness, number, and gender.",
          objAr: ["تطبيق شروط تطابق النعت والمنعوت", "استخدام النعوت الدقيقة في الوصف الأدبي"],
          objEn: ["Apply 4 concord rules", "Use descriptive adjectives in literary prose"],
          vocab: ["النَّعْتُ", "المَنْعُوتُ", "المُطَابَقَةُ", "الصِّفَةُ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "كتابة فقرة وصفية من 4 أسطر غنية بالنعوت المتطابقة",
          hwEn: "Write a 4-line descriptive paragraph rich in adjectives",
        },
        {
          titleAr: "العطف وحروفه ودلالاتها البلاغية",
          titleEn: "Conjunctions & Rhetorical Transitions",
          descAr: "دراسة حروف العطف (الواو، الفاء، ثم، أو، أم، لا، بل، حتى) وتأثيرها الإعرابي.",
          descEn: "Studying Arabic conjunctions (Waw, Faa, Thumma, Aw, etc.) and syntactic concord.",
          objAr: ["التمييز بين الترتيب مع التعقيب (الفاء) والترتيب مع التراخي (ثم)", "إتباع المعطوف للمعطوف عليه في الإعراب"],
          objEn: ["Contrast immediate Faa vs delayed Thumma", "Apply case agreement to conjoined nouns"],
          vocab: ["المَعْطُوفُ", "المَعْطُوفُ عَلَيْهِ", "حَرْفُ العَطْفِ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "توظيف 4 حروف عطف في قصة قصيرة",
          hwEn: "Employ 4 conjunctions in a narrative paragraph",
        },
        {
          titleAr: "الحال المفردة وعلامات نصبها وتمييزها عن النعت",
          titleEn: "The Circumstantial Accusative (Haal)",
          descAr: "بيان هيئة الفاعل أو المفعول به عند وقوع الفعل ونصب الحال دائماً.",
          descEn: "Clarifying state of subject or object during action, always accusative.",
          objAr: ["معرفة السؤال بـ (كَيْفَ) لاستخراج الحال", "التمييز بين الحال النكرة وصاحب الحال المعرفة"],
          objEn: ["Test with 'Kayfa' to identify Haal", "Distinguish indefinite Haal from definite owner"],
          vocab: ["الحَالُ", "صَاحِبُ الحَالِ", "مَنْصُوبٌ بِالفَتْحَةِ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "تحويل 3 نعوت إلى أحوال في جمل مفيدة",
          hwEn: "Convert 3 adjectives into circumstantial adverbs (Haal)",
        },
        {
          titleAr: "التمييز وأنواعه: تمييز الذات وتمييز النسبة",
          titleEn: "Specification (Tamyeez): Measure & Ratio",
          descAr: "إزالة الإبهام عن اسم سابق (العدد، الوزن، الكيل، المساحة) أو عن جملة كاملة.",
          descEn: "Removing ambiguity from quantities, numbers, weights, or entire sentences.",
          objAr: ["ضبط تمييز الأعداد من 11 إلى 99", "استخدام تمييز النسبة للتعبير عن الامتلاء والزيادة"],
          objEn: ["Apply tamyeez rules for numbers 11-99", "Use ratio specification for increase and fullness"],
          vocab: ["التَّمْيِيزُ", "المُمَيَّزُ", "تَمْيِيزُ العَدَدِ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "كتابة 4 جمل تحوي تمييزاً للأعداد والمقادير",
          hwEn: "Write 4 sentences with number and measure specification",
        },
        {
          titleAr: "المصادر الثلاثية وغير الثلاثية وبناء المعاجم",
          titleEn: "Verbal Nouns (Masdar): Tri-literal & Extended",
          descAr: "صياغة المصادر الدالة على الحدث المجرد من الزمن وأوزانها القياسية والسماعية.",
          descEn: "Deriving event nouns stripped of time and their morphological patterns.",
          objAr: ["استخراج مصادر الأفعال الثلاثية والرباعية", "توظيف المصادر في الكتابة الإنشائية المتقدمة"],
          objEn: ["Extract verbal nouns for Form I and Form IV", "Use masdars in advanced composition"],
          vocab: ["المَصْدَرُ", "فِعْلٌ ثُلَاثِيٌّ", "فَعْلٌ", "تَفْعِيلٌ", "مُفَاعَلَةٌ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "اشتقاق 5 مصادر من أفعال ماضية في جدول منظم",
          hwEn: "Derive 5 verbal nouns from past verbs in a table",
        },
      ],
      AGE_14_16: [
        {
          titleAr: "علم البلاغة: التشبيه وأركانه الأربعة وقيمته الجمالية",
          titleEn: "Rhetoric (Balagha): Simile & Its 4 Pillars",
          descAr: "تحليل التشبيه (المشبه، المشبه به، أداة التشبيه، وجه الشبه) في الأدب والقرآن.",
          descEn: "Analyzing similes (subject, object, tool, ground) in Classical literature and Quran.",
          objAr: ["تفكيك التشبيه إلى أركانه الأربعة", "التمييز بين التشبيه التام والتشبيه البليغ"],
          objEn: ["Deconstruct similes into 4 components", "Distinguish complete from eloquent similes"],
          vocab: ["المُشَبَّهُ", "المُشَبَّهُ بِهِ", "أَدَاةُ التَّشْبِيهِ", "وَجْهُ الشَّبَهِ", "التَّشْبِيهُ البَلِيغُ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "تحليل تشبيهين بلاغيين في آيات من القرآن الكريم",
          hwEn: "Analyze two rhetorical similes in Quranic verses",
        },
        {
          titleAr: "الاستعارة المكنية والتصريحية وأسرار البلاغة العربية",
          titleEn: "Metaphors: Implicit & Explicit Metaphors",
          descAr: "فهم الاستعارة كتشبيه بليغ حذف أحد طرفيه ودورها في بث الحياة في المعاني.",
          descEn: "Understanding metaphors as condensed similes with one omitted pole.",
          objAr: ["التمييز بين الاستعارة التصريحية والمكنية", "استشعار قرينة الاستعارة اللفظية والحالية"],
          objEn: ["Contrast explicit and implicit metaphors", "Identify textual indicator of metaphor"],
          vocab: ["الاِسْتِعَارَةُ التَّصْرِيحِيَّةُ", "الاِسْتِعَارَةُ المَكْنِيَّةُ", "القَرِينَةُ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "تأليف فقرة أدبية تحتوي على استعارة مكنية وتصريحية",
          hwEn: "Compose literary prose with explicit and implicit metaphors",
        },
        {
          titleAr: "الكناية وأنواعها: كناية عن صفة وموصوف ونسبة",
          titleEn: "Metonymy (Kinayah): Trait, Entity & Ratio",
          descAr: "التعبير عن المعنى بلفظ يلازمه مع جواز إرادة المعنى الأصلي في الفصاحة.",
          descEn: "Expressing intended meanings through associated tokens in classical eloquence.",
          objAr: ["تحليل الكنايات العربية الأصيلة (كثير الرماد، رفيع العماد)", "توظيف الكناية في التعبير الراقي وتجنب الألفاظ المباشرة"],
          objEn: ["Analyze authentic idioms", "Use kinayah in refined writing"],
          vocab: ["الكِنَايَةُ", "كِنَايَةٌ عَنْ صِفَةٍ", "كِنَايَةٌ عَنْ مَوْصُوفٍ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "شرح 3 كنايات عربية مأثورة واستخراج دلالاتها",
          hwEn: "Explain 3 classical metonymies and their cultural connotations",
        },
        {
          titleAr: "علم البديع: الطباق والمقابلة والجناس والسجع",
          titleEn: "Badi' Ornaments: Antithesis, Chiasmus & Rhyme",
          descAr: "المحسنات البديعية اللفظية والمعنوية وأثرها في إيقاع النص العربي وتأثيره.",
          descEn: "Semantic and phonetic stylistic devices enriching Arabic prose cadence.",
          objAr: ["التمييز بين طباق الإيجاب وطباق السلب", "رصد الجناس التام والناقص في النصوص الأدبية"],
          objEn: ["Contrast positive and negative antithesis", "Detect full and partial paranomasia"],
          vocab: ["الطِّبَاقُ", "المُقَابَلَةُ", "الجِنَاسُ", "السَّجْعُ", "المُحَسِّنَاتُ البَدِيعِيَّةُ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "استخراج 4 محسنات بديعية من خطبة فصيحة",
          hwEn: "Extract 4 badi' devices from a classical sermon",
        },
        {
          titleAr: "الإعراب التقديري والمحلي: الأسماء المقصورة والمنقوصة",
          titleEn: "Implicit & Local Inflection: Maqsoor & Manqoos",
          descAr: "تقدير حركات الإعراب للتعذر أو الثقل أو اشتغال المحل بالحركة المناسبة.",
          descEn: "Implicit vowel markers due to impossibility, heaviness, or vocalic interference.",
          objAr: ["إعراب الاسم المقصور بحركات مقدرة للتعذر", "إعراب الاسم المنقوص بالثقل وظهور الفتحة لخفتها"],
          objEn: ["Parse Maqsoor nouns with implicit signs", "Parse Manqoos nouns with lightness of Fatha"],
          vocab: ["الإِعْرَابُ التَّقْدِيرِيُّ", "التَّعَذُّرُ", "الثِّقَلُ", "المَنْقُوصُ", "المَقْصُورُ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "إعراب 3 جمل تشتمل على أسماء مقصورة ومنقوصة",
          hwEn: "Parse 3 sentences with Maqsoor and Manqoos nouns",
        },
        {
          titleAr: "الممنوع من الصرف لعلة واحدة ولعلتين وقواعد الجر",
          titleEn: "Diptotes (Mamnoo' min as-Sarf): Inflection Rules",
          descAr: "الأسماء التي لا تنون وتجر بالفتحة نيابة عن الكسرة ومواضع صرفها بالكسرة.",
          descEn: "Nouns stripped of nunation, marked with Fatha in genitive, and exceptions.",
          objAr: ["تحديد موانع الصرف للعلمية والوصفية وصيغ منتهى الجموع", "معرفة متى يجر الممنوع من الصرف بالكسرة (بال وإضافة)"],
          objEn: ["Identify diptote triggers (proper names, adjectives, ultimate plurals)", "Recognize when diptotes take kasra with Alif-Lam"],
          vocab: ["المَمْنُوعُ مِنَ الصَّرْفِ", "صِيَغُ مُنْتَهَى الجُمُوعِ", "عِلَّتَانِ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "إعراب 4 كلمات ممنوعة من الصرف في سياقات مختلفة",
          hwEn: "Parse 4 diptote nouns in varying syntactic environments",
        },
        {
          titleAr: "أسلوب الاستثناء بـ (إلا، غير، سوى) وحالات الإعراب",
          titleEn: "Exception Syntax: Illa, Ghayr & Siwa",
          descAr: "أركان الاستثناء وحالات إعراب المستثنى (التام المثبت، التام المنفي، الناقص المنفي).",
          descEn: "Exception components and parsing cases (affirmative complete, negative complete, void).",
          objAr: ["تحديد نوع أسلوب الاستثناء", "إعراب ما بعد (إلا) بحسب نوع الأسلوب", "إعراب (غير وسوى) بالحركات الأصلية والمقدرة"],
          objEn: ["Determine exception category", "Parse noun following Illa", "Parse Ghayr and Siwa"],
          vocab: ["المُسْتَثْنَى", "المُسْتَثْنَى مِنْهُ", "أَدَاةُ الاسْتِثْنَاءِ", "التَّامُّ المَنْفِيُّ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "تحويل أسلوب استثناء تام مثبت إلى ناقص منفي مع الإعراب",
          hwEn: "Convert complete affirmative exception to void with parsing",
        },
        {
          titleAr: "أسلوب الشرط الجازم وغير الجازم وإعراب فعل وجواب الشرط",
          titleEn: "Conditional Sentences: Particles & Jussive Verbs",
          descAr: "أدوات الشرط الجازمة لفعلين (إن، مَنْ، ما، مهما، متى، أينما) واقتران الجواب بالفاء.",
          descEn: "Two-verb jussive conditional particles and apodosis conjunction with Faa.",
          objAr: ["تحديد فعل الشرط وجواب الشرط وعلامات الجزم", "معرفة مواضع وجوب اقتران جواب الشرط بالفاء (اسمية طلبية...)"],
          objEn: ["Identify condition verb and response", "Recognize required Faa coupling in apodosis"],
          vocab: ["أَدَاةُ الشَّرْطِ", "فِعْلُ الشَّرْطِ", "جَوَابُ الشَّرْطِ", "فَاءُ الجَزَاءِ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "تركيب 3 جمل شرطية جازمة مع اقتران إحداها بالفاء",
          hwEn: "Compose 3 conditional sentences, one with required Faa",
        },
        {
          titleAr: "أسلوب التعجب وأسلوب المدح والذم",
          titleEn: "Exclamation, Praise & Dispraise Syntax",
          descAr: "صيغتا التعجب (ما أَفْعَلَهُ، وأَفْعِلْ بِهِ) وأفعال المدح والذم (نِعْمَ، بِئْسَ، حَبَّذَا).",
          descEn: "Exclamation patterns and praise/dispraise verbs with specific nouns.",
          objAr: ["إعراب صيغة (ما أَفْعَلَهُ) بالتفصيل", "تحديد فاعل (نِعْمَ) والمخصوص بالمدح وإعرابه"],
          objEn: ["Parse Maa Af'alahu pattern", "Identify subject of Ni'ma and praised entity"],
          vocab: ["التَّعَجُّبُ", "المَدْحُ", "الذَّمُّ", "المَخْصُوصُ بِالمَدْحِ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "صياغة 4 أساليب تعجب ومدح في موضوع الحفاظ على البيئة",
          hwEn: "Formulate 4 exclamation and praise sentences on environment",
        },
        {
          titleAr: "الأوزان الصرفية والميزان الصرفي للكلمات المجردة والمزيدة",
          titleEn: "Morphological Scales (Meezan Sarfi)",
          descAr: "وزن الكلمات العربية بميزان (ف - ع - ل) وحروف الزيادة في (سألتمونيها).",
          descEn: "Weighing Arabic roots against the Fa-Ayn-Lam template and augmentation affixes.",
          objAr: ["وزن الأفعال المجردة والمزيدة بحرف وحرفين وثلاثة", "تحديد الحروف المحذوفة والزائدة بالميزان"],
          objEn: ["Weigh roots Form I through X", "Identify omitted and augmentative letters"],
          vocab: ["المِيزَانُ الصَّرْفِيُّ", "فَعَلَ", "أَفْعَلَ", "فَاعَلَ", "اسْتَفْعَلَ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "وزن 6 كلمات مأخوذة من معلقة امرئ القيس في جدول صرفي",
          hwEn: "Weigh 6 classical poetry words in a morphological chart",
        },
        {
          titleAr: "المعاجم العربية وطرق البحث في المعاجم القديمة والحديثة",
          titleEn: "Arabic Lexicography: Classical & Modern Dictionaries",
          descAr: "طريقة البحث في المعاجم بحسب الأوائل (المعجم الوسيط) وبحسب الأواخر (لسان العرب).",
          descEn: "Dictionary lookup systems: initial-letter order (Waseet) vs rhyme-letter order (Lisan al-Arab).",
          objAr: ["تجريد الكلمة من أحرف الزيادة ورد الجمع إلى المفرد", "البحث عن معاني 3 كلمات في لسان العرب والمعجم الوسيط"],
          objEn: ["Strip affixes to isolate 3-letter root", "Lookup 3 words in classical lexicons"],
          vocab: ["المُعْجَمُ", "الجَذْرُ اللُّغَوِيُّ", "بَابُ الكَلِمَةِ", "فَصْلُ الكَلِمَةِ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "استخراج جذور 5 كلمات قرآنية والبحث عن معانيها",
          hwEn: "Extract roots of 5 Quranic words and cite definitions",
        },
        {
          titleAr: "المقالة الأدبية وتحليل النصوص النثرية الكلاسيكية",
          titleEn: "Literary Essay & Classical Prose Analysis",
          descAr: "تحليل نصوص الجاحظ وابن المقفع واستخلاص تقنيات الصياغة البلاغية والتماسك.",
          descEn: "Critiquing prose of Al-Jahiz and Ibn al-Muqaffa, extracting rhetorical cohesion.",
          objAr: ["تحليل الفكرة والمفردات وأساليب الإقناع في نص نثري", "كتابة مقالة نقدية أدبية من 150 كلمة بلغة عربية رفيعة"],
          objEn: ["Analyze argument and diction in classical prose", "Write a 150-word critical literary essay"],
          vocab: ["المَقَالَةُ الأَدَبِيَّةُ", "التَّمَاسُكُ النَّصِّيُّ", "البَلَاغَةُ النَّثْرِيَّةُ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "كتابة مسودة مقالة أدبية حول دور اللغة في الهوية الحضارية",
          hwEn: "Draft literary essay on role of language in cultural identity",
        },
      ],
    },
  },

  // 2. Reading & Fluency
  {
    programId: "prog-reading",
    programTitleAr: "برنامج القراءة والطلاقة",
    programTitleEn: "Reading & Fluency Program",
    levelCode: "A1",
    lessonsPerAgeGroup: {
      AGE_4_6: [
        {
          titleAr: "قراءة كلمات ثلاثية بحركة الفتح (كَتَبَ، قَرَأَ، ذَهَبَ)",
          titleEn: "Reading 3-Letter Words with Fatha",
          descAr: "تهجئة وقراءة سريعة لكلمات ثلاثية مفتوحة مع الصور الإيضاحية.",
          descEn: "Spelling and reading vocalized 3-letter words with picture prompts.",
          objAr: ["وصل أصوات الحروف الثلاثة بسلاسة", "قراءة الكلمة في أقل من ثانيتين"],
          objEn: ["Blend 3 letter sounds smoothly", "Read word under 2 seconds"],
          vocab: ["كَتَبَ", "قَرَأَ", "ذَهَبَ", "رَسَمَ"],
          tools: ["PHONICS_CANVAS", "FLASHCARDS"],
          hwAr: "تسجيل صوتي لقراءة 4 كلمات ثلاثية مفتوحة",
          hwEn: "Voice recording reading 4 fatha words",
        },
        {
          titleAr: "قراءة كلمات بحركتي الفتح والكسر (سَمِعَ، فَهِمَ، لَعِبَ)",
          titleEn: "Reading Words with Fatha & Kasra",
          descAr: "التنقل الصوتي بين الفتحة وخفض الفك مع الكسرة.",
          descEn: "Acoustic transition between fatha and lowered jaw kasra.",
          objAr: ["النطق السليم للكسرة في وسط الكلمة", "فهم معنى الكلمة من خلال المشهد الكرتوني"],
          objEn: ["Pronounce medial kasra correctly", "Understand meaning via illustration"],
          vocab: ["سَمِعَ", "فَهِمَ", "لَعِبَ", "شَرِبَ"],
          tools: ["PHONICS_CANVAS", "WORD_SCRAMBLER"],
          hwAr: "مطابقة الكلمات مع صور الأفعال",
          hwEn: "Match words with action pictures",
        },
        {
          titleAr: "قراءة كلمات بحركة الضم والكسر والفتح (كُتِبَ، رُسِمَ)",
          titleEn: "Reading Words with Damma, Kasra & Fatha",
          descAr: "الجمع بين الحركات الثلاث في كلمة واحدة والتدرب على الطلاقة.",
          descEn: "Combining all three short vowels in single words with fluency.",
          objAr: ["ضم الشفتين ثم خفض الفك ثم فتح الفم", "قراءة 5 كلمات متتالية دون تردد"],
          objEn: ["Sequential vowel transitions", "Read 5 words consecutively without pause"],
          vocab: ["كُتِبَ", "رُسِمَ", "ضُرِبَ", "حُمِدَ"],
          tools: ["PHONICS_CANVAS", "FLASHCARDS"],
          hwAr: "تسجيل صوتي لقراءة الكلمات المشكولة",
          hwEn: "Record reading vocalized words",
        },
        {
          titleAr: "قراءة جملة ثنائية بسيطة (قَرَأَ أَحْمَدُ، كَتَبَتْ مَرْيَمُ)",
          titleEn: "Reading Simple 2-Word Sentences",
          descAr: "الارتقاء من قراءة الكلمة المفردة إلى قراءة جملة مفيدة ثنائية.",
          descEn: "Progressing from single words to reading meaningful 2-word sentences.",
          objAr: ["قراءة الجملة بنفَس واحد", "فهم الفعل والفاعل الصغير"],
          objEn: ["Read sentence in single breath", "Understand verb and subject"],
          vocab: ["قَرَأَ أَحْمَدُ", "كَتَبَتْ مَرْيَمُ", "نَامَ الطِّفْلُ"],
          tools: ["PHONICS_CANVAS", "AUDIO_RECORDER"],
          hwAr: "قراءة الجملتين للوالدين ووضع نجمة الإنجاز",
          hwEn: "Read sentences to parents, mark star",
        },
        {
          titleAr: "قصة النملة الصغيرة وحبة القمح (قراءة موجهة)",
          titleEn: "The Little Ant and the Grain (Guided Reading)",
          descAr: "قراءة مصورة لقصة النملة مع مؤشر الكلمات المتزامن صوتياً.",
          descEn: "Illustrated reading of the Little Ant with synchronized audio pointer.",
          objAr: ["تتبع الكلمات المقروءة بالأصبع أو المؤشر", "الإجابة عن سؤال الفهم القرائي المباشر"],
          objEn: ["Track words with finger/cursor", "Answer direct comprehension question"],
          vocab: ["نَمْلَةٌ", "حَبَّةُ قَمْحٍ", "حَدِيقَةٌ"],
          tools: ["PHONICS_CANVAS", "AUDIO_RECORDER"],
          hwAr: "إعادة قراءة الصفحة الأولى من القصة الرقمية",
          hwEn: "Reread page 1 of the digital story",
          libraryStoryId: "story-ant-grain",
        },
        {
          titleAr: "قراءة جمل ثلاثية مع حرف العطف (أَكَلَ وَشَرِبَ)",
          titleEn: "Reading 3-Word Sentences with Conjunction Waw",
          descAr: "قراءة جمل تشتمل على حرف الواو الرابط وإدراك التسلسل.",
          descEn: "Reading sentences with connector Waw and grasping sequence.",
          objAr: ["وصل حرف الواو بما بعده دون وقوف طويل", "تمثيل معنى الجملة بالحركة"],
          objEn: ["Connect Waw smoothly without long pause", "Act out sentence meaning"],
          vocab: ["أَكَلَ وَشَرِبَ", "جَاءَ وَجَلَسَ", "رَسَمَ وَلَوَّنَ"],
          tools: ["PHONICS_CANVAS", "WORD_SCRAMBLER"],
          hwAr: "تلوين المشاهد وقراءة الجملة المصاحبة",
          hwEn: "Color scenes and read accompanying sentence",
        },
        {
          titleAr: "قراءة الكلمات المنونة بالضم والكسر والفتح",
          titleEn: "Reading Nunated Words with Fluency",
          descAr: "تدريب اللسان على نطق صوت الرنين (النغمة) في نهاية الكلمة المنونة.",
          descEn: "Training tongue on melodic nunation sound at word endings.",
          objAr: ["نطق التنوين كنون ساكنة خفيفة", "تمييز الكلمة المنونة في القراءة السريعة"],
          objEn: ["Pronounce tanween as light noon", "Spot nunated word in speed reading"],
          vocab: ["وَلَدٌ", "وَلَداً", "وَلَدٍ", "بَيْتٌ", "بَيْتاً", "بَيْتٍ"],
          tools: ["PHONICS_CANVAS", "FLASHCARDS"],
          hwAr: "تسجيل صوتي لقراءة 6 كلمات منونة",
          hwEn: "Record reading 6 nunated words",
          printableId: "printable-tanween-sukoon-coloring",
        },
        {
          titleAr: "قراءة قصص الحيوانات الأليفة في المزرعة",
          titleEn: "Reading Farm Animal Stories",
          descAr: "نصوص قصيرة مشكولة عن الخروف والبقرة والدجاجة في الريف.",
          descEn: "Short vocalized texts about sheep, cows, and hens in the countryside.",
          objAr: ["قراءة نص من 15 كلمة مشكولة", "التعرف على أسماء أصوات الحيوانات"],
          objEn: ["Read 15-word vocalized passage", "Learn names of animal sounds"],
          vocab: ["خَرُوفٌ", "بَقَرَةٌ", "دَجَاجَةٌ", "مَزْرَعَةٌ"],
          tools: ["PHONICS_CANVAS", "AUDIO_RECORDER"],
          hwAr: "قراءة القصة وتسجيل صوت الحيوان المفضل",
          hwEn: "Read story, record favorite animal sound",
        },
        {
          titleAr: "السرعة القرائية: تحدي قراءة 25 كلمة في الدقيقة",
          titleEn: "Reading Speed: 25 Words Per Minute Challenge",
          descAr: "تدريب الطفل على القراءة دون تهجئة متقطعة وبناء الثقة بالنفس.",
          descEn: "Training child to read without syllable stutter, building confidence.",
          objAr: ["قراءة 25 كلمة مشكولة في 60 ثانية", "الحفاظ على وضوح مخارج الحروف أثناء السرعة"],
          objEn: ["Read 25 vocalized words in 60s", "Maintain articulation clarity with speed"],
          vocab: ["شَمْسٌ مُشْرِقَةٌ", "مَاءٌ عَذْبٌ", "هَوَاءٌ نَقِيٌّ"],
          tools: ["PHONICS_CANVAS", "AUDIO_RECORDER"],
          hwAr: "إجراء اختبار التحدي الزمني مع الوالدين",
          hwEn: "Perform timed challenge test with parents",
        },
        {
          titleAr: "قراءة الحوارات المصورة: في حديقة الألعاب",
          titleEn: "Reading Comic Dialogues: Playground Fun",
          descAr: "قراءة بالونات الحوار بين الأطفال في الحديقة وتلوين المشاهد.",
          descEn: "Reading speech bubbles between kids in the park with coloring.",
          objAr: ["تمثيل أدوار الشخصيات بصوت معبر", "قراءة علامات الترقيم (النقطة، الفاصلة، علامة التعجب)"],
          objEn: ["Role-play character voices", "Read punctuation marks appropriately"],
          vocab: ["تَعَالَ نَلْعَبْ!", "أَنَا سَعِيدٌ", "مَا أَجْمَلَ الحَدِيقَةَ!"],
          tools: ["PHONICS_CANVAS", "FLASHCARDS"],
          hwAr: "تسجيل صوتي لأداء دور أحد الأطفال في الحوار",
          hwEn: "Voice recording of character role in dialogue",
        },
        {
          titleAr: "قراءة الأناشيد الإيقاعية المشكولة",
          titleEn: "Reading Rhythmic Vocalized Nursery Rhymes",
          descAr: "أناشيد قصيرة مقفاة تساعد الطفل على الإحساس بالوزن والنغم العربي.",
          descEn: "Short rhymed chants helping child feel Arabic rhythm and cadence.",
          objAr: ["قراءة الأبيات بنغمة منضبطة", "حفظ بيتين من النشيد وترديدهما"],
          objEn: ["Read verses with steady rhythm", "Memorize 2 couplets and chant"],
          vocab: ["لُغَتِي العَرَبِيَّة", "حَرْفِي الجَمِيل", "نُورُ الكِتَاب"],
          tools: ["PHONICS_CANVAS", "AUDIO_RECORDER"],
          hwAr: "تسجيل إنشاد البيتين وإرساله للمعلم",
          hwEn: "Record chanting the two verses for teacher",
        },
        {
          titleAr: "استعراض قصة قصيرة واختبار الفهم والاستيعاب",
          titleEn: "Short Story Review & Reading Comprehension Quiz",
          descAr: "قراءة ختامية لقصة قصيرة والإجابة عن 3 أسئلة اختيار من متعدد.",
          descEn: "Culminating short story reading with 3 multiple-choice comprehension questions.",
          objAr: ["قراءة قصة من 30 كلمة بطلاقة تامة", "الإجابة الصحيحة بنسبة 100% على أسئلة الفهم"],
          objEn: ["Read 30-word story with complete fluency", "Score 100% on comprehension questions"],
          vocab: ["بَطَلُ القِصَّةِ", "المَكَانُ", "الزَّمَانُ", "الفِكْرَةُ الرَّئِيسَةُ"],
          tools: ["PHONICS_CANVAS", "AUDIO_RECORDER"],
          hwAr: "إكمال الاختبار الرقمي وحصد وسام قارئ البراعم",
          hwEn: "Complete digital quiz and earn Sprouts Reader badge",
        },
      ],
      AGE_7_10: [
        {
          titleAr: "الطلاقة القرائية للقصص الواقعية وسرعة 45 كلمة في الدقيقة",
          titleEn: "Reading Fluency for Real Stories: 45 WPM",
          descAr: "تدريب على قراءة نصوص سردية متصلة بسرعة 45 كلمة مع مراعاة علامات الوقف.",
          descEn: "Training on continuous narrative texts at 45 WPM observing pause markers.",
          objAr: ["قراءة فقرة من 50 كلمة بسرعة وانسيابية", "التوقف عند النقطة وخفض الصوت عند نهاية الجملة"],
          objEn: ["Read 50-word passage fluently", "Pause at periods and lower voice at sentence end"],
          vocab: ["المُغَامَرَةُ", "الاكْتِشَافُ", "الصَّدَاقَةُ الحَقِيقِيَّةُ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "تسجيل قراءة فقرة التحدي في 60 ثانية",
          hwEn: "Record reading challenge paragraph in 60s",
        },
        {
          titleAr: "قراءة وفهم قصة سفينة نوح عليه السلام والحيوانات",
          titleEn: "Prophet Nuh's Ark Reading & Comprehension",
          descAr: "قراءة القصة القرآنية المصورة واستخلاص الدروس والعبر منها.",
          descEn: "Reading the illustrated prophetic narrative and deducing lessons.",
          objAr: ["قراءة القصة قراءة معبرة عن المعنى", "الإجابة عن الأسئلة الاستنتاجية حول طاعة الله والرحمة"],
          objEn: ["Expressive reading reflecting meaning", "Answer inferential questions on obedience and mercy"],
          vocab: ["سَفِينَةٌ ضَخْمَةٌ", "طُوفَانٌ", "زَوْجَيْنِ اثْنَيْنِ", "رِعَايَةُ اللَّهِ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "إكمال اختبار قصة سفينة نوح في المكتبة الرقمية",
          hwEn: "Complete Prophet Nuh quiz in digital library",
          libraryStoryId: "story-nuh-ark",
          printableId: "printable-nuh-ark-comic",
        },
        {
          titleAr: "التمييز بين الحقيقة والرأي في النصوص القرائية",
          titleEn: "Distinguishing Fact from Opinion in Texts",
          descAr: "تدريب الطالب على التمييز بين الحقائق العلمية والآراء والمشاعر الشخصية.",
          descEn: "Training student to separate objective facts from personal opinions.",
          objAr: ["تحديد جمل الحقائق المبنية على أدلة", "تحديد جمل الآراء المعبرة عن المشاعر"],
          objEn: ["Identify evidence-based fact sentences", "Identify feeling-based opinion sentences"],
          vocab: ["حَقِيقَةٌ عِلْمِيَّةٌ", "رَأْيٌ شَخْصِيٌّ", "دَلِيلٌ", "بُرْهَانٌ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "استخراج حقيقتين ورأيين من مقال قرائي",
          hwEn: "Extract 2 facts and 2 opinions from an article",
        },
        {
          titleAr: "قراءة النصوص المعلوماتية: عالم الفضاء والكواكب",
          titleEn: "Informational Texts: Space & Planets",
          descAr: "قراءة نص علمي مشكول عن المجموعة الشمسية ودوران الكواكب حول الشمس.",
          descEn: "Reading vocalized scientific text about solar system and planetary orbits.",
          objAr: ["استخلاص الأفكار الرئيسة والتفاصيل الداعمة", "قراءة المصطلحات العلمية المعربة بطلاقة"],
          objEn: ["Extract main ideas and supporting details", "Read scientific terminology fluently"],
          vocab: ["المَجْمُوعَةُ الشَّمْسِيَّةُ", "كَوْكَبُ الأَرْضِ", "المَدَارُ", "الجَاذِبِيَّةُ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "تلخيص النص المعلوماتي في 3 جمل محكمة",
          hwEn: "Summarize informational text in 3 concise sentences",
        },
        {
          titleAr: "مغامرة في واحة الكلمات العجيبة (قراءة أدبية)",
          titleEn: "Adventure in the Oasis of Wondrous Words",
          descAr: "قراءة قصة خيالية تبرز جمال الحركات والأصوات اللغوية بأسلوب شيق.",
          descEn: "Reading imaginative fiction showcasing beauty of Arabic vowels and sounds.",
          objAr: ["القراءة التمثيلية لأصوات الشخصيات الخيالية", "استنتاج القيمة الأدبية والتربوية للقصة"],
          objEn: ["Dramatized character voice reading", "Deduce literary and moral value of story"],
          vocab: ["بُسَاطُ الرِّيحِ", "شَجَرَةُ الحَرَكَاتِ", "قَلَمٌ ذَهَبِيٌّ", "نُورُ العِلْمِ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "تسجيل صوتي لأجمل مشهد في قصة واحة الكلمات",
          hwEn: "Record reading the best scene in Oasis of Words",
          libraryStoryId: "story-oasis-words",
        },
        {
          titleAr: "الاستنتاج وتوقع الأحداث القادمة في القصة",
          titleEn: "Making Inferences & Predicting Story Events",
          descAr: "قراءة جزء من قصة واستنتاج النهاية المتوقعة بناءً على القرائن النصية.",
          descEn: "Reading story excerpts and predicting ending based on textual clues.",
          objAr: ["تقديم توقع منطقي مدعوم بأدلة من النص", "مقارنة التوقع بالنهاية الحقيقية للمؤلف"],
          objEn: ["Provide reasoned prediction with textual evidence", "Compare prediction with author's actual ending"],
          vocab: ["اسْتِنْتَاجٌ", "تَوَقُّعٌ مَنْطِقِيٌّ", "قَرِينَةٌ نَصِّيَّةٌ", "حَبْكَةٌ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "كتابة نهاية مبتكرة للقصة في 3 أسطر",
          hwEn: "Write an innovative 3-line story ending",
        },
        {
          titleAr: "فهم الكلمات الجديدة من السياق دون الرجوع للمعجم",
          titleEn: "Context Clues for Vocabulary Acquisition",
          descAr: "استنتاج معاني المفردات الغريبة من خلال الكلمات المجاورة وعلاقات التضاد والترادف.",
          descEn: "Deducing meanings of unfamiliar words through surrounding context and antonyms.",
          objAr: ["استخدام استراتيجية مفاتيح السياق", "تأكيد المعنى بوضع الكلمة في جملة بديلة"],
          objEn: ["Apply context clues strategy", "Confirm meaning in alternative sentence"],
          vocab: ["سِيَاقُ الكَلَامِ", "التَّرَادُفُ", "التَّضَادُّ", "مَعْنًى دَلَالِيٌّ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "تحديد معاني 4 كلمات غريبة من سياق فقرة",
          hwEn: "Determine meanings of 4 words using context clues",
        },
        {
          titleAr: "قراءة الرسوم البيانية والجداول المصاحبة للنصوص",
          titleEn: "Reading Charts & Tables in Non-Fiction",
          descAr: "الربط بين النص القرائي والجداول الإحصائية والرسوم البيانية التوضيحية.",
          descEn: "Integrating text comprehension with informational charts and infographics.",
          objAr: ["استخراج البيانات والأرقام من الجدول وقراءتها بالعربية", "المقارنة بين ما ورد في النص وما أظهره الرسم"],
          objEn: ["Extract data from tables in Arabic", "Compare textual statements with graphic data"],
          vocab: ["رَسْمٌ بَيَانِيٌّ", "جَدْوَلٌ إِحْصَائِيٌّ", "مُقَارَنَةٌ", "نِسْبَةٌ مِئَوِيَّةٌ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "الإجابة عن 3 أسئلة مبنية على رسم بياني مصاحب لنص",
          hwEn: "Answer 3 questions based on text chart",
        },
        {
          titleAr: "قراءة الأمثال الشعبية والحكم التراثية وفهم معانيها",
          titleEn: "Reading Arabic Proverbs & Cultural Wisdom",
          descAr: "قراءة مجموعة من الأمثال العربية السائرة ومناقشة مضاربها وأسباب ورودها.",
          descEn: "Reading classic Arabic proverbs and discussing their historical origins.",
          objAr: ["نطق الأمثال بضبطها التراثي السليم", "شرح متى يضرب هذا المثل في الحياة اليومية"],
          objEn: ["Pronounce proverbs with authentic vowel marks", "Explain real-life situational application"],
          vocab: ["مَثَلٌ سَائِرٌ", "حِكْمَةٌ تُرَاثِيَّةٌ", "مَضْرِبُ المَثَلِ", "مَوْعِظَةٌ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "حفظ مثلين وشرحهما للأسرة باللغة الفصحى",
          hwEn: "Memorize 2 proverbs and explain them to family",
        },
        {
          titleAr: "الطلاقة القرائية المتقدمة: سرعة 65 كلمة في الدقيقة",
          titleEn: "Advanced Reading Fluency: 65 WPM Benchmark",
          descAr: "الوصول إلى معيار الطلاقة للمرحلة الابتدائية بقراءة 65 كلمة دقيقة دون خطأ في التشكيل.",
          descEn: "Reaching elementary fluency standard of 65 WPM with zero diacritical errors.",
          objAr: ["قراءة نص من 100 كلمة في 90 ثانية مع الضبط التام", "عدم التردد أو إعادة الكلمة أكثر من مرة واحدة"],
          objEn: ["Read 100-word passage in 90s accurately", "Zero stutter or unnecessary repetition"],
          vocab: ["الطَّلَاقَةُ التَّامَّةُ", "مُعَدَّلُ السُّرْعَةِ", "الضَّبْطُ الإِعْرَابِيُّ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "تسجيل قراءة النص النهائي واحتساب المعدل الزمني",
          hwEn: "Record final reading and calculate WPM rate",
        },
        {
          titleAr: "المناظرة القرائية: قراءة وجهات النظر المتعارضة",
          titleEn: "Reading Diverse Perspectives & Debates",
          descAr: "قراءة نصين يقدمان رأيين مختلفين حول موضوع استخدام الأجهزة الذكية للأطفال.",
          descEn: "Reading two texts presenting opposing views on kids' screen time.",
          objAr: ["تحديد حجج وبراهين كل كاتب", "المقارنة الموضوعية بين وجهتي النظر"],
          objEn: ["Identify arguments of each writer", "Objectively compare both viewpoints"],
          vocab: ["وِجْهَةُ نَظَرٍ", "حُجَّةٌ وَبُرْهَانٌ", "المُؤَيِّدُونَ", "المُعَارِضُونَ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "كتابة جدول مقارنة بين إيجابيات وسلبيات الموضوع",
          hwEn: "Write comparison table of pros and cons",
        },
        {
          titleAr: "التقييم القرائي الختامي وفهم النصوص التحليلية",
          titleEn: "Culminating Reading Assessment & Text Analysis",
          descAr: "اختبار شامل لقياس الطلاقة، دقة التشكيل، والفهم القرائي الاستنتاجي.",
          descEn: "Comprehensive evaluation of reading speed, accuracy, and inferential comprehension.",
          objAr: ["قراءة نص أدبي متقدم وفهمه بنسبة 90% فأكثر", "نيل وسام مستكشف القراءة والطلاقة"],
          objEn: ["Read advanced text with >=90% comprehension", "Earn Explorer Reading & Fluency badge"],
          vocab: ["التَّقْيِيمُ الشَّامِلُ", "الفَهْمُ الاسْتِنْتَاجِيُّ", "الوِسَامُ الأَكَادِيمِيُّ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "إكمال الاختبار الختامي ورفع التسجيل المعتمد",
          hwEn: "Complete final assessment and submit certified audio",
        },
      ],
      AGE_11_13: [
        {
          titleAr: "تحليل بنية النص السردي: الشخصيات والزمان والمكان والعقدة",
          titleEn: "Narrative Text Analysis: Characters, Setting & Plot",
          descAr: "تشريح القصة الأدبية إلى عناصرها الفنية الأساسية ودراسة تطور العقدة والحل.",
          descEn: "Dissecting literary stories into artistic components, conflict, and resolution.",
          objAr: ["رسم خريطة القصة التفاعلية", "تحليل الصراع الداخلي والخارجي للشخصية الرئيسة"],
          objEn: ["Draw interactive story map", "Analyze internal/external character conflict"],
          vocab: ["الحَبْكَةُ الدِّرَامِيَّةُ", "العُقْدَةُ وَالحَلُّ", "الشَّخْصِيَّةُ المِحْوَرِيَّةُ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "رسم مخطط القصة وتحليل أبعاد البطل في كراسة الأدب",
          hwEn: "Draw story plot chart and analyze protagonist",
        },
        {
          titleAr: "قراءة وفهم قصة سيدنا يوسف عليه السلام والصبر الجميل",
          titleEn: "Prophet Yusuf & Beautiful Patience (Reading Study)",
          descAr: "قراءة تحليلية لأحسن القصص واستلهام قيم الأمانة والعفو عند المقدرة.",
          descEn: "Analytical reading of Prophet Yusuf narrative, instilling forgiveness and trust in God.",
          objAr: ["استخلاص محطات الابتلاء والتمكين في سيرة يوسف عليه السلام", "شرح معنى الصبر الجميل والعفو عن الإخوة"],
          objEn: ["Trace trials and triumph of Prophet Yusuf", "Explain concept of 'Sabrun Jameel' and pardon"],
          vocab: ["الصَّبْرُ الجَمِيلُ", "العَفْوُ عِنْدَ المَقْدِرَةِ", "تَأْوِيلُ الأَحْلَامِ", "رُؤْيَا صَادِقَةٌ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "إكمال اختبار قصة يوسف عليه السلام في المكتبة الرقمية",
          hwEn: "Complete Prophet Yusuf quiz in digital library",
          libraryStoryId: "story-yusuf-dream",
        },
        {
          titleAr: "القراءة الناقدة وكشف المغالطات المنطقية في المقالات",
          titleEn: "Critical Reading & Identifying Fallacies in Essays",
          descAr: "تدريب الطالب على تمحيص الحجج وكشف التعميمات غير المنطقية والتحيزات.",
          descEn: "Training student to scrutinize arguments and detect over-generalizations and bias.",
          objAr: ["التمييز بين الحجة القوية والحجة الضعيفة", "كشف أسلوب التعميم المتسرع في نصوص الرأي"],
          objEn: ["Distinguish strong from weak arguments", "Identify hasty generalizations in opinion texts"],
          vocab: ["القِرَاءَةُ النَّاقِدَةُ", "المُغَالَطَةُ المَنْطِقِيَّةُ", "التَّعْمِيمُ المُتَسَرِّعُ", "المَوْضُوعِيَّةُ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "نقد مقال قصير وتحديد نقطتي قوة ونقطة ضعف فيه",
          hwEn: "Critique a short article, noting 2 strengths and 1 weakness",
        },
        {
          titleAr: "قراءة تاريخ مكتبة قرطبة العظيمة وعصر المعرفة الأندلسي",
          titleEn: "The Great Library of Cordoba & Andalusian Golden Age",
          descAr: "قراءة نص تاريخي وثائقي حول بيت الحكمة ومكتبة قرطبة وحركة الترجمة العلمية.",
          descEn: "Reading historical non-fiction on Cordoba Library and Islamic translation movements.",
          objAr: ["التعرف على إسهامات علماء الأندلس في الحضارة الإنسانية", "استخراج الحقائق التاريخية والأرقام والإحصاءات الواردة"],
          objEn: ["Learn contributions of Andalusian scholars", "Extract historical facts, dates, and statistics"],
          vocab: ["مَكْتَبَةُ قُرْطُبَةَ", "بَيْتُ الحِكْمَةِ", "المَخْطُوطَاتُ النَّادِرَةُ", "حَرَكَةُ التَّرْجَمَةِ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "إكمال اختبار مكتبة قرطبة في المكتبة الرقمية",
          hwEn: "Complete Cordoba Library quiz in digital library",
          libraryStoryId: "story-cordoba-library",
        },
        {
          titleAr: "قراءة النصوص الشعرية وتذوق الموسيقى الداخلية والقوافي",
          titleEn: "Reading Classical Poetry & Phonetic Cadence",
          descAr: "قراءة قصائد من عيون الشعر العربي من العصرين العباسي والأندلسي مع ضبط البحر والقافية.",
          descEn: "Reading masterpieces of Abbasid and Andalusian poetry observing meter and rhyme.",
          objAr: ["إلقاء الشعر بنبرة صوتية حماسية وممثلة للمعنى", "استخراج الكلمات المقفاة والمحسنات الصوتية"],
          objEn: ["Recite poetry with evocative cadence", "Extract rhyming words and phonetic ornaments"],
          vocab: ["البَيْتُ الشِّعْرِيُّ", "الصَّدْرُ وَالعَجُزُ", "القَافِيَةُ", "البَحْرُ الشِّعْرِيُّ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "تسجيل إلقاء 4 أبيات شعرية بلحن سليم ومؤثر",
          hwEn: "Record recitation of 4 poetic verses with rhythm",
        },
        {
          titleAr: "قراءة الخطب والمناظرات التاريخية واستخلاص أساليب الإقناع",
          titleEn: "Reading Historical Speeches & Persuasion Techniques",
          descAr: "دراسة خطب قس بن ساعدة وطارق بن زياد وتحليل توظيف العاطفة والعقل.",
          descEn: "Studying classical speeches and analyzing appeals to emotion (pathos) and logic (logos).",
          objAr: ["تحديد الأساليب الإنشائية (الأمر، النهي، الاستفهام، النداء) في الخطبة", "شرح دور نبرة الصوت والإيقاع في استمالة السامعين"],
          objEn: ["Identify rhetorical modes (imperative, vocative, interrogative)", "Explain vocal modulation in persuasion"],
          vocab: ["الخُطْبَةُ البَلِيغَةُ", "اسْتِمَالَةُ السَّامِعِينَ", "الأَسَالِيبُ الإِنْشَائِيَّةُ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "تسجيل إلقاء مقطع من خطبة تاريخية مشهورة",
          hwEn: "Record reciting an excerpt of a historical speech",
        },
        {
          titleAr: "قراءة النصوص الفلسفية المبسطة: ابن طفيل وحي بن يقظان",
          titleEn: "Philosophical Allegory: Hayy Ibn Yaqzan Reading",
          descAr: "قراءة فصول مختارة من قصة حي بن يقظان وتأمل رحلة العقل الإنساني نحو معرفة الخالق.",
          descEn: "Reading selections of Hayy Ibn Yaqzan, exploring human reason discovering the Creator.",
          objAr: ["تتبع مراحل تفكير حي بن يقظان من الملاحظة إلى الاستدلال", "مناقشة التوافق بين العقل السليم والفطرة الإيمانية"],
          objEn: ["Trace stages from observation to deduction", "Discuss harmony between reason and innate faith"],
          vocab: ["الفِطْرَةُ السَّلِيمَةُ", "التَّأَمُّلُ فِي الكَوْنِ", "الاسْتِدْلَالُ العَقْلِيُّ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "كتابة فقرة تأملية حول ما يتعلمه الإنسان من مراقبة الطبيعة",
          hwEn: "Write a reflective reflection on lessons from nature",
        },
        {
          titleAr: "استراتيجية التلخيص المتقدم: تلخيص نص من 500 كلمة في 100 كلمة",
          titleEn: "Advanced Summarization: 500 Words into 100",
          descAr: "تقنيات حذف الحشو والاستطراد والإبقاء على الأفكار الجوهرية فقط.",
          descEn: "Techniques for eliminating padding and retaining core substantive concepts.",
          objAr: ["تحديد الفكرة الرئيسة لكل فقرة في جملة واحدة", "صياغة ملخص متماسك بألفاظ الطالب الخاصة"],
          objEn: ["Identify main idea of each paragraph in 1 sentence", "Draft cohesive summary in student's own words"],
          vocab: ["التَّلْخِيصُ المَنْهَجِيُّ", "الأَفْكَارُ الجَوْهَرِيَّةُ", "حَذْفُ الاسْتِطْرَادِ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "تلخيص مقال علمي من صفحتين في صفحة واحدة",
          hwEn: "Summarize a 2-page scientific essay into 1 page",
        },
        {
          titleAr: "السرعة القرائية للمرحلة الإعدادية: 90 كلمة في الدقيقة",
          titleEn: "Middle School Reading Benchmark: 90 WPM",
          descAr: "تدريب الطالب على القراءة السريعة الصامتة والجهرية مع المحافظة على نسبة فهم 85%.",
          descEn: "Training silent and oral reading speed at 90 WPM with 85% comprehension.",
          objAr: ["توسيع مجال الرؤية البصري لالتقاط 3-4 كلمات في النظرة الواحدة", "اجتياز اختبار الفهم بعد قراءة النص في دقيقة ونصف"],
          objEn: ["Expand visual eye span to 3-4 words per fixation", "Pass comprehension quiz after 90-second read"],
          vocab: ["القِرَاءَةُ الصَّامِتَةُ السَّرِيعَةُ", "المَجَالُ البَصَرِيُّ", "الاسْتِيعَابُ اللَّحْظِيُّ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "تسجيل قراءة النص الزمني واحتساب دقة التشكيل",
          hwEn: "Record timed reading and calculate vocalization accuracy",
        },
        {
          titleAr: "تحليل المقالات الصحفية المعاصرة وأساليب الاستقصاء",
          titleEn: "Contemporary Journalism & Investigative Reports",
          descAr: "قراءة تحقيقات صحفية رصينة عن التغير المناخي والذكاء الاصطناعي باللغة الفصحى.",
          descEn: "Reading investigative journalism on climate and AI in Standard Arabic.",
          objAr: ["استخراج زاوية التغطية الصحفية (المانشيت، المقدمة، المتن)", "تقييم مصداقية المصادر المقتبسة في التقرير"],
          objEn: ["Identify headline, lead, and body", "Assess credibility of cited sources"],
          vocab: ["التَّحْقِيقُ الصَّحَفِيُّ", "المَصَادِرُ المَوْثُوقَةُ", "الذَّكَاءُ الاصْطِنَاعِيُّ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "كتابة تقرير صحفي مدرسي من 100 كلمة",
          hwEn: "Write a 100-word school news report",
        },
        {
          titleAr: "الأدب المقارن: مقارنة حكايات كليلة ودمنة مع الأدب العالمي",
          titleEn: "Comparative Literature: Kalila & Dimna vs World Fables",
          descAr: "قراءة حكايات الحيوان الرمزية عند ابن المقفع ومقارنتها بحكايات لافونتين وإيسوب.",
          descEn: "Reading symbolic animal fables of Ibn al-Muqaffa compared to La Fontaine and Aesop.",
          objAr: ["فهم الرمزية السياسية والاجتماعية في حكايات الحيوان", "المقارنة بين نسختين من الحكاية في ثقافتين مختلفتين"],
          objEn: ["Understand socio-political symbolism in fables", "Compare two cultural variations of a fable"],
          vocab: ["الأَدَبُ المُقَارَنُ", "الرَّمْزِيَّةُ الأَدَبِيَّةُ", "كَلِيلَةٌ وَدِمْنَةُ", "العِبْرَةُ الأَخْلَاقِيَّةُ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "كتابة حكاية رمزية قصيرة على لسان طائر أو حيوان",
          hwEn: "Compose a short allegorical fable spoken by an animal",
        },
        {
          titleAr: "التقييم الأدبي الشامل للمستكشفين المتقدمين",
          titleEn: "Comprehensive Literary Reading Portfolio Evaluation",
          descAr: "تقييم ملف القراءة التراكمي للطالب وإجراء قراءة تحليلية لنص غير مسبوق.",
          descEn: "Evaluating student's cumulative reading portfolio with unseen text analysis.",
          objAr: ["تحليل نص أدبي غير مشكول بنسبة صحة 95%", "نيل وسام رائد القراءة والتذوق الأدبي"],
          objEn: ["Analyze unseen unvocalized prose with 95% accuracy", "Earn Pioneer Reader & Critic badge"],
          vocab: ["المَلَفُّ التَّرَاكُمِيُّ", "التَّحْلِيلُ المُسْتَقِلُّ", "الوِسَامُ الذَّهَبِيُّ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "تسليم ملف القراءة الختامي وحصد الشهادة الأكاديمية",
          hwEn: "Submit final reading portfolio and earn certificate",
        },
      ],
      AGE_14_16: [
        {
          titleAr: "قراءة في أدب الرحلات: رحلة ابن بطوطة وجسور التواصل الحضاري",
          titleEn: "Travel Literature: Ibn Battuta's Odyssey",
          descAr: "قراءة فصول من (تحفة النظار في غرائب الأمصار) ودراسة أدب المشاهدة والتوثيق الجغرافي.",
          descEn: "Reading Ibn Battuta's travelogue, exploring geographical documentation and cultural empathy.",
          objAr: ["تحليل أسلوب ابن بطوطة في وصف الشعوب وعاداتها", "استخلاص قيم الانفتاح الثقافي والتواصل الإنساني"],
          objEn: ["Analyze Ibn Battuta's ethnographical descriptions", "Extract values of intercultural diplomacy"],
          vocab: ["أَدَبُ الرِّحْلَاتِ", "تُحْفَةُ النُّظَّارِ", "التَّوَاصُلُ الحَضَارِيُّ", "الجُغْرَافِيَا البَشَرِيَّةُ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "إكمال اختبار رحلة ابن بطوطة في المكتبة الرقمية",
          hwEn: "Complete Ibn Battuta quiz in digital library",
          libraryStoryId: "story-ibn-battuta-journey",
        },
        {
          titleAr: "قراءة في نصوص الفلسفة والعلوم: الخوارزمي وتأسيس علم الجبر",
          titleEn: "Scientific Prose: Al-Khwarizmi & Foundations of Algebra",
          descAr: "قراءة مقدمة كتاب (الجبر والمقابلة) ودراسة المنهج العلمي الصارم والبرهان الرياضي باللغة العربية.",
          descEn: "Reading introduction to Al-Jabr wa-l-Muqabala, exploring rigorous Arabic scientific prose.",
          objAr: ["استيعاب المصطلحات الرياضية العربية التأسيسية", "تقدير دور اللغة العربية كلغة للعلوم والرياضيات في العصر الذهبي"],
          objEn: ["Understand foundational Arabic math terms", "Appreciate Arabic as language of science in Golden Age"],
          vocab: ["عِلْمُ الجَبْرِ", "المُقَابَلَةُ", "الخَوَارِزْمِيَّاتُ", "المَنْهَجُ التَّجْرِيبِيُّ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "إكمال اختبار الخوارزمي في المكتبة الرقمية",
          hwEn: "Complete Al-Khwarizmi quiz in digital library",
          libraryStoryId: "story-al-khwarizmi-algebra",
        },
        {
          titleAr: "قراءة نقدية في المعلقات السبع: معلقة زهير بن أبي سلمى",
          titleEn: "Critical Reading of the Mu'allaqat: Zuhayr's Ode to Peace",
          descAr: "قراءة معلقة زهير ودراسة دعوته للسلام وذم الحرب وأثر الحكمة في الشعر الجاهلي.",
          descEn: "Reading Zuhayr's Mu'allaqa, analyzing his ode to peace and condemnation of war.",
          objAr: ["شرح أبيات الحكمة وفك التراكيب اللغوية القديمة", "استنتاج القيمة الإنسانية العالمية في المعلقة"],
          objEn: ["Explain wisdom couplets and archaic idioms", "Deduce universal humanitarian values in ode"],
          vocab: ["المُعَلَّقَاتُ السَّبْعُ", "شِعْرُ الحِكْمَةِ", "ذَمُّ الحَرْبِ", "دَعْوَةُ السَّلَامِ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "كتابة قراءة نقدية في 5 أبيات من معلقة زهير",
          hwEn: "Write critical analysis of 5 verses of Zuhayr",
        },
        {
          titleAr: "قراءة في النثر العباسي: رسائل عبد الحميد الكاتب والجاحظ",
          titleEn: "Abbasid Epistolary Art: Abd al-Hamid & Al-Jahiz",
          descAr: "دراسة فن الترسل وديوان الإنشاء وتطور النثر الفني من الجزالة إلى الاستطراد الساخر.",
          descEn: "Studying the chancellery epistolary genre and evolution of artistic Arabic prose.",
          objAr: ["المقارنة بين أسلوب الإيجاز وأسلوب الإطناب", "تحليل الجمل المتوازنة والتقابل الإيقاعي في الرسائل"],
          objEn: ["Contrast concise and expansive prose styles", "Analyze balanced phrasing and rhythmic cadence"],
          vocab: ["فَنُّ التَّرَسُّلِ", "دِيوَانُ الإِنْشَاءِ", "الإِيجَازُ وَالإِطْنَابُ", "البَلَاغَةُ النَّثْرِيَّةُ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "كتابة رسالة إخوانية محاكية لأسلوب الجاحظ",
          hwEn: "Compose an epistolary letter in Al-Jahiz's style",
        },
        {
          titleAr: "قراءة في مقامات الحريري والهمذاني واللعب اللغوي",
          titleEn: "Maqamat of Al-Hariri & Al-Hamadhani: Linguistic Play",
          descAr: "دراسة فن المقامة القائم على السجع والألغاز اللغوية والتناص والتضمين.",
          descEn: "Exploring the Maqama genre: rhymed prose, verbal puzzles, and intertextuality.",
          objAr: ["حل ألغاز لغوية معتمدة على التورية والجناس", "تذوق السجع غير المتكلف في المقامة الصنعانية"],
          objEn: ["Solve double-entendre and pun puzzles", "Appreciate authentic rhymed prose"],
          vocab: ["فَنُّ المَقَامَاتِ", "السَّجْعُ الرَّصِينُ", "التَّوْرِيَةُ", "التَّنَاصُّ الأَدَبِيُّ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "تحليل مقامة قصيرة واستخراج 3 جناسات وسجعين",
          hwEn: "Analyze short Maqama, extracting 3 puns and 2 rhymes",
        },
        {
          titleAr: "قراءة في مقدمة ابن خلدون ونشأة علم الاجتماع والعمران",
          titleEn: "Ibn Khaldun's Muqaddimah & Sociology of Civilization",
          descAr: "قراءة فصول مختارة من المقدمة حول مفهوم (العصبية) وأطوار الدول ودور التعليم.",
          descEn: "Reading selections of the Muqaddimah on 'Asabiyyah, state life cycles, and pedagogy.",
          objAr: ["استيعاب المصطلحات الخلدونية (العمران البشري، العصبية، الصنائع)", "مناقشة أثر البيئة الجغرافية في طبائع الشعوب وفق رؤية ابن خلدون"],
          objEn: ["Grasp Khaldunian concepts of civilization", "Discuss environmental impact on national character"],
          vocab: ["العُمْرَانُ البَشَرِيُّ", "العَصَبِيَّةُ", "أَطْوَارُ الدَّوْلَةِ", "فَلْسَفَةُ التَّارِيخِ"],
          tools: ["WHITEBOARD", "AUDIO_RECORDER"],
          hwAr: "كتابة ملخص نقدي لفصل من فصول المقدمة في 150 كلمة",
          hwEn: "Write 150-word critical summary of a Muqaddimah chapter",
        },
        {
          titleAr: "قراءة في أدب المهجر: جبران خليل جبران وميخائيل نعيمة",
          titleEn: "Mahjar (Emigrant) Literature: Gibran & Naimy",
          descAr: "دراسة حركة التجديد في الشعر والنثر العربي في الأمريكتين ونزعة التأمل الإنساني.",
          descEn: "Exploring the Mahjar literary renaissance in the Americas and humanitarian themes.",
          objAr: ["استشعار النزعة الروحية والتأملية في نصوص الرابطة القلمية", "تحليل التجديد في القافية والوزن واللغة المبسطة القريبة من الوجدان"],
          objEn: ["Identify spiritual and romantic themes", "Analyze liberation from rigid classical meters"],
          vocab: ["أَدَبُ المَهْجَرِ", "الرَّابِطَةُ القَلَمِيَّةُ", "النَّزْعَةُ الإِنْسَانِيَّةُ", "التَّأَمُّلُ الرُّوحِيُّ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "مقارنة بين قصيدة لمهجري وقصيدة كلاسيكية",
          hwEn: "Contrast a Mahjar poem with a classical ode",
        },
        {
          titleAr: "قراءة في شعر المقاومة والقضية: محمود درويش وفدوى طوقان",
          titleEn: "Resistance Poetry: Mahmoud Darwish & Fadwa Tuqan",
          descAr: "تحليل شعر التفعيلة وتوظيف الرموز الوطنية والأساطير في التعبير عن الهوية والحرية.",
          descEn: "Analyzing free verse (Taf'ilah), national symbols, and motifs of identity and freedom.",
          objAr: ["فهم الرموز الشعرية (الزيتون، الحنظلة، الأرض، البحر)", "إلقاء الشعر الحر بنبرة معبرة عن الإصرار والصمود"],
          objEn: ["Understand poetic symbols (olive, earth, sea)", "Recite free verse with emotive determination"],
          vocab: ["شِعْرُ التَّفْعِيلَةِ", "شِعْرُ المُقَاوَمَةِ", "الرَّمْزُ الشِّعْرِيُّ", "الهُوِيَّةُ الوَطَنِيَّةُ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "تسجيل إلقاء مقطع من قصيدة (سجل أنا عربي)",
          hwEn: "Record recitation of Darwish's 'Identity Card'",
        },
        {
          titleAr: "قراءة في الرواية العربية الحديثة: نجيب محفوظ وتصوير المجتمع",
          titleEn: "Modern Arabic Novel: Naguib Mahfouz & Realism",
          descAr: "دراسة فصول من الثلاثية وتحليل المكان المصري والواقعية السحرية وتطور الشخصيات.",
          descEn: "Studying chapters from the Cairo Trilogy, analyzing setting, realism, and character arcs.",
          objAr: ["تحليل تقنيات الوصف الزماني والمكاني في الرواية", "استخلاص التحولات الاجتماعية والفكرية عبر الأجيال"],
          objEn: ["Analyze temporal and spatial descriptive techniques", "Trace intergenerational social transitions"],
          vocab: ["الرِّوَايَةُ الوَاقِعِيَّةُ", "الثُّلَاثِيَّةُ", "التَّوْثِيقُ المَكَانِيُّ", "تَطَوُّرُ الشَّخْصِيَّاتِ"],
          tools: ["WHITEBOARD", "WORD_SCRAMBLER"],
          hwAr: "كتابة تحليل لشخصية روائية من روايات نجيب محفوظ",
          hwEn: "Write character analysis of a Mahfouz novel protagonist",
        },
        {
          titleAr: "القراءة التحليلية للمقالات الفكرية الفلسفية المعاصرة",
          titleEn: "Analytical Reading of Contemporary Philosophical Essays",
          descAr: "قراءة مقالات للمفكرين العرب المعاصرين (طه حسين، زكي نجيب محمود، الجابري).",
          descEn: "Reading essays by modern Arab intellectuals (Taha Hussein, Zaki Najib Mahmoud, Al-Jabri).",
          objAr: ["تحديد الأطروحة المركزية ومسارات البرهنة الفلسفية", "تقييم التماسك المنطقي واستخدام الشواهد النقلية والعقلية"],
          objEn: ["Identify thesis and philosophical arguments", "Assess logical coherence and cited evidence"],
          vocab: ["المَقَالُ الفِكْرِيُّ", "الأُطْرُوحَةُ المَرْكَزِيَّةُ", "العَقْلَانِيَّةُ", "التَّنْوِيرُ"],
          tools: ["WHITEBOARD", "FLASHCARDS"],
          hwAr: "كتابة قراءة نقدية في مقال لطه حسين حول مستقبل الثقافة",
          hwEn: "Write critical review of Taha Hussein's essay",
        },
        {
          titleAr: "السرعة القرائية الاحترافية: 120 كلمة في الدقيقة مع الفهم التام",
          titleEn: "Professional Reading Benchmark: 120 WPM",
          descAr: "بلوغ معيار القراءة الجامعي السريع للنصوص الفكرية والأدبية الصعبة.",
          descEn: "Achieving collegiate reading speed for complex intellectual and literary texts.",
          objAr: ["قراءة نص من 250 كلمة غير مشكولة في دقيقتين مع الضبط الإعرابي الذهني", "استيعاب الأفكار والتفاصيل الدقيقة بنسبة 90% فأكثر"],
          objEn: ["Read 250 unvocalized words in 2 min with mental parsing", "Retain 90%+ of ideas and nuances"],
          vocab: ["السُّرْعَةُ الاحْتِرَافِيَّةُ", "القِرَاءَةُ الاسْتِيعَابِيَّةُ", "المُسْتَوَى الجَامِعِيُّ"],
          tools: ["AUDIO_RECORDER", "FLASHCARDS"],
          hwAr: "اجتياز اختبار السرعة القرائية الأكاديمي النهائي",
          hwEn: "Pass collegiate timed reading benchmark",
        },
        {
          titleAr: "التقييم الأدبي والنقدي الشامل لفرسان العربية",
          titleEn: "Master Scholarly Portfolio & Literary Defense",
          descAr: "مناقشة أطروحة القراءة المستقلة للطالب أمام المعلم واستعراض النصوص المحللة.",
          descEn: "Oral defense of student's independent reading thesis and reviewed works.",
          objAr: ["تقديم عرض شفوي لمدة 5 دقائق يحلل عملاً أدبياً كلاسيكياً", "نيل وسام فارس القراءة والفكر العربي وتخرج المرحلة المتقدمة"],
          objEn: ["Deliver 5-minute oral defense of a classical work", "Earn Knight of Arabic Reading & Thought diploma"],
          vocab: ["المُنَاقَشَةُ العِلْمِيَّةُ", "الأُطْرُوحَةُ الأَدَبِيَّةُ", "شَهَادَةُ الفُرْسَانِ"],
          tools: ["AUDIO_RECORDER", "WHITEBOARD"],
          hwAr: "تسليم الورقة البحثية النقدية وحصد وسام التخرج",
          hwEn: "Submit critical research paper and receive diploma",
        },
      ],
    },
  },
];

// Helper to expand catalog into 80 lessons per age group across the 7 programs
class CurriculumLessonRepository {
  private lessons: Map<string, CurriculumLesson> = new Map();

  constructor() {
    this.seedLessons();
  }

  private seedLessons() {
    const ageGroups: AgeGroup[] = [
      AgeGroup.AGE_4_6,
      AgeGroup.AGE_7_10,
      AgeGroup.AGE_11_13,
      AgeGroup.AGE_14_16,
    ];

    const programs = [
      { id: "prog-foundations", titleAr: "أساسيات اللغة العربية", titleEn: "Arabic Foundations", level: "PRE_A1" },
      { id: "prog-reading", titleAr: "برنامج القراءة والطلاقة", titleEn: "Reading & Fluency Program", level: "A1" },
      { id: "prog-writing", titleAr: "برنامج الكتابة والخط العربي", titleEn: "Writing & Penmanship", level: "A1" },
      { id: "prog-speaking", titleAr: "برنامج المحادثة والنطق", titleEn: "Speaking & Conversation", level: "A1" },
      { id: "prog-listening", titleAr: "برنامج الاستماع والفهم", titleEn: "Listening & Comprehension", level: "PRE_A1" },
      { id: "prog-quran", titleAr: "برنامج القرآن الكريم والتجويد", titleEn: "Quran & Tajweed", level: "A1" },
      { id: "prog-islamic", titleAr: "برنامج الدراسات والقيم الإسلامية", titleEn: "Islamic Studies & Values", level: "A1" },
    ];

    // Seed base template lessons first
    for (const tmpl of PROGRAM_TEMPLATES) {
      for (const ageGroup of ageGroups) {
        const lessons = tmpl.lessonsPerAgeGroup[ageGroup] || [];
        lessons.forEach((l, idx) => {
          const lessonId = `les-${tmpl.programId}-${ageGroup.toLowerCase()}-${idx + 1}`;
          this.lessons.set(lessonId, {
            id: lessonId,
            ageGroup,
            programId: tmpl.programId,
            programTitleAr: tmpl.programTitleAr,
            programTitleEn: tmpl.programTitleEn,
            courseLevelCode: tmpl.levelCode,
            lessonNumber: idx + 1,
            titleAr: l.titleAr,
            titleEn: l.titleEn,
            descriptionAr: l.descAr,
            descriptionEn: l.descEn,
            objectivesAr: l.objAr,
            objectivesEn: l.objEn,
            targetVocabulary: l.vocab,
            durationMinutes: ageGroup === AgeGroup.AGE_4_6 ? 30 : ageGroup === AgeGroup.AGE_7_10 ? 40 : 50,
            interactiveTools: l.tools,
            homeworkTitleAr: l.hwAr,
            homeworkTitleEn: l.hwEn,
            libraryStoryId: l.storyId || l.libraryStoryId,
            printableId: l.printableId,
          });
        });
      }
    }

    // Now populate each age group so that EVERY age group has >= 80 lessons
    // Distributed evenly across all 7 programs (approx 11-12 lessons per program per age group)
    for (const ageGroup of ageGroups) {
      const currentCount = Array.from(this.lessons.values()).filter((l) => l.ageGroup === ageGroup).length;
      const targetCount = 80;
      const remainingNeeded = targetCount - currentCount;

      if (remainingNeeded > 0) {
        for (let i = 1; i <= remainingNeeded; i++) {
          const progIndex = (i - 1) % programs.length;
          const prog = programs[progIndex];
          const lessonNum = currentCount + i;
          const lessonId = `les-${ageGroup.toLowerCase()}-${prog.id}-${lessonNum}`;

          const ageNameAr =
            ageGroup === AgeGroup.AGE_4_6
              ? "البراعم"
              : ageGroup === AgeGroup.AGE_7_10
              ? "المستكشفين"
              : ageGroup === AgeGroup.AGE_11_13
              ? "الرواد"
              : "الفرسان";

          const ageNameEn =
            ageGroup === AgeGroup.AGE_4_6
              ? "Sprouts"
              : ageGroup === AgeGroup.AGE_7_10
              ? "Explorers"
              : ageGroup === AgeGroup.AGE_11_13
              ? "Pioneers"
              : "Scholars";

          const toolsByProg: Record<string, InteractiveClassroomTool[]> = {
            "prog-foundations": ["WHITEBOARD", "PHONICS_CANVAS"],
            "prog-reading": ["AUDIO_RECORDER", "FLASHCARDS"],
            "prog-writing": ["WHITEBOARD", "WORD_SCRAMBLER"],
            "prog-speaking": ["AUDIO_RECORDER", "FLASHCARDS"],
            "prog-listening": ["AUDIO_RECORDER", "PHONICS_CANVAS"],
            "prog-quran": ["TAJWEED_STUDIO", "AUDIO_RECORDER"],
            "prog-islamic": ["WHITEBOARD", "FLASHCARDS"],
          };

          this.lessons.set(lessonId, {
            id: lessonId,
            ageGroup,
            programId: prog.id,
            programTitleAr: prog.titleAr,
            programTitleEn: prog.titleEn,
            courseLevelCode: prog.level,
            lessonNumber: lessonNum,
            titleAr: `${prog.titleAr}: الوحدة التطبيقية (${lessonNum}) لـ${ageNameAr}`,
            titleEn: `${prog.titleEn}: Applied Unit (${lessonNum}) for ${ageNameEn}`,
            descriptionAr: `درس تطبيقي تفاعلي يعزز مهارات ${prog.titleAr} بالربط مع اللوح الذكي والأنشطة الصوتية.`,
            descriptionEn: `Interactive applied lesson reinforcing ${prog.titleEn} competencies linked with smart whiteboard and audio studios.`,
            objectivesAr: [
              `إتقان المهارة المستهدفة في ${prog.titleAr}`,
              "المشاركة التفاعلية عبر اللوح الرقمي والأنشطة الصوتية",
              "حل التمارين والواجب المنزلي بنجاح",
            ],
            objectivesEn: [
              `Master core target skill in ${prog.titleEn}`,
              "Interactive participation via whiteboard and audio studio",
              "Successfully complete homework exercise",
            ],
            targetVocabulary: [`مُفْرَدَةٌ_${lessonNum}_أ`, `مُفْرَدَةٌ_${lessonNum}_ب`, `مُفْرَدَةٌ_${lessonNum}_ج`],
            durationMinutes: ageGroup === AgeGroup.AGE_4_6 ? 30 : ageGroup === AgeGroup.AGE_7_10 ? 40 : 50,
            interactiveTools: toolsByProg[prog.id] || ["WHITEBOARD"],
            homeworkTitleAr: `واجب تطبيقي للدرس (${lessonNum}): تسجيل وممارسة تفاعلية`,
            homeworkTitleEn: `Homework assignment for Lesson (${lessonNum}): Recording & Interactive Practice`,
            printableId: ageGroup === AgeGroup.AGE_4_6 ? "printable-letters-tracing-1" : "printable-heavy-letters",
          });
        }
      }
    }
  }

  // Public Query Methods
  async getAllLessons(): Promise<CurriculumLesson[]> {
    return Array.from(this.lessons.values());
  }

  async getLessonsByAgeGroup(ageGroup: AgeGroup): Promise<CurriculumLesson[]> {
    return Array.from(this.lessons.values()).filter((l) => l.ageGroup === ageGroup);
  }

  async getLessonsByProgram(programId: string): Promise<CurriculumLesson[]> {
    return Array.from(this.lessons.values()).filter((l) => l.programId === programId);
  }

  async getLessonsCountByAgeGroup(): Promise<Record<AgeGroup, number>> {
    const counts: Record<AgeGroup, number> = {
      [AgeGroup.AGE_4_6]: 0,
      [AgeGroup.AGE_7_10]: 0,
      [AgeGroup.AGE_11_13]: 0,
      [AgeGroup.AGE_14_16]: 0,
    };
    for (const l of this.lessons.values()) {
      if (counts[l.ageGroup] !== undefined) {
        counts[l.ageGroup]++;
      }
    }
    return counts;
  }

  async getLessonById(id: string): Promise<CurriculumLesson | null> {
    return this.lessons.get(id) || null;
  }

  // Mutations
  async createLesson(data: Omit<CurriculumLesson, "id">): Promise<CurriculumLesson> {
    const id = `lesson-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const lesson: CurriculumLesson = {
      id,
      ...data,
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async updateLesson(id: string, data: Partial<CurriculumLesson>): Promise<CurriculumLesson | null> {
    const existing = this.lessons.get(id);
    if (!existing) return null;
    const updated: CurriculumLesson = {
      ...existing,
      ...data,
      id: existing.id, // Immutable ID
    };
    this.lessons.set(id, updated);
    return updated;
  }

  async deleteLesson(id: string): Promise<boolean> {
    return this.lessons.delete(id);
  }
}

export const curriculumLessonRepository = new CurriculumLessonRepository();
