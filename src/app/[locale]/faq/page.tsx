import React from "react";
import Link from "next/link";
import { type Locale, isRtlLocale } from "@/lib/localization";
import {
  HelpCircle,
  BookOpen,
  Video,
  CreditCard,
  ShieldCheck,
  Laptop,
} from "lucide-react";

interface FaqText {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  categories: Array<{
    id: string;
    name: string;
    questions: Array<{
      q: string;
      a: string;
    }>;
  }>;
  stillTitle: string;
  stillDesc: string;
  ctaContact: string;
  ctaInquiry: string;
}

const FAQ_I18N: Record<Locale, FaqText> = {
  ar: {
    heroBadge: "إجابات واضحة ومباشرة لكل تساؤلاتك",
    heroTitle: "الأسئلة الشائعة حول المنصة والبرامج",
    heroSubtitle:
      "جمعنا لك أكثر الأسئلة شيوعاً حول المناهج، الحصص المباشرة، خطط الأسعار، وأمان الطفل في Arabic Kids Academy.",
    categories: [
      {
        id: "curriculum",
        name: "المناهج والبرامج الأكاديمية",
        questions: [
          {
            q: "كيف يتم تنظيم البرامج الأكاديمية السبعة في الأكاديمية؟",
            a: "تغطي برامجنا التأسيس، طلاقة القراءة، الكتابة والخط العربي، المحادثة والنطق، الاستماع والفهم، القرآن والتجويد، والقيم الإسلامية. يتدرج كل برنامج وفق المستويات الأوروبية CEFR (من Pre-A1 إلى B2) مع أهداف مفردات وأنشطة أسبوعية محددة.",
          },
          {
            q: "ماذا لو كان طفلي لا يعرف أي حرف من حروف الهجاء العربية؟",
            a: "برنامج أساسيات اللغة العربية (Pre-A1) مصمم خصيصاً للمبتدئين تماماً من سن 4 إلى 8 سنوات. نستخدم ألعاب قطار الحروف، والتتبع التفاعلي، والأناشيد البصرية لبناء الوعي الصوتي والتعرف على أشكال الحروف بكل متعة وسهولة.",
          },
        ],
      },
      {
        id: "classes",
        name: "الحصص المباشرة والمواعيد",
        questions: [
          {
            q: "كم عدد الطلاب في كل مجموعة دراسية مباشرة؟",
            a: "تقتصر كل مجموعة مصغرة على 6 طلاب كحد أقصى. يضمن هذا الحجم المثالي حصول كل طفل على وقت تحدث كافٍ، ومشاركة تفاعلية نشطة، وتصحيح صوتي مباشر لمخارج الحروف.",
          },
          {
            q: "ماذا يحدث إذا فات طفلي موعد إحدى الحصص المجدولة؟",
            a: "يتم تسجيل جميع الحصص المباشرة تلقائياً وإتاحتها في لوحة تحكم ولي الأمر والطالب خلال ساعة واحدة من انتهاء الحصة. كما يمكن لولي الأمر طلب حصة تعويضية مع مجموعة موازية بسهولة.",
          },
        ],
      },
      {
        id: "tech",
        name: "المتطلبات التقنية والأجهزة",
        questions: [
          {
            q: "ما هي الأجهزة المطلوبة لحضور الحصص التفاعلية؟",
            a: "أي جهاز لوحي (آيباد أو أندرويد) أو حاسوب محمول أو مكتبي مزود بمتصفح حديث (كروم، سفاري، إيدج، فايرفوكس)، وميكروفون وكاميرا. لا يتطلب النظام تثبيت برامج خارجية معقدة.",
          },
        ],
      },
      {
        id: "billing",
        name: "الأسعار والاشتراكات والفوترة",
        questions: [
          {
            q: "هل توجد عقود طويلة الأجل أو رسوم إلغاء للاشتراك؟",
            a: "لا توجد أي عقود ملزمة. يتم تجديد الاشتراكات شهرياً، ويمكن إيقاف الاشتراك مؤقتاً أو إلغاؤه في أي وقت بضغطة زر من لوحة تحكم ولي الأمر، مع ضمان استرداد 100% خلال أول 14 يوماً.",
          },
        ],
      },
      {
        id: "safety",
        name: "أمان الطفل وخصوصية البيانات",
        questions: [
          {
            q: "كيف تضمن المنصة أمان طفلي وخصوصية بياناته؟",
            a: "تلتزم Arabic Kids Academy الصارمة بقوانين حماية خصوصية الأطفال COPPA وGDPR-K. يُمنع منعاً باتاً أي تواصل غير مراقب بين الطلاب. يخضع جميع المعلمين لتحريات وتدقيق أمني وأكاديمي شامل، وتُحفظ التسجيلات الصوتية في سحابة مشفرة خاصة.",
          },
        ],
      },
    ],
    stillTitle: "هل لا تزال لديك أسئلة لم تجد إجابتها هنا؟",
    stillDesc:
      "فريقنا الأكاديمي مستعد لمساعدتك والإجابة على كل استفساراتك حول طفلك.",
    ctaContact: "تواصل مع المستشار الأكاديمي",
    ctaInquiry: "طلب استشارة تسجيل",
  },
  en: {
    heroBadge: "Frequently Asked Questions",
    heroTitle: "Everything You Need to Know About Our Academy",
    heroSubtitle:
      "Find answers regarding our academic methodology, cohort schedules, pricing, and child safety at Arabic Kids Academy.",
    categories: [
      {
        id: "curriculum",
        name: "Curriculum & Programs",
        questions: [
          {
            q: "How are the 7 academic programs structured?",
            a: "Our programs cover Foundations, Reading Fluency, Writing & Calligraphy, Speaking & Pronunciation, Listening Comprehension, Quran & Tajweed, and Islamic Studies. Each program follows CEFR levels (Pre-A1 to B2) with progressive weekly milestones and vocabulary targets.",
          },
          {
            q: "What if my child does not know any Arabic letters?",
            a: "Our Arabic Foundations (Pre-A1) is specifically crafted for absolute beginners aged 4 to 8. We use the Phonics Arcade Studio, interactive tracing, and nursery songs to build letter shape recognition and sound associations without any stress.",
          },
        ],
      },
      {
        id: "classes",
        name: "Live Classes & Scheduling",
        questions: [
          {
            q: "How many students are in a live class?",
            a: "Every micro-cohort is strictly capped at a maximum of 6 students. This ensures that every child receives individualized speaking time, active participation, and direct phoneme feedback from the lead teacher.",
          },
          {
            q: "What happens if we miss a scheduled class?",
            a: "All live sessions are automatically recorded and accessible directly from the parent and student dashboards within 1 hour. Parents can also request a makeup lesson with another parallel micro-cohort via the dashboard.",
          },
        ],
      },
      {
        id: "tech",
        name: "Technical Requirements",
        questions: [
          {
            q: "What devices do we need to participate?",
            a: "Any tablet (iPad / Android), laptop, or desktop computer with a modern web browser (Chrome, Safari, Edge, Firefox), a microphone, and a webcam. No bulky third-party software installation is required.",
          },
        ],
      },
      {
        id: "billing",
        name: "Pricing & Invoicing",
        questions: [
          {
            q: "Is there a long-term contract or cancellation fee?",
            a: "No. Subscriptions are billed monthly and can be paused or cancelled at any time directly through the Parent Billing Portal. We also offer a 14-day 100% money-back guarantee on all plans.",
          },
        ],
      },
      {
        id: "safety",
        name: "Child Safety & Privacy",
        questions: [
          {
            q: "How does the platform ensure my child's safety?",
            a: "Arabic Kids Academy adheres strictly to COPPA and GDPR-K regulations. Students cannot send unmoderated direct messages to peers or strangers. All teachers undergo rigorous background vetting, and voice recordings are stored in private encrypted cloud vaults.",
          },
        ],
      },
    ],
    stillTitle: "Still have questions?",
    stillDesc:
      "Our academic team is always on standby to discuss your child's specific background and learning needs.",
    ctaContact: "Contact Academic Advisor",
    ctaInquiry: "Request Placement Inquiry",
  },
  nl: {
    heroBadge: "Veelgestelde Vragen",
    heroTitle: "Alles wat je moet weten over onze academie",
    heroSubtitle:
      "Vind antwoorden over onze leermethodologie, lesroosters, prijzen en kindveiligheid bij Arabic Kids Academy.",
    categories: [
      {
        id: "curriculum",
        name: "Curriculum & Lesprogramma's",
        questions: [
          {
            q: "Hoe zijn de 7 academische programma's opgebouwd?",
            a: "Onze programma's omvatten Basisvaardigheden, Vloeiend Lezen, Schrijven & Kalligrafie, Spreken & Uitspraak, Luistervaardigheid, Koran & Tajweed en Islamstudies, afgestemd op de CEFR-niveaus (Pre-A1 tot B2).",
          },
          {
            q: "Wat als mijn kind nog geen enkele Arabische letter kent?",
            a: "Onze Basiscursus Arabisch (Pre-A1) is speciaal ontworpen voor beginners van 4 tot 8 jaar. We gebruiken Phonics Arcade, interactieve oefeningen en kinderliedjes om speels letters te leren herkennen.",
          },
        ],
      },
      {
        id: "classes",
        name: "Live Lessen & Planning",
        questions: [
          {
            q: "Hoeveel leerlingen zitten er in een live lesgroep?",
            a: "Elke microgroep heeft een strikt maximum van 6 leerlingen. Zo garanderen we persoonlijke spreektijd, actieve deelname en directe uitspraakcorrectie van de leerkracht.",
          },
          {
            q: "Wat gebeurt er als we een geplande les missen?",
            a: "Alle live lessen worden automatisch opgenomen en binnen 1 uur beschikbaar gesteld in het dashboard. Ouders kunnen ook eenvoudig een inhaalles aanvragen.",
          },
        ],
      },
      {
        id: "tech",
        name: "Technische Vereisten",
        questions: [
          {
            q: "Welke apparaten hebben we nodig voor de lessen?",
            a: "Elke tablet (iPad/Android), laptop of computer met een moderne webbrowser (Chrome, Safari, Edge), microfoon en webcam volstaat. Installatie van zware software is niet nodig.",
          },
        ],
      },
      {
        id: "billing",
        name: "Prijzen & Abonnementen",
        questions: [
          {
            q: "Zit ik vast aan een langdurig contract of opzegkosten?",
            a: "Nee, alle abonnementen worden maandelijks gefactureerd en kunnen op elk moment worden gepauzeerd of opgezegd via het ouderportaal, inclusief een 14-dagen geld-terug-garantie.",
          },
        ],
      },
      {
        id: "safety",
        name: "Kindveiligheid & Privacy",
        questions: [
          {
            q: "Hoe waarborgt het platform de veiligheid van mijn kind?",
            a: "Arabic Kids Academy voldoet strikt aan COPPA en GDPR-K. Leerlingen kunnen geen ongecontroleerde privéberichten sturen, docenten worden streng gescreend en audio wordt versleuteld opgeslagen.",
          },
        ],
      },
    ],
    stillTitle: "Heb je nog andere vragen?",
    stillDesc:
      "Ons academisch team staat klaar om de leerbehoeften van jouw kind persoonlijk te bespreken.",
    ctaContact: "Neem contact op met studieadviseur",
    ctaInquiry: "Vraag plaatsingsadvies aan",
  },
  tr: {
    heroBadge: "Sıkça Sorulan Sorular",
    heroTitle: "Akademimiz Hakkında Bilmeniz Gereken Her Şey",
    heroSubtitle:
      "Arabic Kids Academy'de eğitim metodolojisi, ders saatleri, fiyatlar ve çocuk güvenliği hakkında tüm yanıtları bulun.",
    categories: [
      {
        id: "curriculum",
        name: "Müfredat ve Programlar",
        questions: [
          {
            q: "7 akademik program nasıl yapılandırılmıştır?",
            a: "Programlarımız Temel Eğitim, Akıcı Okuma, Yazı ve Hat, Konuşma ve Telaffuz, Dinleme ve Anlama, Kuran ve Tecvid ile İslami İlimler alanlarını kapsar. Tüm seviyeler CEFR (Pre-A1'den B2'ye) standartlarına uygundur.",
          },
          {
            q: "Çocuğum hiç Arapça harf bilmiyorsa ne yapmalıyız?",
            a: "Arapça Temelleri (Pre-A1) programımız 4-8 yaş arası yeni başlayan çocuklar için özel olarak geliştirilmiştir. Harf tanıma oyunları ve interaktif çizimlerle stressiz bir başlangıç sağlar.",
          },
        ],
      },
      {
        id: "classes",
        name: "Canlı Dersler ve Zaman Çizelgesi",
        questions: [
          {
            q: "Canlı bir sınıfta kaç öğrenci bulunur?",
            a: "Her mikro grup kesinlikle en fazla 6 öğrenciden oluşur. Bu sayede her çocuk yeterli konuşma süresi ve öğretmenden birebir telaffuz geri bildirimi alır.",
          },
          {
            q: "Planlanmış bir dersi kaçırırsak ne olur?",
            a: "Tüm canlı dersler otomatik olarak kaydedilir ve 1 saat içinde veli ve öğrenci panelinde izlenebilir. Ayrıca telafi dersi talebinde bulunabilirsiniz.",
          },
        ],
      },
      {
        id: "tech",
        name: "Teknik Gereksinimler",
        questions: [
          {
            q: "Derslere katılmak için hangi cihazlar gereklidir?",
            a: "Güncel bir web tarayıcısına (Chrome, Safari, Edge), mikrofona ve kameraya sahip herhangi bir tablet (iPad/Android), dizüstü veya masaüstü bilgisayar yeterlidir.",
          },
        ],
      },
      {
        id: "billing",
        name: "Fiyatlandırma ve Faturalandırma",
        questions: [
          {
            q: "Uzun vadeli sözleşme veya iptal ücreti var mı?",
            a: "Hayır. Abonelikler aylık olarak yenilenir ve veli portalından tek tıkla durdurulabilir veya iptal edilebilir. Ayrıca 14 günlük %100 para iade garantimiz mevcuttur.",
          },
        ],
      },
      {
        id: "safety",
        name: "Çocuk Güvenliği ve Gizlilik",
        questions: [
          {
            q: "Platform çocuğumun güvenliğini nasıl sağlar?",
            a: "Arabic Kids Academy, COPPA ve GDPR-K çocuk güvenliği kurallarına kesin olarak uyar. Öğrenciler arası denetimsiz mesajlaşma yasaktır, tüm öğretmenler adli sicil taramasından geçer ve ses kayıtları şifreli bulutta saklanır.",
          },
        ],
      },
    ],
    stillTitle: "Hâlâ sorularınız mı var?",
    stillDesc:
      "Eğitim danışmanlarımız çocuğunuzun seviyesine ve hedeflerine en uygun yolu belirlemek için hazır bekliyor.",
    ctaContact: "Eğitim Danışmanına Ulaşın",
    ctaInquiry: "Seviye Tespiti Danışmanlığı İsteyin",
  },
  it: {
    heroBadge: "Domande Frequenti",
    heroTitle: "Tutto quello che c'è da sapere sulla nostra accademia",
    heroSubtitle:
      "Trova risposte su metodologia pedagogica, orari dei corsi, prezzi e sicurezza dei bambini presso Arabic Kids Academy.",
    categories: [
      {
        id: "curriculum",
        name: "Curriculum e Programmi",
        questions: [
          {
            q: "Come sono strutturati i 7 programmi accademici?",
            a: "I nostri percorsi coprono Fondamenti, Fluenza nella Lettura, Scrittura e Calligrafia, Parlato e Pronuncia, Ascolto, Corano con Tajweed e Studi Islamici, secondo il quadro QCER (Pre-A1 a B2).",
          },
          {
            q: "E se mio figlio non conosce ancora le lettere arabe?",
            a: "Il percorso Fondamenti di Arabo (Pre-A1) è studiato per principianti assoluti dai 4 agli 8 anni con giochi interattivi, filastrocche e lavagne digitali per apprendere senza alcuno stress.",
          },
        ],
      },
      {
        id: "classes",
        name: "Lezioni dal Vivo e Orari",
        questions: [
          {
            q: "Quanti studenti partecipano a una lezione dal vivo?",
            a: "Ogni micro-gruppo è limitato a un massimo di 6 studenti per garantire a ciascuno tempo di conversazione dedicato e correzione immediata della pronuncia.",
          },
          {
            q: "Cosa succede se perdiamo una lezione programmata?",
            a: "Tutte le lezioni vengono registrate automaticamente e rese disponibili nel portale entro 1 ora. I genitori possono anche richiedere una lezione di recupero.",
          },
        ],
      },
      {
        id: "tech",
        name: "Requisiti Tecnici",
        questions: [
          {
            q: "Quali dispositivi sono necessari per partecipare?",
            a: "Qualsiasi tablet (iPad/Android), computer portatile o fisso con browser moderno (Chrome, Safari, Edge), microfono e webcam. Nessun software pesante da installare.",
          },
        ],
      },
      {
        id: "billing",
        name: "Tariffe e Fatturazione",
        questions: [
          {
            q: "Ci sono vincoli contrattuali a lungo termine?",
            a: "No. Gli abbonamenti sono mensili e possono essere sospesi o annullati in ogni momento dal portale genitori, con garanzia di rimborso al 100% entro 14 giorni.",
          },
        ],
      },
      {
        id: "safety",
        name: "Sicurezza e Privacy dei Minori",
        questions: [
          {
            q: "Come garantisce la piattaforma la sicurezza di mio figlio?",
            a: "Arabic Kids Academy rispetta rigorosamente i regolamenti COPPA e GDPR-K. È vietata ogni chat diretta non supervisionata, gli insegnanti sono verificati e i dati vocali sono protetti.",
          },
        ],
      },
    ],
    stillTitle: "Hai ancora dubbi o domande?",
    stillDesc:
      "Il nostro team accademico è a disposizione per valutare le esigenze specifiche di tuo figlio.",
    ctaContact: "Contatta un consulente accademico",
    ctaInquiry: "Richiedi orientamento all'iscrizione",
  },
  es: {
    heroBadge: "Preguntas Frecuentes",
    heroTitle: "Todo lo que necesitas saber sobre nuestra academia",
    heroSubtitle:
      "Encuentra respuestas sobre metodología académica, horarios, tarifas y seguridad infantil en Arabic Kids Academy.",
    categories: [
      {
        id: "curriculum",
        name: "Currículo y Programas",
        questions: [
          {
            q: "¿Cómo están estructurados los 7 programas académicos?",
            a: "Nuestros programas cubren Fundamentos, Fluidez Lectora, Escritura y Caligrafía, Conversación y Pronunciación, Comprensión Auditiva, Corán y Taywid y Estudios Islámicos, siguiendo los niveles del MCER (Pre-A1 a B2).",
          },
          {
            q: "¿Qué pasa si mi hijo no conoce ninguna letra del alfabeto árabe?",
            a: "Nuestro programa Fundamentos de Árabe (Pre-A1) está diseñado especialmente para principiantes de 4 a 8 años, empleando juegos interactivos y canciones para reconocer formas y sonidos sin esfuerzo.",
          },
        ],
      },
      {
        id: "classes",
        name: "Clases en Directo y Horarios",
        questions: [
          {
            q: "¿Cuántos alumnos hay en cada clase en directo?",
            a: "Cada microgrupo tiene un cupo estrictamente limitado a 6 alumnos. Esto garantiza tiempo suficiente de práctica oral y corrección fonética personalizada con el docente.",
          },
          {
            q: "¿Qué ocurre si nos perdemos una clase programada?",
            a: "Todas las sesiones se graban automáticamente y quedan disponibles en el panel de padres en menos de 1 hora. También se puede solicitar una clase de recuperación.",
          },
        ],
      },
      {
        id: "tech",
        name: "Requisitos Técnicos",
        questions: [
          {
            q: "¿Qué dispositivos se necesitan para participar?",
            a: "Cualquier tablet (iPad/Android), portátil o PC de sobremesa con navegador moderno (Chrome, Safari, Edge), micrófono y cámara. No se requiere instalar software adicional.",
          },
        ],
      },
      {
        id: "billing",
        name: "Precios y Facturación",
        questions: [
          {
            q: "¿Existe compromiso de permanencia o cuota de cancelación?",
            a: "No. Las suscripciones son mensuales y pueden pausarse o cancelarse en cualquier momento desde el portal de facturación, con garantía de devolución del 100% durante 14 días.",
          },
        ],
      },
      {
        id: "safety",
        name: "Seguridad Infantil y Privacidad",
        questions: [
          {
            q: "¿Cómo garantiza la plataforma la seguridad de mi hijo?",
            a: "Arabic Kids Academy cumple estrictamente con las leyes COPPA y GDPR-K. No hay chat directo entre alumnos, los docentes pasan verificación de antecedentes y las grabaciones están cifradas.",
          },
        ],
      },
    ],
    stillTitle: "¿Aún tienes dudas?",
    stillDesc:
      "Nuestro equipo pedagógico está a tu disposición para orientarte sobre las necesidades específicas de tu hijo.",
    ctaContact: "Contactar con asesor académico",
    ctaInquiry: "Solicitar consulta de nivel",
  },
};

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale: Locale = (["ar", "en", "nl", "tr", "it", "es"].includes(locale)
    ? locale
    : "en") as Locale;

  const t = FAQ_I18N[validLocale];

  const categoryIcons: Record<string, React.ReactNode> = {
    curriculum: <BookOpen className="w-5 h-5 text-brand-600" />,
    classes: <Video className="w-5 h-5 text-emerald-600" />,
    tech: <Laptop className="w-5 h-5 text-purple-600" />,
    billing: <CreditCard className="w-5 h-5 text-amber-600" />,
    safety: <ShieldCheck className="w-5 h-5 text-pink-600" />,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <HelpCircle className="w-4 h-4 text-brand-400" />
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

      {/* FAQ Categories & Questions */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-12">
          {t.categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                  {categoryIcons[cat.id]}
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {cat.name}
                </h2>
              </div>

              <div className="space-y-4">
                {cat.questions.map((item, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-base font-bold text-slate-900 flex items-start justify-between gap-4">
                      <span>{item.q}</span>
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed pt-1">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions banner */}
        <div className="mt-16 p-8 bg-brand-50 border border-brand-200 rounded-3xl text-center space-y-4">
          <h3 className="text-lg font-bold text-brand-950">
            {t.stillTitle}
          </h3>
          <p className="text-sm text-brand-800 max-w-md mx-auto">
            {t.stillDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href={`/${locale}/contact`}
              className="px-6 py-3 gradient-brand text-white text-sm font-bold rounded-xl shadow-sm hover:opacity-95 transition-all"
            >
              {t.ctaContact}
            </Link>
            <Link
              href={`/${locale}/inquiry`}
              className="px-6 py-3 bg-white text-brand-700 border border-brand-300 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              {t.ctaInquiry}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
