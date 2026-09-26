import React from "react";
import Link from "next/link";
import { type Locale, isRtlLocale } from "@/lib/localization";
import {
  Sparkles,
  Users,
  Video,
  Award,
  ArrowRight,
  ArrowLeft,
  Compass,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { InteractivePlacementCalculator } from "@/components/marketing/InteractivePlacementCalculator";

interface HowItWorksText {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaDiagnostic: string;
  ctaPrograms: string;
  journeyTag: string;
  journeyHeading: string;
  steps: Array<{
    number: string;
    title: string;
    desc: string;
  }>;
  ageTag: string;
  ageHeading: string;
  ageAgesLabel: (range: string) => string;
  integratedStudiosLabel: string;
  ageGroups: Array<{
    range: string;
    title: string;
    focus: string;
    tools: string[];
    color: string;
  }>;
  safetyTitle: string;
  safetyDesc: string;
  cohortTitle: string;
  cohortDesc: string;
  parentTitle: string;
  parentDesc: string;
  ctaHeading: string;
  ctaSub: string;
  ctaRegister: string;
  ctaPricing: string;
}

const HOW_IT_WORKS_I18N: Record<Locale, HowItWorksText> = {
  ar: {
    heroBadge: "منهجية معتمدة قائمة على المعايير الأوروبية CEFR",
    heroTitle: "كيف يتعلم طفلك العربية بفصاحة وحب؟",
    heroSubtitle:
      "نجمع بين التعليم التفاعلي المباشر مع نخبة المعلمين المعتمدين، وأحدث استوديوهات التعلم الرقمية الذكية في بيئة آمنة تراعي خصوصية طفلك.",
    ctaDiagnostic: "احجز تقييماً تشخيصياً مجانياً",
    ctaPrograms: "استكشف البرامج الأكاديمية",
    journeyTag: "رحلة التعلم المتكاملة",
    journeyHeading: "من الحروف الأولى إلى الطلاقة التامة",
    steps: [
      {
        number: "01",
        title: "التقييم التشخيصي المجاني",
        desc: "ابدأ باختبار تحديد مستوى تفاعلي لمدة 15 دقيقة لتقييم الوعي الصوتي والمفردات ومستوى القراءة بدقة.",
      },
      {
        number: "02",
        title: "التسكين في مجموعة صغيرة متجانسة",
        desc: "نلحق طفلك بمعلم متخصص ومجموعة مصغرة لا تتجاوز 6 طلاب من نفس الفئة العمرية والمستوى الأكاديمي.",
      },
      {
        number: "03",
        title: "حصص تفاعلية مباشرة واستوديوهات رقمية",
        desc: "حضور حصص مباشرة عبر السبورة التفاعلية وتحليل مخارج الحروف بالرسم الصوتي واستوديو التجويد الملون.",
      },
      {
        number: "04",
        title: "تدريب تفاعلي وشفافية كاملة لولي الأمر",
        desc: "يعزز الطالب مهاراته بألعاب الحروف وبطاقات التكرار المتباعد، مع تقارير أسبوعية مفصلة وتسجيلات متاحة للوالدين.",
      },
    ],
    ageTag: "مسارات تعليمية مخصصة حسب العمر",
    ageHeading: "منهج مصمم خصيصاً لكل مرحلة نمو",
    ageAgesLabel: (r) => `الأعمار ${r} سنوات`,
    integratedStudiosLabel: "الاستوديوهات المدمجة:",
    ageGroups: [
      {
        range: "4 - 6",
        title: "براعم العربية (ما قبل A1)",
        focus: "الوعي الصوتي، تمييز أشكال الحروف، الأناشيد التعليمية، والمفردات اليومية الأساسية.",
        tools: ["Phonics Arcade", "Illustrated Audio Stories", "Interactive Tracing"],
        color: "border-pink-200 bg-pink-50/50",
      },
      {
        range: "7 - 10",
        title: "المستكشف الصغير (A1 - A2)",
        focus: "تكوين الجمل المستقلة، طلاقة القراءة، وتلاوة القرآن الكريم بأحكام التجويد الأساسية.",
        tools: ["Visual Quest Map", "Makharij Pronunciation Studio", "Color Tajweed Player"],
        color: "border-blue-200 bg-blue-50/50",
      },
      {
        range: "11 - 13",
        title: "رواد الفصاحة (A2 - B1)",
        focus: "المحادثة الحوارية، الإنشاء التعبيري، القواعد التطبيقية (النحو والصرف)، والسيرة النبوية.",
        tools: ["Ruled Calligraphy Canvas", "Vocabulary SRS Leitner", "AI Tutor Conversations"],
        color: "border-emerald-200 bg-emerald-50/50",
      },
      {
        range: "14 - 16",
        title: "علماء المستقبل (B1 - B2)",
        focus: "فهم النصوص الكلاسيكية، الخطابة والإلقاء، أحكام التجويد المتقدمة، وبلاغة البيان.",
        tools: ["Academic Assessment Bank", "Speech Debate Room", "Accredited CEFR Certifications"],
        color: "border-purple-200 bg-purple-50/50",
      },
    ],
    safetyTitle: "أعلى معايير حماية الطفل (COPPA & GDPR)",
    safetyDesc: "بيئة مغلقة وآمنة بدون رسائل مباشرة بين الطلاب. جميع التسجيلات مشفرة ولا يتم مشاركة أي بيانات مع أطراف ثالثة.",
    cohortTitle: "مجموعات مصغرة (بحد أقصى 6 طلاب)",
    cohortDesc: "نضمن حصول كل طفل على ما لا يقل عن 15 دقيقة من المشاركة الفردية المباشرة في كل حصة لضمان سرعة التطور.",
    parentTitle: "مشاركة الوالدين والتقارير الأسبوعية",
    parentDesc: "لوحة تحكم خاصة لولي الأمر تتيح متابعة الحضور، مشاهدة التسجيلات، مراجعة الواجبات، والتواصل المباشر مع المعلم.",
    ctaHeading: "جاهز لبدء رحلة طفلك التعليمية؟",
    ctaSub: "سجل الآن للحصول على تقييم تشخيصي مجاني وحصة تجريبية مع معلم معتمد من Arabic Kids Academy.",
    ctaRegister: "ابدأ التسجيل المجاني",
    ctaPricing: "عرض خطط الأسعار",
  },
  en: {
    heroBadge: "CEFR-Aligned Pedagogical Methodology",
    heroTitle: "How Your Child Masters Arabic with Confidence & Joy",
    heroSubtitle:
      "We combine live small-group instruction with certified native educators and cutting-edge digital learning studios in a safe, child-centered environment.",
    ctaDiagnostic: "Book Free Diagnostic Assessment",
    ctaPrograms: "Explore Academic Programs",
    journeyTag: "The 4-Step Educational Journey",
    journeyHeading: "From First Letters to Complete Fluency",
    steps: [
      {
        number: "01",
        title: "Free Diagnostic Assessment",
        desc: "Start with an interactive 15-minute placement assessment to evaluate phonemic awareness, vocabulary, and reading level.",
      },
      {
        number: "02",
        title: "Personalized Micro-Cohort Placement",
        desc: "We match your child with a certified native specialist and a micro-cohort strictly capped at 6 students of the same age and skill.",
      },
      {
        number: "03",
        title: "Interactive Live Classes & Studios",
        desc: "Engage in live virtual sessions featuring our interactive whiteboard, real-time pronunciation waveforms, and Quran Tajweed audio tools.",
      },
      {
        number: "04",
        title: "Gamified Practice & Parent Transparency",
        desc: "Students reinforce skills with Phonics Arcade and SRS flashcards while parents receive weekly progress reports and lesson recordings.",
      },
    ],
    ageTag: "Tailored Developmental Tracks",
    ageHeading: "A Curriculum Engineered for Every Age Bracket",
    ageAgesLabel: (r) => `Ages ${r} Years`,
    integratedStudiosLabel: "Integrated Studios:",
    ageGroups: [
      {
        range: "4 - 6",
        title: "Early Sprouts (Pre-A1)",
        focus: "Phonemic awareness, alphabet recognition, nursery rhymes, everyday conversational words.",
        tools: ["Phonics Arcade", "Illustrated Audio Stories", "Interactive Tracing"],
        color: "border-pink-200 bg-pink-50/50",
      },
      {
        range: "7 - 10",
        title: "Junior Explorers (A1 - A2)",
        focus: "Independent sentence formation, reading fluency, Quranic recitation with basic Tajweed.",
        tools: ["Visual Quest Map", "Makharij Pronunciation Studio", "Color Tajweed Player"],
        color: "border-blue-200 bg-blue-50/50",
      },
      {
        range: "11 - 13",
        title: "Fluent Pioneers (A2 - B1)",
        focus: "Dialogues, paragraph composition, applied grammar (Nahw & Sarf), and Islamic culture.",
        tools: ["Ruled Calligraphy Canvas", "Vocabulary SRS Leitner", "AI Tutor Conversations"],
        color: "border-emerald-200 bg-emerald-50/50",
      },
      {
        range: "14 - 16",
        title: "Advanced Scholars (B1 - B2)",
        focus: "Classical text comprehension, public speaking, advanced Tajweed rules, and rhetoric.",
        tools: ["Academic Assessment Bank", "Speech Debate Room", "Accredited CEFR Certifications"],
        color: "border-purple-200 bg-purple-50/50",
      },
    ],
    safetyTitle: "Child Safety & Data Privacy",
    safetyDesc: "Strictly moderated environment with no direct student-to-student messaging. Encrypted media and zero third-party tracking.",
    cohortTitle: "Micro-Cohorts (Max 6 Students)",
    cohortDesc: "Capped strictly at 6 students so every child receives active speaking time and individualized phoneme feedback every session.",
    parentTitle: "Parent Transparency & Reports",
    parentDesc: "Dedicated parent dashboard with weekly progress milestones, recorded lesson playback, and direct educator messaging.",
    ctaHeading: "Ready to Start Your Child's Journey?",
    ctaSub: "Sign up today to receive a free diagnostic placement assessment and 1-day trial session with a certified educator.",
    ctaRegister: "Start Free Registration",
    ctaPricing: "View Pricing Plans",
  },
  nl: {
    heroBadge: "Erkende leermethode conform CEFR-richtlijnen",
    heroTitle: "Hoe jouw kind Arabisch leert met vertrouwen en plezier",
    heroSubtitle:
      "We combineren interactief live-onderwijs in kleine groepen met gecertificeerde leerkrachten en slimme digitale studio's in een veilige omgeving.",
    ctaDiagnostic: "Boek een gratis niveautest",
    ctaPrograms: "Ontdek academische programma's",
    journeyTag: "Het 4-Stappen Leertraject",
    journeyHeading: "Van de eerste letters tot complete vloeiendheid",
    steps: [
      {
        number: "01",
        title: "Gratis Diagnostische Niveautest",
        desc: "Begin met een interactieve test van 15 minuten om klankkennis, woordenschat en leesvaardigheid nauwkeurig te bepalen.",
      },
      {
        number: "02",
        title: "Plaatsing in een Persoonlijke Microgroep",
        desc: "We koppelen je kind aan een gecertificeerde moedertaaldocent en een groepje van maximaal 6 leerlingen van hetzelfde niveau.",
      },
      {
        number: "03",
        title: "Interactieve Live Lessen & Studio's",
        desc: "Woon live virtuele lessen bij met interactief whiteboard, realtime uitspraakanalyse en Tajweed-audiotools.",
      },
      {
        number: "04",
        title: "Spelenderwijs Oefenen & Transparantie",
        desc: "Leerlingen oefenen met Phonics Arcade en flitskaarten, terwijl ouders wekelijkse rapporten en lesopnames ontvangen.",
      },
    ],
    ageTag: "Ontwikkelingstrajecten op maat",
    ageHeading: "Een curriculum ontworpen voor elke leeftijdsfase",
    ageAgesLabel: (r) => `Leeftijd ${r} jaar`,
    integratedStudiosLabel: "Geïntegreerde Studio's:",
    ageGroups: [
      {
        range: "4 - 6",
        title: "Kleine Spruiten (Pre-A1)",
        focus: "Klankbewustzijn, letterherkenning, educatieve liedjes en dagelijkse basiswoorden.",
        tools: ["Phonics Arcade", "Geïllustreerde Audioverhalen", "Interactief Overtrekken"],
        color: "border-pink-200 bg-pink-50/50",
      },
      {
        range: "7 - 10",
        title: "Jonge Verkenners (A1 - A2)",
        focus: "Zelfstandige zinsbouw, vloeiend lezen en Koranrecitatie met basis Tajweed.",
        tools: ["Visuele Quest Kaart", "Makharij Uitspraakstudio", "Kleur Tajweed Speler"],
        color: "border-blue-200 bg-blue-50/50",
      },
      {
        range: "11 - 13",
        title: "Vloeiende Pioniers (A2 - B1)",
        focus: "Gespreksvoering, schrijfvaardigheid, toegepaste grammatica (Nahw & Sarf) en islamitische cultuur.",
        tools: ["Kalligrafie Canvas", "Woordenschat SRS Leitner", "AI Tutor Conversaties"],
        color: "border-emerald-200 bg-emerald-50/50",
      },
      {
        range: "14 - 16",
        title: "Gevorderde Geleerden (B1 - B2)",
        focus: "Klassiek tekstbegrip, welsprekendheid, gevorderde Tajweed-regels en retorica.",
        tools: ["Academische Toetsenbank", "Debatruimte", "Erkende CEFR-Certificeringen"],
        color: "border-purple-200 bg-purple-50/50",
      },
    ],
    safetyTitle: "Kindveiligheid & Gegevensbescherming (COPPA & GDPR)",
    safetyDesc: "Strikt gemodereerde omgeving zonder directe berichten tussen leerlingen. Versleutelde opnames en geen externe trackers.",
    cohortTitle: "Microgroepen (Maximaal 6 Leerlingen)",
    cohortDesc: "Strikt beperkt tot 6 kinderen, zodat elk kind minimaal 15 minuten actieve spreektijd en persoonlijke feedback krijgt.",
    parentTitle: "Ouderbetrokkenheid & Wekelijkse Rapporten",
    parentDesc: "Toegewijd ouderportaal met aanwezigheid, lesopnames, opvolging van huiswerk en direct contact met de docent.",
    ctaHeading: "Klaar om de leerreis van je kind te beginnen?",
    ctaSub: "Meld je vandaag aan voor een gratis niveautest en proefles met een gecertificeerde leerkracht van Arabic Kids Academy.",
    ctaRegister: "Start gratis registratie",
    ctaPricing: "Bekijk tarieven en abonnementen",
  },
  tr: {
    heroBadge: "CEFR Standartlarına Dayalı Akredite Metodoloji",
    heroTitle: "Çocuğunuz Arapça'yı Nasıl Güven ve Sevgiyle Öğrenir?",
    heroSubtitle:
      "Uzman öğretmenlerle canlı küçük grup derslerini, modern dijital öğrenme stüdyolarını ve çocuk güvenliğini ön planda tutan bir ortamda birleştiriyoruz.",
    ctaDiagnostic: "Ücretsiz Seviye Tespiti Alın",
    ctaPrograms: "Akademik Programları İnceleyin",
    journeyTag: "4 Adımlı Eğitim Yolculuğu",
    journeyHeading: "İlk Harflerden Tam Akıcılığa Uzanan Süreç",
    steps: [
      {
        number: "01",
        title: "Ücretsiz Seviye Belirleme Değerlendirmesi",
        desc: "Fonetik farkındalığı, kelime hazinesini ve okuma düzeyini ölçen 15 dakikalık etkileşimli bir testle başlayın.",
      },
      {
        number: "02",
        title: "Homojen Mikro Gruba Yerleştirme",
        desc: "Çocuğunuzu aynı yaş ve seviyedeki en fazla 6 öğrenciden oluşan bir gruba ve uzman bir öğretmene yerleştiriyoruz.",
      },
      {
        number: "03",
        title: "Canlı Etkileşimli Dersler ve Stüdyolar",
        desc: "Akıllı beyaz tahta, gerçek zamanlı ses analizi ve renkli Tecvid stüdyosuyla donatılmış canlı oturumlara katılın.",
      },
      {
        number: "04",
        title: "Oyunlaştırılmış Pratik ve Veli Şeffaflığı",
        desc: "Öğrenciler harf oyunları ve aralıklı tekrar kartlarıyla pekiştirirken veliler haftalık rapor ve ders kayıtlarına erişir.",
      },
    ],
    ageTag: "Yaşa Göre Özelleştirilmiş Gelişim Alanları",
    ageHeading: "Her Gelişim Evresi İçin Özel Tasarlanmış Müfredat",
    ageAgesLabel: (r) => `${r} Yaş`,
    integratedStudiosLabel: "Entegre Dijital Stüdyolar:",
    ageGroups: [
      {
        range: "4 - 6",
        title: "Arapça Filizleri (Pre-A1)",
        focus: "Ses farkındalığı, harf şekillerini tanıma, eğitici ezgiler ve günlük temel kelimeler.",
        tools: ["Phonics Arcade", "Resimli Sesli Masallar", "Etkileşimli Çizgi Takibi"],
        color: "border-pink-200 bg-pink-50/50",
      },
      {
        range: "7 - 10",
        title: "Küçük Kâşifler (A1 - A2)",
        focus: "Bağımsız cümle kurma, akıcı okuma ve temel Tecvid kurallarıyla Kuran-ı Kerim tilaveti.",
        tools: ["Görsel Macera Haritası", "Mahreç Telaffuz Stüdyosu", "Renkli Tecvid Oynatıcısı"],
        color: "border-blue-200 bg-blue-50/50",
      },
      {
        range: "11 - 13",
        title: "Akıcı Öncüler (A2 - B1)",
        focus: "Diyaloglar, kompozisyon, uygulamalı dilbilgisi (Nahiv & Sarf) ve İslami kültür.",
        tools: ["Hat Sanatı Tuvali", "Aralıklı Tekrar Kelime Stüdyosu", "Yapay Zeka Diyalogları"],
        color: "border-emerald-200 bg-emerald-50/50",
      },
      {
        range: "14 - 16",
        title: "Geleceğin Bilginleri (B1 - B2)",
        focus: "Klasik metinleri anlama, hitabet, ileri düzey Tecvid kaideleri ve belagat sanatı.",
        tools: ["Akademik Sınav Bankası", "Münazara Odası", "Akredite CEFR Sertifikaları"],
        color: "border-purple-200 bg-purple-50/50",
      },
    ],
    safetyTitle: "Çocuk Güvenliği ve Veri Gizliliği (COPPA & GDPR)",
    safetyDesc: "Öğrenciler arasında doğrudan mesajlaşmanın olmadığı güvenli ve moderasyonlu ortam. Şifreli kayıtlar ve sıfır veri takibi.",
    cohortTitle: "Mikro Gruplar (Maksimum 6 Öğrenci)",
    cohortDesc: "Her öğrencinin en az 15 dakika bireysel konuşma ve doğrudan telaffuz geri bildirimi almasını garanti ediyoruz.",
    parentTitle: "Veli Katılımı ve Haftalık Raporlar",
    parentDesc: "Devam takibi, ders kayıtları, ödev incelemeleri ve öğretmenle doğrudan iletişim sağlayan özel veli paneli.",
    ctaHeading: "Çocuğunuzun Eğitim Yolculuğunu Başlatmaya Hazır mısınız?",
    ctaSub: "Ücretsiz seviye tespiti ve sertifikalı bir Arabic Kids Academy öğretmeniyle deneme dersi için hemen kaydolun.",
    ctaRegister: "Ücretsiz Kayıt Başlat",
    ctaPricing: "Fiyat Planlarını Gör",
  },
  it: {
    heroBadge: "Metodologia Pedagogica Conforme al QCER",
    heroTitle: "Come tuo figlio impara l'arabo con sicurezza e gioia",
    heroSubtitle:
      "Uniamo lezioni dal vivo in piccoli gruppi con insegnanti madrelingua certificati e studi digitali all'avanguardia in un ambiente sicuro.",
    ctaDiagnostic: "Prenota un test di livello gratuito",
    ctaPrograms: "Esplora i programmi accademici",
    journeyTag: "Il Percorso Educativo in 4 Fasi",
    journeyHeading: "Dalle prime lettere alla completa fluidità",
    steps: [
      {
        number: "01",
        title: "Valutazione Diagnostica Gratuita",
        desc: "Inizia con un test interattivo di 15 minuti per valutare consapevolezza fonetica, vocabolario e livello di lettura.",
      },
      {
        number: "02",
        title: "Inserimento in un Micro-Gruppo Omogeneo",
        desc: "Assegniamo tuo figlio a un insegnante qualificato e a un gruppo limitato a massimo 6 studenti della stessa età e livello.",
      },
      {
        number: "03",
        title: "Classi dal Vivo Interattive e Studi Digitali",
        desc: "Partecipa a lezioni virtuali con lavagna interattiva, analisi acustica della pronuncia e studio audio del Tajweed.",
      },
      {
        number: "04",
        title: "Pratica Gamificata e Trasparenza per i Genitori",
        desc: "Gli studenti consolidano le abilità con giochi fonetici e flashcard SRS, mentre i genitori ricevono report settimanali e registrazioni.",
      },
    ],
    ageTag: "Percorsi di sviluppo per fascia d'età",
    ageHeading: "Un curriculum progettato per ogni fase di crescita",
    ageAgesLabel: (r) => `Età ${r} anni`,
    integratedStudiosLabel: "Studi digitali integrati:",
    ageGroups: [
      {
        range: "4 - 6",
        title: "Primi Germogli (Pre-A1)",
        focus: "Consapevolezza fonetica, riconoscimento delle lettere, filastrocche e parole di uso quotidiano.",
        tools: ["Phonics Arcade", "Storie Audio Illustrate", "Tracciamento Interattivo"],
        color: "border-pink-200 bg-pink-50/50",
      },
      {
        range: "7 - 10",
        title: "Giovani Esploratori (A1 - A2)",
        focus: "Costruzione autonoma di frasi, fluidità nella lettura e recitazione coranica con Tajweed di base.",
        tools: ["Mappa Visiva delle Missioni", "Studio Pronuncia Makharij", "Riproduttore Tajweed a Colori"],
        color: "border-blue-200 bg-blue-50/50",
      },
      {
        range: "11 - 13",
        title: "Pionieri Fluente (A2 - B1)",
        focus: "Dialoghi, composizione di paragrafi, grammatica applicata (Nahw & Sarf) e civiltà islamica.",
        tools: ["Tela per Calligrafia", "Ripetizione Spaziata SRS", "Conversazioni con Tutor IA"],
        color: "border-emerald-200 bg-emerald-50/50",
      },
      {
        range: "14 - 16",
        title: "Studiosi Avanzati (B1 - B2)",
        focus: "Comprensione di testi classici, oratoria, regole avanzate di Tajweed ed elocuzione.",
        tools: ["Banca Valutazioni Accademiche", "Aula Dibattiti", "Certificazioni QCER Accreditate"],
        color: "border-purple-200 bg-purple-50/50",
      },
    ],
    safetyTitle: "Sicurezza dei Minori e Privacy dei Dati (COPPA & GDPR)",
    safetyDesc: "Ambiente rigorosamente moderato senza chat diretta tra studenti. Registrazioni crittografate e nessun tracciamento di terzi.",
    cohortTitle: "Micro-Gruppi (Massimo 6 Studenti)",
    cohortDesc: "Tetto massimo di 6 studenti per garantire a ciascuno almeno 15 minuti di interazione verbale attiva per sessione.",
    parentTitle: "Coinvolgimento dei Genitori e Report Settimanali",
    parentDesc: "Portale genitori con presenze, registrazione delle lezioni, monitoraggio compiti e filo diretto con il docente.",
    ctaHeading: "Pronto a iniziare il percorso di tuo figlio?",
    ctaSub: "Iscriviti oggi per ricevere una valutazione diagnostica gratuita e una lezione di prova con un insegnante di Arabic Kids Academy.",
    ctaRegister: "Inizia la registrazione gratuita",
    ctaPricing: "Visualizza i piani tariffari",
  },
  es: {
    heroBadge: "Metodología Pedagógica Alineada con el MCER",
    heroTitle: "Cómo tu hijo domina el árabe con confianza y alegría",
    heroSubtitle:
      "Combinamos clases en directo en grupos reducidos con profesores nativos certificados y estudios digitales innovadores en un entorno seguro.",
    ctaDiagnostic: "Reservar evaluación diagnóstica gratuita",
    ctaPrograms: "Explorar programas académicos",
    journeyTag: "El Recorrido Educativo en 4 Pasos",
    journeyHeading: "De las primeras letras a la fluidez total",
    steps: [
      {
        number: "01",
        title: "Evaluación Diagnóstica Gratuita",
        desc: "Comienza con una prueba interactiva de 15 minutos para evaluar con precisión la conciencia fonológica, vocabulario y lectura.",
      },
      {
        number: "02",
        title: "Ubicación en un Microgrupo Personalizado",
        desc: "Asignamos a tu hijo a un profesor especialista y un grupo limitado estrictamente a 6 alumnos de la misma edad y nivel.",
      },
      {
        number: "03",
        title: "Clases en Directo y Estudios Digitales",
        desc: "Participa en sesiones interactivas con pizarra compartida, análisis acústico de pronunciación y herramientas de audio de Taywid.",
      },
      {
        number: "04",
        title: "Práctica Gamificada y Transparencia Familiar",
        desc: "Los alumnos refuerzan habilidades con juegos arcade y fichas SRS, mientras los padres reciben informes semanales y grabaciones.",
      },
    ],
    ageTag: "Trayectorias adaptadas a cada edad",
    ageHeading: "Un currículo diseñado para cada etapa de crecimiento",
    ageAgesLabel: (r) => `Edades ${r} años`,
    integratedStudiosLabel: "Estudios integrados:",
    ageGroups: [
      {
        range: "4 - 6",
        title: "Primeros Brotes (Pre-A1)",
        focus: "Conciencia fonológica, reconocimiento de letras, rimas educativas y vocabulario cotidiano.",
        tools: ["Phonics Arcade", "Cuentos Ilustrados con Audio", "Trazado Interactivo"],
        color: "border-pink-200 bg-pink-50/50",
      },
      {
        range: "7 - 10",
        title: "Jóvenes Exploradores (A1 - A2)",
        focus: "Construcción autónoma de oraciones, fluidez lectora y recitación coránica con Taywid básico.",
        tools: ["Mapa Visual de Misiones", "Estudio de Pronunciación Majárij", "Reproductor Taywid a Color"],
        color: "border-blue-200 bg-blue-50/50",
      },
      {
        range: "11 - 13",
        title: "Pioneros Fluidos (A2 - B1)",
        focus: "Conversación, composición de textos, gramática aplicada (Nahw y Sarf) y cultura islámica.",
        tools: ["Lienzo de Caligrafía", "Repetición Espaciada SRS", "Conversaciones con Tutor IA"],
        color: "border-emerald-200 bg-emerald-50/50",
      },
      {
        range: "14 - 16",
        title: "Jóvenes Eruditos (B1 - B2)",
        focus: "Comprensión de textos clásicos, oratoria, reglas avanzadas de Taywid y elocuencia retórica.",
        tools: ["Banco de Evaluaciones Académicas", "Sala de Debate", "Certificaciones MCER Acreditadas"],
        color: "border-purple-200 bg-purple-50/50",
      },
    ],
    safetyTitle: "Seguridad Infantil y Privacidad de Datos (COPPA y GDPR)",
    safetyDesc: "Entorno estrictamente moderado sin mensajería directa entre alumnos. Grabaciones cifradas y cero rastreo publicitario.",
    cohortTitle: "Microgrupos (Máximo 6 Alumnos)",
    cohortDesc: "Límite estricto de 6 niños para asegurar que cada alumno tenga al menos 15 minutos de participación activa cada sesión.",
    parentTitle: "Participación Familiar e Informes Semanales",
    parentDesc: "Portal para padres con seguimiento de asistencia, repetición de lecciones, revisión de deberes y chat con el tutor.",
    ctaHeading: "¿Listo para comenzar el viaje de tu hijo?",
    ctaSub: "Regístrate hoy para recibir una evaluación diagnóstica gratuita y una clase de prueba con un docente de Arabic Kids Academy.",
    ctaRegister: "Iniciar registro gratuito",
    ctaPricing: "Ver planes de precios",
  },
};

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const validLocale: Locale = (["ar", "en", "nl", "tr", "it", "es"].includes(locale)
    ? locale
    : "en") as Locale;

  const t = HOW_IT_WORKS_I18N[validLocale];
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const stepIcons = [
    <Compass key="cp" className="w-8 h-8 text-brand-600" />,
    <Users key="us" className="w-8 h-8 text-emerald-600" />,
    <Video key="vd" className="w-8 h-8 text-purple-600" />,
    <Award key="aw" className="w-8 h-8 text-amber-600" />,
  ];

  const stepColors = [
    "bg-brand-50 border-brand-200",
    "bg-emerald-50 border-emerald-200",
    "bg-purple-50 border-purple-200",
    "bg-amber-50 border-amber-200",
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>{t.heroBadge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            {t.heroTitle}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/inquiry`}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white gradient-brand rounded-2xl shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all"
            >
              <span>{t.ctaDiagnostic}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}/programs`}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all"
            >
              <span>{t.ctaPrograms}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4-Step Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
            {t.journeyTag}
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t.journeyHeading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl border ${stepColors[idx]} shadow-sm relative flex flex-col justify-between transition-all hover:shadow-md`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                    {stepIcons[idx]}
                  </div>
                  <span className="text-2xl font-black text-slate-300">{step.number}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Live Interactive Placement Diagnostic */}
        <div className="mt-16">
          <InteractivePlacementCalculator locale={locale} isRtl={isRtl} />
        </div>
      </section>

      {/* Age-Group Tailored Pathways */}
      <section className="bg-white border-y border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              {t.ageTag}
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t.ageHeading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {t.ageGroups.map((group, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-3xl border ${group.color} shadow-sm space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 text-xs font-black text-brand-700 bg-brand-100 rounded-full">
                    {t.ageAgesLabel(group.range)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">CEFR Track</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {group.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {group.focus}
                </p>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t.integratedStudiosLabel}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {group.tools.map((tool, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safe & Trustworthy Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {t.safetyTitle}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.safetyDesc}
            </p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <Users className="w-10 h-10 text-brand-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {t.cohortTitle}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.cohortDesc}
            </p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <HeartHandshake className="w-10 h-10 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {t.parentTitle}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.parentDesc}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-brand-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl shadow-brand-500/20">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
            {t.ctaHeading}
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            {t.ctaSub}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/register`}
              className="px-8 py-3.5 bg-white text-brand-700 font-bold rounded-2xl shadow-lg hover:bg-slate-50 transition-all text-sm"
            >
              {t.ctaRegister}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="px-8 py-3.5 bg-brand-500/30 text-white border border-white/20 font-bold rounded-2xl hover:bg-brand-500/40 transition-all text-sm"
            >
              {t.ctaPricing}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
