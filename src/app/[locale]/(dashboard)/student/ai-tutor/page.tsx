import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { aiService } from "@/server/services/AiService";
import {
  Sparkles,
  Bot,
  Send,
  Award,
  Volume2,
  Lightbulb,
} from "lucide-react";

export default async function StudentAiTutorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const studentId = "student-1"; // Zayd Tariq

  const history = aiService.getSessionHistory(studentId);
  const aiStatus = aiService.getAiStatus();

  async function handleSendMessage(formData: FormData) {
    "use server";
    const message = formData.get("message")?.toString()?.trim();
    if (!message) return;

    await aiService.sendStudentMessage({
      studentId,
      message,
    });

    revalidatePath(`/${locale}/student/ai-tutor`);
    revalidatePath(`/${locale}/student`);
  }

  const suggestionTopics = [
    "مرحبا يا فصيح! 👋",
    "حدثني عن حيوان الأسد 🦁",
    "كيف أقرأ سورة الإخلاص؟ 📖",
    "ما هي فصول السنة الأربعة؟ 🌸",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">
                المحادثة مع فصيح 🤖
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                متصل وجاهز للحديث ✓
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              صديقك الذكي لممارسة التحدث بالفصحى، ضبط الحركات، وتصحيح مخارج الحروف
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>اكسب 10+ XP مع كل محادثة</span>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="font-bold text-slate-400 whitespace-nowrap">جرّب أن تسأل:</span>
        {suggestionTopics.map((topic, i) => (
          <form key={i} action={handleSendMessage} className="shrink-0">
            <input type="hidden" name="message" value={topic} />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 font-medium text-slate-700 transition-colors shadow-sm"
            >
              {topic}
            </button>
          </form>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 min-h-[420px] max-h-[560px] overflow-y-auto">
        {history.map((msg, idx) => {
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                isAssistant ? "justify-start" : "justify-end"
              }`}
            >
              {isAssistant && (
                <div className="w-10 h-10 rounded-2xl gradient-brand text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-xl p-5 rounded-3xl space-y-3 ${
                  isAssistant
                    ? "bg-slate-50 border border-slate-200 text-slate-900 rounded-tr-sm"
                    : "gradient-brand text-white rounded-tl-sm shadow-md shadow-brand-500/10"
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.content}
                </div>

                {/* Harakat Highlight */}
                {msg.harakatHighlighted && (
                  <div className="p-3 rounded-2xl bg-white/90 border border-brand-100 text-xs text-brand-900 space-y-1">
                    <span className="font-bold text-brand-700 block flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>الضبط بالشكل والحركات:</span>
                    </span>
                    <p className="font-bold text-base leading-relaxed text-slate-900">
                      {msg.harakatHighlighted}
                    </p>
                  </div>
                )}

                {/* Pronunciation Tip Box */}
                {msg.pronunciationTip && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{msg.pronunciationTip}</span>
                  </div>
                )}

                {/* XP Reward Badge */}
                {msg.encouragementXp && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تمت إضافة +{msg.encouragementXp} XP إلى رصيدك!</span>
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center shrink-0 mt-1">
                  ز
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Form */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <form action={handleSendMessage} className="flex items-center gap-3">
          <input
            name="message"
            type="text"
            required
            placeholder="اكتب رسالتك بالعربية وتحدث مع فصيح..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50/50"
          />

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl gradient-brand text-white font-bold text-sm shadow-md shadow-brand-500/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>إرسال</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="pt-2 px-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>{aiStatus.engineName}</span>
          <Link href={`/${locale}/student`} className="hover:underline text-brand-600 font-bold">
            العودة لبوابة الطالب ←
          </Link>
        </div>
      </div>
    </div>
  );
}
