// Socket Context
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SocketContextType {
  isConnected: boolean;
  onlineUsers: Set<number>;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, message: string) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Mock socket connection
    const timer = setTimeout(() => {
      setIsConnected(true);
      // Simulate some online users
      setOnlineUsers(new Set([2, 3, 5, 8, 12]));
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const joinRoom = (roomId: string) => {
    console.log(`Joining room: ${roomId}`);
    // In a real app, emit socket event to join room
  };

  const leaveRoom = (roomId: string) => {
    console.log(`Leaving room: ${roomId}`);
    // In a real app, emit socket event to leave room
  };

  const sendMessage = (roomId: string, message: string) => {
    console.log(`Sending message to room ${roomId}:`, message);
    // In a real app, emit socket event to send message
  };

  const startTyping = (roomId: string) => {
    console.log(`Started typing in room: ${roomId}`);
    // In a real app, emit socket event for typing indicator
  };

  const stopTyping = (roomId: string) => {
    console.log(`Stopped typing in room: ${roomId}`);
    // In a real app, emit socket event to stop typing indicator
  };

  const value: SocketContextType = {
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping
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
