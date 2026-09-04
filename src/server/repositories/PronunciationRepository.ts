export type MakhrajCategory = "TONGUE" | "THROAT" | "LIPS" | "NASAL";

export interface PhonemeSampleWord {
  wordAr: string;
  wordEn: string;
  transliteration: string;
  vocalization: "FATHA" | "KASRA" | "DAMMA" | "SUKOON";
}

export interface PhonemeItem {
  id: string;
  letter: string;
  letterNameAr: string;
  letterNameEn: string;
  difficulty: "EASY" | "MEDIUM" | "CHALLENGING";
  makhrajCategory: MakhrajCategory;
  makhrajAr: string;
  makhrajEn: string;
  tipsAr: string[];
  tipsEn: string[];
  sampleWords: PhonemeSampleWord[];
}

export interface MinimalPair {
  id: string;
  phonemeA: string;
  phonemeB: string;
  letterNameA: string;
  letterNameB: string;
  wordA: {
    wordAr: string;
    wordEn: string;
    transliteration: string;
  };
  wordB: {
    wordAr: string;
    wordEn: string;
    transliteration: string;
  };
  distinctionExplanationAr: string;
  distinctionExplanationEn: string;
}

export interface PronunciationAttempt {
  id: string;
  studentId: string;
  phonemeId: string;
  scorePercentage: number;
  pitchAccuracy: number;
  clarityScore: number;
  recordedAt: Date;
  feedbackAr: string;
  xpAwarded: number;
}

class InMemoryPronunciationRepository {
  private phonemes: Map<string, PhonemeItem> = new Map();
  private minimalPairs: Map<string, MinimalPair> = new Map();
  private attempts: Map<string, PronunciationAttempt[]> = new Map();

  constructor() {
    this.seedPhonemes();
    this.seedMinimalPairs();
  }

  private seedPhonemes() {
    // 1. Dhad (ض)
    this.phonemes.set("phoneme-dhad", {
      id: "phoneme-dhad",
      letter: "ض",
      letterNameAr: "ضَاد",
      letterNameEn: "Dhad",
      difficulty: "CHALLENGING",
      makhrajCategory: "TONGUE",
      makhrajAr: "إحدى حافتي اللسان أو كلتيهما مع ما يجاورها من الأضراس العليا. وهو الحرف الفريد الذي اختصت به لغة القرآن.",
      makhrajEn: "Produced from the lateral edge(s) of the tongue pressing against the upper molars. It is the signature Arabic sound.",
      tipsAr: [
        "اضغط حافة لسانك الجانبية على الأضراس العليا برفق.",
        "احذر من إخراج طرف اللسان حتى لا ينقلب إلى ظاء أو دال مفخمة.",
        "حافظ على صفة الاستطالة والرخاوة أثناء جريان الصوت.",
      ],
      tipsEn: [
        "Press the side edge of your tongue against your upper molars gently.",
        "Do not poke the tip of the tongue out, or it turns into Dha or heavy Dal.",
        "Keep the airflow smooth and continuous (Istitalah feature).",
      ],
      sampleWords: [
        { wordAr: "ضَوْءٌ", wordEn: "Light", transliteration: "Daw'", vocalization: "FATHA" },
        { wordAr: "ضِيَافَةٌ", wordEn: "Hospitality", transliteration: "Diyafah", vocalization: "KASRA" },
        { wordAr: "ضُرُوسٌ", wordEn: "Teeth/Molars", transliteration: "Duroos", vocalization: "DAMMA" },
        { wordAr: "أَضْحَى", wordEn: "Morning/Adha", transliteration: "Adha", vocalization: "SUKOON" },
      ],
    });

    // 2. Sad (ص)
    this.phonemes.set("phoneme-sad", {
      id: "phoneme-sad",
      letter: "ص",
      letterNameAr: "صَاد",
      letterNameEn: "Sad",
      difficulty: "MEDIUM",
      makhrajCategory: "TONGUE",
      makhrajAr: "طرف اللسان مع ما بين الثنايا العليا والسفلى قريباً إلى السفلى، مع إطباق واستعلاء وتفخيم.",
      makhrajEn: "Tip of the tongue positioned right behind the lower front teeth, with tongue body raised toward the roof (deep emphatic whistle).",
      tipsAr: [
        "ارفع أقصى اللسان إلى الحنك الأعلى لإنتاج التفخيم الكامل.",
        "الفرق بين الصاد والسين هو امتلاء الفم بصدى الحرف (الإطباق).",
      ],
      tipsEn: [
        "Raise the back of your tongue toward the soft palate for heavy resonance.",
        "Sad differs from Seen by having deep back tongue elevation and full mouth resonance.",
      ],
      sampleWords: [
        { wordAr: "صَبَاحٌ", wordEn: "Morning", transliteration: "Sabah", vocalization: "FATHA" },
        { wordAr: "صِيَامٌ", wordEn: "Fasting", transliteration: "Siyam", vocalization: "KASRA" },
        { wordAr: "صُنْدُوقٌ", wordEn: "Chest/Box", transliteration: "Sundooq", vocalization: "DAMMA" },
        { wordAr: "أَصْفَرُ", wordEn: "Yellow", transliteration: "Asfar", vocalization: "SUKOON" },
      ],
    });

    // 3. Ta (ط)
    this.phonemes.set("phoneme-ta", {
      id: "phoneme-ta",
      letter: "ط",
      letterNameAr: "طَاء",
      letterNameEn: "Ta",
      difficulty: "MEDIUM",
      makhrajCategory: "TONGUE",
      makhrajAr: "طرف اللسان العريض مع أصول الثنايا العليا مع إطباق وقوة انحباس صوت ونَفَس (شدة وجهر).",
      makhrajEn: "Broad tip of the tongue placed firmly against the roots of the upper front incisors with emphatic closure.",
      tipsAr: [
        "الصق طرف لسانك العريض بلثة الأسنان العليا بقوة.",
        "احرص على ألا يخرج هواء مصاحب للصوت مثل التاء (انحباس النفس).",
      ],
      tipsEn: [
        "Firmly press the upper front palate with the tongue tip.",
        "Avoid letting breath whisper out as in English 'T' or Arabic 'Taa'.",
      ],
      sampleWords: [
        { wordAr: "طَرِيقٌ", wordEn: "Path/Road", transliteration: "Tareeq", vocalization: "FATHA" },
        { wordAr: "طِفْلٌ", wordEn: "Child", transliteration: "Tifl", vocalization: "KASRA" },
        { wordAr: "طُيُورٌ", wordEn: "Birds", transliteration: "Tuyoor", vocalization: "DAMMA" },
        { wordAr: "مَطَرٌ", wordEn: "Rain", transliteration: "Matar", vocalization: "FATHA" },
      ],
    });

    // 4. Dha (ظ)
    this.phonemes.set("phoneme-dha", {
      id: "phoneme-dha",
      letter: "ظ",
      letterNameAr: "ظَاء",
      letterNameEn: "Dha",
      difficulty: "CHALLENGING",
      makhrajCategory: "TONGUE",
      makhrajAr: "طرف اللسان مع أطراف الثنايا العليا، مع التفخيم والاستعلاء والإطباق.",
      makhrajEn: "Tip of the tongue touching the edges of the upper front teeth, spoken with heavy emphatic resonance.",
      tipsAr: [
        "أخرج طرف لسانك قليلاً بين الأسنان مثل حرف الذال لكن مع تفخيم ورفع مؤخرة اللسان.",
        "لا تكتم الصوت بل دعه يجري بنعومة (رخاوة).",
      ],
      tipsEn: [
        "Place the tongue tip slightly between teeth like 'Th' in 'this', but raise the back of your mouth heavily.",
        "Allow the resonant buzz to flow smoothly.",
      ],
      sampleWords: [
        { wordAr: "ظِلٌّ", wordEn: "Shadow", transliteration: "Zhill", vocalization: "KASRA" },
        { wordAr: "ظُفْرٌ", wordEn: "Nail", transliteration: "Zhufr", vocalization: "DAMMA" },
        { wordAr: "عَظِيمٌ", wordEn: "Great/Magnificent", transliteration: "'Azheem", vocalization: "KASRA" },
        { wordAr: "نَظِيفٌ", wordEn: "Clean", transliteration: "Nazheef", vocalization: "KASRA" },
      ],
    });

    // 5. 'Ayn (ع)
    this.phonemes.set("phoneme-ayn", {
      id: "phoneme-ayn",
      letter: "ع",
      letterNameAr: "عَيْن",
      letterNameEn: "'Ayn",
      difficulty: "CHALLENGING",
      makhrajCategory: "THROAT",
      makhrajAr: "وسط الحلق (منطقة لسان المزمار)، بحبس معتدل للصوت وجريان متوسط.",
      makhrajEn: "Middle of the throat (epiglottis constriction), creating a deep, resonant pharyngeal sound.",
      tipsAr: [
        "شد عضلات وسط الحلق قليلاً إلى الخلف برفق.",
        "لا تخلط بينه وبين الهمزة؛ العين حرف متوسط ورخيم وليس وقفة انقطاعية.",
      ],
      tipsEn: [
        "Gently squeeze the muscles in the mid-throat backwards.",
        "Do not produce a glottal stop (Hamzah); 'Ayn is continuous and musical.",
      ],
      sampleWords: [
        { wordAr: "عِلْمٌ", wordEn: "Knowledge", transliteration: "'Ilm", vocalization: "KASRA" },
        { wordAr: "عَسَلٌ", wordEn: "Honey", transliteration: "'Asal", vocalization: "FATHA" },
        { wordAr: "عُصْفُورٌ", wordEn: "Sparrow", transliteration: "'Usfoor", vocalization: "DAMMA" },
        { wordAr: "شَمْعَةٌ", wordEn: "Candle", transliteration: "Sham'ah", vocalization: "SUKOON" },
      ],
    });

    // 6. Qaf (ق)
    this.phonemes.set("phoneme-qaf", {
      id: "phoneme-qaf",
      letter: "ق",
      letterNameAr: "قَاف",
      letterNameEn: "Qaf",
      difficulty: "MEDIUM",
      makhrajCategory: "TONGUE",
      makhrajAr: "أقصى اللسان مع ما يحاذيه من الحنك الأعلى الرخو واللحمي، مع قلقلة قوية عند السكون.",
      makhrajEn: "Very back of the tongue raised against the soft fleshy palate (uvula), followed by a clear release bounce when Sukoon.",
      tipsAr: [
        "ارجع بلسانك إلى أقصى نقطة للخلف واضرب سقف الحلق الرخو.",
        "احرص على ألا تنطقها مثل الكاف الأمامية؛ القاف تخرج من أعمق نقطة في الفم.",
      ],
      tipsEn: [
        "Hit the very soft back of the mouth roof with the rear base of your tongue.",
        "Avoid the front 'K' sound; Qaf is deep, commanding, and rich.",
      ],
      sampleWords: [
        { wordAr: "قَلَمٌ", wordEn: "Pen", transliteration: "Qalam", vocalization: "FATHA" },
        { wordAr: "قِطَارٌ", wordEn: "Train", transliteration: "Qitaar", vocalization: "KASRA" },
        { wordAr: "قُرْآنٌ", wordEn: "Quran", transliteration: "Qur'an", vocalization: "DAMMA" },
        { wordAr: "صِدْقٌ", wordEn: "Truthfulness", transliteration: "Sidq", vocalization: "SUKOON" },
      ],
    });
  }

  private seedMinimalPairs() {
    this.minimalPairs.set("pair-seen-sad", {
      id: "pair-seen-sad",
      phonemeA: "س",
      phonemeB: "ص",
      letterNameA: "سِين (مُرَقَّق)",
      letterNameB: "صَاد (مُفَخَّم)",
      wordA: { wordAr: "سَيْفٌ", wordEn: "Sword", transliteration: "Sayf" },
      wordB: { wordAr: "صَيْفٌ", wordEn: "Summer", transliteration: "Sayf (Heavy S)" },
      distinctionExplanationAr: "السين حرف مرقق وصافر رقيق، بينما الصاد حرف مستعلٍ ومطبق يمتلئ الفم بصدى صوته.",
      distinctionExplanationEn: "Seen is a light whistling 'S', whereas Sad raises the tongue, deepening the vowel sound completely.",
    });

    this.minimalPairs.set("pair-taa-ta", {
      id: "pair-taa-ta",
      phonemeA: "ت",
      phonemeB: "ط",
      letterNameA: "تَاء (مُرَقَّق)",
      letterNameB: "طَاء (مُفَخَّم)",
      wordA: { wordAr: "تِينٌ", wordEn: "Fig", transliteration: "Teen" },
      wordB: { wordAr: "طِينٌ", wordEn: "Clay / Mud", transliteration: "Teen (Heavy T)" },
      distinctionExplanationAr: "التاء رقيقة يخرج معها همس لطيف، بينما الطاء قوية مفخمة ممتلئة الفم وبدون همس.",
      distinctionExplanationEn: "Taa is delicate and whispered, while Ta is deep, thick, and authoritative without breathiness.",
    });

    this.minimalPairs.set("pair-dhal-dha", {
      id: "pair-dhal-dha",
      phonemeA: "ذ",
      phonemeB: "ظ",
      letterNameA: "ذَال (مُرَقَّق)",
      letterNameB: "ظَاء (مُفَخَّم)",
      wordA: { wordAr: "ذَلَّ", wordEn: "Became humble", transliteration: "Dhall" },
      wordB: { wordAr: "ظَلَّ", wordEn: "Remained / Stayed", transliteration: "Zhall" },
      distinctionExplanationAr: "كلاهما يخرجان من طرف اللسان مع الثنايا العليا، لكن الذال منخفضة مرققة، والظاء مستعلية مفخمة.",
      distinctionExplanationEn: "Both share the interdental tongue position, but Dhal is flat and light, while Dha is fully elevated and heavy.",
    });

    this.minimalPairs.set("pair-kaf-qaf", {
      id: "pair-kaf-qaf",
      phonemeA: "ك",
      phonemeB: "ق",
      letterNameA: "كَاف (مُرَقَّق)",
      letterNameB: "قَاف (مُفَخَّم)",
      wordA: { wordAr: "كَلْبٌ", wordEn: "Dog", transliteration: "Kalb" },
      wordB: { wordAr: "قَلْبٌ", wordEn: "Heart", transliteration: "Qalb" },
      distinctionExplanationAr: "الكاف تخرج من أمام الحنك الرخو مع همس، أما القاف فتخرج من أقصى اللسان عند اللهاة وهي قوية ومفخمة.",
      distinctionExplanationEn: "Changing Kaf to Qaf changes the entire meaning from 'dog' to 'heart'. Qaf comes from deep in the uvula.",
    });
  }

  async getAllPhonemes(): Promise<PhonemeItem[]> {
    return Array.from(this.phonemes.values());
  }

  async getPhonemeById(id: string): Promise<PhonemeItem | null> {
    return this.phonemes.get(id) || null;
  }

  async getAllMinimalPairs(): Promise<MinimalPair[]> {
    return Array.from(this.minimalPairs.values());
  }

  async getMinimalPairById(id: string): Promise<MinimalPair | null> {
    return this.minimalPairs.get(id) || null;
  }

  async saveAttempt(attempt: PronunciationAttempt): Promise<void> {
    const list = this.attempts.get(attempt.studentId) || [];
    list.unshift(attempt);
    this.attempts.set(attempt.studentId, list);
  }

  async getStudentAttempts(studentId: string): Promise<PronunciationAttempt[]> {
    return this.attempts.get(studentId) || [];
  }
}

export const pronunciationRepository = new InMemoryPronunciationRepository();
