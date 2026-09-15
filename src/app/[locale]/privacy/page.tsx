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
          <span>{isAr ? "مصممة وفق مبادئ COPPA و GDPR-K" : "Built on COPPA & GDPR-K Principles"}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {isAr ? "سياسة الخصوصية وحماية الطفل" : "Child Safety & Privacy Policy"}
        </h1>
        <p className="text-sm text-slate-500">
          {isAr ? "آخر تحديث: سبتمبر 2026" : "Last updated: September 2026"}
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
              ? "لا نعرض أي إعلانات تجارية، ولا نبيع بيانات طفلك أو نستخدمها لأغراض تسويقية أو إعلانية لدى أي طرف ثالث."
              : "We display zero ads, and we never sell your child's data or use it for advertising or marketing by any third party."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isAr ? "وصول مقيّد للتسجيلات الصوتية" : "Restricted Access to Recordings"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? "تُستخدم تسجيلات التلاوة والواجبات الصوتية حصرياً لتقييم التعلم، ولا يطّلع عليها سوى معلم طفلك المكلّف والمشرفين المخوّلين."
              : "Recitation and homework audio is used only for learning assessment, and is accessible only to your child's assigned teacher and authorized school staff."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isAr ? "الحساب بإشراف ولي الأمر فقط" : "Parent-Controlled Accounts"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? "لا يمكن إنشاء ملف طفل أو الوصول إلى بياناته إلا من خلال حساب ولي أمر موثّق ومسجّل الدخول."
              : "A child's profile can only ever be created, viewed, or managed through a verified, logged-in parent or guardian account."}
          </p>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-slate-700 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "1. من يقدّم هذه الخدمة" : "1. Who Operates This Service"}
          </h2>
          <p>
            {isAr
              ? "منصة \"أكاديمية براعم العربية للأطفال\" (arabickidsacademy.com) يُشغّلها ويديرها كيان 3-Tech، ومقره غرونينغن، هولندا. 3-Tech هو \"المتحكم بالبيانات\" (Data Controller) المسؤول عن المعلومات الشخصية الموضحة في هذه السياسة، ويمكن التواصل معه عبر: privacy@arabickidsacademy.com."
              : "Arabic Kids Academy (arabickidsacademy.com) is operated by 3-Tech, based in Groningen, the Netherlands. 3-Tech is the \"data controller\" responsible for the personal information described in this policy, and can be reached at privacy@arabickidsacademy.com."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "2. التزامنا بخصوصية الأطفال (COPPA و GDPR)" : "2. Our Commitment to Children's Privacy (COPPA & GDPR)"}
          </h2>
          <p>
            {isAr
              ? "يخضع أي طفل دون سن 13 عاماً لقانون COPPA الأمريكي لحماية خصوصية الأطفال، الذي يشترط موافقة ولي أمر يمكن التحقق منها قبل جمع أي بيانات شخصية. وتنص المادة 8 من اللائحة الأوروبية العامة لحماية البيانات (GDPR) على أن السن الافتراضي لموافقة الطفل بنفسه هو 16 عاماً، مع إمكانية خفضه في بعض الدول الأعضاء إلى 13 عاماً كحد أدنى. ولضمان مستوى حماية موحّد لجميع الأطفال بغض النظر عن بلد إقامتهم، تطبّق المنصة عملياً حداً أدنى موحداً وهو 16 عاماً: لا يمكن لأي طفل التسجيل بنفسه على الإطلاق، إذ يقتصر إنشاء أي ملف طفل على ولي أمر أو وصي بالغ يسجّل الدخول بحسابه الخاص أولاً ثم يضيف طفله. هذا الإجراء — تسجيل دخول ولي الأمر ثم إضافته لملف الطفل بنفسه — هو الآلية التي نعتمد بها ونوثّق بها الموافقة."
              : "Any child under 13 is covered by the U.S. Children's Online Privacy Protection Act (COPPA), which requires verifiable parental consent before we collect any personal information. Under Article 8 of the EU General Data Protection Regulation (GDPR), the default age at which a child may consent for themselves is 16, though individual EU member states may lower this to as young as 13. To keep one consistent standard of protection regardless of where a family lives, we apply 16 as our own platform-wide threshold: no child can register on their own. Every child profile can only be created by a parent or guardian who first logs into their own verified adult account and then adds their child. That action — a logged-in parent account adding a child profile — is the mechanism by which we obtain and record parental consent."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "3. البيانات التي نجمعها" : "3. Information We Collect"}
          </h2>
          <p>
            {isAr
              ? "من ولي الأمر: الاسم، البريد الإلكتروني، رقم الهاتف، وعنوان الفوترة (لإصدار الفواتير الضريبية). لا تصل بيانات بطاقة الدفع إلينا مباشرة، بل تُعالَج بالكامل عبر مزوّد الدفع Stripe. عن الطفل (يُدخلها ولي الأمر بنفسه): الاسم الأول والأخير، تاريخ الميلاد، الفئة العمرية، اللغة الأم، وبيانات اختيارية كالجنس أو الجنسية. بيانات التعلّم: الحضور، الواجبات المسلَّمة، نتائج التقييمات، والتسجيلات الصوتية للتلاوة أو النطق. بيانات تقنية: عنوان IP ومعلومات المتصفح تُسجَّل لأغراض أمن الحساب ومنع الاحتيال فقط. ملاحظات المعلم الداخلية عن تقدّم الطالب مرئية حصراً للمعلمين والإداريين المخوّلين، ولا تظهر لأولياء أمور آخرين أو لطلاب آخرين."
              : "From the parent: name, email address, phone number, and billing address (for issuing tax invoices). We never receive your card details directly — payment is handled entirely by our payment processor, Stripe. About the child (entered by the parent): first and last name, date of birth, age group, native language, and optional fields such as gender or nationality. Learning data: class attendance, submitted assignments, assessment results, and audio recordings of recitation or pronunciation practice. Technical data: IP address and browser information, logged only for account security and fraud prevention. Internal teacher notes on a student's progress are visible only to that student's authorized teachers and school administrators — never to other parents or other students."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "4. كيف نستخدم هذه البيانات" : "4. How We Use This Information"}
          </h2>
          <p>
            {isAr
              ? "نستخدم البيانات حصراً لتقديم الحصص التعليمية ومتابعة تقدّم الطالب، معالجة الاشتراك والفواتير، التواصل معك بخصوص حسابك، الحفاظ على أمان المنصة ومنع إساءة الاستخدام، والامتثال لأي التزامات قانونية أو محاسبية واجبة."
              : "We use this information only to deliver classes and track learning progress, process your subscription and invoices, communicate with you about your account, keep the platform secure and prevent misuse, and comply with applicable legal or accounting obligations."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "5. مع من نشارك البيانات" : "5. Who We Share Information With"}
          </h2>
          <p>
            {isAr
              ? "Stripe: لمعالجة المدفوعات فقط (معتمد وفق معيار PCI-DSS)؛ لا يصل Stripe إلى سجلات تعلّم طفلك. مزوّدو الاستضافة وقاعدة البيانات التي تشغّل المنصة (حالياً Vercel و Neon). لا نبيع بياناتك الشخصية لأي جهة، ولا نشاركها مع شبكات إعلانية أو وسطاء بيانات. أي نقل للبيانات خارج هولندا أو الاتحاد الأوروبي (مثلاً لمزوّدي الخدمة الأمريكيين أعلاه) يتم وفق ضمانات ملائمة كالبنود التعاقدية القياسية المعتمدة لدى هؤلاء المزوّدين."
              : "Stripe — for payment processing only (PCI-DSS certified); Stripe never receives your child's learning records. The hosting and database providers that run the platform (currently Vercel and Neon). We do not sell your personal information, and we do not share it with ad networks or data brokers. Any transfer of data outside the Netherlands or the EU (for example, to the US-based providers above) relies on appropriate safeguards, such as those providers' standard contractual clauses."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "6. مدة الاحتفاظ بالبيانات" : "6. Data Retention"}
          </h2>
          <p>
            {isAr
              ? "نحتفظ ببيانات الحساب والتعلّم طوال فترة نشاط الحساب. عند إغلاق الحساب أو طلب الحذف، نلتزم بحذف أو إخفاء هوية البيانات الشخصية خلال 90 يوماً، باستثناء سجلات الفوترة التي قد يستوجب القانون الضريبي والمحاسبي الاحتفاظ بها لفترة أطول."
              : "We retain account and learning data for as long as the account remains active. If you close your account or request deletion, we will delete or anonymize your personal data within 90 days, except for billing records that tax and accounting law may require us to retain for longer."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "7. حقوقك كولي أمر" : "7. Your Rights as a Parent"}
          </h2>
          <p>
            {isAr
              ? "يحق لك في أي وقت طلب الوصول إلى بيانات طفلك، تصحيحها، الحصول على نسخة منها، أو طلب حذفها نهائياً (\"الحق في النسيان\") بمراسلتنا على privacy@arabickidsacademy.com. سنستجيب لطلبك خلال شهر واحد كحد أقصى، وفق ما تنص عليه المادة 12 من اللائحة الأوروبية GDPR. يحق لك أيضاً سحب موافقتك على معالجة بيانات طفلك في أي وقت عبر طلب إغلاق الحساب."
              : "You may at any time request access to your child's data, ask us to correct it, request a copy of it, or request permanent deletion (\"the right to be forgotten\") by emailing privacy@arabickidsacademy.com. We will respond within one month at the latest, as required under Article 12 of the GDPR. You may also withdraw your consent to the processing of your child's data at any time by requesting that your account be closed."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "8. سلامة الطفل في تصميم المنصة" : "8. Child Safety by Design"}
          </h2>
          <p>
            {isAr
              ? "لا يمكن إنشاء أي ملف طفل دون حساب ولي أمر فعّال. لا يملك الطفل صلاحية تعديل بيانات الحساب أو الفوترة أو الإعدادات بشكل مستقل. أي تواصل متعلق بالحصص يجري تحت إشراف المعلم المكلّف."
              : "No child profile can exist without an active parent account. Children cannot independently change account, billing, or profile settings. Any class-related communication takes place under the supervision of the assigned teacher."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "9. التحديثات على هذه السياسة" : "9. Changes to This Policy"}
          </h2>
          <p>
            {isAr
              ? "قد نحدّث هذه السياسة من حين لآخر. سننشر أي تعديل جوهري هنا مع تاريخ التحديث، وسنخطر ولي الأمر عبر البريد الإلكتروني في حال كان التغيير مؤثراً على كيفية استخدامنا لبيانات طفله."
              : "We may update this policy from time to time. Material changes will be posted here with a new effective date, and we will notify the account's parent by email if a change affects how we use their child's data."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "10. تواصل معنا" : "10. Contact Us"}
          </h2>
          <p>
            {isAr
              ? "لأي استفسار أو طلب متعلق بالخصوصية أو حماية الطفل، يرجى التواصل معنا عبر: privacy@arabickidsacademy.com أو compliance@arabickidsacademy.com. 3-Tech — غرونينغن، هولندا."
              : "For any privacy or child-safety question or request, please contact us at privacy@arabickidsacademy.com or compliance@arabickidsacademy.com. 3-Tech — Groningen, the Netherlands."}
          </p>
        </section>
      </div>
    </div>
  );
}
