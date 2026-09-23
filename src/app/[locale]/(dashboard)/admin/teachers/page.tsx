import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { administrationService } from "@/server/services/AdministrationService";
import { billingService } from "@/server/services/BillingService";
import { requireAdminSession } from "@/lib/auth/currentUser";
import { EmploymentType } from "@prisma/client";
import {
  DollarSign,
  Award,
  BadgeCheck,
  UserPlus,
  Trash2,
} from "lucide-react";

const EMPLOYMENT_TYPE_LABEL_AR: Record<EmploymentType, string> = {
  FULL_TIME: "دوام كامل",
  PART_TIME: "دوام جزئي",
  CONTRACT: "بعقد تعاون",
};

export default async function AdminTeachersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const adminSession = await requireAdminSession(locale);
  const teachers = await administrationService.getAllTeachers();
  const certifiedCount = teachers.filter((t) => t.isCertified).length;
  const certifiedPercentage =
    teachers.length > 0 ? Math.round((certifiedCount / teachers.length) * 100) : 0;

  async function handleAddTeacher(formData: FormData) {
    "use server";
    const firstName = formData.get("firstName")?.toString().trim();
    const lastName = formData.get("lastName")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const qualifications = formData.get("qualifications")?.toString().trim() || "إجازة في القرآن الكريم واللغة العربية";
    const experienceYears = parseInt(formData.get("experienceYears")?.toString() || "5", 10);
    const rateDollars = parseFloat(formData.get("rateDollars")?.toString() || "30");
    const employmentType = (formData.get("employmentType")?.toString() || "CONTRACT") as EmploymentType;
    const isCertified = formData.get("isCertified")?.toString() === "true";

    if (!firstName || !lastName || !email) return;

    await administrationService.addTeacher(
      {
        email,
        firstName,
        lastName,
        qualifications,
        experienceYears,
        hourlyRateMinorUnits: Math.round(rateDollars * 100),
        employmentType,
        isCertified,
      },
      adminSession
    );

    revalidatePath(`/${locale}/admin/teachers`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

  async function handleArchiveTeacher(formData: FormData) {
    "use server";
    const teacherId = formData.get("teacherId")?.toString();
    if (!teacherId) return;

    await administrationService.archiveTeacher(teacherId, adminSession);

    revalidatePath(`/${locale}/admin/teachers`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

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

  async function handleUpdateCertification(formData: FormData) {
    "use server";
    const teacherId = formData.get("teacherId")?.toString();
    const isCertified = formData.get("isCertified")?.toString() === "true";
    const employmentType = (formData.get("employmentType")?.toString() || "CONTRACT") as EmploymentType;

    if (!teacherId) return;

    await administrationService.updateTeacherCertification(
      teacherId,
      isCertified,
      employmentType,
      adminSession
    );

    revalidatePath(`/${locale}/admin/teachers`);
    revalidatePath(`/${locale}/admin/audit-logs`);
    revalidatePath(`/${locale}/schools`);
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
            <span>
              {certifiedPercentage}% من الكادر ({certifiedCount} من {teachers.length}) معتمدون رسمياً
            </span>
          </div>
        </div>
      </div>

      {/* Add New Teacher Form Section */}
      <details className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group">
        <summary className="p-6 cursor-pointer flex items-center justify-between font-extrabold text-slate-900 text-base select-none hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span>إضافة معلم جديد واعتماده في الأكاديمية</span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                إنشاء حساب معلم رسمي، تحديد أجر الساعة، ونوع التعاقد والشهادات
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
            + إضافة معلم
          </span>
        </summary>

        <form action={handleAddTeacher} className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الاسم الأول</label>
              <input
                name="firstName"
                required
                placeholder="مثال: يحيى"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم العائلة</label>
              <input
                name="lastName"
                required
                placeholder="مثال: الأنصاري"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                name="email"
                type="email"
                required
                placeholder="teacher.yahya@arabickidsacademy.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">المؤهلات والإجازات</label>
              <input
                name="qualifications"
                defaultValue="إجازة بالسند المتصل في القراءات العشر وليسانس لغة عربية"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">سنوات الخبرة</label>
              <input
                name="experienceYears"
                type="number"
                min={1}
                max={40}
                defaultValue={6}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">أجر الساعة ($ USD)</label>
              <input
                name="rateDollars"
                type="number"
                min={15}
                max={150}
                defaultValue={30}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">نوع التعاقد</label>
              <select
                name="employmentType"
                defaultValue="CONTRACT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 bg-white font-bold"
              >
                <option value="FULL_TIME">دوام كامل</option>
                <option value="PART_TIME">دوام جزئي</option>
                <option value="CONTRACT">بعقد تعاون</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  name="isCertified"
                  value="true"
                  defaultChecked
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>معلم معتمد ومجاز رسمياً</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
            >
              حفظ واعتماد المعلم الجديد ✓
            </button>
          </div>
        </form>
      </details>

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
                    {teacher.isCertified && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-indigo-50 text-indigo-700 border-indigo-200 inline-flex items-center gap-1">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        معتمد
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{teacher.email}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {EMPLOYMENT_TYPE_LABEL_AR[teacher.employmentType]}
                  </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
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

                <form action={handleArchiveTeacher} className="pt-1">
                  <input type="hidden" name="teacherId" value={teacher.id} />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                    title="أرشفة سجل المعلم وإلغاء ظهوره في الدليل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>أرشفة وحذف من التدريس النشط</span>
                  </button>
                </form>
              </div>

              {/* Certification & Employment Type -- backs the public "Certified,
                  Full-Time Educators" claim with a real, admin-verified,
                  per-teacher fact instead of an assumed constant. */}
              <form
                action={handleUpdateCertification}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3"
              >
                <input type="hidden" name="teacherId" value={teacher.id} />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-indigo-600" />
                  <span>الاعتماد ونوع التوظيف</span>
                </span>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    name="isCertified"
                    value="true"
                    defaultChecked={teacher.isCertified}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>تم التحقق من إجازة الإسناد الرسمية</span>
                </label>

                <select
                  name="employmentType"
                  defaultValue={teacher.employmentType}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="FULL_TIME">دوام كامل</option>
                  <option value="PART_TIME">دوام جزئي</option>
                  <option value="CONTRACT">بعقد تعاون</option>
                </select>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
                >
                  حفظ الاعتماد
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
