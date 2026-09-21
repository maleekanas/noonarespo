import { createSign } from "node:crypto";
import { MeetingAdapter, MeetingCreationParams, MeetingPlatform, MeetingSessionDetails } from "./types";

const REQUEST_TIMEOUT_MS = 10000;

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Real Google Meet integration via a Google Workspace service account with
 * domain-wide delegation. Google Meet links are generated through the
 * Calendar API (conferenceData), and creating them requires the service
 * account to impersonate a real Workspace user -- GOOGLE_IMPERSONATE_SUBJECT
 * (documented in docs/DEPLOYMENT.md, along with the Workspace-admin step of
 * granting that delegation, which is separate from creating the service
 * account itself). No Google API client library is used -- the service
 * account JWT is signed directly with Node's crypto module, matching the
 * rest of this codebase's "no new SDK dependency" pattern. Falls back to a
 * clearly-labeled sandbox session if credentials are absent or the live call
 * fails.
 */
export class GoogleMeetAdapter implements MeetingAdapter {
  readonly platformName: MeetingPlatform = "MEET";

  isConfigured(): boolean {
    return Boolean(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_IMPERSONATE_SUBJECT
    );
  }

  async createSession(params: MeetingCreationParams): Promise<MeetingSessionDetails> {
    if (this.isConfigured()) {
      try {
        return await this.createLiveMeeting(params);
      } catch (err) {
        console.error("[GoogleMeetAdapter] live API call failed, falling back to sandbox session", err);
      }
    }
    return this.createSandboxMeeting(params);
  }

  private async getAccessToken(): Promise<string> {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
    // Vercel env vars can't hold real newlines cleanly, so the PEM is stored with literal "\n" escapes.
    const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
    const impersonateSubject = process.env.GOOGLE_IMPERSONATE_SUBJECT!;

    const header = { alg: "RS256", typ: "JWT" };
    const nowSeconds = Math.floor(Date.now() / 1000);
    const claims = {
      iss: serviceAccountEmail,
      sub: impersonateSubject,
      scope: "https://www.googleapis.com/auth/calendar.events",
      aud: "https://oauth2.googleapis.com/token",
      iat: nowSeconds,
      exp: nowSeconds + 3600,
    };

    const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
    const signer = createSign("RSA-SHA256");
    signer.update(unsigned);
    signer.end();
    const signature = signer.sign(privateKey);
    const assertion = `${unsigned}.${base64url(signature)}`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!tokenRes.ok) {
      throw new Error(`Google OAuth token request failed: HTTP ${tokenRes.status}`);
    }
    const tokenJson = (await tokenRes.json()) as { access_token: string };
    return tokenJson.access_token;
  }

  private async createLiveMeeting(params: MeetingCreationParams): Promise<MeetingSessionDetails> {
    const accessToken = await this.getAccessToken();
    const endTime = new Date(params.startTimeUtc.getTime() + params.durationMinutes * 60000);

    const eventRes = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: params.classGroupName,
          start: { dateTime: params.startTimeUtc.toISOString(), timeZone: "UTC" },
          end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
          conferenceData: {
            createRequest: {
              requestId: `${params.sessionId}-${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );
    if (!eventRes.ok) {
      throw new Error(`Google Calendar event creation failed: HTTP ${eventRes.status}`);
    }
    const eventJson = (await eventRes.json()) as {
      hangoutLink?: string;
      conferenceData?: { entryPoints?: Array<{ entryPointType: string; uri: string }> };
    };

    const meetLink =
      eventJson.hangoutLink ??
      eventJson.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri;
    if (!meetLink) {
      throw new Error("Google Calendar event created but no Meet link was returned");
    }

    return {
      sessionId: params.sessionId,
      topic: params.classGroupName,
      joinUrlStudent: meetLink,
      hostUrlTeacher: meetLink,
      provider: "MEET",
      createdAt: new Date(),
      isMock: false,
      notes: "تم إنشاء غرفة Google Meet عبر Google Calendar API",
    };
  }

  private createSandboxMeeting(params: MeetingCreationParams): MeetingSessionDetails {
    const spaceCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

    return {
      sessionId: params.sessionId,
      topic: params.classGroupName,
      joinUrlStudent: `https://meet.sandbox.arabickidsacademy.internal/${spaceCode}?role=student`,
      hostUrlTeacher: `https://meet.sandbox.arabickidsacademy.internal/${spaceCode}?role=teacher`,
      provider: "MEET",
      createdAt: new Date(),
      isMock: true,
      notes: "محاكي Google Meet (بيئة التطوير - مفاتيح Google API غير معينة أو تعذر الاتصال الحي)",
    };
  }
}
