"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Globe,
  Clock,
  Building2,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface PricingCalculatorProps {
  locale: string;
  isRtl?: boolean;
}

type CurrencyCode = "USD" | "EUR" | "GBP" | "SAR" | "AED" | "CAD";

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  symbolAr: string;
  rateFromUsd: number;
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", symbolAr: "$", rateFromUsd: 1 },
  EUR: { code: "EUR", symbol: "€", symbolAr: "€", rateFromUsd: 0.92 },
  GBP: { code: "GBP", symbol: "£", symbolAr: "£", rateFromUsd: 0.79 },
  SAR: { code: "SAR", symbol: "SAR ", symbolAr: " ر.س", rateFromUsd: 3.75 },
  AED: { code: "AED", symbol: "AED ", symbolAr: " د.إ", rateFromUsd: 3.67 },
  CAD: { code: "CAD", symbol: "C$", symbolAr: "C$", rateFromUsd: 1.36 },
};

interface TimezoneOption {
  id: string;
  name: Record<string, string>;
  offsetHours: number;
  cohortWeekday: Record<string, string>;
  cohortWeekend: Record<string, string>;
}

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  {
    id: "london",
    name: {
      ar: "لندن (توقيت غرينتش • UTC+0)",
      nl: "Londen (GMT/BST • UTC+0)",
      tr: "Londra (GMT/BST • UTC+0)",
      it: "Londra (GMT/BST • UTC+0)",
      es: "Londres (GMT/BST • UTC+0)",
      en: "London (GMT/BST • UTC+0)",
    },
    offsetHours: 0,
    cohortWeekday: {
      ar: "الإثنين والأربعاء • 16:30 - 17:15",
      nl: "Ma & Wo • 16:30 - 17:15",
      tr: "Pzt & Çar • 16:30 - 17:15",
      it: "Lun & Mer • 16:30 - 17:15",
      es: "Lun y Mié • 16:30 - 17:15",
      en: "Mon & Wed • 16:30 - 17:15",
    },
    cohortWeekend: {
      ar: "السبت والأحد • 10:00 - 10:45",
      nl: "Za & Zo • 10:00 - 10:45",
      tr: "Cmt & Paz • 10:00 - 10:45",
      it: "Sab & Dom • 10:00 - 10:45",
      es: "Sáb y Dom • 10:00 - 10:45",
      en: "Sat & Sun • 10:00 - 10:45",
    },
  },
  {
    id: "amsterdam",
    name: {
      ar: "أمستردام / برلين / باريس (توقيت وسط أوروبا • UTC+1)",
      nl: "Amsterdam / Berlijn / Parijs (CET • UTC+1)",
      tr: "Amsterdam / Berlin / Paris (CET • UTC+1)",
      it: "Amsterdam / Berlino / Parigi (CET • UTC+1)",
      es: "Ámsterdam / Berlín / París (CET • UTC+1)",
      en: "Amsterdam / Berlin / Paris (CET • UTC+1)",
    },
    offsetHours: 1,
    cohortWeekday: {
      ar: "الإثنين والأربعاء • 17:30 - 18:15",
      nl: "Ma & Wo • 17:30 - 18:15",
      tr: "Pzt & Çar • 17:30 - 18:15",
      it: "Lun & Mer • 17:30 - 18:15",
      es: "Lun y Mié • 17:30 - 18:15",
      en: "Mon & Wed • 17:30 - 18:15",
    },
    cohortWeekend: {
      ar: "السبت والأحد • 11:00 - 11:45",
      nl: "Za & Zo • 11:00 - 11:45",
      tr: "Cmt & Paz • 11:00 - 11:45",
      it: "Sab & Dom • 11:00 - 11:45",
      es: "Sáb y Dom • 11:00 - 11:45",
      en: "Sat & Sun • 11:00 - 11:45",
    },
  },
  {
    id: "newyork",
    name: {
      ar: "نيويورك / تورونتو (توقيت شرق أمريكا • UTC-5)",
      nl: "New York / Toronto (EST • UTC-5)",
      tr: "New York / Toronto (EST • UTC-5)",
      it: "New York / Toronto (EST • UTC-5)",
      es: "Nueva York / Toronto (EST • UTC-5)",
      en: "New York / Toronto (EST • UTC-5)",
    },
    offsetHours: -5,
    cohortWeekday: {
      ar: "الثلاثاء والخميس • 17:00 - 17:45",
      nl: "Di & Do • 17:00 - 17:45",
      tr: "Sal & Per • 17:00 - 17:45",
      it: "Mar & Gio • 17:00 - 17:45",
      es: "Mar y Jue • 17:00 - 17:45",
      en: "Tue & Thu • 17:00 - 17:45",
    },
    cohortWeekend: {
      ar: "السبت والأحد • 10:30 - 11:15",
      nl: "Za & Zo • 10:30 - 11:15",
      tr: "Cmt & Paz • 10:30 - 11:15",
      it: "Sab & Dom • 10:30 - 11:15",
      es: "Sáb y Dom • 10:30 - 11:15",
      en: "Sat & Sun • 10:30 - 11:15",
    },
  },
  {
    id: "chicago",
    name: {
      ar: "شيكاغو / دالاس (توقيت وسط أمريكا • UTC-6)",
      nl: "Chicago / Dallas (CST • UTC-6)",
      tr: "Chicago / Dallas (CST • UTC-6)",
      it: "Chicago / Dallas (CST • UTC-6)",
      es: "Chicago / Dallas (CST • UTC-6)",
      en: "Chicago / Dallas (CST • UTC-6)",
    },
    offsetHours: -6,
    cohortWeekday: {
      ar: "الثلاثاء والخميس • 16:30 - 17:15",
      nl: "Di & Do • 16:30 - 17:15",
      tr: "Sal & Per • 16:30 - 17:15",
      it: "Mar & Gio • 16:30 - 17:15",
      es: "Mar y Jue • 16:30 - 17:15",
      en: "Tue & Thu • 16:30 - 17:15",
    },
    cohortWeekend: {
      ar: "السبت والأحد • 09:30 - 10:15",
      nl: "Za & Zo • 09:30 - 10:15",
      tr: "Cmt & Paz • 09:30 - 10:15",
      it: "Sab & Dom • 09:30 - 10:15",
      es: "Sáb y Dom • 09:30 - 10:15",
      en: "Sat & Sun • 09:30 - 10:15",
    },
  },
  {
    id: "riyadh",
    name: {
      ar: "الرياض / مكة المكرمة (توقيت السعودية • UTC+3)",
      nl: "Riyad / Mekka (AST • UTC+3)",
      tr: "Riyad / Mekke (AST • UTC+3)",
      it: "Riad / La Mecca (AST • UTC+3)",
      es: "Riad / La Meca (AST • UTC+3)",
      en: "Riyadh / Mecca (AST • UTC+3)",
    },
    offsetHours: 3,
    cohortWeekday: {
      ar: "الأحد والثلاثاء • 17:00 - 17:45",
      nl: "Zo & Di • 17:00 - 17:45",
      tr: "Paz & Sal • 17:00 - 17:45",
      it: "Dom & Mar • 17:00 - 17:45",
      es: "Dom y Mar • 17:00 - 17:45",
      en: "Sun & Tue • 17:00 - 17:45",
    },
    cohortWeekend: {
      ar: "الجمعة والسبت • 16:00 - 16:45",
      nl: "Vr & Za • 16:00 - 16:45",
      tr: "Cum & Cmt • 16:00 - 16:45",
      it: "Ven & Sab • 16:00 - 16:45",
      es: "Vie y Sáb • 16:00 - 16:45",
      en: "Fri & Sat • 16:00 - 16:45",
    },
  },
  {
    id: "dubai",
    name: {
      ar: "دبي / أبوظبي (توقيت الإمارات • UTC+4)",
      nl: "Dubai / Abu Dhabi (GST • UTC+4)",
      tr: "Dubai / Abu Dabi (GST • UTC+4)",
      it: "Dubai / Abu Dhabi (GST • UTC+4)",
      es: "Dubái / Abu Dabi (GST • UTC+4)",
      en: "Dubai / Abu Dhabi (GST • UTC+4)",
    },
    offsetHours: 4,
    cohortWeekday: {
      ar: "الأحد والثلاثاء • 18:00 - 18:45",
      nl: "Zo & Di • 18:00 - 18:45",
      tr: "Paz & Sal • 18:00 - 18:45",
      it: "Dom & Mar • 18:00 - 18:45",
      es: "Dom y Mar • 18:00 - 18:45",
      en: "Sun & Tue • 18:00 - 18:45",
    },
    cohortWeekend: {
      ar: "الجمعة والسبت • 17:00 - 17:45",
      nl: "Vr & Za • 17:00 - 17:45",
      tr: "Cum & Cmt • 17:00 - 17:45",
      it: "Ven & Sab • 17:00 - 17:45",
      es: "Vie y Sáb • 17:00 - 17:45",
      en: "Fri & Sat • 17:00 - 17:45",
    },
  },
];

const PRICING_UI: Record<string, {
  selectCurrency: string;
  monthlyBilling: string;
  annualBilling: string;
  save20: string;
  tzBadge: string;
  tzTitle: string;
  tzDesc: string;
  selectTz: string;
  weekdayCohort: string;
  weekendCohort: string;
  billedAnnually: string;
  billedMonthly: string;
  perMonth: string;
  whatsIncluded: string;
  startTrial: string;
  subscribeNow: string;
  schoolsBadge: string;
  schoolsTitle: string;
  schoolsDesc: string;
  exploreSchools: string;
  guaranteeTitle: string;
  guaranteeDesc: string;
  paymentTitle: string;
  supportTitle: string;
  supportDesc: string;
}> = {
  ar: {
    selectCurrency: "العملة المحلية:",
    monthlyBilling: "الدفع الشهري",
    annualBilling: "الدفع السنوي",
    save20: "خصم 20%",
    tzBadge: "محوّل مواعيد الحصص المباشرة حسب مدينتك",
    tzTitle: "تعرّف على مواعيد الحصص بتوقيت مدينتك المحلي",
    tzDesc: "نوفر مجموعات صباحية ومسائية تناسب توقيت المدارس في أوروبا، أمريكا الشمالية، ودول الخليج العربي.",
    selectTz: "اختر مدينتك أو منطقتك الزمنية:",
    weekdayCohort: "المجموعة المسائية:",
    weekendCohort: "مجموعة عطلة الأسبوع:",
    billedAnnually: "فاتورة سنوية (خصم 20%)",
    billedMonthly: "فاتورة شهرية",
    perMonth: "/ شهرياً",
    whatsIncluded: "المميزات المتضمنة:",
    startTrial: "ابدأ التجربة المجانية اليوم",
    subscribeNow: "أو اشترك وادفع فوراً (بدون تجربة)",
    schoolsBadge: "المدارس والمراكز الإسلامية",
    schoolsTitle: "هل تمثل مدرسة أو مركزاً تعليمياً؟",
    schoolsDesc: "نوفر تراخيص مجمعة للمدارس والمراكز المجتمعية، تشمل لوحة تحكم مخصصة للمدير المؤسسي، تسجيل جماعي لقوائم الطلاب، ومناهج معتمدة بالكامل.",
    exploreSchools: "استكشف بوابة المدارس",
    guaranteeTitle: "ضمان استرداد 100% لمدة 14 يوماً",
    guaranteeDesc: "إذا لم تكن راضياً تماماً، نسترد اشتراكك فوراً دون شروط.",
    paymentTitle: "طرق دفع عالمية ومحلية آمنة",
    supportTitle: "دعم أولياء الأمور على مدار الساعة",
    supportDesc: "فريق دعم متخصص للإجابة على جميع الاستفسارات الفنية والأكاديمية.",
  },
  nl: {
    selectCurrency: "Valuta:",
    monthlyBilling: "Maandelijkse betaling",
    annualBilling: "Jaarlijkse betaling",
    save20: "Bespaar 20%",
    tzBadge: "Tijdzoneconverter voor live lessen",
    tzTitle: "Bekijk lestijden in uw lokale tijdzone",
    tzDesc: "We organiseren doordeweekse naschoolse en weekendgroepen die aansluiten op schoolkalenders in Europa, het VK, de VS en Canada.",
    selectTz: "Kies uw stad of tijdzone:",
    weekdayCohort: "Doordeweekse groep:",
    weekendCohort: "Weekendgroep:",
    billedAnnually: "Jaarlijks gefactureerd (-20%)",
    billedMonthly: "Maandelijks gefactureerd",
    perMonth: "/ maand",
    whatsIncluded: "Wat is inbegrepen:",
    startTrial: "Start gratis proefperiode van 1 dag",
    subscribeNow: "Of abonneer en betaal direct (sla proefperiode over)",
    schoolsBadge: "Scholen & Islamitische Centra",
    schoolsTitle: "Vertegenwoordigt u een school of instituut?",
    schoolsDesc: "Wij bieden institutionele licenties voor scholen en gemeenschapscentra met een speciaal beheerdersdashboard en bulk-aanmelding van leerlingen.",
    exploreSchools: "Bekijk Scholenportaal",
    guaranteeTitle: "14-dagen 100% geld-terug-garantie",
    guaranteeDesc: "Niet tevreden? Annuleer binnen 14 dagen voor volledige terugbetaling, zonder vragen.",
    paymentTitle: "Veilige wereldwijde en lokale betaalmethoden",
    supportTitle: "24/7 ondersteuning voor ouders",
    supportDesc: "Toegewijd team voor al uw technische en onderwijskundige vragen.",
  },
  tr: {
    selectCurrency: "Para Birimi:",
    monthlyBilling: "Aylık Ödeme",
    annualBilling: "Yıllık Ödeme",
    save20: "%20 Tasarruf",
    tzBadge: "Canlı Ders Saat Dilimi Dönüştürücü",
    tzTitle: "Canlı Ders Saatlerini Yerel Saatinizde Görün",
    tzDesc: "Avrupa, İngiltere, ABD ve Körfez'deki okul takvimlerine uygun hafta içi ve hafta sonu grupları sunuyoruz.",
    selectTz: "Şehrinizi veya saat diliminizi seçin:",
    weekdayCohort: "Hafta İçi Grubu:",
    weekendCohort: "Hafta Sonu Grubu:",
    billedAnnually: "Yıllık Faturalandırılır (%20 indirim)",
    billedMonthly: "Aylık Faturalandırılır",
    perMonth: "/ ay",
    whatsIncluded: "Neler Dahil:",
    startTrial: "1 Günlük Ücretsiz Denemeyi Başlat",
    subscribeNow: "Veya Şimdi Abone Ol ve Öde (Denemeyi Atla)",
    schoolsBadge: "Okullar ve İslami Merkezler",
    schoolsTitle: "Bir Okulu veya Eğitim Merkezini mi Temsil Ediyorsunuz?",
    schoolsDesc: "İslami okullar ve topluluk merkezleri için yönetici paneli ve toplu öğrenci kaydı içeren kurumsal lisanslar sunuyoruz.",
    exploreSchools: "Okul Portalını Keşfet",
    guaranteeTitle: "14 Günlük %100 Para İade Garantisi",
    guaranteeDesc: "Tamamen memnun kalmazsanız, 14 gün içinde koşulsuz tam iade alın.",
    paymentTitle: "Güvenli Küresel ve Yerel Ödeme Yöntemleri",
    supportTitle: "7/24 Özel Veli Desteği",
    supportDesc: "Tüm teknik ve akademik sorularınız için uzman destek ekibi.",
  },
  it: {
    selectCurrency: "Valuta:",
    monthlyBilling: "Fatturazione mensile",
    annualBilling: "Fatturazione annuale",
    save20: "Risparmia il 20%",
    tzBadge: "Convertitore Fusi Orari per Lezioni dal Vivo",
    tzTitle: "Visualizza gli orari delle lezioni nel tuo fuso locale",
    tzDesc: "Organizziamo gruppi pomeridiani e nel weekend sincronizzati con i calendari scolastici in Europa, Regno Unito, Stati Uniti e Golfo.",
    selectTz: "Seleziona la tua città o fuso orario:",
    weekdayCohort: "Gruppo Infrasettimanale:",
    weekendCohort: "Gruppo Weekend:",
    billedAnnually: "Fatturato annualmente (-20%)",
    billedMonthly: "Fatturato mensilmente",
    perMonth: "/ mese",
    whatsIncluded: "Cosa è incluso:",
    startTrial: "Inizia prova gratuita di 1 giorno",
    subscribeNow: "Oppure abbonati e paga subito (salta la prova)",
    schoolsBadge: "Scuole e Centri Islamici",
    schoolsTitle: "Rappresenti una scuola o un centro educativo?",
    schoolsDesc: "Offriamo licenze istituzionali per scuole e centri con dashboard amministrativa e registrazione massiva di studenti.",
    exploreSchools: "Esplora Portale Scuole",
    guaranteeTitle: "Garanzia di rimborso al 100% per 14 giorni",
    guaranteeDesc: "Se non sei completamente soddisfatto, rimborso totale entro 14 giorni senza domande.",
    paymentTitle: "Metodi di pagamento globali e locali sicuri",
    supportTitle: "Supporto genitori dedicato 24/7",
    supportDesc: "Team dedicato per rispondere a tutte le domande tecniche e accademiche.",
  },
  es: {
    selectCurrency: "Moneda:",
    monthlyBilling: "Facturación mensual",
    annualBilling: "Facturación anual",
    save20: "Ahorra 20%",
    tzBadge: "Conversor de Horarios para Clases en Vivo",
    tzTitle: "Consulta los horarios en tu zona horaria local",
    tzDesc: "Organizamos grupos en días hábiles y fines de semana sincronizados con los calendarios escolares en Europa, EE.UU., Canadá y el Golfo.",
    selectTz: "Selecciona tu ciudad o zona horaria:",
    weekdayCohort: "Cohorte Semanal:",
    weekendCohort: "Cohorte de Fin de Semana:",
    billedAnnually: "Facturado anualmente (-20%)",
    billedMonthly: "Facturado mensualmente",
    perMonth: "/ mes",
    whatsIncluded: "Qué incluye:",
    startTrial: "Comenzar prueba gratuita de 1 día",
    subscribeNow: "O suscríbete y paga ahora (saltar prueba)",
    schoolsBadge: "Escuelas y Centros Islámicos",
    schoolsTitle: "¿Representas a una escuela o centro educativo?",
    schoolsDesc: "Ofrecemos licencias institucionales para escuelas y centros con panel de administración y registro masivo de alumnos.",
    exploreSchools: "Explorar Portal de Escuelas",
    guaranteeTitle: "Garantía de devolución del 100% por 14 días",
    guaranteeDesc: "Si no estás satisfecho, reembolso completo en 14 días sin preguntas.",
    paymentTitle: "Métodos de pago seguros globales y locales",
    supportTitle: "Soporte dedicado para padres 24/7",
    supportDesc: "Equipo dedicado para responder a todas tus consultas técnicas y académicas.",
  },
  en: {
    selectCurrency: "Select Currency:",
    monthlyBilling: "Monthly Billing",
    annualBilling: "Annual Billing",
    save20: "Save 20%",
    tzBadge: "Global Timezone Live Class Converter",
    tzTitle: "See Live Cohort Times in Your Local Time",
    tzDesc: "Live small cohorts (max 6 students) run at optimal times across European, American, and Gulf timezones.",
    selectTz: "Select your city / timezone:",
    weekdayCohort: "Weekday Cohort:",
    weekendCohort: "Weekend Cohort:",
    billedAnnually: "Billed Annually (-20%)",
    billedMonthly: "Billed Monthly",
    perMonth: "/ month",
    whatsIncluded: "What's Included:",
    startTrial: "Start 1-Day Free Trial",
    subscribeNow: "Or Subscribe & Pay Now (Skip Trial)",
    schoolsBadge: "Schools & Islamic Centers",
    schoolsTitle: "Looking for Institutional Licensing?",
    schoolsDesc: "We offer discounted institutional seat tiers for Islamic schools, weekend academies, and community centers with custom admin dashboards and bulk roster onboarding.",
    exploreSchools: "Explore School Hub",
    guaranteeTitle: "14-Day Money-Back Guarantee",
    guaranteeDesc: "Cancel within 14 days for a full refund, no questions asked.",
    paymentTitle: "Global & Local Payment Gateways",
    supportTitle: "24/7 Dedicated Parent Support",
    supportDesc: "Direct concierge support via WhatsApp, email, and live messaging.",
  },
};

interface LocalizedPlan {
  id: string;
  name: Record<string, string>;
  subtitle: Record<string, string>;
  baseUsdMonthly: number;
  originalUsdMonthly: number;
  badge: Record<string, string>;
  popular: boolean;
  features: Record<string, string[]>;
}

const LOCALIZED_PLANS: LocalizedPlan[] = [
  {
    id: "plan-individual",
    name: {
      ar: "الخطة الفردية",
      nl: "Individuele Leerling",
      tr: "Bireysel Öğrenci",
      it: "Studente Individuale",
      es: "Estudiante Individual",
      en: "Individual Student",
    },
    subtitle: {
      ar: "مثالية لطفل واحد يسعى لإتقان العربية والتجويد بخطى واثقة.",
      nl: "Ideaal voor één kind dat met vertrouwen Arabisch en tajweed wil beheersen.",
      tr: "Arapça ve tecvidi güvenle öğrenmek isteyen bir çocuk için ideal.",
      it: "Ideale per un bambino dedicato a padroneggiare arabo e tajweed con sicurezza.",
      es: "Ideal para un niño dedicado a dominar el árabe y el taywid con confianza.",
      en: "Ideal for one child dedicated to mastering Arabic and Tajweed.",
    },
    baseUsdMonthly: 51.35,
    originalUsdMonthly: 79,
    badge: {
      ar: "الأكثر طلباً • خصم 35%",
      nl: "Meest Populair • 35% Korting",
      tr: "En Çok Tercih Edilen • %35 İndirim",
      it: "Più Popolare • Sconto 35%",
      es: "Más Popular • 35% Descuento",
      en: "Most Popular • 35% OFF",
    },
    popular: true,
    features: {
      ar: [
        "حصتان تفاعليتان أسبوعياً في مجموعة مصغرة (بحد أقصى 6 طلاب)",
        "معلم معتمد متخصص في تعليم الأطفال والتجويد",
        "وصول غير محدود لجميع الاستوديوهات التعليمية التفاعلية",
        "ألعاب قطار الحروف ونظام التكرار المتباعد للمفردات",
        "تقارير أسبوعية تفصيلية وتسجيلات الدروس لولي الأمر",
        "بيئة تعليمية آمنة ومتوافقة مع معايير COPPA وGDPR",
      ],
      nl: [
        "2 live interactieve lessen per week (max 6 leerlingen)",
        "Gecertificeerde docent gespecialiseerd in kinderen en tajweed",
        "Volledige toegang tot alle 6 interactieve studio's",
        "Klankenspelletjes en Leitner SRS-flitskaarten voor woordenschat",
        "Wekelijkse voortgangsrapportages en lesopnames voor ouders",
        "Veilige leeromgeving conform COPPA en AVG (GDPR)",
      ],
      tr: [
        "Haftada 2 canlı interaktif küçük grup dersi (Maks 6 öğrenci)",
        "Çocuklar ve tecvid konusunda uzman sertifikalı ana dili Arapça eğitmen",
        "Tüm 6 interaktif stüdyoya sınırsız erişim",
        "Harf oyunları ve Leitner SRS kelime kartları",
        "Haftalık detaylı veli raporları ve ders kayıtları",
        "COPPA ve GDPR standartlarına uygun güvenli ortam",
      ],
      it: [
        "2 lezioni interattive a settimana in piccoli gruppi (max 6 studenti)",
        "Insegnante madrelingua certificato specializzato per bambini e tajweed",
        "Accesso completo a tutti i 6 studi interattivi",
        "Giochi fonetici e flashcard con ripetizione spaziata (SRS)",
        "Report settimanali dettagliati per i genitori e registrazioni",
        "Ambiente privato e sicuro conforme a COPPA e GDPR",
      ],
      es: [
        "2 clases interactivas por semana en grupos reducidos (máx 6 alumnos)",
        "Profesor nativo certificado especialista en niños y taywid",
        "Acceso completo a los 6 estudios interactivos",
        "Juegos de fonética y tarjetas de vocabulario con repetición espaciada",
        "Informes semanales detallados para los padres y grabaciones de clase",
        "Entorno privado y seguro que cumple con COPPA y RGPD",
      ],
      en: [
        "2 Live Small-Group Classes per week (Max 6 students)",
        "Certified Native Arabic & Tajweed Specialist",
        "Full access to all 6 Interactive Studios",
        "Phonics Arcade & Leitner SRS Flashcards",
        "Weekly Parent Milestone Reports & Recordings",
        "COPPA/GDPR Compliant Private Dashboard",
      ],
    },
  },
  {
    id: "plan-family",
    name: {
      ar: "باقة العائلة",
      nl: "Gezinspakket",
      tr: "Aile Paketi",
      it: "Pacchetto Famiglia",
      es: "Paquete Familiar",
      en: "Family Bundle",
    },
    subtitle: {
      ar: "مصممة للعائلات التي لديها طفلان إلى 3 أطفال يتعلمون معاً.",
      nl: "Ontworpen voor gezinnen met 2 tot 3 kinderen die samen leren.",
      tr: "Birlikte öğrenen 2 ila 3 çocuğu olan aileler için tasarlandı.",
      it: "Progettato per famiglie con 2-3 bambini che imparano insieme.",
      es: "Diseñado para familias con 2 a 3 niños aprendiendo juntos.",
      en: "Designed for families with 2 to 3 children learning together.",
    },
    baseUsdMonthly: 74.50,
    originalUsdMonthly: 149,
    badge: {
      ar: "أفضل قيمة • خصم 50%",
      nl: "Beste Waarde • 50% Korting",
      tr: "En İyi Değer • %50 İndirim",
      it: "Miglior Valore • Sconto 50%",
      es: "Mejor Valor • 50% Descuento",
      en: "Best Value • 50% OFF",
    },
    popular: false,
    features: {
      ar: [
        "يشمل حتى 3 ملفات تعريف مستقلة للأطفال",
        "من 4 إلى 6 حصص مباشرة أسبوعياً مقسمة بين الأبناء",
        "خريطة تعلم ومسار تقدم مستقل لكل طفل",
        "تقييمات واجبات وفحوصات صوتية مخصصة لكل طالب",
        "مفتاح تبديل فوري بين الأبناء في لوحة تحكم الوالدين",
        "أولوية في الدعم الفني واختيار المواعيد",
      ],
      nl: [
        "Inclusief maximaal 3 onafhankelijke leerlingprofielen",
        "4 tot 6 live lessen per week verdeeld over de kinderen",
        "Onafhankelijke leertrajecten en voortgang per kind",
        "Afzonderlijke huiswerkbeoordelingen en audio-evaluaties",
        "Direct schakelen tussen kinderen in het ouderpaneel",
        "Prioritaire docent- en klantenservice",
      ],
      tr: [
        "3 çocuğa kadar bağımsız öğrenci profili dahil",
        "Çocuklar arasında paylaşılan haftada 4 ila 6 canlı ders",
        "Her çocuk için bağımsız öğrenme haritası ve ilerleme",
        "Ayrı ödev ve sesli telaffuz değerlendirmeleri",
        "Veli panelinde çocuklar arasında anında geçiş",
        "Öncelikli eğitmen ve veli destek hizmeti",
      ],
      it: [
        "Fino a 3 profili studente indipendenti inclusi",
        "Da 4 a 6 lezioni dal vivo a settimana condivise tra i figli",
        "Mappa di apprendimento e progressi indipendenti per ciascun figlio",
        "Valutazioni dei compiti e controlli vocali separati per studente",
        "Passaggio immediato tra i profili dei figli nella dashboard genitori",
        "Supporto concierge e orari prioritari",
      ],
      es: [
        "Hasta 3 perfiles de alumnos independientes incluidos",
        "De 4 a 6 clases en vivo por semana repartidas entre los hijos",
        "Mapa de aprendizaje y progreso independiente para cada hijo",
        "Evaluaciones de tareas y revisiones de voz personalizadas",
        "Cambio instantáneo entre hijos en el panel de padres",
        "Atención prioritaria y elección de horarios",
      ],
      en: [
        "Up to 3 Children Student Profiles included",
        "4 to 6 Live Classes per week shared across children",
        "Independent Quest Maps & Biome progression",
        "Separate Homework & Live Session Evaluations",
        "Multi-child switcher on Parent Dashboard",
        "Priority Educator & Support Concierge",
      ],
    },
  },
  {
    id: "plan-private",
    name: {
      ar: "التعليم الفردي الخاص (1 على 1)",
      nl: "Privé 1-op-1 VIP",
      tr: "Bire Bir Özel VIP",
      it: "VIP Privato 1 a 1",
      es: "Privado VIP 1 a 1",
      en: "Private 1-on-1 VIP",
    },
    subtitle: {
      ar: "أقصى درجات التركيز والتطور عبر حصص فردية خاصة تماماً.",
      nl: "Maximale vooruitgang met toegewijde 1-op-1 privébegeleiding.",
      tr: "Özel bire bir eğitmen rehberliği ile maksimum gelişim.",
      it: "Massima accelerazione con tutoraggio privato 1 a 1 dedicato.",
      es: "Máxima aceleración con tutoría privada personalizada 1 a 1.",
      en: "Maximum acceleration with dedicated 1-on-1 private mentorship.",
    },
    baseUsdMonthly: 89.55,
    originalUsdMonthly: 199,
    badge: {
      ar: "تعليم خاص مكثف • خصم 55%",
      nl: "VIP-Versnelling • 55% Korting",
      tr: "VIP Hızlandırma • %55 İndirim",
      it: "Accelerazione VIP • Sconto 55%",
      es: "Aceleración VIP • 55% Descuento",
      en: "VIP Acceleration • 55% OFF",
    },
    popular: false,
    features: {
      ar: [
        "حصص خاصة ومباشرة بالكامل (معلم لطفل واحد)",
        "مرونة كاملة في تحديد المواعيد وإعادة الجدولة",
        "تحليل صوتي دقيق لمخارج الحروف ونبرات الصوت",
        "مسار مكثف لحفظ القرآن الكريم وتأهيل الإجازة",
        "خط استشاري مباشر بين المعلم وولي الأمر",
        "أوراق عمل مخصصة لاحتياجات الطفل الفردية",
      ],
      nl: [
        "100% individuele live privélessen (één-op-één)",
        "Volledige flexibiliteit in planning en verzetten van lessen",
        "Geavanceerde klank- en uitspraakanalyse",
        "Versneld traject voor koranmemorisatie en idjaza-voorbereiding",
        "Direct advieskanaal tussen docent en ouder via WhatsApp",
        "Gepersonaliseerde werkbladen afgestemd op het kind",
      ],
      tr: [
        "%100 bire bir özel canlı dersler",
        "Ders saatlerinde tam esneklik ve kolay yeniden planlama",
        "Gelişmiş fonem ve mahreç ses analizi",
        "Hızlandırılmış Kuran hıfzı ve icazet hazırlığı",
        "Öğretmen ve veli arasında doğrudan WhatsApp danışma hattı",
        "Çocuğun ihtiyaçlarına özel hazırlanmış çalışma yaprakları",
      ],
      it: [
        "Lezioni dal vivo 100% individuali one-to-one",
        "Flessibilità completa negli orari e nella riprogrammazione",
        "Analisi fonetica e dei punti di articolazione (Makharij) avanzata",
        "Percorso intensivo di memorizzazione del Corano e preparazione Ijazah",
        "Linea di consulenza diretta WhatsApp tra docente e genitore",
        "Schede di lavoro stampabili personalizzate per il bambino",
      ],
      es: [
        "Clases 100% individuales en vivo profesor-alumno",
        "Flexibilidad total para elegir horarios y reprogramar",
        "Análisis fonético avanzado de pronunciación y articulación",
        "Ruta intensiva de memorización del Corán y preparación de Iyazah",
        "Línea de asesoría directa entre profesor y padres vía WhatsApp",
        "Hojas de actividades personalizadas para el nivel del niño",
      ],
      en: [
        "100% Dedicated One-on-One Live Lessons",
        "Customized lesson pacing and flexible rescheduling",
        "Advanced Phoneme & Makharij Speech Analysis",
        "Accelerated Quran Hifz & Ijazah Preparation",
        "Direct Teacher-Parent WhatsApp advisory line",
        "Custom Printable Worksheets tailored to child",
      ],
    },
  },
];

export function PricingCalculator({ locale, isRtl = false }: PricingCalculatorProps) {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedTz, setSelectedTz] = useState<string>("amsterdam");

  const ui = PRICING_UI[locale] || PRICING_UI.en;
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const currentCurr = CURRENCIES[currency];
  const activeTz = TIMEZONE_OPTIONS.find((t) => t.id === selectedTz) || TIMEZONE_OPTIONS[0];

  const formatPrice = (usdBase: number) => {
    let converted = usdBase * currentCurr.rateFromUsd;
    if (billingCycle === "annual") {
      converted = converted * 0.8;
    }
    const rounded = Math.round(converted);
    if (isRtl && (currency === "SAR" || currency === "AED")) {
      return `${rounded}${currentCurr.symbolAr}`;
    }
    return `${currentCurr.symbol}${rounded}`;
  };

  const tzWeekday = activeTz.cohortWeekday[locale] || activeTz.cohortWeekday.en;
  const tzWeekend = activeTz.cohortWeekend[locale] || activeTz.cohortWeekend.en;

  return (
    <div className="space-y-12">
      {/* Interactive Controls Bar: Currency + Billing Cycle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Currency Switcher */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Globe className="w-4 h-4 text-brand-600" />
            <span>{ui.selectCurrency}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((cCode) => (
              <button
                key={cCode}
                onClick={() => setCurrency(cCode)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currency === cCode
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cCode}
              </button>
            ))}
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="w-full md:w-auto flex items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setBillingCycle("monthly")}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === "monthly"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {ui.monthlyBilling}
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>{ui.annualBilling}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold">
              {ui.save20}
            </span>
          </button>
        </div>
      </div>

      {/* Global Timezone Schedule Converter */}
      <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{ui.tzBadge}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              {ui.tzTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {ui.tzDesc}
            </p>
          </div>

          <div className="space-y-3 shrink-0 lg:w-80">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {ui.selectTz}
            </label>
            <select
              value={selectedTz}
              onChange={(e) => setSelectedTz(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {tz.name[locale] || tz.name.en}
                </option>
              ))}
            </select>

            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{ui.weekdayCohort}</span>
                <span className="font-bold text-emerald-400">
                  {tzWeekday}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{ui.weekendCohort}</span>
                <span className="font-bold text-amber-300">
                  {tzWeekend}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {LOCALIZED_PLANS.map((plan) => {
          const planName = plan.name[locale] || plan.name.en;
          const planSubtitle = plan.subtitle[locale] || plan.subtitle.en;
          const planBadge = plan.badge[locale] || plan.badge.en;
          const planFeatures = plan.features[locale] || plan.features.en;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? "bg-white border-2 border-brand-500 shadow-xl shadow-brand-500/10 scale-[1.02] z-10"
                  : "bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 bg-brand-600 text-white text-[11px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {planBadge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1">
                    {billingCycle === "annual" ? ui.billedAnnually : ui.billedMonthly}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {planName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {planSubtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {formatPrice(plan.baseUsdMonthly)}
                    </span>
                    <span className="text-sm font-bold text-slate-400 line-through">
                      {formatPrice(plan.originalUsdMonthly)}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {ui.perMonth}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-900 block">
                    {ui.whatsIncluded}
                  </span>
                  {planFeatures.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-2 mt-6">
                <Link
                  href={`/${locale}/register?plan=${plan.id}&cycle=${billingCycle}&currency=${currency}&tz=${selectedTz}&trial=1`}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md ${
                    plan.popular
                      ? "gradient-brand text-white shadow-brand-500/25 hover:opacity-95"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <span>{ui.startTrial}</span>
                  <ArrowIcon className="w-4 h-4" />
                </Link>
                <Link
                  href={`/${locale}/register?plan=${plan.id}&cycle=${billingCycle}&currency=${currency}&tz=${selectedTz}`}
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 text-slate-500 hover:text-brand-600 transition-colors"
                >
                  <span>{ui.subscribeNow}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Institutional / School Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>{ui.schoolsBadge}</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {ui.schoolsTitle}
          </h3>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            {ui.schoolsDesc}
          </p>
        </div>
        <Link
          href={`/${locale}/schools`}
          className="shrink-0 px-6 py-3.5 rounded-2xl bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold text-sm transition-colors flex items-center gap-2"
        >
          <span>{ui.exploreSchools}</span>
          <ArrowIcon className="w-4 h-4" />
        </Link>
      </div>

      {/* Guarantees & Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-white rounded-2xl border border-slate-200/70">
          <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <h4 className="font-bold text-slate-900 text-sm mb-1">
            {ui.guaranteeTitle}
          </h4>
          <p className="text-xs text-slate-500">
            {ui.guaranteeDesc}
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-200/70">
          <CreditCard className="w-8 h-8 text-brand-600 mx-auto mb-3" />
          <h4 className="font-bold text-slate-900 text-sm mb-1">
            {ui.paymentTitle}
          </h4>
          <p className="text-xs text-slate-500">
            Stripe, PayPal, Mollie (iDEAL/Bancontact), Apple Pay, Google Pay.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-200/70">
          <HelpCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h4 className="font-bold text-slate-900 text-sm mb-1">
            {ui.supportTitle}
          </h4>
          <p className="text-xs text-slate-500">
            {ui.supportDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
