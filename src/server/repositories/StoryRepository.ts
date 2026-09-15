import { prisma } from "@/lib/database/prisma";

export type StoryCategory = "PROPHETIC_STORIES" | "ISLAMIC_VALUES" | "LANGUAGE_ADVENTURE";

export interface StoryPage {
  pageNumber: number;
  textAr: string;
  textEn: string;
  illustrationEmoji: string;
  audioTimestampSeconds: number;
}

export interface StoryQuizQuestion {
  id: string;
  questionAr: string;
  optionsAr: string[];
  correctOptionIndex: number;
  moralLessonAr: string;
}

export interface StoryBook {
  id: string;
  titleAr: string;
  titleEn: string;
  category: StoryCategory;
  categoryTitleAr: string;
  ageGroup: "AGE_4_6" | "AGE_7_10" | "AGE_11_13" | "AGE_14_16";
  coverEmoji: string;
  readingDurationMinutes: number;
  pagesCount: number;
  audioNarrationUrl: string;
  xpReward: number;
  pages: StoryPage[];
  quizQuestions: StoryQuizQuestion[];
}

export interface StoryProgress {
  studentId: string;
  storyId: string;
  isCompleted: boolean;
  quizScorePercentage: number;
  completedAt?: Date;
}

/**
 * The story catalog itself (StoryBook: pages, quiz questions) is static app
 * content bundled with the code, not user data, so it stays as an in-memory
 * seed here rather than a database table -- same as before.
 *
 * StoryProgress (a real student's completion/quiz score per story) is a
 * different matter: it used to be an in-memory Map that reset on every
 * serverless cold start, so a real child's story-reading progress and XP
 * eligibility silently disappeared. It's now backed by a new StoryProgress
 * Prisma model/table (see prisma/schema.prisma and
 * src/app/api/admin/apply-story-progress-schema-migration/route.ts), the
 * same additive-schema-change pattern used for Gradebook and the earlier
 * Stripe billing columns.
 */
class StoryRepository {
  private stories: Map<string, StoryBook> = new Map();

  constructor() {
    this.seedStories();
  }

  private seedStories() {
    // 1. Prophet Nuh's Ark
    this.stories.set("story-nuh-ark", {
      id: "story-nuh-ark",
      titleAr: "سَفِينَةُ نُوحٍ عَلَيْهِ السَّلَامُ وَالْحَيَوَانَاتُ",
      titleEn: "Prophet Nuh's Ark and the Animals",
      category: "PROPHETIC_STORIES",
      categoryTitleAr: "قصص الأنبياء والقرآن",
      ageGroup: "AGE_7_10",
      coverEmoji: "🚢",
      readingDurationMinutes: 6,
      pagesCount: 4,
      audioNarrationUrl: "/audio/stories/nuh-ark.mp3",
      xpReward: 35,
      pages: [
        {
          pageNumber: 1,
          textAr: "أَمَرَ اللَّهُ تَعَالَى نَبِيَّهُ نُوحاً عَلَيْهِ السَّلَامُ أَنْ يَبْنِيَ سَفِينَةً ضَخْمَةً فِي الصَّحْرَاءِ الْوَاسِعَةِ.",
          textEn: "Allah Almighty commanded His Prophet Nuh (peace be upon him) to build a massive ark in the vast desert.",
          illustrationEmoji: "🪵",
          audioTimestampSeconds: 0,
        },
        {
          pageNumber: 2,
          textAr: "عَمِلَ نُوحٌ وَالْمُؤْمِنُونَ بِجِدٍّ وَصَبْرٍ، يَجْمَعُونَ الْخَشَبَ وَيَصْنَعُونَ السَّفِينَةَ بِإِتْقَانٍ وَإِيمَانٍ.",
          textEn: "Nuh and the believers worked diligently with patience, gathering wood and crafting the ship with devotion.",
          illustrationEmoji: "🔨",
          audioTimestampSeconds: 15,
        },
        {
          pageNumber: 3,
          textAr: "وَعِنْدَمَا جَاءَ أَمْرُ اللَّهِ، حَمَلَ نُوحٌ فِي السَّفِينَةِ مِنْ كُلِّ زَوْجَيْنِ اثْنَيْنِ: الأَسَدَ وَاللَّبُؤَةَ، وَالْحَمَامَةَ وَالأَرْنَبَ.",
          textEn: "When the command of Allah arrived, Nuh brought aboard a pair of every animal: the lion, dove, and rabbit.",
          illustrationEmoji: "🦁",
          audioTimestampSeconds: 30,
        },
        {
          pageNumber: 4,
          textAr: "فَتَحَ اللَّهُ أَبْوَابَ السَّمَاءِ بِمَاءٍ مُنْهَمِرٍ، وَسَارَتِ السَّفِينَةُ بِأَمَانٍ بِرِعَايَةِ اللَّهِ وَحِفْظِهِ.",
          textEn: "Allah opened the gates of heaven with torrential rain, and the ark sailed peacefully under Allah's care.",
          illustrationEmoji: "🌊",
          audioTimestampSeconds: 45,
        },
      ],
      quizQuestions: [
        {
          id: "q1",
          questionAr: "مَاذَا أَمَرَ اللَّهُ تَعَالَى نَبِيَّهُ نُوحاً أَنْ يَبْنِيَ؟",
          optionsAr: ["قَصْراً كَبِيراً", "سَفِينَةً ضَخْمَةً", "سُوراً عَالِياً"],
          correctOptionIndex: 1,
          moralLessonAr: "طاعة أوامر الله واليقين بنصره.",
        },
        {
          id: "q2",
          questionAr: "مَنْ رَكِبَ مَعَ نُوحٍ عَلَيْهِ السَّلَامُ فِي السَّفِينَةِ؟",
          optionsAr: ["الْمُؤْمِنُونَ وَمِنْ كُلِّ زَوْجَيْنِ اثْنَيْنِ", "التُّجَّارُ فَقَطْ", "الْحَيَوَانَاتُ الْمُفْتَرِسَةُ فَقَطْ"],
          correctOptionIndex: 0,
          moralLessonAr: "الرحمة بجميع المخلوقات ورعاية الكائنات الحية.",
        },
      ],
    });

    // 2. The Little Ant and the Grain
    this.stories.set("story-ant-grain", {
      id: "story-ant-grain",
      titleAr: "النَّمْلَةُ الصَّغِيرَةُ وَحَبَّةُ الْقَمْحِ الْمُبَارَكَةُ",
      titleEn: "The Little Ant and the Blessed Grain",
      category: "ISLAMIC_VALUES",
      categoryTitleAr: "القيم والأخلاق الإسلامية",
      ageGroup: "AGE_4_6",
      coverEmoji: "🐜",
      readingDurationMinutes: 4,
      pagesCount: 4,
      audioNarrationUrl: "/audio/stories/ant-grain.mp3",
      xpReward: 35,
      pages: [
        {
          pageNumber: 1,
          textAr: "كَانَتِ النَّمْلَةُ الصَّغِيرَةُ 'نَمُولَة' تَسِيرُ فِي الْحَدِيقَةِ الْخَضْرَاءِ تَبْحَثُ عَنْ رِزْقٍ حَلَالٍ.",
          textEn: "The little ant 'Namoola' was walking in the green garden seeking wholesome sustenance.",
          illustrationEmoji: "🌿",
          audioTimestampSeconds: 0,
        },
        {
          pageNumber: 2,
          textAr: "وَجَدَتْ حَبَّةَ قَمْحٍ ذَهَبِيَّةً ثَقِيلَةً جِدّاً، حَاوَلَتْ حَمْلَهَا مَرَّةً وَمَرَّتَيْنِ وَسَقَطَتْ مِنْهَا.",
          textEn: "She found a golden wheat grain that was very heavy; she tried lifting it once and twice, but it dropped.",
          illustrationEmoji: "🌾",
          audioTimestampSeconds: 12,
        },
        {
          pageNumber: 3,
          textAr: "لَمْ تَيْأَسْ نَمُولَةُ، بَلْ قَالَتْ: 'بِسْمِ اللَّهِ'، وَنَادَتْ صَدِيقَاتِهَا لِيَتَعَاوَنَّ مَعَهَا فِي حَمْلِهَا.",
          textEn: "She did not give up, but said 'Bismillah' and called her friends to cooperate together in carrying it.",
          illustrationEmoji: "🤝",
          audioTimestampSeconds: 24,
        },
        {
          pageNumber: 4,
          textAr: "بِالتَّعَاوُنِ وَالإِصْرَارِ، أَدْخَلْنَ الْحَبَّةَ إِلَى بَيْتِهِنَّ وَحَمِدْنَ اللَّهَ عَلَى رِزْقِهِ وَفَضْلِهِ.",
          textEn: "Through cooperation and persistence, they brought the grain home and praised Allah for His blessings.",
          illustrationEmoji: "✨",
          audioTimestampSeconds: 36,
        },
      ],
      quizQuestions: [
        {
          id: "q1",
          questionAr: "مَاذَا قَالَتْ نَمُولَةُ عِنْدَمَا عَزَمَتْ عَلَى حَمْلِ الْحَبَّةِ؟",
          optionsAr: ["بِسْمِ اللَّهِ", "لا أَسْتَطِيعُ", "سَأَتْرُكُهَا"],
          correctOptionIndex: 0,
          moralLessonAr: "البدء باسم الله في كل عمل صالح.",
        },
        {
          id: "q2",
          questionAr: "كَيْفَ اسْتَطَاعَتِ النَّمْلَةُ نَقْلَ الْحَبَّةِ الثَّقِيلَةِ؟",
          optionsAr: ["بِالتَّعَاوُنِ مَعَ صَدِيقَاتِهَا", "بِمُفْرَدِهَا فَقَطْ", "انْتَظَرَتِ الرِّيَاحَ"],
          correctOptionIndex: 0,
          moralLessonAr: "قيمة التعاون والمثابرة وعدم الاستسلام.",
        },
      ],
    });

    // 3. Oasis of Words
    this.stories.set("story-oasis-words", {
      id: "story-oasis-words",
      titleAr: "مُغَامَرَةٌ فِي وَاحَةِ الْكَلِمَاتِ الْعَجِيبَةِ",
      titleEn: "Adventure in the Oasis of Wondrous Words",
      category: "LANGUAGE_ADVENTURE",
      categoryTitleAr: "مغامرات اللغة والطلاقة",
      ageGroup: "AGE_7_10",
      coverEmoji: "🌴",
      readingDurationMinutes: 5,
      pagesCount: 4,
      audioNarrationUrl: "/audio/stories/oasis-words.mp3",
      xpReward: 35,
      pages: [
        {
          pageNumber: 1,
          textAr: "سَافَرَ سَالِمٌ وَسَلْمَى عَلَى ظَهْرِ بُسَاطِ الرِّيحِ إِلَى وَاحَةٍ تَطِيرُ فِيهَا الْحُرُوفُ الْمُشَكَّلَةُ.",
          textEn: "Salem and Salma traveled on a magic carpet to an oasis where vocalized letters fluttered in the air.",
          illustrationEmoji: "✨",
          audioTimestampSeconds: 0,
        },
        {
          pageNumber: 2,
          textAr: "رَأَيَا شَجَرَةَ الْحَرَكَاتِ: فَتْحَةٌ تَرْفَعُ رَأْسَهَا، وَضَمَّةٌ تَبْتَسِمُ، وَكَسْرَةٌ تَنْزِلُ لِلأَسْفَلِ بِأَدَبٍ.",
          textEn: "They saw the Tree of Vowels: Fatha raising its head, Damma smiling, and Kasra polite below.",
          illustrationEmoji: "🌳",
          audioTimestampSeconds: 15,
        },
        {
          pageNumber: 3,
          textAr: "جَمَعَ سَالِمٌ حُرُوفَ: 'قَ - لَ - مٌ'، فَتَحَوَّلَتْ فِي يَدِهِ إِلَى قَلَمٍ ذَهَبِيٍّ يَكْتُبُ النُّورَ.",
          textEn: "Salem assembled the letters Q-L-M, and it transformed into a golden pen writing light.",
          illustrationEmoji: "🖊️",
          audioTimestampSeconds: 30,
        },
        {
          pageNumber: 4,
          textAr: "فَرِحَ الأَطْفَالُ وَتَعَلَّمُوا أَنَّ الْقِرَاءَةَ تُنِيرُ الْعُقُولَ وَتَفْتَحُ أَبْوَابَ الْعِلْمِ وَالْحِكْمَةِ.",
          textEn: "The children rejoiced and learned that reading illuminates minds and opens doors to knowledge.",
          illustrationEmoji: "📖",
          audioTimestampSeconds: 45,
        },
      ],
      quizQuestions: [
        {
          id: "q1",
          questionAr: "إِلَى أَيْنَ سَافَرَ سَالِمٌ وَسَلْمَى؟",
          optionsAr: ["إِلَى وَاحَةِ الْكَلِمَاتِ الْعَجِيبَةِ", "إِلَى مَدِينَةِ الأَلْعَابِ", "إِلَى شَاطِئِ الْبَحْرِ"],
          correctOptionIndex: 0,
          moralLessonAr: "حب القراءة واللغة العربية مفتاح المعرفة.",
        },
      ],
    });
  }

  async getAllStories(): Promise<StoryBook[]> {
    return Array.from(this.stories.values());
  }

  async getStoryById(id: string): Promise<StoryBook | null> {
    return this.stories.get(id) || null;
  }

  async getStoriesByCategory(category: StoryCategory): Promise<StoryBook[]> {
    return Array.from(this.stories.values()).filter((s) => s.category === category);
  }

  async saveProgress(progress: StoryProgress): Promise<void> {
    await prisma.storyProgress.upsert({
      where: { studentId_storyId: { studentId: progress.studentId, storyId: progress.storyId } },
      update: {
        isCompleted: progress.isCompleted,
        quizScorePercentage: progress.quizScorePercentage,
        completedAt: progress.completedAt,
      },
      create: {
        studentId: progress.studentId,
        storyId: progress.storyId,
        isCompleted: progress.isCompleted,
        quizScorePercentage: progress.quizScorePercentage,
        completedAt: progress.completedAt,
      },
    });
  }

  async getProgress(studentId: string, storyId: string): Promise<StoryProgress | null> {
    const row = await prisma.storyProgress.findUnique({
      where: { studentId_storyId: { studentId, storyId } },
    });
    if (!row) return null;
    return {
      studentId: row.studentId,
      storyId: row.storyId,
      isCompleted: row.isCompleted,
      quizScorePercentage: row.quizScorePercentage,
      completedAt: row.completedAt ?? undefined,
    };
  }
}

export const storyRepository = new StoryRepository();
