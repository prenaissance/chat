import { InfoIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Show,
  useColorModeValue,
  chakra,
  HStack,
  Skeleton,
  IconButton,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSession } from "next-auth/react";

import ChatLayout from "~/components/chat/ChatLayout";
import UserAvatar from "~/components/common/UserAvatar";
import { api } from "~/utils/api";
import ChatMessages from "~/components/chat/chat-messages";
import UserCard from "~/components/common/UserCard";
import { useQueryCallbacks } from "~/hooks/useQueryCallbacks";
import MessageInput from "~/components/chat/MessageInput";
import { useUserOptimisticUpdates } from "~/hooks/chat/useUserOptimisticUpdates";
import { useConversationOptimisticUpdates } from "~/hooks/conversations/useConversationOptimisticUpdates";

const UserChat = () => {
  const router = useRouter();
  const session = useSession();
  const userId = router.query.id as string;
  const { addMessage } = useUserOptimisticUpdates(userId);
  const { readConversation } = useConversationOptimisticUpdates();
  const userQuery = api.users.getUser.useQuery(
    {
      id: userId,
    },
    {
      enabled: !!userId && !!session.data,
    }
  );

  const messagesQuery = api.chat.getUserMessages.useQuery(
    {
      targetUserId: userId,
    },
    {
      enabled: !!userId && !!session.data,
    }
  );
  const messages = messagesQuery.data ?? [];

  const sendMessageMutation = api.chat.sendUserMessage.useMutation();

  const handleSendMessage = (message: string) => {
    addMessage(message);
    sendMessageMutation.mutate({
      message,
      targetUserId: userId,
    });
  };

  useQueryCallbacks({
    query: messagesQuery,
    onDataChanged: () => readConversation(userId),
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
              <ChatMessages
                messages={messages}
                isLoading={messagesQuery.isLoading}
                h="calc(100% - 2rem)"
                overflowY="auto"
              />
              <MessageInput onSendMessage={handleSendMessage} />
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
