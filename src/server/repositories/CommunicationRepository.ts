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

class InMemoryCommunicationRepository {
  private conversations: Map<string, DomainConversation> = new Map();
  private messages: Map<string, DomainMessage> = new Map();
  private meetingRequests: Map<string, DomainMeetingRequest> = new Map();
  private notifications: Map<string, DomainNotification> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // 1. Seed Conversation between Parent (parent-1) and Teacher (teacher-1) for Student (student-1)
    const convId = "conv-parent1-teacher1";
    this.conversations.set(convId, {
      id: convId,
      parentId: "parent-1",
      teacherId: "teacher-1",
      studentId: "student-1",
      updatedAt: new Date(),
    });

    // Seed sample messages
    this.messages.set("msg-1", {
      id: "msg-1",
      conversationId: convId,
      senderId: "parent-1",
      senderRole: "PARENT",
      content: "السلام عليكم ورحمة الله وبركاته يا أستاذ أحمد، أود الاستفسار عن مدى استجابة زيد لأحكام التجويد في الحصة الأخيرة.",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: true,
    });

    this.messages.set("msg-2", {
      id: "msg-2",
      conversationId: convId,
      senderId: "teacher-1",
      senderRole: "TEACHER",
      content: "وعليكم السلام ورحمة الله وبركاته أبا زيد. ما شاء الله، زيد يبلي بلاءً حسناً جداً، ومخارج حروف القلقلة لديه أصبحت واضحة ومميزة. يحتاج فقط للاستمرار في قراءة الورد اليومي لمدة 5 دقائق.",
      sentAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      isRead: true,
    });

    // 2. Seed Meeting Request
    this.meetingRequests.set("meet-1", {
      id: "meet-1",
      parentId: "parent-1",
      teacherId: "teacher-1",
      studentId: "student-1",
      requestedTimeUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      status: "CONFIRMED",
      notes: "مناقشة خطة الانتقال إلى المستوى القرائي المتقدم (A2)",
      meetingUrl: "https://virtual-classroom.kidsarabicacademy.internal/conference/parent-teacher-conf-1",
      createdAt: new Date(),
    });

    // 3. Seed Notifications for Parent
    this.notifications.set("notif-1", {
      id: "notif-1",
      userId: "parent-1",
      title: "تم تسجيل الحضور بنجاح",
      message: "تم رصد حضور ابنكم «زيد» لحصة القراءة والطلاقة اليوم في تمام 04:00 م.",
      type: "ATTENDANCE_ALERT",
      linkUrl: "/ar/parent",
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    });

    this.notifications.set("notif-2", {
      id: "notif-2",
      userId: "parent-1",
      title: "تقييم جديد للواجب الصوتي",
      message: "قام الأستاذ أحمد المنصوري بتصحيح واجب «سورة الإخلاص» ومنح زيد 100/100 مع ملاحظات مشجعة.",
      type: "HOMEWORK_GRADED",
      linkUrl: "/ar/parent",
      isRead: false,
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
    });
  }

  // --- Conversations & Messages ---
  async getOrCreateConversation(parentId: string, teacherId: string, studentId: string): Promise<DomainConversation> {
    for (const conv of this.conversations.values()) {
      if (conv.parentId === parentId && conv.teacherId === teacherId && conv.studentId === studentId) {
        return conv;
      }
    }

    const id = `conv-${parentId}-${teacherId}`;
    const newConv: DomainConversation = {
      id,
      parentId,
      teacherId,
      studentId,
      updatedAt: new Date(),
    };
    this.conversations.set(id, newConv);
    return newConv;
  }

  async getConversationsByParentId(parentId: string): Promise<DomainConversation[]> {
    return Array.from(this.conversations.values()).filter((c) => c.parentId === parentId);
  }

  async getConversationsByTeacherId(teacherId: string): Promise<DomainConversation[]> {
    return Array.from(this.conversations.values()).filter((c) => c.teacherId === teacherId);
  }

  async getMessages(conversationId: string): Promise<DomainMessage[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }

  async addMessage(
    conversationId: string,
    senderId: string,
    senderRole: "PARENT" | "TEACHER",
    content: string
  ): Promise<DomainMessage> {
    const id = "msg-" + (this.messages.size + 1);
    const msg: DomainMessage = {
      id,
      conversationId,
      senderId,
      senderRole,
      content,
      sentAt: new Date(),
      isRead: false,
    };
    this.messages.set(id, msg);

    const conv = this.conversations.get(conversationId);
    if (conv) {
      conv.updatedAt = new Date();
      this.conversations.set(conversationId, conv);
    }

    return msg;
  }

  // --- Meetings ---
  async createMeetingRequest(data: {
    parentId: string;
    teacherId: string;
    studentId: string;
    requestedTimeUtc: Date;
    notes?: string;
  }): Promise<DomainMeetingRequest> {
    const id = "meet-" + (this.meetingRequests.size + 1);
    const req: DomainMeetingRequest = {
      id,
      parentId: data.parentId,
      teacherId: data.teacherId,
      studentId: data.studentId,
      requestedTimeUtc: data.requestedTimeUtc,
      status: "PENDING",
      notes: data.notes,
      createdAt: new Date(),
    };
    this.meetingRequests.set(id, req);
    return req;
  }

  async getMeetingRequestsByParentId(parentId: string): Promise<DomainMeetingRequest[]> {
    return Array.from(this.meetingRequests.values()).filter((m) => m.parentId === parentId);
  }

  async getMeetingRequestsByTeacherId(teacherId: string): Promise<DomainMeetingRequest[]> {
    return Array.from(this.meetingRequests.values()).filter((m) => m.teacherId === teacherId);
  }

  async updateMeetingStatus(
    meetingId: string,
    status: MeetingStatus,
    meetingUrl?: string
  ): Promise<DomainMeetingRequest> {
    const req = this.meetingRequests.get(meetingId);
    if (!req) {
      throw new Error(`MEETING_NOT_FOUND: Meeting ${meetingId} does not exist`);
    }
    req.status = status;
    if (meetingUrl) req.meetingUrl = meetingUrl;
    this.meetingRequests.set(meetingId, req);
    return req;
  }

  // --- Notifications ---
  async addNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    linkUrl?: string;
  }): Promise<DomainNotification> {
    const id = "notif-" + (this.notifications.size + 1);
    const notif: DomainNotification = {
      id,
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      linkUrl: data.linkUrl,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notif);
    return notif;
  }

  async getNotificationsByUserId(userId: string): Promise<DomainNotification[]> {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    for (const notif of this.notifications.values()) {
      if (notif.userId === userId) {
        notif.isRead = true;
        this.notifications.set(notif.id, notif);
      }
    }
  }
}

export const communicationRepository = new InMemoryCommunicationRepository();
