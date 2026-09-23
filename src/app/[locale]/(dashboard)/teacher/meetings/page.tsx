import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { communicationRepository } from "@/server/repositories/CommunicationRepository";
import { communicationService } from "@/server/services/CommunicationService";
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
  const meetings = await communicationRepository.getMeetingRequestsByTeacherId(teacherId);

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
