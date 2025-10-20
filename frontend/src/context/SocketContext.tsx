// Socket Context
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  isConnected: boolean;
  onlineUsers: Set<number>;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, message: string) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize Socket.IO connection with cookies (withCredentials)
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      withCredentials: true, // Send cookies with the connection
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socketInstance.on('user:online', ({ userId }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socketInstance.on('user:offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('room:join', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('room:leave', roomId);
    }
  };

  const sendMessage = (roomId: string, message: string) => {
    if (socket) {
      socket.emit('message:send', { roomId, message });
    }
  };

  const startTyping = (roomId: string) => {
    if (socket) {
      socket.emit('typing:start', roomId);
    }
  };

  const stopTyping = (roomId: string) => {
    if (socket) {
      socket.emit('typing:stop', roomId);
    }
  };

  const value: SocketContextType = {
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    socket
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
