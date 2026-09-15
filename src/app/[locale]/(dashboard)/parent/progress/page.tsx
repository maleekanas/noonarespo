import React from "react";
import Link from "next/link";
import { userRepository } from "@/server/repositories/UserRepository";
import { progressService } from "@/server/services/ProgressService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
  Sparkles,
  Award,
  BookOpen,
  Volume2,
  PenTool,
  MessageCircle,
  Moon,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

export default async function ParentProgressPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { locale } = await params;
  const { studentId: selectedParam } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;

  const children = await userRepository.getLinkedChildren(parentId);
  const selectedStudentId = selectedParam || (children.length > 0 ? children[0].id : "");
  const selectedChild = children.find((c) => c.id === selectedStudentId) || children[0];

  const competencies = selectedChild
    ? await progressService.getStudentCompetencies(selectedChild.id)
    : [];

  const iconMap: Record<string, typeof BookOpen> = {
    listening: Volume2,
    speaking: MessageCircle,
    reading: BookOpen,
    writing: PenTool,
    tajweed: Moon,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Child Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent`} className="hover:underline">
              لوحة ولي الأمر
            </Link>
            <span>/</span>
            <span>مؤشرات التقدم والطلاقة</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            مؤشرات الإتقان والكفاءات اللغوية الخمس 📊
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تتبع تفصيلي لتطور مهارات طفلك في الاستماع، التحدث، القراءة، الكتابة، والتجويد
          </p>
        </div>

        {/* Child Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/${locale}/parent/progress?studentId=${child.id}`}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                child.id === selectedChild?.id
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {child.firstName} ({child.ageGroup === "AGE_4_6" ? "5 سنوات" : "8 سنوات"})
            </Link>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      {selectedChild && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
              الملف الأكاديمي: {selectedChild.firstName} {selectedChild.lastName}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              المستوى التراكمي: {selectedChild.ageGroup === "AGE_4_6" ? "المرحلة التمهيدية (Pre-A1)" : "المستوى الأول (A1 - مستكشفون)"}
            </h2>
            <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
              يحقق الطالب معدل إتقان إجمالي 94% عبر مختلف الكفاءات، مع تميز استثنائي في الحفظ الصوتي ومخارج الحروف.
            </p>
          </div>

          <Link
            href={`/${locale}/parent/reports/weekly?studentId=${selectedChild.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-brand-700 font-bold text-xs shadow-md hover:bg-slate-50 transition-all self-start md:self-auto"
          >
            <span>عرض التقرير الأسبوعي الشامل</span>
            <DirectionalIcon icon={ArrowRight} locale={locale} className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 5 Core Competencies Mastery Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>مصفوفة الكفاءات والمهارات اللغوية الأساسية</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competencies.map((comp) => {
            const Icon = iconMap[comp.skillKey] || Sparkles;
            return (
              <div
                key={comp.skillKey}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-extrabold text-slate-900">
                      {comp.scorePercentage}%
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{comp.nameAr}</h3>
                    <span className="text-xs text-brand-600 font-semibold block mt-0.5">
                      {comp.masteryLevelAr}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-brand transition-all duration-500"
                      style={{ width: `${comp.scorePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>تم التقييم من خلال 6 مهام واختبارين تفاعليين</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
