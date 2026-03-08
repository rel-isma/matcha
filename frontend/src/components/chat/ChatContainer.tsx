'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { chatApi } from '@/lib/api';
import { profileApi } from '@/lib/profileApi';
import { useSocket } from '@/hooks/useSocket';
import { Message, Conversation } from '@/types';
import { STATIC_BASE_URL } from '@/lib/constants';
import { chatEvents, CHAT_EVENTS } from '@/lib/chatEvents';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import toast from 'react-hot-toast';

interface ChatContainerProps {
  currentUserId: string;
  currentUsername: string;
  initialUsername?: string; // Username to auto-select from URL
}

export default function ChatContainer({ currentUserId, currentUsername, initialUsername }: ChatContainerProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedConversationData, setSelectedConversationData] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  /** True when the other user has blocked us (we cannot send messages) */
  const [isBlockedByThem, setIsBlockedByThem] = useState(false);
  /** Prevents running initialUsername logic (and showing toast) multiple times when effect re-runs */
  const processedInitialUsername = useRef<string | null>(null);

  const { socket } = useSocket();

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await chatApi.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
        return response.data;
      }
    } catch (err) {
      // ignore
    }
    return [];
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (otherUserId: string) => {
    try {
      setLoading(true);
      setError(null);
      setIsBlockedByThem(false);
      const response = await chatApi.getMessages(otherUserId);
      if (response.success && response.data) {
        setMessages(response.data);
        setIsBlockedByThem(false);

        const unreadCount = response.data.filter(
          (msg: Message) => msg.senderId === otherUserId && !msg.isRead
        ).length;

        await chatApi.markAsRead(otherUserId);
        chatEvents.emit(CHAT_EVENTS.MESSAGES_READ, unreadCount);
      } else {
        const blockedMessage =
          response.message === 'You have been blocked' ||
          response.message === 'Cannot message this user';
        if (blockedMessage) {
          setIsBlockedByThem(true);
          setMessages([]);
        }
        setError(response.message || 'Failed to load messages');
      }
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle conversation selection.
  // Optional second arg: when we have the conversation already (e.g. from initial load),
  // pass it so we don't rely on state that may not have updated yet (stale closure).
  const handleSelectConversation = useCallback((userId: string, conversationData?: Conversation) => {
    const conversation = conversationData ?? conversations.find(c => c.userId === userId);
    if (conversation) {
      setSelectedConversation(userId);
      setSelectedConversationData(conversation);

      chatEvents.emit(CHAT_EVENTS.CONVERSATION_SELECTED, userId);
      loadMessages(userId);
      if (socket) {
        socket.emit('chat:join', userId);
      }
    }
  }, [conversations, loadMessages, socket]);

  // Handle closing conversation (for mobile)
  const handleCloseConversation = useCallback(() => {
    setSelectedConversation(null);
    setSelectedConversationData(null);
    setMessages([]);
    setIsBlockedByThem(false);
    chatEvents.emit(CHAT_EVENTS.CONVERSATION_SELECTED, null);
  }, []);

  useEffect(() => {
    return () => {
      chatEvents.emit(CHAT_EVENTS.CONVERSATION_SELECTED, null);
    };
  }, []);

  // Initial load and handle URL parameter
  useEffect(() => {
    const initializeChat = async () => {
      const loadedConversations = await loadConversations();

      if (!initialUsername) return;

      // Only process this initialUsername once (effect can re-run; avoid 6x getPublicProfile + 6x toast)
      if (processedInitialUsername.current === initialUsername) {
        setInitialLoadDone(true);
        return;
      }
      processedInitialUsername.current = initialUsername;

      const targetConversation = loadedConversations?.find(
        (conv: Conversation) => conv.username === initialUsername
      );

      if (targetConversation) {
        handleSelectConversation(targetConversation.userId, targetConversation);
        setInitialLoadDone(true);
        return;
      }

      // No existing conversation - fetch user profile to create new conversation
      try {
        const response = await profileApi.getPublicProfile(initialUsername);

        if (response.success && response.data?.profile) {
          const profile = response.data.profile;
          const existingConv = loadedConversations?.find(
            (conv: Conversation) => conv.userId === profile.userId
          );

          if (existingConv) {
            setSelectedConversation(existingConv.userId);
            setSelectedConversationData(existingConv);
            loadMessages(existingConv.userId);
            if (socket) socket.emit('chat:join', existingConv.userId);
          } else {
            let profilePictureUrl = profile.pictures?.[0]?.url;
            if (profilePictureUrl && !profilePictureUrl.startsWith('http')) {
              profilePictureUrl = `${STATIC_BASE_URL}${profilePictureUrl}`;
            }
            const newConversation: Conversation = {
              userId: profile.userId,
              username: profile.username,
              firstName: profile.firstName,
              lastName: profile.lastName,
              isOnline: profile.isOnline || false,
              lastSeen: profile.lastSeen,
              profilePicture: profilePictureUrl,
              unreadCount: 0
            };
            setConversations(prev => [newConversation, ...prev]);
            setSelectedConversation(profile.userId);
            setSelectedConversationData(newConversation);
            setMessages([]);
            setLoading(false);
            if (socket) socket.emit('chat:join', profile.userId);
          }
        } else {
          toast.error(response.message || 'Could not find user to chat with');
        }
      } catch (error) {
        toast.error('Failed to start conversation');
      }
      setInitialLoadDone(true);
    };

    initializeChat();
  }, [loadConversations, initialUsername, initialLoadDone, handleSelectConversation, socket]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Handle new messages
    const handleNewMessage = (message: Message) => {
      
      // Update messages if in active conversation
      if (selectedConversation) {
        if (message.senderId === selectedConversation || message.recipientId === selectedConversation) {
          setMessages(prev => [...prev, message]);
          
          // Mark as read if we're viewing the conversation
          if (message.senderId === selectedConversation) {
            socket.emit('chat:mark-read', selectedConversation);
          }
        } else {
          // Message is for a different conversation - just refresh the list
        }
      } else {
        // No conversation open - message will be handled via NEW_MESSAGE event for the badge
      }

      // If message is from someone other than current user, notify the navbar
      if (message.senderId !== currentUserId) {
        chatEvents.emit(CHAT_EVENTS.NEW_MESSAGE, message);
      }

      // Update conversation list
      loadConversations();
    };

    const handleTyping = ({ userId, username }: { userId: string; username: string }) => {
      if (userId === selectedConversation) {
        setIsTyping(true);
        setTypingUser(username);
      }
    };

    const handleStopTyping = ({ userId }: { userId: string }) => {
      if (userId === selectedConversation) {
        setIsTyping(false);
        setTypingUser('');
      }
    };

    const handleMessagesRead = () => {
      // Update read status for sent messages
      setMessages(prev => prev.map(msg => 
        msg.senderId === currentUserId ? { ...msg, isRead: true } : msg
      ));
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:stop-typing', handleStopTyping);
    socket.on('chat:messages-read', handleMessagesRead);

    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stop-typing', handleStopTyping);
      socket.off('chat:messages-read', handleMessagesRead);
    };
  }, [socket, selectedConversation, currentUserId, loadConversations]);

  // Send message (do not send if we are blocked or we have blocked them)
  const handleSendMessage = useCallback((content: string) => {
    if (!selectedConversation || !socket) return;
    if (isBlockedByThem || selectedConversationData?.isBlocked) return;

    socket.emit('chat:message', {
      recipientId: selectedConversation,
      content
    });
  }, [selectedConversation, socket, isBlockedByThem, selectedConversationData?.isBlocked]);

  // Typing indicators
  const handleTyping = useCallback(() => {
    if (selectedConversation && socket) {
      socket.emit('chat:typing', selectedConversation);
    }
  }, [selectedConversation, socket]);

  const handleStopTyping = useCallback(() => {
    if (selectedConversation && socket) {
      socket.emit('chat:stop-typing', selectedConversation);
    }
  }, [selectedConversation, socket]);

  return (
    <div className="h-full flex bg-card rounded-lg shadow-sm overflow-hidden border border-border">
      {/* Conversations sidebar - hidden on mobile when conversation is selected */}
      <div className={`
        w-full md:w-80 lg:w-96 border-r border-border flex flex-col
        ${selectedConversation ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-4 border-b border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground">Messages</h2>
        </div>
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          currentUserId={currentUserId}
        />
      </div>

      {/* Chat area - visible on mobile when conversation is selected */}
      <div className={`
        flex-1 flex flex-col
        ${selectedConversation ? 'flex' : 'hidden md:flex'}
      `}>
        {selectedConversation && selectedConversationData ? (
          <>
            {/* Chat header with back button for mobile */}
            <div className="p-4 border-b border-border bg-card flex items-center gap-3">
              <button
                onClick={handleCloseConversation}
                className="md:hidden p-2 -ml-2 hover:bg-accent/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {(() => {
                const isBlocked = selectedConversationData?.isBlocked || isBlockedByThem;
                return (
                  <>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                      {isBlocked ? (
                        <span className="text-lg font-semibold text-muted-foreground">M</span>
                      ) : selectedConversationData.profilePicture ? (
                        <img
                          src={selectedConversationData.profilePicture.startsWith('http')
                            ? selectedConversationData.profilePicture
                            : `${STATIC_BASE_URL}${selectedConversationData.profilePicture}`}
                          alt={selectedConversationData.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-secondary-600 font-semibold">
                          {selectedConversationData.firstName?.[0]}{selectedConversationData.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {isBlocked ? 'Matcha User' : `${selectedConversationData.firstName} ${selectedConversationData.lastName}`}
                      </h3>
                      {!isBlocked && (
                        <p className="text-xs text-muted-foreground">
                          {selectedConversationData.isOnline ? 'Online' : 'Offline'}
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                otherUserProfilePicture={(selectedConversationData?.isBlocked || isBlockedByThem) ? undefined : selectedConversationData?.profilePicture}
                isTyping={isTyping}
                typingUsername={(selectedConversationData?.isBlocked || isBlockedByThem) ? (isTyping ? 'Matcha User' : '') : typingUser}
              />
            )}

            {/* Message input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              onStopTyping={handleStopTyping}
              disabled={!socket || isBlockedByThem || !!selectedConversationData?.isBlocked}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Select a Conversation</h3>
              <p className="text-sm text-muted-foreground">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
