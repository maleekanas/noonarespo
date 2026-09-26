import React from "react";
import Link from "next/link";
import { type Locale, isRtlLocale } from "@/lib/localization";
import {
  Sparkles,
  Award,
  Globe2,
  ShieldCheck,
  Heart,
  Users,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface AboutText {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  valuesTag: string;
  valuesHeading: string;
  values: Array<{
    title: string;
    desc: string;
  }>;
  facultyTag: string;
  facultyHeading: string;
  faculty: Array<{
    name: string;
    role: string;
    exp: string;
  }>;
  stats: {
    students: string;
    countries: string;
    teachers: string;
    satisfaction: string;
  };
  ctaButton: string;
}

const ABOUT_I18N: Record<Locale, AboutText> = {
  ar: {
    heroBadge: "أكاديمية عالمية متخصصة في تعليم الأطفال",
    heroTitle: "نبني جيلاً يعتز بلغته، ويفهم قرآنه، ويتحدث بفصاحة",
    heroSubtitle:
      "تأسست Arabic Kids Academy لتكون الجسر التربوي والتعليمي الذي يربط أبناءنا في المهجر والشتات بلغتهم الأم وقيمهم الإسلامية من خلال أحدث تقنيات التعليم الرقمي التفاعلي.",
    valuesTag: "مبادئنا التربوية",
    valuesHeading: "ما يميز Arabic Kids Academy",
    values: [
      {
        title: "أولوية مطلقة لسلامة الطفل وخصوصيته",
        desc: "صُممت المنصة وفق أعلى معايير الخصوصية العالمية COPPA وGDPR-K. لا رسائل غير خاضعة للإشراف، تسجيلات مشفرة، ومعلمون معتمدون بعد تدقيق أمني وأكاديمي شامل.",
      },
      {
        title: "منهجية أكاديمية معتمدة وفق معايير CEFR",
        desc: "تتوافق برامجنا الأكاديمية السبعة مع الإطار الأوروبي المرجعي المشترك للغات (من Pre-A1 إلى B2)، مما يضمن مخرجات تعليمية قابلة للقياس والاعتماد الدولي.",
      },
      {
        title: "غرس القيم الإسلامية والهوية الثقافية",
        desc: "نغرس في نفوس أطفالنا حب لغة القرآن وقيم الأدب الإسلامي من خلال قصص الأنبياء والتراث العربي الأصيل بطريقة محببة وعصرية.",
      },
      {
        title: "شراكة كاملة وشفافية تامة مع الأسرة",
        desc: "الأسرة شريك أساسي في النجاح. نوفر تقارير أسبوعية تفصيلية، وتسجيلات كاملة للحصص، وخطوط تواصل مباشرة مع المعلمين.",
      },
    ],
    facultyTag: "الهيئة التعليمية المعتمدة",
    facultyHeading: "نخبة من معلمي الطفولة وتجويد القرآن الكريم",
    faculty: [
      {
        name: "الأستاذ أحمد المنصوري",
        role: "كبير معلمي القراءة والتجويد",
        exp: "أكثر من 12 عاماً في تعليم الأصوات القرائية والقراءات العشر",
      },
      {
        name: "الأستاذة فاطمة الزهراء الشامي",
        role: "أخصائية الخط العربي وأدب الطفل",
        exp: "9 سنوات في تعليم خط النسخ وتأليف القصص المصورة للأطفال",
      },
      {
        name: "الشيخ محمود الأزهري",
        role: "رئيس قسم الدراسات القرآنية والقيم",
        exp: "15 عاماً في تدريس التجويد التطبيقي والسيرة النبوية للأجيال",
      },
      {
        name: "الأستاذة ليلى نور الدين",
        role: "مشرفة التأسيس والطلاقة الشفهية",
        exp: "8 سنوات في تطوير الوعي الصوتي المبكر والطلاقة الحوارية",
      },
    ],
    stats: {
      students: "طالب نشط حول العالم",
      countries: "دولة في أوروبا وأمريكا",
      teachers: "معلم معتمد بدوام كامل",
      satisfaction: "نسبة رضا أولياء الأمور",
    },
    ctaButton: "استكشف البرامج الأكاديمية السبعة",
  },
  en: {
    heroBadge: "Serving Muslim & Arabic-Learning Families Worldwide",
    heroTitle: "Building a Generation that Speaks Arabic with Pride & Love",
    heroSubtitle:
      "Arabic Kids Academy was founded to be the premier educational bridge connecting children in diaspora to their heritage language, the Holy Quran, and authentic values through interactive technology.",
    valuesTag: "Our Core Educational Principles",
    valuesHeading: "Why Families Across 30+ Countries Trust Arabic Kids Academy",
    values: [
      {
        title: "Child-Safety & Privacy Centric",
        desc: "Engineered from the ground up to comply with COPPA and GDPR-K. No unmoderated peer messaging, encrypted voice recordings, and strictly vetted educators.",
      },
      {
        title: "Accredited CEFR Pedagogy",
        desc: "Our 7 academic programs map directly to Common European Framework of Reference levels (Pre-A1 to B2), ensuring measurable milestones and international recognition.",
      },
      {
        title: "Authentic Cultural & Islamic Values",
        desc: "We nurture a genuine love for Arabic and Quranic recitation through inspiring stories of prophets, noble virtues, and rich Arab cultural heritage.",
      },
      {
        title: "Total Parent Transparency",
        desc: "Parents are our partners. We provide weekly milestone summaries, recorded lesson access, and direct advisory channels with lead instructors.",
      },
    ],
    facultyTag: "Certified Specialist Educators",
    facultyHeading: "Passionate Mentors Dedicated to Your Child's Success",
    faculty: [
      {
        name: "Ustadh Ahmed Al-Mansouri",
        role: "Senior Reading & Tajweed Specialist",
        exp: "12+ years experience in children's phonics & Ten Qira'at",
      },
      {
        name: "Ustadha Fatima Al-Zahra",
        role: "Calligraphy & Early Childhood Specialist",
        exp: "9+ years in Naskh penmanship & Arabic children's literature",
      },
      {
        name: "Sheikh Mahmoud Al-Azhari",
        role: "Head of Quranic & Islamic Studies",
        exp: "15+ years teaching applied Tajweed & prophetic biography",
      },
      {
        name: "Ustadha Layla Nour El-Din",
        role: "Foundations & Speech Fluency Lead",
        exp: "8+ years in early phonemic awareness & conversational fluency",
      },
    ],
    stats: {
      students: "Active Students Globally",
      countries: "Countries in Diaspora",
      teachers: "Certified Native Teachers",
      satisfaction: "Parent Satisfaction Rate",
    },
    ctaButton: "Explore The 7 Academic Programs",
  },
  nl: {
    heroBadge: "Voor gezinnen wereldwijd die Arabisch en Koran leren",
    heroTitle: "Bouwen aan een generatie die Arabisch spreekt met trots en liefde",
    heroSubtitle:
      "Arabic Kids Academy is opgericht als dé educatieve brug om kinderen in de diaspora te verbinden met hun moedertaal, de Heilige Koran en authentieke waarden via interactieve digitale technologie.",
    valuesTag: "Onze Pedagogische Principes",
    valuesHeading: "Waarom gezinnen in 30+ landen Arabic Kids Academy vertrouwen",
    values: [
      {
        title: "Kindveiligheid & Privacy Centraal",
        desc: "Vanaf de basis ontwikkeld conform COPPA en GDPR-K. Geen ongecontroleerde berichten, versleutelde audio en grondig gescreende leerkrachten.",
      },
      {
        title: "Erkende CEFR-Methodologie",
        desc: "Onze 7 programma's sluiten aan op het Europees Referentiekader (Pre-A1 tot B2), met meetbare vooruitgang en internationale erkenning.",
      },
      {
        title: "Authentieke Culturele & Islamitische Waarden",
        desc: "We wekken liefde voor Arabisch en Koranrecitatie via inspirerende verhalen van profeten en rijk cultureel erfgoed.",
      },
      {
        title: "Volledige Transparantie voor Ouders",
        desc: "Ouders zijn onze partners. Wekelijkse voortgangsrapporten, toegang tot lesopnames en direct contact met docenten.",
      },
    ],
    facultyTag: "Gecertificeerde Vakdocenten",
    facultyHeading: "Toegewijde mentoren voor het succes van jouw kind",
    faculty: [
      {
        name: "Ustadh Ahmed Al-Mansouri",
        role: "Hoofddocent Lezen & Tajweed",
        exp: "12+ jaar ervaring in klankleer voor kinderen & de Tien Recitatiewijzen",
      },
      {
        name: "Ustadha Fatima Al-Zahra",
        role: "Specialist Kalligrafie & Vroegschoolse Educatie",
        exp: "9+ jaar in Naskh-schoonschrift & Arabische jeugdliteratuur",
      },
      {
        name: "Sheikh Mahmoud Al-Azhari",
        role: "Hoofd Koran- & Islamstudies",
        exp: "15+ jaar ervaring in toegepaste Tajweed & profetische biografie",
      },
      {
        name: "Ustadha Layla Nour El-Din",
        role: "Coördinator Basisvaardigheden & Spreekvaardigheid",
        exp: "8+ jaar in fonemisch bewustzijn & gespreksvaardigheid",
      },
    ],
    stats: {
      students: "Actieve leerlingen wereldwijd",
      countries: "Landen in de diaspora",
      teachers: "Gecertificeerde native docenten",
      satisfaction: "Tevredenheidsscore ouders",
    },
    ctaButton: "Ontdek de 7 Academische Programma's",
  },
  tr: {
    heroBadge: "Dünya Çapında Çocuklar İçin Arapça ve Kuran Eğitimi",
    heroTitle: "Arapça'yı Sevgi ve Özgüvenle Konuşan Bir Nesil Yetiştiriyoruz",
    heroSubtitle:
      "Arabic Kids Academy, gurbetteki çocukları anadillerine, Kur'an-ı Kerim'e ve köklü ahlaki değerlere modern etkileşimli eğitimle bağlamak amacıyla kurulmuştur.",
    valuesTag: "Temel Eğitim İlkelerimiz",
    valuesHeading: "30'dan Fazla Ülkede Ailelerin Arabic Kids Academy'yi Tercih Etme Sebebi",
    values: [
      {
        title: "Çocuk Güvenliği ve Gizlilik Odaklılık",
        desc: "COPPA ve GDPR-K standartlarına tam uyumlu. Denetimsiz mesajlaşma engellidir, ses kayıtları şifrelenir ve tüm öğretmenler güvenlik taramasından geçer.",
      },
      {
        title: "Akredite CEFR Standartları",
        desc: "7 akademik programımız Avrupa Dil Portfölü (Pre-A1'den B2'ye) seviyeleriyle tam uyumlu olup ölçülebilir gelişim hedefleri sunar.",
      },
      {
        title: "Özgün Kültürel ve İslami Değerler",
        desc: "Peygamberler tarihi, ahlaki erdemler ve zengin Arap kültürü anlatılarıyla çocuklarda dil ve Kuran sevgisini pekiştiriyoruz.",
      },
      {
        title: "Ebeveynlerle Tam Şeffaflık ve İş Birliği",
        desc: "Aileler en önemli ortağımızdır. Haftalık gelişim raporları, ders kayıtlarına erişim ve öğretmenlerle doğrudan iletişim sağlıyoruz.",
      },
    ],
    facultyTag: "Sertifikalı Uzman Öğretmen Kadrosu",
    facultyHeading: "Çocuğunuzun Başarısına Adanmış Deneyimli Eğitmenler",
    faculty: [
      {
        name: "Üstat Ahmed El-Mansuri",
        role: "Kıdemli Okuma ve Tecvid Uzmanı",
        exp: "Çocuk fonetiği ve Aşere Kıraat alanında 12+ yıllık deneyim",
      },
      {
        name: "Üstaze Fatıma Ez-Zehra",
        role: "Hat Sanatı ve Erken Çocukluk Uzmanı",
        exp: "Nesih hattı ve çocuk edebiyatı alanında 9+ yıllık deneyim",
      },
      {
        name: "Şeyh Mahmud El-Ezheri",
        role: "Kuran ve İslami İlimler Bölüm Başkanı",
        exp: "Uygulamalı Tecvid ve Siyer öğretiminde 15+ yıllık deneyim",
      },
      {
        name: "Üstaze Leyla Nurüddin",
        role: "Temel Seviye ve Konuşma Akıcılığı Lideri",
        exp: "Erken fonetik farkındalık ve akıcı konuşmada 8+ yıllık deneyim",
      },
    ],
    stats: {
      students: "Dünya Çapında Aktif Öğrenci",
      countries: "Gurbette Eğitim Verilen Ülke",
      teachers: "Tam Zamanlı Sertifikalı Eğitmen",
      satisfaction: "Veli Memnuniyet Oranı",
    },
    ctaButton: "7 Akademik Programı Keşfedin",
  },
  it: {
    heroBadge: "Al servizio delle famiglie nel mondo per l'apprendimento dell'arabo",
    heroTitle: "Cresciamo una generazione che parla l'arabo con orgoglio e amore",
    heroSubtitle:
      "Arabic Kids Academy è nata come ponte educativo per connettere i bambini nella diaspora alla loro lingua madre, al Sacro Corano e a valori autentici attraverso le tecnologie digitali più moderne.",
    valuesTag: "I Nostri Principi Educativi",
    valuesHeading: "Perché le famiglie in oltre 30 paesi si affidano ad Arabic Kids Academy",
    values: [
      {
        title: "Sicurezza e Privacy del Bambino al Centro",
        desc: "Piattaforma conforme alle normative COPPA e GDPR-K. Nessun messaggio non moderato, registrazioni audio crittografate e insegnanti rigorosamente verificati.",
      },
      {
        title: "Didattica Accreditata CEFR",
        desc: "I nostri 7 percorsi accademici si allineano al Quadro Comune Europeo (Pre-A1 a B2), garantendo progressi misurabili e certificati.",
      },
      {
        title: "Valori Culturali e Islamici Autentici",
        desc: "Coltiviamo l'amore per l'arabo e il Corano attraverso le storie dei profeti, virtù nobili e la ricchezza del patrimonio culturale arabo.",
      },
      {
        title: "Trasparenza Totale con i Genitori",
        desc: "La famiglia è partner essenziale. Forniamo report settimanali, registrazioni integrali delle lezioni e canali diretti con i docenti.",
      },
    ],
    facultyTag: "Corpo Docente Certificato",
    facultyHeading: "Mentori appassionati dedicati al successo di tuo figlio",
    faculty: [
      {
        name: "Ustadh Ahmed Al-Mansouri",
        role: "Specialista Senior di Lettura e Tajweed",
        exp: "Oltre 12 anni di esperienza nella fonetica per bambini e nelle Dieci Letture",
      },
      {
        name: "Ustadha Fatima Al-Zahra",
        role: "Specialista in Calligrafia e Infanzia",
        exp: "9 anni di insegnamento dello stile Naskh e letteratura illustrata per l'infanzia",
      },
      {
        name: "Sheikh Mahmoud Al-Azhari",
        role: "Responsabile Studi Coranici e Valori",
        exp: "15 anni di insegnamento del Tajweed applicato e della biografia profetica",
      },
      {
        name: "Ustadha Layla Nour El-Din",
        role: "Coordinatrice Fondamenti e Fluenza Orale",
        exp: "8 anni di esperienza nella consapevolezza fonologica e fluidità verbale",
      },
    ],
    stats: {
      students: "Studenti attivi nel mondo",
      countries: "Paesi nella diaspora",
      teachers: "Docenti madrelingua certificati",
      satisfaction: "Tasso di soddisfazione genitori",
    },
    ctaButton: "Esplora i 7 Percorsi Accademici",
  },
  es: {
    heroBadge: "Al servicio de las familias de todo el mundo en el aprendizaje del árabe",
    heroTitle: "Construyendo una generación que habla árabe con orgullo y amor",
    heroSubtitle:
      "Arabic Kids Academy fue fundada como el puente educativo para conectar a los niños en la diáspora con su lengua materna, el Sagrado Corán y valores auténticos mediante tecnología interactiva de vanguardia.",
    valuesTag: "Nuestros Principios Educativos",
    valuesHeading: "Por qué familias de más de 30 países confían en Arabic Kids Academy",
    values: [
      {
        title: "Seguridad y Privacidad Infantil Prioritaria",
        desc: "Diseñado para cumplir con COPPA y GDPR-K. Sin mensajería no supervisada, grabaciones de voz cifradas y docentes rigurosamente verificados.",
      },
      {
        title: "Metodología Acreditada CEFR",
        desc: "Nuestros 7 programas académicos se alinean con el Marco Común Europeo (Pre-A1 a B2), garantizando hitos medibles y reconocimiento internacional.",
      },
      {
        title: "Valores Culturales e Islámicos Auténticos",
        desc: "Inspiramos el amor por el árabe y el Corán mediante relatos de profetas, virtudes nobles y el rico patrimonio cultural árabe.",
      },
      {
        title: "Transparencia Total con las Familias",
        desc: "Los padres son nuestros aliados. Ofrecemos resúmenes semanales de progreso, acceso a clases grabadas y comunicación directa con los tutores.",
      },
    ],
    facultyTag: "Profesorado Especialista Certificado",
    facultyHeading: "Mentores apasionados dedicados al éxito de tu hijo",
    faculty: [
      {
        name: "Ustadh Ahmed Al-Mansouri",
        role: "Especialista Senior en Lectura y Taywid",
        exp: "Más de 12 años de experiencia en fonética infantil y las Diez Qira'at",
      },
      {
        name: "Ustadha Fatima Al-Zahra",
        role: "Especialista en Caligrafía y Primera Infancia",
        exp: "9 años de docencia en caligrafía Nasj y literatura infantil árabe",
      },
      {
        name: "Sheikh Mahmoud Al-Azhari",
        role: "Director de Estudios Coránicos y Valores",
        exp: "15 años enseñando Taywid aplicado y biografía profética a jóvenes",
      },
      {
        name: "Ustadha Layla Nour El-Din",
        role: "Supervisora de Fundamentos y Fluidez Oral",
        exp: "8 años desarrollando conciencia fonológica temprana y conversación",
      },
    ],
    stats: {
      students: "Alumnos activos en el mundo",
      countries: "Países en la diáspora",
      teachers: "Profesores nativos certificados",
      satisfaction: "Satisfacción de los padres",
    },
    ctaButton: "Explorar los 7 Programas Académicos",
  },
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const validLocale: Locale = (["ar", "en", "nl", "tr", "it", "es"].includes(locale)
    ? locale
    : "en") as Locale;

  const t = ABOUT_I18N[validLocale];
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const icons = [
    <ShieldCheck key="sc" className="w-8 h-8 text-emerald-600" />,
    <Award key="aw" className="w-8 h-8 text-brand-600" />,
    <Heart key="ht" className="w-8 h-8 text-pink-600" />,
    <Users key="us" className="w-8 h-8 text-purple-600" />,
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 lg:py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <Globe2 className="w-4 h-4 text-brand-400" />
            <span>{t.heroBadge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-white">
            {t.heroTitle}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
            {t.valuesTag}
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t.valuesHeading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {t.values.map((v, idx) => (
            <div
              key={idx}
              className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                {icons[idx]}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {v.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Certified Faculty Showcase */}
      <section className="bg-white border-y border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              {t.facultyTag}
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t.facultyHeading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.faculty.map((f, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-slate-200 bg-slate-50/60 shadow-sm space-y-3 text-center"
              >
                <div className="w-16 h-16 rounded-full gradient-brand text-white mx-auto flex items-center justify-center font-bold text-lg shadow-md shadow-brand-500/20">
                  {f.name[0]}
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {f.name}
                </h3>
                <p className="text-xs font-bold text-brand-600">
                  {f.role}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {f.exp}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Impact Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-slate-900 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 sm:p-14 text-white shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-5xl font-black text-brand-400 mb-2">5,000+</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                {t.stats.students}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-emerald-400 mb-2">30+</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                {t.stats.countries}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-amber-400 mb-2">150+</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                {t.stats.teachers}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-purple-400 mb-2">98%</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                {t.stats.satisfaction}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href={`/${locale}/programs`}
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white gradient-brand rounded-2xl shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all"
          >
            <span>{t.ctaButton}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
