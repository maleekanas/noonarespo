"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Users, ArrowRight, ShieldCheck, Calculator, Star } from "lucide-react";
import { B2B_BUNDLES, B2B_TRIAL_BUNDLE, type B2BBundleDefinition } from "@/lib/constants/b2bBundles";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

interface B2BBundleCalculatorProps {
  locale: string;
}

export function B2BBundleCalculator({ locale }: B2BBundleCalculatorProps) {
  const isAr = locale === "ar";
  const [studentCount, setStudentCount] = useState<number>(35);

  // Determine recommended bundle based on student headcount
  let activeTier: "STARTER" | "GROWTH" | "INSTITUTION" = "GROWTH";
  if (studentCount <= 25) {
    activeTier = "STARTER";
  } else if (studentCount <= 100) {
    activeTier = "GROWTH";
  } else {
    activeTier = "INSTITUTION";
  }

  const bundles: B2BBundleDefinition[] = [
    B2B_BUNDLES.STARTER,
    B2B_BUNDLES.GROWTH,
    B2B_BUNDLES.INSTITUTION,
  ];

  const currentBundle = B2B_BUNDLES[activeTier];
  const perStudentCost = Math.round((currentBundle.priceMonthlyEur / Math.max(studentCount, 1)) * 10) / 10;

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg space-y-10 max-w-5xl mx-auto">
      {/* Interactive Headcount Slider */}
      <div className="space-y-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
          <Calculator className="w-4 h-4" />
          <span>{isAr ? "حاسبة باقات المؤسسات والمعلمين المستقلين" : "Interactive B2B Bundle Calculator"}</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isAr ? "كم عدد الطلاب المتوقع تسجيلهم؟" : "How many students are you planning to enroll?"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            {isAr
              ? "اختر عدد مقاعد الطلاب لترشيح الباقة المثالية لمؤسستك مع خصم حصري 35%"
              : "Adjust the student headcount to find the best bundle tier for your institution with a 35% discount."}
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between font-extrabold text-slate-900">
            <span className="text-xs text-slate-500">5 {isAr ? "طلاب" : "students"}</span>
            <span className="text-3xl sm:text-4xl text-brand-600 flex items-center gap-2">
              <Users className="w-7 h-7 text-brand-500" />
              <span>{studentCount}</span>
              <span className="text-sm font-bold text-slate-600">{isAr ? "طالباً" : "students"}</span>
            </span>
            <span className="text-xs text-slate-500">200+ {isAr ? "طالب" : "students"}</span>
          </div>

          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={studentCount}
            onChange={(e) => setStudentCount(parseInt(e.target.value, 10))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 pt-1">
            <span>{isAr ? "الباقة المرشحة تلقائياً:" : "Recommended Bundle:"}</span>
            <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-800 font-extrabold">
              {isAr ? currentBundle.nameAr : currentBundle.nameEn}
            </span>
          </div>
        </div>
      </div>

      {/* 3-Day Free Trial Evaluation Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "تجربة مؤسسية مجانية لمدة 3 أيام" : "Institutional 3-Day Free Trial"}</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-black text-white">
            {isAr ? "تريد تقييم المنظومة مع فريقك وطلابك أولاً؟" : "Want to evaluate the platform before committing?"}
          </h4>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            {isAr
              ? "احصل على تجربة مجانية فورية لمدة 3 أيام تسع حتى 10 طلاب مع كافة الميزات المؤسسية: التسجيل الجماعي، الفصل التفاعلي الحي، لوحة تحكم المشرف، وتقارير الحضور — بدون أي بطاقة بنكية."
              : "Get instant 3-day access for up to 10 students with all essential B2B features: bulk roster onboarding, live collaborative classroom, scoped school admin dashboard, and attendance reporting — zero credit card required."}
          </p>
        </div>
        <Link
          href={`/${locale}/schools?bundle=TRIAL_3_DAYS#apply`}
          className="shrink-0 px-6 py-3.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
        >
          <span>{isAr ? "طلب تجربة مجانية (3 أيام • 10 طلاب)" : "Start 3-Day Trial (10 Students)"}</span>
          <DirectionalIcon icon={ArrowRight} locale={locale} className="w-4 h-4" />
        </Link>
      </div>

      {/* 3 Bundles Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {bundles.map((bundle) => {
          const isSelected = bundle.id === activeTier;
          return (
            <div
              key={bundle.id}
              onClick={() => {
                if (bundle.id === "STARTER") setStudentCount(20);
                if (bundle.id === "GROWTH") setStudentCount(50);
                if (bundle.id === "INSTITUTION") setStudentCount(120);
              }}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all cursor-pointer relative ${
                isSelected
                  ? "bg-gradient-to-b from-brand-900 to-indigo-950 text-white shadow-xl shadow-brand-950/20 ring-4 ring-brand-400 scale-[1.02]"
                  : "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {bundle.badgeAr && (
                <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-slate-900" />
                  <span>{isAr ? bundle.badgeAr : bundle.badgeEn}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xl font-extrabold ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {isAr ? bundle.nameAr : bundle.nameEn}
                    </h4>
                  </div>
                  <p className={`text-xs font-bold mt-1 ${isSelected ? "text-brand-300" : "text-brand-600"}`}>
                    {isAr ? bundle.studentRangeAr : bundle.studentRangeEn}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl sm:text-4xl font-black ${isSelected ? "text-white" : "text-slate-900"}`}>
                      €{bundle.priceMonthlyEur}
                    </span>
                    <span className={`text-xs line-through ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                      €{bundle.originalPriceEur}
                    </span>
                    <span className={`text-xs font-bold ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      /{isAr ? "شهرياً" : "mo"}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {isAr ? "خصم 35% مطبق" : "35% discount applied"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/20 space-y-2.5">
                  {(isAr ? bundle.featuresAr : bundle.featuresEn).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-emerald-400" : "text-emerald-600"}`} />
                      <span className={isSelected ? "text-slate-200" : "text-slate-600"}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/20">
                <Link
                  href={`#apply`}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? "bg-white text-slate-900 hover:bg-slate-100 shadow-md"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <span>{isAr ? "اختيار هذه الباقة والتقديم" : "Select This Bundle & Apply"}</span>
                  <DirectionalIcon icon={ArrowRight} locale={locale} className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-brand-50/60 rounded-2xl p-4 border border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
          <span>
            {isAr
              ? "جميع الباقات تشمل المناهج الـ 7 المعتمدة، الفصول التفاعلية الحية، وتقارير الحضور والإنجاز الرسمية."
              : "All bundles include all 7 accredited tracks, real-time live classrooms, and official attendance & progress reporting."}
          </span>
        </div>
        <div className="font-extrabold text-brand-800 shrink-0">
          ~€{perStudentCost} {isAr ? "لكل طالب / شهرياً فقط" : "per student / month"}
        </div>
      </div>
    </div>
  );
}
