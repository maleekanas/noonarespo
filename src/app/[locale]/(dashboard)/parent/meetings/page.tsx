import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { communicationRepository } from "@/server/repositories/CommunicationRepository";
import { communicationService } from "@/server/services/CommunicationService";
import { userRepository } from "@/server/repositories/UserRepository";
import { academicRepository } from "@/server/repositories/AcademicRepository";

import { requireParentProfile } from "@/lib/auth/currentUser";
import {
  Calendar,
  Clock,
  Video,
  PlusCircle,
} from "lucide-react";

export default async function ParentMeetingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;

  const children = await userRepository.getLinkedChildren(parentId);
  const meetings = await communicationRepository.getMeetingRequestsByParentId(parentId);

  // Resolve a display name for whichever teacher each meeting is actually
  // with, instead of a single hardcoded "أحمد المنصوري" for every meeting.
  const teacherNameByTeacherId = new Map<string, string>();
  for (const teacherId of new Set(meetings.map((m) => m.teacherId))) {
    const teacher = await userRepository.findTeacherProfileById(teacherId);
    if (teacher) {
      teacherNameByTeacherId.set(teacherId, `${teacher.firstName} ${teacher.lastName}`);
    }
  }

  // Find the real teacher assigned to a given child's class, instead of a
  // hardcoded demo teacher id -- every parent used to book a meeting with
  // the same fake teacher regardless of who actually teaches their child.
  async function resolveTeacherIdForStudent(studentId: string): Promise<string | undefined> {
    const enrollments = await academicRepository.getEnrollmentsByStudentId(studentId);
    for (const enr of enrollments) {
      const assignments = await academicRepository.getTeacherAssignmentsByClassGroupId(enr.classGroupId);
      if (assignments[0]) return assignments[0].teacherId;
    }
    return undefined;
  }

  async function handleRequestMeeting(formData: FormData) {
    "use server";
    const studentId = formData.get("studentId")?.toString() || (children.length > 0 ? children[0].id : "");
    const dateStr = formData.get("meetingDate")?.toString();
    const notes = formData.get("notes")?.toString();

    if (!dateStr || !studentId) return;

    const teacherId = await resolveTeacherIdForStudent(studentId);
    if (!teacherId) {
      console.error(`Meeting request error: no teacher is assigned to student ${studentId}`);
      return;
    }

    await communicationService.requestMeeting({
      parentId,
      teacherId,
      studentId,
      requestedTimeUtc: new Date(dateStr),
      notes: notes || "استشارة دورية لمتابعة التقدم اللغوي للطفل",
    });

    revalidatePath(`/${locale}/parent/meetings`);
    revalidatePath(`/${locale}/teacher/meetings`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent`} className="hover:underline">
              لوحة ولي الأمر
            </Link>
            <span>/</span>
            <span>اللقاءات الفردية</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            حجز لقاء فردي مع المعلم (15 دقيقة) 🤝
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            لقاءات دورية مباشرة عبر الفيديو مع معلم طفلك لمراجعة الأداء ومناقشة الخطة التعليمية
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-brand-700 border border-blue-200 text-xs font-bold">
          <Clock className="w-4 h-4" />
          <span>مدة اللقاء: 15 دقيقة مركزة</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Existing Meetings */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <span>اللقاءات المحجوزة والقادمة ({meetings.length})</span>
          </h2>

          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        meeting.status === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {meeting.status === "CONFIRMED" ? "مؤكد وجاهز" : "بانتظار تأكيد المعلم"}
                    </span>
                    <span className="text-xs text-slate-400">
                      مع الأستاذ: {teacherNameByTeacherId.get(meeting.teacherId) || "لم يُحدد بعد"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {meeting.notes || "استشارة دورية حول الأداء الأكاديمي"}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(meeting.requestedTimeUtc).toLocaleDateString("ar-SA", { dateStyle: "full" })}</span>
                    </span>
                  </div>
                </div>

                {meeting.status === "CONFIRMED" && meeting.meetingUrl && (
                  <a
                    href={meeting.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>دخول الغرفة الافتراضية</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Book Meeting Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-purple-600" />
              <span>طلب موعد جديد</span>
            </h3>
            <p className="text-xs text-slate-500">
              اختر الطفل والموعد المناسب لجدولة الاستشارة
            </p>
          </div>

          <form action={handleRequestMeeting} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الطفل المعني</label>
              <select
                name="studentId"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.firstName} {child.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الموعد والتوقيت المقترح</label>
              <input
                name="meetingDate"
                type="datetime-local"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                سبب اللقاء أو نقاط الاستفسار الرئيسية
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="مثال: مناقشة تقدم الطفل في القراءة ومخارج الحروف، واقتراح وسائل تشجيعية منزلية..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl gradient-brand text-white font-bold text-sm shadow-md hover:opacity-95 transition-all"
            >
              إرسال طلب الموعد للمعلم
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
