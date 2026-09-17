import React from "react";
import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { schoolService } from "@/server/services/SchoolService";
import { SchoolManagementClient } from "@/components/admin/SchoolManagementClient";
import { getDictionary } from "@/lib/localization";
import { requireAdminSession } from "@/lib/auth/currentUser";

export default async function AdminSchoolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const sc = dict.adminSchools;

  const schools = await schoolService.getAllSchools();
  const kpis = await schoolService.getInstitutionalKPIs();

  async function handleOnboardBatchAction(params: {
    schoolId: string;
    students: { fullName: string; email?: string }[];
    ageGroup: "AGE_4_6" | "AGE_7_10" | "AGE_11_13" | "AGE_14_16";
  }) {
    "use server";
    await requireAdminSession(locale);
    return schoolService.onboardBatchRoster({ ...params, locale });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href={`/${locale}/admin`} className="hover:text-brand-600 flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
              {sc.backToAdminDashboard}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {sc.breadcrumbCurrent}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-600" />
            {sc.pageHeading}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {sc.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-2.5 rounded-2xl shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{sc.b2bLicensesLabel}</span>{" "}
            <span>{kpis.totalSeatsUsed} / {kpis.totalSeatsLicensed} {sc.activeSeatsSuffix}</span>
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
