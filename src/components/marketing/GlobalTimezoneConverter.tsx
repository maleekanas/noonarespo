"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";

interface GlobalTimezoneConverterProps {
  locale: string;
  isRtl?: boolean;
}

interface TimezoneOption {
  id: string;
  nameEn: string;
  nameAr: string;
  offsetHours: number;
  cohortWeekday: string;
  cohortWeekdayAr: string;
  cohortWeekend: string;
  cohortWeekendAr: string;
}

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  {
    id: "london",
    nameEn: "London (GMT/BST • UTC+0)",
    nameAr: "لندن (توقيت غرينتش • UTC+0)",
    offsetHours: 0,
    cohortWeekday: "Mon & Wed • 16:30 - 17:15",
    cohortWeekdayAr: "الإثنين والأربعاء • 16:30 - 17:15",
    cohortWeekend: "Sat & Sun • 10:00 - 10:45",
    cohortWeekendAr: "السبت والأحد • 10:00 - 10:45",
  },
  {
    id: "amsterdam",
    nameEn: "Amsterdam / Berlin / Paris (CET • UTC+1)",
    nameAr: "أمستردام / برلين / باريس (توقيت وسط أوروبا • UTC+1)",
    offsetHours: 1,
    cohortWeekday: "Mon & Wed • 17:30 - 18:15",
    cohortWeekdayAr: "الإثنين والأربعاء • 17:30 - 18:15",
    cohortWeekend: "Sat & Sun • 11:00 - 11:45",
    cohortWeekendAr: "السبت والأحد • 11:00 - 11:45",
  },
  {
    id: "newyork",
    nameEn: "New York / Toronto (EST • UTC-5)",
    nameAr: "نيويورك / تورونتو (توقيت شرق أمريكا • UTC-5)",
    offsetHours: -5,
    cohortWeekday: "Tue & Thu • 17:00 - 17:45",
    cohortWeekdayAr: "الثلاثاء والخميس • 17:00 - 17:45",
    cohortWeekend: "Sat & Sun • 10:30 - 11:15",
    cohortWeekendAr: "السبت والأحد • 10:30 - 11:15",
  },
  {
    id: "chicago",
    nameEn: "Chicago / Dallas (CST • UTC-6)",
    nameAr: "شيكاغو / دالاس (توقيت وسط أمريكا • UTC-6)",
    offsetHours: -6,
    cohortWeekday: "Tue & Thu • 16:30 - 17:15",
    cohortWeekdayAr: "الثلاثاء والخميس • 16:30 - 17:15",
    cohortWeekend: "Sat & Sun • 09:30 - 10:15",
    cohortWeekendAr: "السبت والأحد • 09:30 - 10:15",
  },
  {
    id: "riyadh",
    nameEn: "Riyadh / Mecca (AST • UTC+3)",
    nameAr: "الرياض / مكة المكرمة (توقيت السعودية • UTC+3)",
    offsetHours: 3,
    cohortWeekday: "Sun & Tue • 17:00 - 17:45",
    cohortWeekdayAr: "الأحد والثلاثاء • 17:00 - 17:45",
    cohortWeekend: "Fri & Sat • 16:00 - 16:45",
    cohortWeekendAr: "الجمعة والسبت • 16:00 - 16:45",
  },
  {
    id: "dubai",
    nameEn: "Dubai / Abu Dhabi (GST • UTC+4)",
    nameAr: "دبي / أبوظبي (توقيت الإمارات • UTC+4)",
    offsetHours: 4,
    cohortWeekday: "Sun & Tue • 18:00 - 18:45",
    cohortWeekdayAr: "الأحد والثلاثاء • 18:00 - 18:45",
    cohortWeekend: "Fri & Sat • 17:00 - 17:45",
    cohortWeekendAr: "الجمعة والسبت • 17:00 - 17:45",
  },
];

export function GlobalTimezoneConverter({ locale, isRtl }: GlobalTimezoneConverterProps) {
  const [selectedTz, setSelectedTz] = useState<string>("amsterdam");
  const activeTz = TIMEZONE_OPTIONS.find((t) => t.id === selectedTz) || TIMEZONE_OPTIONS[0];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{isRtl ? "محوّل مواعيد الحصص المباشرة حسب مدينتك" : "Global Timezone Live Class Converter"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            {isRtl ? "تعرّف على مواعيد الحصص بتوقيت مدينتك المحلي" : "See Live Cohort Times in Your Local Time"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            {isRtl
              ? "نوفر مجموعات صباحية ومسائية تناسب توقيت المدارس في أوروبا، أمريكا الشمالية، ودول الخليج العربي."
              : "We organize weekday after-school and weekend morning cohorts synchronized to school calendars across the UK, EU, US, Canada, and the GCC."}
          </p>
        </div>

        <div className="space-y-3 shrink-0 lg:w-80">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            {isRtl ? "اختر مدينتك أو منطقتك الزمنية:" : "Select your city / timezone:"}
          </label>
          <select
            value={selectedTz}
            onChange={(e) => setSelectedTz(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.id} value={tz.id}>
                {isRtl ? tz.nameAr : tz.nameEn}
              </option>
            ))}
          </select>

          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{isRtl ? "المجموعة المسائية:" : "Weekday Cohort:"}</span>
              <span className="font-bold text-emerald-400">
                {isRtl ? activeTz.cohortWeekdayAr : activeTz.cohortWeekday}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{isRtl ? "مجموعة عطلة الأسبوع:" : "Weekend Cohort:"}</span>
              <span className="font-bold text-amber-300">
                {isRtl ? activeTz.cohortWeekendAr : activeTz.cohortWeekend}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
