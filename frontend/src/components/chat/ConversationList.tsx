'use client';

import React from 'react';
import { Conversation } from '@/types';
import { STATIC_BASE_URL } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (userId: string) => void;
  currentUserId?: string;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUserId
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Conversations Yet</h3>
        <p className="text-sm text-muted-foreground">
          Start matching with people to begin conversations
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y divide-border">
        {conversations.map((conversation) => {
          const isSelected = selectedConversation === conversation.userId;
          const isLastMessageFromMe = conversation.lastMessageSenderId === currentUserId;
          const hasUnread = conversation.unreadCount > 0;
          const isBlocked = !!conversation.isBlocked;

          return (
            <button
              key={conversation.userId}
              onClick={() => onSelectConversation(conversation.userId)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors ${
                isSelected ? 'bg-accent/20 hover:bg-accent/20' : ''
              }`}
            >
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                  {isBlocked ? (
                    <span className="text-lg font-semibold text-muted-foreground">M</span>
                  ) : conversation.profilePicture ? (
                    <img
                      src={conversation.profilePicture.startsWith('http')
                        ? conversation.profilePicture
                        : `${STATIC_BASE_URL}${conversation.profilePicture}`}
                      alt={conversation.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-foreground font-semibold">
                      {conversation.firstName?.[0]}{conversation.lastName?.[0]}
                    </span>
                  )}
                </div>
                {/* Online indicator - hidden when blocked */}
                {!isBlocked && conversation.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full"></div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-semibold truncate text-foreground">
                    {isBlocked ? 'Matcha User' : `${conversation.firstName} ${conversation.lastName}`}
                  </h3>
                  {conversation.lastMessageAt && (
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm truncate text-muted-foreground">
                    {conversation.lastMessage && (
                      <>
                        {isLastMessageFromMe && <span className="text-muted-foreground/70">You: </span>}
                        {conversation.lastMessage}
                      </>
                    )}
                  </p>
                  {hasUnread && (
                    <span className="ml-2 flex-shrink-0 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
