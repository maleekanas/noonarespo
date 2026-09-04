import { communicationRepository, DomainNotification } from "../repositories/CommunicationRepository";

export class NotificationService {
  async getNotifications(userId: string): Promise<DomainNotification[]> {
    return await communicationRepository.getNotificationsByUserId(userId);
  }

  async markAllRead(userId: string): Promise<void> {
    await communicationRepository.markAllNotificationsRead(userId);
  }

  async notifyAttendance(params: {
    parentId: string;
    studentName: string;
    status: string;
  }) {
    await communicationRepository.addNotification({
      userId: params.parentId,
      title: "تحديث الحضور والغياب",
      message: `تم رصد حالة حضور ${params.studentName}: ${params.status}.`,
      type: "ATTENDANCE_ALERT",
      linkUrl: "/ar/parent",
    });
  }

  async notifyHomeworkGraded(params: {
    parentId: string;
    studentName: string;
    homeworkTitle: string;
    score: number;
  }) {
    await communicationRepository.addNotification({
      userId: params.parentId,
      title: "تم تصحيح الواجب",
      message: `تم تصحيح واجب «${params.homeworkTitle}» لـ ${params.studentName} بالدرجة: ${params.score}/100.`,
      type: "HOMEWORK_GRADED",
      linkUrl: "/ar/parent",
    });
  }

  async notifyClassPerformance(params: {
    parentId: string;
    studentName: string;
    stars: number;
    notes: string;
  }) {
    await communicationRepository.addNotification({
      userId: params.parentId,
      title: "تقييم الحصة المباشرة ⭐",
      message: `منح المعلم ${params.studentName} ${params.stars} نجوم تشجيعية في الحصة: «${params.notes}»`,
      type: "LIVE_SESSION_EVALUATION",
      linkUrl: "/ar/parent/recommendations",
    });
  }
}

export const notificationService = new NotificationService();
