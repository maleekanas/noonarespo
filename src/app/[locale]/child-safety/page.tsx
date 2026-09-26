import React from "react";
import { type Locale } from "@/lib/localization";
import {
  ShieldCheck,
  Lock,
  Eye,
  UserCheck,
  FileCheck,
  Database,
  Mail,
} from "lucide-react";

interface ChildSafetyText {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  guarantees: Array<{
    title: string;
    desc: string;
  }>;
  officerBadge: string;
  officerTitle: string;
  officerDesc: string;
}

const CHILD_SAFETY_I18N: Record<Locale, ChildSafetyText> = {
  ar: {
    heroBadge: "ميثاق الأمان وحماية بيانات الأطفال",
    heroTitle: "بيئة تعليمية آمنة ومحمية لطفلك 100%",
    heroSubtitle:
      "نضع سلامة وأمان طفلك النفسي والرقمي فوق كل اعتبار. تعرف على الإجراءات التقنية والأمنية التي نطبقها يومياً.",
    guarantees: [
      {
        title: "1. إشراف الوالدين والتحقق من موافقة البالغين",
        desc: "لا يُسمح للأطفال بإنشاء حسابات بشكل مستقل. يجب أن يتم التسجيل وتفعيله من قِبل ولي أمر بالغ ومُتحقق من هويته مع تقديم الموافقة الصريحة.",
      },
      {
        title: "2. منع تام للرسائل الخاصة والمباشرة بين الطلاب",
        desc: "لا يمكن للطلاب إرسال رسائل خاصة أو غير مراقبة لطلاب آخرين أو غرباء. يتم التفاعل حصراً داخل الحصص المباشرة وتحت إشراف المعلم المعتمد.",
      },
      {
        title: "3. تدقيق أمني وجنائي صارم للهيئة التعليمية",
        desc: "يخضع كل معلم لتدقيق أمني وجنائي شامل، والتحقق من الهوية والشهادات الأكاديمية الرسمية، واختبار عملي قبل السماح له بالتدريس.",
      },
      {
        title: "4. تشفير الصوت والبيانات وتأمين التخزين السحابي",
        desc: "تُحفظ التسجيلات الصوتية لتلاوة الطفل ونطقه في سحابة خاصة ومشفرة بروابط مؤقتة ومحمية. لا نقوم ببيع أو مشاركة أصوات الأطفال لأي تدريب عام.",
      },
      {
        title: "5. الالتزام الصارم بقوانين COPPA وGDPR-K",
        desc: "نلتزم بأعلى معايير حماية خصوصية الأطفال الدولية (COPPA الأمريكية وGDPR-K الأوروبية) من حيث تقليل جمع البيانات، وحق الحذف الكامل، وحظر الإعلانات الموجهة.",
      },
      {
        title: "6. حق الحذف الكامل والنهائي لبيانات الطفل",
        desc: "يحق لولي الأمر في أي وقت وبدون أي قيود طلب تصدير كامل أو حذف نهائي وشامل لملف طفله وتسجيلاته الصوتية وسجلاته الأكاديمية.",
      },
    ],
    officerBadge: "مسؤول حماية وسلامة الطفل",
    officerTitle: "هل لديك ملاحظة أو بلاغ يتعلق بسلامة طفل؟",
    officerDesc:
      "يمكنك التواصل مباشرة وبسرية تامة مع مسؤول حماية الأطفال بالأكاديمية عبر البريد الإلكتروني للمراجعة الفورية خلال ساعة واحدة.",
  },
  en: {
    heroBadge: "Child Safety & Privacy Charter",
    heroTitle: "Our Sacred Commitment to Your Child's Safety",
    heroSubtitle:
      "We place your child's physical, psychological, and digital safety above all else. Here is how we engineer privacy into every layer of our platform.",
    guarantees: [
      {
        title: "1. Verified Adult Involvement & Parental Gatekeeping",
        desc: "Children cannot create an account independently. All registrations must be initiated, verified, and managed by a parent or verified legal guardian with explicit consent.",
      },
      {
        title: "2. Zero Direct Peer-to-Peer Messaging",
        desc: "Students cannot send private, unmoderated messages to other students or unauthorized adults. All classroom communication takes place in supervised group settings with a certified educator present.",
      },
      {
        title: "3. Educator Vetting & Background Clearance",
        desc: "Every educator undergoes identity verification, academic credential checks, and criminal history background clearances prior to teaching any child on our platform.",
      },
      {
        title: "4. Encrypted Child Audio & Storage Protection",
        desc: "Student pronunciation and recitation recordings are stored in private cloud storage with temporary pre-signed URLs. We do not sell, license, or expose child voice data for public AI training.",
      },
      {
        title: "5. COPPA & GDPR-K Compliance Commitment",
        desc: "We strictly adhere to the Children's Online Privacy Protection Act (COPPA) in the US and the General Data Protection Regulation (GDPR-K) in the European Union regarding data minimization, consent, and deletion rights.",
      },
      {
        title: "6. Right to Complete Erasure (Data Deletion)",
        desc: "Parents have the unconditional right to request the complete export or permanent deletion of their child's profile, voice recordings, and academic records at any time.",
      },
    ],
    officerBadge: "Designated Child Safety Officer",
    officerTitle: "Have a child safety inquiry or incident to report?",
    officerDesc:
      "Contact our dedicated Child Protection & Privacy Team directly for immediate confidential review within 1 hour.",
  },
  nl: {
    heroBadge: "Handvest Kindveiligheid & Privacy",
    heroTitle: "Onze Toewijding aan de Veiligheid van Jouw Kind",
    heroSubtitle:
      "De fysieke, mentale en digitale veiligheid van je kind staat bij ons voorop. Ontdek hoe we privacy inbouwen in elk onderdeel van ons platform.",
    guarantees: [
      {
        title: "1. Verplichte Betrokkenheid van Volwassenen",
        desc: "Kinderen kunnen niet zelfstandig een account aanmaken. Elke registratie moet worden gestart en goedgekeurd door een geverifieerde ouder of voogd.",
      },
      {
        title: "2. Geen Directe Berichten Tussen Leerlingen",
        desc: "Leerlingen kunnen geen privéberichten sturen naar andere kinderen of onbevoegden. Alle interactie vindt uitsluitend plaats in de les met de docent.",
      },
      {
        title: "3. Strenge Screening van Leerkrachten (VOG)",
        desc: "Elke leerkracht ondergaat identiteitscontrole, diplomaverificatie en antecedentenonderzoek voordat zij lesgeven op het platform.",
      },
      {
        title: "4. Versleutelde Audio en Veilige Opslag",
        desc: "Spraak- en recitatie-opnames van leerlingen worden versleuteld opgeslagen in een beveiligde cloud. We verkopen geen data en trainen geen openbare AI-modellen.",
      },
      {
        title: "5. Volledige Naleving van COPPA en GDPR-K",
        desc: "Wij voldoen strikt aan de Europese AVG/GDPR-K en Amerikaanse COPPA-wetgeving met minimale dataverzameling en volledige privacyrechten.",
      },
      {
        title: "6. Recht op Volledige Verwijdering van Gegevens",
        desc: "Ouders hebben te allen tijde het onvoorwaardelijke recht om alle profielgegevens, audio-opnames en rapporten van hun kind definitief te wissen.",
      },
    ],
    officerBadge: "Aangestelde Functionaris Kindveiligheid",
    officerTitle: "Vraag of melding over de veiligheid van een kind?",
    officerDesc:
      "Neem direct en vertrouwelijk contact op met ons Child Protection Team voor een beoordeling binnen 1 uur.",
  },
  tr: {
    heroBadge: "Çocuk Güvenliği ve Gizlilik Sözleşmesi",
    heroTitle: "Çocuğunuzun Güvenliğine Dair Kutsal Taahhüdümüz",
    heroSubtitle:
      "Çocuğunuzun psikolojik, fiziksel ve dijital güvenliğini her şeyin üstünde tutuyoruz. Gizliliği platformumuzun her katmanına nasıl işlediğimizi inceleyin.",
    guarantees: [
      {
        title: "1. Doğrulanmış Ebeveyn Onayı ve Denetimi",
        desc: "Çocuklar tek başlarına hesap açamazlar. Tüm kayıtlar doğrulanmış bir ebeveyn veya yasal vasi tarafından açık rıza ile başlatılmalıdır.",
      },
      {
        title: "2. Öğrenciler Arası Doğrudan Mesajlaşma Yasağı",
        desc: "Öğrenciler diğer öğrencilere ya da yabancılara denetimsiz özel mesaj gönderemez. Tüm iletişim sertifikalı öğretmen eşliğindeki canlı sınıflarda gerçekleşir.",
      },
      {
        title: "3. Öğretmenler İçin Adli Sicil ve Güvenlik Taraması",
        desc: "Her öğretmen, ders vermeye başlamadan önce kimlik doğrulaması, diploma kontrolü ve adli sicil taramasından geçirilir.",
      },
      {
        title: "4. Şifreli Çocuk Ses Kayıtları ve Güvenli Depolama",
        desc: "Öğrenci okuma ve telaffuz kayıtları özel şifreli bulutta saklanır. Çocuk ses verileri asla satılmaz veya genel yapay zeka modelleri için paylaşılmaz.",
      },
      {
        title: "5. COPPA ve GDPR-K Standartlarına Kesin Uyum",
        desc: "Veri minimizasyonu, rıza ve silme hakları konusunda ABD COPPA ve AB GDPR-K çocuk koruma mevzuatlarına eksiksiz uyuyoruz.",
      },
      {
        title: "6. Verilerin Tamamen ve Kalıcı Olarak Silinme Hakkı",
        desc: "Ebeveynler istedikleri zaman çocuklarının profilini, ses kayıtlarını ve akademik geçmişini kalıcı olarak silme veya dışa aktarma hakkına sahiptir.",
      },
    ],
    officerBadge: "Atanmış Çocuk Güvenliği Görevlisi",
    officerTitle: "Çocuk güvenliği ile ilgili bir bildiriminiz mi var?",
    officerDesc:
      "Özel Çocuk Koruma ve Gizlilik Ekibimizle doğrudan iletişime geçin; bildiriminiz 1 saat içinde gizlilikle incelenir.",
  },
  it: {
    heroBadge: "Carta della Sicurezza e Privacy dei Minori",
    heroTitle: "Il Nostro Impegno per la Sicurezza di Tuo Figlio",
    heroSubtitle:
      "Poniamo la sicurezza fisica, psicologica e digitale di tuo figlio al di sopra di ogni altra cosa. Ecco come progettiamo la privacy su tutta la nostra piattaforma.",
    guarantees: [
      {
        title: "1. Consenso e Supervisione dei Genitori Verificati",
        desc: "I minori non possono creare account in autonomia. Ogni registrazione deve essere avviata e gestita da un genitore o tutore legale verificato.",
      },
      {
        title: "2. Nessun Messaggio Diretto Tra Studenti",
        desc: "Agli studenti è precluso l'invio di messaggi privati ad altri coetanei. Ogni interazione avviene esclusivamente all'interno delle lezioni con l'insegnante.",
      },
      {
        title: "3. Verifica Penale e Accademica degli Insegnanti",
        desc: "Ogni insegnante viene sottoposto a verifica dell'identità, controllo dei titoli accademici e controllo del casellario giudiziale prima dell'insegnamento.",
      },
      {
        title: "4. Audio del Minore Protetto e Crittografato",
        desc: "Le registrazioni vocali sono archiviate in cloud privato con crittografia e link a tempo. Non vendiamo né cediamo dati vocali per l'addestramento di IA pubbliche.",
      },
      {
        title: "5. Conformità a COPPA e GDPR-K",
        desc: "Applichiamo rigorosamente i regolamenti COPPA e GDPR-K sulla protezione dei minori, limitando al minimo la raccolta dei dati personali.",
      },
      {
        title: "6. Diritto alla Completa Cancellazione dei Dati",
        desc: "I genitori hanno il diritto incondizionato di richiedere l'esportazione o la cancellazione definitiva di account, registrazioni e pagelle in qualsiasi momento.",
      },
    ],
    officerBadge: "Responsabile della Protezione dei Minori",
    officerTitle: "Hai una segnalazione o domanda sulla sicurezza?",
    officerDesc:
      "Contatta direttamente il nostro Team per la Protezione dei Minori per una revisione immediata e riservata entro 1 ora.",
  },
  es: {
    heroBadge: "Carta de Seguridad y Privacidad Infantil",
    heroTitle: "Nuestro Compromiso Sagrado con la Seguridad de tu Hijo",
    heroSubtitle:
      "Situamos la seguridad física, psicológica y digital de tu hijo por encima de todo. Así es como integramos la privacidad en cada capa de nuestra plataforma.",
    guarantees: [
      {
        title: "1. Consentimiento Verificado y Control Parental",
        desc: "Los menores no pueden registrarse de forma independiente. Toda cuenta debe ser creada, verificada y gestionada por un progenitor o tutor legal.",
      },
      {
        title: "2. Cero Mensajería Directa Entre Alumnos",
        desc: "Los alumnos no pueden enviarse mensajes privados ni comunicarse sin moderación. Toda interacción se desarrolla en aulas supervisadas con el profesor.",
      },
      {
        title: "3. Verificación de Antecedentes del Profesorado",
        desc: "Cada docente pasa por una comprobación exhaustiva de identidad, acreditación académica y antecedentes penales antes de impartir clases.",
      },
      {
        title: "4. Audio Infantil Cifrado y Almacenamiento Protegido",
        desc: "Las grabaciones de voz se guardan en almacenamiento privado cifrado con enlaces temporales. No vendemos ni usamos grabaciones infantiles para entrenar IA públicas.",
      },
      {
        title: "5. Cumplimiento Estricto de COPPA y GDPR-K",
        desc: "Cumplimos rigurosamente con las normativas internacionales de protección de menores COPPA (EE. UU.) y RGPD/GDPR-K (Unión Europea).",
      },
      {
        title: "6. Derecho al Borrado Permanente de Datos",
        desc: "Los padres tienen el derecho incondicional de solicitar la exportación o eliminación total del perfil, grabaciones y expedientes de su hijo en cualquier momento.",
      },
    ],
    officerBadge: "Oficial Designado de Seguridad Infantil",
    officerTitle: "¿Tienes una consulta o reporte de seguridad infantil?",
    officerDesc:
      "Contacta directamente y con total confidencialidad con nuestro Equipo de Protección Infantil para una respuesta en menos de 1 hora.",
  },
};

export default async function ChildSafetyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale: Locale = (["ar", "en", "nl", "tr", "it", "es"].includes(locale)
    ? locale
    : "en") as Locale;

  const t = CHILD_SAFETY_I18N[validLocale];

  const icons = [
    <UserCheck key="uc" className="w-6 h-6 text-emerald-600" />,
    <Lock key="lk" className="w-6 h-6 text-brand-600" />,
    <FileCheck key="fc" className="w-6 h-6 text-purple-600" />,
    <Database key="db" className="w-6 h-6 text-amber-600" />,
    <ShieldCheck key="sc" className="w-6 h-6 text-emerald-600" />,
    <Eye key="ey" className="w-6 h-6 text-pink-600" />,
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs sm:text-sm font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
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

      {/* Main Guarantees */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {t.guarantees.map((item, idx) => (
            <div
              key={idx}
              className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                {icons[idx]}
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Child Protection Officer Contact Box */}
        <div className="mt-16 p-8 bg-white rounded-3xl border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <Mail className="w-4 h-4" />
              <span>{t.officerBadge}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {t.officerTitle}
            </h3>
            <p className="text-sm text-slate-600 max-w-xl">
              {t.officerDesc}
            </p>
          </div>
          <a
            href="mailto:safety@arabickidsacademy.com"
            className="shrink-0 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-colors"
          >
            safety@arabickidsacademy.com
          </a>
        </div>
      </section>
    </div>
  );
}
