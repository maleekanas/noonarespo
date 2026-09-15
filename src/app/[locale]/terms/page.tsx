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
          <span>{isAr ? "شروط الخدمة" : "Terms of Service"}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {isAr ? "شروط وأحكام الاستخدام" : "Terms of Service"}
        </h1>
        <p className="text-sm text-slate-500">
          {isAr ? "آخر تحديث: سبتمبر 2026" : "Last updated: September 2026"}
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
              ? "تتجدد الاشتراكات تلقائياً كل دورة فوترة عبر مزوّد الدفع Stripe، ويمكن إلغاؤها في أي وقت."
              : "Subscriptions renew automatically each billing cycle through our payment processor, Stripe, and can be cancelled at any time."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isAr ? "ضمان استرداد الأموال خلال 14 يوماً" : "14-Day Refund Guarantee"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? "نقدّم استرداداً كاملاً وغير مشروط للأموال خلال أول 14 يوماً من أي اشتراك جديد."
              : "We offer an unconditional full refund within the first 14 days of any new subscription."}
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
              ? "بيئة تعليمية قائمة على الاحترام المتبادل والتشجيع الإيجابي بين المعلمين والطلاب وأولياء الأمور."
              : "An environment grounded in mutual respect and positive encouragement between teachers, students, and parents."}
          </p>
        </div>
      </div>

      {/* Main Legal Clauses */}
      <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-slate-700 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "1. من نحن وقبول هذه الشروط" : "1. Who We Are & Acceptance of These Terms"}
          </h2>
          <p>
            {isAr
              ? "تشكّل هذه الشروط اتفاقاً بينك، بصفتك ولي الأمر أو الوصي الذي ينشئ الحساب ويديره، وبين 3-Tech (\"نحن\")، ومقرها غرونينغن، هولندا، والتي تشغّل منصة أكاديمية براعم العربية للأطفال على arabickidsacademy.com. بإنشائك حساباً أو اشتراكك في إحدى الباقات، فإنك توافق على هذه الشروط."
              : "These Terms of Service form an agreement between you — the parent or guardian creating and managing the account — and 3-Tech (\"we\", \"us\"), based in Groningen, the Netherlands, which operates Arabic Kids Academy at arabickidsacademy.com. By creating an account or subscribing to a plan, you agree to these terms."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "2. أهلية التسجيل وحسابات أولياء الأمور" : "2. Eligibility & Parental Accounts"}
          </h2>
          <p>
            {isAr
              ? "يجب أن يتم إنشاء وإدارة جميع الحسابات من قبل ولي الأمر أو الوصي القانوني (18 عاماً فما فوق). ولي الأمر مسؤول عن دقة البيانات المدخلة وعن إشرافه على استخدام طفله للمنصة."
              : "All accounts must be created and maintained by a parent or legal guardian (18 years of age or older). The parent is responsible for the accuracy of the information provided and for supervising their child's use of the platform."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "3. وصف الخدمة" : "3. The Service"}
          </h2>
          <p>
            {isAr
              ? "نقدّم حصصاً تعليمية جماعية صغيرة (بحد أقصى 6 طلاب) أو حصصاً فردية، عبر الإنترنت، ضمن سبعة مسارات تعليمية (اللغة العربية، القراءة، الكتابة، المحادثة، الاستماع، القرآن الكريم والتجويد، والدراسات الإسلامية)، يقدّمها معلمون معتمدون وفق الفئة العمرية للطفل."
              : "We provide small-group (up to 6 students) or one-on-one online classes across seven learning tracks (Arabic Foundations, Reading, Writing, Speaking, Listening, Quran & Tajweed, and Islamic Studies), delivered by certified teachers matched to the child's age group."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "4. خطط الاشتراك والفوترة والتجديد" : "4. Subscription Plans, Billing & Renewal"}
          </h2>
          <p>
            {isAr
              ? "تُعرض الباقات وأسعارها عند إتمام الاشتراك، وتُفوتر بالدولار الأمريكي عبر مزوّد الدفع Stripe. تتجدد الاشتراكات تلقائياً كل دورة فوترة ما لم يتم إلغاؤها. في حال تغيير الأسعار، سنُخطرك قبل موعد التجديد التالي."
              : "Plans and their prices are shown at checkout and billed in USD through our payment processor, Stripe. Subscriptions renew automatically each billing period unless cancelled. If prices change, we will notify you before your next renewal."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "5. الإلغاء" : "5. Cancellation"}
          </h2>
          <p>
            {isAr
              ? "يمكنك إلغاء اشتراكك في أي وقت بمراسلتنا على privacy@arabickidsacademy.com، وسنقوم بمعالجة الطلب خلال يومي عمل. يبقى وصولك متاحاً حتى نهاية فترة الفوترة المدفوعة بالفعل، دون فرض أي رسوم إضافية ودون استرداد جزئي للأيام غير المستخدمة (باستثناء ضمان الـ14 يوماً الموضح في القسم التالي)."
              : "You may cancel your subscription at any time by emailing privacy@arabickidsacademy.com, and we will process your request within two business days. Your access remains active through the end of the billing period you've already paid for, with no additional charges and no partial refund for unused days (outside of the 14-day guarantee described below)."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "6. سياسة الاسترداد" : "6. Refund Policy"}
          </h2>
          <p>
            {isAr
              ? "نقدّم ضمان استرداد كامل وغير مشروط للأموال إذا طلبت الإلغاء خلال أول 14 يوماً من أي اشتراك جديد."
              : "We offer an unconditional full refund if you request cancellation within the first 14 days of any new subscription."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "7. ميثاق السلوك" : "7. Code of Conduct"}
          </h2>
          <p>
            {isAr
              ? "نتوقع من جميع المعلمين والطلاب وأولياء الأمور التحلي بالاحترام المتبادل والسلوك الأخلاقي. يحق لنا تعليق أو إنهاء أي حساب يخالف هذا الميثاق أو يُستخدم بشكل مسيء أو احتيالي."
              : "We expect all teachers, students, and parents to act with mutual respect and appropriate conduct. We may suspend or terminate any account that violates this code or is used abusively or fraudulently."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "8. الملكية الفكرية" : "8. Intellectual Property"}
          </h2>
          <p>
            {isAr
              ? "جميع المناهج والمواد التعليمية والتسجيلات والعلامات التجارية المستخدمة في أكاديمية براعم العربية للأطفال هي ملكية فكرية حصرية لـ 3-Tech، ولا يجوز نسخها أو إعادة توزيعها تجارياً دون إذن خطي مسبق."
              : "All curricula, learning materials, recordings, and trademarks used on Arabic Kids Academy are the exclusive intellectual property of 3-Tech and may not be copied or redistributed commercially without prior written permission."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "9. حدود المسؤولية" : "9. Limitation of Liability"}
          </h2>
          <p>
            {isAr
              ? "إلى أقصى حد يسمح به القانون المعمول به، لا تتحمل 3-Tech مسؤولية أي أضرار غير مباشرة أو عرضية أو تبعية ناشئة عن استخدام المنصة، دون أن يخلّ ذلك بأي حقوق إلزامية للمستهلك لا يجوز التنازل عنها بموجب قانون بلد إقامتك."
              : "To the maximum extent permitted by applicable law, 3-Tech is not liable for any indirect, incidental, or consequential damages arising from use of the platform, without prejudice to any mandatory consumer rights that cannot be waived under the law of your country of residence."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "10. القانون الواجب التطبيق وحل النزاعات" : "10. Governing Law & Dispute Resolution"}
          </h2>
          <p>
            {isAr
              ? "تخضع هذه الشروط وتُفسَّر وفقاً لقوانين هولندا، وتختص المحاكم الهولندية المختصة بالنظر في أي نزاع ينشأ عنها، دون أن يخلّ ذلك بأي حقوق إلزامية للمستهلك يتمتع بها المستخدم بموجب قانون بلد إقامته."
              : "These Terms are governed by and construed in accordance with the laws of the Netherlands, and any dispute arising from them is subject to the jurisdiction of the competent Dutch courts, without prejudice to any mandatory consumer-protection rights you have under the law of your country of residence."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "11. التعديلات على هذه الشروط" : "11. Changes to These Terms"}
          </h2>
          <p>
            {isAr
              ? "قد نحدّث هذه الشروط من حين لآخر. سننشر أي تعديل جوهري هنا مع تاريخ التحديث، وسنُخطرك عبر البريد الإلكتروني عند إجراء تغييرات مؤثرة على اشتراكك."
              : "We may update these Terms from time to time. Material changes will be posted here with a new effective date, and we will notify you by email of changes that materially affect your subscription."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "12. تواصل معنا" : "12. Contact Us"}
          </h2>
          <p>
            {isAr
              ? "لأي استفسار بخصوص هذه الشروط، يرجى مراسلتنا على compliance@arabickidsacademy.com. 3-Tech — غرونينغن، هولندا."
              : "For any question about these Terms, please contact us at compliance@arabickidsacademy.com. 3-Tech — Groningen, the Netherlands."}
          </p>
        </section>
      </div>
    </div>
  );
}
