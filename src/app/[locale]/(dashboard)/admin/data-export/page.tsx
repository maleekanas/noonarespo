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

export default async function DataExportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const exportCards = [
    {
      id: "ALL",
      titleAr: "النسخة الاحتياطية الشاملة للأكاديمية",
      titleEn: "Full Academy Backup Bundle",
      descriptionAr: "حزمة بيانات موحدة تتضمن سجلات الطلاب، الفصول، المعاملات المالية، وسجلات الأمان الشاملة بتنسيق JSON المعياري.",
      descriptionEn: "Consolidated system archive containing students, classes, invoices, and cryptographic audit trails in standard JSON.",
      icon: <Database className="w-6 h-6 text-brand-600" />,
      formats: ["json"],
      badgeAr: "شامل كل البيانات",
      badgeEn: "Full Archive",
    },
    {
      id: "STUDENTS",
      titleAr: "سجلات الطلاب وموافقات أولياء الأمور",
      titleEn: "Students & Parental Consent Roster",
      descriptionAr: "بيانات الطلاب المسجلين، الفئات العمرية، اللغات الأصلية، وتواريخ موافقة ولي الأمر وفق معايير COPPA و GDPR-K.",
      descriptionEn: "Enrolled student records, age brackets, native tongues, and verified parental consent timestamps per COPPA and GDPR-K.",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      formats: ["json", "csv"],
      badgeAr: "حماية الطفل COPPA",
      badgeEn: "COPPA / GDPR-K",
    },
    {
      id: "CLASSES",
      titleAr: "الفصول الدراسية واستيعاب المجموعات",
      titleEn: "Class Cohorts & Academic Capacity",
      descriptionAr: "مجموعات الفصول، البرامج الأكاديمية الـ 7، السعة القصوى (6 طلاب)، ونسب إشغال المقاعد الحالية.",
      descriptionEn: "Active class groups, 7 academic programs, maximum cohort limits (6 max), and live seat utilization.",
      icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
      formats: ["json", "csv"],
      badgeAr: "المسارات الأكاديمية",
      badgeEn: "7 Programs",
    },
    {
      id: "FINANCIAL",
      titleAr: "الدفاتر المالية والفواتير ورواتب المعلمين",
      titleEn: "Financial Ledger, Invoices & Payroll",
      descriptionAr: "الفواتير الضريبية، اشتراكات أولياء الأمور النشطة، وسجلات استحقاقات المعلمين بالوحدات الصحيحة الدقيقة.",
      descriptionEn: "Itemized tax invoices, active parent subscriptions, and teacher payroll records in integer minor units.",
      icon: <CreditCard className="w-6 h-6 text-emerald-600" />,
      formats: ["json", "csv"],
      badgeAr: "دقة الحسابات",
      badgeEn: "Minor Units",
    },
    {
      id: "AUDIT_LOGS",
      titleAr: "سجل التدقيق الأمني المشفر (SHA-256)",
      titleEn: "Cryptographic Security Audit Trail",
      descriptionAr: "سجلات الحركات الحساسة مع بصمات التشفير الرقمية SHA-256 لإثبات عدم التلاعب بالبيانات وسلامة النظام.",
      descriptionEn: "Immutable audit logs with SHA-256 cryptographic hashes for non-repudiation and external compliance audits.",
      icon: <Lock className="w-6 h-6 text-purple-600" />,
      formats: ["json", "csv"],
      badgeAr: "سجل غير قابل للتعديل",
      badgeEn: "SHA-256 Immutable",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href={`/${locale}/admin`} className="hover:text-brand-600 flex items-center gap-1">
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
            {isAr ? "العودة إلى لوحة العمليات" : "Back to Admin Hub"}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">{isAr ? "تصدير البيانات والنسخ الاحتياطي" : "Data Portability & Backup"}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
          <Download className="w-7 h-7 text-brand-600" />
          {isAr ? "مركز تصدير البيانات والامتثال (GDPR / COPPA)" : "Data Portability & Export Center"}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {isAr
            ? "تصدير وتنزيل البيانات الرسمية للأكاديمية بما يتوافق مع المادة 20 من اللائحة العامة لحماية البيانات (GDPR) وقانون خصوصية الأطفال (COPPA)."
            : "Export and download academy records in compliance with GDPR Article 20 (Right to Data Portability) and COPPA privacy standards."}
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
              {isAr ? "ضمانات حماية البيانات وخصوصية الأطفال" : "Child Data Privacy & Portability Protections"}
            </h2>
            <p className="text-xs text-blue-800 mt-0.5">
              {isAr
                ? "يتم تصفية جميع البيانات الحساسة مثل كلمات المرور والملاحظات التشخيصية الخاصة للمعلمين قبل التصدير. لا يتم تصدير سوى السجلات المعتمدة لأولياء الأمور والإدارة."
                : "All sensitive credentials and private teacher diagnostic notes are strictly filtered. Only certified records are included in compliance archives."}
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
                    <h3 className="font-bold text-slate-900 text-base">{isAr ? card.titleAr : card.titleEn}</h3>
                    <span className="inline-block mt-0.5 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      {isAr ? card.badgeAr : card.badgeEn}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                {isAr ? card.descriptionAr : card.descriptionEn}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              {card.formats.includes("json") && (
                <a
                  href={`/api/admin/export?category=${card.id}&format=json`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <FileJson className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? "تحميل JSON" : "Download JSON"}</span>
                </a>
              )}

              {card.formats.includes("csv") && (
                <a
                  href={`/api/admin/export?category=${card.id}&format=csv`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? "تحميل جدول CSV" : "Download CSV"}</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
