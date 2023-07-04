import { type ReactNode } from "react";
import ChatSideBar from "./ChatSideBar";
import { Box, Flex } from "@chakra-ui/react";

const ChatLayout = ({ children }: { children: ReactNode }) => {
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
