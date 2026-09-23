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

    if (apiKey) {
      // Real delivery via Resend's HTTP API. No SDK dependency -- this is a
      // single documented POST endpoint, so a raw fetch call is simpler and
      // avoids adding another package for one call site.
      const fromEmail = process.env.FROM_EMAIL || "Arabic Kids Academy <onboarding@resend.dev>";
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

        if (!res.ok) {
          const errorBody = await res.text().catch(() => "");
          // Logged via console.error (not the gated "External APIs" panel)
          // so the real Resend failure reason shows up in Vercel's regular
          // Runtime Logs without needing an Observability add-on.
          console.error(
            `[EmailAdapter] Resend API request failed (status ${res.status}) sending to ${payload.recipientContact}, from=${fromEmail}: ${errorBody.slice(0, 500)}`
          );
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
      } catch (err) {
        console.error(
          `[EmailAdapter] Resend API request threw sending to ${payload.recipientContact}, from=${fromEmail}:`,
          err
        );
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

    if (process.env.SMTP_HOST) {
      // SMTP_HOST is checked for isConfigured()/status-badge purposes, but no
      // SMTP client is wired up (no SMTP_PORT/USER/PASS are read anywhere,
      // and no SMTP library is installed). Report this honestly instead of
      // silently pretending the email went out.
      return {
        messageId,
        channel: "EMAIL",
        recipientContact: payload.recipientContact,
        isDelivered: false,
        isMock: false,
        sentAt: new Date(),
        statusMessage: "لم يتم تفعيل الإرسال عبر SMTP بعد -- يرجى تكوين RESEND_API_KEY بدلاً من ذلك.",
      };
    }

    // Graceful Dev/QA Sandbox Fallback
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
