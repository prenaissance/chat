import { type ReactNode } from "react";
import ChatSideBar from "./ChatSideBar";
import { Box, Flex } from "@chakra-ui/react";
import { api } from "~/utils/api";
import { type ChatStore, useChatStore } from "~/stores/chat";
import { useRouter } from "next/router";

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
        addMessage(message);
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
