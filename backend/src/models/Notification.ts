import pool from '../config/database';
import { Notification, CreateNotificationInput } from '../types';

export class NotificationModel {
  static async create(notificationData: CreateNotificationInput): Promise<Notification> {
    const query = `
      INSERT INTO notifications (user_id, type, message, link, from_user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id, 
        user_id as "userId", 
        type, 
        message, 
        link, 
        from_user_id as "fromUserId",
        is_read as "isRead", 
        created_at as "createdAt"
    `;
    
    const values = [
      notificationData.userId,
      notificationData.type,
      notificationData.message,
      notificationData.link || null,
      notificationData.fromUserId || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId: string, limit: number = 10, offset: number = 0): Promise<{
    notifications: Notification[];
    total: number;
    hasMore: boolean;
  }> {
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1
    `;
    const countResult = await pool.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated notifications
    const query = `
      SELECT 
        n.id, 
        n.user_id as "userId", 
        n.type, 
        n.message, 
        n.link, 
        n.from_user_id as "fromUserId",
        n.is_read as "isRead", 
        n.created_at as "createdAt",
        u.username as "fromUsername",
        u.first_name as "fromFirstName",
        u.last_name as "fromLastName",
        pp.url as "fromUserAvatar"
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN profile_pictures pp ON p.id = pp.profile_id AND pp.is_profile_pic = true
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    const notifications = result.rows;
    const hasMore = offset + limit < total;

    return {
      notifications,
      total,
      hasMore
    };
  }

  static async findById(notificationId: string): Promise<Notification | null> {
    const query = `
      SELECT 
        n.id, 
        n.user_id as "userId", 
        n.type, 
        n.message, 
        n.link, 
        n.from_user_id as "fromUserId",
        n.is_read as "isRead", 
        n.created_at as "createdAt",
        u.username as "fromUsername",
        u.first_name as "fromFirstName",
        u.last_name as "fromLastName",
        pp.url as "fromUserAvatar"
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN profile_pictures pp ON p.id = pp.profile_id AND pp.is_profile_pic = true
      WHERE n.id = $1
    `;
    
    const result = await pool.query(query, [notificationId]);
    return result.rows[0] || null;
  }

  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE notifications 
      SET is_read = true
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [notificationId, userId]);
    return result.rows.length > 0;
  }

  static async markAllAsRead(userId: string): Promise<number> {
    const query = `
      UPDATE notifications 
      SET is_read = true
      WHERE user_id = $1 AND is_read = false
      RETURNING id
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rowCount || 0;
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const query = `
      DELETE FROM notifications
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [notificationId, userId]);
    return result.rows.length > 0;
  }

  static async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const query = `
      DELETE FROM notifications
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
      RETURNING id
    `;
    
    const result = await pool.query(query);
    return result.rowCount || 0;
  }
}
