import { MeetingAdapter, MeetingCreationParams, MeetingPlatform, MeetingSessionDetails } from "./types";

const REQUEST_TIMEOUT_MS = 10000;

/**
 * Real Cisco Webex integration via a Webex OAuth Integration's refresh-token
 * grant (Webex Meetings has no client-credentials/server-only auth mode for
 * self-serve developers, so a one-time authorization by the school's Webex
 * account owner produces the long-lived WEBEX_REFRESH_TOKEN this adapter
 * exchanges on every call -- see docs/DEPLOYMENT.md). Webex issues a single
 * webLink for a meeting rather than separate host/join links; whoever opens
 * it while logged in as the organizer gets host controls automatically.
 * Falls back to a clearly-labeled sandbox session if credentials are absent
 * or the live call fails.
 */
export class WebexMeetingAdapter implements MeetingAdapter {
  readonly platformName: MeetingPlatform = "WEBEX";

  isConfigured(): boolean {
    return Boolean(
      process.env.WEBEX_CLIENT_ID &&
      process.env.WEBEX_CLIENT_SECRET &&
      process.env.WEBEX_REFRESH_TOKEN
    );
  }

  async createSession(params: MeetingCreationParams): Promise<MeetingSessionDetails> {
    if (this.isConfigured()) {
      try {
        return await this.createLiveMeeting(params);
      } catch (err) {
        console.error("[WebexMeetingAdapter] live API call failed, falling back to sandbox session", err);
      }
    }
    return this.createSandboxMeeting(params);
  }

  private async createLiveMeeting(params: MeetingCreationParams): Promise<MeetingSessionDetails> {
    const clientId = process.env.WEBEX_CLIENT_ID!;
    const clientSecret = process.env.WEBEX_CLIENT_SECRET!;
    const refreshToken = process.env.WEBEX_REFRESH_TOKEN!;

    // 1. Exchange the long-lived refresh token for a short-lived access token.
    const tokenRes = await fetch("https://webexapis.com/v1/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!tokenRes.ok) {
      throw new Error(`Webex OAuth token request failed: HTTP ${tokenRes.status}`);
    }
    const tokenJson = (await tokenRes.json()) as { access_token: string };

    // 2. Create the meeting.
    const endTime = new Date(params.startTimeUtc.getTime() + params.durationMinutes * 60000);
    const meetingRes = await fetch("https://webexapis.com/v1/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: params.classGroupName,
        start: params.startTimeUtc.toISOString(),
        end: endTime.toISOString(),
        enabledAutoRecordMeeting: false,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!meetingRes.ok) {
      throw new Error(`Webex meeting creation failed: HTTP ${meetingRes.status}`);
    }
    const meetingJson = (await meetingRes.json()) as { webLink: string };

    return {
      sessionId: params.sessionId,
      topic: params.classGroupName,
      joinUrlStudent: meetingJson.webLink,
      hostUrlTeacher: meetingJson.webLink,
      provider: "WEBEX",
      createdAt: new Date(),
      isMock: false,
      notes: "تم إنشاء اجتماع Webex بنجاح - على المعلم تسجيل الدخول بحسابه لبدء الاجتماع كمضيف",
    };
  }

  private createSandboxMeeting(params: MeetingCreationParams): MeetingSessionDetails {
    const meetingKey = Math.floor(100000000 + Math.random() * 900000000);

    return {
      sessionId: params.sessionId,
      topic: params.classGroupName,
      joinUrlStudent: `https://webex.sandbox.kidsarabicacademy.internal/meet/${meetingKey}?role=student`,
      hostUrlTeacher: `https://webex.sandbox.kidsarabicacademy.internal/meet/${meetingKey}?role=host`,
      provider: "WEBEX",
      createdAt: new Date(),
      isMock: true,
      notes: "محاكي Webex (بيئة التطوير - بيانات اعتماد Webex غير معينة أو تعذر الاتصال الحي)",
    };
  }
}
