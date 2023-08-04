import { create } from "zustand";
import { type MessageDTO } from "~/shared/dtos/chat";
import { type RouterOutputs } from "~/utils/api";

type ConversationDto =
  RouterOutputs["conversations"]["getConversations"][number];

type ChatState = {
  conversations: ConversationDto[];
  messages: MessageDTO[];
  isLoadingMessages: boolean;
};

type ChatActions = {
  addMessage: ({
    message,
    isFromSelf,
  }: {
    message: MessageDTO;
    isFromSelf?: boolean;
  }) => void;
  setMessages: (messages: MessageDTO[]) => void;
  setIsLoadingMessages: (isLoading: boolean) => void;
  rollbackMessage: (message: MessageDTO) => void;
  pushConversation: (conversation: ConversationDto) => void;
  setConversations: (conversations: ConversationDto[]) => void;
  readUserConversation: (targetUserId: string) => void;
  readGroupConversation: (groupId: string) => void;
};

export type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  messages: [],
  isLoadingMessages: true,
  addMessage: ({ message, isFromSelf = true }) => {
    const { conversations, messages } = get();
    const conversation = conversations.find(
      (conversation) =>
        conversation.targetUserId === message.targetUserId ||
        conversation.targetGroupId === message.targetGroupId
    );
    const newConversations = conversations.map((c) =>
      c.id === conversation?.id
        ? {
            ...c,
            lastMessage: message,
            unreadCount: isFromSelf ? 0 : c.unreadCount + 1,
          }
        : c
    );

    set({
      conversations: newConversations,
      messages: [...messages, message],
    });
  },
  setIsLoadingMessages: (isLoading) => {
    set({ isLoadingMessages: isLoading });
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
