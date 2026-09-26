"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  Edit3,
  Trash2,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  UserPlus,
  UserMinus,
  Check,
  X,
  Radio,
  Sparkles,
} from "lucide-react";
import { ClassType } from "@prisma/client";

export interface ClassGroupDisplayItem {
  id: string;
  name: string;
  courseLevelId: string;
  classType: ClassType;
  capacityMax: number;
  schoolId: string | null;
  schoolName: string | null;
  teacherId: string | null;
  teacherName: string | null;
  enrollmentsCount: number;
  enrolledStudents: { id: string; studentId: string; studentName: string }[];
}

interface ClassManagementClientProps {
  initialClasses: ClassGroupDisplayItem[];
  allTeachers: { id: string; name: string }[];
  allSchools: { id: string; name: string }[];
  allLevels: { id: string; title: string }[];
  allStudents: { id: string; name: string }[];
  locale: string;
  onCreateClass: (params: {
    name: string;
    courseLevelId: string;
    classType: ClassType;
    capacityMax: number;
    schoolId?: string | null;
  }) => Promise<any>;
  onUpdateClass: (params: {
    classGroupId: string;
    data: {
      name: string;
      courseLevelId: string;
      classType: ClassType;
      capacityMax: number;
      schoolId?: string | null;
    };
  }) => Promise<any>;
  onDeleteClass: (params: { classGroupId: string }) => Promise<any>;
  onAssignTeacher: (params: { classGroupId: string; teacherId: string }) => Promise<any>;
  onEnrollStudent: (params: { classGroupId: string; studentId: string }) => Promise<any>;
  onUnenrollStudent: (params: { classGroupId: string; studentId: string }) => Promise<any>;
}

export function ClassManagementClient({
  initialClasses,
  allTeachers,
  allSchools,
  allLevels,
  allStudents,
  locale,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  onAssignTeacher,
  onEnrollStudent,
  onUnenrollStudent,
}: ClassManagementClientProps) {
  const isAr = locale === "ar";
  const [classes, setClasses] = useState<ClassGroupDisplayItem[]>(initialClasses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedSchool, setSelectedSchool] = useState<string>("ALL");
  const [selectedOccupancy, setSelectedOccupancy] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModalClass, setEditModalClass] = useState<ClassGroupDisplayItem | null>(null);
  const [rosterModalClass, setRosterModalClass] = useState<ClassGroupDisplayItem | null>(null);
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState("");

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editLevelId, setEditLevelId] = useState("");
  const [editType, setEditType] = useState<ClassType>(ClassType.GROUP);
  const [editCapacity, setEditCapacity] = useState(6);
  const [editSchoolId, setEditSchoolId] = useState("");

  // Create fields
  const [createName, setCreateName] = useState("");
  const [createLevelId, setCreateLevelId] = useState(allLevels[0]?.id || "level-a1-reading");
  const [createType, setCreateType] = useState<ClassType>(ClassType.GROUP);
  const [createCapacity, setCreateCapacity] = useState(6);
  const [createSchoolId, setCreateSchoolId] = useState("");

  // Filter classes
  const filteredClasses = classes.filter((cg) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      cg.name.toLowerCase().includes(q) ||
      (cg.teacherName && cg.teacherName.toLowerCase().includes(q)) ||
      (cg.schoolName && cg.schoolName.toLowerCase().includes(q));

    const matchesType = selectedType === "ALL" || cg.classType === selectedType;

    const matchesSchool =
      selectedSchool === "ALL" ||
      (selectedSchool === "PLATFORM" && !cg.schoolId) ||
      cg.schoolId === selectedSchool;

    const isFull = cg.enrollmentsCount >= cg.capacityMax;
    const matchesOccupancy =
      selectedOccupancy === "ALL" ||
      (selectedOccupancy === "FULL" && isFull) ||
      (selectedOccupancy === "AVAILABLE" && !isFull);

    return matchesSearch && matchesType && matchesSchool && matchesOccupancy;
  });

  // Export CSV
  function handleExportCsv() {
    const headers = [
      "ID",
      "Class Name",
      "Course Level",
      "Type",
      "Assigned Teacher",
      "Partner School",
      "Enrolled Students",
      "Max Capacity",
      "Occupancy Pct",
    ];

    const rows = filteredClasses.map((cg) => [
      cg.id,
      `"${cg.name.replace(/"/g, '""')}"`,
      cg.courseLevelId,
      cg.classType,
      `"${(cg.teacherName || "Unassigned").replace(/"/g, '""')}"`,
      `"${(cg.schoolName || "Independent").replace(/"/g, '""')}"`,
      cg.enrollmentsCount,
      cg.capacityMax,
      `${Math.round((cg.enrollmentsCount / (cg.capacityMax || 1)) * 100)}%`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `classes_roster_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Open Edit Modal
  function handleOpenEdit(cg: ClassGroupDisplayItem) {
    setEditModalClass(cg);
    setEditName(cg.name);
    setEditLevelId(cg.courseLevelId);
    setEditType(cg.classType);
    setEditCapacity(cg.capacityMax);
    setEditSchoolId(cg.schoolId || "");
  }

  // Save Edit
  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editModalClass) return;

    startTransition(async () => {
      try {
        await onUpdateClass({
          classGroupId: editModalClass.id,
          data: {
            name: editName.trim(),
            courseLevelId: editLevelId,
            classType: editType,
            capacityMax: editCapacity,
            schoolId: editSchoolId || null,
          },
        });

        const targetSchool = allSchools.find((s) => s.id === editSchoolId);

        setClasses((prev) =>
          prev.map((c) =>
            c.id === editModalClass.id
              ? {
                  ...c,
                  name: editName.trim(),
                  courseLevelId: editLevelId,
                  classType: editType,
                  capacityMax: editCapacity,
                  schoolId: editSchoolId || null,
                  schoolName: targetSchool ? targetSchool.name : null,
                }
              : c
          )
        );

        setActionMessage(isAr ? "تم تحديث بيانات الفصل بنجاح" : "Class group updated successfully");
        setEditModalClass(null);
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to update class group");
      }
    });
  }

  // Create Class
  function handleSaveCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const created = await onCreateClass({
          name: createName.trim(),
          courseLevelId: createLevelId,
          classType: createType,
          capacityMax: createCapacity,
          schoolId: createSchoolId || null,
        });

        const targetSchool = allSchools.find((s) => s.id === createSchoolId);

        setClasses((prev) => [
          {
            id: created.id,
            name: createName.trim(),
            courseLevelId: createLevelId,
            classType: createType,
            capacityMax: createCapacity,
            schoolId: createSchoolId || null,
            schoolName: targetSchool ? targetSchool.name : null,
            teacherId: null,
            teacherName: null,
            enrollmentsCount: 0,
            enrolledStudents: [],
          },
          ...prev,
        ]);

        setShowCreateModal(false);
        setCreateName("");
        setActionMessage(isAr ? "تم إنشاء الفوج الدراسي بنجاح" : "Class group created successfully");
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to create class group");
      }
    });
  }

  // Assign Teacher
  function handleAssignTeacher(classGroupId: string, teacherId: string) {
    startTransition(async () => {
      try {
        await onAssignTeacher({ classGroupId, teacherId });
        const teacher = allTeachers.find((t) => t.id === teacherId);

        setClasses((prev) =>
          prev.map((c) =>
            c.id === classGroupId
              ? {
                  ...c,
                  teacherId,
                  teacherName: teacher ? teacher.name : "معلم معتمد",
                }
              : c
          )
        );

        setActionMessage(isAr ? "تم تعيين المعلم للفصل بنجاح" : "Teacher assigned successfully");
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to assign teacher");
      }
    });
  }

  // Enroll Student
  function handleEnrollStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!rosterModalClass || !selectedStudentToEnroll) return;

    startTransition(async () => {
      try {
        const enr = await onEnrollStudent({
          classGroupId: rosterModalClass.id,
          studentId: selectedStudentToEnroll,
        });

        const st = allStudents.find((s) => s.id === selectedStudentToEnroll);
        const newStudentEntry = {
          id: enr.id,
          studentId: selectedStudentToEnroll,
          studentName: st ? st.name : selectedStudentToEnroll,
        };

        const updatedEnrolled = [...rosterModalClass.enrolledStudents, newStudentEntry];

        setClasses((prev) =>
          prev.map((c) =>
            c.id === rosterModalClass.id
              ? {
                  ...c,
                  enrollmentsCount: c.enrollmentsCount + 1,
                  enrolledStudents: updatedEnrolled,
                }
              : c
          )
        );

        setRosterModalClass({
          ...rosterModalClass,
          enrollmentsCount: rosterModalClass.enrollmentsCount + 1,
          enrolledStudents: updatedEnrolled,
        });

        setSelectedStudentToEnroll("");
        setActionMessage(isAr ? "تم تسجيل الطالب في الفصل بنجاح" : "Student enrolled successfully");
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to enroll student");
      }
    });
  }

  // Unenroll Student
  function handleUnenrollStudent(classGroupId: string, studentId: string) {
    startTransition(async () => {
      try {
        await onUnenrollStudent({ classGroupId, studentId });

        setClasses((prev) =>
          prev.map((c) =>
            c.id === classGroupId
              ? {
                  ...c,
                  enrollmentsCount: Math.max(0, c.enrollmentsCount - 1),
                  enrolledStudents: c.enrolledStudents.filter((e) => e.studentId !== studentId),
                }
              : c
          )
        );

        if (rosterModalClass && rosterModalClass.id === classGroupId) {
          setRosterModalClass({
            ...rosterModalClass,
            enrollmentsCount: Math.max(0, rosterModalClass.enrollmentsCount - 1),
            enrolledStudents: rosterModalClass.enrolledStudents.filter(
              (e) => e.studentId !== studentId
            ),
          });
        }

        setActionMessage(isAr ? "تم إلغاء تسجيل الطالب بنجاح" : "Student unenrolled successfully");
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to unenroll student");
      }
    });
  }

  // Delete Class Group
  function handleDeleteClass(classGroupId: string, className: string) {
    if (!confirm(isAr ? `هل أنت متأكد من حذف الفصل [${className}]؟` : `Delete class [${className}]?`))
      return;

    startTransition(async () => {
      try {
        await onDeleteClass({ classGroupId });
        setClasses((prev) => prev.filter((c) => c.id !== classGroupId));
        setActionMessage(isAr ? "تم حذف الفصل بنجاح" : "Class group deleted successfully");
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to delete class group");
      }
    });
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
              placeholder={isAr ? "بحث بالفصل، المعلم، المدرسة..." : "Search class, teacher, school..."}
              className="w-full pl-9 pr-4 py-2.5 rtl:pr-9 rtl:pl-4 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Class Type Filter */}
          <div className="w-full sm:w-44">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label={isAr ? "تصفية حسب نوع الفصل" : "Filter by class type"}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="ALL">{isAr ? "جميع الأنواع" : "All Class Types"}</option>
              <option value={ClassType.GROUP}>{isAr ? "مجموعة (حتى 6)" : "Group (Max 6)"}</option>
              <option value={ClassType.PRIVATE_1_ON_1}>{isAr ? "حصة فردية خاصة" : "Private 1-on-1"}</option>
            </select>
          </div>

          {/* School / Institution Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              aria-label={isAr ? "تصفية حسب المؤسسة" : "Filter by institution"}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="ALL">{isAr ? "جميع المؤسسات" : "All Institutions"}</option>
              <option value="PLATFORM">{isAr ? "الأكاديمية العامة (فردي)" : "Direct Platform"}</option>
              {allSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Occupancy Filter */}
          <div className="w-full sm:w-40">
            <select
              value={selectedOccupancy}
              onChange={(e) => setSelectedOccupancy(e.target.value)}
              aria-label={isAr ? "تصفية حسب المقاعد" : "Filter by occupancy"}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="ALL">{isAr ? "المقاعد (الكل)" : "All Capacities"}</option>
              <option value="AVAILABLE">{isAr ? "مقاعد شاغرة" : "Seats Available"}</option>
              <option value="FULL">{isAr ? "مكتمل السعة" : "Fully Booked"}</option>
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-2xl gradient-brand text-white text-sm font-bold shadow-sm hover:opacity-95 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAr ? "إنشاء فوج دراسي" : "Create Class"}</span>
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

      {/* Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2">
        <span>
          {isAr
            ? `عرض ${filteredClasses.length} من إجمالي ${classes.length} فوج دراسي نشط`
            : `Showing ${filteredClasses.length} of ${classes.length} active classes`}
        </span>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">{isAr ? "الفوج والمستوى" : "Class & Level"}</th>
                <th className="px-6 py-4">{isAr ? "المعلم المسؤول" : "Assigned Faculty"}</th>
                <th className="px-6 py-4">{isAr ? "المؤسسة / النطاق" : "Institution / Scope"}</th>
                <th className="px-6 py-4">{isAr ? "السعة والطلاب" : "Occupancy / Seats"}</th>
                <th className="px-6 py-4 text-center">{isAr ? "الفصل المباشر" : "Live Room"}</th>
                <th className="px-6 py-4 text-center">{isAr ? "إجراءات الحوكمة" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>{isAr ? "لا توجد فصول تطابق معايير البحث" : "No classes match your search"}</span>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cg) => {
                  const isFull = cg.enrollmentsCount >= cg.capacityMax;

                  return (
                    <tr key={cg.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Type */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-extrabold text-slate-900">{cg.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700 font-bold border border-brand-100 font-mono">
                              {cg.courseLevelId}
                            </span>
                            <span className="text-xs text-slate-500">
                              {cg.classType === ClassType.GROUP
                                ? isAr
                                  ? "فوج جماعي (6 طلاب)"
                                  : "Group"
                                : isAr
                                ? "فردي خاص"
                                : "Private"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Teacher Assignment Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={cg.teacherId || ""}
                          onChange={(e) => handleAssignTeacher(cg.id, e.target.value)}
                          disabled={isPending}
                          aria-label={isAr ? "تعيين المعلم للفصل" : "Assign teacher to class"}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 bg-white"
                        >
                          <option value="">{isAr ? "-- بانتظار تعيين معلم --" : "-- Select Teacher --"}</option>
                          {allTeachers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* School Scoping */}
                      <td className="px-6 py-4">
                        {cg.schoolName ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{cg.schoolName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Arabic Kids Academy (Direct Platform)
                          </span>
                        )}
                      </td>

                      {/* Occupancy & Roster view */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRosterModalClass(cg)}
                            title={isAr ? "عرض وتعديل قائمة الطلاب" : "View & Edit Roster"}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors hover:bg-slate-100"
                          >
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {cg.enrollmentsCount} / {cg.capacityMax}
                            </span>
                          </button>

                          <span
                            className={`w-2 h-2 rounded-full ${
                              isFull ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                          />
                        </div>
                      </td>

                      {/* Live Observer Link */}
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/${locale}/classroom/${cg.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors"
                        >
                          <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                          <span>{isAr ? "مراقب مباشر" : "Observe"}</span>
                        </Link>
                      </td>

                      {/* Governance Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Class */}
                          <button
                            onClick={() => handleOpenEdit(cg)}
                            title={isAr ? "تعديل الفوج الدراسي" : "Edit Class"}
                            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Class */}
                          <button
                            onClick={() => handleDeleteClass(cg.id, cg.name)}
                            title={isAr ? "حذف الفصل" : "Delete Class"}
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

      {/* --- MODAL 1: EDIT CLASS --- */}
      {editModalClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <span>{isAr ? "تعديل بيانات الفوج الدراسي" : "Edit Class Group"}</span>
              </div>
              <button
                onClick={() => setEditModalClass(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "اسم الفوج الدراسي" : "Class Name"}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "المستوى الأكاديمي" : "Course Level"}
                  </label>
                  <select
                    value={editLevelId}
                    onChange={(e) => setEditLevelId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {allLevels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "نوع الفصل" : "Class Type"}
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as ClassType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value={ClassType.GROUP}>{isAr ? "فوج جماعي (GROUP)" : "Group"}</option>
                    <option value={ClassType.PRIVATE_1_ON_1}>
                      {isAr ? "فردي خاص (PRIVATE_1_ON_1)" : "Private 1-on-1"}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "السعة القصوى للطلاب" : "Max Capacity"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(parseInt(e.target.value, 10) || 6)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "المؤسسة الشريكة (اختياري)" : "Partner School (Optional)"}
                  </label>
                  <select
                    value={editSchoolId}
                    onChange={(e) => setEditSchoolId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="">{isAr ? "-- الأكاديمية العامة (فردي) --" : "-- Direct Platform --"}</option>
                    {allSchools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalClass(null)}
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

      {/* --- MODAL 2: CREATE CLASS --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <PlusCircle className="w-5 h-5 text-brand-600" />
                <span>{isAr ? "إنشاء فوج دراسي جديد" : "Create New Class Group"}</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "اسم الفوج الدراسي" : "Class Group Name"}
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={isAr ? "مثال: فوج القراءة التأسيسية - أ" : "e.g. Reading Foundations - Cohort A"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "المستوى الأكاديمي" : "Course Level"}
                  </label>
                  <select
                    value={createLevelId}
                    onChange={(e) => setCreateLevelId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {allLevels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "نوع الفصل" : "Class Type"}
                  </label>
                  <select
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as ClassType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value={ClassType.GROUP}>{isAr ? "مجموعة صغيرة (GROUP)" : "Group"}</option>
                    <option value={ClassType.PRIVATE_1_ON_1}>
                      {isAr ? "فردي خاص (PRIVATE_1_ON_1)" : "Private 1-on-1"}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "السعة القصوى (الحد الأقصى 10)" : "Max Capacity (Max 10)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={createCapacity}
                    onChange={(e) => setCreateCapacity(parseInt(e.target.value, 10) || 6)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "المؤسسة الشريكة (اختياري)" : "Partner School (Optional)"}
                  </label>
                  <select
                    value={createSchoolId}
                    onChange={(e) => setCreateSchoolId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="">{isAr ? "-- الأكاديمية العامة (فردي) --" : "-- Direct Platform --"}</option>
                    {allSchools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95"
                >
                  {isPending ? (isAr ? "جاري الإنشاء..." : "Creating...") : isAr ? "إنشاء الفوج" : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ROSTER & ENROLLMENT --- */}
      {rosterModalClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <Users className="w-5 h-5 text-brand-600" />
                <span>
                  {isAr ? `قائمة طلاب فوج [${rosterModalClass.name}]` : `Roster for [${rosterModalClass.name}]`}
                </span>
              </div>
              <button
                onClick={() => setRosterModalClass(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Enroll new student input */}
            <form onSubmit={handleEnrollStudent} className="flex gap-2">
              <select
                value={selectedStudentToEnroll}
                onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                aria-label={isAr ? "اختر طالباً لتسجيله بالفصل" : "Select a student to enroll"}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">{isAr ? "-- اختر طالباً لتسجيله بالفصل --" : "-- Select Student to Enroll --"}</option>
                {allStudents
                  .filter((st) => !rosterModalClass.enrolledStudents.some((e) => e.studentId === st.id))
                  .map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                disabled={isPending || !selectedStudentToEnroll}
                className="px-4 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 disabled:opacity-50"
              >
                {isAr ? "+ تسجيل" : "+ Enroll"}
              </button>
            </form>

            {/* Enrolled Students list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl">
              {rosterModalClass.enrolledStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  {isAr ? "لا يوجد طلاب مسجلون في هذا الفصل بعد" : "No students enrolled yet"}
                </div>
              ) : (
                rosterModalClass.enrolledStudents.map((enr) => (
                  <div
                    key={enr.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs"
                  >
                    <div className="font-bold text-slate-800">{enr.studentName}</div>
                    <button
                      type="button"
                      onClick={() => handleUnenrollStudent(rosterModalClass.id, enr.studentId)}
                      title={isAr ? "إلغاء تسجيل الطالب" : "Unenroll Student"}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>
                {isAr
                  ? `السعة: ${rosterModalClass.enrollmentsCount} من ${rosterModalClass.capacityMax}`
                  : `Capacity: ${rosterModalClass.enrollmentsCount} / ${rosterModalClass.capacityMax}`}
              </span>
              <button
                type="button"
                onClick={() => setRosterModalClass(null)}
                className="px-4 py-2 rounded-xl gradient-brand text-white font-bold text-xs"
              >
                {isAr ? "إغلاق" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
