import { Flex } from "@chakra-ui/react";
import ChatSideBar from "~/components/chat/ChatSideBar";

const Chat = () => {
  return (
    <Flex h="100%">
      <ChatSideBar />
    </Flex>
  );
};

export default Chat;
