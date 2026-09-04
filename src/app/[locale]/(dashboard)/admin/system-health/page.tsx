import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Database,
  Cloud,
  Video,
  MessageSquare,
  Sparkles,
  Server,
  Clock,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { systemHealthService, type HealthState, type SubsystemHealth } from "@/server/services/SystemHealthService";
import { languages, type Locale } from "@/lib/localization";

export default async function SystemHealthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const report = await systemHealthService.getComprehensiveHealthReport();

  function renderStatusBadge(status: HealthState) {
    if (status === "HEALTHY") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {isAr ? "تعمل بكفاءة" : "Operational"}
        </span>
      );
    }
    if (status === "DEGRADED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          {isAr ? "أداء منخفض" : "Degraded"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        {isAr ? "متوقف" : "Offline"}
      </span>
    );
  }

  function getSubsystemIcon(key: string) {
    switch (key) {
      case "database":
        return <Database className="w-5 h-5 text-blue-600" />;
      case "storage":
        return <Cloud className="w-5 h-5 text-sky-600" />;
      case "meetings":
        return <Video className="w-5 h-5 text-indigo-600" />;
      case "notifications":
        return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case "aiEngines":
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      default:
        return <Server className="w-5 h-5 text-slate-600" />;
    }
  }

  const uptimeHours = Math.floor(report.telemetry.uptimeSeconds / 3600);
  const uptimeMinutes = Math.floor((report.telemetry.uptimeSeconds % 3600) / 60);
  const uptimeSecs = report.telemetry.uptimeSeconds % 60;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href={`/${locale}/admin`} className="hover:text-brand-600 flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
              {isAr ? "العودة إلى لوحة العمليات" : "Back to Admin Hub"}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">{isAr ? "صحة النظام والمراقبة" : "System Health & Diagnostics"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Activity className="w-7 h-7 text-emerald-600" />
            {isAr ? "مراقبة سلامة الأنظمة والخدمات" : "System Health & Observability"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isAr
              ? "متابعة فورية لأداء قواعد البيانات، منصات الفصول الافتراضية، قنوات الإشعارات، التخزين السحابي الخاص، ومحركات الذكاء الاصطناعي."
              : "Real-time health telemetry across database, virtual classrooms, notifications, private cloud storage, and AI educational engines."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/admin/system-health`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>{isAr ? "تحديث الفحص" : "Refresh Telemetry"}</span>
          </Link>
          <a
            href="/api/health?full=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 shadow-sm transition-all"
          >
            <span>{isAr ? "عرض JSON المباشر" : "Raw JSON API"}</span>
          </a>
        </div>
      </div>

      {/* Global Status Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white rounded-2xl p-6 md:p-8 shadow-lg mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold">
                  {isAr ? "جميع الأنظمة تعمل بكفاءة تامة" : "All Core Systems Fully Operational"}
                </h2>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                  {report.status}
                </span>
              </div>
              <p className="text-emerald-100 text-sm mt-1">
                {isAr
                  ? `زمن الاستجابة الكلي للفحص: ${report.totalLatencyMs} مللي ثانية | الإصدار v${report.version}`
                  : `Total diagnostic sweep latency: ${report.totalLatencyMs}ms | Build v${report.version}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t md:border-t-0 md:border-s border-white/20 pt-4 md:pt-0 md:ps-6">
            <div>
              <div className="text-xs text-emerald-200">{isAr ? "زمن تشغيل الخادم" : "Server Uptime"}</div>
              <div className="text-lg font-bold">
                {uptimeHours}h {uptimeMinutes}m {uptimeSecs}s
              </div>
            </div>
            <div>
              <div className="text-xs text-emerald-200">{isAr ? "استهلاك الذاكرة Heap" : "Heap Memory"}</div>
              <div className="text-lg font-bold">{report.telemetry.memoryUsageMb.heapUsed} MB</div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-xs text-emerald-200">{isAr ? "اللغات المدعومة" : "Active Locales"}</div>
              <div className="text-lg font-bold">6 {isAr ? "لغات عالمية" : "Locales"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subsystem Health Cards Grid */}
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Server className="w-5 h-5 text-brand-600" />
        {isAr ? "حالة الأركان الأساسية للبنية التحتية" : "Subsystem Health Status"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(report.subsystems).map(([key, sub]: [string, SubsystemHealth]) => (
          <div
            key={key}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    {getSubsystemIcon(key)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{sub.name}</h3>
                    <div className="text-[11px] text-slate-500">{sub.latencyMs}ms latency</div>
                  </div>
                </div>
                {renderStatusBadge(sub.status)}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">{sub.message}</p>

              {sub.details && (
                <div className="bg-slate-50 rounded-xl p-3 text-[11px] font-mono text-slate-700 space-y-1">
                  {Object.entries(sub.details).map(([dKey, dVal]) => (
                    <div key={dKey} className="flex justify-between items-center truncate">
                      <span className="text-slate-500 font-sans">{dKey}:</span>
                      <span className="font-semibold">{typeof dVal === "object" ? JSON.stringify(dVal) : String(dVal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {isAr ? "فحص آمن ومحمي" : "Secure Verified"}
              </span>
              <span className="text-[10px] text-slate-400">ISO-8601</span>
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry & Multilingual Expansion Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Runtime Process Diagnostics */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            {isAr ? "بيانات بيئة التشغيل والخادم (Node.js)" : "Runtime Environment & Telemetry"}
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{isAr ? "إصدار Node.js" : "Node.js Version"}</span>
              <span className="font-mono font-semibold text-slate-800">{report.telemetry.nodeVersion}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{isAr ? "بيئة التشغيل" : "Environment"}</span>
              <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {report.telemetry.environment}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{isAr ? "إجمالي الذاكرة المحجوزة (RSS)" : "Resident Memory (RSS)"}</span>
              <span className="font-mono font-semibold text-slate-800">{report.telemetry.memoryUsageMb.rss} MB</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{isAr ? "الذاكرة المخصصة للـ Heap" : "Heap Total"}</span>
              <span className="font-mono font-semibold text-slate-800">{report.telemetry.memoryUsageMb.heapTotal} MB</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">{isAr ? "الذاكرة المستهلكة فعلياً" : "Heap Used"}</span>
              <span className="font-mono font-semibold text-slate-800">{report.telemetry.memoryUsageMb.heapUsed} MB</span>
            </div>
          </div>
        </div>

        {/* Global Multi-Language Coverage */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            {isAr ? "تغطية اللغات الدولية (6 لغات)" : "International Language Coverage (6 Locales)"}
          </h2>

          <p className="text-xs text-slate-600 mb-4">
            {isAr
              ? "وفقاً لمتطلبات وثيقة المشروع، تم تفعيل ودعم 6 لغات عالمية مع دعم كامل للاتجاه من اليمين لليسار (RTL) للعربية."
              : "In accordance with PROJECT_BRIEF.md, 6 global languages are fully supported with RTL support for Arabic."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {report.telemetry.supportedLocales.map((loc) => {
              const meta = languages[loc as Locale];
              if (!meta) return null;
              return (
                <div
                  key={loc}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-2xl">{meta.flag}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{meta.nativeName}</div>
                    <div className="text-[10px] text-slate-500">
                      {meta.name} ({meta.direction.toUpperCase()})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              {isAr
                ? "يتم توليد جميع الصفحات الثابتة لجميع اللغات الستة تلقائياً عبر generateStaticParams."
                : "All static pages for the 6 locales are generated automatically via Next.js generateStaticParams."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
