'use client';

import React from 'react';
import { Bell, Check, Eye, Heart, HeartOff, Trash2, User } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext2';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { STATIC_BASE_URL } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsPage() {
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
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like_received':
        return <Heart className="w-5 h-5 text-accent" />;
      case 'match':
        return <Heart className="w-5 h-5 text-accent fill-accent" />;
      case 'profile_view':
        return <Eye className="w-5 h-5 text-accent" />;
      case 'unlike':
        return <HeartOff className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="py-4 md:py-6">
      {/* Header */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-accent" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <motion.span 
                className="px-3 py-1 text-sm font-medium text-white bg-accent rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-2">Stay updated with your matches</p>
      </motion.div>

      {/* Mark all as read button */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm text-accent hover:underline font-medium"
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Container */}
      <motion.div 
        className="bg-card rounded-xl shadow-sm border border-border overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Bell className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-sm mt-1">We&apos;ll notify you when something happens</p>
          </motion.div>
        ) : (
          <>
            <motion.div 
              className="divide-y divide-border"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <NotificationItem
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onDelete={(e) => handleDelete(e, notification.id)}
                    icon={getNotificationIcon(notification.type)}
                  />
                </motion.div>
              ))}
            </motion.div>
            
            {/* Load More Button */}
            {hasMore && (
              <motion.div 
                className="p-4 border-t border-border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <motion.button
                  onClick={loadMoreNotifications}
                  disabled={isLoadingMore}
                  className="w-full py-3 px-4 text-sm font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent" />
                      Loading more...
                    </>
                  ) : (
                    'Load More Notifications'
                  )}
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

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

  return (
    <div
      onClick={onClick}
      className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
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
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          {/* Icon indicator badge */}
          <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-0.5 border border-border shadow-sm">
            {icon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm text-foreground ${!notification.isRead ? 'font-semibold' : ''}`}>
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>

        <button
          onClick={onDelete}
          className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
          aria-label="Delete notification"
        >
          <Trash2 className="w-4 h-4 text-muted-foreground" />
        </button>

        {!notification.isRead && (
          <div className="flex-shrink-0 w-2 h-2 bg-accent rounded-full mt-2" />
        )}
      </div>
    </div>
  );
};
