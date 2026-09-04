import React from "react";
import Link from "next/link";
import { certificateService } from "@/server/services/CertificateService";
import {
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { PrintButton } from "@/components/shared/PrintButton";

export default async function StudentCertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const studentId = "student-1";

  const cert = await certificateService.getCertificateForStudent(studentId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Print Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/student`} className="hover:underline">
              بوابة الطالب
            </Link>
            <span>/</span>
            <span>الشهادات والأوسمة</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            شهادة إتمام المستوى الأكاديمي 📜
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            شهادة رسمية معتمدة وموثقة برقم ترخيص رقمي فريد
          </p>
        </div>

        <PrintButton label="طباعة / تحميل الشهادة (PDF)" />
      </div>

      {/* Official Certificate Canvas */}
      <div className="bg-white rounded-3xl p-8 sm:p-14 border-8 border-amber-100 shadow-xl space-y-8 print:border-4 print:shadow-none relative overflow-hidden">
        {/* Background Watermark/Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -z-10 opacity-70" />

        {/* Certificate Header */}
        <div className="text-center space-y-3 pb-6 border-b-2 border-amber-200/60">
          <div className="w-16 h-16 rounded-2xl gradient-brand text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wide">
            أكاديمية براعم العربية العالمية للأطفال
          </h2>
          <span className="text-xs text-amber-800 font-bold uppercase tracking-widest block">
            شهادة اجتياز وتفوق أكاديمي • Certificate of Achievement
          </span>
        </div>

        {/* Certificate Recipient & Rationale */}
        <div className="text-center space-y-4 py-4">
          <span className="text-sm text-slate-500 font-medium">
            تُمنح هذه الشهادة بكل فخر واعتزاز إلى الطالب النجيب:
          </span>

          <h3 className="text-3xl sm:text-4xl font-extrabold text-brand-700 font-serif">
            {cert.studentNameAr}
          </h3>

          <p className="text-xs text-slate-400 font-sans tracking-wide">
            {cert.studentNameEn}
          </p>

          <p className="text-sm text-slate-700 max-w-xl mx-auto leading-relaxed pt-2">
            وذلك لاجتيازه بنجاح وتفوق متطلبات {cert.courseTitleAr}، وحصوله على تقدير:{" "}
            <span className="font-extrabold text-emerald-700">{cert.gradeDistinctionAr}</span>
          </p>
        </div>

        {/* Certificate Signatures & Verification */}
        <div className="pt-8 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="text-center sm:text-start space-y-1">
            <span className="text-[11px] block">تاريخ الإصدار:</span>
            <span className="font-bold text-slate-800 block">{cert.issuedAtDate}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              رقم الشهادة: {cert.credentialId}
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>رمز التوثيق: {cert.verificationHash}</span>
          </div>

          <div className="text-center sm:text-end space-y-1">
            <span className="text-[11px] block">توقيع المعلم المشرف:</span>
            <span className="font-bold text-brand-700 block">{cert.signatoryTeacher}</span>
            <span className="text-[10px] text-slate-400">ختم الأكاديمية الرسمي</span>
          </div>
        </div>
      </div>
    </div>
  );
}
