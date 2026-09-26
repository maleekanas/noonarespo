"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Cpu,
  Compass,
  Lightbulb,
  Atom,
  Binary,
  Shapes,
  Music,
  Calculator,
  TrendingUp,
  BrainCircuit,
  Zap,
} from "lucide-react";
import { type Locale } from "@/lib/localization";

interface HolisticLearningFrameworkProps {
  locale?: string;
  isRtl?: boolean;
}

interface StageTranslation {
  name: string;
  desc: string;
}

interface DimensionTranslation {
  title: string;
  desc: string;
}

interface DomainTranslation {
  name: string;
  example: string;
}

const BLOOM_DATA: Record<number, Record<Locale, StageTranslation>> = {
  1: {
    ar: {
      name: "تذكّر (Remember)",
      desc: "التعرف البصري والصوتي على الحروف، الحركات، واسترجاع المفردات الأساسية.",
    },
    en: {
      name: "Remember",
      desc: "Recognizing letter shapes, phonemes, vowels, and recalling core vocabulary.",
    },
    nl: {
      name: "Onthouden",
      desc: "Herkenning van lettervormen, klanken, klinkers en het ophalen van basiswoordenschat.",
    },
    tr: {
      name: "Hatırlama",
      desc: "Harf şekillerini, sesleri, harekeleri tanıma ve temel kelimeleri hatırlama.",
    },
    it: {
      name: "Ricordare",
      desc: "Riconoscimento delle forme delle lettere, fonemi, vocali e richiamo del vocabolario di base.",
    },
    es: {
      name: "Recordar",
      desc: "Reconocer formas de letras, fonemas, vocales y recordar el vocabulario básico.",
    },
  },
  2: {
    ar: {
      name: "فهم (Understand)",
      desc: "استيعاب معاني الكلمات والجمل، الربط بين الصوت والصورة، وفهم القصص القصيرة.",
    },
    en: {
      name: "Understand",
      desc: "Comprehending sentence meanings, audio-visual association, and short narrative context.",
    },
    nl: {
      name: "Begrijpen",
      desc: "Begrijpen van zinsbetekenissen, audiovisuele associatie en context van korte verhalen.",
    },
    tr: {
      name: "Anlama",
      desc: "Cümle anlamlarını kavrama, görsel-işitsel bağ kurma ve kısa hikaye bağlamını anlama.",
    },
    it: {
      name: "Comprendere",
      desc: "Comprensione del significato delle frasi, associazione audio-visiva e contesto di brevi racconti.",
    },
    es: {
      name: "Comprender",
      desc: "Comprender el significado de las oraciones, asociación audiovisual y contexto de relatos breves.",
    },
  },
  3: {
    ar: {
      name: "تطبيق (Apply)",
      desc: "توظيف القواعد في المحادثة، تركيب الجمل، ممارسة التجويد، والتعبير الشفهي.",
    },
    en: {
      name: "Apply",
      desc: "Using grammar in dialogue, constructing sentences, applying tajweed rules, and oral expression.",
    },
    nl: {
      name: "Toepassen",
      desc: "Grammatica gebruiken in dialogen, zinnen bouwen, tajweed toepassen en mondelinge expressie.",
    },
    tr: {
      name: "Uygulama",
      desc: "Diyalogda dilbilgisi kullanma, cümle kurma, tecvid kurallarını uygulama ve sözlü ifade.",
    },
    it: {
      name: "Applicare",
      desc: "Uso della grammatica nel dialogo, costruzione di frasi, applicazione del tajweed ed espressione orale.",
    },
    es: {
      name: "Aplicar",
      desc: "Uso de la gramática en el diálogo, construcción de oraciones, aplicación del taywid y expresión oral.",
    },
  },
  4: {
    ar: {
      name: "تحليل (Analyze)",
      desc: "تفكيك تراكيب الجمل، استخراج جذور الكلمات (علم الصرف)، والتمييز بين أوزان الشعر.",
    },
    en: {
      name: "Analyze",
      desc: "Dissecting syntax, extracting morphological root patterns, and distinguishing poetic meters.",
    },
    nl: {
      name: "Analyseren",
      desc: "Zinsbouw ontleden, morfologische woordwortels extraheren en poëtische ritmes onderscheiden.",
    },
    tr: {
      name: "Analiz Etme",
      desc: "Sözdizimini çözümleme, kök kelime kalıplarını çıkarma ve şiir ölçülerini ayırt etme.",
    },
    it: {
      name: "Analizzare",
      desc: "Analisi della sintassi, estrazione delle radici morfologiche e distinzione dei metri poetici.",
    },
    es: {
      name: "Analizar",
      desc: "Analizar la sintaxis, extraer raíces morfológicas y distinguir la métrica poética.",
    },
  },
  5: {
    ar: {
      name: "تقييم (Evaluate)",
      desc: "التقييم الذاتي لمخارج الحروف، مراجعة نصوص الزملاء، والنقد البناء للمناظرات.",
    },
    en: {
      name: "Evaluate",
      desc: "Self-correcting pronunciation, peer review of written essays, and constructive debate critique.",
    },
    nl: {
      name: "Evalueren",
      desc: "Zelfcorrectie van uitspraak, collegiale toetsing van opstellen en opbouwende debatkritiek.",
    },
    tr: {
      name: "Değerlendirme",
      desc: "Kendi telaffuzunu düzeltme, akran metinlerini inceleme ve yapıcı münazara eleştirisi.",
    },
    it: {
      name: "Valutare",
      desc: "Autocorrezione della pronuncia, revisione tra pari di testi e critica costruttiva nei dibattiti.",
    },
    es: {
      name: "Evaluar",
      desc: "Autocorrección de pronunciación, revisión por pares de redacciones y debate constructivo.",
    },
  },
  6: {
    ar: {
      name: "ابتكار (Create)",
      desc: "تأليف قصص أصلية، إلقاء خطب بليغة، وتصميم لوحات خطية ديوانية فنية.",
    },
    en: {
      name: "Create",
      desc: "Composing original stories, delivering persuasive speeches, and authoring artistic calligraphy.",
    },
    nl: {
      name: "Creëren",
      desc: "Oorspronkelijke verhalen schrijven, welsprekende toespraken houden en artistieke kalligrafie maken.",
    },
    tr: {
      name: "Yaratma",
      desc: "Özgün hikayeler yazma, etkileyici konuşmalar yapma ve sanatsal hat eserleri tasarlama.",
    },
    it: {
      name: "Creare",
      desc: "Composizione di storie originali, discorsi persuasivi e creazione di calligrafia artistica.",
    },
    es: {
      name: "Crear",
      desc: "Componer historias originales, dar discursos elocuentes y diseñar caligrafía artística.",
    },
  },
};

const BIDE_DATA: Record<string, Record<Locale, DimensionTranslation>> = {
  BROAD: {
    ar: {
      title: "شامل (Broad)",
      desc: "تغطية شاملة لـ 7 مسارات لغوية، أدبية، وتراثية، تربط الطفل بالثقافة العربية المتنوعة وعالمية الحضارة.",
    },
    en: {
      title: "Broad Coverage",
      desc: "Comprehensive coverage across 7 academic tracks, connecting children with rich pan-Arab heritage and global diaspora.",
    },
    nl: {
      title: "Brede Dekking (Broad)",
      desc: "Uitgebreide dekking over 7 leertrajecten die kinderen verbinden met het rijke Arabische erfgoed en de diaspora.",
    },
    tr: {
      title: "Kapsamlı (Broad)",
      desc: "Çocukları zengin Arap mirası ve küresel diaspora ile buluşturan 7 akademik alanın tamamını kapsar.",
    },
    it: {
      title: "Ampia Copertura (Broad)",
      desc: "Copertura completa attraverso 7 percorsi accademici che connettono i bambini con il ricco patrimonio arabo.",
    },
    es: {
      title: "Cobertura Amplia (Broad)",
      desc: "Cobertura integral a través de 7 trayectorias académicas que conectan a los niños con la rica herencia árabe.",
    },
  },
  INSPIRING: {
    ar: {
      title: "ملهم (Inspiring)",
      desc: "قصص تاريخية لأعلام الحضارة (ابن بطوطة، الخوارزمي)، تحفيز بالألعاب، وأوسمة تغرس الاعتزاز بالهوية.",
    },
    en: {
      title: "Inspiring Narratives",
      desc: "Historic narratives of iconic scholars, gamified learning quests, and identity badges that ignite pride.",
    },
    nl: {
      title: "Inspirerend (Inspiring)",
      desc: "Historische verhalen over grote geleerden, spelenderwijs leren en badges die trots op identiteit wekken.",
    },
    tr: {
      title: "İlham Verici (Inspiring)",
      desc: "Tarihi bilginlerin öyküleri, oyunlaştırılmış görevler ve kimlik bilincini pekiştiren başarı rozetleri.",
    },
    it: {
      title: "Ispirante (Inspiring)",
      desc: "Narrazioni storiche di grandi studiosi, missioni di apprendimento gamificate e badge che accendono l'orgoglio.",
    },
    es: {
      title: "Inspirador (Inspiring)",
      desc: "Narrativas históricas de grandes sabios, misiones lúdicas y medallas que fortalecen el orgullo cultural.",
    },
  },
  DEEP: {
    ar: {
      title: "عميق (Deep)",
      desc: "تأصيل لغوي متين لقواعد النحو، الصرف، البلاغة، أحكام التجويد، وهندسة خطي النسخ والرقعة.",
    },
    en: {
      title: "Deep Mastery",
      desc: "Rigorous scientific foundation in Nahw, Sarf, Balaghah, Tajweed acoustics, and classical penmanship.",
    },
    nl: {
      title: "Diepgaand (Deep)",
      desc: "Grondige wetenschappelijke basis in Nahw, Sarf, Balaghah, Tajweed-akoestiek en klassiek schoonschrift.",
    },
    tr: {
      title: "Derin Uzmanlık (Deep)",
      desc: "Nahiv, Sarf, Belagat, Tecvid fonetiği ve klasik hat sanatında köklü bilimsel temel.",
    },
    it: {
      title: "Profondità (Deep)",
      desc: "Solida base scientifica in Nahw, Sarf, Balaghah, acustica del Tajweed e calligrafia classica.",
    },
    es: {
      title: "Dominio Profundo (Deep)",
      desc: "Sólida base científica en Nahw, Sarf, Balaghah, acústica del Taywid y caligrafía clásica.",
    },
  },
  EFFICIENT: {
    ar: {
      title: "فعّال (Efficient)",
      desc: "تكرار متباعد (SRS)، جلسات فردية مركزة (15 دقيقة)، وتفاعل فوري ذكي يحقق أعلى نتائج بأقصر وقت.",
    },
    en: {
      title: "Efficient Retention",
      desc: "Spaced repetition (SRS), 15-minute focused 1-on-1 sessions, and instant AI feedback maximizing outcome per minute.",
    },
    nl: {
      title: "Efficiënt (Efficient)",
      desc: "Gespreide herhaling (SRS), gerichte 15-minuten sessies en directe AI-feedback voor maximaal leerrendement.",
    },
    tr: {
      title: "Etkili ve Verimli (Efficient)",
      desc: "Aralıklı tekrar (SRS), 15 dakikalık odaklanmış birebir seanslar ve dakikada en yüksek sonucu veren anlık geri bildirim.",
    },
    it: {
      title: "Efficiente (Efficient)",
      desc: "Ripetizione spaziata (SRS), sessioni concentrate da 15 minuti e feedback istantaneo per massimizzare i risultati.",
    },
    es: {
      title: "Retención Eficiente (Efficient)",
      desc: "Repetición espaciada (SRS), sesiones enfocadas de 15 minutos y retroalimentación instantánea que maximiza los resultados.",
    },
  },
};

const STEAM_DATA: Record<string, Record<Locale, DomainTranslation>> = {
  SCIENCE: {
    ar: {
      name: "العلوم (Science)",
      example: "الظواهر الفلكية، علوم النبات، والطب التراثي (ابن سينا) المذكورة في القرآن ونصوص القراءة.",
    },
    en: {
      name: "Science",
      example: "Astronomical phenomena, botany, and classical medicine (Avicenna) woven into reading passages.",
    },
    nl: {
      name: "Wetenschap (Science)",
      example: "Astronomische verschijnselen, plantkunde en klassieke geneeskunde verweven in leesteksten.",
    },
    tr: {
      name: "Bilim (Science)",
      example: "Okuma metinlerine işlenmiş astronomik olaylar, botanik ve klasik tıp (İbn-i Sina).",
    },
    it: {
      name: "Scienza (Science)",
      example: "Fenomeni astronomici, botanica e medicina classica (Avicenna) integrati nei brani di lettura.",
    },
    es: {
      name: "Ciencia (Science)",
      example: "Fenómenos astronómicos, botánica y medicina clásica (Avicena) integrados en las lecturas.",
    },
  },
  TECHNOLOGY: {
    ar: {
      name: "التكنولوجيا (Technology)",
      example: "اللوح التفاعلي السحابي، تحليل النطق بالذكاء الاصطناعي، ومقاربة جذور الكلمات بالخوارزميات البرمجية.",
    },
    en: {
      name: "Technology",
      example: "Cloud interactive whiteboard, AI pronunciation analyzer, and treating word roots as algorithmic structures.",
    },
    nl: {
      name: "Technologie (Technology)",
      example: "Interactief cloud-whiteboard, AI-uitspraakanalyse en woordwortels benaderen als algoritmische structuren.",
    },
    tr: {
      name: "Teknoloji (Technology)",
      example: "Bulut tabanlı etkileşimli beyaz tahta, yapay zeka telaffuz analizi ve kelime köklerini algoritmik yapılar olarak ele alma.",
    },
    it: {
      name: "Tecnologia (Technology)",
      example: "Lavagna interattiva su cloud, analisi della pronuncia con IA e radici delle parole trattate come strutture algoritmiche.",
    },
    es: {
      name: "Tecnología (Technology)",
      example: "Pizarra interactiva en la nube, analizador de pronunciación con IA y raíces de palabras como estructuras algorítmicas.",
    },
  },
  ENGINEERING: {
    ar: {
      name: "الهندسة (Engineering)",
      example: "هندسة الخط العربي والنسبة الفاضلة لحروف النسخ والرقعة، وتراكيب الجمل اللغوية المتزنة.",
    },
    en: {
      name: "Engineering",
      example: "Geometric proportions in Arabic calligraphy (Naskh & Ruq'ah) and architectural sentence syntax.",
    },
    nl: {
      name: "Bouwkunde & Vorm (Engineering)",
      example: "Geometrische verhoudingen in Arabische kalligrafie (Naskh & Ruq'ah) en evenwichtige zinsstructuren.",
    },
    tr: {
      name: "Mühendislik (Engineering)",
      example: "Arap hat sanatında geometrik oranlar (Nesih ve Rika) ile mimari cümle sözdizimi.",
    },
    it: {
      name: "Ingegneria (Engineering)",
      example: "Proporzioni geometriche nella calligrafia araba (Naskh & Ruq'ah) e sintassi architettonica delle frasi.",
    },
    es: {
      name: "Ingeniería (Engineering)",
      example: "Proporciones geométricas en caligrafía árabe (Nasj y Ruq'ah) y sintaxis arquitectónica de oraciones.",
    },
  },
  ARTS: {
    ar: {
      name: "الفنون (Arts)",
      example: "فنون الخط العربي التشكيلية، المقامات الصوتية للتجويد، وعلم العروض والإيقاع الشعري الموسيقي.",
    },
    en: {
      name: "Arts",
      example: "Arabic calligraphy aesthetics, vocal tajweed maqamat, and poetic rhythm and meters (Arood).",
    },
    nl: {
      name: "Kunsten (Arts)",
      example: "Arabische kalligrafie, vocale tajweed-maqamat en poëtisch ritme en metrum (Arood).",
    },
    tr: {
      name: "Sanat (Arts)",
      example: "Arap hat sanatı estetiği, tecvid makamları ile aruz vezni ve şiirsel ritim.",
    },
    it: {
      name: "Arti (Arts)",
      example: "Estetica della calligrafia araba, maqamat vocali del tajweed e ritmo poetico (Arood).",
    },
    es: {
      name: "Artes (Arts)",
      example: "Estética de caligrafía árabe, maqamat vocales de taywid y ritmo y métrica poética (Arood).",
    },
  },
  MATHS: {
    ar: {
      name: "الرياضيات (Maths)",
      example: "الأرقام العربية، حساب الجمل، الزخارف الهندسية الإسلامية (Tessellations)، والتقويم الفلكي.",
    },
    en: {
      name: "Maths",
      example: "Arabic numerals, Al-Khwarizmi algebra, Islamic geometric tessellations, and lunar calendar calculations.",
    },
    nl: {
      name: "Wiskunde (Maths)",
      example: "Arabische cijfers, algebra van Al-Khwarizmi, islamitische geometrische patronen en maankalenderberekeningen.",
    },
    tr: {
      name: "Matematik (Maths)",
      example: "Arap rakamları, Harezmi cebiri, İslami geometrik motifler ve hicri takvim hesaplamaları.",
    },
    it: {
      name: "Matematica (Maths)",
      example: "Numeri arabi, algebra di Al-Khwarizmi, tassellazioni geometriche islamiche e calcoli del calendario lunare.",
    },
    es: {
      name: "Matemáticas (Maths)",
      example: "Números arábigos, álgebra de Al-Juarismi, teselaciones geométricas islámicas y calendario lunar.",
    },
  },
};

const UI_TEXT: Record<
  Locale,
  {
    badge: string;
    title: string;
    subtitle: string;
    tabBloom: string;
    tabBloomSub: string;
    tabBide: string;
    tabBideSub: string;
    tabSteam: string;
    tabSteamSub: string;
    bloomHeader: string;
    bloomSub: string;
    bloomBadge: string;
    bideHeader: string;
    bideSub: string;
    bideBadge: string;
    steamHeader: string;
    steamSub: string;
    steamBadge: string;
  }
> = {
  ar: {
    badge: "النموذج التربوي المتكامل",
    title: "تعلم شمولي مخصص لكل طفل",
    subtitle: "نجمع بين هرم بلوم المعرفي (Bloom's Taxonomy)، نموذج BIDE التربوي المبتكر، ومنهجية STEAM لربط اللغة العربية بالتكنولوجيا والعلوم المعاصرة.",
    tabBloom: "هرم بلوم",
    tabBloomSub: "Bloom's Taxonomy",
    tabBide: "نموذج BIDE",
    tabBideSub: "Broad • Deep",
    tabSteam: "منهجية STEAM",
    tabSteamSub: "Science & Tech",
    bloomHeader: "هرم بلوم المعرفي (Bloom's Taxonomy)",
    bloomSub: "معيار عالمي لمراحل التعلم الست: تذكّر، فهم، تطبيق، تحليل، تقييم، وابتكار",
    bloomBadge: "6 مراحل معرفية",
    bideHeader: "نموذج BIDE التربوي المبتكر",
    bideSub: "صُمم خصيصاً ليناسب القدرات والاهتمامات الفريدة لكل طفل: شامل، ملهم، عميق، وفعّال",
    bideBadge: "4 أبعاد تربوية",
    steamHeader: "منهجية STEAM التفاعلية المعاصرة",
    steamSub: "ربط تعلم اللغة العربية اليومي بالعلوم، التكنولوجيا، الهندسة، الفنون، والرياضيات",
    steamBadge: "5 مجالات تكاملية",
  },
  en: {
    badge: "Comprehensive Educational Framework",
    title: "Holistic learning personalised for each child",
    subtitle: "Combining Bloom's Taxonomy, the innovative BIDE pedagogical model, and STEAM methodology to connect Arabic with modern technology and inquiry.",
    tabBloom: "Bloom's Taxonomy",
    tabBloomSub: "Cognitive Mastery",
    tabBide: "BIDE Model",
    tabBideSub: "Broad • Deep",
    tabSteam: "STEAM Pedagogy",
    tabSteamSub: "Science & Tech",
    bloomHeader: "Bloom's Taxonomy for K-12",
    bloomSub: "Global K-12 standard spanning 6 cognitive stages: Remember, Understand, Apply, Analyze, Evaluate & Create",
    bloomBadge: "6 Cognitive Stages",
    bideHeader: "The BIDE Educational Model",
    bideSub: "Developed in-house to cater to each child's unique abilities: Broad, Inspiring, Deep & Efficient",
    bideBadge: "4 Pedagogical Dimensions",
    steamHeader: "STEAM Learning Methodology",
    steamSub: "Connecting daily Arabic learning with Science, Technology, Engineering, Arts & Maths",
    steamBadge: "5 Integrated Domains",
  },
  nl: {
    badge: "Integraal Onderwijskader",
    title: "Holistisch leren gepersonaliseerd voor elk kind",
    subtitle: "Combinatie van Bloom's taxonomie, het innovatieve BIDE-model en STEAM om Arabisch te verbinden met hedendaagse wetenschap en technologie.",
    tabBloom: "Bloom Taxonomie",
    tabBloomSub: "Cognitieve Fases",
    tabBide: "BIDE Model",
    tabBideSub: "Breed • Diepgaand",
    tabSteam: "STEAM Methode",
    tabSteamSub: "Wetenschap & Tech",
    bloomHeader: "Bloom's Taxonomie voor het Onderwijs",
    bloomSub: "Wereldwijde standaard met 6 cognitieve fasen: Onthouden, Begrijpen, Toepassen, Analyseren, Evalueren en Creëren",
    bloomBadge: "6 Cognitieve Fasen",
    bideHeader: "Het BIDE Onderwijsmodel",
    bideSub: "Afgestemd op de unieke talenten van ieder kind: Breed, Inspirerend, Diepgaand en Efficiënt",
    bideBadge: "4 Pedagogische Dimensies",
    steamHeader: "STEAM Leermethode",
    steamSub: "Arabisch leren verbinden met Wetenschap, Technologie, Bouwkunde, Kunst en Wiskunde",
    steamBadge: "5 Geïntegreerde Domeinen",
  },
  tr: {
    badge: "Kapsamlı Eğitim Çerçevesi",
    title: "Her çocuk için kişiselleştirilmiş bütünsel öğrenim",
    subtitle: "Arapça'yı modern bilim ve teknolojiyle buluşturmak için Bloom Taksonomisi, yenilikçi BIDE eğitim modeli ve STEAM metodolojisini bir araya getiriyoruz.",
    tabBloom: "Bloom Taksonomisi",
    tabBloomSub: "Bilişsel Düzeyler",
    tabBide: "BIDE Modeli",
    tabBideSub: "Geniş • Derin",
    tabSteam: "STEAM Metodolojisi",
    tabSteamSub: "Bilim ve Teknoloji",
    bloomHeader: "Eğitimde Bloom Taksonomisi",
    bloomSub: "6 bilişsel aşamayı kapsayan küresel standart: Hatırlama, Anlama, Uygulama, Analiz Etme, Değerlendirme ve Yaratma",
    bloomBadge: "6 Bilişsel Aşama",
    bideHeader: "BIDE Eğitim Modeli",
    bideSub: "Her çocuğun benzersiz yeteneklerine uygun olarak geliştirildi: Kapsamlı, İlham Verici, Derin ve Verimli",
    bideBadge: "4 Pedagojik Boyut",
    steamHeader: "STEAM Öğrenme Metodolojisi",
    steamSub: "Günlük Arapça eğitimini Bilim, Teknoloji, Mühendislik, Sanat ve Matematik ile birleştiriyoruz",
    steamBadge: "5 Bütünleşik Alan",
  },
  it: {
    badge: "Quadro Educativo Integrale",
    title: "Apprendimento olistico personalizzato per ogni bambino",
    subtitle: "Combiniamo la tassonomia di Bloom, l'innovativo modello pedagogico BIDE e la metodologia STEAM per connettere l'arabo alla tecnologia e alle scienze contemporanee.",
    tabBloom: "Tassonomia di Bloom",
    tabBloomSub: "Stadi Cognitivi",
    tabBide: "Modello BIDE",
    tabBideSub: "Ampio • Profondo",
    tabSteam: "Metodologia STEAM",
    tabSteamSub: "Scienza & Tecnologia",
    bloomHeader: "Tassonomia di Bloom per la Scuola",
    bloomSub: "Standard globale attraverso 6 stadi cognitivi: Ricordare, Comprendere, Applicare, Analizzare, Valutare e Creare",
    bloomBadge: "6 Stadi Cognitivi",
    bideHeader: "Il Modello Educativo BIDE",
    bideSub: "Progettato sulle attitudini uniche di ogni bambino: Ampio, Ispirante, Profondo ed Efficiente",
    bideBadge: "4 Dimensioni Pedagogiche",
    steamHeader: "Metodologia di Apprendimento STEAM",
    steamSub: "Connessione dello studio dell'arabo con Scienze, Tecnologia, Ingegneria, Arti e Matematica",
    steamBadge: "5 Domini Integrati",
  },
  es: {
    badge: "Marco Educativo Integral",
    title: "Aprendizaje holístico personalizado para cada niño",
    subtitle: "Combinamos la taxonomía de Bloom, el innovador modelo pedagógico BIDE y la metodología STEAM para conectar el árabe con la ciencia y la tecnología modernas.",
    tabBloom: "Taxonomía de Bloom",
    tabBloomSub: "Fases Cognitivas",
    tabBide: "Modelo BIDE",
    tabBideSub: "Amplio • Profundo",
    tabSteam: "Metodología STEAM",
    tabSteamSub: "Ciencia y Tecnología",
    bloomHeader: "Taxonomía de Bloom Educativa",
    bloomSub: "Estándar global en 6 etapas cognitivas: Recordar, Comprender, Aplicar, Analizar, Evaluar y Crear",
    bloomBadge: "6 Etapas Cognitivas",
    bideHeader: "El Modelo Educativo BIDE",
    bideSub: "Desarrollado para potenciar las capacidades de cada niño: Amplio, Inspirador, Profundo y Eficiente",
    bideBadge: "4 Dimensiones Pedagógicas",
    steamHeader: "Metodología de Aprendizaje STEAM",
    steamSub: "Conectando el aprendizaje del árabe con Ciencia, Tecnología, Ingeniería, Artes y Matemáticas",
    steamBadge: "5 Áreas Integradas",
  },
};

export function HolisticLearningFramework({
  locale = "ar",
  isRtl = true,
}: HolisticLearningFrameworkProps) {
  const [activeTab, setActiveTab] = useState<"BLOOM" | "BIDE" | "STEAM">("BLOOM");

  const validLocale: Locale = (["ar", "en", "nl", "tr", "it", "es"].includes(locale)
    ? locale
    : "en") as Locale;

  const t = UI_TEXT[validLocale];

  const bloomStages = [
    {
      level: 1,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accent: "bg-emerald-500",
      ...BLOOM_DATA[1][validLocale],
    },
    {
      level: 2,
      color: "bg-teal-50 text-teal-800 border-teal-200",
      accent: "bg-teal-500",
      ...BLOOM_DATA[2][validLocale],
    },
    {
      level: 3,
      color: "bg-blue-50 text-blue-800 border-blue-200",
      accent: "bg-blue-500",
      ...BLOOM_DATA[3][validLocale],
    },
    {
      level: 4,
      color: "bg-indigo-50 text-indigo-800 border-indigo-200",
      accent: "bg-indigo-500",
      ...BLOOM_DATA[4][validLocale],
    },
    {
      level: 5,
      color: "bg-purple-50 text-purple-800 border-purple-200",
      accent: "bg-purple-500",
      ...BLOOM_DATA[5][validLocale],
    },
    {
      level: 6,
      color: "bg-rose-50 text-rose-800 border-rose-200",
      accent: "bg-rose-500",
      ...BLOOM_DATA[6][validLocale],
    },
  ];

  const bideDimensions = [
    {
      id: "BROAD",
      icon: Compass,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      ...BIDE_DATA.BROAD[validLocale],
    },
    {
      id: "INSPIRING",
      icon: Lightbulb,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      ...BIDE_DATA.INSPIRING[validLocale],
    },
    {
      id: "DEEP",
      icon: BrainCircuit,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      ...BIDE_DATA.DEEP[validLocale],
    },
    {
      id: "EFFICIENT",
      icon: Zap,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      ...BIDE_DATA.EFFICIENT[validLocale],
    },
  ];

  const steamDomains = [
    {
      id: "SCIENCE",
      icon: Atom,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      ...STEAM_DATA.SCIENCE[validLocale],
    },
    {
      id: "TECHNOLOGY",
      icon: Binary,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      ...STEAM_DATA.TECHNOLOGY[validLocale],
    },
    {
      id: "ENGINEERING",
      icon: Shapes,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      ...STEAM_DATA.ENGINEERING[validLocale],
    },
    {
      id: "ARTS",
      icon: Music,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      ...STEAM_DATA.ARTS[validLocale],
    },
    {
      id: "MATHS",
      icon: Calculator,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      ...STEAM_DATA.MATHS[validLocale],
    },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {t.subtitle}
          </p>
        </div>

        {/* Central Triangle Diagram & Pillars Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Visual Column: The Triangle Diagram */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Outer Triangular Outline */}
              <svg viewBox="0 0 300 260" className="w-full h-full drop-shadow-md">
                {/* Left Side: Bloom (Green) */}
                <path
                  d="M 150,20 L 30,220"
                  stroke="#10b981"
                  strokeWidth="24"
                  strokeLinecap="round"
                  className={`cursor-pointer transition-all duration-300 ${activeTab === "BLOOM" ? "opacity-100 stroke-emerald-600" : "opacity-60 hover:opacity-90"}`}
                  onClick={() => setActiveTab("BLOOM")}
                />
                {/* Right Side: BIDE (Gold/Amber) */}
                <path
                  d="M 150,20 L 270,220"
                  stroke="#f59e0b"
                  strokeWidth="24"
                  strokeLinecap="round"
                  className={`cursor-pointer transition-all duration-300 ${activeTab === "BIDE" ? "opacity-100 stroke-amber-600" : "opacity-60 hover:opacity-90"}`}
                  onClick={() => setActiveTab("BIDE")}
                />
                {/* Bottom Side: STEAM (Blue) */}
                <path
                  d="M 40,230 L 260,230"
                  stroke="#3b82f6"
                  strokeWidth="24"
                  strokeLinecap="round"
                  className={`cursor-pointer transition-all duration-300 ${activeTab === "STEAM" ? "opacity-100 stroke-blue-600" : "opacity-60 hover:opacity-90"}`}
                  onClick={() => setActiveTab("STEAM")}
                />

                {/* Central Labels */}
                <text
                  x="80"
                  y="110"
                  transform="rotate(-58 80,110)"
                  fill="#059669"
                  fontWeight="bold"
                  fontSize="14"
                  className="cursor-pointer select-none"
                  onClick={() => setActiveTab("BLOOM")}
                >
                  BLOOM
                </text>
                <text
                  x="210"
                  y="120"
                  transform="rotate(58 210,120)"
                  fill="#d97706"
                  fontWeight="bold"
                  fontSize="14"
                  className="cursor-pointer select-none"
                  onClick={() => setActiveTab("BIDE")}
                >
                  BIDE
                </text>
                <text
                  x="120"
                  y="250"
                  fill="#2563eb"
                  fontWeight="bold"
                  fontSize="14"
                  className="cursor-pointer select-none"
                  onClick={() => setActiveTab("STEAM")}
                >
                  STEAM
                </text>
              </svg>
            </div>

            {/* Pillar Selector Buttons */}
            <div className="grid grid-cols-3 gap-2 w-full mt-6">
              <button
                type="button"
                onClick={() => setActiveTab("BLOOM")}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  activeTab === "BLOOM"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{t.tabBloom}</span>
                <span className="text-[10px] font-normal opacity-90">{t.tabBloomSub}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("BIDE")}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  activeTab === "BIDE"
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{t.tabBide}</span>
                <span className="text-[10px] font-normal opacity-90">{t.tabBideSub}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("STEAM")}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  activeTab === "STEAM"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{t.tabSteam}</span>
                <span className="text-[10px] font-normal opacity-90">{t.tabSteamSub}</span>
              </button>
            </div>
          </div>

          {/* Right / Detail Column: Tab Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. BLOOM TAB */}
            {activeTab === "BLOOM" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-emerald-950 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span>{t.bloomHeader}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.bloomSub}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    {t.bloomBadge}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {bloomStages.map((stage) => (
                    <div
                      key={stage.level}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${stage.color}`}
                    >
                      <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-black shrink-0 ${stage.accent}`}>
                        {stage.level}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs sm:text-sm">
                          {stage.name}
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed">
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. BIDE TAB */}
            {activeTab === "BIDE" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-amber-950 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-amber-600" />
                      <span>{t.bideHeader}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.bideSub}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    {t.bideBadge}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bideDimensions.map((dim) => {
                    const IconComp = dim.icon;
                    return (
                      <div
                        key={dim.id}
                        className={`p-5 rounded-2xl border space-y-2.5 transition-all hover:shadow-sm ${dim.color}`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComp className="w-5 h-5" />
                          <h4 className="font-extrabold text-sm">{dim.title}</h4>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {dim.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. STEAM TAB */}
            {activeTab === "STEAM" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-blue-100 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-blue-950 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      <span>{t.steamHeader}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.steamSub}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                    {t.steamBadge}
                  </span>
                </div>

                <div className="space-y-3">
                  {steamDomains.map((domain) => {
                    const IconComp = domain.icon;
                    return (
                      <div
                        key={domain.id}
                        className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-colors ${domain.color}`}
                      >
                        <div className="p-2 rounded-xl bg-white/80 shrink-0 mt-0.5">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-xs sm:text-sm">
                            {domain.name}
                          </div>
                          <p className="text-xs opacity-90 leading-relaxed">
                            {domain.example}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
