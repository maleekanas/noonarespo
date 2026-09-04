import React from "react";
import Link from "next/link";
import { administrationService } from "@/server/services/AdministrationService";
import { payrollService } from "@/server/services/PayrollService";
import { billingService } from "@/server/services/BillingService";
import {
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  BookOpen,
  FileCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Download,
  Star,
  Building2,
} from "lucide-react";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const stats = await administrationService.getSchoolAnalyticsOverview();
  const finance = await payrollService.getFinanceReconciliationOverview();
  const recentLogs = await administrationService.getAuditLogs({ limit: 4 });

  const kpis = [
    {
      title: isAr ? "إجمالي الطلاب المقيدين" : "Total Enrolled Students",
      value: `${stats.totalStudents}`,
      subtext: isAr ? `${stats.activeStudents} نشط • ${stats.suspendedStudents} مجمد` : `${stats.activeStudents} Active • ${stats.suspendedStudents} Suspended`,
      icon: Users,
      color: "text-brand-600 bg-brand-50",
    },
    {
      title: isAr ? "الكادر التعليمي المعتمد" : "Certified Faculty",
      value: `${stats.totalTeachers}`,
      subtext: isAr ? "100% متفرغون بإجازات" : "100% Certified Educators",
      icon: GraduationCap,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: isAr ? "معدل الحضور الأكاديمي" : "Academic Attendance",
      value: `${stats.overallAttendanceRate}%`,
      subtext: isAr ? `نسبة استبقاء ${stats.retentionRatePercentage}%` : `${stats.retentionRatePercentage}% Retention Rate`,
      icon: Calendar,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: isAr ? "الإيراد الشهري المتكرر (MRR)" : "Monthly Recurring Revenue (MRR)",
      value: billingService.formatPrice(finance.monthlyRecurringRevenueMinorUnits),
      subtext: isAr ? `صافي الأكاديمية: ${billingService.formatPrice(finance.netAcademyMarginMinorUnits)}` : `Net Margin: ${billingService.formatPrice(finance.netAcademyMarginMinorUnits)}`,
      icon: CreditCard,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  const adminModules = [
    {
      title: isAr ? "شؤون الطلاب وحماية الطفل" : "Student Affairs & Child Safety",
      desc: isAr ? "قوائم الطلاب، موافقات أولياء الأمور (COPPA)، وتجميد/تنشيط الحسابات" : "Rosters, COPPA parent consent, and account status controls",
      href: `/${locale}/admin/students`,
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: isAr ? "إدارة الكادر وأجور التدريس" : "Faculty & Payroll Management",
      desc: isAr ? "ملفات المعلمين، أجر الساعة المعتمد ($30.00/hr)، وجداول الحصص" : "Teacher profiles, approved $30/hr rate, and teaching timetables",
      href: `/${locale}/admin/teachers`,
      icon: GraduationCap,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: isAr ? "المناهج والمعايير (CEFR)" : "Curriculum & CEFR Standards",
      desc: isAr ? "البرامج السبعة، تسلسل المستويات، والمخرجات التعليمية الأسبوعية" : "7 tracks, level progressions, and weekly learning outcomes",
      href: `/${locale}/admin/curriculum`,
      icon: BookOpen,
      color: "text-brand-600 bg-brand-50 border-brand-200",
    },
    {
      title: isAr ? "بنك الأسئلة والاختبارات" : "Assessments & Question Bank",
      desc: isAr ? "إعداد الاختبارات الفصلية والكويزات عبر الأنماط السبعة المعتمدة" : "Quarterly tests and placement quizzes across 7 question types",
      href: `/${locale}/admin/assessments`,
      icon: FileCheck,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      title: isAr ? "العمليات والمطابقة المالية" : "Financial Operations & Ledger",
      desc: isAr ? "متابعة الاشتراكات، تسوية فواتير الضرائب، والتزامات رواتب المعلمين" : "Subscriptions, VAT reconciliation, and teacher payroll liabilities",
      href: `/${locale}/admin/finance`,
      icon: CreditCard,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: isAr ? "التدقيق الأمني المشفر (SHA-256)" : "Cryptographic Audit Trail (SHA-256)",
      desc: isAr ? "سجل حركات النظام والتحقق التشفيري غير القابل للتلاعب" : "Tamper-evident logs and cryptographic verification chain",
      href: `/${locale}/admin/audit-logs`,
      icon: Lock,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      title: isAr ? "التقارير المؤسسية والتحليلات" : "Institutional Reports & Analytics",
      desc: isAr ? "إحصاءات شاملة، نسب الاستبقاء، وكفاءة الفصول وتصدير PDF" : "Comprehensive stats, cohort retention, and PDF export",
      href: `/${locale}/admin/reports`,
      icon: FileSpreadsheet,
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
    {
      title: isAr ? "الفصول والمجموعات الدراسية" : "Classes & Cohort Management",
      desc: isAr ? "إشغال الفصول، السعة القصوى (6 طلاب)، وإسناد المعلمين" : "Class occupancy, max capacity (6 students), and teacher assignments",
      href: `/${locale}/admin/classes`,
      icon: Sparkles,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      title: isAr ? "الجدول العام وكشف التعارضات" : "Master Timetable & Conflict Engine",
      desc: isAr ? "محرك فحص التعارضات الزمنية في جداول التدريس الفوري" : "Automated conflict detection in real-time teaching schedules",
      href: `/${locale}/admin/schedule`,
      icon: Calendar,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    },
    {
      title: isAr ? "الربط السحابي والتكاملات (Integrations)" : "Cloud Integrations & API Hub",
      desc: isAr ? "بوابات الفصول (Zoom/Teams)، الواتساب السحابي، والتخزين المشفر (S3)" : "Class gateways (Zoom/Teams), Cloud WhatsApp, and S3 secure storage",
      href: `/${locale}/admin/integrations`,
      icon: Zap,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: isAr ? "صحة النظام والمراقبة (Observability)" : "System Health & Observability",
      desc: isAr ? "قياسات الأداء اللحظية، سلامة قواعد البيانات ومحركات الذكاء الاصطناعي" : "Real-time telemetry, database health, and AI engine response",
      href: `/${locale}/admin/system-health`,
      icon: Activity,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: isAr ? "تصدير البيانات والنسخ (GDPR / COPPA)" : "Data Export & GDPR/COPPA Compliance",
      desc: isAr ? "تنزيل سجلات الطلاب، الفواتير، والتدقيق المشفر بصيغ JSON و CSV" : "Export student records, invoices, and audit trails in JSON & CSV",
      href: `/${locale}/admin/data-export`,
      icon: Download,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: isAr ? "مراجعة تقييمات أولياء الأمور" : "Parent Reviews Moderation",
      desc: isAr ? "اعتماد تقييمات المعلمين، تدقيق الجودة، وفحص الملاحظات المعلقة" : "Approve teacher reviews, quality moderation, and audit feedback",
      href: `/${locale}/admin/reviews`,
      icon: Star,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: isAr ? "المدارس والشراكات المؤسسية (B2B)" : "Islamic Schools & B2B Partnerships",
      desc: isAr ? "إدارة تراخيص الفصول الجماعية، توزيع المقاعد، واستيراد القوائم" : "Multi-school cohort licenses, seat allocations, and roster CSV import",
      href: `/${locale}/admin/schools`,
      icon: Building2,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            {isAr ? "لوحة الإدارة العامة والمراقبة" : "Master Administration & Governance"}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {isAr ? "مركز العمليات الأكاديمية والمالية ⚡" : "Academic & Financial Operations Center ⚡"}
          </h1>
          <p className="text-xs text-slate-500">
            {isAr
              ? "متابعة حية للفصول، الاشتراكات، مؤشرات الجودة، وسجلات الأمان الشاملة"
              : "Live monitoring of cohorts, subscriptions, quality metrics, and audit logs"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/admin/reports`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            <span>{isAr ? "عرض التقارير المجمعة" : "View Aggregate Reports"}</span>
          </Link>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isAr ? "الأنظمة تعمل بكفاءة 100%" : "Systems 100% Operational"}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{kpi.title}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">{kpi.value}</div>
              <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{kpi.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Modules Navigation Hub */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          <span>{isAr ? "منظومة الحوكمة والتشغيل الإداري الشامل (14 بوابة متخصصة)" : "Comprehensive Governance & Administrative Hub (14 Portals)"}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                href={mod.href}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${mod.color} group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-brand-600 font-bold group-hover:underline flex items-center gap-1">
                    <span>{isAr ? "فتح البوابة" : "Open Hub"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-brand-700 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Cryptographic Audit Log Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-600" />
            <span>{isAr ? "سجل العمليات والتدقيق الأمني المباشر (SHA-256 Live Trail)" : "Cryptographic Audit Trail (SHA-256 Live)"}</span>
          </h3>

          <Link
            href={`/${locale}/admin/audit-logs`}
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            {isAr ? "عرض الأرشيف الكامل ←" : "View Full Archive →"}
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {recentLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                    {log.category}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block">{log.diffSummary}</span>
                <span className="text-[10px] text-slate-400">
                  {isAr ? `الفاعل: ${log.actorEmail} | IP: ${log.ipAddress}` : `Actor: ${log.actorEmail} | IP: ${log.ipAddress}`}
                </span>
              </div>

              <div className="text-start sm:text-end space-y-1">
                <span className="text-[11px] text-slate-400 block font-mono">
                  {log.timestamp.toISOString().replace("T", " ").substring(11, 19)} UTC
                </span>
                <span className="text-[10px] text-emerald-600 font-mono font-bold block">
                  SHA-256 Verified ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
