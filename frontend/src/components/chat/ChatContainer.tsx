'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
      console.error('Error loading conversations:', err);
    }
    return [];
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (otherUserId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatApi.getMessages(otherUserId);
      if (response.success && response.data) {
        setMessages(response.data);
        
        // Count unread messages from this user
        const unreadCount = response.data.filter(
          (msg: Message) => msg.senderId === otherUserId && !msg.isRead
        ).length;
        
        console.log('Unread messages from this user:', unreadCount);
        
        // Mark messages as read and notify navbar with the count
        await chatApi.markAsRead(otherUserId);
        chatEvents.emit(CHAT_EVENTS.MESSAGES_READ, unreadCount);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle conversation selection
  const handleSelectConversation = useCallback((userId: string) => {
    const conversation = conversations.find(c => c.userId === userId);
    if (conversation) {
      setSelectedConversation(userId);
      setSelectedConversationData(conversation);
      
      // Notify navbar about the selected conversation
      chatEvents.emit(CHAT_EVENTS.CONVERSATION_SELECTED, userId);
      
      loadMessages(userId);

      // Join chat room via socket
      if (socket) {
        socket.emit('chat:join', userId);
      }
    }
  }, [conversations, loadMessages, socket]);

  // Initial load and handle URL parameter
  useEffect(() => {
    const initializeChat = async () => {
      const loadedConversations = await loadConversations();
      
      // If initialUsername is provided and we haven't processed it yet
      if (initialUsername && !initialLoadDone) {
        // Find conversation by username
        const targetConversation = loadedConversations?.find(
          (conv: Conversation) => conv.username === initialUsername
        );
        
        if (targetConversation) {
          // Auto-select the existing conversation
          handleSelectConversation(targetConversation.userId);
          setInitialLoadDone(true);
        } else {
          // No existing conversation - fetch user profile to create new conversation
          try {
            console.log('Fetching profile for username:', initialUsername);
            const response = await profileApi.getPublicProfile(initialUsername);
            console.log('Profile API response:', response);
            
            if (response.success && response.data?.profile) {
              const profile = response.data.profile;
              console.log('Found profile:', profile);
              
              // Check if conversation with this userId already exists to avoid duplicates
              const existingConv = loadedConversations?.find(
                (conv: Conversation) => conv.userId === profile.userId
              );
              
              if (existingConv) {
                // Conversation already exists, just select it
                setSelectedConversation(existingConv.userId);
                setSelectedConversationData(existingConv);
                loadMessages(existingConv.userId);
                if (socket) {
                  socket.emit('chat:join', existingConv.userId);
                }
              } else {
                // Format profile picture URL
                let profilePictureUrl = profile.pictures?.[0]?.url;
                if (profilePictureUrl && !profilePictureUrl.startsWith('http')) {
                  profilePictureUrl = `${STATIC_BASE_URL}${profilePictureUrl}`;
                }
                
                // Create a virtual conversation for the new chat
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
                
                console.log('Creating virtual conversation:', newConversation);
                
                // Add to conversations list first
                setConversations(prev => {
                  const updated = [newConversation, ...prev];
                  console.log('Updated conversations list:', updated);
                  return updated;
                });
                
                // Then select it (state updates are batched in React 18)
                setSelectedConversation(profile.userId);
                setSelectedConversationData(newConversation);
                setMessages([]);
                setLoading(false);
                
                // Join chat room via socket
                if (socket) {
                  socket.emit('chat:join', profile.userId);
                }
                
                // toast.success(`Ready to chat with ${profile.firstName}!`);
              }
            } else {
              console.error('Profile fetch failed or no data:', response);
              toast.error(response.message || 'Could not find user to chat with');
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            toast.error('Failed to start conversation');
          }
        }
        setInitialLoadDone(true);
      }
    };
    
    initializeChat();
  }, [loadConversations, initialUsername, initialLoadDone, handleSelectConversation, socket]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Handle new messages
    const handleNewMessage = (message: Message) => {
      console.log('ChatContainer received message:', message, 'selectedConversation:', selectedConversation);
      
      // Update messages if in active conversation
      if (selectedConversation && 
          (message.senderId === selectedConversation || message.recipientId === selectedConversation)) {
        console.log('Adding message to chat');
        setMessages(prev => [...prev, message]);
        
        // Mark as read if we're viewing the conversation
        if (message.senderId === selectedConversation) {
          socket.emit('chat:mark-read', selectedConversation);
        }
      } else {
        console.log('Message not added - condition failed', {
          selectedConversation,
          messageSenderId: message.senderId,
          messageRecipientId: message.recipientId
        });
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

  // Send message
  const handleSendMessage = useCallback((content: string) => {
    if (!selectedConversation || !socket) return;

    console.log('Sending message:', { recipientId: selectedConversation, content });
    socket.emit('chat:message', {
      recipientId: selectedConversation,
      content
    });
  }, [selectedConversation, socket]);

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
    <div className="h-full flex bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Conversations sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-r border-secondary-200 flex flex-col">
        <div className="p-4 border-b border-secondary-200 bg-white">
          <h2 className="text-lg font-semibold text-secondary-900">Messages</h2>
        </div>
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          currentUserId={currentUserId}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && selectedConversationData ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-secondary-200 bg-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-200 flex-shrink-0">
                {selectedConversationData.profilePicture ? (
                  <img
                    src={selectedConversationData.profilePicture.startsWith('http') 
                      ? selectedConversationData.profilePicture 
                      : `${STATIC_BASE_URL}${selectedConversationData.profilePicture}`
                    }
                    alt={selectedConversationData.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary-600 font-semibold">
                    {selectedConversationData.firstName[0]}{selectedConversationData.lastName[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-900">
                  {selectedConversationData.firstName} {selectedConversationData.lastName}
                </h3>
                <p className="text-xs text-secondary-500">
                  {selectedConversationData.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
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
                otherUserProfilePicture={selectedConversationData?.profilePicture}
                isTyping={isTyping}
                typingUsername={typingUser}
              />
            )}

            {/* Message input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              onStopTyping={handleStopTyping}
              disabled={!socket}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-secondary-800 mb-2">Select a Conversation</h3>
              <p className="text-sm text-secondary-600">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
