import {
  NotificationChannel,
  NotificationChannelAdapter,
  NotificationDispatchResult,
  NotificationPayload,
} from "./types";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export class EmailAdapter implements NotificationChannelAdapter {
  readonly channel: NotificationChannel = "EMAIL";

  isConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
  }

  async send(payload: NotificationPayload): Promise<NotificationDispatchResult> {
    const apiKey = process.env.RESEND_API_KEY;
    const messageId = "msg_email_" + Math.random().toString(36).substring(2, 12);
    const fromEmail =
      process.env.FROM_EMAIL ||
      process.env.SMTP_FROM ||
      "Arabic Kids Academy <onboarding@resend.dev>";

    // 1. Try Resend if RESEND_API_KEY is configured
    if (apiKey) {
      try {
        const res = await fetch(RESEND_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [payload.recipientContact],
            subject: payload.titleAr,
            html: this.renderHtml(payload),
          }),
        });

        if (res.ok) {
          const data = (await res.json().catch(() => null)) as { id?: string } | null;
          return {
            messageId: data?.id || messageId,
            channel: "EMAIL",
            recipientContact: payload.recipientContact,
            isDelivered: true,
            isMock: false,
            sentAt: new Date(),
            statusMessage: `تم تسليم البريد الإلكتروني الرسمي بنجاح إلى ${payload.recipientContact}`,
          };
        }

        const errorBody = await res.text().catch(() => "");
        console.error(
          `[EmailAdapter] Resend API request failed (status ${res.status}) sending to ${payload.recipientContact}, from=${fromEmail}: ${errorBody.slice(0, 500)}`
        );

        // If SMTP is also configured, fall back to SMTP instead of outright failing
        if (!process.env.SMTP_HOST) {
          return {
            messageId,
            channel: "EMAIL",
            recipientContact: payload.recipientContact,
            isDelivered: false,
            isMock: false,
            sentAt: new Date(),
            statusMessage: `فشل إرسال البريد الإلكتروني (${res.status}): ${errorBody.slice(0, 200)}`,
          };
        }
      } catch (err) {
        console.error(
          `[EmailAdapter] Resend API request threw sending to ${payload.recipientContact}, from=${fromEmail}:`,
          err
        );
        if (!process.env.SMTP_HOST) {
          return {
            messageId,
            channel: "EMAIL",
            recipientContact: payload.recipientContact,
            isDelivered: false,
            isMock: false,
            sentAt: new Date(),
            statusMessage: `تعذر الاتصال بخدمة البريد الإلكتروني: ${err instanceof Error ? err.message : String(err)}`,
          };
        }
      }
    }

    // 2. Try SMTP via Nodemailer if SMTP_HOST is configured
    if (process.env.SMTP_HOST) {
      try {
        const host = process.env.SMTP_HOST;
        const port = parseInt(process.env.SMTP_PORT || "587", 10);
        const secure =
          process.env.SMTP_SECURE === "true" ||
          port === 465 ||
          process.env.SMTP_PORT === "465";
        const user = process.env.SMTP_USER || process.env.SMTP_USERNAME;
        const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

        const nodemailer = (await import("nodemailer")).default;
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: user ? { user, pass } : undefined,
          tls: {
            rejectUnauthorized: process.env.SMTP_IGNORE_TLS !== "true",
          },
        });

        const info = await transporter.sendMail({
          from: fromEmail,
          to: payload.recipientContact,
          subject: payload.titleAr,
          html: this.renderHtml(payload),
        });

        return {
          messageId: info.messageId || messageId,
          channel: "EMAIL",
          recipientContact: payload.recipientContact,
          isDelivered: true,
          isMock: false,
          sentAt: new Date(),
          statusMessage: `تم تسليم البريد الإلكتروني عبر خادم SMTP بنجاح إلى ${payload.recipientContact}`,
        };
      } catch (smtpErr) {
        console.error("[EmailAdapter] SMTP delivery error:", smtpErr);
        return {
          messageId,
          channel: "EMAIL",
          recipientContact: payload.recipientContact,
          isDelivered: false,
          isMock: false,
          sentAt: new Date(),
          statusMessage: `فشل الإرسال عبر SMTP: ${smtpErr instanceof Error ? smtpErr.message : String(smtpErr)}`,
        };
      }
    }

    // 3. Graceful Dev/QA Sandbox Fallback
    console.log(
      `[EmailAdapter:Sandbox] Simulated email dispatch to ${payload.recipientContact}: ${payload.titleAr}`
    );
    return {
      messageId,
      channel: "EMAIL",
      recipientContact: payload.recipientContact,
      isDelivered: true,
      isMock: true,
      sentAt: new Date(),
      statusMessage: `[محاكي البريد] إرسال بريد محاكى إلى ${payload.recipientContact}: ${payload.titleAr}`,
    };
  }

  private renderHtml(payload: NotificationPayload): string {
    const actionButton = payload.actionUrl
      ? `<p style="margin-top:24px;"><a href="${payload.actionUrl}" style="background:#0f766e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">فتح الرابط</a></p>`
      : "";

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
  <body style="font-family:Tahoma,Arial,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
      <h2 style="color:#0f172a;margin-top:0;">${payload.titleAr}</h2>
      <p style="color:#334155;line-height:1.7;">${payload.bodyAr}</p>
      ${actionButton}
      <p style="color:#94a3b8;font-size:12px;margin-top:32px;">أكاديمية الأطفال العربية -- Arabic Kids Academy</p>
    </div>
  </body>
</html>`;
  }
}
