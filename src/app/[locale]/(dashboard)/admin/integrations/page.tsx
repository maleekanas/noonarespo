import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { meetingManager } from "@/lib/integrations/meetings/MeetingManager";
import { notificationDispatcherService } from "@/server/services/NotificationDispatcherService";
import { storageService } from "@/server/services/StorageService";
import { aiService } from "@/server/services/AiService";
import { NotificationChannel } from "@/lib/integrations/notifications/types";
import { requireAdminSession } from "@/lib/auth/currentUser";
import { getClientIp } from "@/lib/security/rateLimit";
import { userRepository } from "@/server/repositories/UserRepository";
import { administrationRepository } from "@/server/repositories/AdministrationRepository";
import {
  Video,
  MessageSquare,
  HardDrive,
  Bot,
  CheckCircle2,
  Play,
  Send,
  Zap,
  Megaphone,
} from "lucide-react";

export default async function AdminIntegrationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ broadcastSent?: string; broadcastFailed?: string }>;
}) {
  const { locale } = await params;
  const { broadcastSent, broadcastFailed } = await searchParams;
  await requireAdminSession(locale);

  const meetingPlatforms = meetingManager.getPlatformStatuses();
  const notificationChannels = notificationDispatcherService.getChannelStatuses();
  const storageStatus = storageService.getStorageStatus();
  const aiStatus = aiService.getAiStatus();
  const dispatchHistory = notificationDispatcherService.getDispatchHistory(6);
  const activeParentCount = (await userRepository.getAllParentsWithContact()).length;

  async function handleTestDispatch(formData: FormData) {
    "use server";
    await requireAdminSession(locale);
    const channel = (formData.get("channel")?.toString() || "WHATSAPP") as NotificationChannel;
    const recipient = formData.get("recipient")?.toString() || "+966501234567";

    await notificationDispatcherService.dispatch(channel, {
      recipientContact: recipient,
      recipientName: "ولي أمر تجريبي",
      eventName: "CLASS_STARTING_SOON",
      titleAr: "اختبار إرسال الإشعار اللحظي",
      bodyAr: "تم إرسال هذا الإشعار التجريبي بنجاح عبر بوابة الربط التقني المعتمدة.",
    });

    revalidatePath(`/${locale}/admin/integrations`);
  }

  // Real, admin-triggered email to every active parent account -- the
  // mechanism behind the Terms of Service's promises to notify parents by
  // email of a price change (s4) or a material change to their subscription
  // or to the Privacy Policy (s9/s11). Those clauses previously had no code
  // path that actually sent anything; this genuinely dispatches via the
  // same notificationDispatcherService/EmailAdapter pipeline the
  // password-reset flow uses (real delivery through Resend when
  // RESEND_API_KEY is configured, a clearly-labeled dev-sandbox mock
  // otherwise -- see the "Multi-Channel" panel above for current status).
  async function handleBroadcastNotice(formData: FormData) {
    "use server";
    const admin = await requireAdminSession(locale);
    const subject = formData.get("subject")?.toString().trim() || "";
    const body = formData.get("body")?.toString().trim() || "";

    if (!subject || !body) {
      redirect(`/${locale}/admin/integrations`);
    }

    const parents = await userRepository.getAllParentsWithContact();

    let sent = 0;
    let failed = 0;
    for (const parent of parents) {
      const result = await notificationDispatcherService.dispatch("EMAIL", {
        recipientContact: parent.email,
        recipientName: parent.name,
        eventName: "ACCOUNT_NOTICE",
        titleAr: subject,
        bodyAr: body,
      });
      if (result.isDelivered) sent += 1;
      else failed += 1;
    }

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "USER_MANAGEMENT",
      action: "BROADCAST_ACCOUNT_NOTICE_EMAIL",
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      targetEntityId: "ALL_PARENTS",
      targetEntityType: "ParentProfile",
      ipAddress: ip,
      diffSummary: `Subject: "${subject}" -- sent to ${sent}/${parents.length} parents (${failed} failed)`,
    });

    revalidatePath(`/${locale}/admin/integrations`);
    redirect(
      `/${locale}/admin/integrations?broadcastSent=${sent}&broadcastFailed=${failed}`
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              لوحة الإدارة العامة
            </Link>
            <span>/</span>
            <span>الربط التقني والتكاملات</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            مركز الربط السحابي والتكاملات الخارجية 🔌
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة حالة بوابات الفصول الافتراضية، الإشعارات المتعددة، التخزين الخاص، ومحركات الذكاء الاصطناعي
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>4 منظومات تكامل رئيسية متصلة وجاهزة</span>
        </div>
      </div>

      {(broadcastSent !== undefined || broadcastFailed !== undefined) && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            تم إرسال الإشعار إلى {broadcastSent} من أولياء الأمور بنجاح
            {Number(broadcastFailed) > 0 ? `، وفشل الإرسال لـ ${broadcastFailed} حساب` : ""}.
          </span>
        </div>
      )}

      {/* The 4 Integration Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Video Meetings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              <span>1. بوابات الفصول الافتراضية المباشرة (Video)</span>
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {meetingPlatforms.map((mp, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{mp.nameAr}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Provider: {mp.platform}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {mp.badgeText}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar 2: Notifications */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>2. الإشعارات والتواصل المتعدد (Multi-Channel)</span>
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {notificationChannels.map((nc, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{nc.nameAr}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Channel: {nc.channel}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {nc.badgeText}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar 3: Storage */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-600" />
              <span>3. التخزين السحابي الخاص والروابط الموقعة (Storage)</span>
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{storageStatus.providerName}</span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {storageStatus.badgeText}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60">
              {storageStatus.securityPolicy}
            </p>
          </div>
        </div>

        {/* Pillar 4: AI Engine */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-500" />
              <span>4. محرك الذكاء الاصطناعي والمساعد التعليمي (AI)</span>
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{aiStatus.engineName}</span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {aiStatus.badgeText}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60">
              {aiStatus.modelCapability}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Testing Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Trigger Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Play className="w-4 h-4 text-brand-600" />
            <span>منصة اختبار الإرسال اللحظي (Sandbox)</span>
          </h3>
          <p className="text-xs text-slate-500">
            أرسل إشعاراً تجريبياً حياً للتحقق من سلامة قنوات التوجيه
          </p>

          <form action={handleTestDispatch} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">القناة المستهدفة</label>
              <select
                name="channel"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="WHATSAPP">واتساب السحابي (WhatsApp)</option>
                <option value="SMS">الرسائل النصية (SMS)</option>
                <option value="EMAIL">البريد الإلكتروني (Email)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">بيانات الاتصال</label>
              <input
                name="recipient"
                type="text"
                defaultValue="+966501234567"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-start"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إطلاق إشعار تجريبي 🚀</span>
            </button>
          </form>
        </div>

        {/* Live Dispatch Log */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>سجل عمليات الإرسال الأخيرة (Recent Deliveries)</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {dispatchHistory.map((d, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{d.statusMessage}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                      {d.channel}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {d.messageId} • المستلم: {d.recipientContact}
                  </span>
                </div>

                <div className="text-start sm:text-end text-[11px] text-slate-400">
                  <span>{d.sentAt.toISOString().replace("T", " ").substring(11, 19)} UTC</span>
                  <span className="block text-emerald-600 font-bold">تم التسليم ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account-wide Email Broadcast -- real delivery for the price-change /
          policy-change notices the Terms of Service and Privacy Policy
          promise to send by email (ToS §4/§11, Privacy §9). */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-rose-600" />
            <span>إشعار جماعي بالبريد الإلكتروني لجميع أولياء الأمور</span>
          </h2>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {activeParentCount} حساب ولي أمر نشط
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          يُستخدم هذا لتنفيذ الوعود الفعلية الواردة في شروط الخدمة وسياسة الخصوصية بإخطار أولياء الأمور عبر البريد
          الإلكتروني عند تغيّر الأسعار، أو عند أي تعديل جوهري يؤثر على الاشتراك أو على سياسة الخصوصية. عند الإرسال،
          تُرسل رسالة حقيقية إلى كل حساب ولي أمر نشط عبر نفس قناة البريد الإلكتروني المعتمدة (Resend)، ويُسجَّل كل
          إرسال جماعي في سجل التدقيق (Audit Log).
        </p>

        <form action={handleBroadcastNotice} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">عنوان الرسالة (Subject)</label>
            <input
              name="subject"
              type="text"
              required
              placeholder="تحديث على أسعار الاشتراك اعتباراً من الفاتورة القادمة"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-start"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">نص الرسالة (Body)</label>
            <textarea
              name="body"
              required
              rows={4}
              placeholder="مرحباً، نود إعلامكم بأن..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-start"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>إرسال الإشعار إلى جميع أولياء الأمور</span>
          </button>
        </form>
      </div>
    </div>
  );
}
