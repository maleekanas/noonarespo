import { communicationRepository, DomainMessage, DomainMeetingRequest } from "../repositories/CommunicationRepository";
import { academicRepository } from "../repositories/AcademicRepository";
import { userRepository } from "../repositories/UserRepository";
import { meetingManager } from "@/lib/integrations/meetings/MeetingManager";

export class CommunicationService {
  /**
   * Verifies if a parent is authorized to message a teacher (must share an active student enrollment).
   */
  async canCommunicate(parentId: string, teacherId: string): Promise<boolean> {
    const children = await userRepository.getLinkedChildren(parentId);
    if (children.length === 0) return false;

    const teacherAssignments = await academicRepository.getTeacherAssignmentsByTeacherId(teacherId);
    if (teacherAssignments.length === 0) return false;

    const teacherClassGroupIds = new Set(teacherAssignments.map((ta) => ta.classGroupId));

    for (const child of children) {
      const enrollments = await academicRepository.getEnrollmentsByStudentId(child.id);
      const sharesClass = enrollments.some((e) => teacherClassGroupIds.has(e.classGroupId));
      if (sharesClass) return true;
    }

    return false;
  }

  /**
   * Sends a message in a conversation after verifying authorization.
   */
  async sendMessage(params: {
    parentId: string;
    teacherId: string;
    studentId: string;
    senderId: string;
    senderRole: "PARENT" | "TEACHER";
    content: string;
  }): Promise<DomainMessage> {
    const authorized = await this.canCommunicate(params.parentId, params.teacherId);
    if (!authorized) {
      throw new Error("COMMUNICATION_UNAUTHORIZED: Parent and teacher do not share an active student enrollment");
    }

    if (!params.content || params.content.trim().length === 0) {
      throw new Error("EMPTY_MESSAGE: Message content cannot be empty");
    }

    const conv = await communicationRepository.getOrCreateConversation(
      params.parentId,
      params.teacherId,
      params.studentId
    );

    const message = await communicationRepository.addMessage(
      conv.id,
      params.senderId,
      params.senderRole,
      params.content.trim()
    );

    // Notify the recipient
    const recipientUserId = params.senderRole === "PARENT" ? params.teacherId : params.parentId;
    await communicationRepository.addNotification({
      userId: recipientUserId,
      title: params.senderRole === "PARENT" ? "رسالة جديدة من ولي الأمر" : "رسالة جديدة من المعلم",
      message: params.content.slice(0, 100) + (params.content.length > 100 ? "..." : ""),
      type: "NEW_MESSAGE",
      linkUrl: params.senderRole === "PARENT" ? "/ar/teacher/messages" : "/ar/parent/messages",
    });

    return message;
  }

  /**
   * Parent requests a 15-minute conference with a teacher.
   */
  async requestMeeting(params: {
    parentId: string;
    teacherId: string;
    studentId: string;
    requestedTimeUtc: Date;
    notes?: string;
  }): Promise<DomainMeetingRequest> {
    const authorized = await this.canCommunicate(params.parentId, params.teacherId);
    if (!authorized) {
      throw new Error("MEETING_UNAUTHORIZED: Parent and teacher do not share an active student enrollment");
    }

    const meeting = await communicationRepository.createMeetingRequest(params);

    // Notify teacher of the incoming request
    await communicationRepository.addNotification({
      userId: params.teacherId,
      title: "طلب اجتماع جديد من ولي الأمر",
      message: `طلب ولي أمر الطالب مقابلة فردية (15 دقيقة) لمناقشة التطور الأكاديمي.`,
      type: "MEETING_UPDATE",
      linkUrl: "/ar/teacher/meetings",
    });

    return meeting;
  }

  /**
   * Teacher confirms a meeting request and generates a virtual conference room.
   */
  async confirmMeeting(meetingId: string): Promise<DomainMeetingRequest> {
    const session = await meetingManager.createBestAvailableSession({
      sessionId: meetingId,
      classGroupName: "Parent-Teacher Conference (15 min)",
      teacherName: "Teacher",
      startTimeUtc: new Date(),
      durationMinutes: 15,
    });

    const updated = await communicationRepository.updateMeetingStatus(
      meetingId,
      "CONFIRMED",
      session.joinUrlStudent
    );

    // Notify parent
    await communicationRepository.addNotification({
      userId: updated.parentId,
      title: "تم تأكيد موعد الاجتماع مع المعلم",
      message: `تم تأكيد اجتماعك الفردي بنجاح. تم تجهيز رابط الغرفة الافتراضية.`,
      type: "MEETING_UPDATE",
      linkUrl: "/ar/parent/meetings",
    });

    return updated;
  }
}

export const communicationService = new CommunicationService();
