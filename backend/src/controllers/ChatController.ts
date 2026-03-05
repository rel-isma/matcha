import { Request, Response } from 'express';
import { MessageModel } from '../models/Message';
import { ApiResponse } from '../types';

export class ChatController {
  // Get all conversations for the authenticated user
  static async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        } as ApiResponse);
        return;
      }

      const conversations = await MessageModel.getConversations(userId);

      res.json({
        success: true,
        data: conversations,
        message: 'Conversations retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve conversations',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  // Get messages for a specific conversation
  static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { otherUserId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        } as ApiResponse);
        return;
      }

      if (!otherUserId) {
        res.status(400).json({
          success: false,
          message: 'Other user ID is required'
        } as ApiResponse);
        return;
      }

      // Check if users have a connection
      const hasConnection = await MessageModel.hasConnection(userId, otherUserId);
      if (!hasConnection) {
        res.status(403).json({
          success: false,
          message: 'You can only message users you have matched with'
        } as ApiResponse);
        return;
      }

      // Check if blocked
      const isBlocked = await MessageModel.isBlocked(userId, otherUserId);
      if (isBlocked) {
        res.status(403).json({
          success: false,
          message: 'Cannot message this user'
        } as ApiResponse);
        return;
      }

      const messages = await MessageModel.getConversation(userId, otherUserId, limit, offset);

      // Mark messages as read
      await MessageModel.markAsRead(userId, otherUserId);

      res.json({
        success: true,
        data: messages,
        message: 'Messages retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve messages',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  // Send a message (via HTTP, though socket is preferred)
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { recipientId, content } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        } as ApiResponse);
        return;
      }

      if (!recipientId || !content) {
        res.status(400).json({
          success: false,
          message: 'Recipient ID and content are required'
        } as ApiResponse);
        return;
      }

      if (content.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Message content cannot be empty'
        } as ApiResponse);
        return;
      }

      if (content.length > 1000) {
        res.status(400).json({
          success: false,
          message: 'Message content is too long (max 1000 characters)'
        } as ApiResponse);
        return;
      }

      // Check if users have a connection
      const hasConnection = await MessageModel.hasConnection(userId, recipientId);
      if (!hasConnection) {
        res.status(403).json({
          success: false,
          message: 'You can only message users you have matched with'
        } as ApiResponse);
        return;
      }

      // Check if blocked
      const isBlocked = await MessageModel.isBlocked(userId, recipientId);
      if (isBlocked) {
        res.status(403).json({
          success: false,
          message: 'Cannot message this user'
        } as ApiResponse);
        return;
      }

      const message = await MessageModel.createMessage(userId, recipientId, content.trim());

      res.status(201).json({
        success: true,
        data: message,
        message: 'Message sent successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  // Mark messages as read
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { senderId } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        } as ApiResponse);
        return;
      }

      if (!senderId) {
        res.status(400).json({
          success: false,
          message: 'Sender ID is required'
        } as ApiResponse);
        return;
      }

      await MessageModel.markAsRead(userId, senderId);

      res.json({
        success: true,
        message: 'Messages marked as read'
      } as ApiResponse);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  // Get unread message count
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        } as ApiResponse);
        return;
      }

      const count = await MessageModel.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
        message: 'Unread count retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve unread count',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  // Delete a message
  static async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { messageId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        } as ApiResponse);
        return;
      }

      if (!messageId) {
        res.status(400).json({
          success: false,
          message: 'Message ID is required'
        } as ApiResponse);
        return;
      }

      const deleted = await MessageModel.deleteMessage(messageId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Message not found or you do not have permission to delete it'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Message deleted successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete message',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }
}
