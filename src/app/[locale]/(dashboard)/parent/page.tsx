import React from "react";
import Link from "next/link";
import {
  CreditCard,
  MessageSquare,
  Sparkles,
  Calendar,
  Users,
  Award,
  Bell,
  Video,
  FileText,
  ArrowRight,
  Star,
  Target,
  Printer,
} from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";
import { userRepository } from "@/server/repositories/UserRepository";
import { notificationService } from "@/server/services/NotificationService";
import { requireParentProfile } from "@/lib/auth/currentUser";

export default async function ParentDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const { studentId: selectedParam } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;

  const children = await userRepository.getLinkedChildren(parentId);
  const selectedStudentId = selectedParam || (children.length > 0 ? children[0].id : "");
  const selectedChild = children.find((c) => c.id === selectedStudentId) || children[0];

  const notifications = await notificationService.getNotifications(parentId);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Quick Action Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            {isAr ? "بوابة ولي الأمر الموحدة" : "Unified Parent Portal"}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {isAr
              ? `أهلاً بك، أ/ ${profile.firstName} ${profile.lastName} 👨‍👧`
              : `Welcome, ${profile.firstName} ${profile.lastName} 👨‍👧`}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr
              ? "متابعة شاملة لرحلة أطفالك التعليمية، الكفاءات اللغوية، والتواصل المباشر مع المعلمين"
              : "Comprehensive tracking of your children's learning journey, competencies, and teacher messaging"}
          </p>
        </div>

        {/* Multi-Child Switcher Control & Notifications Shortcut */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/parent/notifications`}
            className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/${locale}/parent?studentId=${child.id}`}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  child.id === selectedChild?.id
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {child.firstName} ({child.ageGroup === "AGE_4_6" ? (isAr ? "5 سنوات" : "5 yrs") : (isAr ? "8 سنوات" : "8 yrs")})
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Link
          href={`/${locale}/parent/printables`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "الكراسات والمطبوعات" : "A4 Printables"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "خط وتلوين (A4)" : "Tracing & QR"}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/recommendations?studentId=${selectedChild?.id}`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "توصيات المسار" : "AI Learning Plan"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "خطة CEFR الذكية" : "CEFR Guidance"}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/progress?studentId=${selectedChild?.id}`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "مؤشرات الكفاءات" : "Competencies"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "رادار الإتقان" : "Mastery Radar"}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/messages`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "المحادثات المباشرة" : "Messages"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "تواصل مع المعلم" : "Teacher Chat"}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/meetings`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "لقاء فردي (15 د)" : "1-on-1 Meet"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "استشارة مرئية" : "Video Advisory"}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/reports/weekly?studentId=${selectedChild?.id}`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "التقرير الأسبوعي" : "Weekly Report"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "ملخص الإنجازات" : "Progress Summary"}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/reviews`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Star className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "تقييم الكادر" : "Teacher Reviews"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "تقييم موثق" : "Verified Review"}</span>
          </div>
        </Link>
      </div>

      {/* Progress & Attendance Quick KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "نسبة الحضور" : "Attendance Rate"}</span>
            <span className="text-emerald-600 font-bold">{isAr ? "100% ممتاز" : "100% Excellent"}</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">12 / 12</div>
          <p className="text-xs text-slate-500">{isAr ? "حصة مكتملة هذا الشهر دون أي غياب" : "Completed classes this month with 0 absences"}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "متوسط درجات الواجبات" : "Homework Average"}</span>
            <span className="text-brand-600 font-bold">98%</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">9.8 / 10</div>
          <p className="text-xs text-slate-500">{isAr ? "مصحوبة بنماذج صوتية وتوجيهات تشجيعية" : "Includes audio voice recordings and teacher notes"}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "النقاط والأوسمة" : "XP & Badges"}</span>
            <span className="text-amber-500 font-bold">{isAr ? "المستوى 3" : "Level 3"}</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">450 XP</div>
          <p className="text-xs text-slate-500">{isAr ? "وسام بطل القراءة ووسام المواظبة الذهبي" : "Reading Champion & Golden Streak badges"}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "حالة الاشتراك المالي" : "Subscription Status"}</span>
            <span className="text-emerald-600 font-bold">{isAr ? "نشط" : "Active"}</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{isAr ? "$129 / شهر" : "$129 / mo"}</div>
          <p className="text-xs text-slate-500">{isAr ? "الباقة العائلية (التجديد في 1 أكتوبر)" : "Family Plan (Renews Oct 1)"}</p>
        </div>
      </div>

      {/* Main Sections: Teacher Feedback & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Teacher Evaluation */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <span>{isAr ? "أحدث تقييم وتغذية راجعة من المعلم" : "Latest Teacher Evaluation & Feedback"}</span>
              </h3>
              <Link
                href={`/${locale}/parent/reports/weekly?studentId=${selectedChild?.id}`}
                className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>{isAr ? "التقرير الأسبوعي" : "Weekly Report"}</span>
                <DirectionalIcon icon={ArrowRight} locale={locale} className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-brand text-white font-bold flex items-center justify-center text-xs">
                    {isAr ? "م" : "T"}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{isAr ? "الأستاذ أحمد المنصوري" : "Ustadh Ahmed"}</span>
                    <span className="text-[11px] text-slate-500 block">{isAr ? "مادة القراءة والتجويد" : "Reading & Tajweed"}</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {isAr ? "العلامة: 100/100" : "Grade: 100/100"}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {isAr
                  ? "«ما شاء الله تبارك الله، قراءة ممتازة ومخارج حروف متقنة ونطق سليم لحروف القلقلة. استمر يا بطل!»"
                  : "\"Masha'Allah, excellent reading, precise letter articulation (makharij), and accurate pronunciation of Qalqalah rules. Keep up the great work!\""}
              </p>
            </div>
          </div>

          {/* Upcoming Schedule for Child */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>{isAr ? "جدول الحصص القادمة هذا الأسبوع" : "Upcoming Schedule This Week"}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {isAr ? "فصل النجوم (A1 - القراءة والطلاقة)" : "Stars Cohort (A1 - Reading & Fluency)"}
                    </span>
                    <span className="text-slate-500">{isAr ? "اليوم - 04:00 مساءً (45 دقيقة)" : "Today - 04:00 PM (45 mins)"}</span>
                  </div>
                </div>
                <span className="text-slate-600 font-semibold">{isAr ? "فصل جماعي (6 طلاب كحد أقصى)" : "Small Group (Max 6 students)"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Actions & Invoices */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>{isAr ? "إدارة الأبناء والتسجيل" : "Children & Enrollments"}</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? "إضافة طفل جديد، أو تعديل البيانات الشخصية، أو تسجيل في فصول إضافية."
                : "Add a new child, update profile details, or enroll in additional tracks."}
            </p>
            <div className="space-y-2">
              <Link
                href={`/${locale}/parent/children`}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors text-center block"
              >
                {isAr ? "إدارة ملفات الأبناء" : "Manage Child Profiles"}
              </Link>
              <Link
                href={`/${locale}/parent/enroll`}
                className="w-full py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all text-center block"
              >
                {isAr ? "تسجيل في فصول جديدة" : "Enroll in New Tracks"}
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? "سجل الفواتير والاشتراك" : "Billing & Invoices"}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <span className="font-bold text-slate-800 block">{isAr ? "فاتورة سبتمبر 2026" : "Invoice September 2026"}</span>
                  <span className="text-[11px] text-slate-500">#INV-2026-0901</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                  {isAr ? "مدفوعة ($129)" : "Paid ($129)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
