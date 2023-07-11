import { Flex, Show, Text, chakra, useColorModeValue } from "@chakra-ui/react";
import ChatLayout from "~/components/chat/ChatLayout";

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
          <chakra.aside
            display="flex"
            // alignItems="center"
            w={80}
            h="100%"
            borderLeft="1px solid"
            borderColor={useColorModeValue("gray.400", "gray.600")}
          >
            Online friends WIP
          </chakra.aside>
        </Show>
      </Flex>
    </ChatLayout>
  );
};

export default Chat;
