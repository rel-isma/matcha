import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from '../utils/auth';
import { UserModel } from '../models/User';
import { MessageModel } from '../models/Message';
import { NotificationService } from '../services/NotificationService';

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL?.split(',').map(url => url.trim()) || ['http://localhost:3000'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // Extract token from cookies
      const cookies = socket.handshake.headers.cookie;
      
      if (!cookies) {
        return next(new Error('Authentication error - No cookies'));
      }

      // Parse cookies to get accessToken
      const cookieMap: { [key: string]: string } = {};
      cookies.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookieMap[name] = value;
        }
      });

      const token = cookieMap['accessToken'];
      
      if (!token) {
        return next(new Error('Authentication error - No access token'));
      }

      const decoded = verifyToken(token);
      
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      // Attach user info to socket
      socket.data.userId = decoded.userId;
      socket.data.username = decoded.username;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;
    const username = socket.data.username;

    console.log(`User connected: ${username} (${userId})`);

    // Join user's personal room for receiving notifications
    socket.join(userId);

    // Update user online status
    try {
      await updateOnlineStatus(userId, true);
    } catch (error) {
      console.error('Error updating online status:', error);
    }

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${username} (${userId})`);
      
      try {
        await updateOnlineStatus(userId, false);
      } catch (error) {
        console.error('Error updating offline status:', error);
      }
    });

    // Handle explicit online/offline status changes
    socket.on('status:online', async () => {
      try {
        await updateOnlineStatus(userId, true);
        socket.broadcast.emit('user:online', { userId, username });
      } catch (error) {
        console.error('Error setting online status:', error);
      }
    });

    socket.on('status:offline', async () => {
      try {
        await updateOnlineStatus(userId, false);
        socket.broadcast.emit('user:offline', { userId, username });
      } catch (error) {
        console.error('Error setting offline status:', error);
      }
    });

    // Chat events
    socket.on('chat:join', (otherUserId: string) => {
      const roomId = getRoomId(userId, otherUserId);
      socket.join(roomId);
      console.log(`User ${username} joined chat room: ${roomId}`);
    });

    socket.on('chat:leave', (otherUserId: string) => {
      const roomId = getRoomId(userId, otherUserId);
      socket.leave(roomId);
      console.log(`User ${username} left chat room: ${roomId}`);
    });

    socket.on('chat:message', async (data: { recipientId: string; content: string }) => {
      try {
        const { recipientId, content } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('chat:error', { message: 'Message content cannot be empty' });
          return;
        }

        if (content.length > 1000) {
          socket.emit('chat:error', { message: 'Message is too long' });
          return;
        }

        // Check if users have a connection
        const hasConnection = await MessageModel.hasConnection(userId, recipientId);
        if (!hasConnection) {
          socket.emit('chat:error', { message: 'You can only message users you have matched with' });
          return;
        }

        // Check if blocked
        const isBlocked = await MessageModel.isBlocked(userId, recipientId);
        if (isBlocked) {
          socket.emit('chat:error', { message: 'Cannot message this user' });
          return;
        }

        // Create message in database
        const message = await MessageModel.createMessage(userId, recipientId, content.trim());

        // Send to sender (confirmation)
        socket.emit('chat:message', message);

        // Send to recipient (if online)
        const roomId = getRoomId(userId, recipientId);
        socket.to(roomId).emit('chat:message', message);

        // Also send to recipient's personal room for chat-specific notifications
        io.to(recipientId).emit('chat:new-message', {
          ...message,
          senderUsername: username
        });

        // And create a general notification entry (one unread per sender/recipient)
        try {
          await NotificationService.notifyNewMessage(recipientId, userId, username);
        } catch (notifyError) {
          console.error('Error creating message notification:', notifyError);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    socket.on('chat:typing', (recipientId: string) => {
      const roomId = getRoomId(userId, recipientId);
      socket.to(roomId).emit('chat:typing', { userId, username });
    });

    socket.on('chat:stop-typing', (recipientId: string) => {
      const roomId = getRoomId(userId, recipientId);
      socket.to(roomId).emit('chat:stop-typing', { userId, username });
    });

    socket.on('chat:mark-read', async (senderId: string) => {
      try {
        await MessageModel.markAsRead(userId, senderId);
        
        // Notify sender that messages were read
        io.to(senderId).emit('chat:messages-read', { readerId: userId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
  });

  return io;
}

// Helper function to create consistent room IDs for two users
function getRoomId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

async function updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
  const pool = (await import('../config/database')).default;
  const query = `
    UPDATE users 
    SET is_online = $1, last_seen = CURRENT_TIMESTAMP
    WHERE id = $2
  `;
  await pool.query(query, [isOnline, userId]);
}
