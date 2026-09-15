import { prisma } from "@/lib/database/prisma";

export type NotificationType =
  | "ATTENDANCE_ALERT"
  | "HOMEWORK_GRADED"
  | "NEW_MESSAGE"
  | "MEETING_UPDATE"
  | "LIVE_SESSION_EVALUATION";

export type MeetingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface DomainConversation {
  id: string;
  parentId: string;
  teacherId: string;
  studentId: string;
  updatedAt: Date;
}

export interface DomainMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "PARENT" | "TEACHER";
  content: string;
  sentAt: Date;
  isRead: boolean;
}

export interface DomainMeetingRequest {
  id: string;
  parentId: string;
  teacherId: string;
  studentId: string;
  requestedTimeUtc: Date;
  status: MeetingStatus;
  notes?: string;
  meetingUrl?: string;
  createdAt: Date;
}

export interface DomainNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  linkUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CompetencyScore {
  skillKey: "listening" | "speaking" | "reading" | "writing" | "tajweed";
  nameAr: string;
  nameEn: string;
  scorePercentage: number; // 0-100
  masteryLevelAr: string;
}

class CommunicationRepository {
  // --- Conversations & Messages ---
  async getOrCreateConversation(parentId: string, teacherId: string, studentId: string): Promise<DomainConversation> {
    const existing = await prisma.conversation.findUnique({
      where: { parentId_teacherId_studentId: { parentId, teacherId, studentId } },
    });
    if (existing) return this.toConversation(existing);

    const created = await prisma.conversation.create({
      data: { parentId, teacherId, studentId },
    });
    return this.toConversation(created);
  }

  async getConversationsByParentId(parentId: string): Promise<DomainConversation[]> {
    const rows = await prisma.conversation.findMany({ where: { parentId } });
    return rows.map((row) => this.toConversation(row));
  }

  async getConversationsByTeacherId(teacherId: string): Promise<DomainConversation[]> {
    const rows = await prisma.conversation.findMany({ where: { teacherId } });
    return rows.map((row) => this.toConversation(row));
  }

  async getMessages(conversationId: string): Promise<DomainMessage[]> {
    const rows = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { sentAt: "asc" },
    });
    return rows.map((row) => this.toMessage(row));
  }

  async addMessage(
    conversationId: string,
    senderId: string,
    senderRole: "PARENT" | "TEACHER",
    content: string
  ): Promise<DomainMessage> {
    const row = await prisma.message.create({
      data: { conversationId, senderId, senderRole, content },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return this.toMessage(row);
  }

  // --- Meetings ---
  async createMeetingRequest(data: {
    parentId: string;
    teacherId: string;
    studentId: string;
    requestedTimeUtc: Date;
    notes?: string;
  }): Promise<DomainMeetingRequest> {
    const row = await prisma.meetingRequest.create({
      data: {
        parentId: data.parentId,
        teacherId: data.teacherId,
        studentId: data.studentId,
        requestedTimeUtc: data.requestedTimeUtc,
        status: "PENDING",
        notes: data.notes,
      },
    });
    return this.toMeetingRequest(row);
  }

  async getMeetingRequestsByParentId(parentId: string): Promise<DomainMeetingRequest[]> {
    const rows = await prisma.meetingRequest.findMany({ where: { parentId } });
    return rows.map((row) => this.toMeetingRequest(row));
  }

  async getMeetingRequestsByTeacherId(teacherId: string): Promise<DomainMeetingRequest[]> {
    const rows = await prisma.meetingRequest.findMany({ where: { teacherId } });
    return rows.map((row) => this.toMeetingRequest(row));
  }

  async updateMeetingStatus(
    meetingId: string,
    status: MeetingStatus,
    meetingUrl?: string
  ): Promise<DomainMeetingRequest> {
    const existing = await prisma.meetingRequest.findUnique({ where: { id: meetingId } });
    if (!existing) {
      throw new Error(`MEETING_NOT_FOUND: Meeting ${meetingId} does not exist`);
    }

    const row = await prisma.meetingRequest.update({
      where: { id: meetingId },
      data: {
        status,
        ...(meetingUrl ? { meetingUrl } : {}),
      },
    });
    return this.toMeetingRequest(row);
  }

  // --- Notifications ---
  async addNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    linkUrl?: string;
  }): Promise<DomainNotification> {
    const row = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        linkUrl: data.linkUrl,
      },
    });
    return this.toNotification(row);
  }

  async getNotificationsByUserId(userId: string): Promise<DomainNotification[]> {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toNotification(row));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  private toConversation(row: {
    id: string;
    parentId: string;
    teacherId: string;
    studentId: string;
    updatedAt: Date;
  }): DomainConversation {
    return {
      id: row.id,
      parentId: row.parentId,
      teacherId: row.teacherId,
      studentId: row.studentId,
      updatedAt: row.updatedAt,
    };
  }

  private toMessage(row: {
    id: string;
    conversationId: string;
    senderId: string;
    senderRole: string;
    content: string;
    sentAt: Date;
    isRead: boolean;
  }): DomainMessage {
    return {
      id: row.id,
      conversationId: row.conversationId,
      senderId: row.senderId,
      senderRole: row.senderRole as "PARENT" | "TEACHER",
      content: row.content,
      sentAt: row.sentAt,
      isRead: row.isRead,
    };
  }

  private toMeetingRequest(row: {
    id: string;
    parentId: string;
    teacherId: string;
    studentId: string;
    requestedTimeUtc: Date;
    status: string;
    notes: string | null;
    meetingUrl: string | null;
    createdAt: Date;
  }): DomainMeetingRequest {
    return {
      id: row.id,
      parentId: row.parentId,
      teacherId: row.teacherId,
      studentId: row.studentId,
      requestedTimeUtc: row.requestedTimeUtc,
      status: row.status as MeetingStatus,
      notes: row.notes ?? undefined,
      meetingUrl: row.meetingUrl ?? undefined,
      createdAt: row.createdAt,
    };
  }

  private toNotification(row: {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    linkUrl: string | null;
    isRead: boolean;
    createdAt: Date;
  }): DomainNotification {
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      message: row.message,
      type: row.type as NotificationType,
      linkUrl: row.linkUrl ?? undefined,
      isRead: row.isRead,
      createdAt: row.createdAt,
    };
  }
}

export const communicationRepository = new CommunicationRepository();
