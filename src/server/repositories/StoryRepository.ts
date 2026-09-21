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

    // 4. AGE_11_13: Prophet Yusuf's Dream and Patience
    this.stories.set("story-yusuf-dream", {
      id: "story-yusuf-dream",
      titleAr: "قِصَّةُ سَيِّدِنَا يُوسُفَ عَلَيْهِ السَّلَامُ وَالصَّبْرُ الجَمِيلُ",
      titleEn: "Prophet Yusuf (PBUH): The Dream & Beautiful Patience",
      titleNl: "Profeet Yusuf (vzmh): De Droom en Mooi Geduld",
      titleTr: "Yusuf Peygamber (a.s.): Rüya ve Güzel Sabır",
      titleIt: "Il Profeta Yusuf: Il Sogno e la Nobile Pazienza",
      titleEs: "El Profeta Yusuf: El Sueño y la Hermosa Paciencia",
      category: "PROPHETIC_STORIES",
      categoryTitleAr: "قصص الأنبياء والقرآن",
      ageGroup: "AGE_11_13",
      coverEmoji: "👑",
      readingDurationMinutes: 7,
      pagesCount: 4,
      audioNarrationUrl: "/audio/stories/yusuf-dream.mp3",
      xpReward: 45,
      pages: [
        {
          pageNumber: 1,
          textAr: "رَأَى يُوسُفُ عَلَيْهِ السَّلَامُ فِي مَنَامِهِ أَحَدَ عَشَرَ كَوْكَباً وَالشَّمْسَ وَالقَمَرَ لَهُ سَاجِدِينَ، فَقَالَ لَهُ أَبُوهُ يَعْقُوبُ: يَا بُنَيَّ لَا تَقْصُصْ رُؤْيَاكَ عَلَى إِخْوَتِكَ.",
          textEn: "Yusuf (peace be upon him) saw in a dream eleven stars, the sun, and the moon prostrating to him. His father Yaqub advised him not to recount his vision to his brothers.",
          textNl: "Yusuf zag in een droom elf sterren, de zon en de maan voor hem buigen. Zijn vader Yaqub adviseerde hem dit niet aan zijn broers te vertellen.",
          textTr: "Yusuf rüyasında on bir yıldızın, güneşin ve ayın kendisine secde ettiğini gördü. Babası Yakup, rüyasını kardeşlerine anlatmamasını öğütledi.",
          textIt: "Yusuf vide in sogno undici stelle, il sole e la luna prostrarsi davanti a lui. Suo padre Yaqub gli consigliò di non raccontare la visione ai fratelli.",
          textEs: "Yusuf vio en un sueño once estrellas, el sol y la luna postrándose ante él. Su padre Yaqub le aconsejó no contar su visión a sus hermanos.",
          illustrationEmoji: "✨",
          audioTimestampSeconds: 0,
        },
        {
          pageNumber: 2,
          textAr: "مَرَّ يُوسُفُ بِابْتِلَاءَاتٍ شَدِيدَةٍ: مِنَ الجُبِّ المُظْلِمِ إِلَى بَيْتِ العَزِيزِ ثُمَّ السِّجْنِ، وَفِي كُلِّ مَرْحَلَةٍ كَانَ يَثْبُتُ عَلَى الأَمَانَةِ وَالتَّقْوَى وَحُسْنِ الخُلُقِ.",
          textEn: "Yusuf faced great trials: from the dark well to Egypt's court and then prison, yet at every stage he held fast to integrity, piety, and virtue.",
          textNl: "Yusuf doorstond zware beproevingen: van de donkere put naar het hof van Egypte en de gevangenis, maar bleef trouw aan vroomheid en deugd.",
          textTr: "Yusuf zorlu sınavlardan geçti: karanlık kuyudan Mısır sarayına ve zindana; ancak her aşamada dürüstlük ve takvaya sımsıkı sarıldı.",
          textIt: "Yusuf affrontò grandi prove: dal pozzo buio alla corte d'Egitto e alla prigione, mantenendo sempre fede, pietà e virtù.",
          textEs: "Yusuf enfrentó grandes pruebas: desde el pozo oscuro hasta la corte de Egipto y la prisión, manteniendo siempre piedad y virtud.",
          illustrationEmoji: "🏰",
          audioTimestampSeconds: 20,
        },
        {
          pageNumber: 3,
          textAr: "فَسَّرَ يُوسُفُ رُؤْيَا المَلِكِ بِحِكْمَةٍ وَعِلْمٍ، فَأَنْقَذَ أَهْلَ مِصْرَ مِنَ القَحْطِ وَصَارَ عَزِيزَ مِصْرَ المُؤْتَمَنَ عَلَى خَزَائِنِ الأَرْضِ.",
          textEn: "Yusuf interpreted the King's dream with wisdom, saving Egypt from famine and becoming the trusted keeper of the storehouses of the land.",
          textNl: "Yusuf interpreteerde de droom van de koning met wijsheid, redde Egypte van de hongersnood en werd de vertrouwde beheerder van de voorraden.",
          textTr: "Yusuf kralın rüyasını bilgelikle yorumladı, Mısır'ı kıtlıktan kurtardı ve ülkenin hazinelerinin güvenilir yöneticisi oldu.",
          textIt: "Yusuf interpretò il sogno del re con saggezza, salvando l'Egitto dalla carestia e divenendo il fidato custode delle riserve.",
          textEs: "Yusuf interpretó el sueño del rey con sabiduría, salvando a Egipto de la hambruna y convirtiéndose en el administrador de los graneros.",
          illustrationEmoji: "🌾",
          audioTimestampSeconds: 40,
        },
        {
          pageNumber: 4,
          textAr: "وَعِنْدَمَا جَاءَ إِخْوَتُهُ طَالِبِينَ الطَّعَامَ، عَفَا عَنْهُمْ وَقَالَ: 'لَا تَثْرِيبَ عَلَيْكُمُ اليَوْمَ يَغْفِرُ اللَّهُ لَكُمْ'، مُضْرِباً أَعْظَمَ مَثَلٍ فِي الصَّفْحِ الجَمِيلِ.",
          textEn: "When his brothers came seeking grain, he forgave them saying: 'No blame will there be upon you today; may Allah forgive you,' setting the supreme example of gracious pardon.",
          textNl: "Toen zijn broers om graan kwamen, vergaf hij hen en zei: 'Vandaag treft jullie geen verwijt; moge Allah jullie vergeven', een prachtig voorbeeld van vergeving.",
          textTr: "Kardeşleri tahıl istemeye geldiğinde onları bağışladı ve 'Bugün size kınama yoktur, Allah sizi bağışlasın' diyerek en yüce af örneğini gösterdi.",
          textIt: "Quando i fratelli giunsero in cerca di grano, li perdonò dicendo: 'Nessun rimprovero oggi su di voi; che Allah vi perdoni', offrendo un esempio supremo di perdono.",
          textEs: "Cuando sus hermanos vinieron pidiendo grano, los perdonó diciendo: 'No habrá reproche para vosotros hoy; que Alá os perdone', dando el mayor ejemplo de perdón.",
          illustrationEmoji: "🤝",
          audioTimestampSeconds: 60,
        },
      ],
      quizQuestions: [
        {
          id: "q1",
          questionAr: "مَاذَا قَالَ يُوسُفُ عَلَيْهِ السَّلَامُ لإِخْوَتِهِ عِنْدَمَا اعْتَرَفُوا بِخَطَئِهِمْ؟",
          questionEn: "What did Prophet Yusuf say to his brothers when they admitted their wrong?",
          questionNl: "Wat zei Profeet Yusuf tegen zijn broers toen zij hun fout toegaven?",
          questionTr: "Kardeşleri hatalarını kabul ettiğinde Yusuf Peygamber onlara ne dedi?",
          questionIt: "Cosa disse il Profeta Yusuf ai suoi fratelli quando ammisero il loro errore?",
          questionEs: "¿Qué dijo el Profeta Yusuf a sus hermanos cuando admitieron su falta?",
          optionsAr: ["لَا تَثْرِيبَ عَلَيْكُمُ اليَوْمَ يَغْفِرُ اللَّهُ لَكُمْ", "سَأُعَاقِبُكُمْ عَلَى مَا فَعَلْتُمْ", "ارْحَلُوا عَنْ بِلَادِي"],
          optionsEn: ["No blame will there be upon you today; may Allah forgive you", "I will punish you for what you did", "Leave my land"],
          optionsNl: ["Vandaag treft jullie geen verwijt; moge Allah jullie vergeven", "Ik zal jullie straffen voor wat jullie deden", "Verlaat mijn land"],
          optionsTr: ["Bugün size kınama yoktur; Allah sizi bağışlasın", "Yaptıklarınız için sizi cezalandıracağım", "Ülkemi terk edin"],
          optionsIt: ["Nessun rimprovero oggi su di voi; che Allah vi perdoni", "Vi punirò per quello che avete fatto", "Lasciate la mia terra"],
          optionsEs: ["No habrá reproche para vosotros hoy; que Alá os perdone", "Os castigaré por lo que hicisteis", "Abandonad mi tierra"],
          correctOptionIndex: 0,
          moralLessonAr: "العفو عند المقدرة والصبر الجميل في مواجهة الشدائد.",
          moralLessonEn: "Pardoning when in power and graceful patience in adversity.",
          moralLessonNl: "Vergeving schenken vanuit kracht en mooi geduld in tijden van tegenslag.",
          moralLessonTr: "Güç sahibiyken affetmek ve zorluklar karşısında güzel sabır göstermek.",
          moralLessonIt: "Perdonare quando si ha il potere e nobile pazienza nelle avversità.",
          moralLessonEs: "Perdonar desde el poder y hermosa paciencia en la adversidad.",
        },
      ],
    });

    // 5. AGE_11_13: The Great Library of Cordoba
    this.stories.set("story-cordoba-library", {
      id: "story-cordoba-library",
      titleAr: "مَكْتَبَةُ قُرْطُبَةَ العَظِيمَةُ وَعَصْرُ المَعْرِفَةِ الذَّهَبِيُّ",
      titleEn: "The Great Library of Cordoba & the Golden Age of Knowledge",
      titleNl: "De Grote Bibliotheek van Cordoba en het Gouden Eeuw van Kennis",
      titleTr: "Kurtuba Ulu Kütüphanesi ve Altın Bilgi Çağı",
      titleIt: "La Grande Biblioteca di Cordova e l'Epoca d'Oro della Conoscenza",
      titleEs: "La Gran Biblioteca de Córdoba y la Edad de Oro del Conocimiento",
      category: "LANGUAGE_ADVENTURE",
      categoryTitleAr: "مغامرات اللغة والطلاقة",
      ageGroup: "AGE_11_13",
      coverEmoji: "📚",
      readingDurationMinutes: 6,
      pagesCount: 4,
      audioNarrationUrl: "/audio/stories/cordoba-library.mp3",
      xpReward: 45,
      pages: [
        {
          pageNumber: 1,
          textAr: "فِي قَلْبِ مَدِينَةِ قُرْطُبَةَ الأَنْدَلُسِيَّةِ، شَيَّدَ الخَلِيفَةُ الحَكَمُ المُسْتَنْصِرُ مَكْتَبَةً عَظِيمَةً ضَمَّتْ أَكْثَرَ مِنْ أَرْبَعِمِائَةِ أَلْفِ مَخْطُوطٍ نَادِرٍ فِي شَتَّى العُلُومِ.",
          textEn: "In the heart of Andalusian Cordoba, Caliph Al-Hakam II founded a grand library housing over 400,000 rare manuscripts across all sciences.",
          textNl: "In het hart van Andalusisch Cordoba stichtte Kalief Al-Hakam II een grote bibliotheek met meer dan 400.000 zeldzame manuscripten over alle wetenschappen.",
          textTr: "Endülüs Kurtuba'sının kalbinde Halife II. Hakem, tüm bilim dallarında 400.000'den fazla nadide el yazmasını barındıran ulu bir kütüphane kurdu.",
          textIt: "Nel cuore di Cordova andalusa, il Califfo Al-Hakam II fondò una grandiosa biblioteca che custodiva oltre 400.000 rari manoscritti di tutte le scienze.",
          textEs: "En el corazón de la Córdoba andalusí, el califa Al-Hakam II fundó una gran biblioteca con más de 400.000 manuscritos raros de todas las ciencias.",
          illustrationEmoji: "🏛️",
          audioTimestampSeconds: 0,
        },
        {
          pageNumber: 2,
          textAr: "كَانَتْ مَكْتَبَةُ قُرْطُبَةَ مَنَارَةً لِطُلَّابِ العِلْمِ مِنْ كُلِّ بِقَاعِ العَالَمِ، يَقْصِدُهَا العُلَمَاءُ لِدِرَاسَةِ الفَلَكِ وَالطِّبِّ وَالرِّيَاضِيَّاتِ وَالفَلْسَفَةِ وَاللُّغَةِ العَرَبِيَّةِ.",
          textEn: "The library was a beacon for scholars worldwide, who journeyed there to study astronomy, medicine, mathematics, philosophy, and Arabic.",
          textNl: "De bibliotheek was een baken voor geleerden uit de hele wereld, die erheen reisden om sterrenkunde, geneeskunde, wiskunde en Arabisch te bestuderen.",
          textTr: "Kütüphane, astronomi, tıp, matematik, felsefe ve Arapça çalışmak için oraya gelen dünya çapındaki bilim insanları için bir fenerdi.",
          textIt: "La biblioteca era un faro per gli studiosi di tutto il mondo, che viaggiavano per studiare astronomia, medicina, matematica e arabo.",
          textEs: "La biblioteca era un faro para eruditos de todo el mundo, que viajaban allí para estudiar astronomía, medicina, matemáticas y árabe.",
          illustrationEmoji: "🔭",
          audioTimestampSeconds: 18,
        },
        {
          pageNumber: 3,
          textAr: "تَمَيَّزَتِ المَكْتَبَةُ بِوُجُودِ نَاسِخِينَ وَمُجَلِّدِينَ مَهَرَةٍ، وَكَانَ مِنْ بَيْنِهِمْ نِسَاءٌ خَطَّاطَاتٌ كَتَبْنَ المَصَاحِفَ وَدَوَاوِينَ الشِّعْرِ بِأَرْوَعِ خُطُوطِ النَّسْخِ وَالأَنْدَلُسِيِّ.",
          textEn: "The library featured skilled scribes and bookbinders, including talented women calligraphers who copied Qurans and poetry in exquisite scripts.",
          textNl: "De bibliotheek had bekwame kopiisten en boekbinders, waaronder getalenteerde vrouwelijke kalligrafen die korans en poëzie kopieerden.",
          textTr: "Kütüphanede, Kur'an-ı Kerim ve şiirleri nefis hatlarla kopyalayan yetenekli kadın hattatlar da dahil olmak üzere yetkin müstensihler vardı.",
          textIt: "La biblioteca vantava abili copisti e rilegatori, tra cui talentuose calligrafe donne che copiavano Corani e poesie con calligrafie squisite.",
          textEs: "La biblioteca contaba con hábiles copistas y encuadernadores, incluidas talentosas mujeres calígrafas que copiaban coranes y poemas.",
          illustrationEmoji: "✒️",
          audioTimestampSeconds: 36,
        },
        {
          pageNumber: 4,
          textAr: "تُعَلِّمُنَا قُرْطُبَةُ أَنَّ الحَضَارَةَ الحَقِيقِيَّةَ تُبْنَى بِالعِلْمِ وَالكِتَابِ، وَأَنَّ تَقْدِيرَ العُلَمَاءِ وَنَشْرَ المَعْرِفَةِ هُوَ سَبِيلُ النَّهْضَةِ وَالرِّفْعَةِ.",
          textEn: "Cordoba teaches us that true civilization is built on knowledge and books, and that honoring scholars and disseminating wisdom is the path to prosperity.",
          textNl: "Cordoba leert ons dat ware beschaving wordt gebouwd op kennis en boeken, en dat het eren van geleerden het pad naar vooruitgang is.",
          textTr: "Kurtuba bize gerçek medeniyetin bilgi ve kitapla inşa edildiğini, âlimlere saygı göstermenin kalkınmanın yolu olduğunu öğretir.",
          textIt: "Cordova ci insegna che la vera civiltà si fonda sulla conoscenza e sui libri, e che onorare i sapienti è la via della rinascita.",
          textEs: "Córdoba nos enseña que la verdadera civilización se construye con conocimiento y libros, y que honrar a los sabios es el camino al progreso.",
          illustrationEmoji: "🌟",
          audioTimestampSeconds: 54,
        },
      ],
      quizQuestions: [
        {
          id: "q1",
          questionAr: "كَمْ عَدَدُ المَخْطُوطَاتِ التَّقْرِيبِيُّ الَّتِي ضَمَّتْهَا مَكْتَبَةُ قُرْطُبَةَ؟",
          questionEn: "Approximately how many manuscripts did the Library of Cordoba hold?",
          questionNl: "Ongeveer hoeveel manuscripten bevatte de bibliotheek van Cordoba?",
          questionTr: "Kurtuba Kütüphanesi yaklaşık kaç el yazması barındırıyordu?",
          questionIt: "Quanti manoscritti approssimativamente custodiva la biblioteca di Cordova?",
          questionEs: "¿Aproximadamente cuántos manuscritos albergaba la biblioteca de Córdoba?",
          optionsAr: ["أَكْثَرَ مِنْ 400,000 مَخْطُوطٍ", "حَوَالَيْ 10,000 مَخْطُوطٍ", "أَقَلَّ مِنْ 1,000 كِتَابٍ"],
          optionsEn: ["More than 400,000 manuscripts", "Around 10,000 manuscripts", "Fewer than 1,000 books"],
          optionsNl: ["Meer dan 400.000 manuscripten", "Ongeveer 10.000 manuscripten", "Minder dan 1.000 boeken"],
          optionsTr: ["400.000'den fazla el yazması", "Yaklaşık 10.000 el yazması", "1.000'den az kitap"],
          optionsIt: ["Oltre 400.000 manoscritti", "Circa 10.000 manoscritti", "Meno di 1.000 libri"],
          optionsEs: ["Más de 400.000 manuscritos", "Alrededor de 10.000 manuscritos", "Menos de 1.000 libros"],
          correctOptionIndex: 0,
          moralLessonAr: "أهمية القراءة وطلب العلم وبناء المكتبات لنشر الحضارة.",
          moralLessonEn: "The importance of reading, seeking knowledge, and building libraries.",
          moralLessonNl: "Het belang van lezen, kennis vergaren en bibliotheken bouwen.",
          moralLessonTr: "Okumanın, ilim aramanın ve kütüphaneler inşa etmenin önemi.",
          moralLessonIt: "L'importanza della lettura, della ricerca del sapere e della costruzione di biblioteche.",
          moralLessonEs: "La importancia de la lectura, la búsqueda del conocimiento y la construcción de bibliotecas.",
        },
      ],
    });

    // 6. AGE_14_16: Ibn Battuta's Odyssey
    this.stories.set("story-ibn-battuta-journey", {
      id: "story-ibn-battuta-journey",
      titleAr: "رِحْلَةُ ابْنِ بَطُوطَةَ وَجُسُورُ التَّوَاصُلِ الحَضَارِيِّ",
      titleEn: "Ibn Battuta's Odyssey & Bridges of Cultural Diplomacy",
      titleNl: "Ibn Battuta's Reis en Bruggen van Culturele Diplomatie",
      titleTr: "İbn Battuta'nın Seyahati ve Kültürel Diplomasi Köprüleri",
      titleIt: "Il Viaggio di Ibn Battuta e i Ponti della Diplomazia Culturale",
      titleEs: "El Viaje de Ibn Battuta y los Puentes de la Diplomacia Cultural",
      category: "LANGUAGE_ADVENTURE",
      categoryTitleAr: "مغامرات اللغة والطلاقة",
      ageGroup: "AGE_14_16",
      coverEmoji: "🧭",
      readingDurationMinutes: 8,
      pagesCount: 4,
      audioNarrationUrl: "/audio/stories/ibn-battuta.mp3",
      xpReward: 50,
      pages: [
        {
          pageNumber: 1,
          textAr: "انْطَلَقَ ابْنُ بَطُوطَةَ مِنْ مَدِينَةِ طَنْجَةَ عَامَ 725 هـ فِي رِحْلَةٍ اسْتَمَرَّتْ ثَلَاثِينَ عَاماً، قَاطِعاً أَكْثَرَ مِنْ مِائَةٍ وَعِشْرِينَ أَلْفَ كِيلُومِتْرٍ عَبْرَ إِفْرِيقْيَا وَآسْيَا وَأُورُوبَّا.",
          textEn: "Ibn Battuta set out from Tangier in 725 AH on a 30-year journey covering over 120,000 kilometers across Africa, Asia, and Europe.",
          textNl: "Ibn Battuta vertrok vanuit Tanger in 725 AH op een reis van 30 jaar en legde meer dan 120.000 kilometer af door Afrika, Azië en Europa.",
          textTr: "İbn Battuta, Hicri 725'te Tanca'dan yola çıkarak Afrika, Asya ve Avrupa'da 120.000 kilometreden fazla yol katettiği 30 yıllık bir seyahate başladı.",
          textIt: "Ibn Battuta partì da Tangeri nel 725 dell'Egira per un viaggio di 30 anni, percorrendo oltre 120.000 chilometri attraverso Africa, Asia ed Europa.",
          textEs: "Ibn Battuta partió de Tánger en el 725 de la Hégira en un viaje de 30 años que cubrió más de 120.000 kilómetros por África, Asia y Europa.",
          illustrationEmoji: "🗺️",
          audioTimestampSeconds: 0,
        },
        {
          pageNumber: 2,
          textAr: "وَثَّقَ الرَّحَّالَةُ فِي كِتَابِهِ 'تُحْفَةُ النُّظَّارِ' عَقَائِدَ الشُّعُوبِ وَعَادَاتِهِمْ وَطُرُقَ تِجَارَتِهِمْ، مُتَّبِعاً مَنْهَجَ المُشَاهَدَةِ المُبَاشِرَةِ وَالتَّوْثِيقِ الصَّادِقِ.",
          textEn: "In his masterpiece 'Tuhfat al-Nuzzar', the traveler documented peoples' customs, traditions, and trade routes through direct observation and honest recording.",
          textNl: "In zijn meesterwerk documenteerde de reiziger gebruiken, tradities en handelsroutes via directe observatie.",
          textTr: "Seyyah, şaheserinde doğrudan gözlem ve dürüst kayıt yöntemiyle halkların geleneklerini ve ticaret yollarını belgeledi.",
          textIt: "Nel suo capolavoro, il viaggiatore documentò costumi, tradizioni e rotte commerciali attraverso l'osservazione diretta.",
          textEs: "En su obra maestra, el viajero documentó costumbres, tradiciones y rutas comerciales mediante la observación directa.",
          illustrationEmoji: "📜",
          audioTimestampSeconds: 20,
        },
        {
          pageNumber: 3,
          textAr: "كَانَتِ اللُّغَةُ العَرَبِيَّةُ هِيَ لُغَةَ التَّوَاصُلِ الدِّبْلُومَاسِيِّ وَالعِلْمِيِّ فِي مَحَاكِمِ الهِنْدِ وَالصِّينِ وَجُزُرِ المَالْدِيفِ، حَيْثُ عَمِلَ ابْنُ بَطُوطَةَ قَاضِياً مُحْتَرَماً.",
          textEn: "Arabic served as the language of diplomatic and scholarly communication in the courts of India, China, and the Maldives, where he served as a respected judge.",
          textNl: "Het Arabisch diende als taal van diplomatie en wetenschap aan de hoven van India, China en de Malediven, waar hij als rechter diende.",
          textTr: "Arapça, İbn Battuta'nın saygın bir kadı olarak görev yaptığı Hindistan, Çin ve Maldivler saraylarında diplomasinin diliydi.",
          textIt: "L'arabo serviva come lingua di comunicazione diplomatica e accademica nelle corti dell'India, della Cina e delle Maldive, dove operò come giudice.",
          textEs: "El árabe servía como lengua de comunicación diplomática y académica en las cortes de India, China y Maldivas, donde ejerció como juez.",
          illustrationEmoji: "⚖️",
          audioTimestampSeconds: 40,
        },
        {
          pageNumber: 4,
          textAr: "تُذَكِّرُنَا رِحْلَةُ ابْنِ بَطُوطَةَ أَنَّ اخْتِلَافَ الشُّعُوبِ وَالثَّقَافَاتِ آيَةٌ مِنْ آيَاتِ اللَّهِ، وَأَنَّ التَّعَارُفَ وَالحِوَارَ هُمَا أَسَاسُ السَّلَامِ العَالَمِيِّ.",
          textEn: "Ibn Battuta's journey reminds us that the diversity of nations is a sign of God's wisdom, and that mutual acquaintance and dialogue are the foundation of world peace.",
          textNl: "Zijn reis herinnert ons eraan dat de diversiteit van volkeren een teken van Gods wijsheid is, en dat dialoog de basis is van wereldvrede.",
          textTr: "Onun seyahati, milletlerin çeşitliliğinin Allah'ın bir ayeti olduğunu, tanışma ve diyaloğun dünya barışının temeli olduğunu hatırlatır.",
          textIt: "Il suo viaggio ci ricorda che la diversità dei popoli è un segno della saggezza divina, e che la conoscenza reciproca è la base della pace.",
          textEs: "Su viaje nos recuerda que la diversidad de pueblos es un signo de la sabiduría divina, y que el diálogo es la base de la paz mundial.",
          illustrationEmoji: "🌍",
          audioTimestampSeconds: 60,
        },
      ],
      quizQuestions: [
        {
          id: "q1",
          questionAr: "كَمْ سَنَةً اسْتَمَرَّتْ رِحْلَةُ ابْنِ بَطُوطَةَ حَوْلَ العَالَمِ؟",
          questionEn: "How many years did Ibn Battuta's journey around the world last?",
          questionNl: "Hoeveel jaar duurde de wereldreis van Ibn Battuta?",
          questionTr: "İbn Battuta'nın dünya seyahati kaç yıl sürdü?",
          questionIt: "Quanti anni durò il viaggio di Ibn Battuta intorno al mondo?",
          questionEs: "¿Cuántos años duró el viaje de Ibn Battuta alrededor del mundo?",
          optionsAr: ["ثَلَاثِينَ عَاماً", "عَشْرَ سَنَوَاتٍ", "خَمْسِينَ عَاماً"],
          optionsEn: ["Thirty years", "Ten years", "Fifty years"],
          optionsNl: ["Dertig jaar", "Tien jaar", "Vijftig jaar"],
          optionsTr: ["Otuz yıl", "On yıl", "Elli yıl"],
          optionsIt: ["Trent'anni", "Dieci anni", "Cinquant'anni"],
          optionsEs: ["Treinta años", "Diez años", "Cincuenta años"],
          correctOptionIndex: 0,
          moralLessonAr: "أهمية استكشاف العالم وبناء جسور الحوار والاحترام بين الثقافات.",
          moralLessonEn: "The importance of exploring the world and building bridges of intercultural respect.",
          moralLessonNl: "Het belang van de wereld verkennen en bruggen van respect bouwen.",
          moralLessonTr: "Dünyayı keşfetmenin ve kültürler arası saygı köprüleri kurmanın önemi.",
          moralLessonIt: "L'importanza di esplorare il mondo e costruire ponti di rispetto interculturale.",
          moralLessonEs: "La importancia de explorar el mundo y construir puentes de respeto intercultural.",
        },
      ],
    });

    // 7. AGE_14_16: Al-Khwarizmi and the Foundations of Algebra
    this.stories.set("story-al-khwarizmi-algebra", {
      id: "story-al-khwarizmi-algebra",
      titleAr: "الخَوَارِزْمِيُّ وَتَأْسِيسُ عِلْمِ الجَبْرِ وَالحِسَابِ",
      titleEn: "Al-Khwarizmi & the Foundations of Algebra and Algorithms",
      titleNl: "Al-Chwarizmi en de Fundamenten van de Algebra en Algoritmen",
      titleTr: "Harezmî ve Cebir ile Algoritmanın Temelleri",
      titleIt: "Al-Khwarizmi e i Fondamenti dell'Algebra e degli Algoritmi",
      titleEs: "Al-Juarismi y los Fundamentos del Álgebra y los Algoritmos",
      category: "ISLAMIC_VALUES",
      categoryTitleAr: "القيم والأخلاق الإسلامية",
      ageGroup: "AGE_14_16",
      coverEmoji: "📐",
      readingDurationMinutes: 7,
      pagesCount: 4,
      audioNarrationUrl: "/audio/stories/al-khwarizmi.mp3",
      xpReward: 50,
      pages: [
        {
          pageNumber: 1,
          textAr: "فِي بَيْتِ الحِكْمَةِ بِبَغْدَادَ إِبَّانَ العَصْرِ العَبَّاسِيِّ، عَكَفَ العَالِمُ مُحَمَّدُ بْنُ مُوسَى الخَوَارِزْمِيُّ عَلَى دِرَاسَةِ الرِّيَاضِيَّاتِ وَالفَلَكِ وَالجُغْرَافْيَا.",
          textEn: "In the House of Wisdom in Baghdad during the Abbasid era, Muhammad ibn Musa al-Khwarizmi dedicated himself to mathematics, astronomy, and geography.",
          textNl: "In het Huis der Wijsheid in Bagdad wijdde Al-Chwarizmi zich aan wiskunde, sterrenkunde en aardrijkskunde.",
          textTr: "Bağdat'taki Beytülhikme'de Harezmî, kendini matematik, astronomi ve coğrafyaya adadı.",
          textIt: "Nella Casa della Sapienza a Baghdad, Al-Khwarizmi si dedicò alla matematica, all'astronomia e alla geografia.",
          textEs: "En la Casa de la Sabiduría en Bagdad, Al-Juarismi se dedicó a las matemáticas, la astronomía y la geografía.",
          illustrationEmoji: "🏛️",
          audioTimestampSeconds: 0,
        },
        {
          pageNumber: 2,
          textAr: "أَلَّفَ كِتَابَهُ الشَّهِيرَ 'الجَبْرُ وَالمُقَابَلَةُ'، مُبْتَكِراً عِلْماً جَدِيداً كُلِّيَّاً يَحُلُّ المُعَادَلَاتِ الحِسَابِيَّةَ وَيُسَهِّلُ حِسَابَ المَوَارِيثِ وَالمُعَامَلَاتِ التِّجَارِيَّةِ.",
          textEn: "He authored 'Al-Jabr wa'l-Muqabala', pioneering algebra to solve mathematical equations and simplify inheritances and commerce.",
          textNl: "Hij schreef 'Al-Jabr wa'l-Muqabala' en introduceerde algebra om vergelijkingen op te lossen en erfenissen en handel te vereenvoudigen.",
          textTr: "'El-Cebr ve'l-Mukabele' adlı eserini yazarak denklemleri çözen, miras ve ticaret hesaplarını kolaylaştıran yepyeni bir bilim geliştirdi.",
          textIt: "Scrisse 'Al-Jabr wa'l-Muqabala', aprendo la strada all'algebra per risolvere equazioni e facilitare successioni e commercio.",
          textEs: "Escribió 'Al-Yabr wa-l-Muqabala', siendo pionero del álgebra para resolver ecuaciones y facilitar herencias y comercio.",
          illustrationEmoji: "🧮",
          audioTimestampSeconds: 20,
        },
        {
          pageNumber: 3,
          textAr: "قَدَّمَ الخَوَارِزْمِيُّ لِلْعَالَمِ نِظَامَ الأَرْقَامِ الهِنْدِيَّةِ-العَرَبِيَّةِ وَمَفْهُومَ الصِّفْرِ، كَمَا ابْتَكَرَ الخَطَوَاتِ المَنْطِقِيَّةَ المُتَتَابِعَةَ الَّتِي عُرِفَتْ بِاسْمِ 'الخَوَارِزْمِيَّاتِ' (Algorithms).",
          textEn: "He introduced the Hindu-Arabic numeral system, the concept of zero, and step-by-step procedures that gave birth to the term 'Algorithms'.",
          textNl: "Hij introduceerde het Arabische cijfersysteem, het getal nul en de stapsgewijze logica die leidde tot 'algoritmen'.",
          textTr: "Hint-Arap rakam sistemini, sıfır kavramını ve 'algoritma' terimine adını veren adım adım mantıksal yöntemleri dünyaya tanıttı.",
          textIt: "Introdusse il sistema di numerazione arabo, lo zero e le procedure sequenziali che diedero origine al termine 'algoritmi'.",
          textEs: "Introdujo el sistema de numeración arábigo, el cero y los pasos lógicos secuenciales que dieron origen al término 'algoritmo'.",
          illustrationEmoji: "💻",
          audioTimestampSeconds: 40,
        },
        {
          pageNumber: 4,
          textAr: "بِفَضْلِ ابْتِكَارَاتِ الخَوَارِزْمِيِّ، انْطَلَقَتِ الثَّوْرَةُ التِّكْنُولُوجِيَّةُ الحَدِيثَةُ، مُثْبِتَةً أَنَّ العِلْمَ لَا وَطَنَ لَهُ وَأَنَّ الإِيمَانَ وَالتَّفْكِيرَ المَنْطِقِيَّ يَتَكَامَلَانِ.",
          textEn: "Thanks to his breakthroughs, modern technology was born, proving that knowledge has no borders and that faith and logical inquiry enrich each other.",
          textNl: "Dankzij zijn doorbraken ontstond de moderne technologie, wat bewijst dat geloof en logica elkaar verrijken.",
          textTr: "Onun buluşları sayesinde modern teknoloji doğdu; bilginin sınırı olmadığını, inanç ile aklın birbirini tamamladığını kanıtladı.",
          textIt: "Grazie alle sue scoperte è nata la tecnologia moderna, dimostrando che fede e indagine logica si arricchiscono a vicenda.",
          textEs: "Gracias a sus avances nació la tecnología moderna, demostrando que la fe y el razonamiento lógico se enriquecen mutuamente.",
          illustrationEmoji: "🚀",
          audioTimestampSeconds: 60,
        },
      ],
      quizQuestions: [
        {
          id: "q1",
          questionAr: "مَا هُوَ العِلْمُ الرِّيَاضِيُّ الجَدِيدُ الَّذِي أَسَّسَهُ الخَوَارِزْمِيُّ فِي كِتَابِهِ الشَّهِيرِ؟",
          questionEn: "What new mathematical science did Al-Khwarizmi pioneer in his renowned book?",
          questionNl: "Welke nieuwe wiskundige wetenschap introduceerde Al-Chwarizmi?",
          questionTr: "Harezmî'nin ünlü kitabında kurduğu yeni matematiksel bilim dalı nedir?",
          questionIt: "Quale nuova scienza matematica fondò Al-Khwarizmi nel suo celebre libro?",
          questionEs: "¿Qué nueva ciencia matemática fundó Al-Juarismi en su célebre libro?",
          optionsAr: ["عِلْمُ الجَبْرِ", "عِلْمُ الهَنْدَسَةِ المِعْمَارِيَّةِ", "عِلْمُ الكِيمْيَاءِ"],
          optionsEn: ["Algebra", "Architectural Geometry", "Chemistry"],
          optionsNl: ["Algebra", "Architectonische Meetkunde", "Chemie"],
          optionsTr: ["Cebir", "Mimari Geometri", "Kimya"],
          optionsIt: ["Algebra", "Geometria Architettonica", "Chimica"],
          optionsEs: ["Álgebra", "Geometría Arquitectónica", "Química"],
          correctOptionIndex: 0,
          moralLessonAr: "المنهج العلمي والتفكير المنطقي وتسخير العلم لخدمة المجتمع الإنساني.",
          moralLessonEn: "Scientific method, logical reasoning, and dedicating knowledge to serve humanity.",
          moralLessonNl: "De wetenschappelijke methode en kennis inzetten voor de mensheid.",
          moralLessonTr: "Bilimsel yöntem, mantıksal düşünce ve ilmi insanlığın hizmetine sunmak.",
          moralLessonIt: "Metodo scientifico, pensiero logico e dedicare la conoscenza al servizio dell'umanità.",
          moralLessonEs: "Método científico, razonamiento lógico y dedicar el saber al servicio de la humanidad.",
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

  private inMemoryProgress: Map<string, StoryProgress> = new Map();

  async saveProgress(progress: StoryProgress): Promise<void> {
    try {
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
    } catch {
      this.inMemoryProgress.set(`${progress.studentId}_${progress.storyId}`, progress);
    }
  }

  async getProgress(studentId: string, storyId: string): Promise<StoryProgress | null> {
    try {
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
    } catch {
      return this.inMemoryProgress.get(`${studentId}_${storyId}`) || null;
    }
  }
}

export const storyRepository = new StoryRepository();
