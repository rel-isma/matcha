import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from '../utils/auth';
import { UserModel } from '../models/User';

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
  });

  return io;
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
