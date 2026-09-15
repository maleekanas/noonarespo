import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { administrationService } from "@/server/services/AdministrationService";
import { UserStatus, AgeGroup } from "@prisma/client";
import { requireAdminSession } from "@/lib/auth/currentUser";
import {
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

export default async function AdminStudentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; age?: string }>;
}) {
  const { locale } = await params;
  const { status: filterStatus, age: filterAge } = await searchParams;
  const adminSession = await requireAdminSession(locale);

  let students = await administrationService.getAllStudents();

  if (filterStatus && filterStatus !== "ALL") {
    students = students.filter((s) => s.status === filterStatus);
  }
  if (filterAge && filterAge !== "ALL") {
    students = students.filter((s) => s.ageGroup === filterAge);
  }

  async function handleToggleStatus(formData: FormData) {
    "use server";
    const studentId = formData.get("studentId")?.toString();
    const currentStatus = formData.get("currentStatus")?.toString();
    const reason = formData.get("reason")?.toString() || "إجراء إداري دوري";

    if (!studentId || !currentStatus) return;

    const newStatus =
      currentStatus === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;

    await administrationService.setStudentStatus(
      studentId,
      newStatus,
      reason,
      adminSession
    );

    revalidatePath(`/${locale}/admin/students`);
    revalidatePath(`/${locale}/admin/audit-logs`);
    revalidatePath(`/${locale}/admin`);
  }

  const ageLabels: Record<AgeGroup, string> = {
    [AgeGroup.AGE_4_6]: "4 - 6 سنوات (براعم)",
    [AgeGroup.AGE_7_10]: "7 - 10 سنوات (مستكشفون)",
    [AgeGroup.AGE_11_13]: "11 - 13 سنة (رواد)",
    [AgeGroup.AGE_14_16]: "14 - 16 سنة (شباب)",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              لوحة الإدارة العامة
            </Link>
            <span>/</span>
            <span>شؤون الطلاب وحماية الطفل</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            سجل الطلاب والحوكمة الأكاديمية 🎒
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الحسابات النشطة، توثيق موافقة ولي الأمر، وضوابط الخصوصية (COPPA & GDPR-K)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>معايير أمان وخصوصية الطفل مفعلة 100%</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">حالة الحساب:</span>
          <Link
            href={`/${locale}/admin/students?status=ALL${filterAge ? `&age=${filterAge}` : ""}`}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              !filterStatus || filterStatus === "ALL"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            الكل ({students.length})
          </Link>
          <Link
            href={`/${locale}/admin/students?status=ACTIVE${filterAge ? `&age=${filterAge}` : ""}`}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filterStatus === "ACTIVE"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            نشط فقط
          </Link>
          <Link
            href={`/${locale}/admin/students?status=SUSPENDED${filterAge ? `&age=${filterAge}` : ""}`}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filterStatus === "SUSPENDED"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            مجمد
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">الفئة العمرية:</span>
          {Object.values(AgeGroup).map((ag) => (
            <Link
              key={ag}
              href={`/${locale}/admin/students?age=${ag}${filterStatus ? `&status=${filterStatus}` : ""}`}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                filterAge === ag
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {ag.replace("AGE_", "").replace("_", "-")} سنوات
            </Link>
          ))}
        </div>
      </div>

      {/* Students Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {students.map((student) => {
          const isActive = student.status === UserStatus.ACTIVE;
          return (
            <div
              key={student.id}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-sm space-y-4 ${
                isActive ? "border-slate-200 hover:border-brand-300" : "border-rose-200 bg-rose-50/20"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-sm ${
                      isActive
                        ? "gradient-brand text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {student.firstName[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {student.firstName} {student.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{ageLabels[student.ageGroup]}</span>
                      <span>•</span>
                      <span>تاريخ الميلاد: {student.dateOfBirth.toISOString().split("T")[0]}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {isActive ? "حساب نشط ✓" : "حساب معلق / مجمد ⏸"}
                </span>
              </div>

              {/* Guardian & Privacy Consent Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ولي الأمر المعتمد:</span>
                  <span className="font-bold text-slate-800">{student.guardianName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">هاتف الطوارئ:</span>
                  <span className="font-mono text-slate-700">{student.guardianPhone}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                    <span>موافقة ولي الأمر (COPPA/GDPR):</span>
                  </span>
                  {student.guardianConsentGivenAt ? (
                    <span className="font-bold text-emerald-700">
                      موثقة ({student.guardianConsentGivenAt.toISOString().split("T")[0]})
                    </span>
                  ) : (
                    <span className="font-bold text-rose-700">
                      لا يوجد سجل موافقة موثق
                    </span>
                  )}
                </div>
              </div>

              {/* Operational Meta & Status Toggle Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                  <GraduationCap className="w-4 h-4 text-brand-600" />
                  <span>الفصول المسجل بها: {student.enrolledClassesCount}</span>
                </div>

                <form action={handleToggleStatus} className="flex items-center gap-2">
                  <input type="hidden" name="studentId" value={student.id} />
                  <input type="hidden" name="currentStatus" value={student.status} />
                  <input
                    type="hidden"
                    name="reason"
                    value={
                      isActive
                        ? "تجميد الحساب من قبل إدارة المدرسة للمراجعة الأكاديمية"
                        : "إعادة تفعيل الحساب بعد اكتمال المراجعة"
                    }
                  />
                  <button
                    type="submit"
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      isActive
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {isActive ? "تجميد الحساب ⏸" : "تنشيط الحساب ▶"}
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
