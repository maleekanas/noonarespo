import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notificationService } from "@/server/services/NotificationService";
import {
  Bell,
  CheckCheck,
  Award,
  Video,
  MessageSquare,
  Calendar,
} from "lucide-react";

export default async function ParentNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const parentId = "parent-1";
  const notifications = await notificationService.getNotifications(parentId);

  async function handleMarkAllRead() {
    "use server";
    await notificationService.markAllRead(parentId);
    revalidatePath(`/${locale}/parent/notifications`);
    revalidatePath(`/${locale}/parent`);
  }

  const iconMap: Record<string, typeof Bell> = {
    ATTENDANCE_ALERT: Calendar,
    HOMEWORK_GRADED: Award,
    NEW_MESSAGE: MessageSquare,
    MEETING_UPDATE: Video,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent`} className="hover:underline">
              لوحة ولي الأمر
            </Link>
            <span>/</span>
            <span>الإشعارات الفورية</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            مركز الإشعارات والتنبيهات 🔔
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تنبيهات فورية بخصوص حضور طفلك، نتائج الواجبات، ورسائل المعلمين
          </p>
        </div>

        <form action={handleMarkAllRead}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>تحديد الكل كمقروء</span>
          </button>
        </form>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Bell className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm font-semibold">لا توجد إشعارات جديدة حالياً</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <div
                key={notif.id}
                className={`p-5 flex items-start gap-4 transition-colors ${
                  notif.isRead ? "bg-white opacity-80" : "bg-blue-50/40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.type === "ATTENDANCE_ALERT"
                      ? "bg-emerald-50 text-emerald-600"
                      : notif.type === "HOMEWORK_GRADED"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-brand-50 text-brand-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                    <span className="text-[11px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
