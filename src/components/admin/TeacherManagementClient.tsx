"use client";

import React, { useState, useTransition } from "react";
import {
  Search,
  Download,
  KeyRound,
  Edit3,
  Power,
  Trash2,
  Copy,
  Check,
  X,
  PlusCircle,
  Award,
  DollarSign,
  Clock,
  BookOpen,
  Mail,
  User,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";
import { EmploymentType } from "@prisma/client";
import { TeacherAdminRecord } from "@/server/repositories/AdministrationRepository";

interface TeacherManagementClientProps {
  initialTeachers: TeacherAdminRecord[];
  locale: string;
  onResetPassword: (params: {
    teacherId: string;
    customPassword?: string;
  }) => Promise<{ email: string; tempPassword: string }>;
  onUpdateTeacher: (params: {
    teacherId: string;
    data: {
      firstName: string;
      lastName: string;
      qualifications: string;
      experienceYears: number;
      hourlyRateMinorUnits: number;
      employmentType: EmploymentType;
      isCertified: boolean;
      isActive: boolean;
    };
  }) => Promise<any>;
  onToggleActive: (params: { teacherId: string; currentActive: boolean }) => Promise<any>;
  onArchiveTeacher: (params: { teacherId: string }) => Promise<any>;
  onAddTeacher: (formData: FormData) => Promise<any>;
}

export function TeacherManagementClient({
  initialTeachers,
  locale,
  onResetPassword,
  onUpdateTeacher,
  onToggleActive,
  onArchiveTeacher,
  onAddTeacher,
}: TeacherManagementClientProps) {
  const isAr = locale === "ar";
  const [teachers, setTeachers] = useState<TeacherAdminRecord[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployment, setSelectedEmployment] = useState<string>("ALL");
  const [selectedCert, setSelectedCert] = useState<string>("ALL");
  const [selectedActive, setSelectedActive] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [resetModalTeacher, setResetModalTeacher] = useState<TeacherAdminRecord | null>(null);
  const [customPassword, setCustomPassword] = useState("");
  const [resetResult, setResetResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [editModalTeacher, setEditModalTeacher] = useState<TeacherAdminRecord | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editQualifications, setEditQualifications] = useState("");
  const [editExp, setEditExp] = useState(5);
  const [editRateDollars, setEditRateDollars] = useState(30);
  const [editEmployment, setEditEmployment] = useState<EmploymentType>(EmploymentType.CONTRACT);
  const [editCertified, setEditCertified] = useState(true);
  const [editActive, setEditActive] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const EMPLOYMENT_LABELS: Record<EmploymentType, { ar: string; en: string }> = {
    [EmploymentType.FULL_TIME]: { ar: "دوام كامل", en: "Full-Time" },
    [EmploymentType.PART_TIME]: { ar: "دوام جزئي", en: "Part-Time" },
    [EmploymentType.CONTRACT]: { ar: "تعاون بعقد", en: "Contractor" },
  };

  // Filter logic
  const filteredTeachers = teachers.filter((t) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.firstName.toLowerCase().includes(q) ||
      t.lastName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.qualifications.toLowerCase().includes(q);

    const matchesEmployment =
      selectedEmployment === "ALL" || t.employmentType === selectedEmployment;
    const matchesCert =
      selectedCert === "ALL" ||
      (selectedCert === "CERTIFIED" && t.isCertified) ||
      (selectedCert === "NOT_CERTIFIED" && !t.isCertified);
    const matchesActive =
      selectedActive === "ALL" ||
      (selectedActive === "ACTIVE" && t.isActive) ||
      (selectedActive === "INACTIVE" && !t.isActive);

    return matchesSearch && matchesEmployment && matchesCert && matchesActive;
  });

  // Export CSV
  function handleExportCsv() {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Qualifications",
      "Hourly Rate (USD)",
      "Experience (Years)",
      "Hours Taught",
      "Assigned Classes Count",
      "Is Certified",
      "Employment Type",
      "Active Status",
    ];

    const rows = filteredTeachers.map((t) => [
      t.id,
      `"${t.firstName.replace(/"/g, '""')}"`,
      `"${t.lastName.replace(/"/g, '""')}"`,
      `"${t.email.replace(/"/g, '""')}"`,
      `"${t.qualifications.replace(/"/g, '""')}"`,
      (t.hourlyRateMinorUnits / 100).toFixed(2),
      t.experienceYears,
      t.totalHoursTaught,
      t.assignedClassesCount,
      t.isCertified ? "YES" : "NO",
      t.employmentType,
      t.isActive ? "ACTIVE" : "INACTIVE",
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `teachers_roster_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Open Edit Modal
  function handleOpenEdit(teacher: TeacherAdminRecord) {
    setEditModalTeacher(teacher);
    setEditFirstName(teacher.firstName);
    setEditLastName(teacher.lastName);
    setEditQualifications(teacher.qualifications);
    setEditExp(teacher.experienceYears);
    setEditRateDollars(teacher.hourlyRateMinorUnits / 100);
    setEditEmployment(teacher.employmentType);
    setEditCertified(teacher.isCertified);
    setEditActive(teacher.isActive);
  }

  // Save Edit
  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editModalTeacher) return;

    startTransition(async () => {
      try {
        await onUpdateTeacher({
          teacherId: editModalTeacher.id,
          data: {
            firstName: editFirstName.trim(),
            lastName: editLastName.trim(),
            qualifications: editQualifications.trim(),
            experienceYears: editExp,
            hourlyRateMinorUnits: Math.round(editRateDollars * 100),
            employmentType: editEmployment,
            isCertified: editCertified,
            isActive: editActive,
          },
        });

        setTeachers((prev) =>
          prev.map((t) =>
            t.id === editModalTeacher.id
              ? {
                  ...t,
                  firstName: editFirstName.trim(),
                  lastName: editLastName.trim(),
                  qualifications: editQualifications.trim(),
                  experienceYears: editExp,
                  hourlyRateMinorUnits: Math.round(editRateDollars * 100),
                  employmentType: editEmployment,
                  isCertified: editCertified,
                  isActive: editActive,
                }
              : t
          )
        );

        setActionMessage(isAr ? "تم تحديث ملف المعلم بنجاح" : "Teacher profile updated successfully");
        setEditModalTeacher(null);
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to update teacher profile");
      }
    });
  }

  // Reset Password Action
  function handleTriggerReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetModalTeacher) return;

    startTransition(async () => {
      try {
        const res = await onResetPassword({
          teacherId: resetModalTeacher.id,
          customPassword: customPassword.trim() || undefined,
        });
        setResetResult(res);
      } catch (err: any) {
        alert(err?.message || "Failed to reset teacher password");
      }
    });
  }

  // Toggle Active Action
  function handleTriggerToggleActive(teacher: TeacherAdminRecord) {
    startTransition(async () => {
      try {
        await onToggleActive({
          teacherId: teacher.id,
          currentActive: teacher.isActive,
        });

        setTeachers((prev) =>
          prev.map((t) => (t.id === teacher.id ? { ...t, isActive: !t.isActive } : t))
        );

        setActionMessage(
          isAr
            ? `تم ${!teacher.isActive ? "تفعيل" : "تعليق"} حساب المعلم بنجاح`
            : `Teacher account ${!teacher.isActive ? "activated" : "suspended"} successfully`
        );
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to toggle teacher active status");
      }
    });
  }

  // Copy reset credentials to clipboard
  function handleCopyCredentials() {
    if (!resetResult || !resetModalTeacher) return;
    const text = isAr
      ? `أهلاً بك أستاذ/ة ${resetModalTeacher.firstName}،\nتم تعيين بيانات تسجيل دخولك إلى بوابة المعلمين في Arabic Kids Academy:\n- البريد الإلكتروني: ${resetResult.email}\n- كلمة المرور: ${resetResult.tempPassword}\nرابط الدخول: https://arabickidsacademy.com/${locale}/login`
      : `Hello Teacher ${resetModalTeacher.firstName},\nYour login credentials for Arabic Kids Academy have been updated:\n- Email: ${resetResult.email}\n- Password: ${resetResult.tempPassword}\nLogin URL: https://arabickidsacademy.com/${locale}/login`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 rtl:right-3 rtl:left-auto" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? "بحث بالاسم، البريد، المؤهل..." : "Search by name, email, qualification..."}
              className="w-full pl-9 pr-4 py-2.5 rtl:pr-9 rtl:pl-4 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Employment Type Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedEmployment}
              onChange={(e) => setSelectedEmployment(e.target.value)}
              aria-label={isAr ? "تصفية حسب نوع التوظيف" : "Filter by employment type"}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="ALL">{isAr ? "جميع أنواع التوظيف" : "All Employment Types"}</option>
              {Object.entries(EMPLOYMENT_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {isAr ? label.ar : label.en}
                </option>
              ))}
            </select>
          </div>

          {/* Certification Filter */}
          <div className="w-full sm:w-44">
            <select
              value={selectedCert}
              onChange={(e) => setSelectedCert(e.target.value)}
              aria-label={isAr ? "تصفية حسب حالة الاعتماد" : "Filter by certification"}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="ALL">{isAr ? "حالة الاعتماد (الكل)" : "All Certifications"}</option>
              <option value="CERTIFIED">{isAr ? "معلم معتمد فقط" : "Certified Only"}</option>
              <option value="NOT_CERTIFIED">{isAr ? "غير معتمد" : "Not Certified"}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <select
              value={selectedActive}
              onChange={(e) => setSelectedActive(e.target.value)}
              aria-label={isAr ? "تصفية حسب النشاط" : "Filter by status"}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="ALL">{isAr ? "الحالة (الكل)" : "All Statuses"}</option>
              <option value="ACTIVE">{isAr ? "نشط ومتاح" : "Active"}</option>
              <option value="INACTIVE">{isAr ? "معلق مؤقتاً" : "Inactive"}</option>
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl gradient-brand text-white text-sm font-bold shadow-sm hover:opacity-95 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAr ? "اعتماد معلم جديد" : "Onboard Teacher"}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{isAr ? "تصدير CSV" : "Export CSV"}</span>
          </button>
        </div>
      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2">
        <span>
          {isAr
            ? `عرض ${filteredTeachers.length} من إجمالي ${teachers.length} معلماً معتمداً`
            : `Showing ${filteredTeachers.length} of ${teachers.length} teachers`}
        </span>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">{isAr ? "بيانات المعلم" : "Teacher Profile"}</th>
                <th className="px-6 py-4">{isAr ? "المؤهلات والاعتماد" : "Qualifications & Badge"}</th>
                <th className="px-6 py-4">{isAr ? "أجر الساعة والأداء" : "Rate & Delivery"}</th>
                <th className="px-6 py-4">{isAr ? "الفصول النشطة" : "Active Classes"}</th>
                <th className="px-6 py-4">{isAr ? "حالة النشاط" : "Active Status"}</th>
                <th className="px-6 py-4 text-center">{isAr ? "إجراءات الحوكمة" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>{isAr ? "لا يوجد معلمون يطابقون شروط البحث" : "No teachers match your search"}</span>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((tch) => {
                  const empLabel = EMPLOYMENT_LABELS[tch.employmentType] || {
                    ar: tch.employmentType,
                    en: tch.employmentType,
                  };

                  return (
                    <tr key={tch.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-extrabold text-sm">
                            {tch.firstName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>
                                {tch.firstName} {tch.lastName}
                              </span>
                              {tch.isCertified && (
                                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{tch.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Qualifications & Certification */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-xs font-bold text-slate-800 line-clamp-1">
                            {tch.qualifications}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              {tch.experienceYears} {isAr ? "سنوات خبرة" : "yrs exp"}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold">
                              {isAr ? empLabel.ar : empLabel.en}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Hourly Rate & Hours Taught */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span>${(tch.hourlyRateMinorUnits / 100).toFixed(2)} / {isAr ? "ساعة" : "hr"}</span>
                          </span>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{tch.totalHoursTaught} {isAr ? "ساعة منجزة" : "hrs delivered"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Classes Count */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200">
                          <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                          <span>{tch.assignedClassesCount} {isAr ? "فصول" : "classes"}</span>
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                            tch.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>
                            {tch.isActive
                              ? isAr
                                ? "نشط ومتاح"
                                : "Active"
                              : isAr
                              ? "معلق مؤقتاً"
                              : "Inactive"}
                          </span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setResetModalTeacher(tch);
                              setCustomPassword("");
                              setResetResult(null);
                            }}
                            title={isAr ? "إعادة تعيين كلمة المرور" : "Reset Password"}
                            className="p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Edit Profile */}
                          <button
                            onClick={() => handleOpenEdit(tch)}
                            title={isAr ? "تعديل ملف المعلم" : "Edit Profile"}
                            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Toggle Active */}
                          <button
                            onClick={() => handleTriggerToggleActive(tch)}
                            disabled={isPending}
                            title={
                              tch.isActive
                                ? isAr
                                  ? "تعليق الحساب"
                                  : "Suspend Account"
                                : isAr
                                ? "تفعيل الحساب"
                                : "Activate Account"
                            }
                            className={`p-2 rounded-xl transition-colors ${
                              tch.isActive
                                ? "text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Archive */}
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  isAr
                                    ? `هل أنت متأكد من رغبتك في أرشفة المعلم [${tch.firstName} ${tch.lastName}]؟`
                                    : `Archive teacher [${tch.firstName} ${tch.lastName}]?`
                                )
                              ) {
                                await onArchiveTeacher({ teacherId: tch.id });
                                setTeachers((prev) =>
                                  prev.map((t) => (t.id === tch.id ? { ...t, isActive: false } : t))
                                );
                                setActionMessage(
                                  isAr ? "تم أرشفة حساب المعلم بنجاح" : "Teacher archived successfully"
                                );
                                setTimeout(() => setActionMessage(null), 4000);
                              }
                            }}
                            title={isAr ? "أرشفة المعلم" : "Archive Teacher"}
                            className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL 1: RESET PASSWORD --- */}
      {resetModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <KeyRound className="w-5 h-5 text-brand-600" />
                <span>{isAr ? "إعادة تعيين كلمة مرور المعلم" : "Reset Teacher Password"}</span>
              </div>
              <button
                onClick={() => setResetModalTeacher(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!resetResult ? (
              <form onSubmit={handleTriggerReset} className="space-y-4 text-sm">
                <p className="text-xs text-slate-600">
                  {isAr
                    ? `إعادة تعيين كلمة المرور لحساب المعلم [${resetModalTeacher.firstName} ${resetModalTeacher.lastName}]. يمكنك إدخال كلمة مرور مخصصة أو ترك الحقل فارغاً لتوليد كلمة مرور مؤقتة آمنة تلقائياً.`
                    : `Reset password for [${resetModalTeacher.firstName} ${resetModalTeacher.lastName}]. Leave blank to auto-generate a secure temporary password.`}
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? "كلمة مرور مخصصة (اختياري)" : "Custom Password (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="AKA-SecPass2026!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalTeacher(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95"
                  >
                    {isPending ? (isAr ? "جاري التعيين..." : "Resetting...") : isAr ? "تأكيد وإعادة التعيين" : "Confirm Reset"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? "تم تعيين كلمة المرور بنجاح!" : "Password reset successfully!"}</span>
                  </div>
                  <div className="mt-2 space-y-1 font-mono">
                    <div>
                      <span className="text-slate-500">{isAr ? "البريد الإلكتروني: " : "Email: "}</span>
                      <strong className="text-slate-900">{resetResult.email}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">{isAr ? "كلمة المرور المؤقتة: " : "Temp Password: "}</span>
                      <strong className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {resetResult.tempPassword}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCredentials}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? (isAr ? "تم النسخ بنجاح!" : "Copied!") : isAr ? "نسخ بيانات الدخول للرسالة" : "Copy Credentials"}</span>
                  </button>
                  <button
                    onClick={() => setResetModalTeacher(null)}
                    className="px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs"
                  >
                    {isAr ? "إغلاق" : "Done"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDIT TEACHER PROFILE --- */}
      {editModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <span>{isAr ? "تعديل ملف المعلم والاعتماد" : "Edit Teacher Profile"}</span>
              </div>
              <button
                onClick={() => setEditModalTeacher(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "الاسم الأول" : "First Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "اسم العائلة" : "Last Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "المؤهلات والشهادات الأكاديمية" : "Qualifications & Accreditations"}
                </label>
                <input
                  type="text"
                  required
                  value={editQualifications}
                  onChange={(e) => setEditQualifications(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "سنوات الخبرة" : "Experience (Yrs)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editExp}
                    onChange={(e) => setEditExp(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "أجر الساعة ($)" : "Hourly Rate ($)"}
                  </label>
                  <input
                    type="number"
                    min={5}
                    step={1}
                    value={editRateDollars}
                    onChange={(e) => setEditRateDollars(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "نوع التعاقد" : "Employment"}
                  </label>
                  <select
                    value={editEmployment}
                    onChange={(e) => setEditEmployment(e.target.value as EmploymentType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {Object.entries(EMPLOYMENT_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {isAr ? label.ar : label.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editCertified}
                    onChange={(e) => setEditCertified(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>{isAr ? "شارة معلم معتمد KAA Certified" : "KAA Certified Badge"}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>{isAr ? "الحساب مفعل ومتاح للتدريس" : "Active & Available"}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalTeacher(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-700"
                >
                  {isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ التعديلات" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ONBOARD TEACHER --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <PlusCircle className="w-5 h-5 text-brand-600" />
                <span>{isAr ? "اعتماد وإضافة معلم جديد للأكاديمية" : "Onboard New Teacher"}</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                await onAddTeacher(formData);
                setShowAddModal(false);
                setActionMessage(isAr ? "تم اعتماد المعلم بنجاح" : "Teacher onboarded successfully");
                setTimeout(() => setActionMessage(null), 4000);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "الاسم الأول" : "First Name"}
                  </label>
                  <input
                    name="firstName"
                    required
                    placeholder={isAr ? "مثال: مريم" : "e.g. Maryam"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "اسم العائلة" : "Last Name"}
                  </label>
                  <input
                    name="lastName"
                    required
                    placeholder={isAr ? "مثال: حسان" : "e.g. Hassan"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "البريد الإلكتروني المهني" : "Professional Email"}
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="ustadh.name@kidsarabicacademy.internal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "المؤهلات والإجازات" : "Qualifications & Ijazahs"}
                </label>
                <input
                  name="qualifications"
                  required
                  defaultValue="إجازة في القرآن الكريم واللغة العربية"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "سنوات الخبرة" : "Experience (Yrs)"}
                  </label>
                  <input
                    name="experienceYears"
                    type="number"
                    min={1}
                    defaultValue={5}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "أجر الساعة ($)" : "Hourly Rate ($)"}
                  </label>
                  <input
                    name="rateDollars"
                    type="number"
                    min={10}
                    defaultValue={30}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "نوع التعاقد" : "Employment"}
                  </label>
                  <select
                    name="employmentType"
                    defaultValue={EmploymentType.CONTRACT}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {Object.entries(EMPLOYMENT_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {isAr ? label.ar : label.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    name="isCertified"
                    value="true"
                    defaultChecked
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>{isAr ? "منح شارة الاعتماد الأكاديمي (KAA Certified)" : "Grant KAA Certified Badge"}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95"
                >
                  {isAr ? "تأكيد واعتماد المعلم" : "Confirm Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
