"use client";

import React, { useState, useTransition } from "react";
import {
  Search,
  Filter,
  Download,
  KeyRound,
  Edit3,
  Power,
  Trash2,
  Copy,
  Check,
  X,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Phone,
  User,
  PlusCircle,
} from "lucide-react";
import { UserStatus, AgeGroup } from "@prisma/client";
import { StudentAdminRecord } from "@/server/repositories/AdministrationRepository";

interface StudentManagementClientProps {
  initialStudents: StudentAdminRecord[];
  locale: string;
  onResetPassword: (params: {
    studentId: string;
    customPassword?: string;
  }) => Promise<{ email: string; tempPassword: string }>;
  onUpdateStudent: (params: {
    studentId: string;
    data: {
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      ageGroup?: AgeGroup;
      notesInternal?: string;
    };
  }) => Promise<any>;
  onToggleStatus: (params: {
    studentId: string;
    currentStatus: UserStatus;
    reason?: string;
  }) => Promise<any>;
  onArchiveStudent: (params: { studentId: string; reason?: string }) => Promise<any>;
  onAddStudent: (formData: FormData) => Promise<any>;
}

export function StudentManagementClient({
  initialStudents,
  locale,
  onResetPassword,
  onUpdateStudent,
  onToggleStatus,
  onArchiveStudent,
  onAddStudent,
}: StudentManagementClientProps) {
  const isAr = locale === "ar";
  const [students, setStudents] = useState<StudentAdminRecord[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAge, setSelectedAge] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [resetModalStudent, setResetModalStudent] = useState<StudentAdminRecord | null>(null);
  const [customPassword, setCustomPassword] = useState("");
  const [resetResult, setResetResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [editModalStudent, setEditModalStudent] = useState<StudentAdminRecord | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editAgeGroup, setEditAgeGroup] = useState<AgeGroup>(AgeGroup.AGE_7_10);
  const [editNotes, setEditNotes] = useState("");

  const [archiveModalStudent, setArchiveModalStudent] = useState<StudentAdminRecord | null>(null);
  const [archiveReason, setArchiveReason] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Age group labels
  const AGE_GROUP_LABELS: Record<AgeGroup, { ar: string; en: string }> = {
    [AgeGroup.AGE_4_6]: { ar: "4 - 6 سنوات (براعم)", en: "4 - 6 yrs (Early)" },
    [AgeGroup.AGE_7_10]: { ar: "7 - 10 سنوات (مستكشفون)", en: "7 - 10 yrs (Explorer)" },
    [AgeGroup.AGE_11_13]: { ar: "11 - 13 سنة (رواد)", en: "11 - 13 yrs (Pioneer)" },
    [AgeGroup.AGE_14_16]: { ar: "14 - 16 سنة (شباب)", en: "14 - 16 yrs (Youth)" },
  };

  // Status styles & labels
  const STATUS_CONFIG: Record<UserStatus, { labelAr: string; labelEn: string; style: string }> = {
    [UserStatus.ACTIVE]: {
      labelAr: "نشط ومفعل",
      labelEn: "Active",
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    [UserStatus.SUSPENDED]: {
      labelAr: "معلق مؤقتاً",
      labelEn: "Suspended",
      style: "bg-rose-50 text-rose-700 border-rose-200",
    },
    [UserStatus.PENDING_VERIFICATION]: {
      labelAr: "بانتظار التأكيد",
      labelEn: "Pending Verification",
      style: "bg-amber-50 text-amber-700 border-amber-200",
    },
    [UserStatus.ARCHIVED]: {
      labelAr: "مؤرشف",
      labelEn: "Archived",
      style: "bg-slate-100 text-slate-600 border-slate-200",
    },
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.guardianName.toLowerCase().includes(q) ||
      s.guardianPhone.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q);

    const matchesAge = selectedAge === "ALL" || s.ageGroup === selectedAge;
    const matchesStatus = selectedStatus === "ALL" || s.status === selectedStatus;

    return matchesSearch && matchesAge && matchesStatus;
  });

  // Export CSV
  function handleExportCsv() {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Age Group",
      "Date of Birth",
      "Status",
      "Guardian Name",
      "Guardian Phone",
      "Enrolled Classes Count",
      "COPPA/GDPR Compliant",
    ];

    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.firstName.replace(/"/g, '""')}"`,
      `"${s.lastName.replace(/"/g, '""')}"`,
      s.ageGroup,
      s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().slice(0, 10) : "",
      s.status,
      `"${s.guardianName.replace(/"/g, '""')}"`,
      `"${s.guardianPhone.replace(/"/g, '""')}"`,
      s.enrolledClassesCount,
      s.coppaGdprCompliant ? "YES" : "NO",
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students_roster_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Open Edit Modal
  function handleOpenEdit(student: StudentAdminRecord) {
    setEditModalStudent(student);
    setEditFirstName(student.firstName);
    setEditLastName(student.lastName);
    setEditDob(
      student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0, 10) : ""
    );
    setEditAgeGroup(student.ageGroup);
    setEditNotes("");
  }

  // Save Edit
  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editModalStudent) return;

    startTransition(async () => {
      try {
        await onUpdateStudent({
          studentId: editModalStudent.id,
          data: {
            firstName: editFirstName.trim(),
            lastName: editLastName.trim(),
            dateOfBirth: editDob || undefined,
            ageGroup: editAgeGroup,
            notesInternal: editNotes.trim() || undefined,
          },
        });

        setStudents((prev) =>
          prev.map((s) =>
            s.id === editModalStudent.id
              ? {
                  ...s,
                  firstName: editFirstName.trim(),
                  lastName: editLastName.trim(),
                  dateOfBirth: editDob ? new Date(editDob) : s.dateOfBirth,
                  ageGroup: editAgeGroup,
                }
              : s
          )
        );

        setActionMessage(isAr ? "تم تحديث بيانات الطالب بنجاح" : "Student profile updated successfully");
        setEditModalStudent(null);
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to update student profile");
      }
    });
  }

  // Reset Password Action
  function handleTriggerReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetModalStudent) return;

    startTransition(async () => {
      try {
        const res = await onResetPassword({
          studentId: resetModalStudent.id,
          customPassword: customPassword.trim() || undefined,
        });
        setResetResult(res);
      } catch (err: any) {
        alert(err?.message || "Failed to reset student password");
      }
    });
  }

  // Toggle Status Action
  function handleTriggerToggleStatus(student: StudentAdminRecord) {
    startTransition(async () => {
      try {
        const newStatus =
          student.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
        await onToggleStatus({
          studentId: student.id,
          currentStatus: student.status,
          reason: isAr ? "إجراء إداري من لوحة الحوكمة" : "Administrative action from governance panel",
        });

        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, status: newStatus } : s))
        );

        setActionMessage(
          isAr
            ? `تم ${newStatus === UserStatus.ACTIVE ? "تفعيل" : "تعليق"} حساب الطالب بنجاح`
            : `Student account ${newStatus.toLowerCase()} successfully`
        );
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to toggle status");
      }
    });
  }

  // Archive Action
  function handleTriggerArchive(e: React.FormEvent) {
    e.preventDefault();
    if (!archiveModalStudent) return;

    startTransition(async () => {
      try {
        await onArchiveStudent({
          studentId: archiveModalStudent.id,
          reason: archiveReason.trim() || undefined,
        });

        setStudents((prev) =>
          prev.map((s) =>
            s.id === archiveModalStudent.id ? { ...s, status: UserStatus.ARCHIVED } : s
          )
        );

        setActionMessage(isAr ? "تم أرشفة حساب الطالب بنجاح" : "Student account archived successfully");
        setArchiveModalStudent(null);
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to archive student");
      }
    });
  }

  // Copy reset credentials to clipboard
  function handleCopyCredentials() {
    if (!resetResult || !resetModalStudent) return;
    const text = isAr
      ? `مرحباً ولي أمر الطالب ${resetModalStudent.firstName}،\nتم تعيين بيانات تسجيل دخول طفلكم في أكاديمية نون العربية:\n- البريد الإلكتروني: ${resetResult.email}\n- كلمة المرور: ${resetResult.tempPassword}\nرابط الدخول: https://arabickidsacademy.com/${locale}/login`
      : `Hello Parent of ${resetModalStudent.firstName},\nLogin credentials for Arabic Kids Academy have been updated:\n- Email: ${resetResult.email}\n- Password: ${resetResult.tempPassword}\nLogin URL: https://arabickidsacademy.com/${locale}/login`;

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
              placeholder={isAr ? "بحث بالاسم، ولي الأمر، الهاتف..." : "Search by name, guardian, phone..."}
              className="w-full pl-9 pr-4 py-2.5 rtl:pr-9 rtl:pl-4 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Age Group Filter */}
          <div className="w-full sm:w-56">
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              aria-label={isAr ? "تصفية حسب الفئة العمرية" : "Filter by age group"}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="ALL">{isAr ? "جميع الفئات العمرية" : "All Age Groups"}</option>
              {Object.entries(AGE_GROUP_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {isAr ? label.ar : label.en}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label={isAr ? "تصفية حسب حالة الحساب" : "Filter by account status"}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="ALL">{isAr ? "جميع الحالات" : "All Account Statuses"}</option>
              {Object.entries(STATUS_CONFIG).map(([st, conf]) => (
                <option key={st} value={st}>
                  {isAr ? conf.labelAr : conf.labelEn}
                </option>
              ))}
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
            <span>{isAr ? "تسجيل طالب" : "Add Student"}</span>
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
            ? `عرض ${filteredStudents.length} من إجمالي ${students.length} طالب`
            : `Showing ${filteredStudents.length} of ${students.length} students`}
        </span>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">{isAr ? "بيانات الطالب" : "Student Info"}</th>
                <th className="px-6 py-4">{isAr ? "الفئة العمرية" : "Age Group"}</th>
                <th className="px-6 py-4">{isAr ? "ولي الأمر والتواصل" : "Guardian & Contact"}</th>
                <th className="px-6 py-4">{isAr ? "الفصول النشطة" : "Active Classes"}</th>
                <th className="px-6 py-4">{isAr ? "حالة الحساب" : "Account Status"}</th>
                <th className="px-6 py-4 text-center">{isAr ? "إجراءات الحوكمة" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>{isAr ? "لا توجد نتائج تطابق معايير البحث المحددة" : "No students match your filter criteria"}</span>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const statusConf = STATUS_CONFIG[st.status] || STATUS_CONFIG[UserStatus.ACTIVE];
                  const ageConf = AGE_GROUP_LABELS[st.ageGroup] || { ar: st.ageGroup, en: st.ageGroup };

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Initials */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center font-extrabold text-sm">
                            {st.firstName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">
                              {st.firstName} {st.lastName}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              ID: {st.id.slice(0, 12)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Age Group */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          {isAr ? ageConf.ar : ageConf.en}
                        </span>
                      </td>

                      {/* Guardian & Contact */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{st.guardianName}</span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span dir="ltr">{st.guardianPhone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Classes Count */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                          {st.enrolledClassesCount} {isAr ? "فصول" : "classes"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${statusConf.style}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {isAr ? statusConf.labelAr : statusConf.labelEn}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setResetModalStudent(st);
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
                            onClick={() => handleOpenEdit(st)}
                            title={isAr ? "تعديل بيانات الطالب" : "Edit Profile"}
                            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Toggle Active / Suspended */}
                          <button
                            onClick={() => handleTriggerToggleStatus(st)}
                            disabled={isPending}
                            title={
                              st.status === UserStatus.ACTIVE
                                ? isAr
                                  ? "تعليق الحساب"
                                  : "Suspend Account"
                                : isAr
                                ? "تفعيل الحساب"
                                : "Activate Account"
                            }
                            className={`p-2 rounded-xl transition-colors ${
                              st.status === UserStatus.ACTIVE
                                ? "text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Archive */}
                          <button
                            onClick={() => {
                              setArchiveModalStudent(st);
                              setArchiveReason("");
                            }}
                            title={isAr ? "أرشفة الحساب" : "Archive Account"}
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
      {resetModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <KeyRound className="w-5 h-5 text-brand-600" />
                <span>{isAr ? "إعادة تعيين كلمة مرور الطالب" : "Reset Student Password"}</span>
              </div>
              <button
                onClick={() => setResetModalStudent(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!resetResult ? (
              <form onSubmit={handleTriggerReset} className="space-y-4 text-sm">
                <p className="text-xs text-slate-600">
                  {isAr
                    ? `إعادة تعيين كلمة المرور لحساب الطالب [${resetModalStudent.firstName} ${resetModalStudent.lastName}]. يمكنك إدخال كلمة مرور محددة أو ترك الحقل فارغاً لتوليد كلمة مرور مؤقتة آمنة تلقائياً.`
                    : `Reset password for [${resetModalStudent.firstName} ${resetModalStudent.lastName}]. Leave blank to auto-generate a secure temporary password.`}
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
                    onClick={() => setResetModalStudent(null)}
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
                    onClick={() => setResetModalStudent(null)}
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

      {/* --- MODAL 2: EDIT STUDENT PROFILE --- */}
      {editModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <span>{isAr ? "تعديل بيانات الطالب الأكاديمية" : "Edit Student Profile"}</span>
              </div>
              <button
                onClick={() => setEditModalStudent(null)}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "تاريخ الميلاد" : "Date of Birth"}
                  </label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "الفئة العمرية" : "Age Group"}
                  </label>
                  <select
                    value={editAgeGroup}
                    onChange={(e) => setEditAgeGroup(e.target.value as AgeGroup)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {Object.entries(AGE_GROUP_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {isAr ? label.ar : label.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "ملاحظات إدارية داخلية (سرية)" : "Internal Notes (Confidential)"}
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder={isAr ? "ملاحظات حول مستوى الطالب، التوصيات التعليمية..." : "Notes on learning pace, recommendations..."}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalStudent(null)}
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

      {/* --- MODAL 3: ARCHIVE STUDENT --- */}
      {archiveModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base border-b border-slate-100 pb-3">
              <AlertTriangle className="w-5 h-5" />
              <span>{isAr ? "تأكيد أرشفة حساب الطالب" : "Confirm Student Archive"}</span>
            </div>

            <form onSubmit={handleTriggerArchive} className="space-y-4 text-xs">
              <p className="text-slate-600">
                {isAr
                  ? `هل أنت متأكد من رغبتك في أرشفة حساب الطالب [${archiveModalStudent.firstName} ${archiveModalStudent.lastName}]؟ سيتم تعطيل وصوله للفصول المباشرة مع الاحتفاظ بسجل الحضور والتقييمات لأغراض الامتثال.`
                  : `Are you sure you want to archive student [${archiveModalStudent.firstName} ${archiveModalStudent.lastName}]? Live access will be revoked while historical records are preserved.`}
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "سبب الأرشفة" : "Archive Reason"}
                </label>
                <input
                  type="text"
                  required
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  placeholder={isAr ? "انتهاء فترة الاشتراك، بطلب ولي الأمر..." : "End of period, parent request..."}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setArchiveModalStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  {isAr ? "تراجع" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm hover:bg-rose-700"
                >
                  {isPending ? (isAr ? "جاري الأرشفة..." : "Archiving...") : isAr ? "تأكيد الأرشفة" : "Confirm Archive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ADD STUDENT --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <PlusCircle className="w-5 h-5 text-brand-600" />
                <span>{isAr ? "تسجيل طالب جديد في الأكاديمية" : "Register New Student"}</span>
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
                await onAddStudent(formData);
                setShowAddModal(false);
                setActionMessage(isAr ? "تم تسجيل الطالب بنجاح" : "Student registered successfully");
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
                    placeholder={isAr ? "مثال: ياسمين" : "e.g. Yasmin"}
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
                    placeholder={isAr ? "مثال: القرشي" : "e.g. Al-Qurashi"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "تاريخ الميلاد" : "Date of Birth"}
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    defaultValue="2017-01-01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "الفئة العمرية" : "Age Group"}
                  </label>
                  <select
                    name="ageGroup"
                    defaultValue={AgeGroup.AGE_7_10}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {Object.entries(AGE_GROUP_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {isAr ? label.ar : label.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "اسم ولي الأمر" : "Guardian Name"}
                  </label>
                  <input
                    name="guardianName"
                    required
                    placeholder={isAr ? "مثال: أحمد القرشي" : "e.g. Ahmed Al-Qurashi"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "هاتف ولي الأمر (واتساب)" : "Guardian Phone (WhatsApp)"}
                  </label>
                  <input
                    name="guardianPhone"
                    required
                    dir="ltr"
                    placeholder="+31 6856 630 10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "ملاحظات إدارية" : "Notes"}
                </label>
                <textarea
                  name="notesInternal"
                  rows={2}
                  placeholder={isAr ? "ملاحظات إضافية..." : "Additional notes..."}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                />
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
                  {isAr ? "تأكيد التسجيل" : "Register Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
