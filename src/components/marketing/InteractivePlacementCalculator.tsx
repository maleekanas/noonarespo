"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Compass,
  Star,
} from "lucide-react";

interface InteractivePlacementCalculatorProps {
  locale: string;
  isRtl?: boolean;
}

interface AssessmentResult {
  cefrLevel: string;
  cohortTitle: string;
  targetFocus: string;
  milestones: {
    phase1: { title: string; desc: string };
    phase2: { title: string; desc: string };
    phase3: { title: string; desc: string };
  };
  recommendedPlanId: string;
  recommendedPlanName: string;
  weeklyCommitment: string;
}

const WIZARD_UI: Record<string, {
  topBadge: string;
  topTitle: string;
  topDesc: string;
  step1Tag: string;
  step1Title: string;
  step1Desc: string;
  nextToLevel: string;
  step2Tag: string;
  step2Title: string;
  step2Desc: string;
  backToAge: string;
  nextToGoal: string;
  step3Tag: string;
  step3Title: string;
  step3Desc: string;
  backToProficiency: string;
  generatePlan: string;
  microCohortBadge: string;
  trackSuffix: string;
  weeklyCommitmentLabel: string;
  certifiedMentor: string;
  roadmapTitle: string;
  cefrBenchmark: string;
  retakeAssessment: string;
  speakAdvisor: string;
  claimTrial: string;
}> = {
  ar: {
    topBadge: "أداة تحديد المستوى الذكية المجانية",
    topTitle: "اكتشف المسار التعليمي والمجموعة المثالية لطفلك",
    topDesc: "أجب عن 3 أسئلة سريعة لنحدد لك المستوى الأوروبي المعياري (CEFR) والجدول الأسبوعي المناسب.",
    step1Tag: "الخطوة 1 من 3: الفئة العمرية",
    step1Title: "كم يبلغ عمر طفلك؟",
    step1Desc: "نقوم بتوزيع الطلاب في مجموعات متقاربة عمرياً لضمان أفضل تفاعل اجتماعي وأكاديمي.",
    nextToLevel: "التالي: المستوى الحالي",
    step2Tag: "الخطوة 2 من 3: الإلمام باللغة",
    step2Title: "ما هو مستوى طفلك الحالي في اللغة العربية؟",
    step2Desc: "لا تقلق إذا كان طفلك مبتدئاً تماماً، فمعظم طلابنا يبدأون من الصفر.",
    backToAge: "← العودة لاختيار العمر",
    nextToGoal: "التالي: الهدف الأساسي",
    step3Tag: "الخطوة 3 من 3: الهدف الأساسي",
    step3Title: "ما هو هدفك الأهم لطفلك في هذا العام؟",
    step3Desc: "سنخصص خطة المنهج والأنشطة التفاعلية بناءً على هذا الهدف.",
    backToProficiency: "← العودة للمستوى",
    generatePlan: "عرض النتيجة والمسار الموصى به",
    microCohortBadge: "مجموعة مصغرة (بحد أقصى 6 طلاب)",
    trackSuffix: "مسار",
    weeklyCommitmentLabel: "الالتزام الأسبوعي المقترح",
    certifiedMentor: "معلم ناطق أصلي معتمد",
    roadmapTitle: "خارطة الطريق المخصصة (12 أسبوعاً)",
    cefrBenchmark: "معايير CEFR المعتمدة",
    retakeAssessment: "إعادة التقييم مرة أخرى",
    speakAdvisor: "تحدث مع مستشار أكاديمي",
    claimTrial: "احجز التجربة المجانية لهذا المسار",
  },
  nl: {
    topBadge: "Gratis niveaubepaling in 60 seconden",
    topTitle: "Ontdek het ideale leertraject en de perfecte groep voor uw kind",
    topDesc: "Beantwoord 3 korte vragen om het CEFR-niveau, de aanbevolen leergroep en het 12-weken stappenplan te berekenen.",
    step1Tag: "Stap 1 van 3: Leeftijdsgroep",
    step1Title: "Hoe oud is uw kind?",
    step1Desc: "We plaatsen kinderen in groepen van dezelfde leeftijd voor de beste interactie en tempo.",
    nextToLevel: "Volgende: Huidig taalniveau",
    step2Tag: "Stap 2 van 3: Kennis van het Arabisch",
    step2Title: "Wat is het huidige niveau van uw kind in het Arabisch?",
    step2Desc: "Geen zorgen als uw kind nog geen ervaring heeft — de meesten beginnen helemaal vanaf nul.",
    backToAge: "← Terug naar leeftijd",
    nextToGoal: "Volgende: Hoofddoel",
    step3Tag: "Stap 3 van 3: Leerdoel",
    step3Title: "Wat is uw belangrijkste doel voor uw kind dit jaar?",
    step3Desc: "We stemmen de lessen, studio's en oefeningen af op dit doel.",
    backToProficiency: "← Terug naar niveau",
    generatePlan: "Toon gepersonaliseerd leertraject",
    microCohortBadge: "Micro-groep (max 6 leerlingen)",
    trackSuffix: "Traject",
    weeklyCommitmentLabel: "Aanbevolen wekelijkse inzet",
    certifiedMentor: "Gecertificeerde moedertaaldocent",
    roadmapTitle: "12-Weken Stappenplan van uw kind",
    cefrBenchmark: "Afgestemd op CEFR-normen",
    retakeAssessment: "Opnieuw beoordelen",
    speakAdvisor: "Spreek met een studieadviseur",
    claimTrial: "Start gratis proefperiode voor dit traject",
  },
  tr: {
    topBadge: "60 Saniyelik Ücretsiz Seviye Belirleme",
    topTitle: "Çocuğunuz İçin İdeal Seviyeyi ve Öğrenme Grubunu Keşfedin",
    topDesc: "Çocuğunuzun CEFR seviyesini, önerilen grubunu ve 12 haftalık yol haritasını hesaplamak için 3 kısa soruyu yanıtlayın.",
    step1Tag: "Adım 1 / 3: Yaş Grubu",
    step1Title: "Çocuğunuz kaç yaşında?",
    step1Desc: "En iyi sosyal ve pedagojik uyum için çocukları yaşlarına göre gruplandırıyoruz.",
    nextToLevel: "İleri: Mevcut Arapça Seviyesi",
    step2Tag: "Adım 2 / 3: Dil Bilgisi",
    step2Title: "Çocuğunuzun mevcut Arapça bilgisi ne düzeyde?",
    step2Desc: "Hiç deneyimi yoksa endişelenmeyin — öğrencilerimizin çoğu sıfırdan başlar.",
    backToAge: "← Yaş seçimine dön",
    nextToGoal: "İleri: Temel Hedef",
    step3Tag: "Adım 3 / 3: Temel Öğrenme Hedefi",
    step3Title: "Bu yıl çocuğunuz için en önemli hedefiniz nedir?",
    step3Desc: "Ders temalarını, stüdyoları ve ödevleri bu hedefe göre özelleştiriyoruz.",
    backToProficiency: "← Seviyeye dön",
    generatePlan: "Kişiselleştirilmiş Planı Oluştur",
    microCohortBadge: "Mikro Grup (Maks 6 Öğrenci)",
    trackSuffix: "Seviyesi",
    weeklyCommitmentLabel: "Önerilen Haftalık Çalışma",
    certifiedMentor: "Sertifikalı Ana Dili Eğitmen",
    roadmapTitle: "Çocuğunuzun 12 Haftalık Yol Haritası",
    cefrBenchmark: "CEFR Standartlarıyla Uyumlu",
    retakeAssessment: "Değerlendirmeyi Yeniden Yap",
    speakAdvisor: "Akademik Danışmanla Görüş",
    claimTrial: "Bu Seviye İçin Ücretsiz Denemeyi Başlat",
  },
  it: {
    topBadge: "Diagnostica gratuita di livello in 60 secondi",
    topTitle: "Scopri il livello ideale e il micro-gruppo per tuo figlio",
    topDesc: "Rispondi a 3 rapide domande per calcolare il livello CEFR, il gruppo consigliato e la tabella di marcia di 12 settimane.",
    step1Tag: "Passo 1 di 3: Fascia d'età",
    step1Title: "Quanti anni ha tuo figlio?",
    step1Desc: "Inseriamo i bambini in gruppi omogenei per età per garantire il miglior coinvolgimento.",
    nextToLevel: "Avanti: Livello attuale",
    step2Tag: "Passo 2 di 3: Conoscenza dell'arabo",
    step2Title: "Qual è l'attuale livello di arabo di tuo figlio?",
    step2Desc: "Non preoccuparti se parte da zero: la maggior parte dei nostri studenti inizia senza basi.",
    backToAge: "← Torna alla selezione dell'età",
    nextToGoal: "Avanti: Obiettivo principale",
    step3Tag: "Passo 3 di 3: Obiettivo principale",
    step3Title: "Qual è il tuo obiettivo principale per tuo figlio quest'anno?",
    step3Desc: "Personalizzeremo le lezioni, gli studi interattivi e gli esercizi su questo obiettivo.",
    backToProficiency: "← Torna al livello",
    generatePlan: "Genera piano personalizzato",
    microCohortBadge: "Micro-gruppo (Max 6 studenti)",
    trackSuffix: "Percorso",
    weeklyCommitmentLabel: "Impegno settimanale consigliato",
    certifiedMentor: "Docente madrelingua certificato",
    roadmapTitle: "Tabella di marcia di 12 settimane",
    cefrBenchmark: "Allineato ai parametri CEFR",
    retakeAssessment: "Ripeti il test",
    speakAdvisor: "Parla con un consulente accademico",
    claimTrial: "Richiedi prova gratuita per questo percorso",
  },
  es: {
    topBadge: "Diagnóstico gratuito de nivel en 60 segundos",
    topTitle: "Encuentra el nivel ideal y el grupo perfecto para tu hijo",
    topDesc: "Responde 3 preguntas rápidas para calcular el nivel CEFR de tu hijo, la cohorte recomendada y la ruta de 12 semanas.",
    step1Tag: "Paso 1 de 3: Grupo de edad",
    step1Title: "¿Cuántos años tiene tu hijo?",
    step1Desc: "Agrupamos a los alumnos por edades cercanas para garantizar la mejor interacción y ritmo.",
    nextToLevel: "Siguiente: Nivel actual de árabe",
    step2Tag: "Paso 2 de 3: Conocimientos previos",
    step2Title: "¿Cuál es el conocimiento actual de árabe de tu hijo?",
    step2Desc: "No te preocupes si parte de cero: la mayoría de nuestros alumnos en la diáspora comienzan desde el principio.",
    backToAge: "← Volver a la selección de edad",
    nextToGoal: "Siguiente: Objetivo principal",
    step3Tag: "Paso 3 de 3: Objetivo principal",
    step3Title: "¿Cuál es tu meta principal para tu hijo este año?",
    step3Desc: "Adaptaremos los temas de clase, los estudios interactivos y los juegos a este objetivo.",
    backToProficiency: "← Volver al nivel",
    generatePlan: "Generar plan personalizado",
    microCohortBadge: "Microcohorte (Máx 6 alumnos)",
    trackSuffix: "Nivel",
    weeklyCommitmentLabel: "Dedicación semanal recomendada",
    certifiedMentor: "Profesor nativo certificado",
    roadmapTitle: "Hoja de ruta de 12 semanas de tu hijo",
    cefrBenchmark: "Alineado con estándares CEFR",
    retakeAssessment: "Repetir evaluación",
    speakAdvisor: "Hablar con un asesor académico",
    claimTrial: "Solicitar prueba gratuita para este nivel",
  },
  en: {
    topBadge: "Free 60-Second Placement Diagnostic",
    topTitle: "Find the Perfect Level & Micro-Cohort for Your Child",
    topDesc: "Answer 3 quick questions to calculate your child's CEFR level, recommended cohort, and 12-week milestone roadmap.",
    step1Tag: "Step 1 of 3: Age Group",
    step1Title: "How old is your child?",
    step1Desc: "We place children in age-aligned cohorts to ensure peer engagement and optimal pedagogical pacing.",
    nextToLevel: "Next: Current Arabic Level",
    step2Tag: "Step 2 of 3: Current Arabic Familiarity",
    step2Title: "What is your child's current Arabic knowledge?",
    step2Desc: "Don't worry if your child has zero prior experience—most of our diaspora learners start from scratch.",
    backToAge: "← Back to Age Selection",
    nextToGoal: "Next: Primary Learning Goal",
    step3Tag: "Step 3 of 3: Primary Goal",
    step3Title: "What is your main goal for your child this year?",
    step3Desc: "We tailor lesson themes, interactive studios, and homework games to this goal.",
    backToProficiency: "← Back to Proficiency",
    generatePlan: "Generate Personalized Plan",
    microCohortBadge: "Micro-Cohort (Max 6 Students)",
    trackSuffix: "Track",
    weeklyCommitmentLabel: "Recommended Commitment",
    certifiedMentor: "Certified Native Arabic Mentor",
    roadmapTitle: "Your Child's 12-Week Milestone Roadmap",
    cefrBenchmark: "CEFR Benchmark Aligned",
    retakeAssessment: "Retake Assessment",
    speakAdvisor: "Speak with Academic Advisor",
    claimTrial: "Claim 1-Day Free Trial for This Track",
  },
};

const AGE_OPTIONS_DATA: Record<string, { label: Record<string, string>; sub: Record<string, string>; icon: string }> = {
  "4-6": {
    label: {
      ar: "الأعمار 4 - 6 سنوات",
      nl: "Leeftijd 4 - 6 jaar",
      tr: "4 - 6 Yaş",
      it: "Età 4 - 6 anni",
      es: "Edades 4 - 6 años",
      en: "Ages 4 - 6",
    },
    sub: {
      ar: "براعم العربية • وعي صوتي وتأسيس مبكر",
      nl: "Vroege Knoppen • Zintuiglijk & Klanken",
      tr: "İlk Filizler • Duyusal ve Fonetik",
      it: "Primi Germogli • Sensoriale e Fonetica",
      es: "Primeros Brotes • Sensorial y Fonética",
      en: "Early Sprouts • Sensory & Phonics",
    },
    icon: "🌱",
  },
  "7-10": {
    label: {
      ar: "الأعمار 7 - 10 سنوات",
      nl: "Leeftijd 7 - 10 jaar",
      tr: "7 - 10 Yaş",
      it: "Età 7 - 10 anni",
      es: "Edades 7 - 10 años",
      en: "Ages 7 - 10",
    },
    sub: {
      ar: "المستكشف الصغير • قراءة وطلاقة",
      nl: "Jonge Ontdekkers • Geletterdheid & Vloeiendheid",
      tr: "Genç Kâşifler • Okuma ve Akıcılık",
      it: "Giovani Esploratori • Alfabetizzazione e Fluenza",
      es: "Jóvenes Exploradores • Alfabetización y Fluidez",
      en: "Junior Explorers • Literacy & Fluency",
    },
    icon: "🚀",
  },
  "11-13": {
    label: {
      ar: "الأعمار 11 - 13 سنة",
      nl: "Leeftijd 11 - 13 jaar",
      tr: "11 - 13 Yaş",
      it: "Età 11 - 13 anni",
      es: "Edades 11 - 13 años",
      en: "Ages 11 - 13",
    },
    sub: {
      ar: "رواد الفصاحة • نحو وتجويد",
      nl: "Vloeiende Pioniers • Grammatica & Tajweed",
      tr: "Akıcı Öncüler • Dilbilgisi ve Tecvid",
      it: "Pionieri Fluente • Grammatica e Tajweed",
      es: "Pioneros Fluidos • Gramática y Taywid",
      en: "Fluent Pioneers • Grammar & Tajweed",
    },
    icon: "🧭",
  },
  "14-17": {
    label: {
      ar: "الأعمار 14 - 17 سنة",
      nl: "Leeftijd 14 - 17 jaar",
      tr: "14 - 17 Yaş",
      it: "Età 14 - 17 anni",
      es: "Edades 14 - 17 años",
      en: "Ages 14 - 17",
    },
    sub: {
      ar: "علماء المستقبل • بلاغة وإتقان",
      nl: "Jonge Geleerden • Gevorderde Retorica",
      tr: "Genç Âlimler • İleri Belagat",
      it: "Giovani Studiosi • Retorica Avanzata",
      es: "Jóvenes Eruditos • Retórica Avanzada",
      en: "Young Scholars • Advanced Rhetoric",
    },
    icon: "🎓",
  },
};

const PROFICIENCY_OPTIONS_DATA: Record<string, { label: Record<string, string>; sub: Record<string, string>; icon: string }> = {
  beginner: {
    label: {
      ar: "مبتدئ تماماً",
      nl: "Absolute beginner",
      tr: "Tam Başlangıç",
      it: "Principiante Assoluto",
      es: "Principiante Absoluto",
      en: "Absolute Beginner",
    },
    sub: {
      ar: "لم يتعلم الحروف بعد، يبدأ من الصفر تماماً.",
      nl: "Nog nooit Arabische letters geleerd; begint helemaal vanaf nul.",
      tr: "Henüz Arapça harfleri öğrenmedi; tamamen sıfırdan başlıyor.",
      it: "Non ha mai imparato le lettere arabe; parte completamente da zero.",
      es: "Nunca ha aprendido las letras árabes; comienza desde cero.",
      en: "Never learned Arabic letters; starting completely from scratch.",
    },
    icon: "✏️",
  },
  "knows-letters": {
    label: {
      ar: "يعرف الحروف",
      nl: "Herkent letters",
      tr: "Harfleri Tanıyor",
      it: "Riconosce le lettere",
      es: "Reconoce letras",
      en: "Recognizes Letters",
    },
    sub: {
      ar: "يميز بعض أشكال الحروف لكنه يجد صعوبة في وصلها وقراءة الكلمات.",
      nl: "Kan sommige letters herkennen, maar heeft moeite met woorden vormen.",
      tr: "Bazı harfleri tanıyor ancak bunları kelimelere bağlamakta zorlanıyor.",
      it: "Riconosce alcune lettere, ma fatica a unirle nelle parole.",
      es: "Reconoce algunas letras, pero le cuesta unirlas para formar palabras.",
      en: "Can identify some alphabet letters, but struggles to join them into words.",
    },
    icon: "🧩",
  },
  "early-reader": {
    label: {
      ar: "قارئ مبتدئ بالحركات",
      nl: "Beginnende lezer (Harakat)",
      tr: "Erken Okuyucu (Harekeli)",
      it: "Lettore principiante (Harakat)",
      es: "Lector inicial (Harakat)",
      en: "Early Reader (Harakat)",
    },
    sub: {
      ar: "يستطيع تهجئة الكلمات القصيرة تدريجياً بالحركات (الفتحة، الكسرة، الضمة).",
      nl: "Kan langzaam korte woorden met Fatha, Kasra en Damma lezen.",
      tr: "Fetha, Kesra ve Damme ile kısa kelimeleri yavaşça okuyabilir.",
      it: "Legge lentamente parole corte con Fatha, Kasra e Damma.",
      es: "Puede leer lentamente palabras cortas con Fatha, Kasra y Damma.",
      en: "Can slowly sound out short words with Fatha, Kasra, and Damma.",
    },
    icon: "📖",
  },
  "heritage-speaker": {
    label: {
      ar: "يتحدث في المنزل ولا يقرأ",
      nl: "Moedertaalspreker thuis",
      tr: "Evde Konuşan / Anadili",
      it: "Parlante a casa (Heritage)",
      es: "Hablante de herencia en casa",
      en: "Heritage / Home Speaker",
    },
    sub: {
      ar: "يفهم ويتحدث العربية مع العائلة لكنه لا يستطيع القراءة أو الكتابة الأكاديمية.",
      nl: "Spreekt of begrijpt Arabisch thuis, maar kan niet lezen of schrijven.",
      tr: "Evde Arapça anlıyor veya konuşuyor, ancak okuma yazma bilmiyor.",
      it: "Capisce o parla arabo a casa, ma non sa leggere né scrivere.",
      es: "Entiende o habla árabe en casa, pero no sabe leer ni escribir.",
      en: "Understands or speaks conversational Arabic at home, but cannot read or write.",
    },
    icon: "🗣️",
  },
  "advanced-quran": {
    label: {
      ar: "يقرأ القرآن / متوسط",
      nl: "Koranlezer / Gevorderd",
      tr: "Kuran Okuyucusu / Orta Düzey",
      it: "Lettore del Corano / Intermedio",
      es: "Lector del Corán / Intermedio",
      en: "Quran Reader / Intermediate",
    },
    sub: {
      ar: "يقرأ نصوص المصحف الشريف ويسعى لإتقان أحكام التجويد ومخارج الحروف وفهم المعاني.",
      nl: "Kan korantekst lezen; zoekt precisie in tajweed en taalbegrip.",
      tr: "Kuran metnini okuyabilir; tecvid hassasiyeti ve dil anlayışı arıyor.",
      it: "Legge testi coranici; cerca precisione nel tajweed e comprensione.",
      es: "Puede leer el Corán; busca precisión en el taywid y comprensión.",
      en: "Can read Quranic text; seeks Tajweed precision and language comprehension.",
    },
    icon: "🌟",
  },
};

const GOAL_OPTIONS_DATA: Record<string, { label: Record<string, string>; sub: Record<string, string>; icon: string }> = {
  quran: {
    label: {
      ar: "تلاوة القرآن الكريم والتجويد",
      nl: "Koranrecitatie & Tajweed",
      tr: "Kuran Tilaveti ve Tecvid",
      it: "Recitazione del Corano e Tajweed",
      es: "Recitación del Corán y Taywid",
      en: "Quran Recitation & Tajweed",
    },
    sub: {
      ar: "إتقان مخارج الحروف، التلاوة السليمة، وحفظ السور الكريمة بإتقان.",
      nl: "Beheers makharij, vloeiende recitatie en memoriseer soera's.",
      tr: "Mahreçleri ve akıcı tilaveti öğrenin, sureleri ezberleyin.",
      it: "Padroneggia i makharij, recitazione fluida e memorizzazione di sure.",
      es: "Domina los majárij, recitación fluida y memoriza suras.",
      en: "Master makharij, smooth recitation, and memorize sacred Surahs.",
    },
    icon: "🕌",
  },
  speaking: {
    label: {
      ar: "المحادثة والطلاقة الشفوية",
      nl: "Gesproken Arabisch & Conversatie",
      tr: "Konuşma Arapçası ve Günlük Diyalog",
      it: "Arabo Parlato e Conversazione Quotidiana",
      es: "Árabe Hablado y Conversación Diaria",
      en: "Spoken Arabic & Daily Conversation",
    },
    sub: {
      ar: "بناء الثقة للتحدث بطلاقة مع الأهل والأصدقاء في الحياة اليومية.",
      nl: "Bouw zelfvertrouwen op om vloeiend Arabisch te spreken met familie.",
      tr: "Aile ve arkadaşlarla akıcı Arapça konuşma özgüveni kazanın.",
      it: "Sviluppa la sicurezza per parlare arabo fluente in famiglia.",
      es: "Desarrolla confianza para hablar árabe con fluidez.",
      en: "Build confidence to speak fluent Arabic with family and peers.",
    },
    icon: "💬",
  },
  academic: {
    label: {
      ar: "القراءة والكتابة والنحو الأكاديمي",
      nl: "Volledige academische geletterdheid",
      tr: "Tam Akademik Okuryazarlık (Okuma & Yazma)",
      it: "Alfabetizzazione Accademica Completa",
      es: "Alfabetización Académica Completa",
      en: "Full Academic Literacy (Read & Write)",
    },
    sub: {
      ar: "منهج أكاديمي متكامل يغطي القراءة، الإملاء، والقواعد النحوية والصرفية.",
      nl: "Gestructureerde CEFR-beheersing van lezen, spelling en grammatica.",
      tr: "Okuma, yazım ve dilbilgisi kurallarını kapsayan CEFR müfredatı.",
      it: "Padronanza strutturata CEFR di lettura, ortografia e grammatica.",
      es: "Dominio estructurado CEFR de lectura, ortografía y gramática.",
      en: "Structured CEFR mastery covering reading, spelling, and grammar rules.",
    },
    icon: "📚",
  },
  heritage: {
    label: {
      ar: "تعزيز الهوية الإسلامية والارتباط باللغة",
      nl: "Islamitische identiteit & Culturele band",
      tr: "İslami Kimlik ve Kültürel Bağlantı",
      it: "Identità Islamica e Connessione Culturale",
      es: "Identidad Islámica y Conexión Cultural",
      en: "Islamic Identity & Cultural Connection",
    },
    sub: {
      ar: "الارتباط بالقصص النبوية، القيم والأخلاق الإسلامية، والهوية الثقافية.",
      nl: "Verbinding met profetische verhalen, waarden en erfgoed.",
      tr: "Peygamber kıssaları, İslami değerler ve kültürel miras ile bağ kurun.",
      it: "Connettiti con le storie profetiche, i valori e l'eredità culturale.",
      es: "Conéctate con historias proféticas, valores y herencia cultural.",
      en: "Connect with prophetic stories, Islamic values, and cultural heritage.",
    },
    icon: "✨",
  },
};

export function InteractivePlacementCalculator({
  locale,
  isRtl = false,
}: InteractivePlacementCalculatorProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [ageGroup, setAgeGroup] = useState<string>("7-10");
  const [currentLevel, setCurrentLevel] = useState<string>("beginner");
  const [learningGoal, setLearningGoal] = useState<string>("quran");

  const ui = WIZARD_UI[locale] || WIZARD_UI.en;
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const computeResult = (): AssessmentResult => {
    let cefrLevel = "A1";
    let cohortTitle = "Junior Explorers Micro-Cohort";
    let targetFocus = "Phonemic awareness, sound blending & core vocabulary";

    if (locale === "ar") {
      cohortTitle = "مجموعة المستكشف الصغير المصغرة";
      targetFocus = "الوعي الصوتي، تركيب الحروف والمفردات الأساسية";
    } else if (locale === "nl") {
      cohortTitle = "Jonge Ontdekkers Micro-Groep";
      targetFocus = "Klankbewustzijn, letters samenvoegen & basiswoordenschat";
    } else if (locale === "tr") {
      cohortTitle = "Genç Kâşifler Mikro Grubu";
      targetFocus = "Fonemik farkındalık, ses birleştirme ve temel kelime bilgisi";
    } else if (locale === "it") {
      cohortTitle = "Micro-Gruppo Giovani Esploratori";
      targetFocus = "Consapevolezza fonemica, fusione dei suoni e vocabolario di base";
    } else if (locale === "es") {
      cohortTitle = "Microcohorte Jóvenes Exploradores";
      targetFocus = "Conciencia fonémica, combinación de sonidos y vocabulario básico";
    }

    if (ageGroup === "4-6" || currentLevel === "beginner") {
      cefrLevel = "Pre-A1";
      if (locale === "ar") {
        cohortTitle = "مجموعة براعم التأسيس المبكر";
        targetFocus = "صوتيات الحروف، رسم المسارات، والتمييز السمعي للأصوات";
      } else if (locale === "nl") {
        cohortTitle = "Vroege Knoppen Basisgroep";
        targetFocus = "Alfabetklanken, schrijfpatronen en auditieve herkenning";
      } else if (locale === "tr") {
        cohortTitle = "İlk Filizler Temel Grubu";
        targetFocus = "Alfabe sesleri, çizgi takibi ve işitsel ayırt etme";
      } else if (locale === "it") {
        cohortTitle = "Gruppo Fondamenta Primi Germogli";
        targetFocus = "Fonetica dell'alfabeto, tracciamento e discriminazione uditiva";
      } else if (locale === "es") {
        cohortTitle = "Cohorte Fundacional Primeros Brotes";
        targetFocus = "Fonética del alfabeto, trazos y discriminación auditiva";
      } else {
        cohortTitle = "Early Sprouts Foundation Cohort";
        targetFocus = "Alphabet phonics, stroke tracing, and auditory discrimination";
      }
    } else if (currentLevel === "knows-letters" || currentLevel === "heritage-speaker") {
      cefrLevel = "A1";
      if (locale === "ar") {
        cohortTitle = "مجموعة بناة الكلمات للمستكشف الصغير";
        targetFocus = "قواعد اتصال الحروف، دمج الجذور الثلاثية والمحادثة النشطة";
      } else if (locale === "nl") {
        cohortTitle = "Woordenbouwers Micro-Groep";
        targetFocus = "Letterverbindingsregels, 3-letterwortels en actieve dialoog";
      } else if (locale === "tr") {
        cohortTitle = "Kelime Kurucuları Mikro Grubu";
        targetFocus = "Harf birleştirme kuralları, kök türetme ve aktif konuşma";
      } else if (locale === "it") {
        cohortTitle = "Gruppo Costruttori di Parole";
        targetFocus = "Regole di unione delle lettere, radici e conversazione attiva";
      } else if (locale === "es") {
        cohortTitle = "Cohorte Constructores de Palabras";
        targetFocus = "Reglas de unión de letras, raíces trilíteras y diálogo activo";
      } else {
        cohortTitle = "Junior Explorers Word-Builder Cohort";
        targetFocus = "Letter-joining rules, 3-letter root synthesis & active conversation";
      }
    } else if (currentLevel === "early-reader") {
      cefrLevel = "A2";
      if (locale === "ar") {
        cohortTitle = "مجموعة رواد الفصاحة للقراءة والتجويد";
        targetFocus = "طلاقة الجمل، التنوين والمدود، والقصص التفاعلية المصورة";
      } else if (locale === "nl") {
        cohortTitle = "Vloeiende Pioniers Lezen & Tajweed";
        targetFocus = "Zinsvloeiendheid, Tanween, Madd-regels en interactieve verhalen";
      } else if (locale === "tr") {
        cohortTitle = "Akıcı Öncüler Okuma ve Tecvid Grubu";
        targetFocus = "Cümle akıcılığı, Tenvin, Med kuralları ve interaktif hikayeler";
      } else if (locale === "it") {
        cohortTitle = "Gruppo Pionieri Lettura & Tajweed";
        targetFocus = "Fluenza delle frasi, Tanween, regole Madd e storie interattive";
      } else if (locale === "es") {
        cohortTitle = "Cohorte Pioneros de Lectura y Taywid";
        targetFocus = "Fluidez de oraciones, Tanween, reglas de Madd e historias interactivas";
      } else {
        cohortTitle = "Fluent Pioneers Reading & Tajweed Cohort";
        targetFocus = "Sentence fluency, Tanween, Madd rules, and interactive stories";
      }
    } else {
      cefrLevel = "B1";
      if (locale === "ar") {
        cohortTitle = "مجموعة علماء المستقبل للإتقان والبلاغة";
        targetFocus = "تأهيل إجازة التجويد، النحو الكلاسيكي، والحوارات البلاغية المعبرة";
      } else if (locale === "nl") {
        cohortTitle = "Jonge Geleerden Gevorderde Tajweed & Retorica";
        targetFocus = "Idjaza-voorbereiding, klassieke grammatica en welsprekendheid";
      } else if (locale === "tr") {
        cohortTitle = "Genç Âlimler İleri Tecvid ve Belagat Grubu";
        targetFocus = "Kuran İcazet hazırlığı, klasik dilbilgisi ve etkili diyalog";
      } else if (locale === "it") {
        cohortTitle = "Gruppo Giovani Studiosi Tajweed & Retorica";
        targetFocus = "Preparazione Ijazah, grammatica classica e dialoghi espressivi";
      } else if (locale === "es") {
        cohortTitle = "Cohorte Jóvenes Eruditos Taywid y Retórica";
        targetFocus = "Preparación de Iyazah, gramática clásica y diálogo elocuente";
      } else {
        cohortTitle = "Young Scholars Advanced Tajweed & Rhetoric Cohort";
        targetFocus = "Quranic Tajweed Ijazah prep, classical grammar & expressive dialogue";
      }
    }

    const commitmentText: Record<string, string> = {
      ar: "حصتان مباشرتان أسبوعياً (45 دقيقة) + 15 دقيقة تدريب تفاعلي",
      nl: "2 live lessen per week (45 min) + 15 min oefening via interactieve games",
      tr: "Haftada 2 canlı grup dersi (45 dk) + 15 dk oyunlaştırılmış pratik",
      it: "2 lezioni dal vivo a settimana (45 min) + 15 min di pratica con giochi",
      es: "2 clases en vivo por semana (45 min) + 15 min de práctica interactiva",
      en: "2 Live Micro-Cohort Classes (45 min) + 15 min Gamified Practice",
    };

    const phase1Title: Record<string, string> = {
      ar: "الأسابيع 1 - 4: التمييز الصوتي ومخارج الحروف",
      nl: "Weken 1 - 4: Klankherkenning & Makharij",
      tr: "1 - 4. Haftalar: Ses Tanıma ve Mahreçler",
      it: "Settimane 1 - 4: Riconoscimento dei suoni e Makharij",
      es: "Semanas 1 - 4: Reconocimiento auditivo y Majárij",
      en: "Weeks 1 - 4: Core Recognition & Makharij",
    };
    const phase1Desc: Record<string, string> = {
      ar: "تدريبات نطق مركزة وتحليل مخارج الحروف مع المعلم المتخصص.",
      nl: "Gerichte uitspraakoefeningen en interactief overtrekken met onze docent.",
      tr: "Uzman eğitmenimizle hedefe yönelik telaffuz çalışmaları ve çizgi takibi.",
      it: "Esercizi mirati di pronuncia e tracciamento interattivo con il docente.",
      es: "Ejercicios guiados de pronunciación y trazo interactivo con el profesor.",
      en: "Targeted pronunciation drills and interactive tracing with our native specialist.",
    };

    const phase2Title: Record<string, string> = {
      ar: "الأسابيع 5 - 8: وصل الحركات وتركيب الكلمات",
      nl: "Weken 5 - 8: Letterverbindingen & Klinkervloeiendheid",
      tr: "5 - 8. Haftalar: Harf Birleştirme ve Harekeler",
      it: "Settimane 5 - 8: Unione delle lettere e Harakat",
      es: "Semanas 5 - 8: Unión de letras y fluidez con Harakat",
      en: "Weeks 5 - 8: Word Joining & Harakat Fluency",
    };
    const phase2Desc: Record<string, string> = {
      ar: "إتقان الحركات والمدود ودمج الكلمات عبر استوديو ألعاب الحروف.",
      nl: "Beheersing van klinkers, verlengingen en 3-letterwoorden via Phonics Arcade.",
      tr: "Harf oyunları ile harekeleri ve 3 harfli kelimeleri ustalıkla öğrenme.",
      it: "Padroneggiare Fatha, Kasra, Damma e radici di 3 lettere con giochi fonetici.",
      es: "Dominio de Fatha, Kasra, Damma y raíces de 3 letras en la sala de juegos fonéticos.",
      en: "Mastering Fatha, Kasra, Damma, and combining 3-letter roots with Phonics Arcade.",
    };

    const phase3Title: Record<string, string> = {
      ar: "الأسابيع 9 - 12: القراءة المستقلة والمحادثة",
      nl: "Weken 9 - 12: Zelfstandig Lezen & Gesprek",
      tr: "9 - 12. Haftalar: Bağımsız Okuma ve Konuşma",
      it: "Settimane 9 - 12: Lettura Autonoma e Conversazione",
      es: "Semanas 9 - 12: Lectura Independiente y Conversación",
      en: "Weeks 9 - 12: Independent Reading & Conversation",
    };
    const phase3Desc: Record<string, string> = {
      ar: "تلاوة آيات قرآنية كاملة والتحدث في مواقف حوارية واقعية بثقة تامة.",
      nl: "Volledige koranverzen lezen en met zelfvertrouwen spreken in alledaagse situaties.",
      tr: "Kuran ayetlerini bağımsız okuma ve günlük diyaloglarda özgüvenle konuşma.",
      it: "Lettura di versetti coranici completi e conversazione sicura in contesti quotidiani.",
      es: "Lectura fluida de aleyas coránicas y expresión oral segura en situaciones cotidianas.",
      en: "Reading complete Quranic Ayahs and speaking in authentic everyday scenarios.",
    };

    return {
      cefrLevel,
      cohortTitle,
      targetFocus,
      milestones: {
        phase1: {
          title: phase1Title[locale] || phase1Title.en,
          desc: phase1Desc[locale] || phase1Desc.en,
        },
        phase2: {
          title: phase2Title[locale] || phase2Title.en,
          desc: phase2Desc[locale] || phase2Desc.en,
        },
        phase3: {
          title: phase3Title[locale] || phase3Title.en,
          desc: phase3Desc[locale] || phase3Desc.en,
        },
      },
      recommendedPlanId: "plan-individual",
      recommendedPlanName: "Individual Student Plan",
      weeklyCommitment: commitmentText[locale] || commitmentText.en,
    };
  };

  const result = computeResult();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/70 overflow-hidden">
      {/* Top Banner / Progress Indicator */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>{ui.topBadge}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {ui.topTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {ui.topDesc}
            </p>
          </div>

          {/* Step Badges */}
          <div className="flex items-center gap-2 shrink-0">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-brand-500 text-white ring-4 ring-brand-500/20"
                    : step > s
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6 sm:p-10">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {ui.step1Tag}
              </span>
              <h4 className="text-xl font-bold text-slate-900">
                {ui.step1Title}
              </h4>
              <p className="text-xs text-slate-500">
                {ui.step1Desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(AGE_OPTIONS_DATA) as Array<keyof typeof AGE_OPTIONS_DATA>).map((ageId) => {
                const opt = AGE_OPTIONS_DATA[ageId];
                const label = opt.label[locale] || opt.label.en;
                const sub = opt.sub[locale] || opt.sub.en;

                return (
                  <button
                    key={ageId}
                    onClick={() => setAgeGroup(ageId)}
                    type="button"
                    className={`p-5 rounded-2xl border text-start transition-all flex items-start gap-4 ${
                      ageGroup === ageId
                        ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">
                      {opt.icon}
                    </span>
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-sm">
                        {label}
                      </h5>
                      <p className="text-xs text-slate-500">
                        {sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>{ui.nextToLevel}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {ui.step2Tag}
              </span>
              <h4 className="text-xl font-bold text-slate-900">
                {ui.step2Title}
              </h4>
              <p className="text-xs text-slate-500">
                {ui.step2Desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(PROFICIENCY_OPTIONS_DATA) as Array<keyof typeof PROFICIENCY_OPTIONS_DATA>).map((profId) => {
                const opt = PROFICIENCY_OPTIONS_DATA[profId];
                const label = opt.label[locale] || opt.label.en;
                const sub = opt.sub[locale] || opt.sub.en;

                return (
                  <button
                    key={profId}
                    onClick={() => setCurrentLevel(profId)}
                    type="button"
                    className={`p-5 rounded-2xl border text-start transition-all flex items-start gap-4 ${
                      currentLevel === profId
                        ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">
                      {opt.icon}
                    </span>
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-sm">
                        {label}
                      </h5>
                      <p className="text-xs text-slate-500">
                        {sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(1)}
                type="button"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {ui.backToAge}
              </button>
              <button
                onClick={() => setStep(3)}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>{ui.nextToGoal}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {ui.step3Tag}
              </span>
              <h4 className="text-xl font-bold text-slate-900">
                {ui.step3Title}
              </h4>
              <p className="text-xs text-slate-500">
                {ui.step3Desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(GOAL_OPTIONS_DATA) as Array<keyof typeof GOAL_OPTIONS_DATA>).map((goalId) => {
                const opt = GOAL_OPTIONS_DATA[goalId];
                const label = opt.label[locale] || opt.label.en;
                const sub = opt.sub[locale] || opt.sub.en;

                return (
                  <button
                    key={goalId}
                    onClick={() => setLearningGoal(goalId)}
                    type="button"
                    className={`p-5 rounded-2xl border text-start transition-all flex items-start gap-4 ${
                      learningGoal === goalId
                        ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">
                      {opt.icon}
                    </span>
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-sm">
                        {label}
                      </h5>
                      <p className="text-xs text-slate-500">
                        {sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                type="button"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {ui.backToProficiency}
              </button>
              <button
                onClick={() => setStep(4)}
                type="button"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-md shadow-brand-500/25 hover:opacity-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{ui.generatePlan}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results & Tailored Roadmap */}
        {step === 4 && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Badge & Level */}
            <div className="bg-gradient-to-r from-brand-50 via-purple-50 to-indigo-50 border border-brand-200/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-brand-600 text-white font-black text-xs uppercase tracking-wider">
                    {result.cefrLevel} {ui.trackSuffix}
                  </span>
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    {ui.microCohortBadge}
                  </span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {result.cohortTitle}
                </h4>
                <p className="text-sm text-slate-600 max-w-xl">
                  {result.targetFocus}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0 flex flex-col gap-2 min-w-[220px]">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {ui.weeklyCommitmentLabel}
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {result.weeklyCommitment}
                </p>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold pt-1 border-t border-slate-100">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{ui.certifiedMentor}</span>
                </div>
              </div>
            </div>

            {/* 12-Week Roadmap */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Compass className="w-5 h-5 text-brand-600" />
                  <span>{ui.roadmapTitle}</span>
                </h5>
                <span className="text-xs text-slate-500">
                  {ui.cefrBenchmark}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 relative">
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center mb-3">
                    1
                  </div>
                  <h6 className="font-bold text-slate-900 text-sm mb-1">
                    {result.milestones.phase1.title}
                  </h6>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {result.milestones.phase1.desc}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 relative">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center mb-3">
                    2
                  </div>
                  <h6 className="font-bold text-slate-900 text-sm mb-1">
                    {result.milestones.phase2.title}
                  </h6>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {result.milestones.phase2.desc}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                    3
                  </div>
                  <h6 className="font-bold text-slate-900 text-sm mb-1">
                    {result.milestones.phase3.title}
                  </h6>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {result.milestones.phase3.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <button
                onClick={() => setStep(1)}
                type="button"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{ui.retakeAssessment}</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href={`/${locale}/contact?inquiry=placement&age=${ageGroup}&level=${currentLevel}`}
                  className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all text-center"
                >
                  {ui.speakAdvisor}
                </Link>
                <Link
                  href={`/${locale}/register?plan=${result.recommendedPlanId}&age=${ageGroup}&level=${result.cefrLevel}&trial=1`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white text-xs font-bold shadow-md shadow-brand-500/25 hover:opacity-95 transition-all text-center flex-1 sm:flex-initial"
                >
                  <span>{ui.claimTrial}</span>
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
