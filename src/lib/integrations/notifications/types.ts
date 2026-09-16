export type NotificationChannel = "WHATSAPP" | "SMS" | "EMAIL";

export interface NotificationPayload {
  recipientContact: string; // Phone number or email address
  recipientName: string;
  eventName:
    | "CLASS_STARTING_SOON"
    | "ATTENDANCE_ALERT"
    | "HOMEWORK_GRADED"
    | "CONFERENCE_CONFIRMED"
    | "INVOICE_ISSUED"
    | "PASSWORD_RESET"
    | "B2B_INQUIRY";
  titleAr: string;
  bodyAr: string;
  actionUrl?: string;
  metadata?: Record<string, string | number>;
}

export interface NotificationDispatchResult {
  messageId: string;
  channel: NotificationChannel;
  recipientContact: string;
  isDelivered: boolean;
  isMock: boolean;
  sentAt: Date;
  statusMessage: string;
}

export interface NotificationChannelAdapter {
  readonly channel: NotificationChannel;
  isConfigured(): boolean;
  send(payload: NotificationPayload): Promise<NotificationDispatchResult>;
}
