import React from "react";
import Link from "next/link";
import {
  Download,
  ArrowRight,
  Shield,
  FileJson,
  FileSpreadsheet,
  Users,
  BookOpen,
  CreditCard,
  Lock,
  Database,
  CheckCircle2,
} from "lucide-react";
import { getDictionary } from "@/lib/localization";
import { requireAdminSession } from "@/lib/auth/currentUser";

export default async function DataExportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const de = dict.adminDataExport;

  const exportCards = [
    {
      id: "ALL",
      title: de.cardAllTitle,
      description: de.cardAllDesc,
      icon: <Database className="w-6 h-6 text-brand-600" />,
      formats: ["json"],
      badge: de.cardAllBadge,
    },
    {
      id: "STUDENTS",
      title: de.cardStudentsTitle,
      description: de.cardStudentsDesc,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      formats: ["json", "csv"],
      badge: de.cardStudentsBadge,
    },
    {
      id: "CLASSES",
      title: de.cardClassesTitle,
      description: de.cardClassesDesc,
      icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
      formats: ["json", "csv"],
      badge: de.cardClassesBadge,
    },
    {
      id: "FINANCIAL",
      title: de.cardFinancialTitle,
      description: de.cardFinancialDesc,
      icon: <CreditCard className="w-6 h-6 text-emerald-600" />,
      formats: ["json", "csv"],
      badge: de.cardFinancialBadge,
    },
    {
      id: "AUDIT_LOGS",
      title: de.cardAuditTitle,
      description: de.cardAuditDesc,
      icon: <Lock className="w-6 h-6 text-purple-600" />,
      formats: ["json", "csv"],
      badge: de.cardAuditBadge,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href={`/${locale}/admin`} className="hover:text-brand-600 flex items-center gap-1">
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
            {de.backToAdminHub}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">{de.breadcrumbCurrent}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
          <Download className="w-7 h-7 text-brand-600" />
          {de.pageHeading}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {de.pageSubtitle}
        </p>
      </div>

      {/* Compliance Guarantee Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {de.complianceHeading}
            </h2>
            <p className="text-xs text-blue-800 mt-0.5">
              {de.complianceDesc}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-white text-blue-900 text-xs font-bold rounded-lg border border-blue-200 shrink-0">
          GDPR Art. 20 / COPPA
        </span>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {exportCards.map((card) => (
          <div
            key={card.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{card.title}</h3>
                    <span className="inline-block mt-0.5 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      {card.badge}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                {card.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              {card.formats.includes("json") && (
                <a
                  href={`/api/admin/export?category=${card.id}&format=json`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <FileJson className="w-4 h-4 text-emerald-400" />
                  <span>{de.downloadJson}</span>
                </a>
              )}

              {card.formats.includes("csv") && (
                <a
                  href={`/api/admin/export?category=${card.id}&format=csv`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{de.downloadCsv}</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
