import React from "react";
import Link from "next/link";
import { academicRepository, getProgramSlug } from "@/server/repositories/AcademicRepository";
import { administrationService } from "@/server/services/AdministrationService";
import { getDirection, getDictionary } from "@/lib/localization";
import type { CurriculumModule } from "@/server/repositories/AdministrationRepository";

// CurriculumModule content carries one field per locale (titleAr/titleEn/...);
// this picks the right one for the page's current locale, falling back to
// English for any locale that isn't Arabic and doesn't have its own field.
function pickLocaleField(
  locale: string,
  fieldsByLocale: { ar: string; en: string; nl: string; tr: string; it: string; es: string }
): string {
  switch (locale) {
    case "ar":
      return fieldsByLocale.ar;
    case "nl":
      return fieldsByLocale.nl;
    case "tr":
      return fieldsByLocale.tr;
    case "it":
      return fieldsByLocale.it;
    case "es":
      return fieldsByLocale.es;
    default:
      return fieldsByLocale.en;
  }
}

function moduleTitle(locale: string, m: CurriculumModule): string {
  return pickLocaleField(locale, {
    ar: m.titleAr,
    en: m.titleEn,
    nl: m.titleNl,
    tr: m.titleTr,
    it: m.titleIt,
    es: m.titleEs,
  });
}

function moduleDescription(locale: string, m: CurriculumModule): string {
  return pickLocaleField(locale, {
    ar: m.descriptionAr,
    en: m.descriptionEn,
    nl: m.descriptionNl,
    tr: m.descriptionTr,
    it: m.descriptionIt,
    es: m.descriptionEs,
  });
}

function moduleWeeklyObjectives(locale: string, m: CurriculumModule): string[] {
  switch (locale) {
    case "ar":
      return m.weeklyObjectivesAr;
    case "nl":
      return m.weeklyObjectivesNl;
    case "tr":
      return m.weeklyObjectivesTr;
    case "it":
      return m.weeklyObjectivesIt;
    case "es":
      return m.weeklyObjectivesEs;
    default:
      return m.weeklyObjectivesEn;
  }
}
import {
  BookOpen,
  Volume2,
  PenTool,
  MessageCircle,
  Headphones,
  Moon,
  HeartHandshake,
  CheckCircle2,
  Target,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  Award,
  Layers,
  Bot,
  Gamepad2,
  Mic,
} from "lucide-react";
import { HolisticLearningFramework } from "@/components/curriculum/HolisticLearningFramework";

const PROGRAMS_UI: Record<
  string,
  {
    lessonsPerAgeGroup: string;
    tracksBadge: string;
    tracksTitle: string;
    tracksSubtitleCount: string;
    lessonsBadgeCount: string;
    targetCompetencies: string;
    enrollForAge: string;
    scholarsAgeBadge: string;
    microGroupTag: string;
    maxCapacityLabel: string;
    studentsUnit: string;
    frequencyLabel: string;
    frequencyValue: string;
    ageTagMap: Record<string, string>;
    ageGroups: Array<{
      group: string;
      cefr: string;
      badgeColor: string;
      accentBg: string;
      name: string;
      tagline: string;
      skills: string[];
    }>;
  }
> = {
  ar: {
    lessonsPerAgeGroup: "+75 درساً لكل فئة عمرية (320+ درساً معتمداً)",
    tracksBadge: "المسارات العمرية المعتمدة",
    tracksTitle: "منهج مصمم خصيصاً لكل مرحلة عمرية",
    tracksSubtitleCount: "80+ درساً تفاعلياً لكل فئة (320 درساً معتمداً)",
    lessonsBadgeCount: "80 درساً",
    targetCompetencies: "أبرز المهارات المستهدفة",
    enrollForAge: "تسجيل بهذه الفئة",
    scholarsAgeBadge: "الفرسان (14-16 سنة)",
    microGroupTag: "فصل مصغر (أقصاه 6 طلاب)",
    maxCapacityLabel: "السعة القصوى:",
    studentsUnit: "طلاب",
    frequencyLabel: "الجدول الأسبوعي:",
    frequencyValue: "حصتان • 40 دقيقة",
    ageTagMap: {
      AGE_4_6: "البراعم (4-6 سنوات)",
      AGE_7_10: "المستكشفون (7-10 سنوات)",
      AGE_11_13: "الرواد (11-13 سنة)",
      AGE_14_16: "الفرسان (14-16 سنة)",
    },
    ageGroups: [
      {
        group: "AGE_4_6",
        name: "البراعم (4 - 6 سنوات)",
        cefr: "CEFR Pre-A1",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        accentBg: "bg-emerald-500",
        tagline: "اكتشاف الأصوات والمفردات بالحواس والأناشيد التفاعلية والتهجئة المبكرة",
        skills: ["الوعي الصوتي والأبجدية", "التهجئة التفاعلية المبكرة", "اللوح التفاعلي السحابي"],
      },
      {
        group: "AGE_7_10",
        name: "المستكشفون (7 - 10 سنوات)",
        cefr: "CEFR A1 - A2",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        accentBg: "bg-blue-500",
        tagline: "بناء الجمل، الطلاقة القرائية، جماليات خط النسخ، وحفظ وتجويد قصار السور",
        skills: ["الطلاقة القرائية وفهم المقروء", "تحسين الخط العربي وقواعد النسخ", "المحادثة اليومية الفصيحة"],
      },
      {
        group: "AGE_11_13",
        name: "الرواد (11 - 13 سنة)",
        cefr: "CEFR B1",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        accentBg: "bg-purple-500",
        tagline: "القراءة التحليلية، فنون الخطابة، التعبير الإنشائي، وتجويد جزء تبارك",
        skills: ["القراءة التحليلية والنقد الأدبي", "الإلقاء والمناظرات المصغرة", "صياغة المقالات التعبيرية"],
      },
      {
        group: "AGE_14_16",
        name: "الفرسان (14 - 16 سنة)",
        cefr: "CEFR B2",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        accentBg: "bg-amber-500",
        tagline: "فقه اللغة، عيون الأدب العربي، خط الرقعة والديواني، والمناظرات الفكرية",
        skills: ["فقه اللغة والنحو المعمق", "تحليل عيون الشعر والنثر الأدبي", "المناظرات الفكرية والبلاغة"],
      },
    ],
  },
  en: {
    lessonsPerAgeGroup: "75+ Lessons / Age Group (320+ Total)",
    tracksBadge: "Accredited Age-Group Tracks",
    tracksTitle: "Curriculum Tailored for Every Age Stage",
    tracksSubtitleCount: "80+ Lessons per Age Group (320 Total)",
    lessonsBadgeCount: "80 Lessons",
    targetCompetencies: "Target Competencies",
    enrollForAge: "Enroll for this Age",
    scholarsAgeBadge: "Young Scholars (Ages 14-16)",
    microGroupTag: "Micro-Group (Max 6)",
    maxCapacityLabel: "Max Capacity:",
    studentsUnit: "Students",
    frequencyLabel: "Frequency:",
    frequencyValue: "2 Sessions • 40m",
    ageTagMap: {
      AGE_4_6: "Sprouts (Ages 4-6)",
      AGE_7_10: "Explorers (Ages 7-10)",
      AGE_11_13: "Navigators (Ages 11-13)",
      AGE_14_16: "Scholars (Ages 14-16)",
    },
    ageGroups: [
      {
        group: "AGE_4_6",
        name: "Little Sprouts (Ages 4-6)",
        cefr: "CEFR Pre-A1",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        accentBg: "bg-emerald-500",
        tagline: "Sensory discovery, phonemes, and playful learning through interactive songs",
        skills: ["Phonemic Awareness & Alphabet", "Early Interactive Blending", "Cloud Whiteboard Games"],
      },
      {
        group: "AGE_7_10",
        name: "Junior Explorers (Ages 7-10)",
        cefr: "CEFR A1 - A2",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        accentBg: "bg-blue-500",
        tagline: "Sentence building, reading fluency, Naskh calligraphy, and foundational Tajweed",
        skills: ["Reading Fluency & Comprehension", "Naskh Penmanship Mastery", "Daily Spoken Eloquence"],
      },
      {
        group: "AGE_11_13",
        name: "Intermediate Navigators (Ages 11-13)",
        cefr: "CEFR B1",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        accentBg: "bg-purple-500",
        tagline: "Analytical reading, public speaking, narrative composition, and Juz Tabarak",
        skills: ["Analytical Text & Literary Critique", "Oratory & Classroom Debates", "Narrative Essay Writing"],
      },
      {
        group: "AGE_14_16",
        name: "Young Scholars (Ages 14-16)",
        cefr: "CEFR B2",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        accentBg: "bg-amber-500",
        tagline: "Arabic philology, classical masterpieces, Diwani calligraphy, and philosophical debates",
        skills: ["Arabic Philology & Advanced Syntax", "Classical Poetry & Prose Analysis", "Dialectical Debates & Rhetoric"],
      },
    ],
  },
  nl: {
    lessonsPerAgeGroup: "75+ Lessen / Leeftijdsgroep (320+ Totaal)",
    tracksBadge: "Geaccrediteerde Leeftijdstrajecten",
    tracksTitle: "Curriculum Afgestemd op Elke Leeftijdsfase",
    tracksSubtitleCount: "80+ Interactieve Lessen per Groep (320 Totaal)",
    lessonsBadgeCount: "80 Lessen",
    targetCompetencies: "Belangrijkste Vaardigheden",
    enrollForAge: "Inschrijven voor deze Leeftijd",
    scholarsAgeBadge: "Jonge Geleerden (14-16 jaar)",
    microGroupTag: "Micro-groep (Max 6)",
    maxCapacityLabel: "Maximale capaciteit:",
    studentsUnit: "Studenten",
    frequencyLabel: "Frequentie:",
    frequencyValue: "2 Sessies • 40 min",
    ageTagMap: {
      AGE_4_6: "Spruiten (4-6 jaar)",
      AGE_7_10: "Verkenners (7-10 jaar)",
      AGE_11_13: "Pioniers (11-13 jaar)",
      AGE_14_16: "Geleerden (14-16 jaar)",
    },
    ageGroups: [
      {
        group: "AGE_4_6",
        name: "Kleine Spruiten (4 - 6 jaar)",
        cefr: "CEFR Pre-A1",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        accentBg: "bg-emerald-500",
        tagline: "Zintuiglijke ontdekking, fonemen en spelenderwijs leren via interactieve liedjes",
        skills: ["Fonemisch Bewustzijn & Alfabet", "Vroeg Interactief Klankblenden", "Digibord Spelletjes"],
      },
      {
        group: "AGE_7_10",
        name: "Jonge Verkenners (7 - 10 jaar)",
        cefr: "CEFR A1 - A2",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        accentBg: "bg-blue-500",
        tagline: "Zinsbouw, leesvaardigheid, Naskh kalligrafie en basis Tajweed",
        skills: ["Leesvaardigheid & Begrijpend Lezen", "Naskh Handschriftbeheersing", "Dagelijkse Vloeiende Spraak"],
      },
      {
        group: "AGE_11_13",
        name: "Middelbare Pioniers (11 - 13 jaar)",
        cefr: "CEFR B1",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        accentBg: "bg-purple-500",
        tagline: "Analytisch lezen, spreken in het openbaar, verhalend schrijven en Juz Tabarak",
        skills: ["Analytische Teksten & Literatuur", "Spreekvaardigheid & Debat", "Verhalend Essay Schrijven"],
      },
      {
        group: "AGE_14_16",
        name: "Jonge Geleerden (14 - 16 jaar)",
        cefr: "CEFR B2",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        accentBg: "bg-amber-500",
        tagline: "Arabische filologie, klassieke meesterwerken, Diwani kalligrafie en filosofische debatten",
        skills: ["Arabische Filologie & Syntaxis", "Klassieke Poëzie & Proza", "Dialectische Debatten & Retoriek"],
      },
    ],
  },
  tr: {
    lessonsPerAgeGroup: "Yaş Grubuna Göre 75+ Ders (Toplam 320+ Ders)",
    tracksBadge: "Akredite Yaş Grubu Parkurları",
    tracksTitle: "Her Yaş Evresine Özel Müfredat",
    tracksSubtitleCount: "Grup Başına 80+ Etkileşimli Ders (320 Toplam)",
    lessonsBadgeCount: "80 Ders",
    targetCompetencies: "Hedef Yetkinlikler",
    enrollForAge: "Bu Yaş İçin Kaydol",
    scholarsAgeBadge: "Genç Alimler (14-16 Yaş)",
    microGroupTag: "Mikro Grup (Maks 6)",
    maxCapacityLabel: "Maksimum Kapasite:",
    studentsUnit: "Öğrenci",
    frequencyLabel: "Ders Sıklığı:",
    frequencyValue: "2 Oturum • 40 dk",
    ageTagMap: {
      AGE_4_6: "Filizler (4-6 Yaş)",
      AGE_7_10: "Kaşifler (7-10 Yaş)",
      AGE_11_13: "Öncüler (11-13 Yaş)",
      AGE_14_16: "Alimler (14-16 Yaş)",
    },
    ageGroups: [
      {
        group: "AGE_4_6",
        name: "Minik Filizler (4 - 6 Yaş)",
        cefr: "CEFR Pre-A1",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        accentBg: "bg-emerald-500",
        tagline: "Duyusal keşif, sesbirimler ve etkileşimli şarkılarla eğlenceli öğrenme",
        skills: ["Fonemik Farkındalık ve Alfabe", "Erken Harf Birleştirme", "Bulut Beyaz Tahta Oyunları"],
      },
      {
        group: "AGE_7_10",
        name: "Küçük Kâşifler (7 - 10 Yaş)",
        cefr: "CEFR A1 - A2",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        accentBg: "bg-blue-500",
        tagline: "Cümle kurma, akıcı okuma, Nesih hat sanatı ve temel Tecvid",
        skills: ["Okuma Akıcılığı ve Anlama", "Nesih Yazı Hakimiyeti", "Günlük Fasih Konuşma Becerisi"],
      },
      {
        group: "AGE_11_13",
        name: "Öncü Kaşifler (11 - 13 Yaş)",
        cefr: "CEFR B1",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        accentBg: "bg-purple-500",
        tagline: "Analitik okuma, hitabet sanatları, kompozisyon yazımı ve Tebareke Cüzü",
        skills: ["Analitik Metin ve Edebi Eleştiri", "Hitabet ve Sınıf Münazaraları", "Öyküsel Kompozisyon"],
      },
      {
        group: "AGE_14_16",
        name: "Genç Alimler (14 - 16 Yaş)",
        cefr: "CEFR B2",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        accentBg: "bg-amber-500",
        tagline: "Arap filolojisi, klasik şaheserler, Divani hat sanatı ve felsefi münazaralar",
        skills: ["Arap Filolojisi ve İleri Dilbilgisi", "Klasik Şiir ve Nesir Analizi", "Diyalektik Münazaralar ve Belagat"],
      },
    ],
  },
  it: {
    lessonsPerAgeGroup: "75+ Lezioni per Fascia d'Età (320+ Totale)",
    tracksBadge: "Percorsi di Età Accreditati",
    tracksTitle: "Curriculum Su Misura per Ogni Fascia di Età",
    tracksSubtitleCount: "80+ Lezioni Interattive per Fascia (320 Totali)",
    lessonsBadgeCount: "80 Lezioni",
    targetCompetencies: "Competenze Chiave",
    enrollForAge: "Iscriviti per questa Età",
    scholarsAgeBadge: "Giovani Studiosi (14-16 anni)",
    microGroupTag: "Micro-gruppo (Max 6)",
    maxCapacityLabel: "Capacità Massima:",
    studentsUnit: "Studenti",
    frequencyLabel: "Frequenza:",
    frequencyValue: "2 Sessioni • 40 min",
    ageTagMap: {
      AGE_4_6: "Primi Passi (4-6 anni)",
      AGE_7_10: "Esploratori (7-10 anni)",
      AGE_11_13: "Navigatori (11-13 anni)",
      AGE_14_16: "Studiosi (14-16 anni)",
    },
    ageGroups: [
      {
        group: "AGE_4_6",
        name: "Primi Passi (4 - 6 anni)",
        cefr: "CEFR Pre-A1",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        accentBg: "bg-emerald-500",
        tagline: "Scoperta sensoriale, fonemi e apprendimento giocoso con canzoni interattive",
        skills: ["Consapevolezza Fonemica e Alfabeto", "Fusione Fonetica Interattiva", "Giochi Lavagna Cloud"],
      },
      {
        group: "AGE_7_10",
        name: "Giovani Esploratori (7 - 10 anni)",
        cefr: "CEFR A1 - A2",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        accentBg: "bg-blue-500",
        tagline: "Costruzione delle frasi, fluidità di lettura, calligrafia Naskh e basi del Tajweed",
        skills: ["Lettura Fluente e Comprensione", "Padronanza Calligrafica Naskh", "Conversazione Quotidiana"],
      },
      {
        group: "AGE_11_13",
        name: "Navigatori Intermedi (11 - 13 anni)",
        cefr: "CEFR B1",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        accentBg: "bg-purple-500",
        tagline: "Lettura analitica, oratoria, composizione narrativa e Juz Tabarak",
        skills: ["Testi Analitici e Critica", "Oratoria e Dibattiti in Aula", "Scrittura di Saggi Narrativi"],
      },
      {
        group: "AGE_14_16",
        name: "Giovani Studiosi (14 - 16 anni)",
        cefr: "CEFR B2",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        accentBg: "bg-amber-500",
        tagline: "Filologia araba, capolavori classici, calligrafia Diwani e dibattiti filosofici",
        skills: ["Filologia Araba e Sintassi Avanzata", "Analisi di Poesia e Prosa Classica", "Dibattiti Dialettici e Retorica"],
      },
    ],
  },
  es: {
    lessonsPerAgeGroup: "+75 Lecciones por Grupo de Edad (320+ en Total)",
    tracksBadge: "Itinerarios Acreditados por Grupos de Edad",
    tracksTitle: "Plan de Estudios Adaptado a Cada Etapa de Edad",
    tracksSubtitleCount: "80+ Lecciones Interactivas por Grupo (320 en Total)",
    lessonsBadgeCount: "80 Lecciones",
    targetCompetencies: "Competencias Clave",
    enrollForAge: "Inscribirse para esta Edad",
    scholarsAgeBadge: "Jóvenes Eruditos (14-16 años)",
    microGroupTag: "Microgrupo (Máx. 6)",
    maxCapacityLabel: "Capacidad Máxima:",
    studentsUnit: "Estudiantes",
    frequencyLabel: "Frecuencia:",
    frequencyValue: "2 Sesiones • 40 min",
    ageTagMap: {
      AGE_4_6: "Brotes (4-6 años)",
      AGE_7_10: "Exploradores (7-10 años)",
      AGE_11_13: "Navegantes (11-13 años)",
      AGE_14_16: "Eruditos (14-16 años)",
    },
    ageGroups: [
      {
        group: "AGE_4_6",
        name: "Pequeños Brotes (4 - 6 años)",
        cefr: "CEFR Pre-A1",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        accentBg: "bg-emerald-500",
        tagline: "Descubrimiento sensorial, fonemas y aprendizaje lúdico con canciones interactivas",
        skills: ["Conciencia Fonémica y Alfabeto", "Combinación Fonética Temprana", "Juegos de Pizarra Digital"],
      },
      {
        group: "AGE_7_10",
        name: "Jóvenes Exploradores (7 - 10 años)",
        cefr: "CEFR A1 - A2",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        accentBg: "bg-blue-500",
        tagline: "Construcción de oraciones, fluidez lectora, caligrafía Naskh y fundamentos de Tajweed",
        skills: ["Fluidez Lectora y Comprensión", "Dominio Caligráfico Naskh", "Elocuencia Cotidiana en Árabe"],
      },
      {
        group: "AGE_11_13",
        name: "Navegantes Intermedios (11 - 13 años)",
        cefr: "CEFR B1",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        accentBg: "bg-purple-500",
        tagline: "Lectura analítica, oratoria, redacción narrativa y Juz Tabarak",
        skills: ["Texto Analítico y Crítica Literaria", "Oratoria y Debates en Clase", "Redacción de Ensayos Narrativos"],
      },
      {
        group: "AGE_14_16",
        name: "Jóvenes Eruditos (14 - 16 años)",
        cefr: "CEFR B2",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        accentBg: "bg-amber-500",
        tagline: "Filología árabe, obras maestras clásicas, caligrafía Diwani y debates filosóficos",
        skills: ["Filología Árabe y Sintaxis Avanzada", "Análisis de Poesía y Prosa Clásica", "Debates Dialécticos y Retórica"],
      },
    ],
  },
};

export default async function ProgramsCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ program?: string }>;
}) {
  const { locale } = await params;
  const { program: programParam } = await searchParams;
  const isAr = locale === "ar";
  const isRtl = getDirection(locale) === "rtl";
  const dict = getDictionary(locale);
  const pc = dict.programsCatalog;
  const pui = PROGRAMS_UI[locale] || PROGRAMS_UI.en;
  // pc.meta's keys are the fixed set of "prog-xxx" slugs, typed from the
  // JSON dictionary as literal keys -- cast once so it can be looked up by
  // a dynamically-resolved slug (selectedSlug / prog.slug) below.
  const programMetaDict = pc.meta as unknown as Record<
    string,
    {
      title: string;
      description: string;
      targetAges: string;
      studio1Title: string;
      studio1Desc: string;
      studio2Title: string;
      studio2Desc: string;
    }
  >;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const ForwardArrow = isRtl ? ArrowLeft : ArrowRight;

  // Program.id in the database is a random UUID; the stable "prog-xxx" slug
  // (derived from the program's real, stable `type`) is what the curriculum
  // catalog, the dictionaries, and incoming links (e.g. from the homepage)
  // actually use to identify a program. Resolve the selected program by
  // slug first, and use its real database id only for genuine DB lookups
  // (courses/levels) -- mixing the two previously meant every program page
  // silently fell back to Foundations' metadata and always showed "0"
  // curriculum modules, regardless of which program tab was open.
  let allPrograms: Awaited<ReturnType<typeof academicRepository.getAllPrograms>> = [];
  try {
    allPrograms = await academicRepository.getAllPrograms();
  } catch (err) {
    console.error("Failed to load programs:", err);
    allPrograms = [];
  }

  const allProgramsWithSlug = allPrograms.map((p) => ({ ...p, slug: getProgramSlug(p.type) }));
  const selectedSlug =
    programParam && allProgramsWithSlug.some((p) => p.slug === programParam)
      ? programParam
      : allProgramsWithSlug[0]?.slug || "prog-foundations";

  const currentProgram =
    allProgramsWithSlug.find((p) => p.slug === selectedSlug) || allProgramsWithSlug[0];

  // Fetch courses, levels, and curriculum modules for the selected program
  let courses: Awaited<ReturnType<typeof academicRepository.getCoursesByProgramId>> = [];
  let modules: Awaited<ReturnType<typeof administrationService.getCurriculumModules>> = [];
  try {
    if (currentProgram?.id) {
      courses = await academicRepository.getCoursesByProgramId(currentProgram.id);
    }
    modules = await administrationService.getCurriculumModules(selectedSlug);
  } catch (err) {
    console.error("Failed to load courses or modules:", err);
  }

  // Collect levels across courses
  const levels: Awaited<ReturnType<typeof academicRepository.getLevelsByCourseId>> = [];
  try {
    for (const course of courses) {
      const courseLevels = await academicRepository.getLevelsByCourseId(course.id);
      levels.push(...courseLevels);
    }
  } catch (err) {
    console.error("Failed to load levels:", err);
  }
  const levelIds = new Set(levels.map((l) => l.id));

  // Get active class groups matching these levels
  let allClasses: Awaited<ReturnType<typeof academicRepository.getAllClassGroups>> = [];
  try {
    allClasses = await academicRepository.getAllClassGroups();
  } catch (err) {
    console.error("Failed to load class groups:", err);
  }
  const programClasses = allClasses.filter((cg) => levelIds.has(cg.courseLevelId));

  // Program-specific metadata & studio tool integrations
  const programMeta: Record<
    string,
    {
      icon: React.ComponentType<{ className?: string }>;
      badgeColor: string;
      bgLight: string;
      gradient: string;
      cefrSpan: string;
      targetAges: string;
      studios: { title: string; desc: string; icon: React.ComponentType<{ className?: string }>; href: string }[];
    }
  > = {
    "prog-foundations": {
      icon: BookOpen,
      badgeColor: "text-blue-600 bg-blue-50 border-blue-200",
      bgLight: "bg-blue-50 text-blue-600",
      gradient: "from-blue-600 to-indigo-700",
      cefrSpan: "CEFR Pre-A1 → A1",
      targetAges: pc.meta["prog-foundations"].targetAges,
      studios: [
        {
          title: pc.meta["prog-foundations"].studio1Title,
          desc: pc.meta["prog-foundations"].studio1Desc,
          icon: Gamepad2,
          href: `/${locale}/student/activities`,
        },
        {
          title: pc.meta["prog-foundations"].studio2Title,
          desc: pc.meta["prog-foundations"].studio2Desc,
          icon: Layers,
          href: `/${locale}/student/flashcards`,
        },
      ],
    },
    "prog-reading": {
      icon: Volume2,
      badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      bgLight: "bg-emerald-50 text-emerald-600",
      gradient: "from-emerald-600 to-teal-700",
      cefrSpan: "CEFR A1 → B1",
      targetAges: pc.meta["prog-reading"].targetAges,
      studios: [
        {
          title: pc.meta["prog-reading"].studio1Title,
          desc: pc.meta["prog-reading"].studio1Desc,
          icon: Award,
          href: `/${locale}/student/roadmap`,
        },
        {
          title: pc.meta["prog-reading"].studio2Title,
          desc: pc.meta["prog-reading"].studio2Desc,
          icon: BookOpen,
          href: `/${locale}/student/stories`,
        },
      ],
    },
    "prog-writing": {
      icon: PenTool,
      badgeColor: "text-purple-600 bg-purple-50 border-purple-200",
      bgLight: "bg-purple-50 text-purple-600",
      gradient: "from-purple-600 to-violet-700",
      cefrSpan: "CEFR A1 → B1",
      targetAges: pc.meta["prog-writing"].targetAges,
      studios: [
        {
          title: pc.meta["prog-writing"].studio1Title,
          desc: pc.meta["prog-writing"].studio1Desc,
          icon: PenTool,
          href: `/${locale}/student/activities`,
        },
        {
          title: pc.meta["prog-writing"].studio2Title,
          desc: pc.meta["prog-writing"].studio2Desc,
          icon: Layers,
          href: `/${locale}/student/activities`,
        },
      ],
    },
    "prog-speaking": {
      icon: MessageCircle,
      badgeColor: "text-amber-600 bg-amber-50 border-amber-200",
      bgLight: "bg-amber-50 text-amber-600",
      gradient: "from-amber-600 to-orange-700",
      cefrSpan: "CEFR A1 → B2",
      targetAges: pc.meta["prog-speaking"].targetAges,
      studios: [
        {
          title: pc.meta["prog-speaking"].studio1Title,
          desc: pc.meta["prog-speaking"].studio1Desc,
          icon: Bot,
          href: `/${locale}/student/ai-tutor`,
        },
        {
          title: pc.meta["prog-speaking"].studio2Title,
          desc: pc.meta["prog-speaking"].studio2Desc,
          icon: Mic,
          href: `/${locale}/student/pronunciation`,
        },
      ],
    },
    "prog-listening": {
      icon: Headphones,
      badgeColor: "text-pink-600 bg-pink-50 border-pink-200",
      bgLight: "bg-pink-50 text-pink-600",
      gradient: "from-pink-600 to-rose-700",
      cefrSpan: "CEFR Pre-A1 → A2",
      targetAges: pc.meta["prog-listening"].targetAges,
      studios: [
        {
          title: pc.meta["prog-listening"].studio1Title,
          desc: pc.meta["prog-listening"].studio1Desc,
          icon: Headphones,
          href: `/${locale}/student/pronunciation`,
        },
        {
          title: pc.meta["prog-listening"].studio2Title,
          desc: pc.meta["prog-listening"].studio2Desc,
          icon: Volume2,
          href: `/${locale}/student/stories`,
        },
      ],
    },
    "prog-quran": {
      icon: Moon,
      badgeColor: "text-cyan-600 bg-cyan-50 border-cyan-200",
      bgLight: "bg-cyan-50 text-cyan-600",
      gradient: "from-cyan-600 to-blue-700",
      cefrSpan: "Tajweed Levels 1 → 3",
      targetAges: pc.meta["prog-quran"].targetAges,
      studios: [
        {
          title: pc.meta["prog-quran"].studio1Title,
          desc: pc.meta["prog-quran"].studio1Desc,
          icon: Moon,
          href: `/${locale}/student/quran-studio`,
        },
        {
          title: pc.meta["prog-quran"].studio2Title,
          desc: pc.meta["prog-quran"].studio2Desc,
          icon: Award,
          href: `/${locale}/student/quran-studio`,
        },
      ],
    },
    "prog-islamic": {
      icon: HeartHandshake,
      badgeColor: "text-teal-600 bg-teal-50 border-teal-200",
      bgLight: "bg-teal-50 text-teal-600",
      gradient: "from-teal-600 to-emerald-700",
      cefrSpan: "Values Foundation → Level 3",
      targetAges: pc.meta["prog-islamic"].targetAges,
      studios: [
        {
          title: pc.meta["prog-islamic"].studio1Title,
          desc: pc.meta["prog-islamic"].studio1Desc,
          icon: BookOpen,
          href: `/${locale}/student/stories`,
        },
        {
          title: pc.meta["prog-islamic"].studio2Title,
          desc: pc.meta["prog-islamic"].studio2Desc,
          icon: HeartHandshake,
          href: `/${locale}/student/activities`,
        },
      ],
    },
  };

  const currentMeta = programMeta[selectedSlug] || programMeta["prog-foundations"];
  const MainIcon = currentMeta.icon;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <BackArrow className="w-4 h-4" />
            <span>{pc.backToHome}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs text-slate-500 font-medium">
              {pc.tracksLabel}
            </span>
            <Link
              href={`/${locale}/parent/enroll`}
              className="px-4 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all"
            >
              {pc.enrollCta}
            </Link>
          </div>
        </div>

        {/* 7 Program Selector Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {allProgramsWithSlug.map((prog) => {
              const meta = programMeta[prog.slug] || programMeta["prog-foundations"];
              const ProgIcon = meta.icon;
              const isSelected = prog.slug === selectedSlug;
              const progTitle = programMetaDict[prog.slug]?.title || prog.titleEn;
              return (
                <Link
                  key={prog.id}
                  href={`/${locale}/programs?program=${prog.slug}`}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.02]"
                      : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <ProgIcon className="w-4 h-4" />
                  <span>{progTitle}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Header for Selected Program */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className={`bg-gradient-to-r ${currentMeta.gradient} rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden`}>
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                {currentMeta.cefrSpan}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                {currentMeta.targetAges}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-extrabold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{pc.microCohortsBadge}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
                <MainIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {programMetaDict[selectedSlug]?.title || currentProgram.titleEn}
                </h1>
                <p className="text-white/90 text-sm sm:text-base mt-1 leading-relaxed">
                  {programMetaDict[selectedSlug]?.description || currentProgram.descriptionEn}
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-white/80 border-t border-white/20">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{pc.cefrStandardsBadge}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{pui.lessonsPerAgeGroup}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{pc.liveSessionsBadge}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{pc.progressReportsBadge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Section 0: Academic Age Groups Showcase */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>{pui.tracksBadge}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {pui.tracksTitle}
              </h2>
            </div>
            <span className="text-xs text-brand-700 font-bold bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200">
              {pui.tracksSubtitleCount}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pui.ageGroups.map((ageCard) => (
              <div
                key={ageCard.group}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-300 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${ageCard.badgeColor}`}>
                      {ageCard.cefr}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {pui.lessonsBadgeCount}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {ageCard.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {ageCard.tagline}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {pui.targetCompetencies}
                    </span>
                    {ageCard.skills.map((skill, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/${locale}/parent/enroll?program=${selectedSlug}&age=${ageCard.group}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 font-bold text-xs text-center border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{pui.enrollForAge}</span>
                  <ForwardArrow className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Section 1: Detailed Curriculum Sequence */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-1">
                <Target className="w-3.5 h-3.5" />
                <span>{pc.syllabiTag}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {pc.progressionTitle}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {modules.length} {pc.modulesLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((m, idx) => (
              <div
                key={m.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 font-extrabold text-xs">
                      {m.cefrAlignment}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{m.durationWeeks} {pc.weeksLabel}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {isAr ? `${pc.moduleLabel} ${idx + 1}: ${m.levelTitleAr}` : `${pc.moduleLabel} ${idx + 1}: ${m.courseLevelCode}`}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {moduleTitle(locale, m)}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                      {moduleDescription(locale, m)}
                    </p>
                  </div>

                  {/* Weekly Objectives */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      {pc.objectivesLabel}
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {moduleWeeklyObjectives(locale, m).map((obj, oIdx) => (
                        <li key={oIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{pc.targetLabel} +{m.targetVocabularyCount} {pc.wordsLabel}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                    {m.targetAgeGroup === "AGE_4_6"
                      ? pc.ageSproutsLabel
                      : m.targetAgeGroup === "AGE_7_10"
                      ? pc.ageExplorersLabel
                      : m.targetAgeGroup === "AGE_11_13"
                      ? pc.ageNavigatorsLabel
                      : pui.scholarsAgeBadge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Holistic Learning Framework: Bloom, BIDE & STEAM */}
        <HolisticLearningFramework locale={locale} isRtl={isRtl} />

        {/* Section 2: Integrated Interactive Studios */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{pc.studiosTag}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {pc.studiosTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {pc.studiosSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentMeta.studios.map((studio, sIdx) => {
              const StudioIcon = studio.icon;
              return (
                <div
                  key={sIdx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white hover:border-brand-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white text-brand-600 shadow-xs border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <StudioIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                        {studio.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {studio.desc}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={studio.href}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300 transition-all shrink-0 self-start sm:self-center"
                  >
                    <span>{pc.exploreStudioCta}</span>
                    <ForwardArrow className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Active Micro-Cohorts Across All Age Groups & Direct Enrollment */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>{pc.cohortsTag}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {pc.cohortsTitle}
              </h2>
            </div>

            <Link
              href={`/${locale}/parent/enroll?program=${selectedSlug}`}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>{pc.viewAllCta}</span>
              <ForwardArrow className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programClasses.map((cg) => {
              const matchedLevel = levels.find((l) => l.id === cg.courseLevelId);
              const ageGroupTag = pui.ageTagMap[matchedLevel?.targetAge || ""] || pui.ageTagMap["AGE_14_16"];

              const ageGroupBadgeColor =
                matchedLevel?.targetAge === "AGE_4_6"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : matchedLevel?.targetAge === "AGE_7_10"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : matchedLevel?.targetAge === "AGE_11_13"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-amber-50 text-amber-700 border-amber-200";

              return (
                <div
                  key={cg.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-brand-300 hover:shadow-md transition-all space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] border ${ageGroupBadgeColor}`}>
                        {ageGroupTag}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {pc.enrollmentOpenLabel}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        {cg.classType === "GROUP" ? pui.microGroupTag : pc.privateLabel}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {cg.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {matchedLevel?.titleAr && isAr ? matchedLevel.titleAr : matchedLevel?.titleEn || pc.cohortDescriptionGeneric}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 space-y-1 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{pui.maxCapacityLabel}</span>
                        <span className="font-bold text-slate-800">{cg.capacityMax} {pui.studentsUnit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{pui.frequencyLabel}</span>
                        <span className="font-bold text-slate-800">{pui.frequencyValue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                        👨‍🏫
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {pc.certifiedFacultyLabel}
                      </span>
                    </div>

                    <Link
                      href={`/${locale}/parent/enroll?program=${selectedSlug}&age=${matchedLevel?.targetAge || "AGE_7_10"}&classId=${cg.id}`}
                      className="px-3.5 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all flex items-center gap-1 shrink-0"
                    >
                      <span>{pc.reserveSeatCta}</span>
                      <ForwardArrow className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
