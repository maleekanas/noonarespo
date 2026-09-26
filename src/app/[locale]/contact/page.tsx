import React from "react";
import { type Locale, isRtlLocale } from "@/lib/localization";
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  ShieldCheck,
  Send,
} from "lucide-react";

import { CountryCitySelector } from "@/components/shared/CountryCitySelector";

interface ContactText {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  directChannelsTitle: string;
  whatsappTitle: string;
  whatsappDesc: string;
  emailTitle: string;
  emailDesc: string;
  hoursTitle: string;
  hoursTime: string;
  hoursDesc: string;
  privacyTitle: string;
  privacyDesc: string;
  formTitle: string;
  formSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  topicLabel: string;
  topicPlacement: string;
  topicCurriculum: string;
  topicPricing: string;
  topicInstitution: string;
  topicTechnical: string;
  countryLabel: string;
  cityLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitButton: string;
}

const CONTACT_I18N: Record<Locale, ContactText> = {
  ar: {
    heroBadge: "فريق دعم متخصص على مدار الساعة",
    heroTitle: "تواصل مع فريق Arabic Kids Academy",
    heroSubtitle:
      "سواء كان لديك استفسار حول المناهج، جداول الحصص، أو رغبة في تقييم تشخيصي، فريقنا الأكاديمي يسعد بمساعدتك.",
    directChannelsTitle: "قنوات التواصل المباشرة",
    whatsappTitle: "واتساب المباشر",
    whatsappDesc: "رد فوري خلال ساعات العمل",
    emailTitle: "البريد الإلكتروني",
    emailDesc: "متوسط الرد: أقل من ساعتين",
    hoursTitle: "ساعات الدعم الأكاديمي",
    hoursTime: "السبت - الخميس: 8 صباحاً - 9 مساءً (UTC)",
    hoursDesc: "متاح في أوقات أوروبا والشرق الأوسط",
    privacyTitle: "ميثاق حماية البيانات",
    privacyDesc:
      "معلوماتك سرية تماماً وتستخدم حصراً للتواصل معك بشأن متطلبات تعلم طفلك. لا نقوم بمشاركة أي بيانات مع معلنين.",
    formTitle: "أرسل استفسارك وسنعاود الاتصال بك",
    formSubtitle:
      "املأ النموذج أدناه وسيقوم أحد مستشارينا الأكاديميين بالتواصل معك خلال ساعتين عمل.",
    nameLabel: "الاسم الكامل لولي الأمر *",
    namePlaceholder: "مثال: طارق عبد الرحمن",
    emailLabel: "البريد الإلكتروني *",
    emailPlaceholder: "parent@example.com",
    phoneLabel: "رقم الهاتف / واتساب *",
    phonePlaceholder: "+966 50 123 4567",
    topicLabel: "موضوع الاستفسار",
    topicPlacement: "تحديد المستوى والتسجيل",
    topicCurriculum: "المناهج والبرامج الأكاديمية",
    topicPricing: "الأسعار وخطط الاشتراكات",
    topicInstitution: "شراكات المدارس والمراكز",
    topicTechnical: "دعم تقني للحصص التفاعلية",
    countryLabel: "الدولة (اختياري)",
    cityLabel: "المدينة (اختياري)",
    messageLabel: "رسالتك أو تفاصيل استفسارك *",
    messagePlaceholder:
      "اكتب تفاصيل استفسارك، أعمار أطفالك، ومستواهم الحالي في اللغة العربية...",
    submitButton: "إرسال الاستفسار الآن",
  },
  en: {
    heroBadge: "We are here to support your child's journey",
    heroTitle: "Contact Arabic Kids Academy",
    heroSubtitle:
      "Have questions about placement, cohort schedules, or curriculum? Our academic advisors are ready to assist.",
    directChannelsTitle: "Direct Channels",
    whatsappTitle: "WhatsApp Concierge",
    whatsappDesc: "Instant replies during academy hours",
    emailTitle: "Email Support",
    emailDesc: "Average response: under 2 hours",
    hoursTitle: "Support Hours",
    hoursTime: "Mon - Sat: 8:00 AM - 9:00 PM (UTC)",
    hoursDesc: "Aligned with EU, UK & Middle East time zones",
    privacyTitle: "Privacy & COPPA Commitment",
    privacyDesc:
      "All inquiries are handled with strict confidentiality and never shared with third parties or external marketers.",
    formTitle: "Send Us a Message",
    formSubtitle:
      "Fill out the form below and an academic advisor will get back to you within 2 business hours.",
    nameLabel: "Parent Full Name *",
    namePlaceholder: "e.g. Sarah Jenkins",
    emailLabel: "Email Address *",
    emailPlaceholder: "parent@example.com",
    phoneLabel: "Phone / WhatsApp *",
    phonePlaceholder: "+31 6 12345678",
    topicLabel: "Topic",
    topicPlacement: "Placement & Enrollment",
    topicCurriculum: "Curriculum & Programs",
    topicPricing: "Pricing & Subscriptions",
    topicInstitution: "Institutional School Hub",
    topicTechnical: "Technical Support",
    countryLabel: "Country (Optional)",
    cityLabel: "City (Optional)",
    messageLabel: "Your Message *",
    messagePlaceholder:
      "Tell us about your child's age, Arabic background, and any specific learning goals...",
    submitButton: "Send Message",
  },
  nl: {
    heroBadge: "Klantenservice en studieadvies voor ouders",
    heroTitle: "Contact met Arabic Kids Academy",
    heroSubtitle:
      "Heb je vragen over niveaubepaling, lesroosters of ons lesprogramma? Onze studieadviseurs staan voor je klaar.",
    directChannelsTitle: "Directe Kanalen",
    whatsappTitle: "WhatsApp Klantenservice",
    whatsappDesc: "Direct antwoord tijdens openingstijden",
    emailTitle: "E-mail Ondersteuning",
    emailDesc: "Gemiddelde reactietijd: binnen 2 uur",
    hoursTitle: "Openingstijden Studieadvies",
    hoursTime: "Ma - Za: 08:00 - 21:00 (UTC)",
    hoursDesc: "Afgestemd op Europese en Midden-Oosterse tijdzones",
    privacyTitle: "Privacy & Gegevensbescherming",
    privacyDesc:
      "Alle aanvragen worden strikt vertrouwelijk behandeld en nooit gedeeld met derden of marketingbedrijven.",
    formTitle: "Stuur ons een bericht",
    formSubtitle:
      "Vul onderstaand formulier in en een studieadviseur neemt binnen 2 werkuren contact met je op.",
    nameLabel: "Volledige naam ouder *",
    namePlaceholder: "bijv. Fatima El Amrani",
    emailLabel: "E-mailadres *",
    emailPlaceholder: "ouder@voorbeeld.nl",
    phoneLabel: "Telefoon / WhatsApp *",
    phonePlaceholder: "+31 6 12345678",
    topicLabel: "Onderwerp",
    topicPlacement: "Niveautest & Inschrijving",
    topicCurriculum: "Curriculum & Lesprogramma's",
    topicPricing: "Prijzen & Abonnementen",
    topicInstitution: "Scholen & Onderwijsinstellingen",
    topicTechnical: "Technische ondersteuning",
    countryLabel: "Land (optioneel)",
    cityLabel: "Stad (optioneel)",
    messageLabel: "Jouw bericht *",
    messagePlaceholder:
      "Vertel ons over de leeftijd van je kind, eerdere ervaring met Arabisch en je leerdoelen...",
    submitButton: "Bericht versturen",
  },
  tr: {
    heroBadge: "Çocuğunuzun eğitim yolculuğunda yanınızdayız",
    heroTitle: "Arabic Kids Academy ile İletişime Geçin",
    heroSubtitle:
      "Seviye tespiti, ders saatleri veya müfredat hakkında sorularınız mı var? Eğitim danışmanlarımız size yardımcı olmaktan mutluluk duyar.",
    directChannelsTitle: "Doğrudan İletişim Kanalları",
    whatsappTitle: "Canlı WhatsApp Hattı",
    whatsappDesc: "Çalışma saatleri içinde anında yanıt",
    emailTitle: "E-posta Desteği",
    emailDesc: "Ortalama yanıt süresi: 2 saatten az",
    hoursTitle: "Akademik Destek Saatleri",
    hoursTime: "Pzt - Cmt: 08:00 - 21:00 (UTC)",
    hoursDesc: "Avrupa ve Orta Doğu saat dilimlerine tam uyumlu",
    privacyTitle: "Gizlilik ve Veri Güvenliği Taahhüdü",
    privacyDesc:
      "Paylaştığınız bilgiler gizli tutulur ve yalnızca çocuğunuzun eğitim talebi için kullanılır. Üçüncü taraflarla asla paylaşılmaz.",
    formTitle: "Bize Mesaj Gönderin",
    formSubtitle:
      "Aşağıdaki formu doldurun, eğitim danışmanlarımız 2 iş saati içinde sizinle iletişime geçsin.",
    nameLabel: "Velinin Adı ve Soyadı *",
    namePlaceholder: "ör. Zeynep Yılmaz",
    emailLabel: "E-posta Adresi *",
    emailPlaceholder: "veli@ornek.com",
    phoneLabel: "Telefon / WhatsApp *",
    phonePlaceholder: "+90 532 123 4567",
    topicLabel: "Konu",
    topicPlacement: "Seviye Tespiti ve Kayıt",
    topicCurriculum: "Müfredat ve Akademik Programlar",
    topicPricing: "Fiyatlandırma ve Abonelikler",
    topicInstitution: "Okul ve Kurumsal İş Birlikleri",
    topicTechnical: "Teknik Destek",
    countryLabel: "Ülke (İsteğe bağlı)",
    cityLabel: "Şehir (İsteğe bağlı)",
    messageLabel: "Mesajınız veya Sorunuz *",
    messagePlaceholder:
      "Çocuğunuzun yaşını, Arapça geçmişini ve hedeflediğiniz becerileri bize anlatın...",
    submitButton: "Mesajı Gönder",
  },
  it: {
    heroBadge: "Siamo qui per guidare il percorso di tuo figlio",
    heroTitle: "Contatta Arabic Kids Academy",
    heroSubtitle:
      "Hai domande sul test di livello, orari delle lezioni o programmi? I nostri consulenti accademici sono pronti ad assisterti.",
    directChannelsTitle: "Canali Diretti",
    whatsappTitle: "Assistenza WhatsApp",
    whatsappDesc: "Risposte immediate negli orari di segreteria",
    emailTitle: "Supporto E-mail",
    emailDesc: "Tempo medio di risposta: meno di 2 ore",
    hoursTitle: "Orari di Supporto Accademico",
    hoursTime: "Lun - Sab: 08:00 - 21:00 (UTC)",
    hoursDesc: "Allineato ai fusi orari di Europa e Medio Oriente",
    privacyTitle: "Impegno per la Privacy e COPPA",
    privacyDesc:
      "Tutti i dati sono trattati con la massima riservatezza e non vengono mai ceduti a terze parti o per scopi pubblicitari.",
    formTitle: "Inviaci un messaggio",
    formSubtitle:
      "Compila il modulo sottostante e un nostro consulente ti risponderà entro 2 ore lavorative.",
    nameLabel: "Nome e Cognome del Genitore *",
    namePlaceholder: "es. Marco Rossi",
    emailLabel: "Indirizzo E-mail *",
    emailPlaceholder: "genitore@esempio.it",
    phoneLabel: "Telefono / WhatsApp *",
    phonePlaceholder: "+39 340 1234567",
    topicLabel: "Oggetto della richiesta",
    topicPlacement: "Valutazione di livello e iscrizione",
    topicCurriculum: "Piani di studio e programmi",
    topicPricing: "Piani tariffari e abbonamenti",
    topicInstitution: "Partnership con scuole e centri",
    topicTechnical: "Assistenza tecnica per le lezioni",
    countryLabel: "Paese (opzionale)",
    cityLabel: "Città (opzionale)",
    messageLabel: "Il tuo messaggio *",
    messagePlaceholder:
      "Indicaci l'età di tuo figlio, il suo livello di arabo e gli obiettivi educativi...",
    submitButton: "Invia messaggio",
  },
  es: {
    heroBadge: "Estamos aquí para acompañar el aprendizaje de tu hijo",
    heroTitle: "Contacta con Arabic Kids Academy",
    heroSubtitle:
      "¿Tienes preguntas sobre el diagnóstico de nivel, horarios o el plan de estudios? Nuestros asesores académicos están listos para ayudarte.",
    directChannelsTitle: "Canales Directos",
    whatsappTitle: "Atención por WhatsApp",
    whatsappDesc: "Respuesta inmediata en horario lectivo",
    emailTitle: "Soporte por E-mail",
    emailDesc: "Tiempo medio de respuesta: menos de 2 horas",
    hoursTitle: "Horario de Atención Académica",
    hoursTime: "Lun - Sáb: 08:00 - 21:00 (UTC)",
    hoursDesc: "Adaptado a las zonas horarias de Europa y Oriente Medio",
    privacyTitle: "Compromiso de Privacidad y COPPA",
    privacyDesc:
      "Todas las consultas se gestionan con absoluta confidencialidad y nunca se comparten con terceros ni para fines publicitarios.",
    formTitle: "Envíanos un mensaje",
    formSubtitle:
      "Completa el formulario y un asesor académico se pondrá en contacto contigo en menos de 2 horas hábiles.",
    nameLabel: "Nombre completo del padre/madre *",
    namePlaceholder: "ej. Carlos Morales",
    emailLabel: "Correo electrónico *",
    emailPlaceholder: "padre@ejemplo.es",
    phoneLabel: "Teléfono / WhatsApp *",
    phonePlaceholder: "+34 612 345 678",
    topicLabel: "Motivo de la consulta",
    topicPlacement: "Diagnóstico de nivel y matrícula",
    topicCurriculum: "Plan de estudios y programas",
    topicPricing: "Tarifas y suscripciones",
    topicInstitution: "Convenios con colegios e institutos",
    topicTechnical: "Soporte técnico para aulas virtuales",
    countryLabel: "País (opcional)",
    cityLabel: "Ciudad (opcional)",
    messageLabel: "Tu mensaje *",
    messagePlaceholder:
      "Cuéntanos la edad de tu hijo, su conocimiento previo de árabe y tus objetivos de aprendizaje...",
    submitButton: "Enviar mensaje",
  },
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const validLocale: Locale = (["ar", "en", "nl", "tr", "it", "es"].includes(locale)
    ? locale
    : "en") as Locale;

  const t = CONTACT_I18N[validLocale];

  async function handleContactSubmit(formData: FormData) {
    "use server";
    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const country = formData.get("country")?.toString() || "";
    const city = formData.get("city")?.toString() || "";
    const topic = formData.get("topic")?.toString() || "GENERAL";
    const message = formData.get("message")?.toString() || "";

    const { crmService } = await import("@/server/services/CrmService");
    await crmService.captureContactInquiry({
      name,
      email,
      phone,
      country,
      city,
      topic,
      message,
      locale,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <MessageSquare className="w-4 h-4 text-brand-400" />
            <span>{t.heroBadge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight text-white">
            {t.heroTitle}
          </h1>
          <p className="mt-4 text-base text-slate-200 max-w-xl mx-auto">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Column */}
          <div className="space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                {t.directChannelsTitle}
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t.whatsappTitle}
                  </div>
                  <a
                    href="https://wa.me/31685663010"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-brand-600 hover:underline"
                  >
                    +31 6856 630 10
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.whatsappDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t.emailTitle}
                  </div>
                  <a
                    href="mailto:support@arabickidsacademy.com"
                    className="text-sm font-bold text-slate-800 hover:text-brand-600"
                  >
                    support@arabickidsacademy.com
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.emailDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t.hoursTitle}
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {t.hoursTime}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.hoursDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Inquiry / Safe Charter */}
            <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-3xl text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{t.privacyTitle}</span>
              </div>
              <p className="leading-relaxed">
                {t.privacyDesc}
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-2 p-8 sm:p-10 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t.formTitle}
            </h3>
            <p className="text-sm text-slate-500 mb-8">
              {t.formSubtitle}
            </p>

            <form action={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={t.namePlaceholder}
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
                    placeholder={t.emailPlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder={t.phonePlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t.topicLabel}
                  </label>
                  <select
                    name="topic"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  >
                    <option value="PLACEMENT">{t.topicPlacement}</option>
                    <option value="CURRICULUM">{t.topicCurriculum}</option>
                    <option value="PRICING">{t.topicPricing}</option>
                    <option value="INSTITUTION">{t.topicInstitution}</option>
                    <option value="TECHNICAL">{t.topicTechnical}</option>
                  </select>
                </div>
              </div>

              <CountryCitySelector
                nameCountry="country"
                nameCity="city"
                locale={locale}
                countryLabel={t.countryLabel}
                cityLabel={t.cityLabel}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.messageLabel}
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder={t.messagePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 gradient-brand text-white font-bold text-sm rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{t.submitButton}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
