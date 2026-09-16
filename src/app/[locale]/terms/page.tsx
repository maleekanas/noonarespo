import React from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/localization";
import { FileText, ArrowLeft, ArrowRight, CreditCard, RotateCcw, ShieldAlert } from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const isAr = locale === "ar";
  const tp = dict.termsPage;
  const sectionOrder = [
    "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12",
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:underline"
        >
          <DirectionalIcon icon={isAr ? ArrowRight : ArrowLeft} locale={locale} className="w-4 h-4" />
          <span>{dict.common.back}</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
          <FileText className="w-4 h-4" />
          <span>{tp.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {tp.title}
        </h1>
        <p className="text-sm text-slate-500">
          {tp.lastUpdated}
        </p>
      </div>

      {/* Commercial Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {tp.highlights.billingTitle}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tp.highlights.billingDesc}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {tp.highlights.refundTitle}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tp.highlights.refundDesc}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {tp.highlights.conductTitle}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tp.highlights.conductDesc}
          </p>
        </div>
      </div>

      {/* Main Legal Clauses */}
      <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-slate-700 text-sm leading-relaxed">
        {sectionOrder.map((key) => {
          const section = tp.sections[key];
          return (
            <section key={key} className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">
                {section.title}
              </h2>
              <p>{section.body}</p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
