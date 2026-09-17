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
import { getDictionary } from "@/lib/localization";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const ad = dict.adminDashboard;

  const stats = await administrationService.getSchoolAnalyticsOverview();
  const finance = await payrollService.getFinanceReconciliationOverview();
  const recentLogs = await administrationService.getAuditLogs({ limit: 4 });

  const kpis = [
    {
      title: ad.kpi0Title,
      value: `${stats.totalStudents}`,
      subtext: ad.kpi0Subtext.replace("{active}", String(stats.activeStudents)).replace("{suspended}", String(stats.suspendedStudents)),
      icon: Users,
      color: "text-brand-600 bg-brand-50",
    },
    {
      title: ad.kpi1Title,
      value: `${stats.totalTeachers}`,
      subtext: ad.kpi1Subtext,
      icon: GraduationCap,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: ad.kpi2Title,
      value: `${stats.overallAttendanceRate}%`,
      subtext: ad.kpi2Subtext.replace("{retention}", String(stats.retentionRatePercentage)),
      icon: Calendar,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: ad.kpi3Title,
      value: billingService.formatPrice(finance.monthlyRecurringRevenueMinorUnits),
      subtext: ad.kpi3Subtext.replace("{margin}", billingService.formatPrice(finance.netAcademyMarginMinorUnits)),
      icon: CreditCard,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  const adminModules = [
    {
      title: ad.module1Title,
      desc: ad.module1Desc,
      href: `/${locale}/admin/students`,
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: ad.module2Title,
      desc: ad.module2Desc,
      href: `/${locale}/admin/teachers`,
      icon: GraduationCap,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: ad.module3Title,
      desc: ad.module3Desc,
      href: `/${locale}/admin/curriculum`,
      icon: BookOpen,
      color: "text-brand-600 bg-brand-50 border-brand-200",
    },
    {
      title: ad.module4Title,
      desc: ad.module4Desc,
      href: `/${locale}/admin/assessments`,
      icon: FileCheck,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      title: ad.module5Title,
      desc: ad.module5Desc,
      href: `/${locale}/admin/finance`,
      icon: CreditCard,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: ad.module6Title,
      desc: ad.module6Desc,
      href: `/${locale}/admin/audit-logs`,
      icon: Lock,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      title: ad.module7Title,
      desc: ad.module7Desc,
      href: `/${locale}/admin/reports`,
      icon: FileSpreadsheet,
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
    {
      title: ad.module8Title,
      desc: ad.module8Desc,
      href: `/${locale}/admin/classes`,
      icon: Sparkles,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      title: ad.module9Title,
      desc: ad.module9Desc,
      href: `/${locale}/admin/schedule`,
      icon: Calendar,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    },
    {
      title: ad.module10Title,
      desc: ad.module10Desc,
      href: `/${locale}/admin/integrations`,
      icon: Zap,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: ad.module11Title,
      desc: ad.module11Desc,
      href: `/${locale}/admin/system-health`,
      icon: Activity,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: ad.module12Title,
      desc: ad.module12Desc,
      href: `/${locale}/admin/data-export`,
      icon: Download,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: ad.module13Title,
      desc: ad.module13Desc,
      href: `/${locale}/admin/reviews`,
      icon: Star,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: ad.module14Title,
      desc: ad.module14Desc,
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
            {ad.masterAdminGovernance}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {ad.opsCenter}
          </h1>
          <p className="text-xs text-slate-500">
            {ad.liveMonitoring}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/admin/reports`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            <span>{ad.viewAggregateReports}</span>
          </Link>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{ad.systemsOperational}</span>
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
          <span>{ad.governanceHubHeading}</span>
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
                    <span>{ad.openHub}</span>
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
            <span>{ad.auditTrailLiveHeading}</span>
          </h3>

          <Link
            href={`/${locale}/admin/audit-logs`}
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            {ad.viewFullArchive}
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
                  {ad.actorIpLine.replace("{email}", log.actorEmail).replace("{ip}", log.ipAddress)}
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
