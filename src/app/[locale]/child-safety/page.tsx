import React from "react";
import Link from "next/link";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import {
  ShieldCheck,
  Lock,
  Eye,
  UserCheck,
  AlertTriangle,
  FileCheck,
  Database,
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  Mail,
} from "lucide-react";

export default async function ChildSafetyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const dict = getDictionary(locale);

  const safetyGuarantees = [
    {
      titleEn: "1. Verified Adult Involvement & Parental Gatekeeping",
      titleAr: "1. إشراف الوالدين والتحقق من موافقة البالغين",
      descEn: "Children cannot create an account independently. All registrations must be initiated, verified, and managed by a parent or verified legal guardian with explicit consent.",
      descAr: "لا يُسمح للأطفال بإنشاء حسابات بشكل مستقل. يجب أن يتم التسجيل وتفعيله من قِبل ولي أمر بالغ ومُتحقق من هويته مع تقديم الموافقة الصريحة.",
      icon: <UserCheck className="w-6 h-6 text-emerald-600" />,
    },
    {
      titleEn: "2. Zero Direct Peer-to-Peer Messaging",
      titleAr: "2. منع تام للرسائل الخاصة والمباشرة بين الطلاب",
      descEn: "Students cannot send private, unmoderated messages to other students or unauthorized adults. All classroom communication takes place in supervised group settings with a certified educator present.",
      descAr: "لا يمكن للطلاب إرسال رسائل خاصة أو غير مراقبة لطلاب آخرين أو غرباء. يتم التفاعل حصراً داخل الحصص المباشرة وتحت إشراف المعلم المعتمد.",
      icon: <Lock className="w-6 h-6 text-brand-600" />,
    },
    {
      titleEn: "3. Educator Vetting & Background Clearance",
      titleAr: "3. تدقيق أمني وجنائي صارم للهيئة التعليمية",
      descEn: "Every educator undergoes identity verification, academic credential checks, and criminal history background clearances prior to teaching any child on our platform.",
      descAr: "يخضع كل معلم لتدقيق أمني وجنائي شامل، والتحقق من الهوية والشهادات الأكاديمية الرسمية، واختبار عملي قبل السماح له بالتدريس.",
      icon: <FileCheck className="w-6 h-6 text-purple-600" />,
    },
    {
      titleEn: "4. Encrypted Child Audio & Storage Protection",
      titleAr: "4. تشفير الصوت والبيانات وتأمين التخزين السحابي",
      descEn: "Student pronunciation and recitation recordings are stored in private cloud storage with temporary pre-signed URLs. We do not sell, license, or expose child voice data for public AI training.",
      descAr: "تُحفظ التسجيلات الصوتية لتلاوة الطفل ونطقه في سحابة خاصة ومشفرة بروابط مؤقتة ومحمية. لا نقوم ببيع أو مشاركة أصوات الأطفال لأي تدريب عام.",
      icon: <Database className="w-6 h-6 text-amber-600" />,
    },
    {
      titleEn: "5. COPPA & GDPR-K Compliance Commitment",
      titleAr: "5. الالتزام الصارم بقوانين COPPA وGDPR-K",
      descEn: "We strictly adhere to the Children's Online Privacy Protection Act (COPPA) in the US and the General Data Protection Regulation (GDPR-K) in the European Union regarding data minimization, consent, and deletion rights.",
      descAr: "نلتزم بأعلى معايير حماية خصوصية الأطفال الدولية (COPPA الأمريكية وGDPR-K الأوروبية) من حيث تقليل جمع البيانات، وحق الحذف الكامل، وحظر الإعلانات الموجهة.",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    },
    {
      titleEn: "6. Right to Complete Erasure (Data Deletion)",
      titleAr: "6. حق الحذف الكامل والنهائي لبيانات الطفل",
      descEn: "Parents have the unconditional right to request the complete export or permanent deletion of their child's profile, voice recordings, and academic records at any time.",
      descAr: "يحق لولي الأمر في أي وقت وبدون أي قيود طلب تصدير كامل أو حذف نهائي وشامل لملف طفله وتسجيلاته الصوتية وسجلاته الأكاديمية.",
      icon: <Eye className="w-6 h-6 text-pink-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs sm:text-sm font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isRtl ? "ميثاق الأمان وحماية بيانات الأطفال" : "Child Safety & Privacy Charter"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            {isRtl ? "بيئة تعليمية آمنة ومحمية لطفلك 100%" : "Our Sacred Commitment to Your Child's Safety"}
          </h1>
          <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto">
            {isRtl
              ? "نضع سلامة وأمان طفلك النفسي والرقمي فوق كل اعتبار. تعرف على الإجراءات التقنية والأمنية التي نطبقها يومياً."
              : "We place your child's physical, psychological, and digital safety above all else. Here is how we engineer privacy into every layer of our platform."}
          </p>
        </div>
      </section>

      {/* Main Guarantees */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {safetyGuarantees.map((item, idx) => (
            <div
              key={idx}
              className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isRtl ? item.titleAr : item.titleEn}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isRtl ? item.descAr : item.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Child Protection Officer Contact Box */}
        <div className="mt-16 p-8 bg-white rounded-3xl border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <Mail className="w-4 h-4" />
              <span>{isRtl ? "مسؤول حماية وسلامة الطفل" : "Designated Child Safety Officer"}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {isRtl ? "هل لديك ملاحظة أو بلاغ يتعلق بسلامة طفل؟" : "Have a child safety inquiry or incident to report?"}
            </h3>
            <p className="text-sm text-slate-600 max-w-xl">
              {isRtl
                ? "يمكنك التواصل مباشرة وبسرية تامة مع مسؤول حماية الأطفال بالأكاديمية عبر البريد الإلكتروني."
                : "Contact our dedicated Child Protection & Privacy Team directly for immediate review within 1 hour."}
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
