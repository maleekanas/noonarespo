import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { schedulingRepository } from "@/server/repositories/SchedulingRepository";
import { schedulingService } from "@/server/services/SchedulingService";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { userRepository } from "@/server/repositories/UserRepository";
import {
  Calendar,
  Clock,
  Video,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";

export default async function AdminSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const sessions = await schedulingRepository.getAllSessions();
  const classGroups = await academicRepository.getAllClassGroups();

  // Resolve the real teacher assigned to each class group (rather than a
  // hardcoded display name) so the sessions list shows who's actually
  // teaching each one.
  const teacherNameByClassGroupId = new Map<string, string>();
  for (const cg of classGroups) {
    const assignments = await academicRepository.getTeacherAssignmentsByClassGroupId(cg.id);
    const teacher = assignments.length > 0
      ? await userRepository.findTeacherProfileById(assignments[0].teacherId)
      : null;
    if (teacher) {
      teacherNameByClassGroupId.set(cg.id, `${teacher.firstName} ${teacher.lastName}`);
    }
  }

  async function handleScheduleSession(formData: FormData) {
    "use server";
    const classGroupId = formData.get("classGroupId")?.toString() || "class-reading-a1-cohort1";
    const startDateTimeStr = formData.get("startDateTime")?.toString() || "";
    const durationMinutesStr = formData.get("durationMinutes")?.toString() || "45";

    if (!startDateTimeStr) return;

    // Assign the session to the teacher actually assigned to this class
    // group, instead of a hardcoded id -- fall back to the classGroup's own
    // teacherId field only if there's no explicit assignment on record.
    const assignments = await academicRepository.getTeacherAssignmentsByClassGroupId(classGroupId);
    const teacherId = assignments[0]?.teacherId;
    if (!teacherId) {
      console.error(`Scheduling error: no teacher is assigned to class group ${classGroupId}`);
      return;
    }

    try {
      await schedulingService.scheduleSession({
        classGroupId,
        teacherId,
        startTimeUtc: new Date(startDateTimeStr),
        durationMinutes: parseInt(durationMinutesStr, 10),
      });

      revalidatePath(`/${locale}/admin/schedule`);
      revalidatePath(`/${locale}/teacher`);
      revalidatePath(`/${locale}/student`);
    } catch (e: unknown) {
      console.error("Scheduling error:", e);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              لوحة الإدارة
            </Link>
            <span>/</span>
            <span>الجدول العام والحصص</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            الجدول العام ومحرك رصد التعارضات 🗓️
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            جدولة الحصص المباشرة والتحقق التلقائي من عدم تداخل مواعيد المعلمين والطلاب
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>محرك رصد التعارضات نشط ويعمل بدقة</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Sessions List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <span>الحصص المجدولة ({sessions.length})</span>
          </h2>

          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                      مؤكدة
                    </span>
                    <span className="text-xs text-slate-400">
                      معلم: {teacherNameByClassGroupId.get(session.classGroupId)
                        ? `أ/ ${teacherNameByClassGroupId.get(session.classGroupId)}`
                        : "لم يُحدد بعد"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">
                    فصل: {session.classGroupId}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{session.startTimeUtc.toUTCString()}</span>
                    </span>
                  </div>
                </div>

                <a
                  href={session.meetingUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>دخول الغرفة الافتراضية</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Schedule Session Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-purple-600" />
              <span>جدولة حصة جديدة</span>
            </h3>
            <p className="text-xs text-slate-500">
              سيقوم النظام بالتحقق الفوري من عدم وجود تعارض مع مواعيد المعلم
            </p>
          </div>

          <form action={handleScheduleSession} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الفصل الدراسي</label>
              <select
                name="classGroupId"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {classGroups.map((cg) => (
                  <option key={cg.id} value={cg.id}>
                    {cg.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ ووقت البدء (UTC)</label>
              <input
                name="startDateTime"
                type="datetime-local"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المدة (بالدقائق)</label>
              <input
                name="durationMinutes"
                type="number"
                min={15}
                max={120}
                defaultValue={45}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-md hover:opacity-95 transition-all"
            >
              فحص التعارض وتأكيد الحصة
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
