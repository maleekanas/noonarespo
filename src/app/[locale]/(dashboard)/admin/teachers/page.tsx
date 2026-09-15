import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { administrationService } from "@/server/services/AdministrationService";
import { billingService } from "@/server/services/BillingService";
import { requireAdminSession } from "@/lib/auth/currentUser";
import {
  DollarSign,
  Award,
} from "lucide-react";

export default async function AdminTeachersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const adminSession = await requireAdminSession(locale);
  const teachers = await administrationService.getAllTeachers();

  async function handleUpdateRate(formData: FormData) {
    "use server";
    const teacherId = formData.get("teacherId")?.toString();
    const rateDollars = parseFloat(formData.get("rateDollars")?.toString() || "30");

    if (!teacherId || isNaN(rateDollars)) return;

    // Convert dollars to minor units
    const newRateMinorUnits = Math.round(rateDollars * 100);

    await administrationService.updateTeacherHourlyRate(
      teacherId,
      newRateMinorUnits,
      adminSession
    );

    revalidatePath(`/${locale}/admin/teachers`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

  async function handleToggleActive(formData: FormData) {
    "use server";
    const teacherId = formData.get("teacherId")?.toString();
    const currentActive = formData.get("currentActive")?.toString() === "true";

    if (!teacherId) return;

    await administrationService.toggleTeacherStatus(
      teacherId,
      !currentActive,
      adminSession
    );

    revalidatePath(`/${locale}/admin/teachers`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              لوحة الإدارة العامة
            </Link>
            <span>/</span>
            <span>الكادر التعليمي والمعلمون</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            إدارة الكادر التعليمي وأجور التدريس 👨‍🏫
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة إجازات المعلمين، تحديث أجر ساعة التدريس المعتمد، وجدولة الفصول
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>100% من الكادر يحملون إجازات بالسند المعتمد</span>
          </div>
        </div>
      </div>

      {/* Teachers Directory */}
      <div className="space-y-6">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-2xl shadow-sm border border-emerald-100">
                  {teacher.firstName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        teacher.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {teacher.isActive ? "نشط ومتاح ✓" : "معلق مؤقتاً ⏸"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{teacher.email}</p>
                  <p className="text-xs text-slate-600 mt-1.5 font-medium">
                    {teacher.qualifications}
                  </p>
                </div>
              </div>

              {/* Stats Badge */}
              <div className="flex items-center gap-6 text-center">
                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/60">
                  <span className="text-xs text-slate-400 block font-bold">سنوات الخبرة</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {teacher.experienceYears} سنوات
                  </span>
                </div>
                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/60">
                  <span className="text-xs text-slate-400 block font-bold">الفصول المسندة</span>
                  <span className="text-lg font-extrabold text-brand-600">
                    {teacher.assignedClassesCount} فصول
                  </span>
                </div>
                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/60">
                  <span className="text-xs text-slate-400 block font-bold">ساعات منجزة</span>
                  <span className="text-lg font-extrabold text-emerald-600">
                    {teacher.totalHoursTaught} ساعة
                  </span>
                </div>
              </div>
            </div>

            {/* Hourly Rate Adjustment Form & Status Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Hourly Rate Setting Form */}
              <form
                action={handleUpdateRate}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>أجر ساعة التدريس المعتمد:</span>
                  </span>
                  <span className="font-extrabold text-base text-slate-900 font-mono">
                    {billingService.formatPrice(teacher.hourlyRateMinorUnits)} / ساعة
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input type="hidden" name="teacherId" value={teacher.id} />
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 start-3 flex items-center text-xs text-slate-400 font-bold">
                      $
                    </span>
                    <input
                      name="rateDollars"
                      type="number"
                      step="1"
                      min="15"
                      max="150"
                      defaultValue={(teacher.hourlyRateMinorUnits / 100).toFixed(0)}
                      className="w-full ps-8 pe-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="30"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors whitespace-nowrap"
                  >
                    تحديث الأجر 💾
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  التغيير ينعكس فوراً على سجل العمليات ومطابقات الرواتب الشهرية.
                </span>
              </form>

              {/* Status Action */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    حالة إسناد الحصص والنشاط
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    يمكنك تعليق استقبال الطلاب الجدد أو تنشيط المعلم لاستلام جداول إضافية.
                  </span>
                </div>

                <form action={handleToggleActive} className="pt-2">
                  <input type="hidden" name="teacherId" value={teacher.id} />
                  <input type="hidden" name="currentActive" value={String(teacher.isActive)} />
                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                      teacher.isActive
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {teacher.isActive ? "تعليق نشاط المعلم مؤقتاً ⏸" : "إعادة تنشيط المعلم للتدريس ▶"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
