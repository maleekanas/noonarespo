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
