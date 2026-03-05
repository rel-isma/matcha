import pool from '../config/database';
import { Message, Conversation } from '../types';

export class MessageModel {
  // Send a new message
  static async createMessage(
    senderId: string,
    recipientId: string,
    content: string
  ): Promise<Message> {
    const query = `
      INSERT INTO messages (sender_id, recipient_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, sender_id, recipient_id, content, is_read, read_at, created_at
    `;
    
    const result = await pool.query(query, [senderId, recipientId, content]);
    return this.mapMessageFromDb(result.rows[0]);
  }

  // Get messages between two users (conversation)
  static async getConversation(
    userId1: string,
    userId2: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    const query = `
      SELECT id, sender_id, recipient_id, content, is_read, read_at, created_at
      FROM messages
      WHERE (sender_id = $1 AND recipient_id = $2)
         OR (sender_id = $2 AND recipient_id = $1)
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
    `;
    
    const result = await pool.query(query, [userId1, userId2, limit, offset]);
    return result.rows.map(this.mapMessageFromDb).reverse(); // Reverse to get chronological order
  }

  // Get all conversations for a user
  static async getConversations(userId: string): Promise<Conversation[]> {
    const query = `
      WITH latest_messages AS (
        SELECT DISTINCT ON (
          CASE 
            WHEN sender_id = $1 THEN recipient_id
            ELSE sender_id
          END
        )
        id,
        sender_id,
        recipient_id,
        content,
        is_read,
        created_at,
        CASE 
          WHEN sender_id = $1 THEN recipient_id
          ELSE sender_id
        END as other_user_id
        FROM messages
        WHERE sender_id = $1 OR recipient_id = $1
        ORDER BY 
          CASE 
            WHEN sender_id = $1 THEN recipient_id
            ELSE sender_id
          END,
          created_at DESC
      ),
      unread_counts AS (
        SELECT 
          sender_id,
          COUNT(*) as unread_count
        FROM messages
        WHERE recipient_id = $1 AND is_read = FALSE
        GROUP BY sender_id
      )
      SELECT 
        lm.other_user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.is_online,
        u.last_seen,
        pp.url as profile_picture,
        lm.content as last_message,
        lm.sender_id as last_message_sender_id,
        lm.created_at as last_message_at,
        COALESCE(uc.unread_count, 0) as unread_count,
        (b.id IS NOT NULL) as is_blocked
      FROM latest_messages lm
      JOIN users u ON u.id = lm.other_user_id
      LEFT JOIN profile_pictures pp ON pp.profile_id = (
        SELECT id FROM profiles WHERE user_id = u.id
      ) AND pp.is_profile_pic = TRUE
      LEFT JOIN unread_counts uc ON uc.sender_id = lm.other_user_id
      LEFT JOIN blocks b ON (b.blocker_id = $1 AND b.blocked_id = lm.other_user_id)
        OR (b.blocker_id = lm.other_user_id AND b.blocked_id = $1)
      ORDER BY lm.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows.map((row: any) => {
      const isBlocked = !!row.is_blocked;
      return {
        userId: row.other_user_id,
        username: isBlocked ? 'matcha_user' : row.username,
        firstName: isBlocked ? 'Matcha' : row.first_name,
        lastName: isBlocked ? 'User' : row.last_name,
        isOnline: isBlocked ? false : row.is_online,
        lastSeen: isBlocked ? undefined : row.last_seen,
        profilePicture: isBlocked ? undefined : row.profile_picture,
        lastMessage: row.last_message,
        lastMessageSenderId: row.last_message_sender_id,
        lastMessageAt: row.last_message_at,
        unreadCount: parseInt(row.unread_count) || 0,
        isBlocked: isBlocked ? true : undefined
      };
    });
  }

  // Mark messages as read
  static async markAsRead(recipientId: string, senderId: string): Promise<void> {
    const query = `
      UPDATE messages
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE recipient_id = $1 AND sender_id = $2 AND is_read = FALSE
    `;
    
    await pool.query(query, [recipientId, senderId]);
  }

  // Get unread message count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM messages
      WHERE recipient_id = $1 AND is_read = FALSE
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count) || 0;
  }

  // Delete a message (only sender can delete)
  static async deleteMessage(messageId: string, senderId: string): Promise<boolean> {
    const query = `
      DELETE FROM messages
      WHERE id = $1 AND sender_id = $2
    `;
    
    const result = await pool.query(query, [messageId, senderId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Check if two users have a connection (mutual like) - required to message
  static async hasConnection(userId1: string, userId2: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM connections
      WHERE (user_one = $1 AND user_two = $2)
         OR (user_one = $2 AND user_two = $1)
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId1, userId2]);
    return result.rows.length > 0;
  }

  // Check if user is blocked
  static async isBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM blocks
      WHERE (blocker_id = $1 AND blocked_id = $2)
         OR (blocker_id = $2 AND blocked_id = $1)
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId, targetUserId]);
    return result.rows.length > 0;
  }

  // Helper to map database row to Message type
  private static mapMessageFromDb(row: any): Message {
    return {
      id: row.id,
      senderId: row.sender_id,
      recipientId: row.recipient_id,
      content: row.content,
      isRead: row.is_read,
      readAt: row.read_at,
      createdAt: row.created_at
    };
  }
}
