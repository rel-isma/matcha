'use client';

import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      onTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping();
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsTyping(false);
      onStopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
      <div className="flex items-start justify-center gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-input rounded-2xl focus:outline-none focus:ring-2 resize-none disabled:bg-muted disabled:cursor-not-allowed bg-background text-foreground placeholder:text-muted-foreground"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
            {message.length}/1000
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled || message.length > 1000}
          className=" rotate-90 flex-shrink-0 w-12 h-12 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
