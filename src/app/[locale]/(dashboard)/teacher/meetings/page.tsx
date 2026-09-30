import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { communicationRepository } from "@/server/repositories/CommunicationRepository";
import { communicationService } from "@/server/services/CommunicationService";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { schedulingRepository } from "@/server/repositories/SchedulingRepository";
import { schedulingService } from "@/server/services/SchedulingService";
import { meetingManager } from "@/lib/integrations/meetings/MeetingManager";
import { EmailAdapter } from "@/lib/integrations/notifications/EmailAdapter";
import type { MeetingPlatform } from "@/lib/integrations/meetings/types";
import { requireTeacherProfile } from "@/lib/auth/currentUser";
import {
  Calendar,
  Clock,
  Video,
} from "lucide-react";

export default async function TeacherMeetingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { profile } = await requireTeacherProfile(locale);
  const teacherId = profile.id;
  const [meetings, teacherSessions, classGroups, platformStatuses] = await Promise.all([
    communicationRepository.getMeetingRequestsByTeacherId(teacherId),
    schedulingRepository.getSessionsByTeacherId(teacherId),
    academicRepository.getAllClassGroups(),
    Promise.resolve(meetingManager.getPlatformStatuses()),
  ]);
  const teacherClassGroups = (await Promise.all(
    classGroups.map(async (group) => {
      const assignments = await academicRepository.getTeacherAssignmentsByClassGroupId(group.id);
      return assignments.some((assignment) => assignment.teacherId === teacherId) ? group : null;
    })
  )).filter((group): group is NonNullable<typeof group> => Boolean(group));

  async function handleScheduleClass(formData: FormData) {
    "use server";
    const teacher = await requireTeacherProfile(locale);
    const classGroupId = formData.get("classGroupId")?.toString();
    const platform = formData.get("platform")?.toString() as MeetingPlatform;
    const startTime = formData.get("startTime")?.toString();
    const durationMinutes = Number(formData.get("durationMinutes"));
    const invitees = formData.get("invitees")?.toString() || "";
    if (!classGroupId || !startTime || !Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 240) return;

    const session = await schedulingService.scheduleSession({
      classGroupId,
      teacherId: teacher.profile.id,
      startTimeUtc: new Date(startTime),
      durationMinutes,
      platform: ["ZOOM", "TEAMS", "MEET", "WEBEX"].includes(platform) ? platform : "ZOOM",
    });
    const classGroup = await academicRepository.getClassGroupById(classGroupId);
    const recipients = invitees.split(",").map((email) => email.trim()).filter((email) => /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email));
    const emailAdapter = new EmailAdapter();
    await Promise.all(recipients.map((recipient) => emailAdapter.send({
      recipientContact: recipient,
      recipientName: "Student / Parent",
      eventName: "CLASS_STARTING_SOON",
      titleAr: `دعوة حصة مباشرة: ${classGroup?.name || "حصة تعليمية"}`,
      bodyAr: `تمت دعوتك إلى حصة مباشرة بتاريخ ${new Date(startTime).toLocaleString("ar-SA")}. استخدم الرابط للانضمام: ${session.meetingUrl}`,
      actionUrl: session.meetingUrl || undefined,
    })));
    revalidatePath(`/${locale}/teacher/meetings`);
    revalidatePath(`/${locale}/teacher`);
  }

  async function handleConfirmMeeting(formData: FormData) {
    "use server";
    const meetingId = formData.get("meetingId")?.toString();
    if (!meetingId) return;

    await communicationService.confirmMeeting(meetingId);
    revalidatePath(`/${locale}/teacher/meetings`);
    revalidatePath(`/${locale}/parent/meetings`);
  }

  async function handleDeclineMeeting(formData: FormData) {
    "use server";
    const meetingId = formData.get("meetingId")?.toString();
    const reason = formData.get("reason")?.toString() || "تعذر الموعد، يرجى اختيار توقيت آخر";
    if (!meetingId) return;

    await communicationService.cancelMeeting(meetingId, reason);
    revalidatePath(`/${locale}/teacher/meetings`);
    revalidatePath(`/${locale}/parent/meetings`);
  }

  async function handleRescheduleMeeting(formData: FormData) {
    "use server";
    const meetingId = formData.get("meetingId")?.toString();
    const newDateStr = formData.get("newMeetingDate")?.toString();
    if (!meetingId || !newDateStr) return;

    await communicationService.rescheduleMeeting(meetingId, new Date(newDateStr));
    revalidatePath(`/${locale}/teacher/meetings`);
    revalidatePath(`/${locale}/parent/meetings`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <Link href={`/${locale}/teacher`} className="hover:underline">
              بوابة المعلم
            </Link>
            <span>/</span>
            <span>استشارات أولياء الأمور</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            مواعيد اللقاءات الفردية مع أولياء الأمور 🤝
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة طلبات المقابلات الفردية (15 دقيقة) وتأكيد الغرف الافتراضية
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>مدة المقابلة: 15 دقيقة</span>
        </div>
      </div>

      <section className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-6" aria-labelledby="schedule-class-heading">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-extrabold text-cyan-300">Live class operations</p>
            <h2 id="schedule-class-heading" className="text-xl font-extrabold mt-1">إنشاء وجدولة حصة مباشرة</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">اختر فصلك، منصة الفيديو، الموعد، ثم أرسل الدعوة إلى الفصل بالكامل أو إلى طلاب محددين. افصل عناوين البريد بفاصلة.</p>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300"><span className="w-2 h-2 rounded-full bg-emerald-400" />{platformStatuses.filter((status) => status.isConfigured).length} منصات متصلة</span>
        </div>
        <form action={handleScheduleClass} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
          <label className="space-y-1.5 text-xs font-bold text-slate-200">الفصل الدراسي
            <select name="classGroupId" required className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white text-xs">
              <option value="">اختر الفصل</option>
              {teacherClassGroups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-bold text-slate-200">منصة الفيديو
            <select name="platform" required defaultValue="ZOOM" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white text-xs">
              {platformStatuses.map((status) => <option key={status.platform} value={status.platform}>{status.nameEn}{status.isConfigured ? " · Connected" : " · Gateway"}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-bold text-slate-200">الموعد
            <input name="startTime" type="datetime-local" required className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white text-xs" />
          </label>
          <label className="space-y-1.5 text-xs font-bold text-slate-200">المدة
            <select name="durationMinutes" defaultValue="45" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white text-xs"><option value="30">30 دقيقة</option><option value="45">45 دقيقة</option><option value="60">60 دقيقة</option><option value="90">90 دقيقة</option><option value="120">120 دقيقة</option></select>
          </label>
          <button type="submit" className="rounded-xl bg-cyan-400 px-4 py-3 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 transition-colors">إنشاء وإرسال الدعوات</button>
          <label className="md:col-span-2 xl:col-span-5 space-y-1.5 text-xs font-bold text-slate-200">دعوات مخصصة (اختياري)
            <input name="invitees" type="text" placeholder="student@example.com, parent@example.com" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white placeholder:text-slate-500 text-xs" />
            <span className="block text-[11px] font-normal text-slate-400">لإرسال دعوة إلى الفصل بالكامل، استخدم قائمة بريد الفصل من نظام المؤسسة أو أضف العناوين هنا.</span>
          </label>
        </form>
      </section>

      <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4" aria-labelledby="upcoming-classes-heading">
        <div className="flex items-center justify-between gap-3"><h2 id="upcoming-classes-heading" className="text-lg font-extrabold text-slate-900">حصصي المباشرة القادمة ({teacherSessions.length})</h2><span className="text-xs text-slate-500">روابط الطلاب والمقدمين مفعلة</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teacherSessions.slice(0, 6).map((session) => <div key={session.id} className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3"><div><p className="text-xs font-extrabold text-slate-900">{session.classGroupId}</p><p className="text-[11px] text-slate-500">{new Date(session.startTimeUtc).toLocaleString("ar-SA")} · {Math.round((session.endTimeUtc.getTime() - session.startTimeUtc.getTime()) / 60000)} دقيقة</p></div>{session.meetingUrl && <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="shrink-0 rounded-lg bg-brand-50 px-3 py-2 text-[11px] font-bold text-brand-700 hover:bg-brand-100">فتح الرابط</a>}</div>)}
        </div>
      </section>

      {/* Meetings List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span>طلبات المقابلات الواردة ({meetings.length})</span>
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
                    {meeting.status === "CONFIRMED" ? "مؤكد وجاهز" : "بانتظار تأكيدك"}
                  </span>
                  <span className="text-xs text-slate-500">
                    طلب من: ولي أمر الطالب (زيد طارق)
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

              <div className="flex flex-col sm:items-end gap-2">
                {meeting.status === "CONFIRMED" && meeting.meetingUrl ? (
                  <a
                    href={meeting.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>دخول الغرفة الافتراضية (كمقدم)</span>
                  </a>
                ) : (
                  <form action={handleConfirmMeeting}>
                    <input type="hidden" name="meetingId" value={meeting.id} />
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
                    >
                      تأكيد الموعد وتوليد رابط الغرفة ✓
                    </button>
                  </form>
                )}

                {/* Reschedule & Decline Controls */}
                <div className="flex items-center gap-3 text-xs pt-1">
                  <details className="group">
                    <summary className="cursor-pointer text-slate-500 hover:text-brand-600 font-bold select-none text-[11px]">
                      اقتراح موعد بديل ↻
                    </summary>
                    <form action={handleRescheduleMeeting} className="p-3 bg-slate-50 rounded-xl space-y-2 mt-2 border border-slate-100 text-xs">
                      <input type="hidden" name="meetingId" value={meeting.id} />
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">الموعد البديل المقترح</label>
                        <input
                          name="newMeetingDate"
                          type="datetime-local"
                          required
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                      >
                        إرسال الموعد المقترح
                      </button>
                    </form>
                  </details>

                  <form action={handleDeclineMeeting}>
                    <input type="hidden" name="meetingId" value={meeting.id} />
                    <button
                      type="submit"
                      className="text-slate-400 hover:text-rose-600 font-bold transition-colors text-[11px]"
                      title="الاعتذار عن الموعد"
                    >
                      اعتذار عن الموعد ✕
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
