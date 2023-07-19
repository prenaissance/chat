import { Flex, Show, Text, useColorModeValue } from "@chakra-ui/react";

import ChatLayout from "~/components/chat/ChatLayout";
import OnlineFriends from "~/components/chat/OnlineFriends";

const Chat = () => {
  return (
    <ChatLayout>
      <Flex h="100%" w="100%">
        <Flex flexDirection="column" m={8} alignItems="center" flexGrow={1}>
          <Text
            fontSize="3xl"
            color={useColorModeValue("gray.700", "gray.300")}
          >
            Start a conversation by clicking a user or group on the left or
            finding someone through the search bar.
          </Text>
        </Flex>
        <Show above="xl">
          <OnlineFriends
            borderColor={useColorModeValue("gray.400", "gray.600")}
            borderLeft="1px solid"
            h="100%"
          />
        </Show>
      </Flex>
    </ChatLayout>
  );
};

export default Chat;
