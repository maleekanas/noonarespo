import React from "react";
import { type Locale } from "@/lib/localization";
import {
  GraduationCap,
  Sparkles,
  DollarSign,
  Calendar,
  MonitorPlay,
  Award,
  CheckCircle2,
  ShieldCheck,
  Send,
} from "lucide-react";
import { CountryCitySelector } from "@/components/shared/CountryCitySelector";

interface TeachText {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  benefits: Array<{
    title: string;
    desc: string;
  }>;
  reqTitle: string;
  reqList: string[];
  vettingTitle: string;
  vettingDesc: string;
  formTitle: string;
  formSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  phoneLabel: string;
  expLabel: string;
  expOptions: Array<{ value: string; label: string }>;
  countryLabel: string;
  cityLabel: string;
  degreeLabel: string;
  degreePlaceholder: string;
  ijazahLabel: string;
  ijazahPlaceholder: string;
  languagesLabel: string;
  languagesPlaceholder: string;
  bioLabel: string;
  bioPlaceholder: string;
  submitButton: string;
}

const TEACH_I18N: Record<Locale, TeachText> = {
  ar: {
    heroBadge: "انضم إلى نخبة معلمي اللغة العربية والقرآن",
    heroTitle: "درّس مع Arabic Kids Academy",
    heroSubtitle:
      "نبحث عن معلمين ومعلمات معتمدين ومتحمسين لتعليم الأطفال اللغة العربية وتجويد القرآن الكريم عبر بيئة تفاعلية حديثة بمواعيد مرنة ومكافآت تنافسية.",
    benefits: [
      {
        title: "مكافآت مجزية وتنافسية",
        desc: "أجور مجزية تبدأ من 30 دولاراً للساعة، مع دفعات منتظمة ومكافآت أداء وتقييم سنوية ممتازة.",
      },
      {
        title: "جداول تدريس مرنة",
        desc: "اختر أوقات الحصص التي تناسبك بحرية مع إمكانية التدريس بدوام جزئي أو كامل من منزلك.",
      },
      {
        title: "استوديوهات تعليمية متطورة",
        desc: "سبورة ذكية تفاعلية، تحليل صوتي للتجويد، ومكتبة متكاملة من أحدث المناهج الرقمية وأوراق العمل.",
      },
      {
        title: "رسالة سامية ومجتمع تعليمي داعم",
        desc: "انضم إلى أكثر من 150 معلماً متخصصاً يساهمون في بناء جيل يعتز بهويته ولغته في أكثر من 30 دولة.",
      },
    ],
    reqTitle: "شروط ومعايير الانضمام",
    reqList: [
      "المتحدث الأصلي للغة العربية بإتقان تام لمخارج الحروف وقواعد النحو.",
      "مؤهل جامعي في اللغة العربية، الدراسات الإسلامية، أو التربية.",
      "إجازة معتمدة في تجويد القرآن الكريم (لمعلمي مسار القرآن).",
      "خبرة لا تقل عن سنتين في التدريس التفاعلي للأطفال عبر الإنترنت.",
      "اتصال إنترنت عالي السرعة، وميكروفون وكاميرا احترافية، ومكان هادئ.",
    ],
    vettingTitle: "التدقيق الأمني وحماية الأطفال",
    vettingDesc:
      "يخضع جميع المتقدمين للتحقق من الهوية، وتدقيق الشهادات الأكاديمية، واختبار عملي مباشر مع المشرف الأكاديمي لضمان أعلى معايير الأمان.",
    formTitle: "نموذج التقديم للانضمام للهيئة التعليمية",
    formSubtitle:
      "يرجى تعبئة بياناتك بدقة وسيتواصل معك فريق التوظيف الأكاديمي لتحديد موعد المقابلة التجريبية.",
    nameLabel: "الاسم الكامل *",
    namePlaceholder: "مثال: د. عبد الله بن يوسف",
    emailLabel: "البريد الإلكتروني *",
    phoneLabel: "رقم الهاتف / واتساب *",
    expLabel: "سنوات الخبرة في تعليم الأطفال *",
    expOptions: [
      { value: "1-2", label: "سنة إلى سنتين" },
      { value: "3-5", label: "3 إلى 5 سنوات" },
      { value: "6-10", label: "6 إلى 10 سنوات" },
      { value: "10+", label: "أكثر من 10 سنوات" },
    ],
    countryLabel: "بلد الإقامة الحالي *",
    cityLabel: "المدينة *",
    degreeLabel: "المؤهل الأكاديمي والجامعة *",
    degreePlaceholder: "ليسانس لغة عربية - جامعة الأزهر",
    ijazahLabel: "الإجازات والشهادات المعتمدة",
    ijazahPlaceholder: "إجازة برواية حفص عن عاصم، شهادة تدريس لغير الناطقين",
    languagesLabel: "اللغات التي تتحدثها وتدرس بها",
    languagesPlaceholder: "العربية (اللغة الأم)، الإنجليزية، الفرنسية...",
    bioLabel: "نبذة عن أسلوبك في التدريس وشغفك بالتعليم *",
    bioPlaceholder:
      "حدثنا عن منهجيتك في تحبيب الأطفال في اللغة العربية أو القرآن وأهم إنجازاتك التعليمية...",
    submitButton: "إرسال طلب التوظيف",
  },
  en: {
    heroBadge: "Join Our Elite Teaching Faculty",
    heroTitle: "Teach with Arabic Kids Academy",
    heroSubtitle:
      "We are recruiting certified, passionate Arabic and Quran educators to inspire young learners worldwide with flexible schedules and competitive pay.",
    benefits: [
      {
        title: "Competitive Global Compensation",
        desc: "Transparent baseline starting at $30/hr with prompt automated payouts, cohort retention bonuses, and annual performance reviews.",
      },
      {
        title: "Flexible Scheduling",
        desc: "Design your availability with flexible morning or evening cohorts. Teach full-time or part-time from your own studio workspace.",
      },
      {
        title: "Next-Gen Classroom Studios",
        desc: "Teach on our proprietary collaborative whiteboard, interactive phoneme wave analyzer, and pre-built interactive curriculum materials.",
      },
      {
        title: "Inspiring Mission & Community",
        desc: "Join 150+ passionate educators empowering children across 30+ countries to cherish Arabic and the Quran.",
      },
    ],
    reqTitle: "Faculty Requirements",
    reqList: [
      "Native Arabic speaker with excellent articulation and grammar.",
      "University degree in Arabic Language, Islamic Studies, or Education.",
      "Accredited Tajweed / Qira'at certification (for Quran tracks).",
      "Minimum 2 years teaching children in an online interactive format.",
      "High-speed internet, dedicated studio headset, and quiet workspace.",
    ],
    vettingTitle: "Vetting & Safety Clearance",
    vettingDesc:
      "All candidates undergo background clearance, identity verification, and live teaching auditions before interacting with students.",
    formTitle: "Teacher Application Form",
    formSubtitle:
      "Complete the form below and our recruitment committee will review your application within 3 business days.",
    nameLabel: "Full Name *",
    namePlaceholder: "e.g. Dr. Abdullah Yusuf",
    emailLabel: "Email Address *",
    phoneLabel: "Phone / WhatsApp *",
    expLabel: "Years of Experience (Kids) *",
    expOptions: [
      { value: "1-2", label: "1 - 2 Years" },
      { value: "3-5", label: "3 - 5 Years" },
      { value: "6-10", label: "6 - 10 Years" },
      { value: "10+", label: "10+ Years" },
    ],
    countryLabel: "Current Country of Residence *",
    cityLabel: "City *",
    degreeLabel: "Degree & University *",
    degreePlaceholder: "BA Arabic Language & Literature",
    ijazahLabel: "Certifications & Ijazah",
    ijazahPlaceholder: "Hafs Ijazah, TAFL Certification",
    languagesLabel: "Languages Spoken",
    languagesPlaceholder: "Arabic (Native), English, French, Dutch...",
    bioLabel: "Teaching Philosophy & Bio *",
    bioPlaceholder:
      "Tell us about your interactive methods for engaging young diaspora learners and your past teaching milestones...",
    submitButton: "Submit Teacher Application",
  },
  nl: {
    heroBadge: "Word onderdeel van ons docententeam",
    heroTitle: "Lesgeven bij Arabic Kids Academy",
    heroSubtitle:
      "Wij zoeken gecertificeerde, gepassioneerde leerkrachten Arabisch en Koran om kinderen wereldwijd te inspireren met flexibele werktijden en aantrekkelijke vergoedingen.",
    benefits: [
      {
        title: "Aantrekkelijke Vergoeding",
        desc: "Basistarief vanaf $30 per uur met tijdige betalingen, bonussen en jaarlijkse evaluaties.",
      },
      {
        title: "Flexibele Werkuren",
        desc: "Kies je eigen beschikbaarheid met ochtend- of avondlessen. Werk parttime of fulltime vanuit je eigen thuiswerkplek.",
      },
      {
        title: "Innovatieve Lesomgeving",
        desc: "Geef les met ons interactieve whiteboard, spraakanalyse en kant-en-klare digitale lesmaterialen.",
      },
      {
        title: "Inspirerende Gemeenschap",
        desc: "Sluit je aan bij meer dan 150 vakdocenten die kinderen in 30+ landen verbinden met hun Arabische identiteit.",
      },
    ],
    reqTitle: "Functie-eisen & Criteria",
    reqList: [
      "Moedertaalspreker Arabisch met vlekkeloze uitspraak en beheersing van de grammatica.",
      "Afgeronde universitaire opleiding in Arabische taal, Islamitische studies of Pedagogiek.",
      "Erkende Ijazah / Tajweed-certificering (voor Korandocenten).",
      "Minimaal 2 jaar ervaring in interactief online lesgeven aan kinderen.",
      "Snelle internetverbinding, professionele headset en een rustige werkkamer.",
    ],
    vettingTitle: "Veiligheid & VOG Screening",
    vettingDesc:
      "Alle kandidaten ondergaan identiteitscontrole, diplomachecks en een proeflesaudit alvorens zij lesgeven aan leerlingen.",
    formTitle: "Sollicitatieformulier Leerkracht",
    formSubtitle:
      "Vul onderstaand formulier in en onze selectiecommissie beoordeelt je aanvraag binnen 3 werkdagen.",
    nameLabel: "Volledige naam *",
    namePlaceholder: "bijv. Dr. Abdullah Yusuf",
    emailLabel: "E-mailadres *",
    phoneLabel: "Telefoon / WhatsApp *",
    expLabel: "Jaren ervaring met kinderen *",
    expOptions: [
      { value: "1-2", label: "1 - 2 jaar" },
      { value: "3-5", label: "3 - 5 jaar" },
      { value: "6-10", label: "6 - 10 jaar" },
      { value: "10+", label: "Meer dan 10 jaar" },
    ],
    countryLabel: "Woonland *",
    cityLabel: "Woonplaats *",
    degreeLabel: "Opleiding & Universiteit *",
    degreePlaceholder: "Bachelor Arabische Taal & Cultuur",
    ijazahLabel: "Certificeringen & Ijazah",
    ijazahPlaceholder: "Ijazah Hafs, NT2 / TAFL certificaat",
    languagesLabel: "Talenkennis",
    languagesPlaceholder: "Arabisch (moedertaal), Engels, Nederlands...",
    bioLabel: "Onderwijsvisie & Motivatie *",
    bioPlaceholder:
      "Beschrijf je interactieve lesmethoden om kinderen in de diaspora te motiveren voor de Arabische taal...",
    submitButton: "Sollicitatie versturen",
  },
  tr: {
    heroBadge: "Seçkin Öğretmen Kadromuza Katılın",
    heroTitle: "Arabic Kids Academy'de Öğretmen Olun",
    heroSubtitle:
      "Dünya çapındaki çocuklara Arapça ve Kuran sevgisini aşılayacak sertifikalı, tutkulu öğretmenler arıyoruz.",
    benefits: [
      {
        title: "Rekabetçi ve Şeffaf Gelir",
        desc: "Saatlik 30$'dan başlayan net ücret, düzenli ödemeler, sınıf tutma primleri ve yıllık performans ödülleri.",
      },
      {
        title: "Esnek Çalışma Saatleri",
        desc: "Kendi ders saatlerinizi serbestçe belirleyin; evinizin konforunda tam zamanlı veya yarı zamanlı çalışın.",
      },
      {
        title: "Yeni Nesil Dijital Stüdyolar",
        desc: "Özel akıllı tahtamız, gerçek zamanlı ses dalgası analizörü ve hazır dijital müfredat materyalleriyle ders verin.",
      },
      {
        title: "İlham Verici Mesleki Topluluk",
        desc: "30'dan fazla ülkede çocuklara kimliklerini kazandıran 150'den fazla uzman eğitimciye katılın.",
      },
    ],
    reqTitle: "Başvuru ve Yetkinlik Kriterleri",
    reqList: [
      "Kusursuz diksiyon ve dilbilgisine sahip anadili Arapça olan eğitmenler.",
      "Arap Dili ve Edebiyatı, İlahiyat veya Eğitim Fakültesi lisans mezuniyeti.",
      "Kuran dersleri için onaylı Tecvid / Aşere Kıraat icazeti.",
      "Çocuklara yönelik çevrimiçi etkileşimli eğitimde en az 2 yıl deneyim.",
      "Yüksek hızlı internet bağlantısı, profesyonel kulaklık ve sessiz çalışma alanı.",
    ],
    vettingTitle: "Güvenlik ve Sicil Taraması",
    vettingDesc:
      "Tüm adaylar derslere başlamadan önce kimlik doğrulaması, adli sicil kontrolü ve canlı deneme dersi aşamalarından geçer.",
    formTitle: "Öğretmenlik Başvuru Formu",
    formSubtitle:
      "Formu eksiksiz doldurun; akademik değerlendirme komitemiz 3 iş günü içinde sizinle iletişime geçecektir.",
    nameLabel: "Ad Soyad *",
    namePlaceholder: "ör. Dr. Abdullah Yusuf",
    emailLabel: "E-posta Adresi *",
    phoneLabel: "Telefon / WhatsApp *",
    expLabel: "Çocuk Eğitiminde Deneyim Süresi *",
    expOptions: [
      { value: "1-2", label: "1 - 2 Yıl" },
      { value: "3-5", label: "3 - 5 Yıl" },
      { value: "6-10", label: "6 - 10 Yıl" },
      { value: "10+", label: "10 Yıldan Fazla" },
    ],
    countryLabel: "İkamet Edilen Ülke *",
    cityLabel: "Şehir *",
    degreeLabel: "Mezun Olunan Üniversite ve Bölüm *",
    degreePlaceholder: "Arap Dili ve Edebiyatı / İlahiyat",
    ijazahLabel: "İcazet ve Sertifikalar",
    ijazahPlaceholder: "Hafs İcazeti, Yabancılara Arapça Öğretimi (TAFL)",
    languagesLabel: "Bildiğiniz Diller",
    languagesPlaceholder: "Arapça (Anadil), İngilizce, Türkçe...",
    bioLabel: "Öğretim Yaklaşımınız ve Kendinizi Tanıtın *",
    bioPlaceholder:
      "Gurbetteki çocuklara Arapça öğretirken kullandığınız etkileşimli yöntemleri ve başarılarınızı anlatın...",
    submitButton: "Başvuruyu Tamamla",
  },
  it: {
    heroBadge: "Unisciti al Nostro Corpo Docente",
    heroTitle: "Insegna con Arabic Kids Academy",
    heroSubtitle:
      "Selezioniamo insegnanti certificati e appassionati per guidare i giovani studenti nel mondo con orari flessibili e compensi competitivi.",
    benefits: [
      {
        title: "Compensi Competitivi e Puntuali",
        desc: "Tariffa base a partire da $30/ora, pagamenti regolari, bonus fedeltà per i corsi e revisioni annuali.",
      },
      {
        title: "Flessibilità Oraria",
        desc: "Scegli la tua disponibilità con orari mattutini o serali. Insegna part-time o a tempo pieno da casa.",
      },
      {
        title: "Studi Digitali All'Avanguardia",
        desc: "Utilizza la nostra lavagna interattiva avanzata, l'analizzatore acustico dei fonemi e i materiali didattici pronti.",
      },
      {
        title: "Missione Ispirante e Community",
        desc: "Unisciti a oltre 150 insegnanti che formano i giovani in più di 30 paesi con dedizione e passione.",
      },
    ],
    reqTitle: "Requisiti di Candidatura",
    reqList: [
      "Madrelingua arabo con perfetta articolazione e padronanza grammaticale.",
      "Laurea in Lingua Araba, Studi Islamici o Scienze dell'Educazione.",
      "Ijazah / Certificazione di Tajweed (per gli insegnanti del percorso coranico).",
      "Almeno 2 anni di esperienza nella didattica online per bambini.",
      "Connessione internet veloce, cuffie da studio e postazione tranquilla.",
    ],
    vettingTitle: "Controllo di Sicurezza e Affidabilità",
    vettingDesc:
      "Tutti i docenti sono sottoposti a verifica dell'identità, controllo titoli e audizione dal vivo prima di entrare in classe.",
    formTitle: "Modulo di Candidatura Docenti",
    formSubtitle:
      "Compila il modulo sottostante; la nostra commissione esaminerà la tua richiesta entro 3 giorni lavorativi.",
    nameLabel: "Nome e Cognome *",
    namePlaceholder: "es. Dr. Abdullah Yusuf",
    emailLabel: "Indirizzo E-mail *",
    phoneLabel: "Telefono / WhatsApp *",
    expLabel: "Anni di Esperienza con i Bambini *",
    expOptions: [
      { value: "1-2", label: "1 - 2 Anni" },
      { value: "3-5", label: "3 - 5 Anni" },
      { value: "6-10", label: "6 - 10 Anni" },
      { value: "10+", label: "Oltre 10 Anni" },
    ],
    countryLabel: "Paese di Residenza *",
    cityLabel: "Città *",
    degreeLabel: "Titolo Accademico e Università *",
    degreePlaceholder: "Laurea in Lingua Araba - Al-Azhar",
    ijazahLabel: "Certificazioni e Ijazah",
    ijazahPlaceholder: "Ijazah Hafs, Certificazione TAFL",
    languagesLabel: "Lingue Parlate",
    languagesPlaceholder: "Arabo (Madrelingua), Inglese, Italiano...",
    bioLabel: "Metodo Didattico e Presentazione *",
    bioPlaceholder:
      "Descrivi il tuo approccio interattivo per coinvolgere i giovani allievi della diaspora...",
    submitButton: "Invia Candidatura",
  },
  es: {
    heroBadge: "Únete a Nuestro Profesorado de Élite",
    heroTitle: "Enseña con Arabic Kids Academy",
    heroSubtitle:
      "Buscamos docentes nativos y certificados para inspirar a niños en todo el mundo con horarios flexibles y remuneración competitiva.",
    benefits: [
      {
        title: "Remuneración Competitiva",
        desc: "Tarifa base desde $30/hora, pagos automatizados y puntuales, primas de retención de alumnos y evaluaciones anuales.",
      },
      {
        title: "Horarios Flexibles",
        desc: "Elige tus franjas lectivas con turnos de mañana o tarde. Imparte clases a tiempo parcial o completo desde casa.",
      },
      {
        title: "Estudios Virtuales de Vanguardia",
        desc: "Enseña con nuestra pizarra compartida, analizador fonético en tiempo real y currículo digital interactivo listo para usar.",
      },
      {
        title: "Misión Inspiradora y Comunidad",
        desc: "Forma parte de una red de más de 150 docentes que conectan a miles de niños en 30+ países con el árabe.",
      },
    ],
    reqTitle: "Requisitos de Selección",
    reqList: [
      "Hablante nativo de árabe con excelente articulación fonética y gramatical.",
      "Licenciatura o Grado en Lengua Árabe, Estudios Islámicos o Magisterio.",
      "Ijazah / Certificado de Taywid acreditado (para profesores de Corán).",
      "Mínimo 2 años de experiencia contrastada en enseñanza interactiva infantil en línea.",
      "Conexión a internet de alta velocidad, auriculares profesionales y espacio silencioso.",
    ],
    vettingTitle: "Verificación y Seguridad Infantil",
    vettingDesc:
      "Todos los candidatos pasan por verificación de identidad, acreditación académica y clase de prueba antes de entrar al aula.",
    formTitle: "Formulario de Solicitud para Docentes",
    formSubtitle:
      "Completa el formulario y nuestro comité de selección revisará tu expediente en un plazo de 3 días laborables.",
    nameLabel: "Nombre Completo *",
    namePlaceholder: "ej. Dr. Abdullah Yusuf",
    emailLabel: "Correo Electrónico *",
    phoneLabel: "Teléfono / WhatsApp *",
    expLabel: "Años de Experiencia con Niños *",
    expOptions: [
      { value: "1-2", label: "1 - 2 Años" },
      { value: "3-5", label: "3 - 5 Años" },
      { value: "6-10", label: "6 - 10 Años" },
      { value: "10+", label: "Más de 10 Años" },
    ],
    countryLabel: "País de Residencia *",
    cityLabel: "Ciudad *",
    degreeLabel: "Titulación Académica y Universidad *",
    degreePlaceholder: "Grado en Lengua y Literatura Árabes",
    ijazahLabel: "Certificaciones e Ijazah",
    ijazahPlaceholder: "Ijazah Hafs, Certificado TAFL / ELE",
    languagesLabel: "Idiomas que Hablas",
    languagesPlaceholder: "Árabe (Nativo), Inglés, Español...",
    bioLabel: "Filosofía Pedagógica y Biografía *",
    bioPlaceholder:
      "Cuéntanos tu enfoque interactivo para motivar a los niños en la diáspora y tus logros educativos...",
    submitButton: "Enviar Solicitud Docente",
  },
};

export default async function TeachPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale: Locale = (["ar", "en", "nl", "tr", "it", "es"].includes(locale)
    ? locale
    : "en") as Locale;

  const t = TEACH_I18N[validLocale];

  async function handleTeacherApplication(formData: FormData) {
    "use server";
    const fullName = formData.get("fullName")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const yearsExp = formData.get("yearsExp")?.toString() || "";
    const country = formData.get("country")?.toString() || "";
    const city = formData.get("city")?.toString() || "";
    const degree = formData.get("degree")?.toString() || "";
    const ijazah = formData.get("ijazah")?.toString() || "";
    const languages = formData.get("languages")?.toString() || "";
    const bio = formData.get("bio")?.toString() || "";

    const { crmService } = await import("@/server/services/CrmService");
    await crmService.captureTeacherApplication({
      fullName,
      email,
      phone,
      experienceYears: Number(yearsExp) || 0,
      qualifications: degree,
      certifications: ijazah,
      languages,
      bio,
      country,
      city,
      locale,
    });
  }

  const benefitIcons = [
    <DollarSign key="ds" className="w-6 h-6 text-emerald-600" />,
    <Calendar key="cl" className="w-6 h-6 text-brand-600" />,
    <MonitorPlay key="mp" className="w-6 h-6 text-purple-600" />,
    <Award key="aw" className="w-6 h-6 text-amber-600" />,
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <GraduationCap className="w-4 h-4 text-brand-400" />
            <span>{t.heroBadge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            {t.heroTitle}
          </h1>
          <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {t.benefits.map((b, idx) => (
            <div key={idx} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                {benefitIcons[idx]}
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {b.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Application Form & Requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Requirements Box */}
          <div className="space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                {t.reqTitle}
              </h3>
              <ul className="space-y-3 text-xs text-slate-600">
                {t.reqList.map((req, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-brand-50 border border-brand-200 rounded-3xl text-xs text-brand-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-brand-900">
                <ShieldCheck className="w-4 h-4 text-brand-700" />
                <span>{t.vettingTitle}</span>
              </div>
              <p className="leading-relaxed text-brand-800">
                {t.vettingDesc}
              </p>
            </div>
          </div>

          {/* Teacher Application Form */}
          <div className="lg:col-span-2 p-8 sm:p-10 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t.formTitle}
            </h3>
            <p className="text-sm text-slate-500 mb-8">
              {t.formSubtitle}
            </p>

            <form action={handleTeacherApplication} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    name="fullName"
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
                    placeholder="teacher@example.com"
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
                    placeholder="+966 50 123 4567"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t.expLabel}
                  </label>
                  <select
                    name="yearsExp"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  >
                    {t.expOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t.degreeLabel}
                  </label>
                  <input
                    type="text"
                    name="degree"
                    required
                    placeholder={t.degreePlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t.ijazahLabel}
                  </label>
                  <input
                    type="text"
                    name="ijazah"
                    placeholder={t.ijazahPlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.languagesLabel}
                </label>
                <input
                  type="text"
                  name="languages"
                  placeholder={t.languagesPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.bioLabel}
                </label>
                <textarea
                  name="bio"
                  required
                  rows={4}
                  placeholder={t.bioPlaceholder}
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
