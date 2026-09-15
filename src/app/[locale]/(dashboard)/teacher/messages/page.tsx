import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { communicationRepository } from "@/server/repositories/CommunicationRepository";
import { communicationService } from "@/server/services/CommunicationService";
import { userRepository } from "@/server/repositories/UserRepository";

import { requireTeacherProfile } from "@/lib/auth/currentUser";
import {
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";

export default async function TeacherMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ conversationId?: string }>;
}) {
  const { locale } = await params;
  const { conversationId } = await searchParams;
  const { profile } = await requireTeacherProfile(locale);
  const teacherId = profile.id;


  // Resolve the real parents/students actually messaging this teacher,
  // instead of a single hardcoded "parent-1"/"student-1" conversation that
  // every teacher used to see regardless of who their real students are.
  const conversations = (
    await communicationRepository.getConversationsByTeacherId(teacherId)
  ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const activeConversation =
    conversations.find((c) => c.id === conversationId) || conversations[0];

  const conversationParties = await Promise.all(
    conversations.map(async (c) => {
      const parent = await userRepository.findParentProfileById(c.parentId);
      const student = await userRepository.findStudentProfileById(c.studentId);
      return {
        conversation: c,
        parentName: parent ? `${parent.firstName} ${parent.lastName}` : "ولي أمر",
        studentName: student ? `${student.firstName} ${student.lastName}` : "الطالب",
      };
    })
  );

  const active = conversationParties.find((p) => p.conversation.id === activeConversation?.id);

  const messages = activeConversation
    ? await communicationRepository.getMessages(activeConversation.id)
    : [];

  async function handleTeacherReply(formData: FormData) {
    "use server";
    if (!activeConversation) return;
    const content = formData.get("content")?.toString();
    if (!content || !content.trim()) return;

    await communicationService.sendMessage({
      parentId: activeConversation.parentId,
      teacherId,
      studentId: activeConversation.studentId,
      senderId: teacherId,
      senderRole: "TEACHER",
      content: content.trim(),
    });

    revalidatePath(`/${locale}/teacher/messages`);
    revalidatePath(`/${locale}/parent/messages`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <Link href={`/${locale}/teacher`} className="hover:underline">
              بوابة المعلم
            </Link>
            <span>/</span>
            <span>الرسائل والاستشارات</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            صندوق رسائل أولياء الأمور 💬
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {active
              ? `محادثة مباشرة مع ولي أمر الطالب: ${active.studentName} (${active.parentName})`
              : "لا توجد محادثات بعد مع أولياء الأمور"}
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>تواصل مهني موثق</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Conversation Switcher */}
        {conversationParties.length > 1 && (
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            <div className="p-3 flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50/60">
              <Users className="w-3.5 h-3.5" />
              <span>محادثاتك ({conversationParties.length})</span>
            </div>
            {conversationParties.map((p) => (
              <Link
                key={p.conversation.id}
                href={`/${locale}/teacher/messages?conversationId=${p.conversation.id}`}
                className={`block p-3 text-xs hover:bg-slate-50 transition-colors ${
                  p.conversation.id === activeConversation?.id ? "bg-emerald-50/60" : ""
                }`}
              >
                <span className="font-bold text-slate-800 block">{p.parentName}</span>
                <span className="text-slate-400">ولي أمر {p.studentName}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Chat Thread Box */}
        <div
          className={`${
            conversationParties.length > 1 ? "lg:col-span-3" : "lg:col-span-4"
          } bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]`}
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center">
              {active ? active.parentName.charAt(0) : "؟"}
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block">
                {active ? `${active.parentName} (ولي أمر ${active.studentName})` : "لا توجد محادثة نشطة"}
              </span>
              <span className="text-[11px] text-slate-500">حساب موثق • مسجل في باقة الفصول الجماعية</span>
            </div>
          </div>

          {/* Message Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            {messages.map((msg) => {
              const isTeacher = msg.senderRole === "TEACHER";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isTeacher ? "items-start" : "items-end"}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-600">
                      {isTeacher ? "أنت (المعلم)" : `ولي الأمر (${active?.parentName ?? ""})`}
                    </span>
                    <span>•</span>
                    <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl max-w-lg text-sm leading-relaxed shadow-sm ${
                      isTeacher
                        ? "bg-emerald-600 text-white rounded-tr-none rtl:rounded-tr-2xl rtl:rounded-tl-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none rtl:rounded-tl-2xl rtl:rounded-tr-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Input Form */}
          <form action={handleTeacherReply} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <input
              name="content"
              required
              disabled={!activeConversation}
              placeholder="اكتب ردك وتوجيهاتك التربوية لولي الأمر هنا..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
            />

            <button
              type="submit"
              disabled={!activeConversation}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>إرسال الرد</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
