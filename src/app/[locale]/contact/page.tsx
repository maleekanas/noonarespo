import React from "react";
import Link from "next/link";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Send,
  CheckCircle2,
} from "lucide-react";

import { CountryCitySelector } from "@/components/shared/CountryCitySelector";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const dict = getDictionary(locale);

  async function handleContactSubmit(formData: FormData) {
    "use server";
    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const country = formData.get("country")?.toString() || "";
    const city = formData.get("city")?.toString() || "";
    const topic = formData.get("topic")?.toString() || "GENERAL";
    const message = formData.get("message")?.toString() || "";

    // Dynamic import to avoid circular dependencies
    const { crmService } = await import("@/server/services/CrmService");
    await crmService.captureContactInquiry({
      name,
      email,
      phone,
      country,
      city,
      topic,
      message,
      locale,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <MessageSquare className="w-4 h-4 text-brand-400" />
            <span>{isRtl ? "فريق دعم متخصص على مدار الساعة" : "We are here to support your child's journey"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight text-white">
            {isRtl ? "تواصل مع فريق أكاديمية براعم العربية" : "Contact Our Academic & Support Team"}
          </h1>
          <p className="mt-4 text-base text-slate-200 max-w-xl mx-auto">
            {isRtl
              ? "سواء كان لديك استفسار حول المناهج، جداول الحصص، أو رغبة في تقييم تشخيصي، فريقنا يسعد بمساعدتك."
              : "Have questions about placement, cohort schedules, or curriculum? Our academic advisors are ready to assist."}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Column */}
          <div className="space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                {isRtl ? "قنوات التواصل المباشرة" : "Direct Channels"}
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isRtl ? "واتساب المباشر" : "WhatsApp Concierge"}
                  </div>
                  <a
                    href="https://wa.me/31685663010"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-brand-600 hover:underline"
                  >
                    +31 6856 630 10
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isRtl ? "رد فوري خلال ساعات العمل" : "Instant replies during academy hours"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isRtl ? "البريد الإلكتروني" : "Email Support"}
                  </div>
                  <a
                    href="mailto:support@arabickidsacademy.com"
                    className="text-sm font-bold text-slate-800 hover:text-brand-600"
                  >
                    support@arabickidsacademy.com
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isRtl ? "متوسط الرد: أقل من ساعتين" : "Average response: under 2 hours"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isRtl ? "ساعات الدعم الأكاديمي" : "Support Hours"}
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {isRtl ? "السبت - الخميس: 8 صباحاً - 9 مساءً (UTC)" : "Mon - Sat: 8:00 AM - 9:00 PM (UTC)"}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isRtl ? "متاح في أوقات أوروبا والشرق الأوسط" : "Aligned with EU, UK & Middle East time zones"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Inquiry / Safe Charter */}
            <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-3xl text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{isRtl ? "ميثاق حماية البيانات" : "Privacy & COPPA Commitment"}</span>
              </div>
              <p className="leading-relaxed">
                {isRtl
                  ? "معلوماتك سرية تماماً وتستخدم حصراً للتواصل معك بشأن متطلبات تعلم طفلك. لا نقوم بمشاركة أي بيانات مع معلنين."
                  : "All inquiries are handled with strict confidentiality and never shared with third parties or external marketers."}
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-2 p-8 sm:p-10 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {isRtl ? "أرسل استفسارك وسنعاود الاتصال بك" : "Send Us a Message"}
            </h3>
            <p className="text-sm text-slate-500 mb-8">
              {isRtl
                ? "املأ النموذج أدناه وسيقوم أحد مستشارينا الأكاديميين بالتواصل معك خلال ساعتين."
                : "Fill out the form below and an academic advisor will get back to you within 2 business hours."}
            </p>

            <form action={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isRtl ? "الاسم الكامل لولي الأمر *" : "Parent Full Name *"}
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={isRtl ? "مثال: طارق عبد الرحمن" : "e.g. Sarah Jenkins"}
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isRtl ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder={isRtl ? "+966 50 123 4567" : "+31 6 12345678"}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isRtl ? "موضوع الاستفسار" : "Topic"}
                  </label>
                  <select
                    name="topic"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  >
                    <option value="PLACEMENT">{isRtl ? "تحديد المستوى والتسجيل" : "Placement & Enrollment"}</option>
                    <option value="CURRICULUM">{isRtl ? "المناهج والبرامج الأكاديمية" : "Curriculum & Programs"}</option>
                    <option value="PRICING">{isRtl ? "الأسعار وخطط الاشتراكات" : "Pricing & Subscriptions"}</option>
                    <option value="INSTITUTION">{isRtl ? "شراكات المدارس والمراكز" : "Institutional School Hub"}</option>
                    <option value="TECHNICAL">{isRtl ? "دعم تقني للحصص التفاعلية" : "Technical Support"}</option>
                  </select>
                </div>
              </div>

              <CountryCitySelector
                nameCountry="country"
                nameCity="city"
                locale={locale}
                countryLabel={isRtl ? "الدولة (اختياري)" : "Country (Optional)"}
                cityLabel={isRtl ? "المدينة (اختياري)" : "City (Optional)"}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isRtl ? "رسالتك أو تفاصيل استفسارك *" : "Your Message *"}
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder={
                    isRtl
                      ? "اكتب تفاصيل استفسارك، أعمار أطفالك، ومستواهم الحالي في اللغة العربية..."
                      : "Tell us about your child's age, Arabic background, and any specific learning goals..."
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 gradient-brand text-white font-bold text-sm rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isRtl ? "إرسال الاستفسار الآن" : "Send Message"}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
