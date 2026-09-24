import React from "react";
import Link from "next/link";
import { administrationService } from "@/server/services/AdministrationService";
import { AuditActionCategory } from "@/server/repositories/AdministrationRepository";
import { requireAdminSession } from "@/lib/auth/currentUser";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Filter,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  FileSpreadsheet,
} from "lucide-react";

export default async function AdminAuditLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const { category: filterCategory, q: searchQuery } = await searchParams;

  let logs = await administrationService.getAuditLogs(
    filterCategory && filterCategory !== "ALL"
      ? { category: filterCategory as AuditActionCategory }
      : undefined
  );

  if (searchQuery && searchQuery.trim()) {
    const term = searchQuery.trim().toLowerCase();
    logs = logs.filter(
      (log) =>
        log.actorEmail.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        (log.targetEntityId && log.targetEntityId.toLowerCase().includes(term)) ||
        (log.diffSummary && log.diffSummary.toLowerCase().includes(term)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(term))
    );
  }

  // The header badge and each row's checkmark used to be static markup --
  // always claiming "100% verified" regardless of whether the log's hash
  // actually matched. administrationService.verifyLogIntegrity() already
  // recomputes each entry's SHA-256 and compares it; this actually runs it
  // per visible row so the badge reflects a real check.
  const integrityResults = await Promise.all(
    logs.map((log) => administrationService.verifyLogIntegrity(log.id))
  );
  const integrityByLogId = new Map(logs.map((log, idx) => [log.id, integrityResults[idx]]));
  const allVerified = integrityResults.every(Boolean);

  const categoryLabels: Record<AuditActionCategory, string> = {
    AUTH: "المصادقة والأمان",
    USER_MANAGEMENT: "شؤون المستخدمين",
    ACADEMIC: "العمليات الأكاديمية",
    FINANCE: "المالية والاشتراكات",
    SECURITY: "إعدادات الحماية",
  };

  const categoryColors: Record<AuditActionCategory, string> = {
    AUTH: "bg-blue-50 text-blue-700 border-blue-200",
    USER_MANAGEMENT: "bg-purple-50 text-purple-700 border-purple-200",
    ACADEMIC: "bg-emerald-50 text-emerald-700 border-emerald-200",
    FINANCE: "bg-amber-50 text-amber-700 border-amber-200",
    SECURITY: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              لوحة الإدارة العامة
            </Link>
            <span>/</span>
            <span>الأمان والامتثال</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            سجل العمليات والتدقيق الأمني المشفر 🛡️
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            سجل غير قابل للتعديل (Immutable Ledger) موثق بخوارزمية SHA-256 لضمان الشفافية والامتثال
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              allVerified
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200 animate-pulse"
            }`}
          >
            {allVerified ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            )}
            <span>
              {allVerified
                ? "توقيع التشفير (SHA-256): سليم 100%"
                : "تنبيه: تعذر التحقق من بعض السجلات — قد تكون البيانات معدَّلة"}
            </span>
          </div>

          <a
            href="/api/admin/export?category=AUDIT_LOGS&format=csv"
            download="audit_logs.csv"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-500 me-1 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>التصنيف:</span>
          </span>

          <Link
            href={`/${locale}/admin/audit-logs?category=ALL${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              !filterCategory || filterCategory === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            كافة العمليات
          </Link>

          {Object.keys(categoryLabels).map((cat) => (
            <Link
              key={cat}
              href={`/${locale}/admin/audit-logs?category=${cat}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                filterCategory === cat
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {categoryLabels[cat as AuditActionCategory]}
            </Link>
          ))}
        </div>

        {/* Search by actor/action/ID */}
        <form method="GET" action={`/${locale}/admin/audit-logs`} className="flex items-center gap-2">
          {filterCategory && <input type="hidden" name="category" value={filterCategory} />}
          <div className="relative">
            <input
              name="q"
              type="text"
              defaultValue={searchQuery || ""}
              placeholder="بحث بالبريد أو المعرف أو الإجراء..."
              className="px-3 py-1.5 pe-8 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 w-56 sm:w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
          >
            بحث
          </button>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-600" />
            <span>سجل الحركات الموثقة</span>
          </h2>
          <span className="text-xs text-slate-400">
            تحديث فوري عند أي إجراء إداري أو مالي أو أمني
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="py-4 space-y-2 hover:bg-slate-50/50 p-3 rounded-2xl transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${categoryColors[log.category]}`}
                  >
                    {categoryLabels[log.category]}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {log.action}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>IP: {log.ipAddress}</span>
                  <span>•</span>
                  <span>{log.timestamp.toISOString().replace("T", " ").substring(0, 19)} UTC</span>
                </div>
              </div>

              <div className="text-slate-700 font-medium text-xs leading-relaxed">
                {log.diffSummary || "تم تنفيذ الإجراء وتوثيقه بنجاح."}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">الفاعل:</span>
                  <span>{log.actorEmail}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                    {log.actorRole}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 truncate max-w-md">
                  <span className="text-emerald-600 font-bold">SHA-256:</span>
                  <span className="truncate">{log.hash}</span>
                  {integrityByLogId.get(log.id) ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <span title="Hash mismatch -- integrity check failed">
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
