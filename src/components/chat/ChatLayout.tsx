import { type ReactNode } from "react";
import ChatSideBar from "./ChatSideBar";
import { Box, Flex } from "@chakra-ui/react";
import { api } from "~/utils/api";
import { type ChatStore, useChatStore } from "~/stores/chat";

const selector = (state: ChatStore) => state.addMessage;

const ChatLayout = ({ children }: { children: ReactNode }) => {
  const addMessage = useChatStore(selector);
  api.chat.onMessage.useSubscription(undefined, {
    onData: (message) => {
      console.log("message", message);
      addMessage(message);
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
