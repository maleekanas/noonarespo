import {
  NotificationChannel,
  NotificationChannelAdapter,
  NotificationDispatchResult,
  NotificationPayload,
} from "@/lib/integrations/notifications/types";
import { WhatsAppAdapter } from "@/lib/integrations/notifications/WhatsAppAdapter";
import { SmsAdapter } from "@/lib/integrations/notifications/SmsAdapter";
import { EmailAdapter } from "@/lib/integrations/notifications/EmailAdapter";

export class NotificationDispatcherService {
  private adapters: Map<NotificationChannel, NotificationChannelAdapter> = new Map();
  private dispatchHistory: NotificationDispatchResult[] = [];

  constructor() {
    this.adapters.set("WHATSAPP", new WhatsAppAdapter());
    this.adapters.set("SMS", new SmsAdapter());
    this.adapters.set("EMAIL", new EmailAdapter());
    this.seedRecentDispatches();
  }

  private seedRecentDispatches() {
    this.dispatchHistory.push(
      {
        messageId: "wamid.mock-101",
        channel: "WHATSAPP",
        recipientContact: "+966501234567",
        isDelivered: true,
        isMock: true,
        sentAt: new Date(Date.now() - 45 * 60 * 1000),
        statusMessage: "تذكير: تبدأ حصة القراءة (المستوى A1) لـ زيد بعد 15 دقيقة",
      },
      {
        messageId: "msg-email-202",
        channel: "EMAIL",
        recipientContact: "parent.tariq@example.com",
        isDelivered: true,
        isMock: true,
        sentAt: new Date(Date.now() - 2 * 3600 * 1000),
        statusMessage: "إيصال سداد باقة العائلة VIP - فاتورة #INV-2026-0901",
      },
      {
        messageId: "sm-mock-303",
        channel: "SMS",
        recipientContact: "+966501234567",
        isDelivered: true,
        isMock: true,
        sentAt: new Date(Date.now() - 24 * 3600 * 1000),
        statusMessage: "تم رصد تقييم الواجب الصوتي لـ زيد طارق (الدرجة: 100/100)",
      }
    );
  }

  async dispatch(
    channel: NotificationChannel,
    payload: NotificationPayload
  ): Promise<NotificationDispatchResult> {
    const adapter = this.adapters.get(channel);
    if (!adapter) {
      throw new Error(`Unsupported notification channel: ${channel}`);
    }

    const result = await adapter.send(payload);
    this.dispatchHistory.unshift(result);
    return result;
  }

  async dispatchMultiChannel(
    channels: NotificationChannel[],
    payload: NotificationPayload
  ): Promise<NotificationDispatchResult[]> {
    const results: NotificationDispatchResult[] = [];
    for (const ch of channels) {
      const res = await this.dispatch(ch, payload);
      results.push(res);
    }
    return results;
  }

  getChannelStatuses(): Array<{
    channel: NotificationChannel;
    nameAr: string;
    isConfigured: boolean;
    badgeText: string;
  }> {
    return [
      {
        channel: "WHATSAPP",
        nameAr: "واتساب السحابي (Meta Cloud API)",
        isConfigured: this.adapters.get("WHATSAPP")!.isConfigured(),
        badgeText: this.adapters.get("WHATSAPP")!.isConfigured()
          ? "اتصال معتمد (Live WhatsApp)"
          : "محاكي بيئة التطوير (Dev Sandbox)",
      },
      {
        channel: "SMS",
        nameAr: "الرسائل النصية القصيرة (SMS Gateway)",
        isConfigured: this.adapters.get("SMS")!.isConfigured(),
        badgeText: this.adapters.get("SMS")!.isConfigured()
          ? "بوابة نشطة (Live SMS)"
          : "محاكي بيئة التطوير (Dev Sandbox)",
      },
      {
        channel: "EMAIL",
        nameAr: "البريد الإلكتروني المعتمد (Transactional Email)",
        isConfigured: this.adapters.get("EMAIL")!.isConfigured(),
        badgeText: this.adapters.get("EMAIL")!.isConfigured()
          ? "خادم بريد نشط (Live SMTP/API)"
          : "محاكي بيئة التطوير (Dev Sandbox)",
      },
    ];
  }

  getDispatchHistory(limit = 10): NotificationDispatchResult[] {
    return this.dispatchHistory.slice(0, limit);
  }
}

export const notificationDispatcherService = new NotificationDispatcherService();
