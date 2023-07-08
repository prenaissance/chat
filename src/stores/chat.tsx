import { create } from "zustand";
import { type MessageDTO } from "~/shared/dtos/chat";
import { type RouterOutputs } from "~/utils/api";

type ConversationDto =
  RouterOutputs["conversations"]["getConversations"][number];

type ChatState = {
  conversations: ConversationDto[];
  messages: MessageDTO[];
};

type ChatActions = {
  addMessage: (message: MessageDTO) => void;
  addMessageToConversation: (message: MessageDTO) => void;
  setMessages: (messages: MessageDTO[]) => void;
  rollbackMessage: (message: MessageDTO) => void;
  pushConversation: (conversation: ConversationDto) => void;
  setConversations: (conversations: ConversationDto[]) => void;
  readUserConversation: (targetUserId: string) => void;
  readGroupConversation: (groupId: string) => void;
};

export type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  messages: [],
  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },
  addMessageToConversation: (message) => {
    set((state) => {
      const conversation = state.conversations.find(
        (conversation) =>
          conversation.targetUserId === message.targetUserId ||
          conversation.targetGroupId === message.targetGroupId
      );

      if (!conversation) {
        return state;
      }

      return {
        conversations: state.conversations.map((c) =>
          c.id === conversation.id
            ? { ...c, lastMessage: message, unreadCount: c.unreadCount + 1 }
            : c
        ),
      };
    });
  },
  setMessages: (messages) => {
    set({ messages });
  },
  rollbackMessage: (message) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== message.id),
    }));
  },
  pushConversation: (conversation) => {
    set((state) => ({ conversations: [...state.conversations, conversation] }));
  },
  setConversations: (conversations) => {
    set({ conversations });
  },
  readUserConversation: (targetUserId) => {
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.targetUserId === targetUserId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      ),
    }));
  },
  readGroupConversation: (targetGroupId) => {
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.targetGroupId === targetGroupId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      ),
    }));
  },
}));
