"use client";

import { useState } from "react";

const TRIAL_MAX_STUDENTS = 10;
const DEFAULT_PAID_STUDENTS = 35;

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
  defaultBundle,
  bundleLabel,
  studentsLabel,
  trialCapHint,
}: {
  isAr: boolean;
  defaultBundle: string;
  bundleLabel: string;
  studentsLabel: string;
  trialCapHint: string;
}) {
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
          <option value="TRIAL_3_DAYS">
            {isAr
              ? "🌟 تجربة مجانية 3 أيام (10 طلاب كحد أقصى - مجاناً)"
              : "🌟 3-Day Free Trial (Max 10 students - 100% Free)"}
          </option>
          <option value="STARTER">
            {isAr ? "الأساسية Starter (حتى 25 طالباً - €129/ش)" : "Starter (Up to 25 students - €129/mo)"}
          </option>
          <option value="GROWTH">
            {isAr ? "النمو Growth (26 – 100 طالب - €324/ش)" : "Growth (26 – 100 students - €324/mo)"}
          </option>
          <option value="INSTITUTION">
            {isAr
              ? "المؤسسات Institution (100+ طالب - من €584/ش)"
              : "Institution (100+ students - from €584/mo)"}
          </option>
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
