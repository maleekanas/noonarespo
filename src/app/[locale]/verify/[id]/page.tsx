import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  XCircle,
  GraduationCap,
  Calendar,
  Award,
  ArrowRight,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import { certificateService } from "@/server/services/CertificateService";
import { PrintButton } from "@/components/shared/PrintButton";

export default async function PublicCertificateVerificationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === "ar";

  const verification = await certificateService.verifyCertificate(id);
  const cert = verification.certificate;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb (Hidden on print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href={`/${locale}`}
            className="text-xs font-bold text-slate-500 hover:text-brand-600 flex items-center gap-1.5 transition-colors"
          >
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
            <span>{isAr ? "الرئيسية: أكاديمية براعم العربية" : "Home: Kids Arabic Academy"}</span>
          </Link>

          <span className="text-xs font-bold text-slate-400 font-mono">
            {id}
          </span>
        </div>

        {/* Verification Status Banner (Hidden on print) */}
        <div className="print:hidden">
          {verification.isValid && cert ? (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-right">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-lg font-black text-emerald-950">
                      {isAr ? "وثيقة أصلية موثقة ومعتمدة رسمياً" : "Official Tamper-Evident Certificate"}
                    </h2>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">
                    {isAr ? verification.accreditationStatusAr : verification.accreditationStatusEn}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    SHA-256 SIGNATURE: {cert.verificationHash} • ALGORITHM: {verification.digitalSignatureAlgorithm}
                  </p>
                </div>
              </div>

              <PrintButton label={isAr ? "طباعة الشهادة (A4)" : "Print Certificate (A4)"} />
            </div>
          ) : (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-black text-rose-950">
                  {isAr ? "الشهادة غير مسجلة أو الرقم غير صالح" : "Certificate Not Found or Invalid"}
                </h2>
                <p className="text-xs text-rose-800 font-medium mt-0.5">
                  {isAr
                    ? "تأكد من كتابة الرمز التعريفي بدقة، أو تواصل مع إدارة الأكاديمية للتحقق اليدوي."
                    : "Please check the credential ID or contact school administration for assistance."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Official Certificate Presentation Canvas */}
        {verification.isValid && cert && (
          <div className="bg-white rounded-3xl p-8 sm:p-14 border-8 border-amber-100 shadow-xl space-y-8 print:border-4 print:shadow-none relative overflow-hidden text-slate-900">
            {/* Background Seal Watermark */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl -z-10 opacity-70" />

            {/* Certificate Header */}
            <div className="text-center space-y-3 pb-6 border-b-2 border-amber-200/60">
              <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
                <GraduationCap className="w-9 h-9" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wide">
                {verification.institutionNameAr}
              </h2>
              <span className="text-xs text-amber-800 font-bold uppercase tracking-widest block">
                شهادة اجتياز وتفوق أكاديمي • Certificate of Educational Achievement
              </span>
            </div>

            {/* Certificate Recipient & Details */}
            <div className="text-center space-y-4 py-4">
              <span className="text-sm text-slate-500 font-medium">
                تُمنح هذه الشهادة بكل فخر واعتزاز إلى الطالب النجيب:
              </span>

              <h3 className="text-3xl sm:text-4xl font-black text-brand-700 font-serif">
                {cert.studentNameAr}
              </h3>

              <div className="text-xs font-bold text-slate-400 tracking-wider font-mono">
                {cert.studentNameEn}
              </div>

              <p className="text-sm sm:text-base text-slate-700 max-w-xl mx-auto leading-relaxed pt-2">
                تقديراً لإتمامه بنجاح وتفوق متطلبات{" "}
                <span className="font-bold text-slate-900 underline decoration-amber-400 decoration-2">
                  {cert.courseTitleAr}
                </span>{" "}
                وحصوله على درجة:{" "}
                <span className="font-bold text-emerald-700">
                  {cert.gradeDistinctionAr}
                </span>
              </p>
            </div>

            {/* Verification Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-amber-100 bg-amber-50/40 rounded-2xl p-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>تاريخ التخرج</span>
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {cert.issuedAtDate}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>المستوى المعتمد (CEFR)</span>
                </div>
                <div className="text-xs font-bold text-brand-700">
                  المستوى {cert.levelCode}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>الاعتماد والتحقق</span>
                </div>
                <div className="text-xs font-bold text-emerald-700">
                  سجل موثق رقمياً ✓
                </div>
              </div>
            </div>

            {/* Official Signatures & QR Code Footer */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Teacher Signature */}
              <div className="text-center sm:text-right space-y-1">
                <div className="font-serif italic text-lg text-slate-800 border-b border-slate-300 pb-1 px-4">
                  {cert.signatoryTeacher}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  توقيع المشرف الأكاديمي والختم الرسمي
                </span>
              </div>

              {/* QR Verification Seal */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border-2 border-amber-200/80 shadow-2xs">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center p-1.5 shrink-0">
                  <QrCode className="w-full h-full text-amber-300" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    ID: {cert.credentialId}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 block">
                    مسجل بمركز الاعتماد الأكاديمي
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
