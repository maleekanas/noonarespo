export type PrintableCategory =
  | "HANDWRITING_TRACING"
  | "COLORING_HARAKAT"
  | "PROPHETIC_COMICS"
  | "VOCABULARY_FLASHCARDS";

export interface PrintableItemDetail {
  titleAr: string;
  guideTextAr: string;
  guideTextEn: string;
  practiceLinesCount: number;
  sampleCharacters: string[];
  illustrationEmoji?: string;
}

export interface PrintablePacket {
  id: string;
  titleAr: string;
  titleEn: string;
  category: PrintableCategory;
  categoryNameAr: string;
  targetAgeGroup: "AGE_4_6" | "AGE_7_10" | "AGE_11_13" | "AGE_14_16";
  pageCount: number;
  paperFormat: "A4_PORTRAIT" | "A4_LANDSCAPE";
  thumbnailEmoji: string;
  descriptionAr: string;
  descriptionEn: string;
  qrCodeDestinationUrl: string;
  qrCodeLabelAr: string;
  items: PrintableItemDetail[];
}

class InMemoryPrintablesRepository {
  private printables: Map<string, PrintablePacket> = new Map();

  constructor() {
    this.seedPrintables();
  }

  private seedPrintables() {
    // 1. Handwriting Tracing (Part 1)
    this.printables.set("printable-letters-tracing-1", {
      id: "printable-letters-tracing-1",
      titleAr: "كراسة تتبع حروف خط النسخ المسطرة (أ - خ)",
      titleEn: "Ruled Naskh Handwriting Tracing Book (Alif to Kha)",
      category: "HANDWRITING_TRACING",
      categoryNameAr: "تحسين الخط والتتبع",
      targetAgeGroup: "AGE_4_6",
      pageCount: 4,
      paperFormat: "A4_PORTRAIT",
      thumbnailEmoji: "✍️",
      descriptionAr: "خطوط نقطية مسطرة تتبع مقاييس خط النسخ للأطفال المبتدئين مع إرشادات اتجاه القلم.",
      descriptionEn: "Dotted tracing sheets aligned to Naskh calligraphy standards for beginners with pen-direction arrows.",
      qrCodeDestinationUrl: "/student/pronunciation",
      qrCodeLabelAr: "امسح الرمز للاستماع للنطق الصحيح",
      items: [
        {
          titleAr: "حرف الألف (أ)",
          guideTextAr: "ابدأ من الأعلى نحو السطر بخط مستقيم ثم ارسم الهمزة برفق.",
          guideTextEn: "Start from top straight down to baseline, then add the Hamzah curve.",
          practiceLinesCount: 4,
          sampleCharacters: ["أَ", "إِ", "أُ", "أَسَدٌ"],
          illustrationEmoji: "🦁",
        },
        {
          titleAr: "حرف الباء والتاء والثاء (ب - ت - ث)",
          guideTextAr: "ارسم صحن الحرف مستقراً على السطر ثم ضع النقاط في مكانها الصحيح.",
          guideTextEn: "Trace the gentle bowl resting on the baseline and place the dots accurately.",
          practiceLinesCount: 4,
          sampleCharacters: ["بَـ", "ـتَـ", "ـثْ", "بَيْتٌ"],
          illustrationEmoji: "🏠",
        },
        {
          titleAr: "حرف الجيم والحاء والخاء (ج - ح - خ)",
          guideTextAr: "ارسم الحاجب المتموج فوق السطر ثم انزل بنصف الدائرة تحت السطر.",
          guideTextEn: "Draw the eyebrow wave above the line, then swing the curve below.",
          practiceLinesCount: 4,
          sampleCharacters: ["جَـ", "ـحِـ", "ـخُ", "جَمَلٌ"],
          illustrationEmoji: "🐪",
        },
      ],
    });

    // 2. Heavy vs Light Tracing
    this.printables.set("printable-heavy-letters", {
      id: "printable-heavy-letters",
      titleAr: "كراسة تمييز الحروف المفخمة والمرققة (ص، ض، ط، ظ)",
      titleEn: "Emphatic vs Light Letters Tracing & Geometry",
      category: "HANDWRITING_TRACING",
      categoryNameAr: "تحسين الخط والتتبع",
      targetAgeGroup: "AGE_7_10",
      pageCount: 3,
      paperFormat: "A4_PORTRAIT",
      thumbnailEmoji: "📐",
      descriptionAr: "أوراق تدريب مسطرة مخصصة لكتابة الحروف المطبقة والمفخمة وضبط استقرار كاستها على السطر.",
      descriptionEn: "Ruled sheets tailored for practicing the emphatic letters (Sad, Dhad, Ta, Dha) and their baseline alignment.",
      qrCodeDestinationUrl: "/student/pronunciation",
      qrCodeLabelAr: "امسح الرمز لمطابقة الموجة الصوتية",
      items: [
        {
          titleAr: "حرفا الصاد والضاد (ص - ض)",
          guideTextAr: "ارسم البيضة المائلة برفق ثم الكاسة العميقة المستقرة تحت السطر.",
          guideTextEn: "Trace the rounded oval rising gently, followed by the deep bowl descending below the line.",
          practiceLinesCount: 4,
          sampleCharacters: ["صَـ", "ـصِـ", "ضَـ", "ـضُ"],
          illustrationEmoji: "📦",
        },
        {
          titleAr: "حرفا الطاء والظاء (ط - ظ)",
          guideTextAr: "ارسم جسم الحرف البيضاوي ثم ضع الألف القائمة في ثلثه الأخير.",
          guideTextEn: "Form the closed base loop, then erect the vertical staff at its rear third.",
          practiceLinesCount: 4,
          sampleCharacters: ["طَـ", "ـطِـ", "ظَـ", "ـظُ"],
          illustrationEmoji: "🦚",
        },
      ],
    });

    // 3. Coloring & Short Vowels
    this.printables.set("printable-harakat-coloring", {
      id: "printable-harakat-coloring",
      titleAr: "بطاقات تلوين الحركات القصيرة والمدود الطويلة",
      titleEn: "Short Vowels (Harakat) & Long Madd Coloring Cards",
      category: "COLORING_HARAKAT",
      categoryNameAr: "تلوين وأنشطة تفاعلية",
      targetAgeGroup: "AGE_4_6",
      pageCount: 3,
      paperFormat: "A4_LANDSCAPE",
      thumbnailEmoji: "🎨",
      descriptionAr: "صفحات تلوين رسومات كرتونية جذابة ترمز للفتحة والضمة والكسرة وحروف المد.",
      descriptionEn: "Engaging cartoon coloring illustrations representing Fatha, Damma, Kasra and long Madd vowels.",
      qrCodeDestinationUrl: "/student/quran-studio",
      qrCodeLabelAr: "امسح الرمز لسماع التلاوة التجويدية",
      items: [
        {
          titleAr: "الفتحة: افتح فمك كالوردة 🌸",
          guideTextAr: "لون الفتحة باللون البرتقالي ولون الكلمات التي تبدأ بفتحة.",
          guideTextEn: "Color the Fatha orange and color the pictures starting with Fatha.",
          practiceLinesCount: 2,
          sampleCharacters: ["شَمْسٌ ☀️", "قَمَرٌ 🌙", "سَمَكَةٌ 🐟"],
          illustrationEmoji: "🌺",
        },
        {
          titleAr: "الضمة: ضم شفتيك كالعصفور 🐦",
          guideTextAr: "لون الضمة باللون الأزرق الجميل واقرأ الكلمات المشكولة.",
          guideTextEn: "Color the Damma blue and sound out the vocalized words.",
          practiceLinesCount: 2,
          sampleCharacters: ["عُصْفُورٌ 🐦", "نُجُومٌ ⭐", "دُبٌّ 🐻"],
          illustrationEmoji: "🐥",
        },
      ],
    });

    // 4. Prophetic Stories Coloring & Activity
    this.printables.set("printable-nuh-ark-comic", {
      id: "printable-nuh-ark-comic",
      titleAr: "أنشطة وتلوين قصة سفينة نوح عليه السلام والحيوانات",
      titleEn: "Prophet Nuh's Ark Activity Sheet & Animal Coloring",
      category: "PROPHETIC_COMICS",
      categoryNameAr: "قصص الأنبياء الورقية",
      targetAgeGroup: "AGE_7_10",
      pageCount: 2,
      paperFormat: "A4_LANDSCAPE",
      thumbnailEmoji: "🚢",
      descriptionAr: "ورقة أنشطة وتلوين مصاحبة لقصة سفينة نوح تشمل مطابقة أسماء الحيوانات بالعربية وتلوين السفينة.",
      descriptionEn: "Printable activity sheet accompanying Prophet Nuh's Ark with Arabic animal names matching and colouring.",
      qrCodeDestinationUrl: "/student/stories/story-nuh-ark",
      qrCodeLabelAr: "امسح الرمز لفتح القصة الرقمية التفاعلية",
      items: [
        {
          titleAr: "سفينة نوح في البحر الهائج",
          guideTextAr: "لون السفينة والحيوانات واكتب أسماء الحيوانات على الخط المنقط.",
          guideTextEn: "Color the ark and the animals, then trace the animal names below.",
          practiceLinesCount: 3,
          sampleCharacters: ["أَسَدٌ 🦁", "حَمَامَةٌ 🕊️", "فِيلٌ 🐘", "سَفِينَةٌ 🚢"],
          illustrationEmoji: "🌊",
        },
      ],
    });

    // 5. Daily Islamic Adhkar & Routine Poster
    this.printables.set("printable-daily-adhkar", {
      id: "printable-daily-adhkar",
      titleAr: "ملصق أذكار الصباح والمساء والوضوء لغرفة الطفل",
      titleEn: "Kids Daily Adhkar & Sunnah Routine Wall Poster",
      category: "VOCABULARY_FLASHCARDS",
      categoryNameAr: "ملصقات وبطاقات تعليمية",
      targetAgeGroup: "AGE_7_10",
      pageCount: 2,
      paperFormat: "A4_PORTRAIT",
      thumbnailEmoji: "🌟",
      descriptionAr: "ملصق A4 أنيق يمكن طباعته وتعليقه في غرفة الطفل أو الحمام لتعلم أذكار الوضوء والصباح والطعام.",
      descriptionEn: "Elegant A4 wall poster designed for children's bedrooms to practice daily morning, meal, and Wudhu Adhkar.",
      qrCodeDestinationUrl: "/student/activities",
      qrCodeLabelAr: "امسح الرمز للاستماع للأذكار بصوت الأطفال",
      items: [
        {
          titleAr: "أذكار الاستيقاظ والنوم والوضوء",
          guideTextAr: "اقرأ الذكر يومياً مع والديك وضع علامة صح في خانة الإنجاز.",
          guideTextEn: "Recite the Dhikr daily with parents and tick the completion star.",
          practiceLinesCount: 3,
          sampleCharacters: [
            "الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا",
            "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
            "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
          ],
          illustrationEmoji: "🤲",
        },
      ],
    });

    // 6. Coloring & Tanween / Sukoon (complements the short-vowels set above)
    this.printables.set("printable-tanween-sukoon-coloring", {
      id: "printable-tanween-sukoon-coloring",
      titleAr: "بطاقات تلوين التنوين والسكون ومطابقة الأصوات",
      titleEn: "Tanween & Sukoon Coloring and Sound-Matching Cards",
      category: "COLORING_HARAKAT",
      categoryNameAr: "تلوين وأنشطة تفاعلية",
      targetAgeGroup: "AGE_4_6",
      pageCount: 3,
      paperFormat: "A4_LANDSCAPE",
      thumbnailEmoji: "🖍️",
      descriptionAr: "صفحات تلوين ومطابقة تشرح التنوين بالفتح والضم والكسر، والسكون، بأسلوب مرح مناسب للمبتدئين.",
      descriptionEn: "Coloring and matching pages introducing Tanween (Fathatayn, Dammatayn, Kasratayn) and Sukoon in a playful, beginner-friendly way.",
      qrCodeDestinationUrl: "/student/pronunciation",
      qrCodeLabelAr: "امسح الرمز للاستماع لنموذج المعلم ومطابقة النطق",
      items: [
        {
          titleAr: "التنوين: صوتان في نهاية الكلمة 🎈🎈",
          guideTextAr: "لون التنوين بالأخضر ثم استمع للنموذج وكرر الكلمة بصوت عالٍ.",
          guideTextEn: "Color every Tanween mark green, then listen to the model and repeat the word aloud.",
          practiceLinesCount: 2,
          sampleCharacters: ["كِتَابٌ 📗", "قَلَمًا ✏️", "بَيْتٍ 🏠"],
          illustrationEmoji: "🎈",
        },
        {
          titleAr: "السكون: توقف قصير وهادئ 🤫",
          guideTextAr: "لون دائرة السكون باللون الرمادي واستمع للفرق بين الحركة والسكون.",
          guideTextEn: "Color the Sukoon circle grey and listen for the difference between a vowel and a stop.",
          practiceLinesCount: 2,
          sampleCharacters: ["مَسْجِدٌ 🕌", "قَمْرٌ 🌙", "عَيْنٌ 👁️"],
          illustrationEmoji: "🤫",
        },
      ],
    });

    // 7. Prophetic Comics (Part 2) -- same real Nuh story as packet #4,
    // approached through a different activity type (sequencing/retelling
    // rather than coloring/matching) so both packets legitimately point at
    // the one prophetic story that currently exists as a real, narrated,
    // interactive digital reader (StoryRepository id "story-nuh-ark").
    this.printables.set("printable-nuh-ark-sequencing", {
      id: "printable-nuh-ark-sequencing",
      titleAr: "بطاقات ترتيب أحداث قصة سيدنا نوح عليه السلام وإعادة السرد",
      titleEn: "Prophet Nuh's Ark Story-Sequencing & Retelling Cards",
      category: "PROPHETIC_COMICS",
      categoryNameAr: "قصص الأنبياء الورقية",
      targetAgeGroup: "AGE_7_10",
      pageCount: 2,
      paperFormat: "A4_LANDSCAPE",
      thumbnailEmoji: "📖",
      descriptionAr: "بطاقات قص ولصق لترتيب أحداث القصة زمنياً، تشجع الطفل على إعادة سرد القصة بكلماته بعد سماع الرواية الرقمية.",
      descriptionEn: "Cut-and-order story cards for sequencing the Ark narrative, encouraging the child to retell it in their own words after listening to the digital narration.",
      qrCodeDestinationUrl: "/student/stories/story-nuh-ark",
      qrCodeLabelAr: "امسح الرمز للاستماع إلى القصة كاملة بصوت الراوي",
      items: [
        {
          titleAr: "ترتيب الأحداث: من بداية القصة إلى نهايتها",
          guideTextAr: "اقصص البطاقات الأربع وأعد ترتيبها بالتسلسل الصحيح ثم الصقها في الصفحة.",
          guideTextEn: "Cut out the four cards and reorder them into the correct sequence, then glue them onto the page.",
          practiceLinesCount: 2,
          sampleCharacters: ["السَّفِينَةُ 🚢", "الطُّوفَانُ 🌊", "الحَيَوَانَاتُ 🐘", "الأَمَانُ 🌈"],
          illustrationEmoji: "🔢",
        },
      ],
    });

    // 8. Vocabulary Flashcards (real, matching the category name and the
    // Phonics Arcade's word-building content -- قَلَم / شَمْس / نَجْم /
    // كِتَاب -- so the QR destination genuinely reinforces the same words
    // printed on the card, not a generic unrelated page).
    this.printables.set("printable-everyday-vocabulary-flashcards", {
      id: "printable-everyday-vocabulary-flashcards",
      titleAr: "بطاقات مفردات يومية مصورة (الشمس، القلم، النجم، الكتاب)",
      titleEn: "Everyday Illustrated Vocabulary Flashcards",
      category: "VOCABULARY_FLASHCARDS",
      categoryNameAr: "ملصقات وبطاقات تعليمية",
      targetAgeGroup: "AGE_4_6",
      pageCount: 2,
      paperFormat: "A4_LANDSCAPE",
      thumbnailEmoji: "🗂️",
      descriptionAr: "بطاقات مفردات مصورة لكلمات يومية شائعة، للقص واللعب بها كبطاقات ذاكرة أو تعليقها على الثلاجة.",
      descriptionEn: "Illustrated flashcards for common everyday words, ready to cut out and use as a memory-match game or stick on the fridge.",
      qrCodeDestinationUrl: "/student/activities",
      qrCodeLabelAr: "امسح الرمز لسماع نطق كل كلمة واللعب في ورشة الأصوات",
      items: [
        {
          titleAr: "بطاقات الأدوات والطبيعة",
          guideTextAr: "لون كل بطاقة ثم اقصها بمساعدة أحد الوالدين واستخدمها في لعبة الذاكرة.",
          guideTextEn: "Color each card, cut it out with a parent's help, and use it for a memory-matching game.",
          practiceLinesCount: 4,
          sampleCharacters: ["قَلَمٌ ✏️", "شَمْسٌ ☀️", "نَجْمٌ ⭐", "كِتَابٌ 📗"],
          illustrationEmoji: "🗂️",
        },
      ],
    });
  }

  async getAllPrintables(): Promise<PrintablePacket[]> {
    return Array.from(this.printables.values());
  }

  async getPrintablesByCategory(category: PrintableCategory): Promise<PrintablePacket[]> {
    return Array.from(this.printables.values()).filter((p) => p.category === category);
  }

  async getPrintableById(id: string): Promise<PrintablePacket | null> {
    return this.printables.get(id) || null;
  }
}

export const printablesRepository = new InMemoryPrintablesRepository();
