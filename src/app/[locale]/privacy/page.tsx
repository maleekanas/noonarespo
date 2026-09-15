import React from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/localization";
import { ShieldCheck, Lock, EyeOff, UserCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const isAr = locale === "ar";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:underline"
        >
          <DirectionalIcon icon={isAr ? ArrowRight : ArrowLeft} locale={locale} className="w-4 h-4" />
          <span>{dict.common.back}</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>COPPA & GDPR-K Certified Compliance</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {isAr ? "سياسة الخصوصية وحماية الطفل" : "Child Safety & Privacy Policy"}
        </h1>
        <p className="text-sm text-slate-500">
          {isAr ? "آخر تحديث: سبتمبر 2026 | سارية على جميع المستخدمين عالمياً" : "Last updated: September 2026 | Effective for all global users"}
        </p>
      </div>

      {/* Safety Commitments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isAr ? "خالية 100% من الإعلانات" : "100% Ad-Free"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? "لا نعرض أي إعلانات تجارية ولا نبيع أو نشارك بيانات الأطفال مع أي شبكة إعلانية."
              : "We display zero ads and never sell, monetize, or share children's data with any ad networks."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isAr ? "تسجيلات صوتية مشفرة" : "Encrypted Voice Data"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? "جميع التسجيلات الصوتية للتلاوة والتجويد مشفرة ومحمية بروابط خاصة تنتهي صلاحيتها خلال 15 دقيقة."
              : "All audio recitations and homework recordings are stored in private cloud vaults with 15-minute signed URLs."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isAr ? "إشراف مباشر من ولي الأمر" : "Direct Parental Control"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? "لا يمكن للطالب التواصل المباشر مع أقرانه دون إشراف، وجميع الحركات خاضعة لرقابة ولي الأمر."
              : "No unsupervised student-to-student direct messaging. Parents retain full visibility and data erasure rights."}
          </p>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-slate-700 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "1. الامتثال لقوانين COPPA و GDPR-K" : "1. Compliance with COPPA & GDPR-K"}
          </h2>
          <p>
            {isAr
              ? "تلتزم أكاديمية براعم العربية للأطفال بأعلى المعايير الدولية لحماية خصوصية الأطفال على الإنترنت، بما في ذلك قانون حماية خصوصية الأطفال عبر الإنترنت الأمريكي (COPPA) واللائحة العامة لحماية البيانات للأطفال الأوروبية (GDPR-K). يتطلب تسجيل أي طفل يقل عمره عن 16 عاماً موافقة صريحة وموثقة من ولي الأمر أو الوصي القانوني."
              : "Arabic Kids Academy strictly complies with the Children's Online Privacy Protection Act (COPPA) in the United States and the General Data Protection Regulation for Kids (GDPR-K) in the European Union. Registration of any child under 16 requires verifiable parental or legal guardian consent."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "2. البيانات التي نجمعها وكيفية استخدامها" : "2. Information We Collect and How We Use It"}
          </h2>
          <p>
            {isAr
              ? "نجمع فقط الحد الأدنى من البيانات اللازمة لتقديم الخدمة التعليمية: الاسم الأول للطالب، الفئة العمرية، والبريد الإلكتروني لولي الأمر. لا نطلب من الأطفال عنوان السكن أو أرقام الهواتف أو أي معلومات حساسة. التسجيلات الصوتية تستخدم حصرياً لتقييم التلاوة ومخارج الحروف من قبل المعلم المعتمد."
              : "We only collect the minimal information necessary to deliver educational services: the child's first name, age group, and the parent's verified email. We never ask children for physical addresses, phone numbers, or sensitive information. Audio submissions are exclusively used for phonics and Quranic recitation assessment by certified educators."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "3. حقوق ولي الأمر في الوصول للبيانات وحذفها (Right to be Forgotten)" : "3. Parental Rights & Data Deletion (Right to be Forgotten)"}
          </h2>
          <p>
            {isAr
              ? "يحق لولي الأمر في أي وقت طلب تصدير نسخة كاملة من سجلات طفله التعليمية (بصيغتي JSON و CSV)، أو طلب حذف الحساب وجميع التسجيلات الصوتية فورياً من خوادمنا بشكل نهائي عبر لوحة تحكم ولي الأمر أو بمراسلة مسؤول حماية البيانات: privacy@arabickidsacademy.com."
              : "Parents may at any time review, download an automated export of their child's educational data (in JSON and CSV formats), or permanently delete the child's account and all associated voice recordings by contacting our Data Protection Officer at privacy@arabickidsacademy.com."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "4. التواصل مع فريق الخصوصية والأمان" : "4. Contact our Privacy & Child Safety Team"}
          </h2>
          <p>
            {isAr
              ? "إذا كانت لديكم أي استفسارات أو ملاحظات بخصوص سياسة الخصوصية وحماية الطفل، يرجى التواصل معنا عبر البريد الإلكتروني: compliance@arabickidsacademy.com"
              : "If you have any questions or feedback regarding our child safety practices or privacy policy, please contact our compliance team at compliance@arabickidsacademy.com"}
          </p>
        </section>
      </div>
    </div>
  );
}
