import React from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/localization";
import { FileText, ArrowLeft, ArrowRight, CreditCard, RotateCcw, ShieldAlert } from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

export default async function TermsOfServicePage({
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

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
          <FileText className="w-4 h-4" />
          <span>Global Commercial Terms of Service</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {isAr ? "شروط وأحكام الاستخدام" : "Terms of Service"}
        </h1>
        <p className="text-sm text-slate-500">
          {isAr ? "سارية المفعول عالمياً لجميع المشتركين | آخر تحديث: سبتمبر 2026" : "Effective worldwide for all subscribers | Last updated: September 2026"}
        </p>
      </div>

      {/* Commercial Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isAr ? "الاشتراكات والتجديد التلقائي" : "Subscription & Billing"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? "الاشتراكات تتجدد شهرياً تلقائياً، مع إمكانية الإلغاء في أي وقت بنقرة واحدة من لوحة التحكم."
              : "Subscriptions renew automatically each billing cycle. You may cancel at any time directly from the parent portal."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isAr ? "ضمان الرضا واسترداد الأموال" : "14-Day Refund Guarantee"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? "نقدم ضمان استرداد كامل للأموال خلال أول 14 يوماً من الاشتراك دون أي تعقيدات."
              : "We offer an unconditional 100% money-back guarantee within the first 14 days of any new subscription."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isAr ? "ميثاق السلوك الصفي" : "Classroom Code of Conduct"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? "بيئة تعليمية قائمة على الاحترام والأخلاق الإسلامية والتشجيع المتبادل بين المعلمين والطلاب."
              : "An environment grounded in mutual respect, positive encouragement, and high ethical standards."}
          </p>
        </div>
      </div>

      {/* Main Legal Clauses */}
      <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-slate-700 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "1. أهلية التسجيل وحسابات أولياء الأمور" : "1. Eligibility & Parental Accounts"}
          </h2>
          <p>
            {isAr
              ? "يجب أن يتم إنشاء وإدارة جميع الحسابات من قبل ولي الأمر أو الوصي القانوني (18 عاماً فما فوق). ولي الأمر مسؤول عن دقة البيانات المدخلة وعن إشرافه على استخدام طفله للمنصة."
              : "All accounts must be registered and maintained by a parent or legal guardian (18 years or older). The parent is responsible for ensuring the accuracy of account information and overseeing the child's learning sessions."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "2. خطط الاشتراك وسياسة الإلغاء" : "2. Plans, Billing & Cancellation Policy"}
          </h2>
          <p>
            {isAr
              ? "يتم تسعير الاشتراكات بالدولار الأمريكي (USD) أو العملة المحلية المحددة عند الدفع. يمكنك إلغاء الاشتراك في أي وقت، وسيظل الوصول متاحاً حتى نهاية فترة الفاتورة الحالية دون فرض أي رسوم إضافية."
              : "Subscriptions are billed in USD or the currency displayed at checkout. You can cancel your recurring subscription at any time; your access remains active through the end of the paid billing period without any penalties."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "3. الملكية الفكرية وحقوق المناهج" : "3. Intellectual Property & Curricular Content"}
          </h2>
          <p>
            {isAr
              ? "جميع المناهج، الكراسات المطبوعة، الرسومات التوضيحية، والتسجيلات التعليمية هي ملكية فكرية حصرية لأكاديمية براعم العربية للأطفال ولا يجوز نسخها أو إعادة نشرها تجارياً دون إذن خطي مسبق."
              : "All curricula, illustrated stories, printable A4 packets, audio materials, and trademarks are the exclusive intellectual property of Kids Arabic Academy and may not be reproduced or distributed for commercial purposes without prior written authorization."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "4. القانون الواجب التطبيق وحل النزاعات" : "4. Governing Law & Dispute Resolution"}
          </h2>
          <p>
            {isAr
              ? "تخضع هذه الشروط وتفسر وفقاً للأنظمة التجارية والقوانين المعمول بها دولياً لحماية المستهلكين على الإنترنت."
              : "These Terms of Service are governed by and construed in accordance with international commercial law and applicable online consumer protection standards."}
          </p>
        </section>
      </div>
    </div>
  );
}
