export type ScheduledNotification = {
  id: number;
  sessionId: number;
  scheduledFor: number;
  notificationId?: string;
  createdAt: number;
};

export type CreateScheduledNotificationInput = Omit<ScheduledNotification, 'id' | 'createdAt'>;
export type UpdateScheduledNotificationInput = Partial<CreateScheduledNotificationInput> & { id: number };