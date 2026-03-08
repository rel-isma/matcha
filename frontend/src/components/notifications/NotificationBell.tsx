'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Eye, Heart, HeartOff, Trash2, User } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext2';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { STATIC_BASE_URL } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';


export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 text-muted-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors duration-200 relative"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center leading-none font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
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
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'match':
        return <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />;
      case 'profile_view':
        return <Eye className="w-4 h-4 text-primary-500" />;
      case 'unlike':
        return <HeartOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400 dark:text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="absolute right-0 mt-2 w-96 max-w-[384px] bg-card rounded-xl shadow-2xl border border-border z-50 overflow-hidden"
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" />
          <h2 className="text-base font-semibold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-accent rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
          aria-label="Close notifications"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mark all as read button */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div 
            className="px-4 py-2 border-b border-border bg-background"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm text-accent hover:underline transition-all hover:translate-x-1"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications list with scroll */}
      <div className="overflow-y-auto max-h-[60vh] sm:max-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Bell className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.1
                }
              }
            }}
          >
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { 
                      opacity: 1,
                      transition: { duration: 0.4, ease: "easeOut" }
                    }
                  }}
                >
                  <NotificationItem
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onDelete={(e) => handleDelete(e, notification.id)}
                    icon={getNotificationIcon(notification.type)}
                  />
                </motion.div>
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <motion.div 
                className="p-3 border-t border-border bg-background"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { delay: 0.2 } }
                }}
              >
                <button
                  onClick={loadMoreNotifications}
                  disabled={isLoadingMore}
                  className="w-full py-2 px-4 text-sm font-medium text-accent hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
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
    ? (notification.fromUserAvatar.startsWith('http')
        ? notification.fromUserAvatar
        : `${STATIC_BASE_URL}${notification.fromUserAvatar}`)
    : null;

  return (
    <div
      onClick={onClick}
      className={`p-3 hover:bg-muted cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-accent/10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with icon badge */}
        <div className="flex-shrink-0 relative">
          {avatarUrl ? (
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border">
              <Image
                src={avatarUrl}
                alt={`${notification.fromUsername || 'User'}'s avatar`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          {/* Icon indicator badge */}
          <div className="absolute -bottom-0.5 -right-0.5 bg-card rounded-full p-0.5 border border-border shadow-sm">
            {icon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm text-foreground ${!notification.isRead ? 'font-semibold' : ''}`}>
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onDelete}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Delete notification"
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {!notification.isRead && (
            <div className="w-2 h-2 bg-accent rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
};
