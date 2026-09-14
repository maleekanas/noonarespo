import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { communicationRepository } from "@/server/repositories/CommunicationRepository";
import { communicationService } from "@/server/services/CommunicationService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
  Send,
  ShieldCheck,
} from "lucide-react";

export default async function ParentMessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;
  const teacherId = "teacher-1";
  const studentId = "student-1";

  const conv = await communicationRepository.getOrCreateConversation(parentId, teacherId, studentId);
  const messages = await communicationRepository.getMessages(conv.id);

  async function handleSendMessage(formData: FormData) {
    "use server";
    const content = formData.get("content")?.toString();
    if (!content || !content.trim()) return;

    await communicationService.sendMessage({
      parentId,
      teacherId,
      studentId,
      senderId: parentId,
      senderRole: "PARENT",
      content: content.trim(),
    });

    revalidatePath(`/${locale}/parent/messages`);
    revalidatePath(`/${locale}/teacher/messages`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent`} className="hover:underline">
              لوحة ولي الأمر
            </Link>
            <span>/</span>
            <span>المحادثات المباشرة</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            التواصل المباشر مع المعلم 💬
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            محادثة آمنة وموثقة مع الأستاذ: أحمد المنصوري (معلم القراءة والتجويد)
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>محادثة مشفرة ومراقبة تربوياً</span>
        </div>
      </div>

      {/* Chat Thread Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
          <div className="w-10 h-10 rounded-2xl gradient-brand text-white font-bold flex items-center justify-center">
            أ
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm block">الأستاذ أحمد المنصوري</span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>متاح للرد والاستشارات التربوية</span>
            </span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
          {messages.map((msg) => {
            const isParent = msg.senderRole === "PARENT";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isParent ? "items-start" : "items-end"}`}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-600">
                    {isParent ? "أنت (ولي الأمر)" : "الأستاذ أحمد المنصوري"}
                  </span>
                  <span>•</span>
                  <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-lg text-sm leading-relaxed shadow-sm ${
                    isParent
                      ? "bg-brand-600 text-white rounded-tr-none rtl:rounded-tr-2xl rtl:rounded-tl-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none rtl:rounded-tl-2xl rtl:rounded-tr-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Send Input Form */}
        <form action={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
          <input
            name="content"
            required
            placeholder="اكتب رسالتك أو استفسارك التربوي هنا للمعلم..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <button
            type="submit"
            className="px-6 py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center gap-2"
          >
            <span>إرسال</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
