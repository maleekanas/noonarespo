import React from "react";
import Link from "next/link";
import { requireSupportAgentSession } from "@/lib/auth/currentUser";
import { crmService } from "@/server/services/CrmService";
import { userRepository } from "@/server/repositories/UserRepository";
import { schedulingRepository } from "@/server/repositories/SchedulingRepository";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import {
  LifeBuoy,
  Search,
  Users,
  ShieldCheck,
  Video,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default async function SupportAgentDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const isRtl = isRtlLocale(locale);
  const session = await requireSupportAgentSession(locale);

  // Diagnostic data
  const [allStudents, allTeachers, leads, sessions] = await Promise.all([
    userRepository.getAllStudents(),
    userRepository.getAllTeachers(),
    Promise.resolve(crmService.getAllLeads()),
    schedulingRepository.getSessionsByDateRange(
      new Date(Date.now() - 86400000 * 7),
      new Date(Date.now() + 86400000 * 7)
    ),
  ]);

  const query = (q || "").trim().toLowerCase();

  const filteredStudents = query
    ? allStudents.filter(
        (s) =>
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query) ||
          s.user.email.toLowerCase().includes(query)
      )
    : allStudents.slice(0, 5);

  const filteredTeachers = query
    ? allTeachers.filter(
        (t) =>
          t.firstName.toLowerCase().includes(query) ||
          t.lastName.toLowerCase().includes(query) ||
          t.user.email.toLowerCase().includes(query)
      )
    : allTeachers.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Agent Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isRtl ? "لوحة وكيل الدعم الفني والأكاديمي" : "Support & Operations Console"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isRtl ? "تشخيص الحسابات والدعم الفني" : "Customer Support & Diagnostic Hub"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {isRtl
              ? `وكيل الدعم النشط: ${session.email} • الصلاحيات: فحص الحسابات، تشخيص الجلسات، واستفسارات التسجيل.`
              : `Active Agent: ${session.email} • Diagnostic scope: Account lookups, session checks, and inquiries.`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right rtl:text-left bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700">
            <div className="text-xs text-slate-400">{isRtl ? "استفسارات جديدة" : "Open Inquiries"}</div>
            <div className="text-xl font-black text-brand-400">{leads.length}</div>
          </div>
          <div className="text-right rtl:text-left bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700">
            <div className="text-xs text-slate-400">{isRtl ? "الجلسات المجدولة" : "Active Sessions"}</div>
            <div className="text-xl font-black text-emerald-400">{sessions.length}</div>
          </div>
        </div>
      </div>

      {/* Diagnostic Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          {isRtl ? "البحث التشخيصي عن المستخدمين (طلاب، أولياء أمور، معلمين)" : "User Diagnostic Lookup"}
        </h2>
        <form method="GET" className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 rtl:left-auto rtl:right-4 top-3.5" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder={
                isRtl
                  ? "ابحث بالاسم أو البريد الإلكتروني..."
                  : "Search by student/teacher name, email, or account ID..."
              }
              className="w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 gradient-brand text-white font-bold text-sm rounded-xl hover:opacity-95 transition-all"
          >
            {isRtl ? "بحث" : "Lookup"}
          </button>
        </form>
      </div>

      {/* User Search Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">
                {isRtl ? "ملفات الطلاب" : "Student Profiles"}
              </h3>
            </div>
            <span className="text-xs text-slate-400">{filteredStudents.length} matching</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {isRtl ? "لا توجد نتائج مطابقة" : "No student records found"}
              </div>
            ) : (
              filteredStudents.map((s) => (
                <div key={s.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {s.firstName} {s.lastName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{s.user.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {s.ageGroup}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {s.user.status}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/admin/students`}
                    className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-900 text-base">
                {isRtl ? "ملفات المعلمين المعتمدين" : "Certified Teachers"}
              </h3>
            </div>
            <span className="text-xs text-slate-400">{filteredTeachers.length} matching</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTeachers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {isRtl ? "لا توجد نتائج مطابقة" : "No teacher records found"}
              </div>
            ) : (
              filteredTeachers.map((t) => (
                <div key={t.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {t.firstName} {t.lastName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{t.user.email}</div>
                    <div className="text-xs text-brand-600 font-medium mt-0.5">
                      {t.languagesSpoken || "Arabic"} • {t.experienceYears} yrs exp
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/admin/teachers`}
                    className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Inquiries & CRM Leads Inbox */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              {isRtl ? "صندوق استفسارات أولياء الأمور وطلبات التسجيل" : "Parent Inquiries & Admissions Inbox"}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {leads.length} {isRtl ? "استفسارات" : "inquiries"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">{isRtl ? "الاسم" : "Contact Name"}</th>
                <th className="px-6 py-4">{isRtl ? "البريد / الهاتف" : "Email & Phone"}</th>
                <th className="px-6 py-4">{isRtl ? "نوع الطلب" : "Inquiry Type"}</th>
                <th className="px-6 py-4">{isRtl ? "المصدر" : "Source"}</th>
                <th className="px-6 py-4">{isRtl ? "التاريخ" : "Received At"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((l, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{l.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800">{l.email}</div>
                    {l.phone && <div className="text-xs text-slate-400 font-mono">{l.phone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                      {l.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{l.source}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Session Diagnostics */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              {isRtl ? "تشخيص الجلسات المباشرة وروابط الغرف" : "Live Session & Meeting Diagnostics"}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {sessions.length} {isRtl ? "جلسات" : "sessions"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">{isRtl ? "معرف الجلسة" : "Session ID"}</th>
                <th className="px-6 py-4">{isRtl ? "المجموعة" : "Class Group"}</th>
                <th className="px-6 py-4">{isRtl ? "الحالة" : "Status"}</th>
                <th className="px-6 py-4">{isRtl ? "رابط الغرفة" : "Meeting Link"}</th>
                <th className="px-6 py-4">{isRtl ? "الوقت (UTC)" : "Scheduled Time"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{sess.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{sess.classGroup?.name || "Class"}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800">
                      {sess.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {sess.meetingUrl ? (
                      <a
                        href={sess.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>{sess.meetingUrl.slice(0, 30)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Internal Classroom</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(sess.startTimeUtc).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
