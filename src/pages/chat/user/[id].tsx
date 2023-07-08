import { useEffect, useState } from "react";
import { ArrowForwardIcon, InfoIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Show,
  useColorModeValue,
  chakra,
  HStack,
  Skeleton,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { shallow } from "zustand/shallow";

import ChatLayout from "~/components/chat/ChatLayout";
import UserAvatar from "~/components/common/UserAvatar";
import { type ChatStore, useChatStore } from "~/stores/chat";
import { api } from "~/utils/api";

const selector = ({
  messages,
  setMessages,
  addMessage,
  rollbackMessage,
  readUserConversation,
}: ChatStore) => ({
  messages,
  setMessages,
  addMessage,
  rollbackMessage,
  readUserConversation,
});

const UserChat = () => {
  const { messages, setMessages, addMessage, readUserConversation } =
    useChatStore(selector, shallow);
  const router = useRouter();
  const userId = router.query.id as string;
  const userQuery = api.users.getUser.useQuery({
    id: userId,
  });

  const [typedMessage, setTypedMessage] = useState("");

  const messagesQuery = api.chat.getUserMessages.useQuery(
    {
      targetUserId: userId,
    },
    {
      enabled: !!userId,
    }
  );
  const sendMessageMutation = api.chat.sendUserMessage.useMutation({
    onSuccess: addMessage,
  });

  const handleTypedMessageChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTypedMessage(e.target.value);
  const handleSendMessage = () => {
    sendMessageMutation.mutate({
      message: typedMessage,
      targetUserId: userId,
    });

    setTypedMessage("");
  };

  // might be bad pattern, but this branch is not subscribed to conversations
  useEffect(() => readUserConversation(userId), [userId, readUserConversation]);

  useEffect(() => {
    if (messagesQuery.isSuccess) {
      setMessages(messagesQuery.data);
    }
  }, [messagesQuery.isSuccess, userId, messagesQuery.data, setMessages]);

  return (
    <ChatLayout>
      <Flex h="100%" w="100%">
        <Flex flexDirection="column" flexGrow={1}>
          <HStack
            py={1}
            px={2}
            as="header"
            h={12}
            shadow="lg"
            bgColor={useColorModeValue("white", "gray.800")}
          >
            <UserAvatar user={userQuery.data} size="sm" isOnline />
            <Skeleton isLoaded={!userQuery.isLoading} w="min(12rem, 50%)">
              <chakra.h1 fontSize="xl">
                {userQuery.data?.name ?? "Placeholder Name"}
              </chakra.h1>
            </Skeleton>
            <IconButton
              ml="auto"
              variant="ghost"
              size="md"
              aria-label="Info about user"
              icon={<InfoIcon />}
            />
          </HStack>
          <Box height="calc(100% - 3rem)" px={2} py={4}>
            <Box height="calc(100% - 2rem)" overflowY="auto">
              {messages.map((message) => (
                <chakra.div key={message.id}>{message.content}</chakra.div>
              ))}
            </Box>
            <chakra.form
              h={8}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              display="flex"
              mb={2}
              gap={1}
            >
              <Input
                placeholder="Type a new message"
                value={typedMessage}
                onChange={handleTypedMessageChange}
                flexGrow={1}
                variant="filled"
              />
              <IconButton
                variant="ghost"
                type="submit"
                aria-label="Send message"
                icon={<ArrowForwardIcon />}
                disabled={!typedMessage}
              />
            </chakra.form>
          </Box>
        </Flex>
        <Show above="xl">
          <chakra.aside
            w={80}
            h="100%"
            borderLeft="1px solid"
            borderColor={useColorModeValue("gray.400", "gray.600")}
          ></chakra.aside>
        </Show>
      </Flex>
    </ChatLayout>
  );
};

export default UserChat;
