'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ChatContainer from '@/components/chat/ChatContainer';

export default function ChatPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] py-4 md:py-6">
      <ChatContainer 
        currentUserId={user.id} 
        currentUsername={user.username}
      />
    </div>
  );
}
