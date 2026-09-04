"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  Award,
  Upload,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Layers,
} from "lucide-react";
import { PartnerSchool } from "@/server/repositories/SchoolRepository";
import { InstitutionalOverviewKPIs } from "@/server/services/SchoolService";

interface SchoolManagementClientProps {
  initialSchools: PartnerSchool[];
  kpis: InstitutionalOverviewKPIs;
  locale: string;
  onOnboardBatch: (params: {
    schoolId: string;
    studentCount: number;
  }) => Promise<{
    messageAr: string;
    messageEn: string;
  }>;
}

export function SchoolManagementClient({
  initialSchools,
  kpis,
  locale,
  onOnboardBatch,
}: SchoolManagementClientProps) {
  const isAr = locale === "ar";
  const [schools, setSchools] = useState<PartnerSchool[]>(initialSchools);
  const [selectedSchool, setSelectedSchool] = useState<PartnerSchool | null>(null);
  const [batchCount, setBatchCount] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  async function handleBatchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSchool) return;

    setIsSubmitting(true);
    try {
      const res = await onOnboardBatch({
        schoolId: selectedSchool.id,
        studentCount: batchCount,
      });

      // Update local state
      setSchools((prev) =>
        prev.map((s) =>
          s.id === selectedSchool.id
            ? {
                ...s,
                licenseSeatsUsed: s.licenseSeatsUsed + batchCount,
                studentsCount: s.studentsCount + batchCount,
              }
            : s
        )
      );

      setFeedbackMessage(isAr ? res.messageAr : res.messageEn);
      setTimeout(() => {
        setSelectedSchool(null);
        setFeedbackMessage(null);
      }, 2500);
    } catch (err: unknown) {
      setFeedbackMessage(err instanceof Error ? err.message : "Error onboarding roster");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">
              {isAr ? "المؤسسات الشريكة" : "Partner Institutions"}
            </div>
            <div className="text-2xl font-black text-slate-900">
              {kpis.totalPartners} {isAr ? "مؤسسات" : "schools"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">
              {isAr ? "المقاعد المرخصة (B2B)" : "Licensed Seats"}
            </div>
            <div className="text-2xl font-black text-slate-900">
              {kpis.totalSeatsLicensed} {isAr ? "مقعد" : "seats"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">
              {isAr ? "الطلاب المسجلون" : "Enrolled Students"}
            </div>
            <div className="text-2xl font-black text-slate-900">
              {kpis.totalEnrolledStudents} {isAr ? "طالب" : "students"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">
              {isAr ? "نسبة استغلال التراخيص" : "Seat Utilization"}
            </div>
            <div className="text-2xl font-black text-slate-900">
              {kpis.overallUtilizationPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Schools Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {isAr ? "سجل المدارس الإسلامية والمراكز الشريكة" : "Institutional Partners Directory"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr
                ? "إدارة تراخيص الفصول الجماعية والمقاعد المخصصة للمدارس والمراكز الدولية"
                : "Manage B2B institutional cohort licenses and allocated seats globally"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
              ● {kpis.totalInstitutionalClasses} {isAr ? "فصول جماعية نشطة" : "Active Cohort Classes"}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">{isAr ? "المؤسسة" : "Institution"}</th>
                <th className="p-4">{isAr ? "الدولة / المدينة" : "Location"}</th>
                <th className="p-4">{isAr ? "النوع" : "Type"}</th>
                <th className="p-4">{isAr ? "استغلال المقاعد" : "Seat Capacity"}</th>
                <th className="p-4">{isAr ? "المسار الأكاديمي" : "Curriculum Track"}</th>
                <th className="p-4 text-center">{isAr ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schools.map((school) => {
                const usedPercent = Math.round(
                  (school.licenseSeatsUsed / school.licenseSeatsTotal) * 100
                );
                return (
                  <tr key={school.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-slate-900 text-sm">
                        {school.nameAr}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {school.nameEn}
                      </div>
                    </td>

                    <td className="p-4 font-medium text-slate-700">
                      {school.country} - {school.city}
                    </td>

                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                        {school.type === "ISLAMIC_SCHOOL"
                          ? (isAr ? "مدرسة إسلامية" : "Islamic School")
                          : school.type === "COMMUNITY_CENTER"
                          ? (isAr ? "مركز مجتمعي" : "Community Center")
                          : (isAr ? "تعاونية منزلية" : "Homeschool Co-op")}
                      </span>
                    </td>

                    <td className="p-4 min-w-[180px]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                        <span>
                          {school.licenseSeatsUsed} / {school.licenseSeatsTotal} {isAr ? "مقعد" : "seats"}
                        </span>
                        <span>{usedPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${usedPercent}%` }}
                          className={`h-full rounded-full ${
                            usedPercent >= 90
                              ? "bg-amber-500"
                              : "bg-brand-600"
                          }`}
                        />
                      </div>
                    </td>

                    <td className="p-4 text-slate-600 font-medium">
                      {school.curriculumTrackAr}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSchool(school);
                          setFeedbackMessage(null);
                        }}
                        className="py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isAr ? "استيراد دفعة طلاب" : "Onboard Roster"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Roster Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-black text-slate-900">
                  {isAr ? "استيراد دفعة طلاب (CSV)" : "Batch Roster Onboarding"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSchool(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedSchool.nameAr}</div>
              <div className="text-slate-500">
                {isAr ? "المقاعد المتاحة في الترخيص:" : "Available license seats:"}{" "}
                <span className="font-bold text-emerald-700">
                  {selectedSchool.licenseSeatsTotal - selectedSchool.licenseSeatsUsed} {isAr ? "مقعد" : "seats"}
                </span>
              </div>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? "عدد الطلاب المراد استيرادهم في هذه الدفعة:" : "Number of students to onboard in batch:"}
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedSchool.licenseSeatsTotal - selectedSchool.licenseSeatsUsed}
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              {feedbackMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSubmitting ? (isAr ? "جارِ الاستيراد..." : "Processing...") : (isAr ? "تأكيد تسجيل الدفعة 🚀" : "Confirm Batch Onboard 🚀")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSchool(null)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
