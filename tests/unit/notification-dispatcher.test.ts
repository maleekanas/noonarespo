import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { notificationDispatcherService } from "../../src/server/services/NotificationDispatcherService";

describe("Multi-Channel Notification Dispatcher", () => {
  test("WhatsApp Adapter: Should dispatch WhatsApp alert with delivery receipt", async () => {
    const result = await notificationDispatcherService.dispatch("WHATSAPP", {
      recipientContact: "+966501234567",
      recipientName: "طارق المنصور",
      eventName: "CLASS_STARTING_SOON",
      titleAr: "تذكير: الحصة تبدأ قريباً",
      bodyAr: "تبدأ حصة القراءة التفاعلية لـ زيد بعد 15 دقيقة عبر الغرفة الافتراضية.",
    });

    assert.equal(result.channel, "WHATSAPP");
    assert.equal(result.isDelivered, true);
    assert.ok(result.messageId.startsWith("wamid."));
    assert.equal(result.recipientContact, "+966501234567");
  });

  test("SMS Adapter: Should dispatch urgent SMS alert", async () => {
    const result = await notificationDispatcherService.dispatch("SMS", {
      recipientContact: "+966501234567",
      recipientName: "طارق المنصور",
      eventName: "ATTENDANCE_ALERT",
      titleAr: "تنبيه الحضور",
      bodyAr: "تم تسجيل حضور الطالب زيد لحصة اليوم بانتظام.",
    });

    assert.equal(result.channel, "SMS");
    assert.equal(result.isDelivered, true);
    assert.ok(result.messageId.startsWith("SM"));
  });

  test("Email Adapter: Should dispatch formal invoice email", async () => {
    const result = await notificationDispatcherService.dispatch("EMAIL", {
      recipientContact: "parent.tariq@example.com",
      recipientName: "طارق المنصور",
      eventName: "INVOICE_ISSUED",
      titleAr: "فاتورة سداد الاشتراك",
      bodyAr: "تم إصدار الفاتورة الضريبية رقم #INV-2026-0901 بنجاح.",
    });

    assert.equal(result.channel, "EMAIL");
    assert.equal(result.isDelivered, true);
    assert.ok(result.messageId.startsWith("msg_email_"));
  });

  test("Multi-Channel Dispatch: Should route concurrently to multiple channels and track history", async () => {
    const initialHistoryLength = notificationDispatcherService.getDispatchHistory().length;

    const results = await notificationDispatcherService.dispatchMultiChannel(
      ["WHATSAPP", "EMAIL"],
      {
        recipientContact: "+966501234567",
        recipientName: "طارق المنصور",
        eventName: "HOMEWORK_GRADED",
        titleAr: "تم تصحيح الواجب",
        bodyAr: "حصل زيد على الدرجة الكاملة 100/100 في تسجيل سورة الإخلاص.",
      }
    );

    assert.equal(results.length, 2);
    assert.equal(results[0].channel, "WHATSAPP");
    assert.equal(results[1].channel, "EMAIL");

    const newHistory = notificationDispatcherService.getDispatchHistory();
    assert.equal(newHistory.length, initialHistoryLength + 2);
  });
});
