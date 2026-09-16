import React from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/localization";
import { ShieldCheck, Lock, EyeOff, UserCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const isAr = locale === "ar";
  const pp = dict.privacyPage;
  const sectionOrder = [
    "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10",
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

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>{pp.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {pp.title}
        </h1>
        <p className="text-sm text-slate-500">
          {pp.lastUpdated}
        </p>
      </div>

      {/* Safety Commitments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {pp.safety.adFreeTitle}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {pp.safety.adFreeDesc}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {pp.safety.recordingsTitle}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {pp.safety.recordingsDesc}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {pp.safety.parentControlTitle}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {pp.safety.parentControlDesc}
          </p>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-slate-700 text-sm leading-relaxed">
        {sectionOrder.map((key) => {
          const section = pp.sections[key];
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
