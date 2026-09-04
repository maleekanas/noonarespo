import React from "react";
import Link from "next/link";
import {
  Video,
  Mic,
  MicOff,
  Hand,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
} from "lucide-react";
import { InteractiveWhiteboard } from "@/components/classroom/InteractiveWhiteboard";

export default async function VirtualClassroomPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === "ar";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Classroom Bar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/student`}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
            <span>{isAr ? "مغادرة الفصل" : "Exit Classroom"}</span>
          </Link>

          <div className="h-4 w-px bg-slate-700" />

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-bold text-sm sm:text-base text-white">
                {isAr ? "حصة القراءة والطلاقة (المستوى A1) - فصل البراعم" : "Reading & Fluency (A1) - Live Studio"}
              </h1>
            </div>
            <div className="text-[11px] text-slate-400">
              {isAr ? `معرف الجلسة: ${id} | المعلم: أ. أحمد حسن` : `Session: ${id} | Teacher: Ustadh Ahmed`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Class Timer */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            <span>32:15 / 45:00</span>
          </div>

          {/* Child Safety Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950/80 text-blue-300 border border-blue-800 rounded-lg text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">{isAr ? "فصل آمن وخاضع للإشراف" : "COPPA Supervised"}</span>
          </span>
        </div>
      </header>

      {/* Main Classroom Layout */}
      <div className="flex-1 p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto w-full">
        {/* Stage Area: Interactive Whiteboard */}
        <div className="lg:col-span-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[10px]">
                {isAr ? "السبورة الرقمية التفاعلية" : "Interactive Whiteboard"}
              </span>
              <span>{isAr ? "كتابة الحروف وتمرين الخط" : "Calligraphy & Lesson Canvas"}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">
                {isAr ? "المعلم يشارك الشاشة الآن" : "Teacher is actively presenting"}
              </span>
            </div>
          </div>

          {/* Whiteboard Component */}
          <div className="flex-1">
            <InteractiveWhiteboard locale={locale} />
          </div>

          {/* Bottom Student Action Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Hand className="w-4 h-4" />
                <span>{isAr ? "رفع اليد للمشاركة ✋" : "Raise Hand ✋"}</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? "طلب التحدث" : "Unmute Request"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">{isAr ? "تفاعل سريع:" : "Quick Reactions:"}</span>
              {["🎉 ممتاز", "❤️ أحسنت", "👏 تصفيق", "🌟 رائع"].map((reaction) => (
                <button
                  key={reaction}
                  type="button"
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 text-xs transition-colors"
                >
                  {reaction}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Participants & Live Chat */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          {/* Video Frames: Teacher Spotlight */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-indigo-400" />
                {isAr ? "المعلم (المقدم)" : "Teacher Spotlight"}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            {/* Video Placeholder Box */}
            <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700 flex flex-col items-center justify-center text-center p-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-xl mb-1">
                👨‍🏫
              </div>
              <div className="text-xs font-bold text-white">أ. أحمد حسن</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <Mic className="w-2.5 h-2.5" />
                <span>{isAr ? "يتحدث الآن..." : "Speaking..."}</span>
              </div>
            </div>
          </div>

          {/* Student Cohort Tiles */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                {isAr ? "الطلاب المتواجدون (4)" : "Classmates (4)"}
              </span>
              <span className="text-[10px] text-slate-500">حلقة تفاعلية</span>
            </div>

            <div className="space-y-2">
              {[
                { name: isAr ? "زيد طارق (أنت)" : "Zayd (You)", isSelf: true, hand: false, mic: false },
                { name: isAr ? "مريم طارق" : "Maryam T.", isSelf: false, hand: true, mic: false },
                { name: isAr ? "يوسف العمري" : "Yousef O.", isSelf: false, hand: false, mic: false },
                { name: isAr ? "سارة فهد" : "Sarah F.", isSelf: false, hand: false, mic: false },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <span className={s.isSelf ? "font-bold text-brand-400" : "text-slate-300"}>
                      {s.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {s.hand && (
                      <span className="text-xs" title="Hand Raised">
                        ✋
                      </span>
                    )}
                    {s.mic ? (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Special Tool: Award XP Star */}
          <div className="bg-gradient-to-br from-purple-950 to-indigo-950 border border-purple-800/80 rounded-2xl p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{isAr ? "تحفيز المشاركة الفورية" : "Participation Reward"}</span>
            </div>
            <p className="text-[11px] text-purple-200">
              {isAr
                ? "يمنح المعلم نجمة تشجيعية فورية (+15 XP) للطلاب المتميزين في التفاعل الصوتي والكتابة."
                : "Teacher awards instant +15 XP star for active class participation and penmanship."}
            </p>
            <button
              type="button"
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? "منح نجمة التميز (+15 XP)" : "Award Participation Star (+15 XP)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
