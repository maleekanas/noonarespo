export type MeetingPlatform = "MOCK" | "ZOOM" | "TEAMS" | "MEET" | "WEBEX";

export interface MeetingSessionDetails {
  sessionId: string;
  topic: string;
  joinUrlStudent: string;
  hostUrlTeacher: string;
  provider: MeetingPlatform;
  createdAt: Date;
  isMock: boolean;
  notes?: string;
}

export interface MeetingCreationParams {
  sessionId: string;
  classGroupName: string;
  teacherName: string;
  startTimeUtc: Date;
  durationMinutes: number;
}

export interface MeetingAdapter {
  platformName: MeetingPlatform;
  isConfigured(): boolean;
  createSession(params: MeetingCreationParams): Promise<MeetingSessionDetails>;
}
