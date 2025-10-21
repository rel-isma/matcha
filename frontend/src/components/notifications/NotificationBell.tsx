'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Eye, Heart, HeartOff, Trash2, User } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext2';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { STATIC_BASE_URL } from '@/lib/constants';


export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200 relative"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center leading-none font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationSidebar onClose={() => setIsOpen(false)} />}
    </>
  );
};

interface NotificationSidebarProps {
  onClose: () => void;
}

const NotificationSidebar = ({ onClose }: NotificationSidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMoreNotifications
  } = useNotifications();
  const router = useRouter();

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    if (notification.link) {
      router.push(notification.link);
      onClose();
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like_received':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'match':
        return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />;
      case 'profile_view':
        return <Eye className="w-5 h-5 text-primary-500" />;
      case 'unlike':
        return <HeartOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:bg-transparent" onClick={onClose} />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
        style={{ transform: 'translateX(0)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium text-white bg-primary-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mark all as read button */}
        {unreadCount > 0 && (
          <div className="p-3 border-b dark:border-gray-800">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="overflow-y-auto h-[calc(100%-8rem)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div>
              <div className="divide-y dark:divide-gray-800">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onDelete={(e) => handleDelete(e, notification.id)}
                    icon={getNotificationIcon(notification.type)}
                  />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="p-4 border-t dark:border-gray-800">
                  <button
                    onClick={loadMoreNotifications}
                    disabled={isLoadingMore}
                    className="w-full py-2 px-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500" />
                        Loading more...
                      </>
                    ) : (
                      'Load More Notifications'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
}

const NotificationItem = ({ notification, onClick, onDelete, icon }: NotificationItemProps) => {
  const avatarUrl = notification.fromUserAvatar 
    ? `${STATIC_BASE_URL}${notification.fromUserAvatar}`
    : null;

  // console.log('Avatar URL:', avatarUrl);

  return (
    <div
      onClick={onClick}
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with icon badge */}
        <div className="flex-shrink-0 relative">
          {avatarUrl ? (
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              <Image
                src={avatarUrl}
                alt={`${notification.fromUsername || 'User'}'s avatar`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          {/* Icon indicator badge */}
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 border border-gray-200 dark:border-gray-700 shadow-sm">
            {icon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>

        <button
          onClick={onDelete}
          className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label="Delete notification"
        >
          <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>

        {!notification.isRead && (
          <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2" />
        )}
      </div>
    </div>
  );
};
