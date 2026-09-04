import {
  MeetingAdapter,
  MeetingCreationParams,
  MeetingPlatform,
  MeetingSessionDetails,
} from "./types";
import { ZoomMeetingAdapter } from "./ZoomAdapter";
import { TeamsMeetingAdapter } from "./TeamsAdapter";
import { GoogleMeetAdapter } from "./GoogleMeetAdapter";

export class MeetingManager {
  private adapters: Map<MeetingPlatform, MeetingAdapter> = new Map();

  constructor() {
    this.adapters.set("ZOOM", new ZoomMeetingAdapter());
    this.adapters.set("TEAMS", new TeamsMeetingAdapter());
    this.adapters.set("MEET", new GoogleMeetAdapter());
  }

  getAdapter(platform: MeetingPlatform): MeetingAdapter {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return this.adapters.get("ZOOM")!;
    }
    return adapter;
  }

  async createSession(
    platform: MeetingPlatform,
    params: MeetingCreationParams
  ): Promise<MeetingSessionDetails> {
    const adapter = this.getAdapter(platform);
    return adapter.createSession(params);
  }

  getPlatformStatuses(): Array<{
    platform: MeetingPlatform;
    nameAr: string;
    isConfigured: boolean;
    badgeText: string;
  }> {
    return [
      {
        platform: "ZOOM",
        nameAr: "تطبيق زووم التعليمي (Zoom Education)",
        isConfigured: this.adapters.get("ZOOM")!.isConfigured(),
        badgeText: this.adapters.get("ZOOM")!.isConfigured()
          ? "اتصال مباشر مفعل (Live API)"
          : "محاكي بيئة التطوير (Dev Sandbox)",
      },
      {
        platform: "TEAMS",
        nameAr: "مايكروسوفت تيمز (Microsoft Teams)",
        isConfigured: this.adapters.get("TEAMS")!.isConfigured(),
        badgeText: this.adapters.get("TEAMS")!.isConfigured()
          ? "اتصال مباشر مفعل (Live API)"
          : "محاكي بيئة التطوير (Dev Sandbox)",
      },
      {
        platform: "MEET",
        nameAr: "جوجل ميت (Google Meet Spaces)",
        isConfigured: this.adapters.get("MEET")!.isConfigured(),
        badgeText: this.adapters.get("MEET")!.isConfigured()
          ? "اتصال مباشر مفعل (Live API)"
          : "محاكي بيئة التطوير (Dev Sandbox)",
      },
    ];
  }
}

export const meetingManager = new MeetingManager();
