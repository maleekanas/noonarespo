import React from "react";
import Link from "next/link";
import { type Locale, isRtlLocale } from "@/lib/localization";
import {
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Building2,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import { GlobalTimezoneConverter } from "@/components/marketing/GlobalTimezoneConverter";

interface PricingPlanData {
  id: string;
  priceMonthly: number;
  originalPriceMonthly?: number;
  discountPercent: number;
  popular: boolean;
  name: Record<Locale, string>;
  subtitle: Record<Locale, string>;
  badge: Record<Locale, string>;
  features: Record<Locale, string[]>;
}

const PLANS_DATA: PricingPlanData[] = [
  {
    id: "plan-individual",
    priceMonthly: 51.35,
    originalPriceMonthly: 79,
    discountPercent: 35,
    popular: true,
    name: {
      ar: "الخطة الفردية",
      en: "Individual Student",
      nl: "Individueel Leerplan",
      tr: "Bireysel Öğrenci",
      it: "Piano Individuale",
      es: "Plan Individual",
    },
    subtitle: {
      ar: "مثالية لطفل واحد يسعى لإتقان العربية والتجويد بخطى واثقة.",
      en: "Ideal for one child dedicated to mastering Arabic and Tajweed.",
      nl: "Ideaal voor één kind dat Arabisch en Tajweed met vertrouwen wil beheersen.",
      tr: "Arapça ve Tecvid'i özgüvenle öğrenmek isteyen tek çocuk için idealdir.",
      it: "Ideale per un bambino dedicato a padroneggiare l'arabo e il Tajweed.",
      es: "Ideal para un niño que desea dominar el árabe y el Taywid con confianza.",
    },
    badge: {
      ar: "الأكثر طلباً • خصم 35%",
      en: "Most Popular • 35% OFF",
      nl: "Meest Populair • 35% Korting",
      tr: "En Popüler • %35 İndirim",
      it: "Più Popolare • 35% di Sconto",
      es: "Más Popular • 35% de Descuento",
    },
    features: {
      ar: [
        "حصتان تفاعليتان أسبوعياً في مجموعة مصغرة (بحد أقصى 6 طلاب)",
        "معلم معتمد متخصص في تعليم الأطفال والتجويد",
        "وصول غير محدود لجميع الاستوديوهات التعليمية التفاعلية",
        "ألعاب قطار الحروف ونظام التكرار المتباعد للمفردات",
        "تقارير أسبوعية تفصيلية وتسجيلات الدروس لولي الأمر",
        "بيئة تعليمية آمنة ومتوافقة مع معايير COPPA وGDPR",
      ],
      en: [
        "2 Live Small-Group Classes per week (Max 6 students)",
        "Certified Native Arabic & Tajweed Specialist",
        "Full access to all 6 Interactive Studios",
        "Phonics Arcade & Leitner SRS Flashcards",
        "Weekly Parent Milestone Reports & Recordings",
        "COPPA/GDPR Compliant Private Dashboard",
      ],
      nl: [
        "2 live groepslessen per week (maximaal 6 leerlingen)",
        "Gecertificeerde native docent Arabisch & Tajweed",
        "Volledige toegang tot alle 6 interactieve studio's",
        "Phonics Arcade & Leitner SRS woordenschatkaarten",
        "Wekelijkse ouderverslagen en toegang tot lesopnames",
        "Volledig conform COPPA en Europese AVG/GDPR privacy",
      ],
      tr: [
        "Haftada 2 canlı küçük grup dersi (Maksimum 6 öğrenci)",
        "Sertifikalı anadili Arapça olan Tecvid uzmanı öğretmen",
        "6 etkileşimli dijital stüdyonun tamamına sınırsız erişim",
        "Harf oyunları ve Leitner aralıklı tekrar kartları",
        "Haftalık veli gelişim raporları ve ders kayıtları",
        "COPPA ve GDPR uyumlu güvenli veli paneli",
      ],
      it: [
        "2 lezioni dal vivo a settimana in piccoli gruppi (max 6 studenti)",
        "Insegnante madrelingua certificato specialista in Tajweed",
        "Accesso completo a tutti i 6 studi interattivi",
        "Phonics Arcade e flashcard con ripetizione spaziata SRS",
        "Report settimanali per i genitori e registrazioni delle lezioni",
        "Piattaforma protetta conforme agli standard COPPA e GDPR",
      ],
      es: [
        "2 clases en directo a la semana en grupos reducidos (máx. 6 alumnos)",
        "Profesor nativo certificado especialista en Taywid",
        "Acceso ilimitado a los 6 estudios interactivos",
        "Phonics Arcade y tarjetas de vocabulario con repetición espaciada SRS",
        "Informes semanales de progreso y grabaciones de las sesiones",
        "Panel protegido conforme a las normativas COPPA y GDPR",
      ],
    },
  },
  {
    id: "plan-family",
    priceMonthly: 74.5,
    originalPriceMonthly: 149,
    discountPercent: 50,
    popular: false,
    name: {
      ar: "باقة العائلة",
      en: "Family Bundle",
      nl: "Familiepakket",
      tr: "Aile Paketi",
      it: "Pacchetto Famiglia",
      es: "Paquete Familiar",
    },
    subtitle: {
      ar: "مصممة للعائلات التي لديها طفلان إلى 3 أطفال يتعلمون معاً.",
      en: "Designed for families with 2 to 3 children learning together.",
      nl: "Ontworpen voor gezinnen met 2 tot 3 lerende kinderen.",
      tr: "Birlikte öğrenen 2 ila 3 çocuklu aileler için tasarlanmıştır.",
      it: "Progettato per famiglie con 2 o 3 bambini che imparano insieme.",
      es: "Diseñado para familias con 2 a 3 hijos aprendiendo juntos.",
    },
    badge: {
      ar: "أفضل قيمة • خصم 50%",
      en: "Best Value • 50% OFF",
      nl: "Beste Keuze • 50% Korting",
      tr: "En İyi Değer • %50 İndirim",
      it: "Miglior Valore • 50% di Sconto",
      es: "Mejor Valor • 50% de Descuento",
    },
    features: {
      ar: [
        "يشمل حتى 3 ملفات تعريف مستقلة للأطفال",
        "من 4 إلى 6 حصص مباشرة أسبوعياً مقسمة بين الأبناء",
        "خريطة تعلم ومسار تقدم مستقل لكل طفل",
        "تقييمات واجبات وفحوصات صوتية مخصصة لكل طالب",
        "مفتاح تبديل فوري بين الأبناء في لوحة تحكم الوالدين",
        "أولوية في الدعم الفني واختيار المواعيد",
      ],
      en: [
        "Up to 3 Children Student Profiles included",
        "4 to 6 Live Classes per week shared across children",
        "Independent Quest Maps & Biome progression",
        "Separate Homework & Live Session Evaluations",
        "Multi-child switcher on Parent Dashboard",
        "Priority Educator & Support Concierge",
      ],
      nl: [
        "Inclusief profielen voor maximaal 3 kinderen",
        "4 tot 6 live lessen per week verdeeld over de kinderen",
        "Zelfstandige Quest Maps & voortgangsroute per kind",
        "Aparte huiswerkopdrachten en leerevaluaties",
        "Eenvoudig schakelen tussen kinderen in het ouderportaal",
        "Voorrang bij studieadvies en roosterplanning",
      ],
      tr: [
        "En fazla 3 çocuğa kadar bağımsız öğrenci profili",
        "Çocuklar arasında paylaştırılan haftada 4 ila 6 canlı ders",
        "Her çocuk için bağımsız macera haritası ve seviye ilerlemesi",
        "Her öğrenciye özel ödev ve canlı ders değerlendirmeleri",
        "Veli panelinde çocuklar arasında anında geçiş",
        "Öncelikli öğretmen seçimi ve destek concierge hizmeti",
      ],
      it: [
        "Fino a 3 profili studente per bambini inclusi",
        "Da 4 a 6 lezioni dal vivo a settimana condivise tra i figli",
        "Mappa di apprendimento e progressi individuali per ciascun bambino",
        "Compiti e valutazioni dedicati per ogni allievo",
        "Passaggio rapido tra i profili dei figli nel portale genitori",
        "Assistenza prioritaria e flessibilità negli orari",
      ],
      es: [
        "Hasta 3 perfiles de alumnos incluidos para hermanos",
        "De 4 a 6 clases en directo semanales repartidas entre los hijos",
        "Mapa de aprendizaje y progreso independiente para cada niño",
        "Corrección de deberes y evaluaciones individuales",
        "Selector rápido de perfiles en el panel de padres",
        "Atención prioritaria y preferencia de horarios",
      ],
    },
  },
  {
    id: "plan-private",
    priceMonthly: 89.55,
    originalPriceMonthly: 199,
    discountPercent: 55,
    popular: false,
    name: {
      ar: "التعليم الفردي الخاص (1 على 1)",
      en: "Private 1-on-1 VIP",
      nl: "Privé 1-op-1 VIP",
      tr: "Birebir Özel VIP",
      it: "Privato 1 a 1 VIP",
      es: "Privado 1 a 1 VIP",
    },
    subtitle: {
      ar: "أقصى درجات التركيز والتطور عبر حصص فردية خاصة تماماً.",
      en: "Maximum acceleration with dedicated 1-on-1 private mentorship.",
      nl: "Maximale vooruitgang met intensieve 1-op-1 privébegeleiding.",
      tr: "Birebir özel eğitmen eşliğinde en hızlı dil ve Kuran gelişimi.",
      it: "Massima accelerazione con tutoraggio privato 1 a 1 dedicato.",
      es: "Máxima aceleración con tutoría privada individualizada 1 a 1.",
    },
    badge: {
      ar: "تعليم خاص مكثف • خصم 55%",
      en: "VIP Acceleration • 55% OFF",
      nl: "VIP Versnelling • 55% Korting",
      tr: "VIP Hızlandırılmış • %55 İndirim",
      it: "VIP Accelerato • 55% di Sconto",
      es: "Aceleración VIP • 55% de Descuento",
    },
    features: {
      ar: [
        "حصص خاصة ومباشرة بالكامل (معلم لطفل واحد)",
        "مرونة كاملة في تحديد المواعيد وإعادة الجدولة",
        "تحليل صوتي دقيق لمخارج الحروف ونبرات الصوت",
        "مسار مكثف لحفظ القرآن الكريم وتأهيل الإجازة",
        "خط استشاري مباشر بين المعلم وولي الأمر",
        "أوراق عمل مخصصة لاحتياجات الطفل الفردية",
      ],
      en: [
        "100% Dedicated One-on-One Live Lessons",
        "Customized lesson pacing and flexible rescheduling",
        "Advanced Phoneme & Makharij Speech Analysis",
        "Accelerated Quran Hifz & Ijazah Preparation",
        "Direct Teacher-Parent WhatsApp advisory line",
        "Custom Printable Worksheets tailored to child",
      ],
      nl: [
        "100% individuele 1-op-1 live lessen met de docent",
        "Gepersonaliseerd leertempo en soepele lesverplaatsing",
        "Geavanceerde klank- en Makharij-uitspraakanalyse",
        "Versneld traject voor Koranhifz en Ijazah-voorbereiding",
        "Direct contact tussen docent en ouder via WhatsApp",
        "Op maat gemaakte printbare werkbladen voor je kind",
      ],
      tr: [
        "%100 birebir özel canlı dersler (Tek öğrenci - tek öğretmen)",
        "Kişiselleştirilmiş öğrenme hızı ve esnek ders erteleme",
        "İleri düzey fonetik ve mahreç ses analizi",
        "Hızlandırılmış Kuran hıfzı ve icazet hazırlık programı",
        "Öğretmen ve veli arasında doğrudan WhatsApp danışma hattı",
        "Çocuğun bireysel ihtiyaçlarına özel basılabilir çalışma kağıtları",
      ],
      it: [
        "Lezioni dal vivo 100% individuali one-to-one",
        "Ritmo personalizzato e massima flessibilità di recupero",
        "Analisi acustica avanzata dei fonemi e dei Makharij",
        "Percorso intensivo di memorizzazione del Corano (Hifz)",
        "Filo diretto WhatsApp tra docente e genitore",
        "Schede didattiche stampabili personalizzate per l'allievo",
      ],
      es: [
        "Clases particulares en directo 100% individuales",
        "Ritmo a medida y máxima flexibilidad para reprogramar",
        "Análisis acústico avanzado de fonemas y Majárij",
        "Ruta intensiva de memorización del Corán (Hifz) e Ijazah",
        "Línea de asesoramiento directo por WhatsApp con el docente",
        "Fichas de trabajo imprimibles diseñadas para tu hijo",
      ],
    },
  },
];

const PRICING_UI = {
  heroBadge: {
    ar: "خصومات خاصة تصل إلى 55% على كافة الباقات • تجربة مجانية ليوم واحد",
    en: "Special Discounts up to 55% Off All Plans • 1-Day Free Trial",
    nl: "Kortingen tot 55% op alle plannen • 1 Dag Gratis Proefperiode",
    tr: "Tüm Planlarda %55'e Varan İndirimler • 1 Gün Ücretsiz Deneme",
    it: "Sconti speciali fino al 55% su tutti i piani • Prova gratuita di 1 giorno",
    es: "Descuentos especiales de hasta el 55% • Prueba gratuita de 1 día",
  },
  heroTitle: {
    ar: "استثمر في هوية طفلك وفصاحته",
    en: "Invest in Your Child's Faith, Language & Future",
    nl: "Investeer in de identiteit en taal van jouw kind",
    tr: "Çocuğunuzun İnancına, Diline ve Geleceğine Yatırım Yapın",
    it: "Investi nella fede, nella lingua e nel futuro di tuo figlio",
    es: "Invierte en la fe, el idioma y el futuro de tu hijo",
  },
  heroSubtitle: {
    ar: "اختر الخطة المناسبة لعائلتك مع ضمان استرداد الأموال بنسبة 100% خلال أول 14 يوماً ومواعيد متوافقة مع منطقتك الزمنية.",
    en: "Choose the plan that fits your family. All plans include a 1-day free trial, a 14-day 100% money-back guarantee, and schedules adapted to your timezone.",
    nl: "Kies het plan dat bij jouw gezin past. Inclusief 1 dag proef, 14 dagen 100% niet-goed-geld-terug garantie en roosters op jouw tijdzone.",
    tr: "Ailenize en uygun planı seçin. Tüm planlar 1 günlük ücretsiz deneme, 14 günlük %100 para iade garantisi ve saat diliminize uygun programlar içerir.",
    it: "Scegli il piano ideale per la tua famiglia con prova di 1 giorno, garanzia di rimborso al 100% per 14 giorni e lezioni nel tuo fuso orario.",
    es: "Elige el plan ideal para tu familia con 1 día de prueba, garantía de devolución del 100% durante 14 días y horarios en tu zona horaria.",
  },
  billedMonthly: {
    ar: "تجديد شهري",
    en: "Billed Monthly",
    nl: "Maandelijks gefactureerd",
    tr: "Aylık Yenilenir",
    it: "Fatturato mensilmente",
    es: "Facturación mensual",
  },
  perMonth: {
    ar: "/ شهرياً",
    en: "/ month",
    nl: "/ maand",
    tr: "/ ay",
    it: "/ mese",
    es: "/ mes",
  },
  whatsIncluded: {
    ar: "المميزات المتضمنة:",
    en: "What's Included:",
    nl: "Inbegrepen voordelen:",
    tr: "Dahil Olan Özellikler:",
    it: "Cosa è incluso:",
    es: "Ventajas incluidas:",
  },
  trialButton: {
    ar: "ابدأ التجربة المجانية (طفل واحد • 24 ساعة)",
    en: "Start 1-Day Trial (1 Child Max)",
    nl: "Start 1-daagse proef (max. 1 kind)",
    tr: "1 Günlük Denemeyi Başlat (1 Çocuk)",
    it: "Inizia la prova di 1 giorno (1 bambino)",
    es: "Iniciar prueba de 1 día (1 hijo)",
  },
  subscribeButton: {
    ar: "أو اشترك وادفع فوراً (بدون فترة تجربة)",
    en: "Or Subscribe & Pay Now (Skip Trial)",
    nl: "Of abonneer direct (sla proef over)",
    tr: "Veya Hemen Abone Ol (Denemeyi Atla)",
    it: "O abbonati subito (salta la prova)",
    es: "O suscríbete directamente (saltar prueba)",
  },
  trialsCompareBadge: {
    ar: "مقارنة فترات التجربة المجانية",
    en: "Free Trial Comparison",
    nl: "Vergelijking Proefperiodes",
    tr: "Ücretsiz Deneme Karşılaştırması",
    it: "Confronto Prove Gratuite",
    es: "Comparativa de Pruebas Gratuitas",
  },
  trialsCompareTitle: {
    ar: "خطط التجربة المجانية المصممة بعناية",
    en: "Carefully Scoped Free Trials",
    nl: "Zorgvuldig samengestelde proefperiodes",
    tr: "Özel Olarak Planlanmış Ücretsiz Denemeler",
    it: "Piani di prova gratuiti calibrati su misura",
    es: "Planes de prueba gratuitos diseñados a medida",
  },
  trialsCompareSub: {
    ar: "سواء كنت ولي أمر يستكشف المنصة لطفله، أو مدرسة ترغب في اختبار البنية التحتية مع فريقها، نوفر تجربة مخصصة بدون أي التزام مالي.",
    en: "Whether you are a parent previewing capabilities for your child, or an institution evaluating infrastructure with your team, we offer tailored zero-commitment evaluations.",
    nl: "Of je nu een ouder bent die de mogelijkheden verkent of een school die het platform test: wij bieden evaluaties zonder verplichtingen.",
    tr: "İster çocuğu için platformu keşfeden bir veli, ister altyapıyı ekibiyle test eden bir okul olun: sıfır finansal taahhütle özel denemeler sunuyoruz.",
    it: "Sia che tu sia un genitore che desidera esplorare la piattaforma o una scuola che valuta l'infrastruttura, offriamo prove su misura senza impegno.",
    es: "Tanto si eres una familia explorando la plataforma como una escuela evaluando la infraestructura, ofrecemos pruebas a medida sin compromiso.",
  },
  b2cTrialBadge: {
    ar: "تجربة العائلات وأولياء الأمور",
    en: "Family & Parent Trial",
    nl: "Proef voor Gezinnen & Ouders",
    tr: "Aile ve Veli Denemesi",
    it: "Prova Famiglia e Genitori",
    es: "Prueba para Familias y Padres",
  },
  b2cTrialTag: {
    ar: "24 ساعة • طفل واحد",
    en: "1 Day • 1 Child Max",
    nl: "24 Uur • Maximaal 1 Kind",
    tr: "24 Saat • En Fazla 1 Çocuk",
    it: "24 Ore • Max 1 Bambino",
    es: "24 Horas • Máx. 1 Hijo",
  },
  b2cTrialHeading: {
    ar: "معاينة إمكانيات المنصة للطفل",
    en: "Core Feature Preview",
    nl: "Voorproefje van de kernfuncties",
    tr: "Platform Özelliklerini Keşfedin",
    it: "Anteprima delle funzionalità",
    es: "Vista previa de funciones clave",
  },
  b2cTrialFeatures: {
    ar: [
      "اختبار تشخيص المستوى لتحديد نقطة البداية المناسبة (محاولة واحدة)",
      "درس تمهيدي تفاعلي كامل في مسار التأسيس والتجويد",
      "تجربة لعبة قطار الحروف وقصة مصورة من مكتبة القراءة",
      "فحص صوتي تجريبي لمخارج الحروف مع تقييم نطق فوري",
    ],
    en: [
      "Diagnostic placement assessment to identify child's baseline (1 attempt)",
      "1 full preview interactive lesson in Foundations & Tajweed",
      "1 phonics arcade game and 1 illustrated storybook",
      "Speech recognition pronunciation feedback preview",
    ],
    nl: [
      "Diagnostische niveautest om het instapniveau te bepalen (1 poging)",
      "1 volledige interactieve proefles in Basisvaardigheden & Tajweed",
      "1 Phonics Arcade klankspel en 1 geïllustreerd verhaal",
      "Spraakherkenning voor directe uitspraakfeedback",
    ],
    tr: [
      "Çocuğun seviyesini belirleyen teşhis değerlendirmesi (1 deneme)",
      "Temel Seviye ve Tecvid alanında 1 tam etkileşimli deneme dersi",
      "1 harf treni oyunu ve kütüphaneden 1 resimli hikaye kitabı",
      "Anında telaffuz geri bildirimi sağlayan ses analizi denemesi",
    ],
    it: [
      "Test diagnostico per identificare il livello di partenza (1 tentativo)",
      "1 lezione interattiva completa di prova nei Fondamenti e Tajweed",
      "1 gioco fonetico arcade e 1 libro di racconti illustrato",
      "Riconoscimento vocale con feedback immediato sulla pronuncia",
    ],
    es: [
      "Evaluación diagnóstica para determinar el nivel de partida (1 intento)",
      "1 lección interactiva de prueba completa en Fundamentos y Taywid",
      "1 juego fonético arcade y 1 cuento ilustrado de la biblioteca",
      "Reconocimiento de voz con retroalimentación inmediata de pronunciación",
    ],
  },
  b2cTrialNote: {
    ar: "🔒 ملاحظة: الفصول الحية المباشرة وإضافة طفل ثانٍ تتطلب الترقية للباقة الكاملة.",
    en: "🔒 Note: Live micro-cohort classes and adding a 2nd child require upgrading to a full plan.",
    nl: "🔒 Let op: Live groepslessen en een tweede kind toevoegen vereisen een volwaardig abonnement.",
    tr: "🔒 Not: Canlı mikro grup dersleri ve ikinci bir çocuk eklemek tam plana yükseltme gerektirir.",
    it: "🔒 Nota: Le classi dal vivo e l'aggiunta di un secondo figlio richiedono il piano completo.",
    es: "🔒 Nota: Las clases en directo y añadir un segundo hijo requieren un plan completo.",
  },
  b2bTrialBadge: {
    ar: "تجربة المدارس والمعاهد (B2B)",
    en: "Schools & Institutes Trial",
    nl: "Proef voor Scholen & Instituten (B2B)",
    tr: "Okul ve Enstitü Denemesi (B2B)",
    it: "Prova Scuole e Istituti (B2B)",
    es: "Prueba para Escuelas e Institutos (B2B)",
  },
  b2bTrialTag: {
    ar: "3 أيام • حتى 10 طلاب",
    en: "3 Days • Up to 10 Students",
    nl: "3 Dagen • Tot 10 Leerlingen",
    tr: "3 Gün • 10 Öğrenciye Kadar",
    it: "3 Giorni • Fino a 10 Studenti",
    es: "3 Días • Hasta 10 Alumnos",
  },
  b2bTrialHeading: {
    ar: "حزمة تقييم مؤسسية متكاملة",
    en: "Complete Institutional Evaluation",
    nl: "Compleet evaluatiepakket voor instellingen",
    tr: "Eksiksiz Kurumsal Değerlendirme Paketi",
    it: "Valutazione istituzionale completa",
    es: "Paquete de evaluación institucional integral",
  },
  b2bTrialFeatures: {
    ar: [
      "10 مقاعد دراسية نشطة مع إنشاء حسابات الطلاب بضغطة زر",
      "فصل تفاعلي حي للمؤسسة (سبورة ذكية، اتصال مرئي وصوتي)",
      "لوحة تحكم إدارية خاصة بالمؤسسة وتقارير حضور وتفاعل مع تصدير CSV",
      "معاينة المسارات الـ 7 المعتمدة ودليل المعلمين المعتمدين",
    ],
    en: [
      "10 active student seats with instant bulk roster account generation",
      "1 dedicated live classroom (whiteboard, video & audio)",
      "Scoped institutional admin dashboard & attendance reporting with CSV export",
      "Preview of all 7 accredited tracks & certified educator directory",
    ],
    nl: [
      "10 actieve leerlinglicenties met directe groepsregistratie",
      "1 virtueel klaslokaal (whiteboard, video en audio)",
      "Beheerdersdashboard voor instellingen met aanwezigheidsrapporten en CSV-export",
      "Inzage in alle 7 curricula en gids met gecertificeerde leerkrachten",
    ],
    tr: [
      "Tek tıkla toplu öğrenci hesabı oluşturan 10 aktif kontenjan",
      "Kuruma özel 1 canlı sınıf (akıllı tahta, video ve ses bağlantısı)",
      "Kurum yönetim paneli, devam takip raporları ve CSV dışa aktarımı",
      "7 akredite müfredatın ve sertifikalı öğretmen rehberinin önizlemesi",
    ],
    it: [
      "10 postazioni attive con creazione immediata degli account studenti",
      "1 aula virtuale dedicata (lavagna interattiva, video e audio)",
      "Pannello amministratore per istituti con report presenze ed esportazione CSV",
      "Anteprima dei 7 percorsi didattici e del registro insegnanti certificati",
    ],
    es: [
      "10 plazas activas con alta masiva de cuentas de alumnos",
      "1 aula virtual en directo (pizarra compartida, audio y vídeo)",
      "Panel de administración institucional con informes de asistencia y exportación CSV",
      "Acceso previo a los 7 programas acreditados y directorio de docentes",
    ],
  },
  zeroCard: {
    ar: "بدون أي بطاقة بنكية مطلوبة",
    en: "Zero credit card required",
    nl: "Geen creditcard vereist",
    tr: "Kredi kartı gerekmez",
    it: "Nessuna carta richiesta",
    es: "Sin tarjeta de crédito requerida",
  },
  requestB2B: {
    ar: "طلب التجربة المؤسسية ←",
    en: "Request B2B Trial →",
    nl: "B2B Proef aanvragen →",
    tr: "Kurumsal Deneme Talep Et →",
    it: "Richiedi prova B2B →",
    es: "Solicitar prueba B2B →",
  },
  b2bBannerBadge: {
    ar: "المدارس، المعاهد، والمعلمون المستقلون (B2B)",
    en: "Schools, Institutes & Freelance Teachers (B2B)",
    nl: "Scholen, Instituten & Docenten (B2B)",
    tr: "Okullar, Enstitüler ve Serbest Öğretmenler (B2B)",
    it: "Scuole, Istituti e Insegnanti Freelance (B2B)",
    es: "Colegios, Institutos y Profesores Particulares (B2B)",
  },
  b2bBannerHeading: {
    ar: "هل تمثل مدرسة، معهداً، أو معلماً مستقلاً؟",
    en: "Looking for Institutional or Freelance Licensing?",
    nl: "Vertegenwoordig je een school, instituut of ben je privédocent?",
    tr: "Bir okulu, enstitüyü veya serbest bir eğitmeni mi temsil ediyorsunuz?",
    it: "Rappresenti una scuola, un istituto o sei un docente freelance?",
    es: "¿Representas a un colegio, academia o eres profesor independiente?",
  },
  b2bBannerDesc: {
    ar: "نوفر 3 باقات مؤسسية مرنة (Starter حتى 25 طالباً، Growth من 26-100 طالب، وInstitution للمؤسسات الكبرى) مع خصم 35%، بالإضافة إلى تجربة مجانية لمدة 3 أيام لـ 10 طلاب، تشمل لوحة تحكم مخصصة، تسجيلاً جماعياً، فصولاً تفاعلية حية، وتقارير حضور وإنجاز معتمدة.",
    en: "We offer 3 flexible B2B bundles (Starter up to 25 students, Growth 26–100 students, and Institution for 100+) with a 35% discount, plus a 3-day free trial for up to 10 students, dedicated multi-tenant admin dashboards, bulk roster onboarding, live collaborative classrooms, and accredited reporting.",
    nl: "We bieden 3 flexibele B2B-bundels met 35% korting, plus een 3-daagse gratis proefperiode voor 10 leerlingen met een eigen beheerdersportaal en virtuele lokalen.",
    tr: "Starter, Growth ve Institution olmak üzere %35 indirimli 3 kurumsal paket ve 10 öğrenciye kadar 3 günlük ücretsiz deneme imkanı sunuyoruz.",
    it: "Offriamo 3 pacchetti B2B flessibili con il 35% di sconto, oltre a una prova gratuita di 3 giorni per un massimo di 10 studenti con dashboard gestionale.",
    es: "Ofrecemos 3 paquetes B2B flexibles con un 35% de descuento, más una prueba gratuita de 3 días para hasta 10 alumnos con panel de control multi-sede.",
  },
  b2bBannerButton: {
    ar: "استكشف باقات المؤسسات وتجربة 3 أيام",
    en: "Explore B2B Hub & 3-Day Trial",
    nl: "Ontdek B2B Hub & 3-daagse proef",
    tr: "Kurumsal Paneli ve 3 Günlük Denemeyi İnceleyin",
    it: "Esplora l'Hub B2B e la prova di 3 giorni",
    es: "Explorar portal B2B y prueba de 3 días",
  },
  guarantee1Title: {
    ar: "ضمان استرداد 100% لمدة 14 يوماً",
    en: "14-Day Money-Back Guarantee",
    nl: "14 Dagen 100% Geld-Terug-Garantie",
    tr: "14 Gün %100 Para İade Garantisi",
    it: "Garanzia di rimborso al 100% entro 14 giorni",
    es: "Garantía de devolución del 100% durante 14 días",
  },
  guarantee1Desc: {
    ar: "إذا لم تكن راضياً تماماً، نسترد اشتراكك فوراً دون شروط.",
    en: "Cancel within 14 days for a full refund, no questions asked.",
    nl: "Annuleer binnen 14 dagen voor een volledige terugbetaling, zonder vragen.",
    tr: "14 gün içinde koşulsuz tam para iadesi ile aboneliğinizi sonlandırabilirsiniz.",
    it: "Annulla entro 14 giorni per un rimborso completo, senza domande.",
    es: "Cancela dentro de los primeros 14 días para un reembolso total sin preguntas.",
  },
  guarantee2Title: {
    ar: "طرق دفع عالمية ومحلية آمنة",
    en: "Global & Local Payment Gateways",
    nl: "Veilige wereldwijde en lokale betaalmethoden",
    tr: "Güvenli Küresel ve Yerel Ödeme Yöntemleri",
    it: "Circuiti di pagamento globali e locali sicuri",
    es: "Pasarelas de pago locales y globales seguras",
  },
  guarantee3Title: {
    ar: "دعم أولياء الأمور على مدار الساعة",
    en: "24/7 Dedicated Parent Support",
    nl: "24/7 Toegewijde Ouderondersteuning",
    tr: "7/24 Kesintisiz Veli Desteği",
    it: "Supporto dedicato ai genitori 24/7",
    es: "Atención continuada para familias 24/7",
  },
  guarantee3Desc: {
    ar: "فريق دعم متخصص للإجابة على جميع الاستفسارات الفنية والأكاديمية.",
    en: "Direct concierge support via WhatsApp, email, and live messaging.",
    nl: "Directe studiebegeleiding via WhatsApp, e-mail en live chat.",
    tr: "WhatsApp, e-posta ve canlı mesajlaşma ile doğrudan veli danışmanlığı.",
    it: "Assistenza concierge diretta via WhatsApp, e-mail e messaggistica.",
    es: "Asistencia directa y personalizada a través de WhatsApp, e-mail y chat.",
  },
};

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const validLocale: Locale = (["ar", "en", "nl", "tr", "it", "es"].includes(locale)
    ? locale
    : "en") as Locale;

  const t = PRICING_UI;
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 lg:py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>{t.heroBadge[validLocale]}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            {t.heroTitle[validLocale]}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle[validLocale]}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-20 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS_DATA.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 flex flex-col justify-between border bg-white shadow-sm transition-all hover:shadow-xl ${
                plan.popular
                  ? "border-brand-500 ring-2 ring-brand-500/20 relative"
                  : "border-slate-200"
              }`}
            >
              <div>
                {plan.badge && (
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                        plan.popular
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {plan.badge[validLocale]}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{t.billedMonthly[validLocale]}</span>
                  </div>
                )}
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  {plan.name[validLocale]}
                </h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  {plan.subtitle[validLocale]}
                </p>

                <div className="flex items-baseline flex-wrap gap-2 mb-6">
                  {plan.originalPriceMonthly && (
                    <span className="text-xl sm:text-2xl font-bold text-slate-400 line-through">
                      ${plan.originalPriceMonthly}
                    </span>
                  )}
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-slate-500 text-sm font-medium">
                    {t.perMonth[validLocale]}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                    -{plan.discountPercent}%
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-6 mb-6">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                    {t.whatsIncluded[validLocale]}
                  </h4>
                  <ul className="space-y-3">
                    {plan.features[validLocale].map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-600">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-2">
                <Link
                  href={`/${locale}/register?plan=${plan.id}&trial=1`}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md ${
                    plan.popular
                      ? "gradient-brand text-white shadow-brand-500/25 hover:opacity-95"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <span>{t.trialButton[validLocale]}</span>
                  <ArrowIcon className="w-4 h-4" />
                </Link>
                <Link
                  href={`/${locale}/register?plan=${plan.id}`}
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 text-slate-500 hover:text-brand-600 transition-colors"
                >
                  <span>{t.subscribeButton[validLocale]}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Dedicated Free Trial Explainer & B2B vs B2C Comparison */}
        <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-black text-brand-600 uppercase tracking-wider px-3 py-1 rounded-full bg-brand-50">
              {t.trialsCompareBadge[validLocale]}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t.trialsCompareTitle[validLocale]}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.trialsCompareSub[validLocale]}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* B2C 1-Day Trial */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                  {t.b2cTrialBadge[validLocale]}
                </span>
                <span className="text-xs font-bold text-amber-700">
                  {t.b2cTrialTag[validLocale]}
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-900">
                {t.b2cTrialHeading[validLocale]}
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {t.b2cTrialFeatures[validLocale].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                {t.b2cTrialNote[validLocale]}
              </div>
            </div>

            {/* B2B 3-Day Trial */}
            <div className="bg-white rounded-2xl p-6 border border-brand-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-900 font-extrabold text-xs">
                  {t.b2bTrialBadge[validLocale]}
                </span>
                <span className="text-xs font-bold text-brand-700">
                  {t.b2bTrialTag[validLocale]}
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-900">
                {t.b2bTrialHeading[validLocale]}
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {t.b2bTrialFeatures[validLocale].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
                <span>{t.zeroCard[validLocale]}</span>
                <Link href={`/${locale}/schools?bundle=TRIAL_3_DAYS#apply`} className="text-brand-600 font-bold hover:underline">
                  {t.requestB2B[validLocale]}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Global Timezone Live Class Converter */}
        <GlobalTimezoneConverter locale={locale} isRtl={isRtl} />

        {/* Institutional / School Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>{t.b2bBannerBadge[validLocale]}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {t.b2bBannerHeading[validLocale]}
            </h3>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {t.b2bBannerDesc[validLocale]}
            </p>
          </div>
          <Link
            href={`/${locale}/schools`}
            className="shrink-0 px-6 py-3.5 rounded-2xl bg-brand-600 text-white hover:bg-brand-700 font-bold text-sm shadow-md transition-colors flex items-center gap-2"
          >
            <span>{t.b2bBannerButton[validLocale]}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Guarantees & Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/70">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {t.guarantee1Title[validLocale]}
            </h4>
            <p className="text-xs text-slate-500">
              {t.guarantee1Desc[validLocale]}
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200/70">
            <CreditCard className="w-8 h-8 text-brand-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {t.guarantee2Title[validLocale]}
            </h4>
            <p className="text-xs text-slate-500">
              Stripe, PayPal, Mollie (iDEAL/Bancontact), Apple Pay, Google Pay.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200/70">
            <HelpCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {t.guarantee3Title[validLocale]}
            </h4>
            <p className="text-xs text-slate-500">
              {t.guarantee3Desc[validLocale]}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
