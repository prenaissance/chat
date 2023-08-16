import { useCallback, type ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";

import ChatSideBar from "./chat-sidebar";
import { api } from "~/utils/api";
import { type MessageDTO } from "~/shared/dtos/chat";
import { MessageTarget } from "@prisma/client";

const ChatLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const targetId = router.query.id as string | undefined;
  const queryClient = api.useContext();

  const addMessage = useCallback(
    (message: MessageDTO) => {
      switch (message.targetType) {
        case MessageTarget.User:
          queryClient.chat.getUserMessages.setData(
            {
              targetUserId: message.targetUserId,
            },
            (messages) => [...(messages ?? []), message]
          );
          break;
        case MessageTarget.Group:
          queryClient.groups.getMessages.setData(
            {
              targetGroupId: message.targetGroupId,
            },
            (messages) => [...(messages ?? []), message]
          );
          break;
      }
      const isConversationOpen =
        message.targetUserId === targetId || message.targetGroupId === targetId;
      queryClient.conversations.getConversations.setData(
        undefined,
        (conversations) =>
          (conversations ?? []).map((c) =>
            c.targetUserId === message.targetUserId ||
            c.targetGroupId === message.targetGroupId
              ? {
                  ...c,
                  lastMessage: message,
                  unreadCount: isConversationOpen ? 0 : c.unreadCount + 1,
                }
              : c
          )
      );
    },
    [queryClient, targetId]
  );

  api.chat.onMessage.useSubscription(undefined, {
    onData: addMessage,
  });

  return (
    <Flex h="100%">
      <ChatSideBar />
      <Box flex="1" h="100%">
        {children}
      </Box>
    </Flex>
  );
};

export default ChatLayout;
