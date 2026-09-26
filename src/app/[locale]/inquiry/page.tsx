import React from "react";
import { type Locale } from "@/lib/localization";
import {
  Compass,
  CheckCircle2,
  Send,
} from "lucide-react";

import { CountryCitySelector } from "@/components/shared/CountryCitySelector";

interface InquiryText {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  sectionTitle: string;
  sectionSubtitle: string;
  parentNameLabel: string;
  parentNamePlaceholder: string;
  emailLabel: string;
  phoneLabel: string;
  countryLabel: string;
  cityLabel: string;
  childNameLabel: string;
  childNamePlaceholder: string;
  childAgeLabel: string;
  ageOptions: Array<{ value: string; label: string }>;
  currentLevelLabel: string;
  levelOptions: Array<{ value: string; label: string }>;
  goalsLabel: string;
  goalsPlaceholder: string;
  scheduleLabel: string;
  schedulePlaceholder: string;
  trialGuarantee: string;
  submitButton: string;
}

const INQUIRY_I18N: Record<Locale, InquiryText> = {
  ar: {
    heroBadge: "استشارة أكاديمية وتحديد مستوى مجاني",
    heroTitle: "طلب استشارة تسجيل وتسكين أكاديمي",
    heroSubtitle:
      "أخبرنا عن طفلك وخلفيته في اللغة العربية، وسيقوم مستشارنا الأكاديمي في Arabic Kids Academy بإعداد خطة تعلم مقترحة والمجموعة الأنسب له.",
    sectionTitle: "بيانات ولي الأمر والطفل",
    sectionSubtitle:
      "جميع البيانات مشفرة وآمنة وفق معايير COPPA وGDPR لحماية خصوصية الأطفال.",
    parentNameLabel: "اسم ولي الأمر *",
    parentNamePlaceholder: "طارق عبد الرحمن",
    emailLabel: "البريد الإلكتروني *",
    phoneLabel: "رقم الهاتف / واتساب *",
    countryLabel: "دولة إقامة العائلة *",
    cityLabel: "المدينة *",
    childNameLabel: "اسم الطفل *",
    childNamePlaceholder: "زيد",
    childAgeLabel: "عمر الطفل *",
    ageOptions: [
      { value: "4-6", label: "4 - 6 سنوات (براعم)" },
      { value: "7-10", label: "7 - 10 سنوات (مستكشف)" },
      { value: "11-13", label: "11 - 13 سنة (رواد)" },
      { value: "14-16", label: "14 - 16 سنة (متقدم)" },
    ],
    currentLevelLabel: "المستوى الحالي في العربية",
    levelOptions: [
      { value: "BEGINNER", label: "مبتدئ تماماً (لا يعرف الحروف)" },
      { value: "LETTERS", label: "يعرف بعض الحروف والأصوات" },
      { value: "READING", label: "يقرأ كلمات بسيطة ببطء" },
      { value: "FLUENT", label: "يتحدث أو يفهم بشكل جيد" },
    ],
    goalsLabel: "الأهداف التعليمية الأساسية",
    goalsPlaceholder:
      "مثال: طلاقة القراءة، حفظ جزء عم، محادثة يومية...",
    scheduleLabel: "المواعيد المفضلة للأسبوع",
    schedulePlaceholder:
      "مثال: عطلة نهاية الأسبوع صباحاً، أو بعد المدرسة...",
    trialGuarantee: "يشمل حصة تجريبية وتقييماً صوتياً مجانياً",
    submitButton: "إرسال طلب الاستشارة",
  },
  en: {
    heroBadge: "Free Academic Consultation & Placement",
    heroTitle: "Personalized Enrollment & Placement Inquiry",
    heroSubtitle:
      "Share your child's background and learning goals. Our academic advisor at Arabic Kids Academy will recommend the perfect micro-cohort and curriculum path.",
    sectionTitle: "Parent & Child Information",
    sectionSubtitle:
      "All data is securely handled under COPPA and GDPR-K child data protection standards.",
    parentNameLabel: "Parent Full Name *",
    parentNamePlaceholder: "Sarah Jenkins",
    emailLabel: "Email Address *",
    phoneLabel: "Phone / WhatsApp *",
    countryLabel: "Country of Residence *",
    cityLabel: "City *",
    childNameLabel: "Child's First Name *",
    childNamePlaceholder: "Zayd",
    childAgeLabel: "Child's Age *",
    ageOptions: [
      { value: "4-6", label: "4 - 6 Years (Early Sprouts)" },
      { value: "7-10", label: "7 - 10 Years (Junior Explorers)" },
      { value: "11-13", label: "11 - 13 Years (Fluent Pioneers)" },
      { value: "14-16", label: "14 - 16 Years (Young Scholars)" },
    ],
    currentLevelLabel: "Current Arabic Level",
    levelOptions: [
      { value: "BEGINNER", label: "Absolute Beginner (No Letters)" },
      { value: "LETTERS", label: "Recognizes Some Letters" },
      { value: "READING", label: "Reads Simple Words Slowly" },
      { value: "FLUENT", label: "Conversational / Native" },
    ],
    goalsLabel: "Primary Learning Goals",
    goalsPlaceholder:
      "e.g. Reading fluency, Quran memorization, conversational speaking...",
    scheduleLabel: "Preferred Class Days / Times",
    schedulePlaceholder:
      "e.g. Weekends morning, or weekdays after 4:00 PM...",
    trialGuarantee: "Includes 1-day free trial & placement session",
    submitButton: "Submit Consultation Request",
  },
  nl: {
    heroBadge: "Gratis Studieadvies & Plaatsing",
    heroTitle: "Aanvraag Studieadvies & Niveaubepaling",
    heroSubtitle:
      "Deel de ervaring en leerdoelen van jouw kind. Onze studieadviseur bij Arabic Kids Academy adviseert de ideale microgroep en leerroute.",
    sectionTitle: "Gegevens van Ouder & Kind",
    sectionSubtitle:
      "Alle gegevens worden veilig verwerkt conform strikte COPPA en Europese AVG/GDPR-K privacyrichtlijnen.",
    parentNameLabel: "Volledige naam ouder *",
    parentNamePlaceholder: "Fatima El Amrani",
    emailLabel: "E-mailadres *",
    phoneLabel: "Telefoon / WhatsApp *",
    countryLabel: "Woonland *",
    cityLabel: "Woonplaats *",
    childNameLabel: "Voornaam kind *",
    childNamePlaceholder: "Zayd",
    childAgeLabel: "Leeftijd van het kind *",
    ageOptions: [
      { value: "4-6", label: "4 - 6 jaar (Kleine Spruiten)" },
      { value: "7-10", label: "7 - 10 jaar (Jonge Verkenners)" },
      { value: "11-13", label: "11 - 13 jaar (Vloeiende Pioniers)" },
      { value: "14-16", label: "14 - 16 jaar (Gevorderde Geleerden)" },
    ],
    currentLevelLabel: "Huidig niveau Arabisch",
    levelOptions: [
      { value: "BEGINNER", label: "Volledige beginner (kent nog geen letters)" },
      { value: "LETTERS", label: "Kent enkele letters en klanken" },
      { value: "READING", label: "Leest langzaam eenvoudige woorden" },
      { value: "FLUENT", label: "Spreekt of begrijpt al vloeiend" },
    ],
    goalsLabel: "Belangrijkste leerdoelen",
    goalsPlaceholder:
      "bijv. Vloeiend leren lezen, Juz Amma memoriseren, dagelijkse gesprekken voeren...",
    scheduleLabel: "Voorkeur lesdagen & tijden",
    schedulePlaceholder:
      "bijv. Ochtend in het weekend, of doordeweeks na 16:00 uur...",
    trialGuarantee: "Inclusief 1 dag gratis proefles & niveautest",
    submitButton: "Aanvraag versturen",
  },
  tr: {
    heroBadge: "Ücretsiz Akademik Danışmanlık ve Seviye Tespiti",
    heroTitle: "Kişiselleştirilmiş Kayıt ve Seviye Danışmanlığı",
    heroSubtitle:
      "Çocuğunuzun mevcut durumunu ve hedeflerinizi paylaşın; Arabic Kids Academy eğitim danışmanımız en uygun mikro grubu ve müfredat rotasını belirlesin.",
    sectionTitle: "Veli ve Öğrenci Bilgileri",
    sectionSubtitle:
      "Tüm veriler COPPA ve GDPR-K çocuk koruma ve gizlilik standartlarına uygun olarak şifrelenir.",
    parentNameLabel: "Velinin Adı ve Soyadı *",
    parentNamePlaceholder: "Zeynep Yılmaz",
    emailLabel: "E-posta Adresi *",
    phoneLabel: "Telefon / WhatsApp *",
    countryLabel: "İkamet Edilen Ülke *",
    cityLabel: "Şehir *",
    childNameLabel: "Çocuğun Adı *",
    childNamePlaceholder: "Zeyd",
    childAgeLabel: "Çocuğun Yaşı *",
    ageOptions: [
      { value: "4-6", label: "4 - 6 Yaş (Filizler)" },
      { value: "7-10", label: "7 - 10 Yaş (Küçük Kâşifler)" },
      { value: "11-13", label: "11 - 13 Yaş (Öncüler)" },
      { value: "14-16", label: "14 - 16 Yaş (Geleceğin Bilginleri)" },
    ],
    currentLevelLabel: "Mevcut Arapça Seviyesi",
    levelOptions: [
      { value: "BEGINNER", label: "Tamamen Başlangıç (Harfleri Bilmiyor)" },
      { value: "LETTERS", label: "Bazı Harfleri ve Sesleri Tanıyor" },
      { value: "READING", label: "Basit Kelimeleri Yavaşça Okuyor" },
      { value: "FLUENT", label: "Konuşabiliyor / Anadili Düzeyinde" },
    ],
    goalsLabel: "Temel Öğrenme Hedefleri",
    goalsPlaceholder:
      "ör. Akıcı Kuran okuma, Amme cüzü ezberi, günlük konuşma akıcılığı...",
    scheduleLabel: "Tercih Edilen Gün ve Saatler",
    schedulePlaceholder:
      "ör. Hafta sonu sabahları veya hafta içi saat 16:00'dan sonra...",
    trialGuarantee: "1 günlük ücretsiz deneme ve sesli seviye tespiti dahildir",
    submitButton: "Danışmanlık Talebini Gönder",
  },
  it: {
    heroBadge: "Consulenza Accademica e Orientamento Gratuito",
    heroTitle: "Richiesta di Consulenza per l'Iscrizione",
    heroSubtitle:
      "Raccontaci il percorso di tuo figlio: i consulenti di Arabic Kids Academy definiranno il micro-gruppo più adatto e il piano di studi ideale.",
    sectionTitle: "Dati del Genitore e del Bambino",
    sectionSubtitle:
      "Tutti i dati sono protetti e gestiti in conformità con i protocolli internazionali COPPA e GDPR-K.",
    parentNameLabel: "Nome e Cognome del Genitore *",
    parentNamePlaceholder: "Marco Rossi",
    emailLabel: "Indirizzo E-mail *",
    phoneLabel: "Telefono / WhatsApp *",
    countryLabel: "Paese di Residenza *",
    cityLabel: "Città *",
    childNameLabel: "Nome del Bambino *",
    childNamePlaceholder: "Zayd",
    childAgeLabel: "Età del Bambino *",
    ageOptions: [
      { value: "4-6", label: "4 - 6 Anni (Primi Germogli)" },
      { value: "7-10", label: "7 - 10 Anni (Giovani Esploratori)" },
      { value: "11-13", label: "11 - 13 Anni (Pionieri)" },
      { value: "14-16", label: "14 - 16 Anni (Studiosi)" },
    ],
    currentLevelLabel: "Livello di Arabo Attuale",
    levelOptions: [
      { value: "BEGINNER", label: "Principiante Assoluto (Non Conosce le Lettere)" },
      { value: "LETTERS", label: "Riconosce Alcune Lettere e Suoni" },
      { value: "READING", label: "Legge Semplici Parole Lentamente" },
      { value: "FLUENT", label: "Fluente / Madrelingua" },
    ],
    goalsLabel: "Obiettivi Principali di Apprendimento",
    goalsPlaceholder:
      "es. Lettura fluida, memorizzazione del Corano, conversazione quotidiana...",
    scheduleLabel: "Orari e Giorni Preferiti",
    schedulePlaceholder:
      "es. Weekend al mattino, o giorni feriali dopo le 16:30...",
    trialGuarantee: "Include 1 giorno di prova gratuita e sessione di livello",
    submitButton: "Invia Richiesta di Consulenza",
  },
  es: {
    heroBadge: "Consulta Académica y Diagnóstico de Nivel Gratis",
    heroTitle: "Solicitud de Orientación y Matrícula",
    heroSubtitle:
      "Cuéntanos sobre tu hijo y sus objetivos. El equipo pedagógico de Arabic Kids Academy te orientará hacia el microgrupo y currículo ideales.",
    sectionTitle: "Información Familiar y del Alumno",
    sectionSubtitle:
      "Todos los datos se procesan de forma cifrada bajo los estándares de protección de menores COPPA y RGPD/GDPR-K.",
    parentNameLabel: "Nombre Completo del Padre/Madre *",
    parentNamePlaceholder: "Carlos Morales",
    emailLabel: "Correo Electrónico *",
    phoneLabel: "Teléfono / WhatsApp *",
    countryLabel: "País de Residencia *",
    cityLabel: "Ciudad *",
    childNameLabel: "Nombre del Niño/Niña *",
    childNamePlaceholder: "Zayd",
    childAgeLabel: "Edad del Niño/Niña *",
    ageOptions: [
      { value: "4-6", label: "4 - 6 Años (Primeros Brotes)" },
      { value: "7-10", label: "7 - 10 Años (Jóvenes Exploradores)" },
      { value: "11-13", label: "11 - 13 Años (Pioneros Fluidos)" },
      { value: "14-16", label: "14 - 16 Años (Jóvenes Eruditos)" },
    ],
    currentLevelLabel: "Nivel Actual de Árabe",
    levelOptions: [
      { value: "BEGINNER", label: "Principiante Total (No Conoce las Letras)" },
      { value: "LETTERS", label: "Reconoce Algunas Letras y Sonidos" },
      { value: "READING", label: "Lee Palabras Simples Lentamente" },
      { value: "FLUENT", label: "Habla o Comprende con Fluidez" },
    ],
    goalsLabel: "Objetivos de Aprendizaje Principales",
    goalsPlaceholder:
      "ej. Fluidez lectora, memorización del Corán, conversación cotidiana...",
    scheduleLabel: "Días y Horarios Preferidos",
    schedulePlaceholder:
      "ej. Fines de semana por la mañana, o entre semana después de las 16:30...",
    trialGuarantee: "Incluye 1 día de prueba gratis y sesión diagnóstica",
    submitButton: "Enviar Solicitud de Orientación",
  },
};

export default async function EnrollmentInquiryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale: Locale = (["ar", "en", "nl", "tr", "it", "es"].includes(locale)
    ? locale
    : "en") as Locale;

  const t = INQUIRY_I18N[validLocale];

  async function handleInquirySubmit(formData: FormData) {
    "use server";
    const parentName = formData.get("parentName")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const country = formData.get("country")?.toString() || "";
    const city = formData.get("city")?.toString() || "";
    const childName = formData.get("childName")?.toString() || "";
    const childAge = formData.get("childAge")?.toString() || "";
    const currentLevel = formData.get("currentLevel")?.toString() || "BEGINNER";
    const goals = formData.get("goals")?.toString() || "";
    const preferredSchedule = formData.get("preferredSchedule")?.toString() || "";

    const { crmService } = await import("@/server/services/CrmService");
    await crmService.captureEnrollmentInquiry({
      parentName,
      email,
      phone,
      country,
      city,
      childName,
      childAge,
      currentLevel,
      goals,
      preferredSchedule,
      locale,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <Compass className="w-4 h-4 text-brand-400" />
            <span>{t.heroBadge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            {t.heroTitle}
          </h1>
          <p className="mt-4 text-base text-slate-300 max-w-xl mx-auto">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        <div className="p-8 sm:p-12 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {t.sectionTitle}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t.sectionSubtitle}
            </p>
          </div>

          <form action={handleInquirySubmit} className="space-y-6">
            {/* Parent Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.parentNameLabel}
                </label>
                <input
                  type="text"
                  name="parentName"
                  required
                  placeholder={t.parentNamePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="parent@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+31 6 12345678"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Country & City Selection */}
            <CountryCitySelector
              nameCountry="country"
              nameCity="city"
              required
              locale={locale}
              countryLabel={t.countryLabel}
              cityLabel={t.cityLabel}
            />

            {/* Child Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.childNameLabel}
                </label>
                <input
                  type="text"
                  name="childName"
                  required
                  placeholder={t.childNamePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.childAgeLabel}
                </label>
                <select
                  name="childAge"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                >
                  {t.ageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.currentLevelLabel}
                </label>
                <select
                  name="currentLevel"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                >
                  {t.levelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Goals & Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.goalsLabel}
                </label>
                <input
                  type="text"
                  name="goals"
                  placeholder={t.goalsPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.scheduleLabel}
                </label>
                <input
                  type="text"
                  name="preferredSchedule"
                  placeholder={t.schedulePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.trialGuarantee}</span>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 gradient-brand text-white font-bold text-sm rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{t.submitButton}</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
