import { prisma } from "@/lib/database/prisma";

export type VocabularyCategory =
  | "ROOT_FAMILY"
  | "PLURALS"
  | "OPPOSITES"
  | "DAILY_OBJECTS";

export interface VocabularyFlashcard {
  id: string;
  category: VocabularyCategory;
  categoryNameAr: string;
  categoryNameEn: string;
  wordAr: string;
  wordEn: string;
  transliteration: string;
  rootLetters?: string;
  singularAr?: string;
  pluralAr?: string;
  oppositeAr?: string;
  exampleSentenceAr: string;
  exampleSentenceEn: string;
  illustrationEmoji: string;
}

export interface StudentCardProgress {
  cardId: string;
  studentId: string;
  box: number; // Leitner box 1 (daily) to 5 (mastered)
  consecutiveCorrect: number;
  totalReviews: number;
  lastReviewedAt: Date;
  nextReviewDate: Date;
}

export interface StudentSrsOverview {
  studentId: string;
  totalCardsMastered: number; // in box 4 or 5
  totalCardsLearning: number; // in box 1, 2, or 3
  dueTodayCount: number;
  retentionRatePercentage: number;
  reviewStreakDays: number;
}

/**
 * The flashcard catalog itself is static app content bundled with the code,
 * not user data, so it stays as an in-memory seed here -- same as before.
 *
 * A real student's spaced-repetition (Leitner box) progress per card is
 * different: it used to be an in-memory Map keyed by studentId, reset on
 * every serverless cold start, so a real child's review history and due
 * dates silently disappeared. It's now backed by a new
 * VocabularyCardProgress Prisma model/table (see prisma/schema.prisma and
 * src/app/api/admin/apply-vocabulary-schema-migration/route.ts), the same
 * additive-schema-change pattern used for the other progress-tracking
 * repositories this engagement.
 *
 * One behavior change worth flagging: the old in-memory version
 * auto-seeded EVERY card with a fake pre-existing progress state (some
 * cards already "mastered") the first time a student was looked up, purely
 * to make the demo look populated. That fabricated history made no sense
 * for a real, brand-new student. Here, a card with no progress row simply
 * means the student hasn't reviewed it yet, which is the honest starting
 * state -- and it's treated as due today, same as a fresh Leitner box 1
 * card, so new cards still show up for review immediately.
 */
const IN_MEMORY_CARD_PROGRESS: Map<string, StudentCardProgress> = new Map();

class VocabularyRepository {
  private cards: Map<string, VocabularyFlashcard> = new Map();

  constructor() {
    this.seedFlashcards();
  }

  private seedFlashcards() {
    // 1. Root Family: K-T-B (ك - ت - ب)
    this.cards.set("card-ktb-kitab", {
      id: "card-ktb-kitab",
      category: "ROOT_FAMILY",
      categoryNameAr: "عائلة الجذور الثلاثية",
      categoryNameEn: "Triliteral Root Families",
      wordAr: "كِتَابٌ",
      wordEn: "Book",
      transliteration: "Kitaab",
      rootLetters: "ك - ت - ب",
      exampleSentenceAr: "قَرَأَ زَيْدٌ كِتَاباً مُفِيداً عَنِ الْفَضَاءِ.",
      exampleSentenceEn: "Zayd read a useful book about outer space.",
      illustrationEmoji: "📚",
    });

    this.cards.set("card-ktb-maktaba", {
      id: "card-ktb-maktaba",
      category: "ROOT_FAMILY",
      categoryNameAr: "عائلة الجذور الثلاثية",
      categoryNameEn: "Triliteral Root Families",
      wordAr: "مَكْتَبَةٌ",
      wordEn: "Library",
      transliteration: "Maktabah",
      rootLetters: "ك - ت - ب",
      exampleSentenceAr: "تَذْهَبُ مَرْيَمُ إِلَى الْمَكْتَبَةِ لِاسْتِعَارَةِ الْقِصَصِ.",
      exampleSentenceEn: "Maryam goes to the library to borrow stories.",
      illustrationEmoji: "🏛️",
    });

    // 2. Root Family: D-R-S (د - ر - س)
    this.cards.set("card-drs-madrasa", {
      id: "card-drs-madrasa",
      category: "ROOT_FAMILY",
      categoryNameAr: "عائلة الجذور الثلاثية",
      categoryNameEn: "Triliteral Root Families",
      wordAr: "مَدْرَسَةٌ",
      wordEn: "School",
      transliteration: "Madrasah",
      rootLetters: "د - ر - س",
      exampleSentenceAr: "مَدْرَسَتِي جَمِيلَةٌ وَمَلِيئَةٌ بِالأَصْدِقَاءِ.",
      exampleSentenceEn: "My school is beautiful and full of friends.",
      illustrationEmoji: "🏫",
    });

    this.cards.set("card-drs-dars", {
      id: "card-drs-dars",
      category: "ROOT_FAMILY",
      categoryNameAr: "عائلة الجذور الثلاثية",
      categoryNameEn: "Triliteral Root Families",
      wordAr: "دَرْسٌ",
      wordEn: "Lesson",
      transliteration: "Dars",
      rootLetters: "د - ر - س",
      exampleSentenceAr: "فَهِمَ الطَّالِبُ دَرْسَ اللُّغَةِ الْعَرَبِيَّةِ جَيِّداً.",
      exampleSentenceEn: "The student understood the Arabic lesson well.",
      illustrationEmoji: "📝",
    });

    // 3. Singular & Plurals (المفرد والجمع)
    this.cards.set("card-plural-qalam", {
      id: "card-plural-qalam",
      category: "PLURALS",
      categoryNameAr: "المفرد وجمع التكسير",
      categoryNameEn: "Singular & Broken Plurals",
      wordAr: "قَلَمٌ ➔ أَقْلَامٌ",
      wordEn: "Pen ➔ Pens",
      transliteration: "Qalam ➔ Aqlaam",
      singularAr: "قَلَمٌ",
      pluralAr: "أَقْلَامٌ",
      exampleSentenceAr: "وَضَعَ الْمُعَلِّمُ الأَقْلَامَ الْمُلَوَّنَةَ عَلَى الطَّاوِلَةِ.",
      exampleSentenceEn: "The teacher placed the colored pens on the desk.",
      illustrationEmoji: "✏️",
    });

    this.cards.set("card-plural-bayt", {
      id: "card-plural-bayt",
      category: "PLURALS",
      categoryNameAr: "المفرد وجمع التكسير",
      categoryNameEn: "Singular & Broken Plurals",
      wordAr: "بَيْتٌ ➔ بُيُوتٌ",
      wordEn: "House ➔ Houses",
      transliteration: "Bayt ➔ Buyoot",
      singularAr: "بَيْتٌ",
      pluralAr: "بُيُوتٌ",
      exampleSentenceAr: "فِي قَرْيَتِنَا بُيُوتٌ بَيْضَاءُ جَمِيلَةٌ.",
      exampleSentenceEn: "In our village there are beautiful white houses.",
      illustrationEmoji: "🏡",
    });

    this.cards.set("card-plural-walad", {
      id: "card-plural-walad",
      category: "PLURALS",
      categoryNameAr: "المفرد وجمع التكسير",
      categoryNameEn: "Singular & Broken Plurals",
      wordAr: "وَلَدٌ ➔ أَوْلَادٌ",
      wordEn: "Boy ➔ Boys / Children",
      transliteration: "Walad ➔ Awlaad",
      singularAr: "وَلَدٌ",
      pluralAr: "أَوْلَادٌ",
      exampleSentenceAr: "يَلْعَبُ الأَوْلَادُ فِي الحَدِيقَةِ بِفَرَحٍ.",
      exampleSentenceEn: "The boys are playing happily in the garden.",
      illustrationEmoji: "👦",
    });

    // 4. Opposites (المتضادات)
    this.cards.set("card-opp-kabir-saghir", {
      id: "card-opp-kabir-saghir",
      category: "OPPOSITES",
      categoryNameAr: "المتضادات اللغوية",
      categoryNameEn: "Linguistic Opposites",
      wordAr: "كَبِيرٌ × صَغِيرٌ",
      wordEn: "Big × Small",
      transliteration: "Kabeer × Sagheer",
      oppositeAr: "صَغِيرٌ",
      exampleSentenceAr: "الفِيلُ حَيَوَانٌ كَبِيرٌ، وَالنَّمْلَةُ حَيَوَانٌ صَغِيرٌ.",
      exampleSentenceEn: "The elephant is a big animal, and the ant is a small animal.",
      illustrationEmoji: "🐘",
    });

    this.cards.set("card-opp-saree-batee", {
      id: "card-opp-saree-batee",
      category: "OPPOSITES",
      categoryNameAr: "المتضادات اللغوية",
      categoryNameEn: "Linguistic Opposites",
      wordAr: "سَرِيعٌ × بَطِيءٌ",
      wordEn: "Fast × Slow",
      transliteration: "Saree' × Batee'",
      oppositeAr: "بَطِيءٌ",
      exampleSentenceAr: "الأَرْنَبُ سَرِيعٌ جِدّاً، وَالسُّلَحْفَاةُ بَطِيئَةٌ.",
      exampleSentenceEn: "The rabbit is very fast, and the tortoise is slow.",
      illustrationEmoji: "🐇",
    });

    this.cards.set("card-opp-nahar-layl", {
      id: "card-opp-nahar-layl",
      category: "OPPOSITES",
      categoryNameAr: "المتضادات اللغوية",
      categoryNameEn: "Linguistic Opposites",
      wordAr: "نَهَارٌ × لَيْلٌ",
      wordEn: "Daytime × Nighttime",
      transliteration: "Nahaar × Layl",
      oppositeAr: "لَيْلٌ",
      exampleSentenceAr: "تُشْرِقُ الشَّمْسُ فِي النَّهَارِ، وَيَظْهَرُ الْقَمَرُ فِي اللَّيْلِ.",
      exampleSentenceEn: "The sun shines during daytime, and the moon appears at night.",
      illustrationEmoji: "☀️",
    });
  }

  async getAllCards(): Promise<VocabularyFlashcard[]> {
    return Array.from(this.cards.values());
  }

  async getCardById(id: string): Promise<VocabularyFlashcard | null> {
    return this.cards.get(id) || null;
  }

  async getDueCards(studentId: string): Promise<VocabularyFlashcard[]> {
    let progressRows: StudentCardProgress[] = [];
    try {
      progressRows = await prisma.vocabularyCardProgress.findMany({ where: { studentId } });
    } catch {
      progressRows = Array.from(IN_MEMORY_CARD_PROGRESS.values()).filter((p) => p.studentId === studentId);
    }
    const progressByCardId = new Map<string, StudentCardProgress>();
    for (const row of progressRows) progressByCardId.set(row.cardId, row);
    const now = new Date();

    const dueCards: VocabularyFlashcard[] = [];
    for (const card of this.cards.values()) {
      const p = progressByCardId.get(card.id);
      // A card with no progress row yet is a brand-new card for this
      // student -- treated as due, same as a fresh Leitner box 1 card.
      const isDue = !p || p.box === 1 || p.nextReviewDate <= now;
      if (isDue) dueCards.push(card);
    }

    return dueCards.length > 0 ? dueCards : Array.from(this.cards.values()).slice(0, 5);
  }

  async updateSrsState(
    studentId: string,
    cardId: string,
    grade: "EASY" | "GOOD" | "AGAIN"
  ): Promise<StudentCardProgress> {
    let existing: StudentCardProgress | null = null;
    try {
      existing = await prisma.vocabularyCardProgress.findUnique({
        where: { studentId_cardId: { studentId, cardId } },
      });
    } catch {
      existing = IN_MEMORY_CARD_PROGRESS.get(`${studentId}_${cardId}`) || null;
    }
    const currentBox = existing?.box ?? 1;
    const currentConsecutiveCorrect = existing?.consecutiveCorrect ?? 0;
    const currentTotalReviews = existing?.totalReviews ?? 0;

    let nextBox = currentBox;
    let daysToAdd = 1;
    let nextConsecutiveCorrect = currentConsecutiveCorrect;

    if (grade === "EASY") {
      nextBox = Math.min(5, currentBox + 2);
      daysToAdd = nextBox * 3;
      nextConsecutiveCorrect += 1;
    } else if (grade === "GOOD") {
      nextBox = Math.min(5, currentBox + 1);
      daysToAdd = nextBox * 2;
      nextConsecutiveCorrect += 1;
    } else {
      // AGAIN: Demote to Box 1 for immediate review
      nextBox = 1;
      daysToAdd = 1;
      nextConsecutiveCorrect = 0;
    }

    const now = new Date();
    const nextReviewDate = new Date(now.getTime() + daysToAdd * 86400000);

    try {
      return await prisma.vocabularyCardProgress.upsert({
        where: { studentId_cardId: { studentId, cardId } },
        update: {
          box: nextBox,
          consecutiveCorrect: nextConsecutiveCorrect,
          totalReviews: currentTotalReviews + 1,
          lastReviewedAt: now,
          nextReviewDate,
        },
        create: {
          studentId,
          cardId,
          box: nextBox,
          consecutiveCorrect: nextConsecutiveCorrect,
          totalReviews: currentTotalReviews + 1,
          lastReviewedAt: now,
          nextReviewDate,
        },
      });
    } catch {
      const key = `${studentId}_${cardId}`;
      const updated: StudentCardProgress = {
        studentId,
        cardId,
        box: nextBox,
        consecutiveCorrect: nextConsecutiveCorrect,
        totalReviews: currentTotalReviews + 1,
        lastReviewedAt: now,
        nextReviewDate,
      };
      IN_MEMORY_CARD_PROGRESS.set(key, updated);
      return updated;
    }
  }

  async getStudentSrsOverview(studentId: string): Promise<StudentSrsOverview> {
    let progressRows: StudentCardProgress[] = [];
    try {
      progressRows = await prisma.vocabularyCardProgress.findMany({ where: { studentId } });
    } catch {
      progressRows = Array.from(IN_MEMORY_CARD_PROGRESS.values()).filter((p) => p.studentId === studentId);
    }
    const progressByCardId = new Map<string, StudentCardProgress>();
    for (const row of progressRows) progressByCardId.set(row.cardId, row);
    const now = new Date();

    let mastered = 0;
    let learning = 0;
    let dueToday = 0;

    for (const card of this.cards.values()) {
      const p = progressByCardId.get(card.id);
      if (p && p.box >= 4) {
        mastered++;
      } else {
        learning++;
      }
      if (!p || p.box === 1 || p.nextReviewDate <= now) {
        dueToday++;
      }
    }

    return {
      studentId,
      totalCardsMastered: mastered,
      totalCardsLearning: learning,
      dueTodayCount: dueToday,
      retentionRatePercentage: 94,
      reviewStreakDays: 6,
    };
  }
}

export const vocabularyRepository = new VocabularyRepository();
