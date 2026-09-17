import React from "react";
import Link from "next/link";
import { ArrowRight, Printer, FileText } from "lucide-react";
import { printablesRepository } from "@/server/repositories/PrintablesRepository";
import { ParentPrintablesClient } from "@/components/printables/ParentPrintablesClient";
import { getDictionary } from "@/lib/localization";

export default async function ParentPrintablesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const pt = dict.parentPrintables;

  const printables = await printablesRepository.getAllPrintables();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href={`/${locale}/parent`} className="hover:text-brand-600 flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
              {pt.backToParentDashboard}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {pt.breadcrumbCurrent}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Printer className="w-8 h-8 text-brand-600" />
            {pt.pageHeading}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {pt.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl shadow-sm">
          <FileText className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-emerald-900 text-sm">
              {pt.printReadyLabel}
            </div>
            <div className="text-emerald-700">
              {pt.homePrintersDesc}
            </div>
          </div>
        </div>
      </div>

      {/* Main Printables Client Hub */}
      <ParentPrintablesClient
        initialPrintables={printables}
        locale={locale}
      />
    </div>
  );
}
