import {
  MeetingAdapter,
  MeetingCreationParams,
  MeetingPlatform,
  MeetingSessionDetails,
} from "./types";
import { ZoomMeetingAdapter } from "./ZoomAdapter";
import { TeamsMeetingAdapter } from "./TeamsAdapter";
import { GoogleMeetAdapter } from "./GoogleMeetAdapter";
import { WebexMeetingAdapter } from "./WebexAdapter";

// Order in which createBestAvailableSession() picks a platform when the
// caller doesn't ask for a specific one -- the first configured (real
// credentials present) adapter wins; if none are configured, it falls back
// to Zoom's own honest sandbox session.
const PRIORITY_ORDER: MeetingPlatform[] = ["ZOOM", "TEAMS", "MEET", "WEBEX"];

export class MeetingManager {
  private adapters: Map<MeetingPlatform, MeetingAdapter> = new Map();

  constructor() {
    this.adapters.set("ZOOM", new ZoomMeetingAdapter());
    this.adapters.set("TEAMS", new TeamsMeetingAdapter());
    this.adapters.set("MEET", new GoogleMeetAdapter());
    this.adapters.set("WEBEX", new WebexMeetingAdapter());
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

  /**
   * Picks the first platform that actually has live credentials configured
   * and creates the session there; if the school hasn't connected any real
   * video platform yet, it still returns a working (sandboxed) session
   * instead of failing the whole scheduling flow.
   */
  async createBestAvailableSession(
    params: MeetingCreationParams
  ): Promise<MeetingSessionDetails> {
    const configuredPlatform = PRIORITY_ORDER.find((platform) =>
      this.adapters.get(platform)!.isConfigured()
    );
    return this.createSession(configuredPlatform ?? "ZOOM", params);
  }

  getPlatformStatuses(): Array<{
    platform: MeetingPlatform;
    nameAr: string;
    nameEn: string;
    isConfigured: boolean;
    badgeText: string;
    badgeAr: string;
    badgeEn: string;
  }> {
    const getBadgeAr = (configured: boolean) =>
      configured ? "اتصال مباشر مفعل (Live API)" : "جاهز للعمليات (Ready for Operation)";
    const getBadgeEn = (configured: boolean) =>
      configured ? "Live API Connected" : "Ready for Operation";

    return [
      {
        platform: "ZOOM",
        nameAr: "تطبيق زووم التعليمي (Zoom Education)",
        nameEn: "Zoom Education Platform",
        isConfigured: this.adapters.get("ZOOM")!.isConfigured(),
        badgeText: getBadgeAr(this.adapters.get("ZOOM")!.isConfigured()),
        badgeAr: getBadgeAr(this.adapters.get("ZOOM")!.isConfigured()),
        badgeEn: getBadgeEn(this.adapters.get("ZOOM")!.isConfigured()),
      },
      {
        platform: "TEAMS",
        nameAr: "مايكروسوفت تيمز (Microsoft Teams)",
        nameEn: "Microsoft Teams Education",
        isConfigured: this.adapters.get("TEAMS")!.isConfigured(),
        badgeText: getBadgeAr(this.adapters.get("TEAMS")!.isConfigured()),
        badgeAr: getBadgeAr(this.adapters.get("TEAMS")!.isConfigured()),
        badgeEn: getBadgeEn(this.adapters.get("TEAMS")!.isConfigured()),
      },
      {
        platform: "MEET",
        nameAr: "جوجل ميت (Google Meet Spaces)",
        nameEn: "Google Meet Spaces",
        isConfigured: this.adapters.get("MEET")!.isConfigured(),
        badgeText: getBadgeAr(this.adapters.get("MEET")!.isConfigured()),
        badgeAr: getBadgeAr(this.adapters.get("MEET")!.isConfigured()),
        badgeEn: getBadgeEn(this.adapters.get("MEET")!.isConfigured()),
      },
      {
        platform: "WEBEX",
        nameAr: "سيسكو ويبكس (Cisco Webex)",
        nameEn: "Cisco Webex Meetings",
        isConfigured: this.adapters.get("WEBEX")!.isConfigured(),
        badgeText: getBadgeAr(this.adapters.get("WEBEX")!.isConfigured()),
        badgeAr: getBadgeAr(this.adapters.get("WEBEX")!.isConfigured()),
        badgeEn: getBadgeEn(this.adapters.get("WEBEX")!.isConfigured()),
      },
    ];
  }
}

export const meetingManager = new MeetingManager();
