import React from "react";
import Link from "next/link";
import { type Locale, isRtlLocale } from "@/lib/localization";
import {
  Heart,
  ShieldCheck,
  TrendingUp,
  Video,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Printer,
} from "lucide-react";

interface ForParentsText {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaRegister: string;
  ctaHow: string;
  pillarsTag: string;
  pillarsHeading: string;
  pillars: Array<{
    title: string;
    desc: string;
  }>;
  safetyHeading: string;
  safetyDesc: string;
  safetyLink: string;
  bottomHeading: string;
  bottomDesc: string;
  bottomButton: string;
}

const FOR_PARENTS_I18N: Record<Locale, ForParentsText> = {
  ar: {
    heroBadge: "شراكة تربوية قائمة على الشفافية والثقة",
    heroTitle: "أنت شريكنا في كل خطوة من رحلة طفلك نحو الفصاحة",
    heroSubtitle:
      "صممنا بوابة أولياء الأمور لتمنحك راحة البال، وتتيح لك متابعة تقدم أطفالك، والتواصل مع معلميهم، والاطلاع على تسجيلات الحصص بكل سهولة وأمان.",
    ctaRegister: "إنشاء حساب ولي أمر مجاناً",
    ctaHow: "كيف تعمل المنصة؟",
    pillarsTag: "مميزات بوابة أولياء الأمور",
    pillarsHeading: "تحكم كامل وتواصل مستمر لضمان نجاح طفلك",
    pillars: [
      {
        title: "متابعة فورية لتطور مستوى طفلك",
        desc: "شاهد نمو حصيلة طفلك اللغوية، واطلع على دقة نطق الحروف، وتابع إنجاز الوحدات الدراسية أولاً بأول.",
      },
      {
        title: "تسجيلات كاملة للحصص المباشرة",
        desc: "تُسجل كل حصة مباشرة وتتاح في لوحة تحكمك خلال 60 دقيقة، لمراجعة الدروس أو تعويض الحصص التي تغيب عنها الطفل.",
      },
      {
        title: "تواصل مباشر وخاص مع المعلمين",
        desc: "تواصل بأمان مع معلم طفلك المعتمد، واطلب اجتماعات فردية مرئية لمناقشة تقدمه، واطلع على ملاحظات المعلم بعد كل واجب.",
      },
      {
        title: "مكتبة أوراق عمل وأنشطة قابلة للطباعة",
        desc: "حمل مئات أوراق العمل والأنشطة لتدريب طفلك على كتابة الحروف والخط العربي وأنشطة التلوين الهادفة بعيداً عن الشاشات.",
      },
    ],
    safetyHeading: "حماية خصوصية طفلك هي أولويتنا القصوى",
    safetyDesc:
      "لا يمكن لأي طالب إنشاء حساب دون موافقة بالغة ومحققة من ولي الأمر. لا يتم تتبع طفلك للإعلانات، ولا توجد غرف محادثة مفتوحة غير مراقبة بين الأطفال.",
    safetyLink: "اقرأ ميثاق حماية وسلامة الطفل بالكامل",
    bottomHeading: "انضم إلى آلاف العائلات في 30+ دولة",
    bottomDesc:
      "امنح طفلك هدية التحدث بلغة القرآن والفصاحة العربية مع أفضل المعلمين المعتمدين من Arabic Kids Academy.",
    bottomButton: "ابدأ التسجيل الآن",
  },
  en: {
    heroBadge: "Built for Peace of Mind & Parent Empowerment",
    heroTitle: "Complete Visibility Into Your Child's Educational Journey",
    heroSubtitle:
      "Our dedicated Parent Portal gives you complete oversight: monitor attendance, watch live lesson replays, track vocabulary milestones, and consult with certified teachers.",
    ctaRegister: "Create Free Parent Account",
    ctaHow: "How It Works",
    pillarsTag: "Parent Portal Features",
    pillarsHeading: "Everything You Need to Nurture Your Child's Arabic",
    pillars: [
      {
        title: "Real-Time Milestone Tracking",
        desc: "Watch your child's vocabulary count grow, track phoneme accuracy scores, and view completed curriculum units in real time.",
      },
      {
        title: "Recorded Sessions & Playback",
        desc: "Every live micro-cohort class is recorded and accessible to you within 60 minutes for effortless review or catching up on missed lessons.",
      },
      {
        title: "Direct Teacher Communication",
        desc: "Send direct in-app messages to your child's certified instructor, request 1-on-1 parent-teacher conferences, and review written feedback.",
      },
      {
        title: "Curated Printable Worksheets",
        desc: "Access a rich digital library of handwriting practice sheets, phonics tracing cards, and Quranic coloring pages for offline learning.",
      },
    ],
    safetyHeading: "Built Around COPPA & GDPR-K Child Protection",
    safetyDesc:
      "Children cannot register without verified adult consent. We never sell personal data, display advertisements, or allow unmonitored peer chat.",
    safetyLink: "Read Our Full Child Safety Charter",
    bottomHeading: "Join Thousands of Families Across 30+ Countries",
    bottomDesc:
      "Give your child the lifelong gift of understanding the Quran and speaking Arabic with pride at Arabic Kids Academy.",
    bottomButton: "Start Registration Today",
  },
  nl: {
    heroBadge: "Gemoedsrust & Ouderbetrokkenheid",
    heroTitle: "Volledig Inzicht in de Leerreis van Jouw Kind",
    heroSubtitle:
      "Ons ouderportaal biedt compleet overzicht: volg aanwezigheid, bekijk lesopnames, volg woordenschatmijlpalen en overleg rechtstreeks met gecertificeerde docenten.",
    ctaRegister: "Maak een gratis ouderaccount aan",
    ctaHow: "Hoe het werkt",
    pillarsTag: "Functies Ouderportaal",
    pillarsHeading: "Alles wat je nodig hebt om het Arabisch van je kind te stimuleren",
    pillars: [
      {
        title: "Realtime Voortgangsregistratie",
        desc: "Zie de woordenschat van je kind groeien, volg uitspraakscores en bekijk voltooide lesmodules in realtime.",
      },
      {
        title: "Lesopnames & Terugkijken",
        desc: "Elke interactieve les wordt opgenomen en binnen 60 minuten beschikbaar gesteld om terug te kijken of gemiste lessen in te halen.",
      },
      {
        title: "Direct Contact met de Leerkracht",
        desc: "Stuur veilige berichten naar de docent, vraag 1-op-1 oudergesprekken aan en bekijk persoonlijke feedback na elk huiswerk.",
      },
      {
        title: "Printbare Werkbladen & Oefeningen",
        desc: "Toegang tot een uitgebreide bibliotheek met schrijfoefeningen, klankkaarten en kleurplaten voor schermvrij leren thuis.",
      },
    ],
    safetyHeading: "Gebouwd Volgens Strikte COPPA & GDPR-K Normen",
    safetyDesc:
      "Kinderen kunnen zich niet registreren zonder geverifieerde toestemming van ouders. Geen advertenties, geen tracking en geen ongecontroleerde chat.",
    safetyLink: "Lees ons volledige Handvest Kindveiligheid",
    bottomHeading: "Sluit je aan bij duizenden gezinnen in 30+ landen",
    bottomDesc:
      "Geef je kind het waardevolle geschenk van de Koran en vloeiend Arabisch met docenten van Arabic Kids Academy.",
    bottomButton: "Start Vandaag met Aanmelden",
  },
  tr: {
    heroBadge: "Huzurlu ve Şeffaf Aile Ortaklığı",
    heroTitle: "Çocuğunuzun Eğitim Yolculuğunda Eksiksiz Şeffaflık",
    heroSubtitle:
      "Özel Veli Portalımız ile çocuğunuzun devam durumunu izleyin, ders kayıtlarını yeniden izleyin, kelime gelişimini takip edin ve öğretmenlerle doğrudan görüşün.",
    ctaRegister: "Ücretsiz Veli Hesabı Aç",
    ctaHow: "Nasıl Çalışır?",
    pillarsTag: "Veli Portalı Özellikleri",
    pillarsHeading: "Çocuğunuzun Arapça Başarısı İçin İhtiyacınız Olan Her Şey",
    pillars: [
      {
        title: "Gerçek Zamanlı Gelişim Takibi",
        desc: "Çocuğunuzun artan kelime sayısını, fonetik doğruluk puanlarını ve tamamlanan üniteleri canlı olarak izleyin.",
      },
      {
        title: "Ders Kayıtları ve Tekrar İzleme",
        desc: "Her canlı ders kaydedilir ve kaçırılan dersleri telafi etmek ya da tekrar etmek için 60 dakika içinde panelinizde hazır olur.",
      },
      {
        title: "Öğretmenle Doğrudan İletişim",
        desc: "Çocuğunuzun öğretmenine panel üzerinden mesaj gönderin, birebir veli görüşmesi talep edin ve ödev notlarını inceleyin.",
      },
      {
        title: "Yazdırılabilir Çalışma Kağıtları Kütüphanesi",
        desc: "Ekrandan bağımsız pratik için yazı alıştırmaları, harf izleme kartları ve eğitici boyama sayfalarından oluşan geniş kütüphane.",
      },
    ],
    safetyHeading: "COPPA ve GDPR-K Çocuk Güvenliği İlkeleri",
    safetyDesc:
      "Çocuklar ebeveyn onayı olmadan kayıt olamazlar. Kişisel veriler asla satılmaz, reklam amaçlı izlenmez ve denetimsiz sohbet odaları bulunmaz.",
    safetyLink: "Çocuk Güvenliği Sözleşmemizi Okuyun",
    bottomHeading: "30'dan Fazla Ülkede Binlerce Aileye Katılın",
    bottomDesc:
      "Çocuğunuza Kur'an-ı Kerim'i anlama ve Arapça'yı özgüvenle konuşma becerisini Arabic Kids Academy ile kazandırın.",
    bottomButton: "Bugün Kayıt Başlatın",
  },
  it: {
    heroBadge: "Serenità e Controllo Totale per la Famiglia",
    heroTitle: "Massima Trasparenza nel Percorso Formativo di Tuo Figlio",
    heroSubtitle:
      "Il nostro Portale Genitori ti garantisce pieno controllo: monitora le presenze, rivedi le registrazioni, segui l'apprendimento dei vocaboli e consulta i docenti certificati.",
    ctaRegister: "Crea Account Genitore Gratuito",
    ctaHow: "Come Funziona",
    pillarsTag: "Caratteristiche del Portale Genitori",
    pillarsHeading: "Tutto ciò che serve per coltivare l'arabo di tuo figlio",
    pillars: [
      {
        title: "Monitoraggio Progressi in Tempo Reale",
        desc: "Osserva la crescita del vocabolario, la precisione fonetica e il completamento delle unità didattiche in tempo reale.",
      },
      {
        title: "Registrazioni Complete e Replay",
        desc: "Ogni lezione dal vivo viene registrata ed è accessibile entro 60 minuti per ripassare o recuperare una lezione persa.",
      },
      {
        title: "Comunicazione Diretta con i Docenti",
        desc: "Invia messaggi protetti all'insegnante, prenota colloqui individuali e consulta le annotazioni sui compiti.",
      },
      {
        title: "Schede Didattiche Stampabili",
        desc: "Accedi a una ricca biblioteca di schede per esercitare la scrittura a mano, tracciamento delle lettere e disegni da colorare.",
      },
    ],
    safetyHeading: "Progettato a Norma COPPA e GDPR-K per i Minori",
    safetyDesc:
      "Nessun minore può registrarsi senza il consenso verificato di un adulto. Non cediamo dati a terzi, non mostriamo pubblicità né consentiamo chat non moderate.",
    safetyLink: "Leggi la nostra Carta della Sicurezza dei Minori",
    bottomHeading: "Unisciti a Migliaia di Famiglie in oltre 30 Paesi",
    bottomDesc:
      "Dona a tuo figlio il dono duraturo di comprendere il Corano e parlare l'arabo con orgoglio grazie ad Arabic Kids Academy.",
    bottomButton: "Inizia l'Iscrizione Oggi",
  },
  es: {
    heroBadge: "Tranquilidad y Protagonismo Familiar",
    heroTitle: "Visibilidad Total en el Recorrido Educativo de tu Hijo",
    heroSubtitle:
      "Nuestro Portal para Padres te brinda control total: supervisa la asistencia, mira las repeticiones de las clases, sigue el vocabulario y consulta a profesores certificados.",
    ctaRegister: "Crear Cuenta de Padres Gratuita",
    ctaHow: "Cómo Funciona",
    pillarsTag: "Características del Portal Familiar",
    pillarsHeading: "Todo lo que necesitas para potenciar el árabe de tu hijo",
    pillars: [
      {
        title: "Seguimiento de Hitos en Tiempo Real",
        desc: "Observa el crecimiento del vocabulario, la precisión de pronunciación y el avance en las unidades didácticas en tiempo real.",
      },
      {
        title: "Clases Grabadas y Repeticiones",
        desc: "Cada clase en directo queda grabada y disponible en tu panel en 60 minutos para repasar o recuperar sesiones perdidas.",
      },
      {
        title: "Comunicación Directa con los Docentes",
        desc: "Envía mensajes seguros al tutor, solicita tutorías individuales en videollamada y revisa los comentarios de cada tarea.",
      },
      {
        title: "Fichas de Trabajo y Actividades Imprimibles",
        desc: "Descarga cientos de fichas para caligrafía, trazado de letras y láminas para colorear lejos de las pantallas.",
      },
    ],
    safetyHeading: "Basado en la Protección de Menores COPPA y GDPR-K",
    safetyDesc:
      "Ningún menor puede registrarse sin el consentimiento explícito de un adulto. No vendemos datos personales ni permitimos chats directos no moderados.",
    safetyLink: "Lee Nuestra Carta de Seguridad Infantil",
    bottomHeading: "Únete a Miles de Familias en más de 30 Países",
    bottomDesc:
      "Dale a tu hijo el regalo para toda la vida de comprender el Corán y hablar árabe con orgullo en Arabic Kids Academy.",
    bottomButton: "Comenzar el Registro Hoy",
  },
};

export default async function ForParentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const validLocale: Locale = (["ar", "en", "nl", "tr", "it", "es"].includes(locale)
    ? locale
    : "en") as Locale;

  const t = FOR_PARENTS_I18N[validLocale];
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const icons = [
    <TrendingUp key="tu" className="w-8 h-8 text-brand-600" />,
    <Video key="vd" className="w-8 h-8 text-emerald-600" />,
    <MessageCircle key="mc" className="w-8 h-8 text-purple-600" />,
    <Printer key="pr" className="w-8 h-8 text-amber-600" />,
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 lg:py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <Heart className="w-4 h-4 text-pink-400" />
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
              href={`/${locale}/register`}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white gradient-brand rounded-2xl shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all"
            >
              <span>{t.ctaRegister}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}/how-it-works`}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all"
            >
              <span>{t.ctaHow}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Pillars for Parents */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
            {t.pillarsTag}
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t.pillarsHeading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {t.pillars.map((p, idx) => (
            <div
              key={idx}
              className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {icons[idx]}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {p.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Trust Banner */}
      <section className="bg-white border-y border-slate-200/80 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t.safetyHeading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.safetyDesc}
          </p>
          <div>
            <Link
              href={`/${locale}/child-safety`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              <span>{t.safetyLink}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gradient-to-r from-brand-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-brand-500/20">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
            {t.bottomHeading}
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            {t.bottomDesc}
          </p>
          <Link
            href={`/${locale}/register`}
            className="px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl shadow-lg hover:bg-slate-50 transition-all text-sm inline-flex items-center gap-2"
          >
            <span>{t.bottomButton}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
