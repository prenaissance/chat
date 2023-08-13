import { Box, Flex, Show, useColorModeValue } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Head from "next/head";
import { shallow } from "zustand/shallow";

import ChatLayout from "~/components/chat/ChatLayout";
import { type ChatStore, useChatStore } from "~/stores/chat";
import { api } from "~/utils/api";
import ChatMessages from "~/components/chat/chat-messages";
import { useQueryCallbacks } from "~/hooks/useQueryCallbacks";
import UserList from "~/components/common/UserList";
import GroupChatHeader from "~/components/chat/group/group-chat-header";
import MessageInput from "~/components/chat/MessageInput";

const selector = ({
  setMessages,
  addMessage,
  setIsLoadingMessages,
  rollbackMessage,
  readGroupConversation,
}: ChatStore) => ({
  setMessages,
  addMessage,
  setIsLoadingMessages,
  rollbackMessage,
  readGroupConversation,
});

const UserChat = () => {
  const {
    setMessages,
    addMessage,
    readGroupConversation,
    setIsLoadingMessages,
  } = useChatStore(selector, shallow);
  const router = useRouter();
  const groupId = router.query.id as string;
  const groupQuery = api.groups.getGroup.useQuery(groupId, {
    enabled: !!groupId,
  });

  const messagesQuery = api.groups.getMessages.useQuery(
    {
      targetGroupId: groupId,
    },
    {
      enabled: !!groupId,
    }
  );

  const sendMessageMutation = api.groups.sendMessage.useMutation({
    onSuccess: (message) =>
      addMessage({
        message,
        isFromSelf: true,
      }),
  });

  const handleSendMessage = (message: string) =>
    sendMessageMutation.mutateAsync({
      message,
      targetGroupId: groupId,
    });

  useQueryCallbacks({
    query: messagesQuery,
    onSuccess: () => setIsLoadingMessages(false),
    onDataChanged: (messages) => {
      setMessages(messages);
      readGroupConversation(groupId);
    },
  });

  return (
    <>
      <Head>
        <title>Group chat</title>
        <meta name="description" content="Group chat" />
      </Head>
      <ChatLayout>
        <Flex h="100%" w="100%">
          <Flex flexDirection="column" flexGrow={1}>
            <GroupChatHeader />
            <Box h="calc(100% - 3rem)" px={2} py={4}>
              <ChatMessages h="calc(100% - 2rem)" overflowY="auto" />
              <MessageInput
                onSendMessage={handleSendMessage}
                isLoading={sendMessageMutation.isLoading}
              />
            </Box>
          </Flex>
          <Show above="xl">
            <UserList
              borderColor={useColorModeValue("gray.400", "gray.600")}
              borderLeftWidth="1px"
              h="100%"
              title="Group members:"
              fallbackDescription="No members"
              isLoading={groupQuery.isLoading}
              users={groupQuery.data?.users}
            />
          </Show>
        </Flex>
      </ChatLayout>
    </>
  );
};

export default UserChat;
