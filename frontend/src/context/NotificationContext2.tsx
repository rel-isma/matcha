'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { Notification } from '@/types';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
  fetchNotifications: (reset?: boolean) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

// Create axios instance with cookie credentials (same base URL as other API clients)
const notificationApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const { socket } = useSocket();
  const { user } = useAuth();

  const fetchNotifications = useCallback(async (reset = true) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const page = reset ? 1 : currentPage + 1;
      const response = await notificationApi.get(`/notifications?page=${page}&limit=10`);

      if (response.data.success) {
        const { notifications: newNotifications, pagination } = response.data.data;
        
        if (reset) {
          setNotifications(newNotifications);
          setCurrentPage(1);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
          setCurrentPage(page);
        }
        
        setHasMore(pagination.hasMore);
        setTotalPages(pagination.totalPages);
        setTotal(pagination.total);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage]);

  const loadMoreNotifications = useCallback(async () => {
    if (!user || isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      
      const nextPage = currentPage + 1;
      const response = await notificationApi.get(`/notifications?page=${nextPage}&limit=10`);

      if (response.data.success) {
        const { notifications: newNotifications, pagination } = response.data.data;
        // Deduplicate by id so we never have duplicate keys (e.g. same notif from socket + pagination)
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const toAdd = newNotifications.filter((n: Notification) => !existingIds.has(n.id));
          return [...prev, ...toAdd];
        });
        setCurrentPage(nextPage);
        setHasMore(pagination.hasMore);
        
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingMore(false);
    }
  }, [user, currentPage, isLoadingMore, hasMore]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.patch(`/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.patch('/notifications/mark-all-read');

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch {
      // ignore
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationApi.delete(`/notifications/${notificationId}`);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch {
      // ignore
    }
  };

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications(true);
    } else {
      setNotifications([]);
      setCurrentPage(1);
      setHasMore(true);
      setTotalPages(0);
      setTotal(0);
    }
  }, [user]); // Remove fetchNotifications from dependencies to avoid infinite loop

  // Listen for real-time notifications via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket]);

  // Single source of truth: derive unread count from notifications (avoids double-count with socket + fetch)
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    currentPage,
    totalPages,
    total,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
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
