import { type ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";

import ChatSideBar from "./chat-sidebar";
import { api } from "~/utils/api";
import { useChatStore } from "~/stores/chat";

const ChatLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const targetId = router.query.id as string | undefined;
  const addMessage = useChatStore((state) => state.addMessage);
  const addMessageToConversation = useChatStore(
    (state) => state.addMessageToConversation
  );

  api.chat.onMessage.useSubscription(undefined, {
    onData: (message) => {
      if (
        message.targetUserId === targetId ||
        message.targetGroupId === targetId
      ) {
        addMessage({
          message,
          isFromSelf: false,
        });
      } else {
        addMessageToConversation(message);
      }
    },
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
