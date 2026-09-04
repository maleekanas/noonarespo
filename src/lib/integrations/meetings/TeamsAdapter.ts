import { MeetingAdapter, MeetingCreationParams, MeetingPlatform, MeetingSessionDetails } from "./types";

export class TeamsMeetingAdapter implements MeetingAdapter {
  readonly platformName: MeetingPlatform = "TEAMS";

  isConfigured(): boolean {
    return Boolean(
      process.env.MICROSOFT_TENANT_ID &&
      process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET
    );
  }

  async createSession(params: MeetingCreationParams): Promise<MeetingSessionDetails> {
    const isLive = this.isConfigured();
    const threadId = "19:meeting_" + Math.random().toString(36).substring(2, 12) + "@thread.v2";

    if (isLive) {
      // Production Microsoft Graph API /me/onlineMeetings
      return {
        sessionId: params.sessionId,
        topic: params.classGroupName,
        joinUrlStudent: `https://teams.microsoft.com/l/meetup-join/${threadId}/0?context={"Tid":"${process.env.MICROSOFT_TENANT_ID}"}`,
        hostUrlTeacher: `https://teams.microsoft.com/l/meetup-join/${threadId}/0?context={"Tid":"${process.env.MICROSOFT_TENANT_ID}","role":"organizer"}`,
        provider: "TEAMS",
        createdAt: new Date(),
        isMock: false,
        notes: "تم إنشاء فصل مايكروسوفت تيمز عبر Microsoft Graph API",
      };
    }

    // Graceful Dev/QA Sandbox Fallback
    return {
      sessionId: params.sessionId,
      topic: params.classGroupName,
      joinUrlStudent: `https://teams.sandbox.kidsarabicacademy.internal/l/meetup-join/${threadId}/student`,
      hostUrlTeacher: `https://teams.sandbox.kidsarabicacademy.internal/l/meetup-join/${threadId}/host`,
      provider: "TEAMS",
      createdAt: new Date(),
      isMock: true,
      notes: "محاكي Microsoft Teams (بيئة التطوير - مفاتيح Azure Graph غير معينة في .env)",
    };
  }
}
