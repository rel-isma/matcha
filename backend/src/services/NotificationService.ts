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

    // Emit real-time notification via Socket.IO
    if (this.io) {
      this.io.to(userId).emit('notification', notification);
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

  static async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return NotificationModel.findByUserId(userId, limit);
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
