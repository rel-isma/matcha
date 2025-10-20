import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await NotificationService.getUserNotifications(userId, limit);

      return res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const success = await NotificationService.markAsRead(id, userId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      return res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const count = await NotificationService.markAllAsRead(userId);

      return res.json({
        success: true,
        message: `${count} notifications marked as read`,
        data: { count }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read'
      });
    }
  }

  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const count = await NotificationService.getUnreadCount(userId);

      return res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count'
      });
    }
  }

  static async deleteNotification(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const success = await NotificationService.deleteNotification(id, userId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      return res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete notification'
      });
    }
  }
}
