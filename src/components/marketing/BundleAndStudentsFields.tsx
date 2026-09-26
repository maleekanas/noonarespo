"use client";

import { useState } from "react";

const TRIAL_MAX_STUDENTS = 10;
const DEFAULT_PAID_STUDENTS = 35;

const BUNDLE_OPTIONS: Record<string, { trial: string; starter: string; growth: string; institution: string }> = {
  ar: {
    trial: "🌟 تجربة مجانية 3 أيام (10 طلاب كحد أقصى - مجاناً)",
    starter: "الأساسية Starter (حتى 25 طالباً - €129/ش)",
    growth: "النمو Growth (26 – 100 طالب - €324/ش)",
    institution: "المؤسسات Institution (100+ طالب - من €584/ش)",
  },
  nl: {
    trial: "🌟 Gratis proefperiode van 3 dagen (Max 10 leerlingen - 100% Gratis)",
    starter: "Starter (Tot 25 leerlingen - €129/mnd)",
    growth: "Groei (26 – 100 leerlingen - €324/mnd)",
    institution: "Instelling (100+ leerlingen - vanaf €584/mnd)",
  },
  tr: {
    trial: "🌟 3 Günlük Ücretsiz Deneme (Maks 10 öğrenci - %100 Ücretsiz)",
    starter: "Başlangıç (25 öğrenciye kadar - €129/ay)",
    growth: "Büyüme (26 – 100 öğrenci - €324/ay)",
    institution: "Kurumsal (100+ öğrenci - €584/ay'dan başlayan)",
  },
  it: {
    trial: "🌟 Prova gratuita di 3 giorni (Max 10 studenti - 100% Gratuito)",
    starter: "Starter (Fino a 25 studenti - €129/mese)",
    growth: "Crescita (26 – 100 studenti - €324/mese)",
    institution: "Istituzione (100+ studenti - da €584/mese)",
  },
  es: {
    trial: "🌟 Prueba gratuita de 3 días (Máx 10 estudiantes - 100% Gratis)",
    starter: "Básico (Hasta 25 estudiantes - €129/mes)",
    growth: "Crecimiento (26 – 100 estudiantes - €324/mes)",
    institution: "Institución (100+ estudiantes - desde €584/mes)",
  },
  en: {
    trial: "🌟 3-Day Free Trial (Max 10 students - 100% Free)",
    starter: "Starter (Up to 25 students - €129/mo)",
    growth: "Growth (26 – 100 students - €324/mo)",
    institution: "Institution (100+ students - from €584/mo)",
  },
};

/**
 * Renders the "Preferred Bundle" select and "Estimated Number of Students"
 * input together as one client island. When TRIAL_3_DAYS is selected (either
 * as the initial default coming from ?bundle=TRIAL_3_DAYS, or picked live by
 * the visitor), the student count is capped at 10 -- both visually (max
 * attribute, clamped value, hint text) and is also re-validated server-side
 * in the form action, since a client-only cap can always be bypassed.
 */
export function BundleAndStudentsFields({
  isAr,
  locale,
  defaultBundle,
  bundleLabel,
  studentsLabel,
  trialCapHint,
}: {
  isAr?: boolean;
  locale?: string;
  defaultBundle: string;
  bundleLabel: string;
  studentsLabel: string;
  trialCapHint: string;
}) {
  const activeLocale = locale || (isAr ? "ar" : "en");
  const options = BUNDLE_OPTIONS[activeLocale] || BUNDLE_OPTIONS.en;

  const [bundle, setBundle] = useState(defaultBundle);
  const [students, setStudents] = useState<number | string>(
    defaultBundle === "TRIAL_3_DAYS" ? TRIAL_MAX_STUDENTS : DEFAULT_PAID_STUDENTS
  );
  const isTrial = bundle === "TRIAL_3_DAYS";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">{bundleLabel}</label>
        <select
          name="bundlePreference"
          value={bundle}
          onChange={(e) => {
            const value = e.target.value;
            setBundle(value);
            if (value === "TRIAL_3_DAYS" && Number(students) > TRIAL_MAX_STUDENTS) {
              setStudents(TRIAL_MAX_STUDENTS);
            }
          }}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start bg-white"
        >
          <option value="TRIAL_3_DAYS">{options.trial}</option>
          <option value="STARTER">{options.starter}</option>
          <option value="GROWTH">{options.growth}</option>
          <option value="INSTITUTION">{options.institution}</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">{studentsLabel}</label>
        <input
          name="studentsEstimate"
          type="number"
          min={1}
          max={isTrial ? TRIAL_MAX_STUDENTS : undefined}
          required
          value={students}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              setStudents("");
              return;
            }
            const parsed = Number(raw);
            if (isTrial && parsed > TRIAL_MAX_STUDENTS) {
              setStudents(TRIAL_MAX_STUDENTS);
            } else {
              setStudents(parsed);
            }
          }}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
        />
        {isTrial && <p className="text-[11px] text-emerald-600 font-semibold mt-1">{trialCapHint}</p>}
      </div>
    </div>
  );
}
