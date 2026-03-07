'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { chatApi } from '@/lib/api';
import { chatEvents, CHAT_EVENTS } from '@/lib/chatEvents';

interface ChatUnreadContextType {
  unreadCount: number;
  isLoading: boolean;
  currentConversationId: string | null;
  setCurrentConversation: (userId: string | null) => void;
  markAsRead: (senderId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshCount: () => Promise<void>;
}

export const useChatUnread = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const hasJoinedRoom = useRef(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const response = await chatApi.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch initial unread count
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Join user's own room when socket connects to receive messages globally
  useEffect(() => {
    if (!socket || !user || !isConnected || hasJoinedRoom.current) return;

    socket.emit('chat:join', user.id);
    hasJoinedRoom.current = true;
  }, [socket, user, isConnected]);

  // Listen for conversation selection events to know which conversation is open
  useEffect(() => {
    const unsubscribe = chatEvents.subscribe(CHAT_EVENTS.CONVERSATION_SELECTED, (userId) => {
      setCurrentConversationId(userId as string);
    });

    return () => unsubscribe();
  }, []);

  // Listen for real-time new messages via socket - works globally
  useEffect(() => {
    if (!socket || !user) return;

    // The backend sends 'chat:new-message' to recipient's personal room
    const handleNewMessage = (message: { senderId: string; recipientId: string }) => {
      
      // Only increment if the message is NOT from the currently open conversation
      // This prevents incrementing when both users have the conversation open
      if (message.senderId !== currentConversationId) {
        setUnreadCount((prev) => prev + 1);
      } else {
        
      }
    };

    socket.on('chat:new-message', handleNewMessage);

    return () => {
      socket.off('chat:new-message', handleNewMessage);
    };
  }, [socket, user, currentConversationId]);

  // Listen for events from ChatContainer when messages are read (with count)
  useEffect(() => {
    const unsubscribeMessagesRead = chatEvents.subscribe(CHAT_EVENTS.MESSAGES_READ, (data) => {
      if (typeof data === 'number' && data > 0) {
        // Decrement by the specific count of messages read
        setUnreadCount((prev) => Math.max(0, prev - data));
      } else if (typeof data === 'string' && data) {
        // Legacy: single senderId
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    });

    return () => {
      unsubscribeMessagesRead();
    };
  }, []);

  // Set current conversation (called by ChatContainer)
  const setCurrentConversation = useCallback((userId: string | null) => {
    setCurrentConversationId(userId);
    chatEvents.emit(CHAT_EVENTS.CONVERSATION_SELECTED, userId);
  }, []);

  // Mark messages from a specific sender as read
  const markAsRead = async (senderId: string) => {
    try {
      await chatApi.markAsRead(senderId);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Mark all messages as read
  const markAllAsRead = async () => {
    try {
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all messages as read:', error);
    }
  };

  const refreshCount = async () => {
    await fetchUnreadCount();
  };

  return {
    unreadCount,
    isLoading,
    currentConversationId,
    setCurrentConversation,
    markAsRead,
    markAllAsRead,
    refreshCount
  };
};
