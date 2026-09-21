import { MeetingAdapter, MeetingCreationParams, MeetingPlatform, MeetingSessionDetails } from "./types";

const ZOOM_OAUTH_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE = "https://api.zoom.us/v2";
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Real Zoom integration via Server-to-Server OAuth (the credential type Zoom
 * recommends for backend automation with no end-user login step).
 * Falls back to a clearly-labeled sandbox session if credentials are absent
 * OR if the live API call fails for any reason (network, revoked app,
 * expired secret, etc.) -- a scheduling request must never crash because a
 * third-party API had a bad moment.
 */
export class ZoomMeetingAdapter implements MeetingAdapter {
  readonly platformName: MeetingPlatform = "ZOOM";

  isConfigured(): boolean {
    return Boolean(
      process.env.ZOOM_ACCOUNT_ID &&
      process.env.ZOOM_CLIENT_ID &&
      process.env.ZOOM_CLIENT_SECRET
    );
  }

  async createSession(params: MeetingCreationParams): Promise<MeetingSessionDetails> {
    if (this.isConfigured()) {
      try {
        return await this.createLiveMeeting(params);
      } catch (err) {
        console.error("[ZoomMeetingAdapter] live API call failed, falling back to sandbox session", err);
      }
    }
    return this.createSandboxMeeting(params);
  }

  private async createLiveMeeting(params: MeetingCreationParams): Promise<MeetingSessionDetails> {
    const accountId = process.env.ZOOM_ACCOUNT_ID!;
    const clientId = process.env.ZOOM_CLIENT_ID!;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET!;

    // 1. Exchange the Server-to-Server app's credentials for a short-lived access token.
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch(
      `${ZOOM_OAUTH_URL}?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
      {
        method: "POST",
        headers: { Authorization: `Basic ${basicAuth}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );
    if (!tokenRes.ok) {
      throw new Error(`Zoom OAuth token request failed: HTTP ${tokenRes.status}`);
    }
    const tokenJson = (await tokenRes.json()) as { access_token: string };

    // 2. Create the scheduled meeting on the authorizing account's own user.
    const meetingRes = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: params.classGroupName,
        type: 2, // scheduled meeting
        start_time: params.startTimeUtc.toISOString(),
        duration: params.durationMinutes,
        timezone: "UTC",
        settings: {
          join_before_host: false,
          waiting_room: true,
          approval_type: 2,
          mute_upon_entry: true,
        },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!meetingRes.ok) {
      throw new Error(`Zoom meeting creation failed: HTTP ${meetingRes.status}`);
    }
    const meetingJson = (await meetingRes.json()) as { join_url: string; start_url: string };

    return {
      sessionId: params.sessionId,
      topic: params.classGroupName,
      joinUrlStudent: meetingJson.join_url,
      hostUrlTeacher: meetingJson.start_url,
      provider: "ZOOM",
      createdAt: new Date(),
      isMock: false,
      notes: "تم إنشاء الاجتماع بنجاح عبر Zoom Server-to-Server OAuth API",
    };
  }

  private createSandboxMeeting(params: MeetingCreationParams): MeetingSessionDetails {
    const meetingNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    const pwd = Math.random().toString(36).substring(2, 8);

    return {
      sessionId: params.sessionId,
      topic: params.classGroupName,
      joinUrlStudent: `https://zoom.sandbox.arabickidsacademy.internal/j/${meetingNumber}?pwd=${pwd}&role=student`,
      hostUrlTeacher: `https://zoom.sandbox.arabickidsacademy.internal/s/${meetingNumber}?pwd=${pwd}&role=host`,
      provider: "ZOOM",
      createdAt: new Date(),
      isMock: true,
      notes: "محاكي Zoom (بيئة التطوير والاختبار - بيانات الاعتماد غير معينة أو تعذر الاتصال الحي)",
    };
  }
}
