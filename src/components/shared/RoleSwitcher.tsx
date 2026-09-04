"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCheck, ChevronUp, ChevronDown, Sparkles, GraduationCap, Users, BookOpen, Shield, Wrench, Video, Star, Gamepad2, Target, Mic, Printer, Compass, Layers, Building2 } from "lucide-react";
import { locales, type Locale } from "@/lib/localization";

export function RoleSwitcher() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  // Extract current locale
  let currentLocale: Locale = "ar";
  if (pathname) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      currentLocale = segments[0] as Locale;
    }
  }

  const isAr = currentLocale === "ar";

  if (process.env.NEXT_PUBLIC_HIDE_DEMO_SWITCHER === "true") {
    return null;
  }

  const personas = [
    {
      role: "STUDENT",
      name: isAr ? "الطالب: زيد طارق" : "Student: Zayd Tariq",
      desc: isAr ? "المستوى الثاني، 380 نقطة XP، شعلة حماس 5 أيام" : "Level 2, 380 XP, 5-day streak",
      path: `/${currentLocale}/student`,
      icon: <GraduationCap className="w-4 h-4 text-emerald-600" />,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      role: "PHONICS_ARCADE",
      name: isAr ? "ألعاب الحروف وتركيب الكلمات" : "Phonics & Word Builder Arcade",
      desc: isAr ? "أصوات الحركات، مختبر تركيب الكلمات، تحدي الذاكرة" : "Harakat soundboard, word scrambler & memory",
      path: `/${currentLocale}/student/activities`,
      icon: <Gamepad2 className="w-4 h-4 text-orange-600" />,
      badgeColor: "bg-orange-100 text-orange-800",
    },
    {
      role: "CLASSROOM",
      name: isAr ? "الفصل الافتراضي التفاعلي" : "Interactive Classroom",
      desc: isAr ? "سبورة الخط العربي، رفع اليد، وتفاعل مباشر" : "Calligraphy Whiteboard, hand raising & stars",
      path: `/${currentLocale}/classroom/session-1`,
      icon: <Video className="w-4 h-4 text-brand-600" />,
      badgeColor: "bg-brand-100 text-brand-800",
    },
    {
      role: "QURAN_STUDIO",
      name: isAr ? "استوديو التلاوة والتجويد" : "Quran & Tajweed Studio",
      desc: isAr ? "أحكام التجويد الملونة، استماع وتسجيل صوتي" : "Color-coded Tajweed, audio playback & recording",
      path: `/${currentLocale}/student/quran-studio`,
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      role: "AI_TUTOR",
      name: isAr ? "المرشد الذكي: فصيح" : "AI Tutor: Faseeh",
      desc: isAr ? "محادثة تفاعلية، تشكيل الحركات، +10 XP" : "Interactive Arabic practice + Harakat",
      path: `/${currentLocale}/student/ai-tutor`,
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      role: "ROADMAP",
      name: isAr ? "خريطة رحلة التعلم الكبرى" : "Learning Quest Map",
      desc: isAr ? "مسار المغامرة، النجوم، الصناديق" : "The Arabic Odyssey, 3-star nodes & chests",
      path: `/${currentLocale}/student/roadmap`,
      icon: <Compass className="w-4 h-4 text-amber-600" />,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      role: "FLASHCARDS",
      name: isAr ? "استوديو المفردات والتكرار المتباعد" : "SRS Vocabulary Flashcards",
      desc: isAr ? "عائلات الجذور، الجموع، والأضداد" : "Leitner algorithm, root families & plurals",
      path: `/${currentLocale}/student/flashcards`,
      icon: <Layers className="w-4 h-4 text-purple-600" />,
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      role: "STORIES",
      name: isAr ? "مكتبة القصص المصورة والقيم" : "Illustrated Storybook & Values",
      desc: isAr ? "قصص مشكولة، نطق الكلمات، +35 XP" : "Vocalized stories, click-to-pronounce, +35 XP",
      path: `/${currentLocale}/student/stories`,
      icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      role: "PRONUNCIATION",
      name: isAr ? "استوديو مخارج الحروف والمطابقة الصوتية" : "Voice Pronunciation & Waveform",
      desc: isAr ? "أصعب الحروف، مطابقة النغمة، +20 XP" : "Dual-waveform pitch matching, +20 XP",
      path: `/${currentLocale}/student/pronunciation`,
      icon: <Mic className="w-4 h-4 text-rose-600" />,
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      role: "PRINTABLES",
      name: isAr ? "كراسات ومطبوعات A4 المنزلية" : "Offline A4 Printables Hub",
      desc: isAr ? "تتبع خط النسخ، تلوين، رموز QR صوتية" : "Naskh tracing, Harakat coloring, audio QR codes",
      path: `/${currentLocale}/parent/printables`,
      icon: <Printer className="w-4 h-4 text-sky-600" />,
      badgeColor: "bg-sky-100 text-sky-800",
    },
    {
      role: "RECOMMENDATIONS",
      name: isAr ? "التوصيات الإرشادية لولي الأمر" : "Parent AI Recommendations",
      desc: isAr ? "رصد الفجوات، روتين منزلي، ومعايير CEFR" : "Actionable routines, competency gaps & CEFR",
      path: `/${currentLocale}/parent/recommendations`,
      icon: <Target className="w-4 h-4 text-indigo-600" />,
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
    {
      role: "PARENT_REVIEWS",
      name: isAr ? "تقييمات أولياء الأمور" : "Parent Reviews Portal",
      desc: isAr ? "تقييم المعلمين، شارة ولي أمر موثق" : "Verified parent reviews & rating metrics",
      path: `/${currentLocale}/parent/reviews`,
      icon: <Star className="w-4 h-4 text-amber-600" />,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      role: "PARENT",
      name: isAr ? "ولي الأمر: طارق المنصور" : "Parent: Tariq Al-Mansoor",
      desc: isAr ? "طفلان مسجلان، اشتراك VIP عائلي، فواتير" : "2 children, VIP subscription, invoices",
      path: `/${currentLocale}/parent/billing`,
      icon: <Users className="w-4 h-4 text-blue-600" />,
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      role: "TEACHER_GRADEBOOK",
      name: isAr ? "دفتر تقييم الحصص المباشرة" : "Teacher Live Gradebook",
      desc: isAr ? "سرعة القراءة WPM، نجوم التفاعل الصفي" : "Real-time WPM, makharij & parent alerts",
      path: `/${currentLocale}/teacher/gradebook`,
      icon: <GraduationCap className="w-4 h-4 text-teal-600" />,
      badgeColor: "bg-teal-100 text-teal-800",
    },
    {
      role: "TEACHER",
      name: isAr ? "المعلم: أستاذ أحمد حسن" : "Teacher: Ustadh Ahmed",
      desc: isAr ? "3 فصول حية، تحضير الدروس بالذكاء الاصطناعي" : "3 classes, grading, AI lesson planner",
      path: `/${currentLocale}/teacher`,
      icon: <BookOpen className="w-4 h-4 text-amber-600" />,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      role: "ADMIN",
      name: isAr ? "الإدارة الأكاديمية والعمليات" : "School & Operations Admin",
      desc: isAr ? "الحوكمة، التدقيق المشفر، صحة النظام، التصدير" : "Governance, Audit logs, Health, Export",
      path: `/${currentLocale}/admin`,
      icon: <Shield className="w-4 h-4 text-rose-600" />,
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      role: "SCHOOLS",
      name: isAr ? "بوابة المدارس الإسلامية (B2B)" : "Islamic Schools & B2B Hub",
      desc: isAr ? "إدارة التراخيص والمقاعد واستيراد القوائم" : "Multi-school cohort licenses & roster import",
      path: `/${currentLocale}/admin/schools`,
      icon: <Building2 className="w-4 h-4 text-indigo-600" />,
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
    {
      role: "INTEGRATIONS",
      name: isAr ? "منصة الربط الخارجي" : "Integrations Hub",
      desc: isAr ? "Zoom، Teams، Meet، WhatsApp، S3" : "Zoom, Teams, WhatsApp, Private S3",
      path: `/${currentLocale}/admin/integrations`,
      icon: <Wrench className="w-4 h-4 text-indigo-600" />,
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
  ];

  return (
    <div className="fixed bottom-4 start-4 z-50">
      {isExpanded && (
        <div className="mb-2 w-80 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-2xl p-3 animate-in slide-in-from-bottom-5 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold text-slate-800">
                {isAr ? "التبديل السريع بين الأدوار التجريبية" : "Quick Persona Switcher"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              title="Close"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pe-1">
            {personas.map((p) => {
              const isActive = pathname === p.path;
              return (
                <Link
                  key={p.role}
                  href={p.path}
                  onClick={() => setIsExpanded(false)}
                  className={`flex items-start gap-3 p-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-brand-50 border border-brand-200 text-brand-900"
                      : "hover:bg-slate-50 border border-transparent text-slate-700"
                  }`}
                >
                  <div className="p-2 bg-white rounded-lg shadow-xs border border-slate-100 shrink-0">
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{p.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-lg hover:shadow-xl transition-all border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500"
        title={isAr ? "تبديل الحساب التجريبي" : "Switch Demo Persona"}
      >
        <UserCheck className="w-4 h-4 text-emerald-400" />
        <span>{isAr ? "تبديل الدور التجريبي" : "Demo Personas"}</span>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
      </button>
    </div>
  );
}
