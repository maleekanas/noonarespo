import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { schedulingRepository } from "@/server/repositories/SchedulingRepository";
import { attendanceService } from "@/server/services/AttendanceService";
import { AttendanceStatus } from "@prisma/client";
import { requireTeacherProfile } from "@/lib/auth/currentUser";
import {
  Users,
  Video,
  FileCheck,
  Layout,
} from "lucide-react";

export default async function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireTeacherProfile(locale);
  const classGroup = await academicRepository.getClassGroupById(id);

  if (!classGroup) {
    notFound();
  }

  // Get sessions for this class
  const sessions = await schedulingRepository.getSessionsByClassGroupId(id);
  const activeSession = sessions.length > 0 ? sessions[0] : null;

  // Get roster and attendance
  const roster = activeSession
    ? await attendanceService.getSessionRoster(activeSession.id)
    : [];

  async function handleMarkAttendance(formData: FormData) {
    "use server";
    await requireTeacherProfile(locale);
    const sessionId = formData.get("sessionId")?.toString();
    const studentId = formData.get("studentId")?.toString();
    const status = formData.get("status")?.toString() as AttendanceStatus;

    if (!sessionId || !studentId || !status) return;

    await attendanceService.recordAttendance({
      sessionId,
      studentId,
      status,
    });

    revalidatePath(`/${locale}/teacher/classes/${id}`);
    revalidatePath(`/${locale}/parent`);
    revalidatePath(`/${locale}/student`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Class Banner & Virtual Classroom Launcher */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-100">
              <Link href={`/${locale}/teacher`} className="hover:underline">
                بوابة المعلم
              </Link>
              <span>/</span>
              <span>تفاصيل الفصل</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{classGroup.name}</h1>
            <p className="text-xs text-teal-100">
              فصل تفاعلي مصغر • السعة: {classGroup.capacityMax} طلاب كحد أقصى
            </p>
          </div>

          {activeSession && (
            <div className="flex items-center gap-3">
              <a
                href={activeSession.meetingUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-emerald-800 font-extrabold text-sm shadow-md hover:bg-teal-50 transition-all"
              >
                <Video className="w-5 h-5 text-emerald-600" />
                <span>بدء الحصة الافتراضية (Zoom / Meet)</span>
              </a>
              <Link
                href={`/${locale}/classroom/${activeSession.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-950/40 border border-white/30 text-white font-extrabold text-sm shadow-md hover:bg-emerald-950/60 transition-all"
              >
                <Layout className="w-5 h-5" />
                <span>السبورة التفاعلية المباشرة</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Roster with Live Attendance Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                <span>قائمة الطلاب ورصد الحضور الفوري ({roster.length})</span>
              </h2>
              {activeSession && (
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-brand-700 font-bold border border-blue-100">
                  حصة اليوم: 04:00 م - 04:45 م
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {roster.map((item) => (
                <div
                  key={item.student.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center">
                      {item.student.firstName[0]}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        {item.student.firstName} {item.student.lastName}
                      </span>
                      <span className="text-xs text-slate-500">
                        اللغة الأم: {item.student.nativeLanguage === "ar" ? "العربية" : item.student.nativeLanguage}
                      </span>
                    </div>
                  </div>

                  {/* Attendance Marking Buttons */}
                  {activeSession && (
                    <div className="flex items-center gap-2">
                      <form action={handleMarkAttendance}>
                        <input type="hidden" name="sessionId" value={activeSession.id} />
                        <input type="hidden" name="studentId" value={item.student.id} />
                        <input type="hidden" name="status" value={AttendanceStatus.PRESENT} />
                        <button
                          type="submit"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            item.status === AttendanceStatus.PRESENT
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700"
                          }`}
                        >
                          ✓ حاضر
                        </button>
                      </form>

                      <form action={handleMarkAttendance}>
                        <input type="hidden" name="sessionId" value={activeSession.id} />
                        <input type="hidden" name="studentId" value={item.student.id} />
                        <input type="hidden" name="status" value={AttendanceStatus.LATE} />
                        <button
                          type="submit"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            item.status === AttendanceStatus.LATE
                              ? "bg-amber-500 text-white shadow-sm"
                              : "bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700"
                          }`}
                        >
                          ⏱ متأخر
                        </button>
                      </form>

                      <form action={handleMarkAttendance}>
                        <input type="hidden" name="sessionId" value={activeSession.id} />
                        <input type="hidden" name="studentId" value={item.student.id} />
                        <input type="hidden" name="status" value={AttendanceStatus.ABSENT} />
                        <button
                          type="submit"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            item.status === AttendanceStatus.ABSENT
                              ? "bg-rose-600 text-white shadow-sm"
                              : "bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700"
                          }`}
                        >
                          ✗ غائب
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Class Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-600" />
              <span>الواجبات والمهام لهذا الفصل</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              إنشاء مهمة منزلية جديدة أو مراجعة التسجيلات الصوتية المسلمة من قبل الطلاب.
            </p>

            <Link
              href={`/${locale}/teacher/assignments?classGroupId=${id}`}
              className="w-full py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 text-center block transition-all"
            >
              إدارة وتصحيح الواجبات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
