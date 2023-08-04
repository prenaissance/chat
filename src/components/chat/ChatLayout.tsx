import { type ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";

import ChatSideBar from "./chat-sidebar";
import { api } from "~/utils/api";
import { type ChatStore, useChatStore } from "~/stores/chat";

const addMessageSelector = (state: ChatStore) => state.addMessage;

const ChatLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const targetId = router.query.id as string | undefined;
  const addMessage = useChatStore(addMessageSelector);

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
