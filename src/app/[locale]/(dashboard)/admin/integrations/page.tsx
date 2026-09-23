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
import { isStripeConfigured } from "@/lib/integrations/stripe";
import { isRealtimeConfigured, triggerClassroomEvent } from "@/lib/integrations/realtime/RealtimeServer";
import {
  Video,
  MessageSquare,
  HardDrive,
  Bot,
  CreditCard,
  Radio,
  CheckCircle2,
  Play,
  Send,
  Zap,
  Megaphone,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default async function AdminIntegrationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    broadcastSent?: string;
    broadcastFailed?: string;
    aiReply?: string;
    aiXp?: string;
    pusherPingSent?: string;
  }>;
}) {
  const { locale } = await params;
  const { broadcastSent, broadcastFailed, aiReply, aiXp, pusherPingSent } = await searchParams;
  await requireAdminSession(locale);
  const isAr = locale === "ar";

  const meetingPlatforms = meetingManager.getPlatformStatuses();
  const notificationChannels = notificationDispatcherService.getChannelStatuses();
  const storageStatus = storageService.getStorageStatus();
  const aiStatus = aiService.getAiStatus();
  const dispatchHistory = notificationDispatcherService.getDispatchHistory(6);
  const activeParentCount = (await userRepository.getAllParentsWithContact()).length;

  const stripeConfigured = isStripeConfigured();
  const realtimeConfigured = isRealtimeConfigured();

  // Action: Dispatch Test Notification
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

  // Action: Interactive AI Sandbox Prompt
  async function handleTestAiPrompt(formData: FormData) {
    "use server";
    await requireAdminSession(locale);
    const prompt = formData.get("prompt")?.toString().trim() || "مرحباً فصيح، كيف أتعلم الحروف العربية؟";

    const response = await aiService.sendStudentMessage({
      studentId: "superadmin-sandbox",
      message: prompt,
    });

    revalidatePath(`/${locale}/admin/integrations`);
    redirect(
      `/${locale}/admin/integrations?aiReply=${encodeURIComponent(
        response.reply.content
      )}&aiXp=${response.newTotalXp}`
    );
  }

  // Action: Pusher WebSocket Ping
  async function handlePusherPing() {
    "use server";
    await requireAdminSession(locale);
    await triggerClassroomEvent("sandbox-admin-monitor", "admin:ping", {
      sender: "superadmin",
      timestamp: Date.now(),
      status: "OK",
    });

    revalidatePath(`/${locale}/admin/integrations`);
    redirect(`/${locale}/admin/integrations?pusherPingSent=1`);
  }


  // Action: Broadcast Notice Email to Parents
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
              {isAr ? "لوحة الإدارة العامة" : "Admin Operations Center"}
            </Link>
            <span>/</span>
            <span>{isAr ? "الربط التقني والتكاملات" : "Cloud Integrations Hub"}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isAr ? "مركز الربط السحابي والتكاملات الخارجية 🔌" : "Cloud Integrations & External Gateways Hub"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? "متابعة شاملة لـ 6 ركائز تكامل: بوابات الفصول الافتراضية، الإشعارات المتعددة، التخزين الخاص، الذكاء الاصطناعي، بوابات الدفع، والتزامن اللحظي"
              : "End-to-end monitoring across 6 integration pillars: Virtual Meetings, Multi-Channel Alerts, Cloud Storage, AI Engines, Stripe Payments, and Real-Time Sync"}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-sm">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>{isAr ? "6 منظومات تكامل رئيسية متصلة وجاهزة" : "6 Core Cloud Integrations Active"}</span>
        </div>
      </div>

      {/* Broadcast Alert Feedback */}
      {(broadcastSent !== undefined || broadcastFailed !== undefined) && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            {isAr
              ? `تم إرسال الإشعار إلى ${broadcastSent} من أولياء الأمور بنجاح`
              : `Notification dispatched to ${broadcastSent} parents successfully`}
            {Number(broadcastFailed) > 0
              ? isAr
                ? `، وفشل الإرسال لـ ${broadcastFailed} حساب`
                : `, failed for ${broadcastFailed} accounts`
              : ""}.
          </span>
        </div>
      )}

      {pusherPingSent && (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-3.5 text-sm text-cyan-800 flex items-center gap-2 shadow-sm">
          <Radio className="w-4 h-4 shrink-0 text-cyan-600" />
          <span>
            {isAr
              ? "تم إرسال إشارة الفحص اللحظية (WebSocket Ping) إلى قنوات Pusher بنجاح."
              : "Pusher WebSocket ping event successfully broadcasted to realtime cluster."}
          </span>
        </div>
      )}

      {/* The 6 Integration Pillars (3x2 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Video Meetings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-600" />
                <span>1. الفصول الافتراضية (Video)</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {meetingPlatforms.length} مزودين
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {meetingPlatforms.map((mp, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{mp.nameAr}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Provider: {mp.platform}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {mp.badgeText}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            يدعم Zoom وTeams وMeet مع التوليد التلقائي للروابط الآمنة.
          </p>
        </div>

        {/* Pillar 2: Multi-Channel Notifications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>2. قنوات الإشعارات (Alerts)</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {notificationChannels.length} قنوات
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {notificationChannels.map((nc, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{nc.nameAr}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Channel: {nc.channel}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {nc.badgeText}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            تنبيهات WhatsApp وSMS والبريد الإلكتروني للواجبات ومواعيد الحصص.
          </p>
        </div>

        {/* Pillar 3: Cloud Storage */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-600" />
                <span>3. التخزين الخاص (Storage)</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                COPPA / GDPR
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{storageStatus.providerName}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {storageStatus.badgeText}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed pt-1 border-t border-slate-200/60">
                {storageStatus.securityPolicy}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            روابط موقعة HMAC بمدة صلاحية 15 دقيقة لتسجيلات التلاوة والصوتيات.
          </p>
        </div>

        {/* Pillar 4: AI Engine */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-500" />
                <span>4. محرك فصيح الذكي (AI Tutor)</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Faseeh v2.4
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{aiStatus.engineName}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {aiStatus.badgeText}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed pt-1 border-t border-slate-200/60">
                {aiStatus.modelCapability}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            دعم Gemini Pro مع توجيه الحركات وتقييم مخارج الحروف.
          </p>
        </div>

        {/* Pillar 5: Commercial Payments (Stripe Gateway) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>5. بوابة الدفع السحابية (Stripe)</span>
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  stripeConfigured
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {stripeConfigured ? "متصل بالإنتاج (Live)" : "وضع المحاكاة التجريبية"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Stripe Billing & Checkout</span>
                <span className="font-mono text-[11px] text-slate-600">USD ($)</span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200/60 font-mono">
                <div className="flex justify-between">
                  <span>Secret Key:</span>
                  <span className={stripeConfigured ? "text-emerald-600 font-bold" : "text-amber-600"}>
                    {stripeConfigured ? "CONFIGURED (sk_live/test)" : "FALLBACK_SANDBOX"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Webhook Secret:</span>
                  <span className={process.env.STRIPE_WEBHOOK_SECRET ? "text-emerald-600 font-bold" : "text-amber-600"}>
                    {process.env.STRIPE_WEBHOOK_SECRET ? "ACTIVE (whsec_...)" : "AUTO_CONFIRM"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Portal:</span>
                  <span className="text-emerald-600 font-bold">READY</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            معالجة آمنة لبطاقات الائتمان، Apple Pay، والاشتراكات الشهرية وتجربة اليوم الواحد.
          </p>
        </div>

        {/* Pillar 6: Real-Time Sync (Pusher Channels) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-600" />
                <span>6. التزامن الفوري للفصول (Pusher)</span>
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  realtimeConfigured
                    ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {realtimeConfigured ? "قنوات WebSockets نشطة" : "محاكاة محلية نشطة"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Pusher Channels Cluster</span>
                <span className="font-mono text-[11px] text-cyan-700">
                  {process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu"}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200/60 font-mono">
                <div className="flex justify-between">
                  <span>App ID:</span>
                  <span>{process.env.PUSHER_APP_ID ? "CONFIGURED" : "SANDBOX_BROADCASTER"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Presence Channels:</span>
                  <span className="text-emerald-600 font-bold">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>Interactive Whiteboard:</span>
                  <span className="text-cyan-600 font-bold">READY</span>
                </div>
              </div>
            </div>
          </div>

          <form action={handlePusherPing} className="pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-[11px] border border-cyan-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إرسال إشارة فحص لحظية (Ping WebSockets)</span>
            </button>
          </form>
        </div>
      </div>

      {/* Interactive Testing Sandboxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Console: Multi-Channel Dispatch */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Play className="w-4 h-4 text-brand-600" />
            <span>منصة اختبار الإرسال اللحظي (Notification Sandbox)</span>
          </h3>
          <p className="text-xs text-slate-500">
            أرسل إشعاراً تجريبياً حياً للتحقق من سلامة قنوات التوجيه (واتساب، SMS، بريد إلكتروني)
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

          {/* Recent Deliveries list */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs mb-2">سجل آخر عمليات الإرسال:</h4>
            <div className="space-y-2 text-xs">
              {dispatchHistory.slice(0, 3).map((d, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">{d.statusMessage}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{d.channel} • {d.recipientContact}</span>
                  </div>
                  <span className="text-emerald-600 font-bold text-[10px]">تم التسليم ✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Console: Interactive AI Tutor Sandbox */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>منصة اختبار المعلم الذكي «فصيح» (AI Console)</span>
          </h3>
          <p className="text-xs text-slate-500">
            أرسل استفساراً حياً لمحرك الذكاء الاصطناعي لفحص دقة التشكيل وسرعة الاستجابة وتشجيع الطالب
          </p>

          <form action={handleTestAiPrompt} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الرسالة أو السؤال التجريبي</label>
              <textarea
                name="prompt"
                rows={3}
                defaultValue="مرحباً يا فصيح، هل يمكنك أن تشرح لي الفرق بين التاء المربوطة والمفتوحة مع الحركات؟"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>إرسال الاستفسار إلى محرك الذكاء الاصطناعي ⚡</span>
            </button>
          </form>

          {aiReply && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-xs">إجابة فصيح الفورية:</span>
                {aiXp && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                    +{aiXp} XP تشجيعي
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                {aiReply}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Account-wide Email Broadcast */}
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
