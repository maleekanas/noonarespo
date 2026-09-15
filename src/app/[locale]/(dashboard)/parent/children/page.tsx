import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { userRepository } from "@/server/repositories/UserRepository";
import { AgeGroup, RelationshipType } from "@prisma/client";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
  Users,
  UserPlus,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

export default async function ParentChildrenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;
  const children = await userRepository.getLinkedChildren(parentId);

  async function handleAddChild(formData: FormData) {
    "use server";
    const firstName = formData.get("firstName")?.toString() || "";
    const lastName = formData.get("lastName")?.toString() || "";
    const birthDateStr = formData.get("dateOfBirth")?.toString() || "2018-01-01";
    const ageGroupStr = formData.get("ageGroup")?.toString() || "AGE_7_10";
    const notes = formData.get("notesInternal")?.toString() || "";

    if (!firstName || !lastName) return;

    await userRepository.createChildWithParentLink(parentId, {
      firstName,
      lastName,
      dateOfBirth: new Date(birthDateStr),
      ageGroup: ageGroupStr as AgeGroup,
      relationshipType: RelationshipType.FATHER,
      notesInternal: notes,
    });

    revalidatePath(`/${locale}/parent/children`);
  }

  const ageGroupLabels: Record<AgeGroup, string> = {
    AGE_4_6: "البراعم (4 - 6 سنوات)",
    AGE_7_10: "المستكشفون (7 - 10 سنوات)",
    AGE_11_13: "الرواد (11 - 13 سنة)",
    AGE_14_16: "العلماء (14 - 16 سنة)",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent`} className="hover:underline">
              لوحة ولي الأمر
            </Link>
            <span>/</span>
            <span>إدارة الأبناء</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            ملفات الأبناء المسجلين 👨‍👧‍👦
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة بيانات أطفالك، ومتابعة ربط الحسابات وموافقة ولي الأمر الرسمية
          </p>
        </div>

        <Link
          href={`/${locale}/parent/enroll`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
        >
          <GraduationCap className="w-4 h-4" />
          <span>تسجيل طفل في فصل جديد</span>
        </Link>
      </div>

      {/* Main Grid: Children List & Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Children Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            <span>الأبناء المرتبطون بحسابك ({children.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-brand-300 transition-colors flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 font-extrabold text-lg flex items-center justify-center border border-brand-100">
                      {child.firstName[0]}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>موافقة ولي الأمر موثقة</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {child.firstName} {child.lastName}
                    </h3>
                    <p className="text-xs font-semibold text-brand-600 mt-0.5">
                      {ageGroupLabels[child.ageGroup]}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>تاريخ الميلاد:</span>
                      <span className="font-medium text-slate-700">
                        {child.dateOfBirth.toISOString().split("T")[0]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>اللغة الأم:</span>
                      <span className="font-medium text-slate-700">
                        {child.nativeLanguage === "ar" ? "العربية" : child.nativeLanguage}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/${locale}/parent/enroll?studentId=${child.id}`}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold text-xs text-center transition-colors flex items-center justify-center gap-2"
                >
                  <span>تسجيل في فصول إضافية</span>
                  <DirectionalIcon icon={ArrowRight} locale={locale} className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Add New Child Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              <span>إضافة طفل جديد</span>
            </h3>
            <p className="text-xs text-slate-500">
              أدخل بيانات طفلك لإنشاء ملفه الأكاديمي المباشر
            </p>
          </div>

          <form action={handleAddChild} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الاسم الأول</label>
              <input
                name="firstName"
                required
                placeholder="مثال: يوسف"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم العائلة</label>
              <input
                name="lastName"
                required
                defaultValue="المنصور"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ الميلاد</label>
              <input
                name="dateOfBirth"
                type="date"
                required
                defaultValue="2017-06-15"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الفئة العمرية</label>
              <select
                name="ageGroup"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="AGE_4_6">البراعم (4 - 6 سنوات)</option>
                <option value="AGE_7_10">المستكشفون (7 - 10 سنوات)</option>
                <option value="AGE_11_13">الرواد (11 - 13 سنة)</option>
                <option value="AGE_14_16">العلماء (14 - 16 سنة)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ملاحظات واحتياجات خاصة (اختياري)</label>
              <textarea
                name="notesInternal"
                rows={2}
                placeholder="أي تفضيلات أو نقاط قوة أو صعوبات يرغب المعلم بمعرفتها..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Child Safety Consent */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="text-[11px] text-slate-600 leading-relaxed">
                  أقر بصفتي ولي الأمر القانوني بالموافقة على تسجيل طفلي في الأكاديمية والمشاركة في الفصول التفاعلية الحية.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-md hover:opacity-95 transition-all"
            >
              حفظ وتأكيد إضافة الطفل
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
