import { useState } from "react";
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
import ChatMessages from "~/components/chat/chat-messages";
import UserCard from "~/components/common/UserCard";
import { useQueryCallbacks } from "~/hooks/useQueryCallbacks";
import Head from "next/head";
import { useSession } from "next-auth/react";

const selector = ({
  setMessages,
  addMessage,
  setIsLoadingMessages,
  rollbackMessage,
  readUserConversation,
}: ChatStore) => ({
  setMessages,
  addMessage,
  setIsLoadingMessages,
  rollbackMessage,
  readUserConversation,
});

const UserChat = () => {
  const {
    setMessages,
    readUserConversation,
    setIsLoadingMessages,
    addMessage,
  } = useChatStore(selector, shallow);
  const router = useRouter();
  const session = useSession();
  const userId = router.query.id as string;
  const userQuery = api.users.getUser.useQuery(
    {
      id: userId,
    },
    {
      enabled: !!userId && !!session.data,
    }
  );

  const [typedMessage, setTypedMessage] = useState("");

  const messagesQuery = api.chat.getUserMessages.useQuery(
    {
      targetUserId: userId,
    },
    {
      enabled: !!userId && !!session.data,
    }
  );

  const sendMessageMutation = api.chat.sendUserMessage.useMutation({
    onSuccess: (message) =>
      addMessage({
        message,
        isFromSelf: true,
      }),
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

  useQueryCallbacks({
    query: messagesQuery,
    onSuccess: () => setIsLoadingMessages(false),
    onDataChanged: (messages) => {
      setMessages(messages);
      readUserConversation(userId);
    },
  });

  return (
    <>
      <Head>
        <title>Chat with {userQuery.data?.name ?? "User"}</title>
        <meta name="description" content="Chat with user" />
      </Head>
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
              <UserAvatar user={userQuery.data} size="sm" />
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
            <Box h="calc(100% - 3rem)" px={2} py={4}>
              <ChatMessages h="calc(100% - 2rem)" overflowY="auto" />
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
              display="flex"
              // alignItems="center"
              w={80}
              h="100%"
              borderLeft="1px solid"
              borderColor={useColorModeValue("gray.400", "gray.600")}
            >
              <UserCard
                w="100%"
                m={2}
                user={userQuery.data}
                showActions={false}
              />
            </chakra.aside>
          </Show>
        </Flex>
      </ChatLayout>
    </>
  );
};

export default UserChat;
