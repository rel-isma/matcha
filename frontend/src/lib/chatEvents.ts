// Simple event emitter for chat notifications
// This allows ChatContainer to notify the navbar when messages are received/read

type ChatEventCallback = (data?: unknown) => void;

class ChatEventEmitter {
  private listeners: Map<string, Set<ChatEventCallback>> = new Map();

  subscribe(event: string, callback: ChatEventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}

// Singleton instance
export const chatEvents = new ChatEventEmitter();

// Event names
export const CHAT_EVENTS = {
  NEW_MESSAGE: 'chat:new-message',
  MESSAGES_READ: 'chat:messages-read',
  CONVERSATION_SELECTED: 'chat:conversation-selected',
} as const;
