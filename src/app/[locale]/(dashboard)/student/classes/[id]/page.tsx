import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { schedulingRepository } from "@/server/repositories/SchedulingRepository";
import { assignmentRepository } from "@/server/repositories/AssignmentRepository";
import { userRepository } from "@/server/repositories/UserRepository";
import {
  Video,
  FileCheck,
  CheckCircle2,
} from "lucide-react";

export default async function StudentClassDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const classGroup = await academicRepository.getClassGroupById(id);

  if (!classGroup) {
    notFound();
  }

  // Get active session
  const sessions = await schedulingRepository.getSessionsByClassGroupId(id);
  const activeSession = sessions.length > 0 ? sessions[0] : null;

  // Get teacher
  const teacherAssignments = await academicRepository.getTeacherAssignmentsByClassGroupId(id);
  const teacher = teacherAssignments.length > 0
    ? await userRepository.findTeacherProfileById(teacherAssignments[0].teacherId)
    : null;

  // Get assignments
  const assignments = await assignmentRepository.getAssignmentsByClassGroupId(id);
  const studentSubmissions = await assignmentRepository.getSubmissionsByStudentId("student-1");
  const submissionMap = new Map(studentSubmissions.map((s) => [s.assignmentId, s]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
              <Link href={`/${locale}/student`} className="hover:underline">
                بوابة الطالب
              </Link>
              <span>/</span>
              <span>فصلي الدراسي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{classGroup.name}</h1>
            <p className="text-xs text-purple-100">
              مع الأستاذ: {teacher ? `${teacher.firstName} ${teacher.lastName}` : "معلم معتمد"}
            </p>
          </div>

          {activeSession && (
            <a
              href={activeSession.meetingUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-purple-900 font-extrabold text-sm shadow-md hover:bg-purple-50 transition-all"
            >
              <Video className="w-5 h-5 text-purple-600" />
              <span>دخول الفصل الافتراضي الآن</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Grid: Class Schedule & Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-brand-600" />
              <span>مهام وواجبات هذا الفصل</span>
            </h2>

            <div className="space-y-4">
              {assignments.map((assignment) => {
                const sub = submissionMap.get(assignment.id);
                return (
                  <div
                    key={assignment.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm">{assignment.titleAr}</h3>
                      <p className="text-xs text-slate-500 max-w-md line-clamp-2">
                        {assignment.instructions}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {sub ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>تم التسليم ({sub.status === "GRADED" ? "تم التقييم" : "قيد المراجعة"})</span>
                        </span>
                      ) : (
                        <Link
                          href={`/${locale}/student/homework/${assignment.id}`}
                          className="px-4 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all"
                        >
                          تسليم الحل الآن
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Teacher Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">معلم الفصل</h3>
            {teacher && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl gradient-brand text-white font-bold flex items-center justify-center text-base">
                    {teacher.firstName[0]}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      {teacher.firstName} {teacher.lastName}
                    </span>
                    <span className="text-slate-500 block">خبرة {teacher.experienceYears} عاماً</span>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                  {teacher.bioAr}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
