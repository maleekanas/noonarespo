import React from "react";
import Link from "next/link";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import {
  HelpCircle,
  Sparkles,
  BookOpen,
  Video,
  CreditCard,
  ShieldCheck,
  Laptop,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const dict = getDictionary(locale);

  const categories = [
    {
      id: "curriculum",
      nameEn: "Curriculum & Programs",
      nameAr: "المناهج والبرامج الأكاديمية",
      icon: <BookOpen className="w-5 h-5 text-brand-600" />,
      questions: [
        {
          qEn: "How are the 7 academic programs structured?",
          qAr: "كيف يتم تنظيم البرامج الأكاديمية السبعة في الأكاديمية؟",
          aEn: "Our programs cover Foundations, Reading Fluency, Writing & Calligraphy, Speaking & Pronunciation, Listening Comprehension, Quran & Tajweed, and Islamic Studies. Each program follows CEFR levels (Pre-A1 to B2) with progressive weekly milestones and vocabulary targets.",
          aAr: "تغطي برامجنا التأسيس، طلاقة القراءة، الكتابة والخط العربي، المحادثة والنطق، الاستماع والفهم، القرآن والتجويد، والقيم الإسلامية. يتدرج كل برنامج وفق المستويات الأوروبية CEFR (من Pre-A1 إلى B2) مع أهداف مفردات وأنشطة أسبوعية محددة.",
        },
        {
          qEn: "What if my child does not know any Arabic letters?",
          qAr: "ماذا لو كان طفلي لا يعرف أي حرف من حروف الهجاء العربية؟",
          aEn: "Our Arabic Foundations (Pre-A1) is specifically crafted for absolute beginners aged 4 to 8. We use the Phonics Arcade Studio, interactive tracing, and nursery songs to build letter shape recognition and sound associations without any stress.",
          aAr: "برنامج أساسيات اللغة العربية (Pre-A1) مصمم خصيصاً للمبتدئين تماماً من سن 4 إلى 8 سنوات. نستخدم ألعاب قطار الحروف، والتتبع التفاعلي، والأناشيد البصرية لبناء الوعي الصوتي والتعرف على أشكال الحروف بكل متعة وسهولة.",
        },
      ],
    },
    {
      id: "classes",
      nameEn: "Live Classes & Scheduling",
      nameAr: "الحصص المباشرة والمواعيد",
      icon: <Video className="w-5 h-5 text-emerald-600" />,
      questions: [
        {
          qEn: "How many students are in a live class?",
          qAr: "كم عدد الطلاب في كل مجموعة دراسية مباشرة؟",
          aEn: "Every micro-cohort is strictly capped at a maximum of 6 students. This ensures that every child receives individualized speaking time, active participation, and direct phoneme feedback from the lead teacher.",
          aAr: "تقتصر كل مجموعة مصغرة على 6 طلاب كحد أقصى. يضمن هذا الحجم المثالي حصول كل طفل على وقت تحدث كافٍ، ومشاركة تفاعلية نشطة، وتصحيح صوتي مباشر لمخارج الحروف.",
        },
        {
          qEn: "What happens if we miss a scheduled class?",
          qAr: "ماذا يحدث إذا فات طفلي موعد إحدى الحصص المجدولة؟",
          aEn: "All live sessions are automatically recorded and accessible directly from the parent and student dashboards within 1 hour. Parents can also request a makeup lesson with another parallel micro-cohort via the dashboard.",
          aAr: "يتم تسجيل جميع الحصص المباشرة تلقائياً وإتاحتها في لوحة تحكم ولي الأمر والطالب خلال ساعة واحدة من انتهاء الحصة. كما يمكن لولي الأمر طلب حصة تعويضية مع مجموعة موازية بسهولة.",
        },
      ],
    },
    {
      id: "tech",
      nameEn: "Technical Requirements",
      nameAr: "المتطلبات التقنية والأجهزة",
      icon: <Laptop className="w-5 h-5 text-purple-600" />,
      questions: [
        {
          qEn: "What devices do we need to participate?",
          qAr: "ما هي الأجهزة المطلوبة لحضور الحصص التفاعلية؟",
          aEn: "Any tablet (iPad / Android), laptop, or desktop computer with a modern web browser (Chrome, Safari, Edge, Firefox), a microphone, and a webcam. No bulky third-party software installation is required.",
          aAr: "أي جهاز لوحي (آيباد أو أندرويد) أو حاسوب محمول أو مكتبي مزود بمتصفح حديث (كروم، سفاري، إيدج، فايرفوكس)، وميكروفون وكاميرا. لا يتطلب النظام تثبيت برامج خارجية معقدة.",
        },
      ],
    },
    {
      id: "billing",
      nameEn: "Pricing & Invoicing",
      nameAr: "الأسعار والاشتراكات والفوترة",
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      questions: [
        {
          qEn: "Is there a long-term contract or cancellation fee?",
          qAr: "هل توجد عقود طويلة الأجل أو رسوم إلغاء للاشتراك؟",
          aEn: "No. Subscriptions are billed monthly and can be paused or cancelled at any time directly through the Parent Billing Portal. We also offer a 14-day 100% money-back guarantee on all plans.",
          aAr: "لا توجد أي عقود ملزمة. يتم تجديد الاشتراكات شهرياً، ويمكن إيقاف الاشتراك مؤقتاً أو إلغاؤه في أي وقت بضغطة زر من لوحة تحكم ولي الأمر، مع ضمان استرداد 100% خلال أول 14 يوماً.",
        },
      ],
    },
    {
      id: "safety",
      nameEn: "Child Safety & Privacy",
      nameAr: "أمان الطفل وخصوصية البيانات",
      icon: <ShieldCheck className="w-5 h-5 text-pink-600" />,
      questions: [
        {
          qEn: "How does the platform ensure my child's safety?",
          qAr: "كيف تضمن المنصة أمان طفلي وخصوصية بياناته؟",
          aEn: "Kids Arabic Academy adheres strictly to COPPA and GDPR-K regulations. Students cannot send unmoderated direct messages to peers or strangers. All teachers undergo rigorous background vetting, and voice recordings are stored in private encrypted cloud vaults.",
          aAr: "تلتزم الأكاديمية الصارمة بقوانين حماية خصوصية الأطفال COPPA وGDPR-K. يُمنع منعاً باتاً أي تواصل غير مراقب بين الطلاب. يخضع جميع المعلمين لتحريات وتدقيق أمني وأكاديمي شامل، وتُحفظ التسجيلات الصوتية في سحابة مشفرة خاصة.",
        },
      ],
    },
  ];

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-brand-950 via-slate-900 to-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <HelpCircle className="w-4 h-4 text-brand-400" />
            <span>{isRtl ? "إجابات واضحة ومباشرة لكل تساؤلاتك" : "Frequently Asked Questions"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            {isRtl ? "الأسئلة الشائعة حول المنصة والبرامج" : "Everything You Need to Know About Our Academy"}
          </h1>
          <p className="mt-4 text-base text-slate-300 max-w-xl mx-auto">
            {isRtl
              ? "جمعنا لك أكثر الأسئلة شيوعاً حول المناهج، الحصص المباشرة، خطط الأسعار، وأمان الطفل."
              : "Find answers regarding our academic methodology, cohort schedules, pricing, and child safety."}
          </p>
        </div>
      </section>

      {/* FAQ Categories & Questions */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-12">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                  {cat.icon}
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isRtl ? cat.nameAr : cat.nameEn}
                </h2>
              </div>

              <div className="space-y-4">
                {cat.questions.map((item, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-base font-bold text-slate-900 flex items-start justify-between gap-4">
                      <span>{isRtl ? item.qAr : item.qEn}</span>
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed pt-1">
                      {isRtl ? item.aAr : item.aEn}
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
            {isRtl ? "هل لا تزال لديك أسئلة لم تجد إجابتها هنا؟" : "Still have questions?"}
          </h3>
          <p className="text-sm text-brand-800 max-w-md mx-auto">
            {isRtl
              ? "فريقنا الأكاديمي مستعد لمساعدتك والإجابة على كل استفساراتك حول طفلك."
              : "Our academic team is always on standby to discuss your child's specific background and learning needs."}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href={`/${locale}/contact`}
              className="px-6 py-3 gradient-brand text-white text-sm font-bold rounded-xl shadow-sm hover:opacity-95 transition-all"
            >
              {isRtl ? "تواصل مع المستشار الأكاديمي" : "Contact Academic Advisor"}
            </Link>
            <Link
              href={`/${locale}/inquiry`}
              className="px-6 py-3 bg-white text-brand-700 border border-brand-300 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              {isRtl ? "طلب استشارة تسجيل" : "Request Placement Inquiry"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
