import React from "react";
import Link from "next/link";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import {
  Compass,
  Sparkles,
  ShieldCheck,
  Send,
  Calendar,
  Users,
  Award,
  CheckCircle2,
} from "lucide-react";

export default async function EnrollmentInquiryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const dict = getDictionary(locale);

  async function handleInquirySubmit(formData: FormData) {
    "use server";
    const parentName = formData.get("parentName")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const childName = formData.get("childName")?.toString() || "";
    const childAge = formData.get("childAge")?.toString() || "";
    const currentLevel = formData.get("currentLevel")?.toString() || "BEGINNER";
    const goals = formData.get("goals")?.toString() || "";
    const preferredSchedule = formData.get("preferredSchedule")?.toString() || "";

    const { crmService } = await import("@/server/services/CrmService");
    await crmService.captureEnrollmentInquiry({
      parentName,
      email,
      phone,
      childName,
      childAge,
      currentLevel,
      goals,
      preferredSchedule,
      locale,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <Compass className="w-4 h-4 text-brand-400" />
            <span>{isRtl ? "استشارة أكاديمية وتحديد مستوى مجاني" : "Free Academic Consultation & Placement"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            {isRtl ? "طلب استشارة تسجيل وتسكين أكاديمي" : "Personalized Enrollment & Placement Inquiry"}
          </h1>
          <p className="mt-4 text-base text-slate-300 max-w-xl mx-auto">
            {isRtl
              ? "أخبرنا عن طفلك وخلفيته في اللغة العربية، وسيقوم مستشارنا الأكاديمي بإعداد خطة تعلم مقترحة والمجموعة الأنسب له."
              : "Share your child's background and learning goals. Our academic advisor will recommend the perfect micro-cohort and curriculum path."}
          </p>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        <div className="p-8 sm:p-12 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {isRtl ? "بيانات ولي الأمر والطفل" : "Parent & Child Information"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isRtl
                ? "جميع البيانات مشفرة وآمنة وفق معايير COPPA وGDPR لحماية خصوصية الأطفال."
                : "All data is securely handled under COPPA and GDPR-K child data protection standards."}
            </p>
          </div>

          <form action={handleInquirySubmit} className="space-y-6">
            {/* Parent Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isRtl ? "اسم ولي الأمر *" : "Parent Full Name *"}
                </label>
                <input
                  type="text"
                  name="parentName"
                  required
                  placeholder={isRtl ? "طارق عبد الرحمن" : "Sarah Jenkins"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isRtl ? "البريد الإلكتروني *" : "Email Address *"}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="parent@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isRtl ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+44 7123 456789"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Child Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isRtl ? "اسم الطفل *" : "Child's First Name *"}
                </label>
                <input
                  type="text"
                  name="childName"
                  required
                  placeholder={isRtl ? "زيد" : "Zayd"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isRtl ? "عمر الطفل *" : "Child's Age *"}
                </label>
                <select
                  name="childAge"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                >
                  <option value="4-6">{isRtl ? "4 - 6 سنوات (براعم)" : "4 - 6 Years (Early Sprouts)"}</option>
                  <option value="7-10">{isRtl ? "7 - 10 سنوات (مستكشف)" : "7 - 10 Years (Junior)"}</option>
                  <option value="11-13">{isRtl ? "11 - 13 سنة (رواد)" : "11 - 13 Years (Pioneers)"}</option>
                  <option value="14-16">{isRtl ? "14 - 16 سنة (متقدم)" : "14 - 16 Years (Scholars)"}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isRtl ? "المستوى الحالي في العربية" : "Current Arabic Level"}
                </label>
                <select
                  name="currentLevel"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                >
                  <option value="BEGINNER">{isRtl ? "مبتدئ تماماً (لا يعرف الحروف)" : "Absolute Beginner (No Letters)"}</option>
                  <option value="LETTERS">{isRtl ? "يعرف بعض الحروف والأصوات" : "Recognizes Some Letters"}</option>
                  <option value="READING">{isRtl ? "يقرأ كلمات بسيطة ببطء" : "Reads Simple Words Slowly"}</option>
                  <option value="FLUENT">{isRtl ? "يتحدث أو يفهم بشكل جيد" : "Conversational / Native"}</option>
                </select>
              </div>
            </div>

            {/* Goals & Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isRtl ? "الأهداف التعليمية الأساسية" : "Primary Learning Goals"}
                </label>
                <input
                  type="text"
                  name="goals"
                  placeholder={
                    isRtl
                      ? "مثال: طلاقة القراءة، حفظ جزء عم، محادثة يومية..."
                      : "e.g. Reading fluency, Quran memorization, conversational speaking..."
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isRtl ? "المواعيد المفضلة للأسبوع" : "Preferred Class Days / Times"}
                </label>
                <input
                  type="text"
                  name="preferredSchedule"
                  placeholder={
                    isRtl
                      ? "مثال: عطلة نهاية الأسبوع صباحاً، أو بعد المدرسة..."
                      : "e.g. Weekends morning, or weekdays after 4:00 PM..."
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isRtl ? "يشمل حصة تجريبية وتقييماً صوتياً مجانياً" : "Includes 1-day free trial & placement session"}</span>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 gradient-brand text-white font-bold text-sm rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isRtl ? "إرسال طلب الاستشارة" : "Submit Consultation Request"}</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
