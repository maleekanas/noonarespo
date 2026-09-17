import { createHash } from "node:crypto";
import { RoleType, UserStatus, AgeGroup, EmploymentType } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";
import { userRepository } from "./UserRepository";

export type AuditActionCategory =
  | "AUTH"
  | "USER_MANAGEMENT"
  | "ACADEMIC"
  | "FINANCE"
  | "SECURITY";

export interface AuditLogEntry {
  id: string;
  category: AuditActionCategory;
  action: string;
  actorId: string;
  actorEmail: string;
  actorRole: RoleType;
  targetEntityId: string;
  targetEntityType: string;
  ipAddress: string;
  timestamp: Date;
  diffSummary?: string;
  hash: string;
}

export interface CurriculumModule {
  id: string;
  programId: string;
  programTitleAr: string;
  programTitleEn: string;
  courseLevelCode: string;
  levelTitleAr: string;
  targetAgeGroup: AgeGroup;
  cefrAlignment: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  weeklyObjectivesAr: string[];
  weeklyObjectivesEn: string[];
  titleNl: string;
  titleTr: string;
  titleIt: string;
  titleEs: string;
  descriptionNl: string;
  descriptionTr: string;
  descriptionIt: string;
  descriptionEs: string;
  weeklyObjectivesNl: string[];
  weeklyObjectivesTr: string[];
  weeklyObjectivesIt: string[];
  weeklyObjectivesEs: string[];
  targetVocabularyCount: number;
  durationWeeks: number;
}

export interface StudentAdminRecord {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  ageGroup: AgeGroup;
  nativeLanguage: string;
  status: UserStatus;
  guardianName: string;
  guardianPhone: string;
  guardianConsentGivenAt: Date | null;
  coppaGdprCompliant: boolean;
  enrolledClassesCount: number;
}

export interface TeacherAdminRecord {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  qualifications: string;
  languagesSpoken: string;
  experienceYears: number;
  hourlyRateMinorUnits: number;
  isActive: boolean;
  isCertified: boolean;
  employmentType: EmploymentType;
  assignedClassesCount: number;
  totalHoursTaught: number;
}

// AuditLog.diffJson carries category/actorEmail/actorRole/diffSummary/hash as
// a JSON blob -- the real Prisma AuditLog model (used elsewhere already for
// coarser system logging) only has action/resource/resourceId/userId/
// ipAddress natively, so the extra fields this admin UI needs are packed in
// here rather than requiring another schema migration on an already-live
// table.
interface AuditLogMeta {
  category: AuditActionCategory;
  actorEmail: string;
  actorRole: RoleType;
  diffSummary?: string;
  hash: string;
}

class AdministrationRepository {
  // Curriculum modules are admin-authored reference content (which weekly
  // objectives belong to which program/level) -- the same category as the
  // assessment question bank: losing an admin's freshly-typed module on a
  // cold start is an annoyance to redo, not real user data being lost, so
  // this stays in-memory for now (documented, not fixed, same reasoning as
  // AssessmentBankRepository).
  private curriculumModules: Map<string, CurriculumModule> = new Map();

  constructor() {
    this.seedCurriculumModules();
  }

  private computeHash(
    category: AuditActionCategory,
    action: string,
    actorId: string,
    targetEntityId: string,
    timestamp: Date,
    diffSummary?: string
  ): string {
    const raw = `${category}:${action}:${actorId}:${targetEntityId}:${timestamp.toISOString()}:${diffSummary || ""}`;
    return createHash("sha256").update(raw).digest("hex");
  }

  private seedCurriculumModules() {
    const modules: CurriculumModule[] = [
      // --- Program 1: Arabic Foundations (prog-foundations) ---
      {
        id: "cur-1",
        programId: "prog-foundations",
        programTitleAr: "أساسيات اللغة العربية",
        programTitleEn: "Arabic Foundations",
        courseLevelCode: "PRE_A1",
        levelTitleAr: "المستوى التمهيدي (براعم الحروف)",
        targetAgeGroup: AgeGroup.AGE_4_6,
        cefrAlignment: "CEFR Pre-A1",
        titleAr: "وحدة الحروف الهجائية بالحركات الثلاث",
        titleEn: "Alphabet with Primary Harakat",
        descriptionAr: "التعرف على أشكال الحروف (أ - ي) مع حركات الفتحة والضمة والكسرة ونطقها السليم.",
        descriptionEn: "Recognizing letter shapes (alif to yaa) with fatha, damma, and kasra vowel marks and their correct pronunciation.",
        weeklyObjectivesAr: [
          "تمييز رسم الحروف المنفصلة والمتصلة",
          "نطق الحرف بالحركات القصيرة نطقاً صحيحاً",
          "ربط الحرف بصور لمفردات مألوفة من بيئة الطفل",
        ],
        weeklyObjectivesEn: [
          "Distinguishing between separated and connected letter forms",
          "Pronouncing letters with short vowel marks correctly",
          "Linking each letter to pictures of familiar vocabulary from the child's environment",
        ],
        titleNl: "Alfabet met de drie korte klinkertekens",
        titleTr: "Üç Temel Harekeyle Alfabe",
        titleIt: "Alfabeto con le Tre Vocali Brevi (Harakat)",
        titleEs: "Alfabeto con las Tres Vocales Breves (Harakat)",
        descriptionNl: "Het herkennen van lettervormen (alif tot yaa) met fatha-, damma- en kasra-klinkertekens en hun juiste uitspraak.",
        descriptionTr: "Harf şekillerinin (elif'ten ye'ye) fetha, damme ve kesre hareke işaretleriyle tanınması ve doğru telaffuzu.",
        descriptionIt: "Riconoscimento della forma delle lettere (da alif a yaa) con i segni vocalici fatha, damma e kasra e la loro corretta pronuncia.",
        descriptionEs: "Reconocimiento de las formas de las letras (de alif a ya) con las marcas vocálicas fatha, damma y kasra y su pronunciación correcta.",
        weeklyObjectivesNl: [
          "Onderscheid maken tussen losse en verbonden lettervormen",
          "Letters met korte klinkertekens correct uitspreken",
          "Elke letter koppelen aan afbeeldingen van vertrouwde woorden uit de omgeving van het kind",
        ],
        weeklyObjectivesTr: [
          "Ayrık ve bitişik harf şekilleri arasındaki farkı ayırt etme",
          "Kısa hareke işaretli harfleri doğru telaffuz etme",
          "Her harfi çocuğun çevresinden tanıdık kelimelerin resimleriyle ilişkilendirme",
        ],
        weeklyObjectivesIt: [
          "Distinguere tra le forme delle lettere separate e collegate",
          "Pronunciare correttamente le lettere con i segni vocalici brevi",
          "Collegare ogni lettera a immagini di vocaboli familiari dall'ambiente del bambino",
        ],
        weeklyObjectivesEs: [
          "Distinguir entre las formas de las letras separadas y conectadas",
          "Pronunciar correctamente las letras con marcas vocálicas breves",
          "Relacionar cada letra con imágenes de vocabulario familiar del entorno del niño",
        ],
        targetVocabularyCount: 50,
        durationWeeks: 4,
      },
      {
        id: "cur-1b",
        programId: "prog-foundations",
        programTitleAr: "أساسيات اللغة العربية",
        programTitleEn: "Arabic Foundations",
        courseLevelCode: "PRE_A1",
        levelTitleAr: "المستوى التمهيدي (أشكال الحروف)",
        targetAgeGroup: AgeGroup.AGE_4_6,
        cefrAlignment: "CEFR Pre-A1",
        titleAr: "أشكال الحروف في أول ووسط وآخر الكلمة",
        titleEn: "Letter Forms in Initial, Medial & Final Positions",
        descriptionAr: "تدريب بصري وحركي على تغير رسم الحرف حسب موضعه في الكلمة وقراءة مقاطع ثنائية مشكولة.",
        descriptionEn: "Visual and motor training on how a letter's shape changes based on its position in a word, and reading two-letter vocalized syllables.",
        weeklyObjectivesAr: [
          "التعرف على تغير شكل الحرف حسب موقعه في الكلمة",
          "وصل الحروف ثنائية وثلاثية المقاطع بطلاقة",
          "رسم الحرف بالاتجاه السليم على الشاشة والورق",
        ],
        weeklyObjectivesEn: [
          "Recognizing how a letter's shape changes based on its position in a word",
          "Joining two- and three-letter syllables fluently",
          "Writing the letter in the correct stroke direction on screen and paper",
        ],
        titleNl: "Lettervormen aan Begin, Midden en Einde van het Woord",
        titleTr: "Kelime Başında, Ortasında ve Sonunda Harf Şekilleri",
        titleIt: "Forme delle Lettere in Posizione Iniziale, Mediana e Finale",
        titleEs: "Formas de las Letras en Posición Inicial, Media y Final",
        descriptionNl: "Visuele en motorische training in hoe de vorm van een letter verandert afhankelijk van de positie in een woord, en het lezen van tweeletter-lettergrepen met klinkertekens.",
        descriptionTr: "Bir harfin şeklinin kelimedeki konumuna göre nasıl değiştiğine dair görsel ve motor eğitim ile harekeli iki harfli hecelerin okunması.",
        descriptionIt: "Allenamento visivo e motorio su come cambia la forma di una lettera in base alla sua posizione nella parola, e lettura di sillabe vocalizzate di due lettere.",
        descriptionEs: "Entrenamiento visual y motriz sobre cómo cambia la forma de una letra según su posición en una palabra, y lectura de sílabas vocalizadas de dos letras.",
        weeklyObjectivesNl: [
          "Herkennen hoe de vorm van een letter verandert afhankelijk van de positie in een woord",
          "Vloeiend verbinden van lettergrepen van twee en drie letters",
          "De letter met de juiste schrijfrichting op scherm en papier schrijven",
        ],
        weeklyObjectivesTr: [
          "Bir harfin şeklinin kelimedeki konumuna göre nasıl değiştiğini tanıma",
          "İki ve üç harfli heceleri akıcı biçimde birleştirme",
          "Harfi ekranda ve kâğıtta doğru çizim yönüyle yazma",
        ],
        weeklyObjectivesIt: [
          "Riconoscere come cambia la forma di una lettera in base alla sua posizione nella parola",
          "Unire con scioltezza sillabe di due e tre lettere",
          "Scrivere la lettera con la corretta direzione del tratto su schermo e su carta",
        ],
        weeklyObjectivesEs: [
          "Reconocer cómo cambia la forma de una letra según su posición en una palabra",
          "Unir con fluidez sílabas de dos y tres letras",
          "Escribir la letra con la dirección de trazo correcta en pantalla y en papel",
        ],
        targetVocabularyCount: 75,
        durationWeeks: 4,
      },
      {
        id: "cur-1c",
        programId: "prog-foundations",
        programTitleAr: "أساسيات اللغة العربية",
        programTitleEn: "Arabic Foundations",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (المدود والحركات الطويلة)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A1",
        titleAr: "الحركات الطويلة والمدود والسكون",
        titleEn: "Long Vowels, Madd Letters & Sukoon",
        descriptionAr: "التفريق السمعي والبصري بين الحركات القصيرة والمدود الثلاثة وإتقان نطق السكون.",
        descriptionEn: "Auditory and visual differentiation between short vowels and the three long vowels, and mastering the pronunciation of sukoon.",
        weeklyObjectivesAr: [
          "التفريق بين الحركات القصيرة والمدود الثلاثة (ا، و، ي)",
          "نطق مقطع المد والممدود بوضوح وسلاسة",
          "قراءة وتهجئة كلمات ثلاثية ورباعية تحوي سكوناً",
        ],
        weeklyObjectivesEn: [
          "Distinguishing between short vowels and the three long vowels (alif, waw, yaa)",
          "Pronouncing the elongated (madd) syllable clearly and smoothly",
          "Reading and spelling three- and four-letter words containing a sukoon",
        ],
        titleNl: "Lange Klinkers, Madd-letters en Sukoon",
        titleTr: "Uzun Ünlüler, Med Harfleri ve Sükûn",
        titleIt: "Vocali Lunghe, Lettere di Madd e Sukoon",
        titleEs: "Vocales Largas, Letras de Madd y Sukun",
        descriptionNl: "Auditief en visueel onderscheid tussen korte klinkers en de drie lange klinkers, en het beheersen van de uitspraak van sukoon.",
        descriptionTr: "Kısa ünlüler ile üç uzun ünlü arasında işitsel ve görsel ayrım yapma ve sükûn telaffuzunda ustalaşma.",
        descriptionIt: "Differenziazione uditiva e visiva tra le vocali brevi e le tre vocali lunghe, e padronanza della pronuncia del sukoon.",
        descriptionEs: "Diferenciación auditiva y visual entre las vocales breves y las tres vocales largas, y dominio de la pronunciación del sukun.",
        weeklyObjectivesNl: [
          "Onderscheid maken tussen korte klinkers en de drie lange klinkers (alif, waw, yaa)",
          "De verlengde (madd) lettergreep duidelijk en vloeiend uitspreken",
          "Woorden van drie en vier letters met een sukoon lezen en spellen",
        ],
        weeklyObjectivesTr: [
          "Kısa ünlüler ile üç uzun ünlü (elif, vav, ye) arasındaki farkı ayırt etme",
          "Uzatılmış (med) heceyi net ve akıcı biçimde telaffuz etme",
          "Sükûn içeren üç ve dört harfli kelimeleri okuma ve heceleme",
        ],
        weeklyObjectivesIt: [
          "Distinguere tra le vocali brevi e le tre vocali lunghe (alif, waw, yaa)",
          "Pronunciare la sillaba allungata (madd) in modo chiaro e fluido",
          "Leggere e compitare parole di tre e quattro lettere contenenti un sukoon",
        ],
        weeklyObjectivesEs: [
          "Distinguir entre las vocales breves y las tres vocales largas (alif, waw, ya)",
          "Pronunciar la sílaba alargada (madd) con claridad y fluidez",
          "Leer y deletrear palabras de tres y cuatro letras que contienen un sukun",
        ],
        targetVocabularyCount: 90,
        durationWeeks: 4,
      },

      // --- Program 2: Reading & Fluency (prog-reading) ---
      {
        id: "cur-2",
        programId: "prog-reading",
        programTitleAr: "برنامج القراءة والطلاقة",
        programTitleEn: "Reading & Fluency Program",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (مستكشفو الكلمات)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A1",
        titleAr: "المدود والتنوين وقراءة الجمل القصيرة",
        titleEn: "Madd, Tanween & Short Sentences",
        descriptionAr: "إتقان المدود الثلاثة (الألف والواو والياء) والتنوين والبدء بقراءة قصص مصورة مبسطة.",
        descriptionEn: "Mastering the three long vowels (alif, waw, yaa) and tanween, and beginning to read simplified illustrated stories.",
        weeklyObjectivesAr: [
          "التفريق بين الحركة القصيرة والمد الطويل",
          "قراءة كلمات مشكولة تحوي تنويناً بالفتح والضم والكسر",
          "قراءة جملة مفيدة مكونة من 3-4 كلمات بطلاقة",
        ],
        weeklyObjectivesEn: [
          "Distinguishing between a short vowel and a long elongation (madd)",
          "Reading vocalized words containing fathatain, dammatain, and kasratain",
          "Reading a meaningful 3-4 word sentence fluently",
        ],
        titleNl: "Madd, Tanwien en Korte Zinnen",
        titleTr: "Med, Tenvin ve Kısa Cümleler",
        titleIt: "Madd, Tanwin e Frasi Brevi",
        titleEs: "Madd, Tanwin y Frases Cortas",
        descriptionNl: "Het beheersen van de drie lange klinkers (alif, waw, yaa) en tanwien, en beginnen met het lezen van vereenvoudigde geïllustreerde verhalen.",
        descriptionTr: "Üç uzun ünlünün (elif, vav, ye) ve tenvinin öğrenilmesi ve basitleştirilmiş resimli hikâyelerin okunmasına başlanması.",
        descriptionIt: "Padronanza delle tre vocali lunghe (alif, waw, yaa) e del tanwin, e inizio della lettura di storie illustrate semplificate.",
        descriptionEs: "Dominio de las tres vocales largas (alif, waw, ya) y el tanwin, y comienzo de la lectura de cuentos ilustrados simplificados.",
        weeklyObjectivesNl: [
          "Onderscheid maken tussen een korte klinker en een lange verlenging (madd)",
          "Woorden met klinkertekens lezen die fathatain, dammatain en kasratain bevatten",
          "Een betekenisvolle zin van 3-4 woorden vloeiend lezen",
        ],
        weeklyObjectivesTr: [
          "Kısa bir ünlü ile uzun bir uzatma (med) arasındaki farkı ayırt etme",
          "Fethateyn, dammeteyn ve kesrateyn içeren harekeli kelimeleri okuma",
          "Anlamlı 3-4 kelimelik bir cümleyi akıcı biçimde okuma",
        ],
        weeklyObjectivesIt: [
          "Distinguere tra una vocale breve e un allungamento lungo (madd)",
          "Leggere parole vocalizzate contenenti fathatain, dammatain e kasratain",
          "Leggere con scioltezza una frase significativa di 3-4 parole",
        ],
        weeklyObjectivesEs: [
          "Distinguir entre una vocal breve y un alargamiento largo (madd)",
          "Leer palabras vocalizadas que contienen fathatain, dammatain y kasratain",
          "Leer con fluidez una frase significativa de 3-4 palabras",
        ],
        targetVocabularyCount: 120,
        durationWeeks: 6,
      },
      {
        id: "cur-2b",
        programId: "prog-reading",
        programTitleAr: "برنامج القراءة والطلاقة",
        programTitleEn: "Reading & Fluency Program",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (اللام الشمسية والقمرية والشدة)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A2",
        titleAr: "اللام الشمسية والقمرية والحرف المشدد والوصل",
        titleEn: "Solar/Lunar Lam, Shaddah & Reading Flow",
        descriptionAr: "الارتقاء بالطلاقة القرائية عبر تمييز اللام الشمسية والقمرية ونطق الشدة وهمزة الوصل.",
        descriptionEn: "Advancing reading fluency by distinguishing the solar and lunar lam, and pronouncing shaddah and hamzat al-wasl.",
        weeklyObjectivesAr: [
          "تمييز اللام الشمسية واللام القمرية نطقاً وكتابة",
          "قراءة الكلمات المشددة بسلاسة ودون تقطع",
          "قراءة فقرة مشكولة من 30 كلمة بسرعة 40 كلمة في الدقيقة",
        ],
        weeklyObjectivesEn: [
          "Distinguishing the solar lam from the lunar lam in pronunciation and writing",
          "Reading shaddah (doubled) letters smoothly and without hesitation",
          "Reading a vocalized 30-word passage at a speed of 40 words per minute",
        ],
        titleNl: "Zonne- en Maans-lam, Shaddah en Leesvloeiendheid",
        titleTr: "Şemsî/Kamerî Lam, Şedde ve Okuma Akıcılığı",
        titleIt: "Lam Solare/Lunare, Shaddah e Scorrevolezza di Lettura",
        titleEs: "Lam Solar/Lunar, Shadda y Fluidez Lectora",
        descriptionNl: "Het verbeteren van leesvloeiendheid door onderscheid te maken tussen de zonne- en maans-lam, en het uitspreken van shaddah en hamzat al-wasl.",
        descriptionTr: "Şemsî ve kamerî lamı ayırt ederek ve şedde ile hemze-i vaslı doğru telaffuz ederek okuma akıcılığının geliştirilmesi.",
        descriptionIt: "Miglioramento della scorrevolezza di lettura distinguendo la lam solare dalla lam lunare, e pronunciando correttamente shaddah e hamzat al-wasl.",
        descriptionEs: "Avance de la fluidez lectora al distinguir la lam solar de la lam lunar, y pronunciar la shadda y la hamzat al-wasl.",
        weeklyObjectivesNl: [
          "Onderscheid maken tussen de zonne-lam en de maans-lam in uitspraak en schrift",
          "Letters met shaddah (verdubbeling) vloeiend en zonder aarzeling lezen",
          "Een tekst met klinkertekens van 30 woorden lezen met een snelheid van 40 woorden per minuut",
        ],
        weeklyObjectivesTr: [
          "Şemsî lam ile kamerî lamı telaffuzda ve yazıda ayırt etme",
          "Şeddeli (ikizleşmiş) harfleri akıcı ve duraksamadan okuma",
          "Harekeli 30 kelimelik bir metni dakikada 40 kelime hızıyla okuma",
        ],
        weeklyObjectivesIt: [
          "Distinguere la lam solare dalla lam lunare nella pronuncia e nella scrittura",
          "Leggere le lettere con shaddah (raddoppiate) in modo scorrevole e senza esitazione",
          "Leggere un brano vocalizzato di 30 parole a una velocità di 40 parole al minuto",
        ],
        weeklyObjectivesEs: [
          "Distinguir la lam solar de la lam lunar en la pronunciación y la escritura",
          "Leer letras con shadda (duplicadas) con fluidez y sin vacilar",
          "Leer un pasaje vocalizado de 30 palabras a una velocidad de 40 palabras por minuto",
        ],
        targetVocabularyCount: 150,
        durationWeeks: 6,
      },
      {
        id: "cur-2c",
        programId: "prog-reading",
        programTitleAr: "برنامج القراءة والطلاقة",
        programTitleEn: "Reading & Fluency Program",
        courseLevelCode: "B1",
        levelTitleAr: "المستوى الثالث (فهم المقروء والتذوق الأدبي)",
        targetAgeGroup: AgeGroup.AGE_11_13,
        cefrAlignment: "CEFR B1",
        titleAr: "فهم المقروء واستنتاج المعاني في القصص المصورة",
        titleEn: "Reading Comprehension & Literary Deduction",
        descriptionAr: "القراءة التحليلية للنصوص الأدبية وقصص الأطفال واستخلاص الدروس والقيم المستفادة.",
        descriptionEn: "Analytical reading of literary texts and children's stories, drawing out lessons and values.",
        weeklyObjectivesAr: [
          "القراءة المعبرة الممثلة للمعنى مع مراعاة علامات الوقف والترقيم",
          "استنتاج الفكرة الرئيسة والمغزى الأخلاقي للنص الأدبي",
          "الإجابة الشفوية والكتابية عن أسئلة الفهم القرائي الاستنتاجية",
        ],
        weeklyObjectivesEn: [
          "Expressive reading that conveys meaning while observing punctuation and pause marks",
          "Deducing the main idea and moral of a literary text",
          "Answering inferential reading-comprehension questions orally and in writing",
        ],
        titleNl: "Leesbegrip en Literaire Interpretatie",
        titleTr: "Okuduğunu Anlama ve Edebi Çıkarım",
        titleIt: "Comprensione della Lettura e Deduzione Letteraria",
        titleEs: "Comprensión Lectora y Deducción Literaria",
        descriptionNl: "Analytisch lezen van literaire teksten en kinderverhalen, met het afleiden van lessen en waarden.",
        descriptionTr: "Edebi metinlerin ve çocuk hikâyelerinin analitik olarak okunması, ders ve değerlerin çıkarılması.",
        descriptionIt: "Lettura analitica di testi letterari e storie per bambini, traendone insegnamenti e valori.",
        descriptionEs: "Lectura analítica de textos literarios y cuentos infantiles, extrayendo lecciones y valores.",
        weeklyObjectivesNl: [
          "Expressief lezen dat de betekenis overbrengt met inachtneming van leestekens en pauzetekens",
          "Het hoofdidee en de moraal van een literaire tekst afleiden",
          "Mondeling en schriftelijk antwoorden op interpreterende leesbegripvragen",
        ],
        weeklyObjectivesTr: [
          "Noktalama ve durak işaretlerine dikkat ederek anlamı yansıtan etkileyici okuma yapma",
          "Edebi bir metnin ana fikrini ve kıssasını çıkarma",
          "Çıkarımsal okuduğunu anlama sorularını sözlü ve yazılı olarak yanıtlama",
        ],
        weeklyObjectivesIt: [
          "Lettura espressiva che trasmette il significato rispettando la punteggiatura e i segni di pausa",
          "Dedurre l'idea principale e la morale di un testo letterario",
          "Rispondere oralmente e per iscritto a domande inferenziali di comprensione del testo",
        ],
        weeklyObjectivesEs: [
          "Lectura expresiva que transmite el significado respetando la puntuación y los signos de pausa",
          "Deducir la idea principal y la moraleja de un texto literario",
          "Responder oralmente y por escrito preguntas inferenciales de comprensión lectora",
        ],
        targetVocabularyCount: 200,
        durationWeeks: 8,
      },

      // --- Program 3: Writing & Penmanship (prog-writing) ---
      {
        id: "cur-3",
        programId: "prog-writing",
        programTitleAr: "برنامج الكتابة والخط العربي",
        programTitleEn: "Writing & Penmanship",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (قواعد خط النسخ والسطر)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A1",
        titleAr: "ضبط رسم الحروف على السطر ومسكة القلم",
        titleEn: "Baseline Stroke Mechanics & Pen Grip",
        descriptionAr: "تدريب الطالب على القواعد الهندسية لخط النسخ والحفاظ على استقرار الحروف على السطر.",
        descriptionEn: "Training the student in the geometric rules of Naskh script and maintaining stable letter placement on the baseline.",
        weeklyObjectivesAr: [
          "التمييز بين الحروف المستقرة على السطر والنازلة عنه",
          "مراعاة المسافات المتساوية بين الكلمات والحروف",
          "التدريب على زاوية مسك القلم السليمة وضبط حجم الحرف",
        ],
        weeklyObjectivesEn: [
          "Distinguishing between letters that sit on the baseline and those that descend below it",
          "Maintaining even spacing between words and letters",
          "Practicing correct pen-grip angle and consistent letter sizing",
        ],
        titleNl: "Basislijn-schrijftechniek en Pengreep",
        titleTr: "Satır Üzeri Çizgi Tekniği ve Kalem Tutuşu",
        titleIt: "Meccanica del Tratto sul Rigo e Impugnatura della Penna",
        titleEs: "Mecánica del Trazo en la Línea Base y Agarre del Lápiz",
        descriptionNl: "Het trainen van de leerling in de geometrische regels van het Naskh-schrift en het behouden van een stabiele letterplaatsing op de basislijn.",
        descriptionTr: "Öğrencinin Nesih hattının geometrik kurallarında eğitilmesi ve harflerin satır üzerinde dengeli yerleşiminin korunması.",
        descriptionIt: "Addestramento dello studente nelle regole geometriche della calligrafia Naskh e nel mantenimento di un posizionamento stabile delle lettere sul rigo.",
        descriptionEs: "Entrenamiento del estudiante en las reglas geométricas de la caligrafía Naskh y el mantenimiento de una colocación estable de las letras en la línea base.",
        weeklyObjectivesNl: [
          "Onderscheid maken tussen letters die op de basislijn staan en letters die eronder zakken",
          "Gelijkmatige spatiëring tussen woorden en letters aanhouden",
          "Oefenen met de juiste hoek van de pengreep en consistente lettergrootte",
        ],
        weeklyObjectivesTr: [
          "Satır üzerinde duran harfler ile altına inen harfleri ayırt etme",
          "Kelimeler ve harfler arasında eşit boşluk bırakma",
          "Doğru kalem tutuş açısı ve tutarlı harf boyutu üzerinde çalışma",
        ],
        weeklyObjectivesIt: [
          "Distinguere tra le lettere che poggiano sul rigo e quelle che scendono sotto di esso",
          "Mantenere una spaziatura uniforme tra parole e lettere",
          "Esercitarsi con la corretta angolazione dell'impugnatura della penna e una dimensione costante delle lettere",
        ],
        weeklyObjectivesEs: [
          "Distinguir entre las letras que se apoyan en la línea base y las que descienden por debajo de ella",
          "Mantener un espaciado uniforme entre palabras y letras",
          "Practicar el ángulo correcto de agarre del lápiz y un tamaño de letra constante",
        ],
        targetVocabularyCount: 90,
        durationWeeks: 4,
      },
      {
        id: "cur-3b",
        programId: "prog-writing",
        programTitleAr: "برنامج الكتابة والخط العربي",
        programTitleEn: "Writing & Penmanship",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (رواد الكتابة والتركيب)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A2",
        titleAr: "قواعد خط النسخ والتركيب الإنشائي",
        titleEn: "Naskh Penmanship & Sentence Composition",
        descriptionAr: "تحسين جودة رسم الحروف على السطر وكتابة فقرات قصيرة تعبر عن اهتمامات الطفل.",
        descriptionEn: "Improving the quality of letter formation on the baseline and writing short paragraphs expressing the child's own interests.",
        weeklyObjectivesAr: [
          "مراعاة الحروف المستقرة على السطر والنازلة عنه في الجمل المركبة",
          "كتابة جمل تشتمل على أدوات الربط (و، ثم، فـ) وعلامات الترقيم",
          "تأليف قصة قصيرة من 3 أسطر بالاستعانة بمشاهد مصورة",
        ],
        weeklyObjectivesEn: [
          "Maintaining baseline and descender letters correctly within compound sentences",
          "Writing sentences using connecting words (and, then, so) and punctuation marks",
          "Composing a 3-line short story with the help of picture prompts",
        ],
        titleNl: "Naskh-schrijfkunst en Zinsbouw",
        titleTr: "Nesih Yazısı ve Cümle Kurma",
        titleIt: "Calligrafia Naskh e Composizione di Frasi",
        titleEs: "Caligrafía Naskh y Composición de Oraciones",
        descriptionNl: "Het verbeteren van de kwaliteit van letterformatie op de basislijn en het schrijven van korte alinea's die de eigen interesses van het kind uitdrukken.",
        descriptionTr: "Satır üzerinde harf oluşumunun kalitesinin artırılması ve çocuğun kendi ilgi alanlarını ifade eden kısa paragraflar yazması.",
        descriptionIt: "Miglioramento della qualità della formazione delle lettere sul rigo e scrittura di brevi paragrafi che esprimono gli interessi personali del bambino.",
        descriptionEs: "Mejora de la calidad de la formación de letras en la línea base y redacción de párrafos cortos que expresan los propios intereses del niño.",
        weeklyObjectivesNl: [
          "Basislijn- en onderlijnletters correct aanhouden in samengestelde zinnen",
          "Zinnen schrijven met verbindingswoorden (en, dan, dus) en leestekens",
          "Een kort verhaal van 3 regels schrijven met behulp van afbeeldingsprompts",
        ],
        weeklyObjectivesTr: [
          "Bileşik cümlelerde satır üzeri ve alt uzantılı harfleri doğru şekilde koruma",
          "Bağlaçlar (ve, sonra, bu yüzden) ve noktalama işaretleri kullanarak cümle yazma",
          "Resim ipuçları yardımıyla 3 satırlık kısa bir hikâye yazma",
        ],
        weeklyObjectivesIt: [
          "Mantenere correttamente le lettere sul rigo e quelle discendenti all'interno di frasi composte",
          "Scrivere frasi usando congiunzioni (e, poi, quindi) e segni di punteggiatura",
          "Comporre una breve storia di 3 righe con l'aiuto di immagini stimolo",
        ],
        weeklyObjectivesEs: [
          "Mantener correctamente las letras en la línea base y las descendentes dentro de oraciones compuestas",
          "Escribir oraciones usando conectores (y, luego, así que) y signos de puntuación",
          "Componer un cuento corto de 3 líneas con la ayuda de imágenes de apoyo",
        ],
        targetVocabularyCount: 140,
        durationWeeks: 6,
      },
      {
        id: "cur-3c",
        programId: "prog-writing",
        programTitleAr: "برنامج الكتابة والخط العربي",
        programTitleEn: "Writing & Penmanship",
        courseLevelCode: "B1",
        levelTitleAr: "المستوى الثالث (التعبير الإنشائي والقصصي)",
        targetAgeGroup: AgeGroup.AGE_11_13,
        cefrAlignment: "CEFR B1",
        titleAr: "التعبير الكتابي وتأليف القصص والمقالات المصغرة",
        titleEn: "Creative Writing & Narrative Essay Composition",
        descriptionAr: "صياغة نصوص نثرية متكاملة تتضمن مقدمة وعقدة وخاتمة مع إثراء المعجم التعبيري.",
        descriptionEn: "Composing complete prose texts with an introduction, development, and conclusion, while enriching expressive vocabulary.",
        weeklyObjectivesAr: [
          "صياغة قصة خيالية أو واقعية مكتملة العناصر الفنية",
          "توظيف النعوت والأوصاف البلاغية لإثراء المشهد السردي",
          "مراجعة النص ذاتياً وتصحيح الأخطاء الإملائية والنحوية الشائعة",
        ],
        weeklyObjectivesEn: [
          "Composing a complete fictional or true story with well-formed narrative elements",
          "Using descriptive adjectives and rhetorical devices to enrich the narrative",
          "Self-reviewing a text and correcting common spelling and grammatical errors",
        ],
        titleNl: "Creatief Schrijven en Verhalend Essay",
        titleTr: "Yaratıcı Yazma ve Anlatı Denemesi Kompozisyonu",
        titleIt: "Scrittura Creativa e Composizione di Temi Narrativi",
        titleEs: "Escritura Creativa y Composición de Ensayos Narrativos",
        descriptionNl: "Het schrijven van volledige prozateksten met een inleiding, uitwerking en conclusie, terwijl de expressieve woordenschat wordt verrijkt.",
        descriptionTr: "Giriş, gelişme ve sonuç bölümlerinden oluşan eksiksiz düz yazı metinleri yazılması ve ifade dağarcığının zenginleştirilmesi.",
        descriptionIt: "Composizione di testi in prosa completi con introduzione, sviluppo e conclusione, arricchendo al contempo il vocabolario espressivo.",
        descriptionEs: "Composición de textos en prosa completos con introducción, desarrollo y conclusión, enriqueciendo el vocabulario expresivo.",
        weeklyObjectivesNl: [
          "Een volledig fictief of waargebeurd verhaal schrijven met goed gevormde verhaalelementen",
          "Beschrijvende bijvoeglijke naamwoorden en stijlmiddelen gebruiken om het verhaal te verrijken",
          "Een tekst zelfstandig nakijken en veelvoorkomende spel- en grammaticafouten corrigeren",
        ],
        weeklyObjectivesTr: [
          "İyi kurgulanmış anlatı öğeleriyle eksiksiz kurgusal veya gerçek bir hikâye yazma",
          "Anlatıyı zenginleştirmek için betimleyici sıfatlar ve retorik unsurlar kullanma",
          "Bir metni kendi kendine gözden geçirme ve yaygın yazım ile dilbilgisi hatalarını düzeltme",
        ],
        weeklyObjectivesIt: [
          "Comporre una storia completa, di fantasia o vera, con elementi narrativi ben strutturati",
          "Usare aggettivi descrittivi e figure retoriche per arricchire la narrazione",
          "Rivedere autonomamente un testo e correggere i comuni errori ortografici e grammaticali",
        ],
        weeklyObjectivesEs: [
          "Componer una historia completa, ficticia o real, con elementos narrativos bien estructurados",
          "Usar adjetivos descriptivos y recursos retóricos para enriquecer la narración",
          "Revisar un texto de forma autónoma y corregir errores comunes de ortografía y gramática",
        ],
        targetVocabularyCount: 180,
        durationWeeks: 6,
      },

      // --- Program 4: Speaking & Conversation (prog-speaking) ---
      {
        id: "cur-4",
        programId: "prog-speaking",
        programTitleAr: "برنامج المحادثة والنطق",
        programTitleEn: "Speaking & Conversation",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (المتحدث الصغير)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A1",
        titleAr: "التعارف والأسرة والأنشطة اليومية",
        titleEn: "Greetings, Family & Daily Routines",
        descriptionAr: "تدريب الطالب على الحوار التفاعلي باللغة العربية الفصحى البسيطة حول محيطه اليومي.",
        descriptionEn: "Training the student in interactive dialogue using simple Modern Standard Arabic about their daily surroundings.",
        weeklyObjectivesAr: [
          "تقديم النفس والحديث عن العمر والهوايات والأسرة",
          "إجراء حوار قصير مع المعلم والزملاء بالسؤال والجواب",
          "التعبير عن المشاعر والمواقف الحياتية بطلاقة وثقة",
        ],
        weeklyObjectivesEn: [
          "Introducing themselves and talking about age, hobbies, and family",
          "Holding a short question-and-answer dialogue with the teacher and classmates",
          "Expressing feelings and everyday situations fluently and confidently",
        ],
        titleNl: "Begroetingen, Familie en Dagelijkse Routines",
        titleTr: "Selamlaşma, Aile ve Günlük Rutinler",
        titleIt: "Saluti, Famiglia e Routine Quotidiane",
        titleEs: "Saludos, Familia y Rutinas Diarias",
        descriptionNl: "Het trainen van de leerling in interactieve dialoog met behulp van eenvoudig Modern Standaard Arabisch over zijn of haar dagelijkse omgeving.",
        descriptionTr: "Öğrencinin günlük çevresi hakkında basit Fasih Arapça kullanarak etkileşimli diyalog kurma konusunda eğitilmesi.",
        descriptionIt: "Addestramento dello studente al dialogo interattivo utilizzando un arabo standard moderno semplice riguardo al proprio ambiente quotidiano.",
        descriptionEs: "Entrenamiento del estudiante en el diálogo interactivo usando árabe estándar moderno sencillo sobre su entorno cotidiano.",
        weeklyObjectivesNl: [
          "Zichzelf voorstellen en praten over leeftijd, hobby's en familie",
          "Een korte vraag-en-antwoorddialoog voeren met de leraar en klasgenoten",
          "Gevoelens en alledaagse situaties vloeiend en zelfverzekerd uitdrukken",
        ],
        weeklyObjectivesTr: [
          "Kendini tanıtma ve yaş, hobiler ve aile hakkında konuşma",
          "Öğretmen ve sınıf arkadaşlarıyla kısa bir soru-cevap diyaloğu yapma",
          "Duyguları ve günlük durumları akıcı ve kendinden emin biçimde ifade etme",
        ],
        weeklyObjectivesIt: [
          "Presentarsi e parlare di età, hobby e famiglia",
          "Sostenere un breve dialogo di domande e risposte con l'insegnante e i compagni",
          "Esprimere sentimenti e situazioni quotidiane con scioltezza e sicurezza",
        ],
        weeklyObjectivesEs: [
          "Presentarse y hablar sobre la edad, los pasatiempos y la familia",
          "Mantener un breve diálogo de preguntas y respuestas con el maestro y los compañeros",
          "Expresar sentimientos y situaciones cotidianas con fluidez y confianza",
        ],
        targetVocabularyCount: 150,
        durationWeeks: 4,
      },
      {
        id: "cur-4b",
        programId: "prog-speaking",
        programTitleAr: "برنامج المحادثة والنطق",
        programTitleEn: "Speaking & Conversation",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (المواقف الحياتية والمحاكاة)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A2",
        titleAr: "الحوارات الحياتية: في المدرسة والسوق والرحلات",
        titleEn: "Situational Dialogues: School, Market & Travel",
        descriptionAr: "محاكاة مواقف واقعية باللغة الفصحى لتمكين الطالب من التحدث التلقائي دون تردد.",
        descriptionEn: "Simulating real-life situations in Modern Standard Arabic to enable the student to speak spontaneously and without hesitation.",
        weeklyObjectivesAr: [
          "إدارة حوار مكتمل في المتجر وطلب السلع والاستفسار عن الأسعار",
          "وصف معالم رحلة أو نزهة والتعبير عما شاهده الطالب",
          "استخدام أساليب الاستفهام والتعجب والنهي بطلاقة في الحديث",
        ],
        weeklyObjectivesEn: [
          "Conducting a complete dialogue in a shop, ordering items, and asking about prices",
          "Describing the sights of a trip or outing and expressing what was observed",
          "Using question, exclamation, and prohibition forms fluently in conversation",
        ],
        titleNl: "Situationele Dialogen: School, Markt en Reizen",
        titleTr: "Durumsal Diyaloglar: Okul, Pazar ve Seyahat",
        titleIt: "Dialoghi Situazionali: Scuola, Mercato e Viaggi",
        titleEs: "Diálogos Situacionales: Escuela, Mercado y Viajes",
        descriptionNl: "Het naspelen van realistische situaties in Modern Standaard Arabisch, zodat de leerling spontaan en zonder aarzelen leert spreken.",
        descriptionTr: "Öğrencinin duraksamadan ve kendiliğinden konuşabilmesini sağlamak için Fasih Arapça ile gerçek hayattaki durumların canlandırılması.",
        descriptionIt: "Simulazione di situazioni di vita reale in arabo standard moderno per permettere allo studente di parlare spontaneamente e senza esitazione.",
        descriptionEs: "Simulación de situaciones de la vida real en árabe estándar moderno para que el estudiante hable de forma espontánea y sin dudar.",
        weeklyObjectivesNl: [
          "Een volledige dialoog in een winkel voeren, artikelen bestellen en naar prijzen vragen",
          "De bezienswaardigheden van een reis of uitstapje beschrijven en uitdrukken wat er is waargenomen",
          "Vraag-, uitroep- en verbodsvormen vloeiend gebruiken in een gesprek",
        ],
        weeklyObjectivesTr: [
          "Bir mağazada eksiksiz bir diyalog kurma, ürün sipariş etme ve fiyat sorma",
          "Bir gezinin veya seyahatin manzaralarını betimleme ve gözlemlenenleri ifade etme",
          "Konuşmada soru, ünlem ve yasaklama kiplerini akıcı biçimde kullanma",
        ],
        weeklyObjectivesIt: [
          "Condurre un dialogo completo in un negozio, ordinare articoli e chiedere i prezzi",
          "Descrivere i luoghi visitati durante un viaggio o una gita ed esprimere ciò che è stato osservato",
          "Usare con scioltezza le forme interrogative, esclamative e di divieto nella conversazione",
        ],
        weeklyObjectivesEs: [
          "Mantener un diálogo completo en una tienda, pedir artículos y preguntar precios",
          "Describir los lugares vistos durante un viaje o paseo y expresar lo observado",
          "Usar con fluidez las formas interrogativas, exclamativas y de prohibición en la conversación",
        ],
        targetVocabularyCount: 190,
        durationWeeks: 6,
      },
      {
        id: "cur-4c",
        programId: "prog-speaking",
        programTitleAr: "برنامج المحادثة والنطق",
        programTitleEn: "Speaking & Conversation",
        courseLevelCode: "B1",
        levelTitleAr: "المستوى الثالث (فنون الخطابة والمناظرة)",
        targetAgeGroup: AgeGroup.AGE_11_13,
        cefrAlignment: "CEFR B1",
        titleAr: "العرض والتقديم والتعبير عن الرأي والمناظرات",
        titleEn: "Public Speaking, Debates & Reasoned Discourse",
        descriptionAr: "تنمية مهارات الإلقاء الخطابي والمناظرة الودية والتعبير عن الآراء بأسلوب مقنع.",
        descriptionEn: "Developing public-speaking and friendly-debate skills, and expressing opinions persuasively.",
        weeklyObjectivesAr: [
          "إلقاء كلمة قصيرة لمدة دقيقتين أمام الفصل بثقة تامة",
          "المشاركة في مناظرة طلابية مع إيراد الحجج والبراهين بأدب",
          "استخدام نبرات الصوت المناسبة للمواقف والتعبير الجسدي الملائم",
        ],
        weeklyObjectivesEn: [
          "Delivering a confident two-minute talk in front of the class",
          "Participating in a student debate, presenting arguments and evidence courteously",
          "Using appropriate tone of voice and body language for different situations",
        ],
        titleNl: "Spreken in het Openbaar, Debatteren en Beargumenteren",
        titleTr: "Topluluk Önünde Konuşma, Münazara ve Gerekçeli Söylem",
        titleIt: "Parlare in Pubblico, Dibattiti e Discorso Argomentato",
        titleEs: "Oratoria, Debates y Discurso Razonado",
        descriptionNl: "Het ontwikkelen van spreekvaardigheid in het openbaar en vriendschappelijke debatvaardigheden, en het overtuigend uiten van meningen.",
        descriptionTr: "Topluluk önünde konuşma ve dostane münazara becerilerinin geliştirilmesi ve görüşlerin ikna edici biçimde ifade edilmesi.",
        descriptionIt: "Sviluppo delle competenze di public speaking e di dibattito amichevole, ed espressione persuasiva delle proprie opinioni.",
        descriptionEs: "Desarrollo de habilidades de oratoria y debate amistoso, y expresión persuasiva de opiniones.",
        weeklyObjectivesNl: [
          "Een zelfverzekerde presentatie van twee minuten houden voor de klas",
          "Deelnemen aan een leerlingendebat, waarbij argumenten en bewijs beleefd worden gepresenteerd",
          "De juiste toon en lichaamstaal gebruiken voor verschillende situaties",
        ],
        weeklyObjectivesTr: [
          "Sınıf önünde kendinden emin iki dakikalık bir konuşma yapma",
          "Bir öğrenci münazarasına katılarak argüman ve kanıtları nazik biçimde sunma",
          "Farklı durumlar için uygun ses tonu ve beden dilini kullanma",
        ],
        weeklyObjectivesIt: [
          "Tenere un discorso sicuro di due minuti davanti alla classe",
          "Partecipare a un dibattito studentesco, presentando argomentazioni e prove con cortesia",
          "Usare il tono di voce e il linguaggio del corpo appropriati per le diverse situazioni",
        ],
        weeklyObjectivesEs: [
          "Dar una charla de dos minutos con confianza frente a la clase",
          "Participar en un debate estudiantil, presentando argumentos y pruebas con cortesía",
          "Usar el tono de voz y el lenguaje corporal apropiados para diferentes situaciones",
        ],
        targetVocabularyCount: 220,
        durationWeeks: 6,
      },

      // --- Program 5: Listening & Comprehension (prog-listening) ---
      {
        id: "cur-5",
        programId: "prog-listening",
        programTitleAr: "برنامج الاستماع والفهم",
        programTitleEn: "Listening & Comprehension",
        courseLevelCode: "PRE_A1",
        levelTitleAr: "المستوى التمهيدي (أذن واعية)",
        targetAgeGroup: AgeGroup.AGE_4_6,
        cefrAlignment: "CEFR Pre-A1",
        titleAr: "الاستماع للقصص الصوتية وتمييز الأصوات",
        titleEn: "Story Listening & Phonemic Discrimination",
        descriptionAr: "تنمية حاسة الاستماع وتمييز مخارج الحروف المتشابهة من خلال حكايات مصورة ومسموعة.",
        descriptionEn: "Developing listening skills and distinguishing similar letter sounds through illustrated audio stories.",
        weeklyObjectivesAr: [
          "التمييز السمعي بين الأصوات المتقاربة (س/ص، ت/ط، د/ض)",
          "استخلاص الفكرة الرئيسة من قصة مسموعة لا تتجاوز دقيقتين",
          "الإجابة الشفوية عن أسئلة الفهم الاستماعي المباشرة",
        ],
        weeklyObjectivesEn: [
          "Auditory discrimination between similar sounds (s/ṣ, t/ṭ, d/ḍ)",
          "Extracting the main idea from an audio story no longer than two minutes",
          "Answering direct listening-comprehension questions orally",
        ],
        titleNl: "Luisteren naar Verhalen en Klankonderscheid",
        titleTr: "Hikâye Dinleme ve Ses Ayrımı",
        titleIt: "Ascolto di Storie e Discriminazione Fonemica",
        titleEs: "Escucha de Cuentos y Discriminación Fonémica",
        descriptionNl: "Het ontwikkelen van luistervaardigheden en het onderscheiden van vergelijkbare letterklanken via geïllustreerde audioverhalen.",
        descriptionTr: "Resimli sesli hikâyeler aracılığıyla dinleme becerilerinin geliştirilmesi ve benzer harf seslerinin ayırt edilmesi.",
        descriptionIt: "Sviluppo delle capacità di ascolto e distinzione di suoni di lettere simili attraverso storie audio illustrate.",
        descriptionEs: "Desarrollo de habilidades de escucha y distinción de sonidos de letras similares a través de cuentos en audio ilustrados.",
        weeklyObjectivesNl: [
          "Auditief onderscheid maken tussen vergelijkbare klanken (s/ṣ, t/ṭ, d/ḍ)",
          "Het hoofdidee halen uit een audioverhaal van maximaal twee minuten",
          "Mondeling antwoorden op directe luisterbegripvragen",
        ],
        weeklyObjectivesTr: [
          "Benzer sesler arasında işitsel ayrım yapma (s/ṣ, t/ṭ, d/ḍ)",
          "En fazla iki dakikalık bir sesli hikâyeden ana fikri çıkarma",
          "Doğrudan dinlediğini anlama sorularını sözlü olarak yanıtlama",
        ],
        weeklyObjectivesIt: [
          "Discriminazione uditiva tra suoni simili (s/ṣ, t/ṭ, d/ḍ)",
          "Individuare l'idea principale di una storia audio non più lunga di due minuti",
          "Rispondere oralmente a domande dirette di comprensione all'ascolto",
        ],
        weeklyObjectivesEs: [
          "Discriminación auditiva entre sonidos similares (s/ṣ, t/ṭ, d/ḍ)",
          "Extraer la idea principal de un cuento en audio de no más de dos minutos",
          "Responder oralmente preguntas directas de comprensión auditiva",
        ],
        targetVocabularyCount: 80,
        durationWeeks: 4,
      },
      {
        id: "cur-5b",
        programId: "prog-listening",
        programTitleAr: "برنامج الاستماع والفهم",
        programTitleEn: "Listening & Comprehension",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (تتبع التوجيهات والاستيعاب)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A1",
        titleAr: "الاستماع للقصص وتتبع التعليمات المركبة",
        titleEn: "Narrative Listening & Following Multi-Step Instructions",
        descriptionAr: "تدريب الطالب على التركيز السمعي واستيعاب الأوامر التعليمية المتتابعة بدقة.",
        descriptionEn: "Training the student in auditory focus and accurately following sequential instructions.",
        weeklyObjectivesAr: [
          "تنفيذ سلسلة تعليمات مسموعة مكونة من 3 خطوات متتابعة",
          "تحديد تسلسل أحداث الحكاية المسموعة من البداية إلى النهاية",
          "التعرف على انفعالات المتحدثين من خلال نبرة الصوت المسموعة",
        ],
        weeklyObjectivesEn: [
          "Carrying out a sequence of 3 consecutive spoken instructions",
          "Identifying the order of events in a story from beginning to end",
          "Recognizing speakers' emotions through their tone of voice",
        ],
        titleNl: "Verhalend Luisteren en Meerstaps-instructies Volgen",
        titleTr: "Anlatı Dinleme ve Çok Adımlı Talimatları Takip Etme",
        titleIt: "Ascolto Narrativo e Comprensione di Istruzioni Multiple",
        titleEs: "Escucha Narrativa y Seguimiento de Instrucciones de Varios Pasos",
        descriptionNl: "Het trainen van de leerling in auditieve focus en het nauwkeurig opvolgen van opeenvolgende instructies.",
        descriptionTr: "Öğrencinin işitsel odaklanma konusunda eğitilmesi ve sıralı talimatları doğru biçimde takip etmesi.",
        descriptionIt: "Addestramento dello studente alla concentrazione uditiva e al corretto seguimento di istruzioni sequenziali.",
        descriptionEs: "Entrenamiento del estudiante en la concentración auditiva y el seguimiento preciso de instrucciones secuenciales.",
        weeklyObjectivesNl: [
          "Een reeks van 3 opeenvolgende gesproken instructies uitvoeren",
          "De volgorde van gebeurtenissen in een verhaal van begin tot eind bepalen",
          "De emoties van sprekers herkennen aan hun stemtoon",
        ],
        weeklyObjectivesTr: [
          "3 ardışık sözlü talimattan oluşan bir diziyi yerine getirme",
          "Bir hikâyedeki olayların baştan sona sırasını belirleme",
          "Konuşmacıların duygularını ses tonlarından tanıma",
        ],
        weeklyObjectivesIt: [
          "Eseguire una sequenza di 3 istruzioni verbali consecutive",
          "Identificare l'ordine degli eventi in una storia dall'inizio alla fine",
          "Riconoscere le emozioni di chi parla attraverso il tono della voce",
        ],
        weeklyObjectivesEs: [
          "Llevar a cabo una secuencia de 3 instrucciones habladas consecutivas",
          "Identificar el orden de los eventos en un cuento de principio a fin",
          "Reconocer las emociones de los hablantes a través del tono de voz",
        ],
        targetVocabularyCount: 130,
        durationWeeks: 6,
      },
      {
        id: "cur-5c",
        programId: "prog-listening",
        programTitleAr: "برنامج الاستماع والفهم",
        programTitleEn: "Listening & Comprehension",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (التحليل السمعي والتلخيص)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "CEFR A2",
        titleAr: "التحليل السمعي وتلخيص الأفكار والحوارات",
        titleEn: "Auditory Analysis & Spoken Dialogue Summaries",
        descriptionAr: "الاستماع لنصوص وثائقية وحوارات مسجلة وإعادة تلخيصها بأسلوب الطالب الخاص.",
        descriptionEn: "Listening to documentary texts and recorded dialogues and summarizing them in the student's own words.",
        weeklyObjectivesAr: [
          "استخلاص الحقائق والأرقام والمعلومات الواردة في مقطع صوتي",
          "إعادة سرد قصة مسموعة في 3 جمل محكمة بأسلوب الطالب الخاص",
          "إبداء الرأي ونقد سلوك شخصيات الحوار المسموع بموضوعية",
        ],
        weeklyObjectivesEn: [
          "Extracting facts, figures, and information from an audio clip",
          "Retelling a heard story in 3 well-formed sentences in the student's own style",
          "Objectively expressing an opinion and critiquing the behavior of dialogue characters",
        ],
        titleNl: "Auditieve Analyse en Samenvattingen van Gesproken Dialogen",
        titleTr: "İşitsel Analiz ve Sözlü Diyalog Özetleri",
        titleIt: "Analisi all'Ascolto e Riassunti di Dialoghi Parlati",
        titleEs: "Análisis Auditivo y Resúmenes de Diálogos Hablados",
        descriptionNl: "Luisteren naar documentaire teksten en opgenomen dialogen en deze samenvatten in de eigen woorden van de leerling.",
        descriptionTr: "Belgesel metinlerin ve kaydedilmiş diyalogların dinlenmesi ve öğrencinin kendi kelimeleriyle özetlenmesi.",
        descriptionIt: "Ascolto di testi documentari e dialoghi registrati e loro riassunto con le parole proprie dello studente.",
        descriptionEs: "Escucha de textos documentales y diálogos grabados y su resumen con las propias palabras del estudiante.",
        weeklyObjectivesNl: [
          "Feiten, cijfers en informatie uit een audiofragment halen",
          "Een gehoord verhaal navertellen in 3 goed gevormde zinnen in de eigen stijl van de leerling",
          "Objectief een mening uiten en het gedrag van personages in de dialoog beoordelen",
        ],
        weeklyObjectivesTr: [
          "Bir ses kaydından gerçekleri, rakamları ve bilgileri çıkarma",
          "Duyulan bir hikâyeyi öğrencinin kendi üslubuyla 3 iyi kurulmuş cümlede yeniden anlatma",
          "Nesnel biçimde görüş bildirme ve diyalog karakterlerinin davranışlarını eleştirme",
        ],
        weeklyObjectivesIt: [
          "Estrarre fatti, dati e informazioni da una clip audio",
          "Riraccontare una storia ascoltata in 3 frasi ben formate nello stile personale dello studente",
          "Esprimere obiettivamente un'opinione e valutare criticamente il comportamento dei personaggi del dialogo",
        ],
        weeklyObjectivesEs: [
          "Extraer hechos, cifras e información de un clip de audio",
          "Recontar una historia escuchada en 3 oraciones bien formadas con el estilo propio del estudiante",
          "Expresar una opinión de forma objetiva y evaluar críticamente el comportamiento de los personajes del diálogo",
        ],
        targetVocabularyCount: 170,
        durationWeeks: 6,
      },

      // --- Program 6: Quran Reading & Tajweed (prog-quran) ---
      {
        id: "cur-6",
        programId: "prog-quran",
        programTitleAr: "برنامج القرآن الكريم والتجويد",
        programTitleEn: "Quran & Tajweed",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (نجوم التلاوة)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "Applied Tajweed Level 1",
        titleAr: "حفظ قصار السور وأحكام النون الساكنة والقلقلة",
        titleEn: "Short Surahs, Noon Sakinah & Qalqalah",
        descriptionAr: "حفظ وتثبيت جزء عم مع التطبيق العملي لمخارج الحروف وأحكام الإظهار والإدغام والقلقلة.",
        descriptionEn: "Memorizing and consolidating Juz Amma with practical application of correct articulation points and the rules of idhar, idgham, and qalqalah.",
        weeklyObjectivesAr: [
          "حفظ السور من سورة الناس إلى سورة العاديات متقنة",
          "تطبيق حكم القلقلة في حروف (قطب جد) عند الوقف والوصل",
          "تطبيق أحكام النون الساكنة والتنوين (الإظهار الحلقي)",
        ],
        weeklyObjectivesEn: [
          "Mastering memorization of the surahs from An-Nas to Al-Adiyat",
          "Applying the rule of qalqalah on its designated letters when pausing and continuing",
          "Applying the rules of noon sakinah and tanween (idhar halqi)",
        ],
        titleNl: "Korte Soera's, Noen Sakina en Qalqalah",
        titleTr: "Kısa Sureler, Nun-i Sakine ve Kalkale",
        titleIt: "Sure Brevi, Noon Sakinah e Qalqalah",
        titleEs: "Suras Cortas, Nun Sakina y Qalqalah",
        descriptionNl: "Het memoriseren en verankeren van Djoez Amma met praktische toepassing van correcte articulatiepunten en de regels van idhar, idgham en qalqalah.",
        descriptionTr: "Doğru mahreçlerin pratik uygulanması ve izhar, idgam ve kalkale kurallarıyla Amme Cüzü'nün ezberlenmesi ve pekiştirilmesi.",
        descriptionIt: "Memorizzazione e consolidamento del Juz Amma con applicazione pratica dei corretti punti di articolazione e delle regole di idhar, idgham e qalqalah.",
        descriptionEs: "Memorización y consolidación del Yuz Amma con aplicación práctica de los puntos de articulación correctos y las reglas de idhar, idgham y qalqalah.",
        weeklyObjectivesNl: [
          "Het perfect memoriseren van de soera's van An-Nas tot Al-Adiyat",
          "De regel van qalqalah toepassen op de aangewezen letters bij pauzeren en doorgaan",
          "De regels van noen sakina en tanwien toepassen (idhar halqi)",
        ],
        weeklyObjectivesTr: [
          "Nâs Suresi'nden Âdiyât Suresi'ne kadar olan surelerin ezberinde ustalaşma",
          "Durma ve devam etme sırasında kalkale harflerinde kalkale kuralını uygulama",
          "Nun-i sakine ve tenvin kurallarını (izhar-ı halkî) uygulama",
        ],
        weeklyObjectivesIt: [
          "Padroneggiare la memorizzazione delle sure da An-Nas ad Al-Adiyat",
          "Applicare la regola del qalqalah sulle sue lettere designate durante la pausa e la continuazione",
          "Applicare le regole del noon sakinah e del tanwin (idhar halqi)",
        ],
        weeklyObjectivesEs: [
          "Dominar la memorización de las suras desde An-Nas hasta Al-Adiyat",
          "Aplicar la regla del qalqalah en sus letras designadas al pausar y continuar",
          "Aplicar las reglas de la nun sakina y el tanwin (idhar halqi)",
        ],
        targetVocabularyCount: 100,
        durationWeeks: 8,
      },
      {
        id: "cur-6b",
        programId: "prog-quran",
        programTitleAr: "برنامج القرآن الكريم والتجويد",
        programTitleEn: "Quran & Tajweed",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (أحكام النون والتنوين التامة)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "Applied Tajweed Level 2",
        titleAr: "أحكام النون الساكنة والتنوين (الإدغام والإقلاب والإخفاء)",
        titleEn: "Noon Sakinah Rules: Idgham, Iqlab & Ikhfa",
        descriptionAr: "إتقان الأحكام الأربعة للنون الساكنة والتنوين وتطبيق الغنة بمقدار حركتين في التلاوة.",
        descriptionEn: "Mastering the four rules of noon sakinah and tanween, and applying ghunnah for a duration of two counts during recitation.",
        weeklyObjectivesAr: [
          "تطبيق الإدغام بقسميه (بغنة في حروف ينمو، وبغير غنة في ل، ر)",
          "تطبيق حكم الإقلاب مع الميم الصغيرة والإخفاء الحقيقي في 15 حرفاً",
          "حفظ وتثبيت السور من سورة القارعة إلى سورة النبأ بأحكامها",
        ],
        weeklyObjectivesEn: [
          "Applying both types of idgham (with ghunnah for the designated letters, and without for l and r)",
          "Applying the rule of iqlab with the small meem, and true ikhfa across its 15 letters",
          "Memorizing and consolidating the surahs from Al-Qari'ah to An-Naba with their rules",
        ],
        titleNl: "Regels van Noen Sakina: Idgham, Iqlab en Ikhfa",
        titleTr: "Nun-i Sakine Kuralları: İdgam, İklab ve İhfa",
        titleIt: "Regole del Noon Sakinah: Idgham, Iqlab e Ikhfa",
        titleEs: "Reglas de la Nun Sakina: Idgham, Iqlab e Ijfa",
        descriptionNl: "Het beheersen van de vier regels van noen sakina en tanwien, en het toepassen van ghunnah gedurende twee tellen tijdens de recitatie.",
        descriptionTr: "Nun-i sakine ve tenvinin dört kuralında ustalaşma ve tilavet sırasında iki elif miktarı gunne uygulama.",
        descriptionIt: "Padronanza delle quattro regole del noon sakinah e del tanwin, e applicazione della ghunnah per la durata di due tempi durante la recitazione.",
        descriptionEs: "Dominio de las cuatro reglas de la nun sakina y el tanwin, y aplicación de la gunna durante dos tiempos en la recitación.",
        weeklyObjectivesNl: [
          "Beide soorten idgham toepassen (met ghunnah voor de aangewezen letters, en zonder voor l en r)",
          "De regel van iqlab toepassen met de kleine miem, en echte ikhfa over de 15 bijbehorende letters",
          "De soera's van Al-Qari'ah tot An-Naba memoriseren en verankeren met hun regels",
        ],
        weeklyObjectivesTr: [
          "İdgamın her iki türünü uygulama (belirlenen harflerde gunneli, l ve r'de gunnesiz)",
          "Küçük mim ile iklab kuralını ve 15 harfte gerçek ihfayı uygulama",
          "Kâria Suresi'nden Nebe Suresi'ne kadar olan sureleri kurallarıyla ezberleme ve pekiştirme",
        ],
        weeklyObjectivesIt: [
          "Applicare entrambi i tipi di idgham (con ghunnah per le lettere designate, e senza per l e r)",
          "Applicare la regola dell'iqlab con la meem piccola, e l'ikhfa vero sulle sue 15 lettere",
          "Memorizzare e consolidare le sure da Al-Qari'ah ad An-Naba con le loro regole",
        ],
        weeklyObjectivesEs: [
          "Aplicar ambos tipos de idgham (con gunna para las letras designadas, y sin ella para l y r)",
          "Aplicar la regla del iqlab con la mim pequeña, y el ijfa verdadero en sus 15 letras",
          "Memorizar y consolidar las suras desde Al-Qari'ah hasta An-Naba con sus reglas",
        ],
        targetVocabularyCount: 130,
        durationWeeks: 8,
      },
      {
        id: "cur-6c",
        programId: "prog-quran",
        programTitleAr: "برنامج القرآن الكريم والتجويد",
        programTitleEn: "Quran & Tajweed",
        courseLevelCode: "B1",
        levelTitleAr: "المستوى الثالث (أحكام الميم والمدود والإتقان)",
        targetAgeGroup: AgeGroup.AGE_11_13,
        cefrAlignment: "Applied Tajweed Level 3",
        titleAr: "أحكام الميم الساكنة وأنواع المدود وتثبيت جزء عم",
        titleEn: "Meem Sakinah, Madd Varieties & Full Juz Amma Mastery",
        descriptionAr: "دراسة أحكام الميم الساكنة وضبط مقادير المدود المتصلة والمنفصلة واللازمة وحفظ جزء عم كاملاً.",
        descriptionEn: "Studying the rules of meem sakinah, mastering the durations of connected, separate, and obligatory madd, and fully memorizing Juz Amma.",
        weeklyObjectivesAr: [
          "تطبيق أحكام الميم الساكنة الثلاثة (الإخفاء والإدغام والإظهار الشفوي)",
          "تمييز مقادير المدود وضبط المد الطبيعي حركتين والفرعي 4-5 حركات",
          "سرد سورة كاملة غيباً أمام المعلم مع مراعاة علامات الوقف والابتداء",
        ],
        weeklyObjectivesEn: [
          "Applying the three rules of meem sakinah (ikhfa shafawi, idgham, and idhar shafawi)",
          "Distinguishing madd durations and applying natural madd (2 counts) and secondary madd (4-5 counts)",
          "Reciting a complete surah from memory in front of the teacher, observing pause and start points",
        ],
        titleNl: "Miem Sakina, Madd-varianten en Volledige Beheersing van Djoez Amma",
        titleTr: "Mim-i Sakine, Med Çeşitleri ve Amme Cüzü'nde Tam Ustalık",
        titleIt: "Meem Sakinah, Varietà di Madd e Piena Padronanza del Juz Amma",
        titleEs: "Mim Sakina, Variedades de Madd y Dominio Completo del Yuz Amma",
        descriptionNl: "Het bestuderen van de regels van miem sakina, het beheersen van de duur van verbonden, gescheiden en verplichte madd, en het volledig memoriseren van Djoez Amma.",
        descriptionTr: "Mim-i sakine kurallarının incelenmesi, muttasıl, munfasıl ve lazım med sürelerinde ustalaşılması ve Amme Cüzü'nün tamamen ezberlenmesi.",
        descriptionIt: "Studio delle regole del meem sakinah, padronanza delle durate del madd connesso, separato e obbligatorio, e memorizzazione completa del Juz Amma.",
        descriptionEs: "Estudio de las reglas de la mim sakina, dominio de las duraciones del madd conectado, separado y obligatorio, y memorización completa del Yuz Amma.",
        weeklyObjectivesNl: [
          "De drie regels van miem sakina toepassen (ikhfa shafawi, idgham en idhar shafawi)",
          "Madd-duur onderscheiden en natuurlijke madd (2 tellen) en secundaire madd (4-5 tellen) toepassen",
          "Een volledige soera uit het hoofd reciteren voor de leraar, met inachtneming van pauze- en startpunten",
        ],
        weeklyObjectivesTr: [
          "Mim-i sakinenin üç kuralını uygulama (ihfa-i şefevi, idgam ve izhar-ı şefevi)",
          "Med sürelerini ayırt etme ve tabii med (2 elif) ile fer'i med (4-5 elif) uygulama",
          "Öğretmenin önünde ezbere tam bir sureyi, durak ve başlangıç noktalarına dikkat ederek okuma",
        ],
        weeklyObjectivesIt: [
          "Applicare le tre regole del meem sakinah (ikhfa shafawi, idgham e idhar shafawi)",
          "Distinguere le durate del madd e applicare il madd naturale (2 tempi) e il madd secondario (4-5 tempi)",
          "Recitare una sura completa a memoria davanti all'insegnante, rispettando i punti di pausa e di inizio",
        ],
        weeklyObjectivesEs: [
          "Aplicar las tres reglas de la mim sakina (ijfa shafawi, idgham e idhar shafawi)",
          "Distinguir las duraciones del madd y aplicar el madd natural (2 tiempos) y el madd secundario (4-5 tiempos)",
          "Recitar una sura completa de memoria frente al maestro, respetando los puntos de pausa e inicio",
        ],
        targetVocabularyCount: 160,
        durationWeeks: 8,
      },

      // --- Program 7: Islamic Studies & Values (prog-islamic) ---
      {
        id: "cur-7",
        programId: "prog-islamic",
        programTitleAr: "برنامج الدراسات والقيم الإسلامية",
        programTitleEn: "Islamic Studies",
        courseLevelCode: "A1",
        levelTitleAr: "المستوى الأول (قيم وأخلاق)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "Islamic Values Foundation",
        titleAr: "أركان الإسلام وسيرة نبينا محمد ﷺ",
        titleEn: "Pillars of Islam & Seerah of Prophet Muhammad (PBUH)",
        descriptionAr: "غرس محبة النبي ﷺ وتطبيق الآداب الإسلامية اليومية (بر الوالدين، الأمانة، الصدق).",
        descriptionEn: "Instilling love for the Prophet ﷺ and applying daily Islamic manners (honoring parents, honesty, truthfulness).",
        weeklyObjectivesAr: [
          "شرح أركان الإسلام الخمسة بأسلوب مبسط وتطبيق صفة الوضوء والصلاة",
          "معرفة المحطات البارزة في طفولة وشباب النبي ﷺ وأخلاقه الكريمة",
          "تطبيق أذكار الصباح والمساء وآداب الطعام والنوم في الحياة اليومية",
        ],
        weeklyObjectivesEn: [
          "Explaining the five pillars of Islam simply and practicing the description of wudu and prayer",
          "Learning the notable milestones of the Prophet's ﷺ childhood and youth and his noble character",
          "Applying the morning and evening remembrances and etiquette of eating and sleeping in daily life",
        ],
        titleNl: "Zuilen van de Islam en de Seerah van Profeet Mohammed ﷺ",
        titleTr: "İslam'ın Şartları ve Peygamberimiz Muhammed'in ﷺ Siyeri",
        titleIt: "Pilastri dell'Islam e Sira del Profeta Muhammad (pace su di lui)",
        titleEs: "Pilares del Islam y Sira del Profeta Muhammad (la paz sea con él)",
        descriptionNl: "Het aankweken van liefde voor de Profeet ﷺ en het toepassen van dagelijkse islamitische omgangsvormen (ouders eren, eerlijkheid, waarachtigheid).",
        descriptionTr: "Peygamber ﷺ sevgisinin aşılanması ve günlük İslami adabın (ana-babaya iyilik, emanet, doğruluk) uygulanması.",
        descriptionIt: "Instillare l'amore per il Profeta ﷺ e applicare le buone maniere islamiche quotidiane (onorare i genitori, l'onestà, la sincerità).",
        descriptionEs: "Inculcar el amor por el Profeta ﷺ y aplicar los buenos modales islámicos diarios (honrar a los padres, la honestidad, la veracidad).",
        weeklyObjectivesNl: [
          "De vijf zuilen van de islam op eenvoudige wijze uitleggen en de beschrijving van wudu en het gebed oefenen",
          "De belangrijke mijlpalen uit de kindertijd en jeugd van de Profeet ﷺ en zijn nobele karakter leren kennen",
          "De ochtend- en avondsmeekbeden en de etiquette van eten en slapen toepassen in het dagelijks leven",
        ],
        weeklyObjectivesTr: [
          "İslam'ın beş şartını sade biçimde açıklama ve abdest ile namazın tarifini uygulamalı öğrenme",
          "Peygamberimizin ﷺ çocukluk ve gençlik dönemindeki önemli olayları ve yüce ahlakını öğrenme",
          "Sabah-akşam zikirlerini ve yeme-uyuma adabını günlük hayatta uygulama",
        ],
        weeklyObjectivesIt: [
          "Spiegare in modo semplice i cinque pilastri dell'Islam e praticare la descrizione dell'abluzione (wudu) e della preghiera",
          "Conoscere le tappe salienti dell'infanzia e della giovinezza del Profeta ﷺ e il suo nobile carattere",
          "Applicare i ricordi del mattino e della sera e le buone maniere nel mangiare e dormire nella vita quotidiana",
        ],
        weeklyObjectivesEs: [
          "Explicar de forma sencilla los cinco pilares del Islam y practicar la descripción del wudu y la oración",
          "Conocer los hitos destacados de la infancia y juventud del Profeta ﷺ y su noble carácter",
          "Aplicar las súplicas de la mañana y la tarde y la etiqueta de comer y dormir en la vida diaria",
        ],
        targetVocabularyCount: 90,
        durationWeeks: 6,
      },
      {
        id: "cur-7b",
        programId: "prog-islamic",
        programTitleAr: "برنامج الدراسات والقيم الإسلامية",
        programTitleEn: "Islamic Studies",
        courseLevelCode: "A2",
        levelTitleAr: "المستوى الثاني (الآداب النبوية والمعاملات)",
        targetAgeGroup: AgeGroup.AGE_7_10,
        cefrAlignment: "Islamic Adab Level 2",
        titleAr: "آداب التعامل اليومي: الصدق، بر الوالدين، وإكرام الجار",
        titleEn: "Daily Islamic Adab: Honesty, Filial Piety & Neighborliness",
        descriptionAr: "تطبيق القيم الإسلامية في المجتمع المدرسي والأسري ومواجهة المواقف المعاصرة بالأخلاق النبوية.",
        descriptionEn: "Applying Islamic values within school and family life and facing contemporary situations with prophetic character.",
        weeklyObjectivesAr: [
          "تطبيق خلق الصدق والأمانة في المعاملات المدرسية واليومية",
          "فهم أهمية صلة الرحم وإكرام الجار والرفق بالحيوان",
          "حفظ وفهم 5 أحاديث نبوية شريفة في الأخلاق والسلوك القويم",
        ],
        weeklyObjectivesEn: [
          "Applying honesty and trustworthiness in school and daily dealings",
          "Understanding the importance of maintaining family ties, honoring neighbors, and kindness to animals",
          "Memorizing and understanding 5 noble hadiths on character and righteous conduct",
        ],
        titleNl: "Dagelijkse Islamitische Adab: Eerlijkheid, Ouderlijke Piëteit en Buurtschap",
        titleTr: "Günlük İslami Edep: Doğruluk, Ana-Babaya İyilik ve Komşuluk",
        titleIt: "Adab Islamico Quotidiano: Onestà, Pietà Filiale e Buon Vicinato",
        titleEs: "Adab Islámico Diario: Honestidad, Piedad Filial y Buena Vecindad",
        descriptionNl: "Het toepassen van islamitische waarden binnen het school- en gezinsleven en het benaderen van hedendaagse situaties met profetisch karakter.",
        descriptionTr: "İslami değerlerin okul ve aile hayatında uygulanması ve günümüz durumlarının peygamberî ahlakla karşılanması.",
        descriptionIt: "Applicazione dei valori islamici nella vita scolastica e familiare e gestione delle situazioni contemporanee con carattere profetico.",
        descriptionEs: "Aplicación de los valores islámicos en la vida escolar y familiar, y afrontamiento de situaciones contemporáneas con carácter profético.",
        weeklyObjectivesNl: [
          "Eerlijkheid en betrouwbaarheid toepassen op school en in het dagelijks handelen",
          "Het belang begrijpen van het onderhouden van familiebanden, het eren van buren en vriendelijkheid jegens dieren",
          "5 nobele hadith over karakter en rechtschapen gedrag memoriseren en begrijpen",
        ],
        weeklyObjectivesTr: [
          "Doğruluğu ve güvenilirliği okul ve günlük ilişkilerde uygulama",
          "Akraba bağlarını sürdürmenin, komşuya iyilik etmenin ve hayvanlara şefkatin önemini anlama",
          "Ahlak ve doğru davranış üzerine 5 şerefli hadisi ezberleme ve anlama",
        ],
        weeklyObjectivesIt: [
          "Applicare onestà e affidabilità nei rapporti scolastici e quotidiani",
          "Comprendere l'importanza di mantenere i legami familiari, onorare i vicini ed essere gentili con gli animali",
          "Memorizzare e comprendere 5 nobili hadith su carattere e condotta retta",
        ],
        weeklyObjectivesEs: [
          "Aplicar la honestidad y la confiabilidad en las relaciones escolares y cotidianas",
          "Comprender la importancia de mantener los lazos familiares, honrar a los vecinos y ser bondadoso con los animales",
          "Memorizar y comprender 5 nobles hadices sobre el carácter y la conducta recta",
        ],
        targetVocabularyCount: 120,
        durationWeeks: 6,
      },
      {
        id: "cur-7c",
        programId: "prog-islamic",
        programTitleAr: "برنامج الدراسات والقيم الإسلامية",
        programTitleEn: "Islamic Studies",
        courseLevelCode: "B1",
        levelTitleAr: "المستوى الثالث (أركان الإيمان وأولو العزم من الرسل)",
        targetAgeGroup: AgeGroup.AGE_11_13,
        cefrAlignment: "Islamic Doctrine & Seerah Level 3",
        titleAr: "أركان الإيمان الستة ومواقف من قصص أولي العزم",
        titleEn: "Six Pillars of Faith & Lessons from Resolute Prophets",
        descriptionAr: "ترسيخ العقيدة الصافية واستلهام العبر والتضحية والصبر من قصص الأنبياء الكرام وتاريخ الحضارة.",
        descriptionEn: "Establishing sound creed and drawing lessons in sacrifice and patience from the stories of the resolute prophets and the history of civilization.",
        weeklyObjectivesAr: [
          "شرح أركان الإيمان الستة واستشعار مراقبة الله وحكمته",
          "استخلاص العبر والدروس التربوية من سير أولي العزم من الرسل",
          "إدراك دور المسلم في عمارة الأرض ونشر السلام والخير في مجتمعه",
        ],
        weeklyObjectivesEn: [
          "Explaining the six pillars of faith and cultivating awareness of God's watchfulness and wisdom",
          "Drawing educational lessons from the stories of the resolute prophets",
          "Recognizing the Muslim's role in building the earth and spreading peace and goodness in society",
        ],
        titleNl: "Zes Zuilen van het Geloof en Lessen van de Vastberaden Profeten",
        titleTr: "İmanın Altı Şartı ve Azim Sahibi Peygamberlerden Dersler",
        titleIt: "Sei Pilastri della Fede e Insegnamenti dai Profeti Risoluti",
        titleEs: "Seis Pilares de la Fe y Enseñanzas de los Profetas Resueltos",
        descriptionNl: "Het vestigen van een zuiver geloof en het putten van lessen over opoffering en geduld uit de verhalen van de vastberaden profeten en de geschiedenis van de beschaving.",
        descriptionTr: "Sağlam akidenin yerleştirilmesi ve azim sahibi peygamberlerin kıssalarından ve medeniyet tarihinden fedakârlık ve sabır derslerinin çıkarılması.",
        descriptionIt: "Consolidamento di una fede autentica e traendo insegnamenti di sacrificio e pazienza dalle storie dei profeti risoluti e dalla storia della civiltà.",
        descriptionEs: "Establecimiento de una fe sólida y extracción de enseñanzas de sacrificio y paciencia de las historias de los profetas resueltos y la historia de la civilización.",
        weeklyObjectivesNl: [
          "De zes zuilen van het geloof uitleggen en bewustzijn kweken van Gods alwetendheid en wijsheid",
          "Educatieve lessen trekken uit de verhalen van de vastberaden profeten",
          "De rol van de moslim begrijpen bij het opbouwen van de aarde en het verspreiden van vrede en goedheid in de samenleving",
        ],
        weeklyObjectivesTr: [
          "İmanın altı şartını açıklama ve Allah'ın gözetimini ve hikmetini hissetme bilincini geliştirme",
          "Azim sahibi peygamberlerin hayatlarından eğitici dersler çıkarma",
          "Müslümanın yeryüzünü imar etme ve toplumda barış ve iyiliği yayma konusundaki rolünü kavrama",
        ],
        weeklyObjectivesIt: [
          "Spiegare i sei pilastri della fede e coltivare la consapevolezza della vigilanza e della saggezza di Dio",
          "Trarre insegnamenti educativi dalle storie dei profeti risoluti",
          "Riconoscere il ruolo del musulmano nel costruire la terra e diffondere pace e bene nella società",
        ],
        weeklyObjectivesEs: [
          "Explicar los seis pilares de la fe y cultivar la conciencia de la vigilancia y sabiduría de Dios",
          "Extraer enseñanzas educativas de las historias de los profetas resueltos",
          "Reconocer el papel del musulmán en la construcción de la tierra y la difusión de la paz y el bien en la sociedad",
        ],
        targetVocabularyCount: 150,
        durationWeeks: 8,
      },
    ];

    for (const m of modules) {
      this.curriculumModules.set(m.id, m);
    }
  }

  // --- Audit Log Methods ---
  async addAuditLog(data: {
    category: AuditActionCategory;
    action: string;
    actorId: string;
    actorEmail: string;
    actorRole: RoleType;
    targetEntityId: string;
    targetEntityType: string;
    ipAddress: string;
    diffSummary?: string;
  }): Promise<AuditLogEntry> {
    const timestamp = new Date();
    const hash = this.computeHash(
      data.category,
      data.action,
      data.actorId,
      data.targetEntityId,
      timestamp,
      data.diffSummary
    );

    const meta: AuditLogMeta = {
      category: data.category,
      actorEmail: data.actorEmail,
      actorRole: data.actorRole,
      diffSummary: data.diffSummary,
      hash,
    };

    // actorId is expected to be a real User.id (the logged-in session user),
    // but this must never be allowed to throw and lose the action being
    // logged -- fall back to an unattributed log row if the FK doesn't
    // resolve for any reason.
    const actorExists = await prisma.user.findUnique({ where: { id: data.actorId }, select: { id: true } });

    const row = await prisma.auditLog.create({
      data: {
        userId: actorExists ? data.actorId : null,
        action: data.action,
        resource: data.targetEntityType,
        resourceId: data.targetEntityId,
        ipAddress: data.ipAddress,
        diffJson: JSON.stringify(meta),
        createdAt: timestamp,
      },
    });

    return this.toEntry(row);
  }

  async getAuditLogs(filters?: {
    category?: AuditActionCategory;
    actorRole?: RoleType;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" } });
    let entries = rows.map((row) => this.toEntry(row));

    if (filters?.category) {
      entries = entries.filter((e) => e.category === filters.category);
    }
    if (filters?.actorRole) {
      entries = entries.filter((e) => e.actorRole === filters.actorRole);
    }
    if (filters?.limit) {
      entries = entries.slice(0, filters.limit);
    }

    return entries;
  }

  async verifyLogIntegrity(logId: string): Promise<boolean> {
    const row = await prisma.auditLog.findUnique({ where: { id: logId } });
    if (!row) return false;

    const entry = this.toEntry(row);
    const expectedHash = this.computeHash(
      entry.category,
      entry.action,
      entry.actorId,
      entry.targetEntityId,
      entry.timestamp,
      entry.diffSummary
    );
    return expectedHash === entry.hash;
  }

  private toEntry(row: {
    id: string;
    userId: string | null;
    action: string;
    resource: string;
    resourceId: string | null;
    ipAddress: string | null;
    diffJson: string | null;
    createdAt: Date;
  }): AuditLogEntry {
    let meta: Partial<AuditLogMeta> = {};
    try {
      meta = row.diffJson ? JSON.parse(row.diffJson) : {};
    } catch {
      meta = {};
    }

    return {
      id: row.id,
      category: meta.category || "SECURITY",
      action: row.action,
      actorId: row.userId || "",
      actorEmail: meta.actorEmail || "",
      actorRole: meta.actorRole || RoleType.SUPER_ADMIN,
      targetEntityId: row.resourceId || "",
      targetEntityType: row.resource,
      ipAddress: row.ipAddress || "",
      timestamp: row.createdAt,
      diffSummary: meta.diffSummary,
      hash: meta.hash || "",
    };
  }

  // --- Curriculum Methods ---
  async getAllCurriculumModules(): Promise<CurriculumModule[]> {
    return Array.from(this.curriculumModules.values());
  }

  async getCurriculumModulesByProgram(programId: string): Promise<CurriculumModule[]> {
    return Array.from(this.curriculumModules.values()).filter((m) => m.programId === programId);
  }

  async addCurriculumModule(data: Omit<CurriculumModule, "id">): Promise<CurriculumModule> {
    const id = "cur-" + (this.curriculumModules.size + 1);
    const curModule: CurriculumModule = { id, ...data };
    this.curriculumModules.set(id, curModule);
    return curModule;
  }

  // --- Student & User Governance ---
  // Previously returned 4 hardcoded demo students ("student-1".."student-4")
  // regardless of who was actually registered -- the admin Students page,
  // the school analytics totals, and the GDPR data-export flow were all
  // reading fabricated data disconnected from the real student_profiles
  // table. This now reads real students, their real account status, and
  // their real primary guardian.
  async getAllStudentsAdmin(): Promise<StudentAdminRecord[]> {
    const students = await prisma.studentProfile.findMany({
      include: {
        user: { select: { status: true } },
        enrollments: { select: { id: true } },
        relationships: {
          where: { isPrimaryContact: true },
          include: { parent: { select: { firstName: true, lastName: true, phoneNumber: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return students.map((s) => {
      const primaryRelationship = s.relationships[0];
      return {
        id: s.id,
        userId: s.userId,
        firstName: s.firstName,
        lastName: s.lastName,
        dateOfBirth: s.dateOfBirth,
        ageGroup: s.ageGroup,
        nativeLanguage: s.nativeLanguage,
        status: s.user.status,
        guardianName: primaryRelationship
          ? `${primaryRelationship.parent.firstName} ${primaryRelationship.parent.lastName}`
          : "-",
        guardianPhone: primaryRelationship?.parent.phoneNumber || "-",
        guardianConsentGivenAt: primaryRelationship?.consentGivenAt ?? null,
        coppaGdprCompliant: Boolean(primaryRelationship),
        enrolledClassesCount: s.enrollments.length,
      };
    });
  }

  /** Real per-school student counts, for the Institutional Admin Dashboard. */
  async countStudentsBySchool(schoolId: string): Promise<{ total: number; active: number }> {
    const [total, active] = await Promise.all([
      prisma.studentProfile.count({ where: { schoolId } }),
      prisma.studentProfile.count({ where: { schoolId, user: { status: UserStatus.ACTIVE } } }),
    ]);
    return { total, active };
  }

  // Now writes to the real User.status column -- the same column the login
  // page checks (`user.status !== "ACTIVE"` blocks sign-in). A suspension
  // previously only touched an in-memory Map that the real login flow never
  // consulted, so it neither survived a deploy nor actually stopped anyone
  // from signing in.
  async setStudentStatus(studentId: string, status: UserStatus): Promise<void> {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });
    if (!student) {
      throw new Error(`STUDENT_NOT_FOUND: ${studentId}`);
    }

    await prisma.user.update({
      where: { id: student.userId },
      data: { status },
    });
  }

  // --- Teacher Admin ---
  // Previously every teacher was returned with the SAME hardcoded fake
  // email and qualifications string, and constant fake
  // assignedClassesCount/totalHoursTaught (1 and 16) regardless of who
  // they actually were -- which also made totalHoursDelivered in
  // getSchoolAnalyticsOverview() fake, since it summed that constant.
  // This now reads the teacher's real account email, their real
  // qualifications/certifications fields, their real assigned-class count
  // (TeacherAssignment) and real hours actually delivered (sum of
  // COMPLETED ClassSession durations), the same real-data pattern already
  // used by getAllStudentsAdmin above.
  async getAllTeachersAdmin(): Promise<TeacherAdminRecord[]> {
    const teachers = await prisma.teacherProfile.findMany({
      include: {
        user: { select: { email: true } },
        assignments: { select: { id: true } },
        sessions: {
          where: { status: "COMPLETED" },
          select: { startTimeUtc: true, endTimeUtc: true },
        },
      },
      orderBy: { firstName: "asc" },
    });

    return teachers.map((t) => {
      const totalHoursTaught = t.sessions.reduce((sum, s) => {
        const hours = (s.endTimeUtc.getTime() - s.startTimeUtc.getTime()) / (1000 * 60 * 60);
        return sum + Math.max(0, hours);
      }, 0);

      return {
        id: t.id,
        userId: t.userId,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.user.email,
        qualifications: t.qualifications || t.certifications || "لم يتم تسجيل المؤهلات بعد",
        languagesSpoken: t.languagesSpoken || "العربية، الإنجليزية",
        experienceYears: t.experienceYears,
        hourlyRateMinorUnits: t.hourlyRateMinorUnits,
        isActive: t.isActive,
        isCertified: t.isCertified,
        employmentType: t.employmentType,
        assignedClassesCount: t.assignments.length,
        totalHoursTaught: Math.round(totalHoursTaught * 10) / 10,
      };
    });
  }

  async updateTeacherRate(teacherId: string, newRateMinorUnits: number): Promise<void> {
    await userRepository.updateTeacherProfile(teacherId, { hourlyRateMinorUnits: newRateMinorUnits });
  }

  async updateTeacherActiveStatus(teacherId: string, isActive: boolean): Promise<void> {
    await userRepository.updateTeacherProfile(teacherId, { isActive });
  }

  /**
   * Admin-verified certification/employment status -- backs the "Certified,
   * Full-Time Educators" claim on the public For Schools page with a real,
   * per-teacher, admin-attested fact instead of a hardcoded "100%" badge.
   */
  async updateTeacherCertification(
    teacherId: string,
    isCertified: boolean,
    employmentType: EmploymentType
  ): Promise<void> {
    await userRepository.updateTeacherProfile(teacherId, { isCertified, employmentType });
  }
}

export const administrationRepository = new AdministrationRepository();
