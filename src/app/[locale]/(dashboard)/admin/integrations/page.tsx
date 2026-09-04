import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { meetingManager } from "@/lib/integrations/meetings/MeetingManager";
import { notificationDispatcherService } from "@/server/services/NotificationDispatcherService";
import { storageService } from "@/server/services/StorageService";
import { aiService } from "@/server/services/AiService";
import { NotificationChannel } from "@/lib/integrations/notifications/types";
import {
  Video,
  MessageSquare,
  HardDrive,
  Bot,
  CheckCircle2,
  Play,
  Send,
  Zap,
} from "lucide-react";

export default async function AdminIntegrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const meetingPlatforms = meetingManager.getPlatformStatuses();
  const notificationChannels = notificationDispatcherService.getChannelStatuses();
  const storageStatus = storageService.getStorageStatus();
  const aiStatus = aiService.getAiStatus();
  const dispatchHistory = notificationDispatcherService.getDispatchHistory(6);

  async function handleTestDispatch(formData: FormData) {
    "use server";
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
    </div>
  );
}
