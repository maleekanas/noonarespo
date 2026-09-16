import { MeetingAdapter, MeetingCreationParams, MeetingPlatform, MeetingSessionDetails } from "./types";

const REQUEST_TIMEOUT_MS = 10000;

/**
 * Real Microsoft Teams integration via Microsoft Graph application (client
 * credentials) permissions. Creating an onlineMeeting with app-only auth
 * requires an explicit organizer user (Graph has no "/me" without a signed-in
 * user), so this adapter needs one more setting than the others:
 * MICROSOFT_ORGANIZER_USER_ID -- the email or object ID of the Microsoft 365
 * account that should own generated class meetings. It also requires that
 * account's tenant admin has granted the app an application access policy
 * for OnlineMeetings (a Teams-admin step, not just an Azure app registration
 * -- documented in docs/DEPLOYMENT.md). Falls back to a clearly-labeled
 * sandbox session if credentials are absent or the live call fails.
 */
export class TeamsMeetingAdapter implements MeetingAdapter {
  readonly platformName: MeetingPlatform = "TEAMS";

  isConfigured(): boolean {
    return Boolean(
      process.env.MICROSOFT_TENANT_ID &&
      process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET &&
      process.env.MICROSOFT_ORGANIZER_USER_ID
    );
  }

  async createSession(params: MeetingCreationParams): Promise<MeetingSessionDetails> {
    if (this.isConfigured()) {
      try {
        return await this.createLiveMeeting(params);
      } catch (err) {
        console.error("[TeamsMeetingAdapter] live API call failed, falling back to sandbox session", err);
      }
    }
    return this.createSandboxMeeting(params);
  }

  private async createLiveMeeting(params: MeetingCreationParams): Promise<MeetingSessionDetails> {
    const tenantId = process.env.MICROSOFT_TENANT_ID!;
    const clientId = process.env.MICROSOFT_CLIENT_ID!;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
    const organizerId = process.env.MICROSOFT_ORGANIZER_USER_ID!;

    // 1. Client-credentials grant against the tenant's v2.0 token endpoint.
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!tokenRes.ok) {
      throw new Error(`Microsoft OAuth token request failed: HTTP ${tokenRes.status}`);
    }
    const tokenJson = (await tokenRes.json()) as { access_token: string };

    // 2. Create the online meeting under the configured organizer account.
    const endTime = new Date(params.startTimeUtc.getTime() + params.durationMinutes * 60000);
    const meetingRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(organizerId)}/onlineMeetings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenJson.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: params.classGroupName,
          startDateTime: params.startTimeUtc.toISOString(),
          endDateTime: endTime.toISOString(),
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );
    if (!meetingRes.ok) {
      throw new Error(`Teams meeting creation failed: HTTP ${meetingRes.status}`);
    }
    const meetingJson = (await meetingRes.json()) as { joinWebUrl: string };

    return {
      sessionId: params.sessionId,
      topic: params.classGroupName,
      joinUrlStudent: meetingJson.joinWebUrl,
      hostUrlTeacher: meetingJson.joinWebUrl,
      provider: "TEAMS",
      createdAt: new Date(),
      isMock: false,
      notes: "تم إنشاء فصل مايكروسوفت تيمز عبر Microsoft Graph API",
    };
  }

  private createSandboxMeeting(params: MeetingCreationParams): MeetingSessionDetails {
    const threadId = "19:meeting_" + Math.random().toString(36).substring(2, 12) + "@thread.v2";

    return {
      sessionId: params.sessionId,
      topic: params.classGroupName,
      joinUrlStudent: `https://teams.sandbox.kidsarabicacademy.internal/l/meetup-join/${threadId}/student`,
      hostUrlTeacher: `https://teams.sandbox.kidsarabicacademy.internal/l/meetup-join/${threadId}/host`,
      provider: "TEAMS",
      createdAt: new Date(),
      isMock: true,
      notes: "محاكي Microsoft Teams (بيئة التطوير - مفاتيح Azure Graph غير معينة أو تعذر الاتصال الحي)",
    };
  }
}
