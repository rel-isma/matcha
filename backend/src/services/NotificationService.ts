import { NotificationModel } from '../models/Notification';
import { NotificationType, Notification } from '../types';
import { Server as SocketIOServer } from 'socket.io';

export class NotificationService {
  private static io: SocketIOServer | null = null;

  static setSocketIO(io: SocketIOServer) {
    this.io = io;
  }

  static async createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    link?: string,
    fromUserId?: string
  ): Promise<Notification> {
    const notification = await NotificationModel.create({
      userId,
      type,
      message,
      ...(link && { link }),
      ...(fromUserId && { fromUserId })
    });

    // Fetch the complete notification data with user details for real-time emission
    const completeNotification = await NotificationModel.findById(notification.id);

    // Emit real-time notification via Socket.IO with complete data including fromUserAvatar
    if (this.io && completeNotification) {
      this.io.to(userId).emit('notification', completeNotification);
    }

    return notification;
  }

  static async notifyLikeReceived(
    toUserId: string,
    fromUserId: string,
    fromUsername: string
  ): Promise<Notification> {
    return this.createNotification(
      toUserId,
      'like_received',
      `${fromUsername} liked your profile`,
      `/profile/${fromUsername}`,
      fromUserId
    );
  }

  static async notifyProfileView(
    viewedUserId: string,
    viewerUserId: string,
    viewerUsername: string
  ): Promise<Notification> {
    return this.createNotification(
      viewedUserId,
      'profile_view',
      `${viewerUsername} viewed your profile`,
      `/profile/${viewerUsername}`,
      viewerUserId
    );
  }

  static async notifyMatch(
    userId: string,
    matchedUserId: string,
    matchedUsername: string
  ): Promise<Notification> {
    return this.createNotification(
      userId,
      'match',
      `You and ${matchedUsername} liked each other!`,
      `/profile/${matchedUsername}`,
      matchedUserId
    );
  }

  static async notifyUnlike(
    toUserId: string,
    fromUserId: string,
    fromUsername: string
  ): Promise<Notification> {
    return this.createNotification(
      toUserId,
      'unlike',
      `${fromUsername} unliked you`,
      undefined,
      fromUserId
    );
  }

  static async notifyNewMessage(
    recipientId: string,
    senderId: string,
    senderUsername: string
  ): Promise<Notification> {
    // Avoid spamming: keep at most one unread "message" notification per sender/recipient
    const existing = await NotificationModel.findUnreadByTypeForUser(
      recipientId,
      senderId,
      'message'
    );

    if (existing) {
      return existing;
    }

    return this.createNotification(
      recipientId,
      'message',
      `${senderUsername} sent you a new message`,
      `/chat?user=${encodeURIComponent(senderUsername)}`,
      senderId
    );
  }

  static async getUserNotifications(userId: string, limit: number = 10, offset: number = 0): Promise<{
    notifications: Notification[];
    total: number;
    hasMore: boolean;
  }> {
    return NotificationModel.findByUserId(userId, limit, offset);
  }

  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    return NotificationModel.markAsRead(notificationId, userId);
  }

  static async markAllAsRead(userId: string): Promise<number> {
    return NotificationModel.markAllAsRead(userId);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.getUnreadCount(userId);
  }

  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    return NotificationModel.deleteNotification(notificationId, userId);
  }
}
