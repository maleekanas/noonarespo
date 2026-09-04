export type TajweedRuleType = "QALQALAH" | "IDGHAM" | "IKHFA" | "MADD";

export interface TajweedAnnotation {
  textSnippet: string;
  ruleType: TajweedRuleType;
  ruleTitleAr: string;
  ruleTitleEn: string;
  colorHex: string;
}

export interface QuranVerse {
  ayahNumber: number;
  textUthmani: string;
  translationEn: string;
  audioSimulatedUrl: string;
  tajweedAnnotations: TajweedAnnotation[];
}

export interface QuranSurah {
  id: string;
  number: number;
  nameAr: string;
  nameEn: string;
  revelationType: "MECCAN" | "MEDINAN";
  versesCount: number;
  verses: QuranVerse[];
}

export interface RecitationSubmission {
  id: string;
  studentId: string;
  surahId: string;
  audioUrl: string;
  recordedDurationSeconds: number;
  scoreMakharij: number; // 0-100
  scoreTajweed: number; // 0-100
  scoreHifz: number; // 0-100
  overallScore: number;
  teacherFeedbackAr?: string;
  xpAwarded: number;
  submittedAt: Date;
}

class InMemoryQuranRepository {
  private surahs: Map<string, QuranSurah> = new Map();
  private submissions: Map<string, RecitationSubmission> = new Map();

  constructor() {
    this.seedSurahs();
    this.seedSubmissions();
  }

  private seedSurahs() {
    // 1. Al-Fatiha
    this.surahs.set("surah-1", {
      id: "surah-1",
      number: 1,
      nameAr: "سُورَةُ الْفَاتِحَةِ",
      nameEn: "Al-Fatihah (The Opening)",
      revelationType: "MECCAN",
      versesCount: 7,
      verses: [
        {
          ayahNumber: 1,
          textUthmani: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          translationEn: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          audioSimulatedUrl: "/audio/quran/001001.mp3",
          tajweedAnnotations: [
            {
              textSnippet: "الرَّحِيمِ",
              ruleType: "MADD",
              ruleTitleAr: "مد عارض للسكون (2-4-6 حركات)",
              ruleTitleEn: "Madd Arid li-s-Sukoon",
              colorHex: "#9333EA", // Purple
            },
          ],
        },
        {
          ayahNumber: 2,
          textUthmani: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
          translationEn: "[All] praise is [due] to Allah, Lord of the worlds -",
          audioSimulatedUrl: "/audio/quran/001002.mp3",
          tajweedAnnotations: [
            {
              textSnippet: "الْعَالَمِينَ",
              ruleType: "MADD",
              ruleTitleAr: "مد عارض للسكون",
              ruleTitleEn: "Madd Arid li-s-Sukoon",
              colorHex: "#9333EA",
            },
          ],
        },
        {
          ayahNumber: 7,
          textUthmani: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          translationEn: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
          audioSimulatedUrl: "/audio/quran/001007.mp3",
          tajweedAnnotations: [
            {
              textSnippet: "أَنْعَمْتَ",
              ruleType: "IKHFA",
              ruleTitleAr: "إظهار حلقي (النون الساكنة بعدها عين)",
              ruleTitleEn: "Izhhar Halqi (Clear Noon)",
              colorHex: "#059669", // Green
            },
            {
              textSnippet: "الضَّالِّينَ",
              ruleType: "MADD",
              ruleTitleAr: "مد لازم كَلِمي مُثَقَّل (6 حركات لزوماً)",
              ruleTitleEn: "Madd Lazim Kalimi Muthaqqal (6 counts)",
              colorHex: "#9333EA",
            },
          ],
        },
      ],
    });

    // 2. Al-Ikhlas
    this.surahs.set("surah-112", {
      id: "surah-112",
      number: 112,
      nameAr: "سُورَةُ الإِخْلَاصِ",
      nameEn: "Al-Ikhlas (Sincerity)",
      revelationType: "MECCAN",
      versesCount: 4,
      verses: [
        {
          ayahNumber: 1,
          textUthmani: "قُلْ هُوَ اللَّهُ أَحَدٌ",
          translationEn: "Say, 'He is Allah, [who is] One,'",
          audioSimulatedUrl: "/audio/quran/112001.mp3",
          tajweedAnnotations: [
            {
              textSnippet: "أَحَدٌ [دْ]",
              ruleType: "QALQALAH",
              ruleTitleAr: "قلقلة كبرى عند الوقف (حرف الدال)",
              ruleTitleEn: "Qalqalah Kubra on Dal",
              colorHex: "#DC2626", // Red
            },
          ],
        },
        {
          ayahNumber: 2,
          textUthmani: "اللَّهُ الصَّمَدُ",
          translationEn: "Allah, the Eternal Refuge.",
          audioSimulatedUrl: "/audio/quran/112002.mp3",
          tajweedAnnotations: [
            {
              textSnippet: "الصَّمَدُ [دْ]",
              ruleType: "QALQALAH",
              ruleTitleAr: "قلقلة كبرى عند الوقف (حرف الدال)",
              ruleTitleEn: "Qalqalah Kubra on Dal",
              colorHex: "#DC2626",
            },
          ],
        },
        {
          ayahNumber: 3,
          textUthmani: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
          translationEn: "He neither begets nor is born,",
          audioSimulatedUrl: "/audio/quran/112003.mp3",
          tajweedAnnotations: [
            {
              textSnippet: "يَلِدْ",
              ruleType: "QALQALAH",
              ruleTitleAr: "قلقلة صغرى في وسط الكلمة",
              ruleTitleEn: "Qalqalah Sughra",
              colorHex: "#DC2626",
            },
            {
              textSnippet: "يُولَدْ",
              ruleType: "QALQALAH",
              ruleTitleAr: "قلقلة كبرى عند الوقف",
              ruleTitleEn: "Qalqalah Kubra",
              colorHex: "#DC2626",
            },
          ],
        },
        {
          ayahNumber: 4,
          textUthmani: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
          translationEn: "Nor is there to Him any equivalent.",
          audioSimulatedUrl: "/audio/quran/112004.mp3",
          tajweedAnnotations: [
            {
              textSnippet: "يَكُن لَّهُ",
              ruleType: "IDGHAM",
              ruleTitleAr: "إدغام بغير غنة (النون في اللام)",
              ruleTitleEn: "Idgham without Ghunnah",
              colorHex: "#2563EB", // Blue
            },
            {
              textSnippet: "أَحَدٌ",
              ruleType: "QALQALAH",
              ruleTitleAr: "قلقلة كبرى عند الوقف",
              ruleTitleEn: "Qalqalah Kubra",
              colorHex: "#DC2626",
            },
          ],
        },
      ],
    });

    // 3. Al-Falaq
    this.surahs.set("surah-113", {
      id: "surah-113",
      number: 113,
      nameAr: "سُورَةُ الفَلَقِ",
      nameEn: "Al-Falaq (The Daybreak)",
      revelationType: "MECCAN",
      versesCount: 5,
      verses: [
        {
          ayahNumber: 1,
          textUthmani: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
          translationEn: "Say, 'I seek refuge in the Lord of daybreak'",
          audioSimulatedUrl: "/audio/quran/113001.mp3",
          tajweedAnnotations: [
            {
              textSnippet: "الْفَلَقِ [قْ]",
              ruleType: "QALQALAH",
              ruleTitleAr: "قلقلة كبرى عند الوقف (حرف القاف)",
              ruleTitleEn: "Qalqalah Kubra on Qaf",
              colorHex: "#DC2626",
            },
          ],
        },
        {
          ayahNumber: 2,
          textUthmani: "مِن شَرِّ مَا خَلَقَ",
          translationEn: "From the evil of that which He created",
          audioSimulatedUrl: "/audio/quran/113002.mp3",
          tajweedAnnotations: [
            {
              textSnippet: "مِن شَرِّ",
              ruleType: "IKHFA",
              ruleTitleAr: "إخفاء حقيقي بغنة (النون الساكنة قبل الشين)",
              ruleTitleEn: "Ikhfa Haqiqi with Ghunnah",
              colorHex: "#059669",
            },
          ],
        },
      ],
    });
  }

  private seedSubmissions() {
    this.submissions.set("rec-1", {
      id: "rec-1",
      studentId: "student-1", // Zayd
      surahId: "surah-112",
      audioUrl: "https://storage.kidsarabicacademy.internal/audio/submissions/zayd-ikhlas.mp3",
      recordedDurationSeconds: 24,
      scoreMakharij: 95,
      scoreTajweed: 90,
      scoreHifz: 100,
      overallScore: 95,
      teacherFeedbackAr: "ما شاء الله يا زيد، نطق ممتاز لقلقلة الدال في (أحد) و(الصمد)! بارك الله فيك.",
      xpAwarded: 25,
      submittedAt: new Date(Date.now() - 48 * 3600 * 1000),
    });
  }

  async getAllSurahs(): Promise<QuranSurah[]> {
    return Array.from(this.surahs.values()).sort((a, b) => a.number - b.number);
  }

  async getSurahById(id: string): Promise<QuranSurah | null> {
    return this.surahs.get(id) || null;
  }

  async saveSubmission(submission: Omit<RecitationSubmission, "id" | "submittedAt">): Promise<RecitationSubmission> {
    const id = "rec-" + (this.submissions.size + 1);
    const full: RecitationSubmission = {
      ...submission,
      id,
      submittedAt: new Date(),
    };
    this.submissions.set(id, full);
    return full;
  }

  async getSubmissionsByStudentId(studentId: string): Promise<RecitationSubmission[]> {
    return Array.from(this.submissions.values())
      .filter((s) => s.studentId === studentId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }
}

export const quranRepository = new InMemoryQuranRepository();
