import { prisma } from "@/lib/database/prisma";

export type StoryCategory = "PROPHETIC_STORIES" | "ISLAMIC_VALUES" | "LANGUAGE_ADVENTURE";

export interface StoryPage {
  pageNumber: number;
  textAr: string;
  textEn: string;
  textNl: string;
  textTr: string;
  textIt: string;
  textEs: string;
  illustrationEmoji: string;
  audioTimestampSeconds: number;
}

export interface StoryQuizQuestion {
  id: string;
  questionAr: string;
  questionEn: string;
  questionNl: string;
  questionTr: string;
  questionIt: string;
  questionEs: string;
  optionsAr: string[];
  optionsEn: string[];
  optionsNl: string[];
  optionsTr: string[];
  optionsIt: string[];
  optionsEs: string[];
  correctOptionIndex: number;
  moralLessonAr: string;
  moralLessonEn: string;
  moralLessonNl: string;
  moralLessonTr: string;
  moralLessonIt: string;
  moralLessonEs: string;
}

export interface StoryBook {
  id: string;
  titleAr: string;
  titleEn: string;
  titleNl: string;
  titleTr: string;
  titleIt: string;
  titleEs: string;
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
 * Picks the field matching `locale` from a {ar,en,nl,tr,it,es} bundle,
 * falling back to English for any locale without its own value (same
 * fallback convention used for CurriculumModule content in
 * AdministrationRepository / programs/page.tsx).
 */
function pickLocale<T>(locale: string, fields: { ar: T; en: T; nl: T; tr: T; it: T; es: T }): T {
  switch (locale) {
    case "ar":
      return fields.ar;
    case "nl":
      return fields.nl;
    case "tr":
      return fields.tr;
    case "it":
      return fields.it;
    case "es":
      return fields.es;
    default:
      return fields.en;
  }
}

/**
 * The Arabic text of a story page is the actual reading/pronunciation
 * practice content (the thing being taught) and always stays Arabic
 * regardless of the viewer's UI locale -- only the translation gloss
 * beneath it should switch. Use getStoryTitle/getPageGloss/getQuiz* below
 * for anything that should follow the viewer's locale.
 */
export function getStoryTitle(story: StoryBook, locale: string): string {
  return pickLocale(locale, {
    ar: story.titleAr,
    en: story.titleEn,
    nl: story.titleNl,
    tr: story.titleTr,
    it: story.titleIt,
    es: story.titleEs,
  });
}

export function getPageGloss(page: StoryPage, locale: string): string {
  return pickLocale(locale, {
    ar: page.textAr,
    en: page.textEn,
    nl: page.textNl,
    tr: page.textTr,
    it: page.textIt,
    es: page.textEs,
  });
}

export function getQuizQuestionText(q: StoryQuizQuestion, locale: string): string {
  return pickLocale(locale, {
    ar: q.questionAr,
    en: q.questionEn,
    nl: q.questionNl,
    tr: q.questionTr,
    it: q.questionIt,
    es: q.questionEs,
  });
}

export function getQuizOptions(q: StoryQuizQuestion, locale: string): string[] {
  return pickLocale(locale, {
    ar: q.optionsAr,
    en: q.optionsEn,
    nl: q.optionsNl,
    tr: q.optionsTr,
    it: q.optionsIt,
    es: q.optionsEs,
  });
}

export function getMoralLesson(q: StoryQuizQuestion, locale: string): string {
  return pickLocale(locale, {
    ar: q.moralLessonAr,
    en: q.moralLessonEn,
    nl: q.moralLessonNl,
    tr: q.moralLessonTr,
    it: q.moralLessonIt,
    es: q.moralLessonEs,
  });
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
      titleNl: "De Ark van Profeet Noeh en de Dieren",
      titleTr: "Peygamber Nuh'un Gemisi ve Hayvanlar",
      titleIt: "L'Arca del Profeta Nuh e gli Animali",
      titleEs: "El Arca del Profeta Nuh y los Animales",
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
          textNl: "Allah de Almachtige beval Zijn Profeet Noeh (vrede zij met hem) om een enorme ark te bouwen in de uitgestrekte woestijn.",
          textTr: "Yüce Allah, Peygamberi Nuh'a (aleyhisselam) geniş çölde devasa bir gemi inşa etmesini emretti.",
          textIt: "Allah l'Onnipotente comandò al Suo Profeta Nuh (pace su di lui) di costruire un'enorme arca nel vasto deserto.",
          textEs: "Alá el Todopoderoso ordenó a Su Profeta Nuh (la paz sea con él) que construyera un arca enorme en el vasto desierto.",
          illustrationEmoji: "🪵",
          audioTimestampSeconds: 0,
        },
        {
          pageNumber: 2,
          textAr: "عَمِلَ نُوحٌ وَالْمُؤْمِنُونَ بِجِدٍّ وَصَبْرٍ، يَجْمَعُونَ الْخَشَبَ وَيَصْنَعُونَ السَّفِينَةَ بِإِتْقَانٍ وَإِيمَانٍ.",
          textEn: "Nuh and the believers worked diligently with patience, gathering wood and crafting the ship with devotion.",
          textNl: "Noeh en de gelovigen werkten ijverig en geduldig, verzamelden hout en bouwden het schip met toewijding.",
          textTr: "Nuh ve inananlar sabırla ve gayretle çalıştılar, odun topladılar ve gemiyi büyük bir özenle inşa ettiler.",
          textIt: "Nuh e i credenti lavorarono diligentemente con pazienza, raccogliendo legno e costruendo la nave con devozione.",
          textEs: "Nuh y los creyentes trabajaron con diligencia y paciencia, recogiendo madera y construyendo el barco con devoción.",
          illustrationEmoji: "🔨",
          audioTimestampSeconds: 15,
        },
        {
          pageNumber: 3,
          textAr: "وَعِنْدَمَا جَاءَ أَمْرُ اللَّهِ، حَمَلَ نُوحٌ فِي السَّفِينَةِ مِنْ كُلِّ زَوْجَيْنِ اثْنَيْنِ: الأَسَدَ وَاللَّبُؤَةَ، وَالْحَمَامَةَ وَالأَرْنَبَ.",
          textEn: "When the command of Allah arrived, Nuh brought aboard a pair of every animal: the lion, dove, and rabbit.",
          textNl: "Toen het bevel van Allah kwam, bracht Noeh van elk dier een paar aan boord: de leeuw, de duif en het konijn.",
          textTr: "Allah'ın emri geldiğinde Nuh, her hayvandan bir çift gemiye aldı: aslan, güvercin ve tavşan.",
          textIt: "Quando giunse il comando di Allah, Nuh portò a bordo una coppia di ogni animale: il leone, la colomba e il coniglio.",
          textEs: "Cuando llegó la orden de Alá, Nuh subió a bordo una pareja de cada animal: el león, la paloma y el conejo.",
          illustrationEmoji: "🦁",
          audioTimestampSeconds: 30,
        },
        {
          pageNumber: 4,
          textAr: "فَتَحَ اللَّهُ أَبْوَابَ السَّمَاءِ بِمَاءٍ مُنْهَمِرٍ، وَسَارَتِ السَّفِينَةُ بِأَمَانٍ بِرِعَايَةِ اللَّهِ وَحِفْظِهِ.",
          textEn: "Allah opened the gates of heaven with torrential rain, and the ark sailed peacefully under Allah's care.",
          textNl: "Allah opende de poorten van de hemel met stromende regen, en de ark voer veilig verder onder Allahs zorg.",
          textTr: "Allah, gökyüzünün kapılarını sağanak yağmurla açtı ve gemi, Allah'ın koruması altında huzur içinde yol aldı.",
          textIt: "Allah aprì le porte del cielo con una pioggia torrenziale, e l'arca navigò serenamente sotto la cura di Allah.",
          textEs: "Alá abrió las puertas del cielo con una lluvia torrencial, y el arca navegó en paz bajo el cuidado de Alá.",
          illustrationEmoji: "🌊",
          audioTimestampSeconds: 45,
        },
      ],
      quizQuestions: [
        {
          id: "q1",
          questionAr: "مَاذَا أَمَرَ اللَّهُ تَعَالَى نَبِيَّهُ نُوحاً أَنْ يَبْنِيَ؟",
          questionEn: "What did Allah command His Prophet Nuh to build?",
          questionNl: "Wat beval Allah Zijn Profeet Noeh te bouwen?",
          questionTr: "Yüce Allah, Peygamberi Nuh'a ne inşa etmesini emretti?",
          questionIt: "Cosa comandò Allah al Suo Profeta Nuh di costruire?",
          questionEs: "¿Qué le ordenó Alá a Su Profeta Nuh que construyera?",
          optionsAr: ["قَصْراً كَبِيراً", "سَفِينَةً ضَخْمَةً", "سُوراً عَالِياً"],
          optionsEn: ["A great palace", "A massive ark", "A tall wall"],
          optionsNl: ["Een groot paleis", "Een enorme ark", "Een hoge muur"],
          optionsTr: ["Büyük bir saray", "Devasa bir gemi", "Yüksek bir sur"],
          optionsIt: ["Un grande palazzo", "Un'enorme arca", "Un muro alto"],
          optionsEs: ["Un gran palacio", "Un arca enorme", "Un muro alto"],
          correctOptionIndex: 1,
          moralLessonAr: "طاعة أوامر الله واليقين بنصره.",
          moralLessonEn: "Obeying Allah's commands and trusting in His help.",
          moralLessonNl: "Gehoorzaamheid aan Allahs bevelen en vertrouwen op Zijn hulp.",
          moralLessonTr: "Allah'ın emirlerine itaat etmek ve O'nun yardımına güvenmek.",
          moralLessonIt: "Obbedire ai comandi di Allah e confidare nel Suo aiuto.",
          moralLessonEs: "Obedecer las órdenes de Alá y confiar en Su ayuda.",
        },
        {
          id: "q2",
          questionAr: "مَنْ رَكِبَ مَعَ نُوحٍ عَلَيْهِ السَّلَامُ فِي السَّفِينَةِ؟",
          questionEn: "Who boarded the ark with Prophet Nuh?",
          questionNl: "Wie ging er met Profeet Noeh aan boord van de ark?",
          questionTr: "Peygamber Nuh ile birlikte gemiye kimler bindi?",
          questionIt: "Chi salì sull'arca insieme al Profeta Nuh?",
          questionEs: "¿Quiénes subieron al arca junto con el Profeta Nuh?",
          optionsAr: ["الْمُؤْمِنُونَ وَمِنْ كُلِّ زَوْجَيْنِ اثْنَيْنِ", "التُّجَّارُ فَقَطْ", "الْحَيَوَانَاتُ الْمُفْتَرِسَةُ فَقَطْ"],
          optionsEn: ["The believers and a pair of every animal", "Only merchants", "Only wild predators"],
          optionsNl: ["De gelovigen en een paar van elk dier", "Alleen handelaars", "Alleen wilde roofdieren"],
          optionsTr: ["İnananlar ve her hayvandan bir çift", "Sadece tüccarlar", "Sadece yırtıcı hayvanlar"],
          optionsIt: ["I credenti e una coppia di ogni animale", "Solo i mercanti", "Solo gli animali predatori"],
          optionsEs: ["Los creyentes y una pareja de cada animal", "Solo los comerciantes", "Solo los animales depredadores"],
          correctOptionIndex: 0,
          moralLessonAr: "الرحمة بجميع المخلوقات ورعاية الكائنات الحية.",
          moralLessonEn: "Mercy toward all creatures and caring for living beings.",
          moralLessonNl: "Barmhartigheid voor alle schepselen en zorg voor levende wezens.",
          moralLessonTr: "Tüm canlılara merhamet etmek ve yaratıklara özen göstermek.",
          moralLessonIt: "La misericordia verso tutte le creature e la cura per gli esseri viventi.",
          moralLessonEs: "La misericordia hacia todas las criaturas y el cuidado de los seres vivos.",
        },
      ],
    });

    // 2. The Little Ant and the Grain
    this.stories.set("story-ant-grain", {
      id: "story-ant-grain",
      titleAr: "النَّمْلَةُ الصَّغِيرَةُ وَحَبَّةُ الْقَمْحِ الْمُبَارَكَةُ",
      titleEn: "The Little Ant and the Blessed Grain",
      titleNl: "Het Kleine Miertje en de Gezegende Korrel",
      titleTr: "Küçük Karınca ve Mübarek Buğday Tanesi",
      titleIt: "La Piccola Formica e il Chicco Benedetto",
      titleEs: "La Pequeña Hormiga y el Grano Bendito",
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
          textNl: "Het kleine miertje 'Namoela' liep door de groene tuin op zoek naar goed, eerlijk voedsel.",
          textTr: "Küçük karınca 'Nemule', helal rızık aramak için yeşil bahçede dolaşıyordu.",
          textIt: "La piccola formica 'Namula' camminava nel giardino verde in cerca di sostentamento genuino.",
          textEs: "La pequeña hormiga 'Namula' caminaba por el jardín verde buscando sustento honesto.",
          illustrationEmoji: "🌿",
          audioTimestampSeconds: 0,
        },
        {
          pageNumber: 2,
          textAr: "وَجَدَتْ حَبَّةَ قَمْحٍ ذَهَبِيَّةً ثَقِيلَةً جِدّاً، حَاوَلَتْ حَمْلَهَا مَرَّةً وَمَرَّتَيْنِ وَسَقَطَتْ مِنْهَا.",
          textEn: "She found a golden wheat grain that was very heavy; she tried lifting it once and twice, but it dropped.",
          textNl: "Ze vond een gouden tarwekorrel die erg zwaar was; ze probeerde hem één en twee keer op te tillen, maar hij viel steeds terug.",
          textTr: "Çok ağır, altın renkli bir buğday tanesi buldu; onu bir kez, iki kez kaldırmaya çalıştı ama elinden düştü.",
          textIt: "Trovò un chicco di grano dorato molto pesante; provò a sollevarlo una volta e due, ma le cadde.",
          textEs: "Encontró un grano de trigo dorado muy pesado; intentó levantarlo una y otra vez, pero se le caía.",
          illustrationEmoji: "🌾",
          audioTimestampSeconds: 12,
        },
        {
          pageNumber: 3,
          textAr: "لَمْ تَيْأَسْ نَمُولَةُ، بَلْ قَالَتْ: 'بِسْمِ اللَّهِ'، وَنَادَتْ صَدِيقَاتِهَا لِيَتَعَاوَنَّ مَعَهَا فِي حَمْلِهَا.",
          textEn: "She did not give up, but said 'Bismillah' and called her friends to cooperate together in carrying it.",
          textNl: "Ze gaf niet op, maar zei 'Bismillah' en riep haar vriendinnen om samen te helpen het te dragen.",
          textTr: "Pes etmedi, 'Bismillah' dedi ve onu birlikte taşımak için arkadaşlarını yardıma çağırdı.",
          textIt: "Non si arrese, ma disse 'Bismillah' e chiamò le sue amiche a collaborare insieme per trasportarlo.",
          textEs: "No se rindió, sino que dijo 'Bismillah' y llamó a sus amigas para cooperar juntas y cargarlo.",
          illustrationEmoji: "🤝",
          audioTimestampSeconds: 24,
        },
        {
          pageNumber: 4,
          textAr: "بِالتَّعَاوُنِ وَالإِصْرَارِ، أَدْخَلْنَ الْحَبَّةَ إِلَى بَيْتِهِنَّ وَحَمِدْنَ اللَّهَ عَلَى رِزْقِهِ وَفَضْلِهِ.",
          textEn: "Through cooperation and persistence, they brought the grain home and praised Allah for His blessings.",
          textNl: "Door samenwerking en doorzettingsvermogen brachten ze de korrel naar huis en prezen ze Allah voor Zijn zegeningen.",
          textTr: "İş birliği ve azimle taneyi eve getirdiler ve Allah'a nimetleri için hamd ettiler.",
          textIt: "Grazie alla cooperazione e alla perseveranza, portarono il chicco a casa e lodarono Allah per le Sue benedizioni.",
          textEs: "Gracias a la cooperación y la perseverancia, llevaron el grano a casa y alabaron a Alá por Sus bendiciones.",
          illustrationEmoji: "✨",
          audioTimestampSeconds: 36,
        },
      ],
      quizQuestions: [
        {
          id: "q1",
          questionAr: "مَاذَا قَالَتْ نَمُولَةُ عِنْدَمَا عَزَمَتْ عَلَى حَمْلِ الْحَبَّةِ؟",
          questionEn: "What did Namoola say when she decided to carry the grain?",
          questionNl: "Wat zei Namoela toen ze besloot de korrel te dragen?",
          questionTr: "Nemule, taneyi taşımaya karar verdiğinde ne dedi?",
          questionIt: "Cosa disse Namula quando decise di trasportare il chicco?",
          questionEs: "¿Qué dijo Namula cuando decidió cargar el grano?",
          optionsAr: ["بِسْمِ اللَّهِ", "لا أَسْتَطِيعُ", "سَأَتْرُكُهَا"],
          optionsEn: ["Bismillah", "I can't do it", "I'll leave it"],
          optionsNl: ["Bismillah", "Ik kan het niet", "Ik laat hem liggen"],
          optionsTr: ["Bismillah", "Yapamam", "Onu bırakacağım"],
          optionsIt: ["Bismillah", "Non ce la faccio", "Lo lascerò"],
          optionsEs: ["Bismillah", "No puedo hacerlo", "Lo dejaré"],
          correctOptionIndex: 0,
          moralLessonAr: "البدء باسم الله في كل عمل صالح.",
          moralLessonEn: "Beginning every good deed in the name of Allah.",
          moralLessonNl: "Elke goede daad beginnen in de naam van Allah.",
          moralLessonTr: "Her hayırlı işe Allah'ın adıyla başlamak.",
          moralLessonIt: "Iniziare ogni buona azione nel nome di Allah.",
          moralLessonEs: "Comenzar toda buena acción en el nombre de Alá.",
        },
        {
          id: "q2",
          questionAr: "كَيْفَ اسْتَطَاعَتِ النَّمْلَةُ نَقْلَ الْحَبَّةِ الثَّقِيلَةِ؟",
          questionEn: "How was the little ant able to carry the heavy grain?",
          questionNl: "Hoe kon het miertje de zware korrel dragen?",
          questionTr: "Küçük karınca ağır taneyi nasıl taşıyabildi?",
          questionIt: "Come riuscì la piccola formica a trasportare il pesante chicco?",
          questionEs: "¿Cómo pudo la pequeña hormiga cargar el pesado grano?",
          optionsAr: ["بِالتَّعَاوُنِ مَعَ صَدِيقَاتِهَا", "بِمُفْرَدِهَا فَقَطْ", "انْتَظَرَتِ الرِّيَاحَ"],
          optionsEn: ["By cooperating with her friends", "Alone by herself", "She waited for the wind"],
          optionsNl: ["Door samen te werken met haar vriendinnen", "Helemaal alleen", "Ze wachtte op de wind"],
          optionsTr: ["Arkadaşlarıyla iş birliği yaparak", "Tek başına", "Rüzgârı bekledi"],
          optionsIt: ["Collaborando con le sue amiche", "Da sola", "Aspettò il vento"],
          optionsEs: ["Cooperando con sus amigas", "Ella sola", "Esperó al viento"],
          correctOptionIndex: 0,
          moralLessonAr: "قيمة التعاون والمثابرة وعدم الاستسلام.",
          moralLessonEn: "The value of cooperation, perseverance, and never giving up.",
          moralLessonNl: "De waarde van samenwerking, doorzettingsvermogen en nooit opgeven.",
          moralLessonTr: "İş birliğinin, azmin ve asla pes etmemenin değeri.",
          moralLessonIt: "Il valore della cooperazione, della perseveranza e del non arrendersi mai.",
          moralLessonEs: "El valor de la cooperación, la perseverancia y no rendirse nunca.",
        },
      ],
    });

    // 3. Oasis of Words
    this.stories.set("story-oasis-words", {
      id: "story-oasis-words",
      titleAr: "مُغَامَرَةٌ فِي وَاحَةِ الْكَلِمَاتِ الْعَجِيبَةِ",
      titleEn: "Adventure in the Oasis of Wondrous Words",
      titleNl: "Avontuur in de Oase van Wonderlijke Woorden",
      titleTr: "Şaşırtıcı Kelimeler Vahasında Bir Macera",
      titleIt: "Avventura nell'Oasi delle Parole Meravigliose",
      titleEs: "Aventura en el Oasis de las Palabras Maravillosas",
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
          textNl: "Salem en Salma reisden op een magisch tapijt naar een oase waar volledig van klinkertekens voorziene letters door de lucht zweefden.",
          textTr: "Salim ve Selma, harekeli harflerin havada uçuştuğu bir vahaya uçan halıyla yolculuk ettiler.",
          textIt: "Salem e Salma viaggiarono su un tappeto magico verso un'oasi dove lettere vocalizzate svolazzavano nell'aria.",
          textEs: "Salem y Salma viajaron en una alfombra mágica hasta un oasis donde letras vocalizadas revoloteaban en el aire.",
          illustrationEmoji: "✨",
          audioTimestampSeconds: 0,
        },
        {
          pageNumber: 2,
          textAr: "رَأَيَا شَجَرَةَ الْحَرَكَاتِ: فَتْحَةٌ تَرْفَعُ رَأْسَهَا، وَضَمَّةٌ تَبْتَسِمُ، وَكَسْرَةٌ تَنْزِلُ لِلأَسْفَلِ بِأَدَبٍ.",
          textEn: "They saw the Tree of Vowels: Fatha raising its head, Damma smiling, and Kasra polite below.",
          textNl: "Ze zagen de Boom der Klinkertekens: Fatha die haar hoofd ophief, Damma die glimlachte, en Kasra die beleefd naar beneden keek.",
          textTr: "Harekeler Ağacı'nı gördüler: başını kaldıran Fetha, gülümseyen Damme ve nazikçe aşağıda duran Kesre.",
          textIt: "Videro l'Albero delle Vocali: la Fatha che alzava la testa, la Damma che sorrideva, e la Kasra educatamente in basso.",
          textEs: "Vieron el Árbol de las Vocales: la Fatha levantando la cabeza, la Damma sonriendo, y la Kasra educadamente abajo.",
          illustrationEmoji: "🌳",
          audioTimestampSeconds: 15,
        },
        {
          pageNumber: 3,
          textAr: "جَمَعَ سَالِمٌ حُرُوفَ: 'قَ - لَ - مٌ'، فَتَحَوَّلَتْ فِي يَدِهِ إِلَى قَلَمٍ ذَهَبِيٍّ يَكْتُبُ النُّورَ.",
          textEn: "Salem assembled the letters Q-L-M, and it transformed into a golden pen writing light.",
          textNl: "Salem voegde de letters Q-L-M samen, en ze veranderden in een gouden pen die licht schreef.",
          textTr: "Salim, K-A-L-E-M harflerini bir araya getirdi ve bunlar ışık yazan altın bir kaleme dönüştü.",
          textIt: "Salem assemblò le lettere Q-L-M, e queste si trasformarono in una penna dorata che scriveva luce.",
          textEs: "Salem juntó las letras Q-L-M, y se transformaron en una pluma dorada que escribía luz.",
          illustrationEmoji: "🖊️",
          audioTimestampSeconds: 30,
        },
        {
          pageNumber: 4,
          textAr: "فَرِحَ الأَطْفَالُ وَتَعَلَّمُوا أَنَّ الْقِرَاءَةَ تُنِيرُ الْعُقُولَ وَتَفْتَحُ أَبْوَابَ الْعِلْمِ وَالْحِكْمَةِ.",
          textEn: "The children rejoiced and learned that reading illuminates minds and opens doors to knowledge.",
          textNl: "De kinderen verheugden zich en leerden dat lezen de geest verlicht en deuren naar kennis opent.",
          textTr: "Çocuklar sevindiler ve okumanın zihinleri aydınlattığını, bilgiye giden kapıları açtığını öğrendiler.",
          textIt: "I bambini gioirono e impararono che leggere illumina le menti e apre le porte alla conoscenza.",
          textEs: "Los niños se alegraron y aprendieron que leer ilumina las mentes y abre las puertas al conocimiento.",
          illustrationEmoji: "📖",
          audioTimestampSeconds: 45,
        },
      ],
      quizQuestions: [
        {
          id: "q1",
          questionAr: "إِلَى أَيْنَ سَافَرَ سَالِمٌ وَسَلْمَى؟",
          questionEn: "Where did Salem and Salma travel to?",
          questionNl: "Waar reisden Salem en Salma naartoe?",
          questionTr: "Salim ile Selma nereye seyahat etti?",
          questionIt: "Dove viaggiarono Salem e Salma?",
          questionEs: "¿Adónde viajaron Salem y Salma?",
          optionsAr: ["إِلَى وَاحَةِ الْكَلِمَاتِ الْعَجِيبَةِ", "إِلَى مَدِينَةِ الأَلْعَابِ", "إِلَى شَاطِئِ الْبَحْرِ"],
          optionsEn: ["To the Oasis of Wondrous Words", "To a city of games", "To the seashore"],
          optionsNl: ["Naar de Oase van Wonderlijke Woorden", "Naar een speelstad", "Naar de zeekust"],
          optionsTr: ["Şaşırtıcı Kelimeler Vahası'na", "Bir oyun şehrine", "Deniz kıyısına"],
          optionsIt: ["All'Oasi delle Parole Meravigliose", "In una città di giochi", "Sulla riva del mare"],
          optionsEs: ["Al Oasis de las Palabras Maravillosas", "A una ciudad de juegos", "A la orilla del mar"],
          correctOptionIndex: 0,
          moralLessonAr: "حب القراءة واللغة العربية مفتاح المعرفة.",
          moralLessonEn: "Loving reading and the Arabic language is the key to knowledge.",
          moralLessonNl: "Van lezen en de Arabische taal houden is de sleutel tot kennis.",
          moralLessonTr: "Okumayı ve Arapçayı sevmek, bilginin anahtarıdır.",
          moralLessonIt: "Amare la lettura e la lingua araba è la chiave della conoscenza.",
          moralLessonEs: "Amar la lectura y el idioma árabe es la llave del conocimiento.",
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
