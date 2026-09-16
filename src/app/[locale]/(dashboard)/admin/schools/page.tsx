import React from "react";
import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { schoolService } from "@/server/services/SchoolService";
import { SchoolManagementClient } from "@/components/admin/SchoolManagementClient";

export default async function AdminSchoolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const schools = await schoolService.getAllSchools();
  const kpis = await schoolService.getInstitutionalKPIs();

  async function handleOnboardBatchAction(params: {
    schoolId: string;
    students: { fullName: string; email?: string }[];
    ageGroup: "AGE_4_6" | "AGE_7_10" | "AGE_11_13" | "AGE_14_16";
  }) {
    "use server";
    return schoolService.onboardBatchRoster(params);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href={`/${locale}/admin`} className="hover:text-brand-600 flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
              {isAr ? "العودة إلى لوحة الإدارة" : "Back to Admin Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {isAr ? "إدارة الشراكات والمدارس" : "Institutional Partners"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-600" />
            {isAr ? "بوابة إدارة المدارس الإسلامية والشراكات (B2B) 🏫" : "Islamic Schools & Institutional B2B Hub 🏫"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isAr
              ? "إدارة تراخيص الفصول الجماعية، توزيع مقاعد الطلاب، واستيراد القوائم الجماعية للمدارس الشريكة حول العالم."
              : "Manage multi-tenancy cohort licenses, allocate student seats, and onboard batch rosters globally."}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-2.5 rounded-2xl shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{isAr ? "تراخيص مؤسسية:" : "B2B Licenses:"}</span>{" "}
            <span>{kpis.totalSeatsUsed} / {kpis.totalSeatsLicensed} {isAr ? "مقعد مفعل" : "active seats"}</span>
          </div>
        </div>
      </div>

      {/* Main School Management Hub */}
      <SchoolManagementClient
        initialSchools={schools}
        kpis={kpis}
        locale={locale}
        onOnboardBatch={handleOnboardBatchAction}
      />
    </div>
  );
}
