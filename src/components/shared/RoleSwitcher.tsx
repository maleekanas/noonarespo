"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCheck, ChevronUp, ChevronDown, Sparkles, GraduationCap, Users, BookOpen, Shield, Wrench, Video, Star, Gamepad2, Target, Mic, Printer, Compass, Layers, Building2 } from "lucide-react";
import { locales, type Locale, getDictionary } from "@/lib/localization";

// This dev-only demo persona switcher is hidden in production behind
// NEXT_PUBLIC_HIDE_DEMO_SWITCHER (see docs/DEPLOYMENT.md), but it's still
// used for staging/QA in every locale, so its labels are fully dictionary
// driven rather than the old Arabic/English-only ternary.
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

  const dict = getDictionary(currentLocale);
  const rs = dict.roleSwitcher;

  if (process.env.NEXT_PUBLIC_HIDE_DEMO_SWITCHER === "true") {
    return null;
  }

  const personas = [
    {
      role: "STUDENT",
      name: rs.studentName,
      desc: rs.studentDesc,
      path: `/${currentLocale}/student`,
      icon: <GraduationCap className="w-4 h-4 text-emerald-600" />,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      role: "PHONICS_ARCADE",
      name: rs.phonicsArcadeName,
      desc: rs.phonicsArcadeDesc,
      path: `/${currentLocale}/student/activities`,
      icon: <Gamepad2 className="w-4 h-4 text-orange-600" />,
      badgeColor: "bg-orange-100 text-orange-800",
    },
    {
      role: "CLASSROOM",
      name: rs.classroomName,
      desc: rs.classroomDesc,
      path: `/${currentLocale}/classroom/session-1`,
      icon: <Video className="w-4 h-4 text-brand-600" />,
      badgeColor: "bg-brand-100 text-brand-800",
    },
    {
      role: "QURAN_STUDIO",
      name: rs.quranStudioName,
      desc: rs.quranStudioDesc,
      path: `/${currentLocale}/student/quran-studio`,
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      role: "AI_TUTOR",
      name: rs.aiTutorName,
      desc: rs.aiTutorDesc,
      path: `/${currentLocale}/student/ai-tutor`,
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      role: "ROADMAP",
      name: rs.roadmapName,
      desc: rs.roadmapDesc,
      path: `/${currentLocale}/student/roadmap`,
      icon: <Compass className="w-4 h-4 text-amber-600" />,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      role: "FLASHCARDS",
      name: rs.flashcardsName,
      desc: rs.flashcardsDesc,
      path: `/${currentLocale}/student/flashcards`,
      icon: <Layers className="w-4 h-4 text-purple-600" />,
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      role: "STORIES",
      name: rs.storiesName,
      desc: rs.storiesDesc,
      path: `/${currentLocale}/student/stories`,
      icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      role: "PRONUNCIATION",
      name: rs.pronunciationName,
      desc: rs.pronunciationDesc,
      path: `/${currentLocale}/student/pronunciation`,
      icon: <Mic className="w-4 h-4 text-rose-600" />,
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      role: "PRINTABLES",
      name: rs.printablesName,
      desc: rs.printablesDesc,
      path: `/${currentLocale}/parent/printables`,
      icon: <Printer className="w-4 h-4 text-sky-600" />,
      badgeColor: "bg-sky-100 text-sky-800",
    },
    {
      role: "RECOMMENDATIONS",
      name: rs.recommendationsName,
      desc: rs.recommendationsDesc,
      path: `/${currentLocale}/parent/recommendations`,
      icon: <Target className="w-4 h-4 text-indigo-600" />,
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
    {
      role: "PARENT_REVIEWS",
      name: rs.parentReviewsName,
      desc: rs.parentReviewsDesc,
      path: `/${currentLocale}/parent/reviews`,
      icon: <Star className="w-4 h-4 text-amber-600" />,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      role: "PARENT",
      name: rs.parentName,
      desc: rs.parentDesc,
      path: `/${currentLocale}/parent/billing`,
      icon: <Users className="w-4 h-4 text-blue-600" />,
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      role: "TEACHER_GRADEBOOK",
      name: rs.teacherGradebookName,
      desc: rs.teacherGradebookDesc,
      path: `/${currentLocale}/teacher/gradebook`,
      icon: <GraduationCap className="w-4 h-4 text-teal-600" />,
      badgeColor: "bg-teal-100 text-teal-800",
    },
    {
      role: "TEACHER",
      name: rs.teacherName,
      desc: rs.teacherDesc,
      path: `/${currentLocale}/teacher`,
      icon: <BookOpen className="w-4 h-4 text-amber-600" />,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      role: "ADMIN",
      name: rs.adminName,
      desc: rs.adminDesc,
      path: `/${currentLocale}/admin`,
      icon: <Shield className="w-4 h-4 text-rose-600" />,
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      role: "SCHOOLS",
      name: rs.schoolsName,
      desc: rs.schoolsDesc,
      path: `/${currentLocale}/admin/schools`,
      icon: <Building2 className="w-4 h-4 text-indigo-600" />,
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
    {
      role: "SCHOOL_ADMIN",
      name: currentLocale === "ar" ? "مدير مدرسة / مؤسسة شريكة" : "School / Institutional Admin",
      desc: currentLocale === "ar" ? "إدارة القوائم، الفصول وتقارير الحضور" : "Roster, Classes & Attendance Reports",
      path: `/${currentLocale}/school-admin`,
      icon: <Building2 className="w-4 h-4 text-purple-600" />,
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      role: "INTEGRATIONS",
      name: rs.integrationsName,
      desc: rs.integrationsDesc,
      path: `/${currentLocale}/admin/integrations`,
      icon: <Wrench className="w-4 h-4 text-indigo-600" />,
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
    {
      role: "SUPPORT_AGENT",
      name: currentLocale === "ar" ? "وكيل الدعم الفني" : "Support Agent",
      desc: currentLocale === "ar" ? "تشخيص الحسابات والاستفسارات" : "Diagnostics & Admissions Inbox",
      path: `/${currentLocale}/support`,
      icon: <Shield className="w-4 h-4 text-cyan-600" />,
      badgeColor: "bg-cyan-100 text-cyan-800",
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
                {rs.panelHeading}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              title={rs.closeTooltip}
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
        title={rs.toggleTooltip}
      >
        <UserCheck className="w-4 h-4 text-emerald-400" />
        <span>{rs.toggleLabel}</span>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
      </button>
    </div>
  );
}
