// Notification Context
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'like' | 'match' | 'message' | 'profile_view' | 'unlike' | 'report' | 'system';
  title: string;
  message: string;
  userId?: number;
  userPhoto?: string;
  userName?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Load initial mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'like',
        title: 'New Like!',
        message: 'Emma liked your profile',
        userId: 2,
        userName: 'Emma Wilson',
        userPhoto: '/images/avatars/user2.jpg',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'match',
        title: "It's a Match!",
        message: 'You and Sarah both liked each other',
        userId: 3,
        userName: 'Sarah Johnson',
        userPhoto: '/images/avatars/user3.jpg',
        isRead: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'message',
        title: 'New Message',
        message: 'Hey! How are you doing?',
        userId: 4,
        userName: 'Jessica Brown',
        userPhoto: '/images/avatars/user4.jpg',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'profile_view',
        title: 'Profile View',
        message: 'Alex viewed your profile',
        userId: 5,
        userName: 'Alex Davis',
        userPhoto: '/images/avatars/user5.jpg',
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
