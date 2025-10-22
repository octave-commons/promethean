import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface LLMState {
  conversations: Map<string, Message[]>;
  loading: boolean;
  error: string | null;

  // Actions
  createConversation: (actorId: string) => void;
  addMessage: (actorId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  getMessages: (actorId: string) => Message[];
  clearConversation: (actorId: string) => void;
}

export const useLLMStore = create<LLMState>((set, get) => ({
  conversations: new Map(),
  loading: false,
  error: null,

  createConversation: (actorId: string) => {
    set((state) => {
      const newConversations = new Map(state.conversations);
      newConversations.set(actorId, []);
      return { conversations: newConversations };
    });
  },

  addMessage: (actorId: string, message) => {
    const newMessage: Message = {
      ...message,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    set((state) => {
      const newConversations = new Map(state.conversations);
      const messages = newConversations.get(actorId) || [];
      newConversations.set(actorId, [...messages, newMessage]);
      return { conversations: newConversations };
    });
  },

  getMessages: (actorId: string) => {
    return get().conversations.get(actorId) || [];
  },

  clearConversation: (actorId: string) => {
    set((state) => {
      const newConversations = new Map(state.conversations);
      newConversations.set(actorId, []);
      return { conversations: newConversations };
    });
  },
}));
