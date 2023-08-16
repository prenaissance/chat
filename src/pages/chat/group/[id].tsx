import { Box, Flex, Show, useColorModeValue } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Head from "next/head";

import ChatLayout from "~/components/chat/ChatLayout";
import { api } from "~/utils/api";
import ChatMessages from "~/components/chat/chat-messages";
import { useQueryCallbacks } from "~/hooks/useQueryCallbacks";
import UserList from "~/components/common/UserList";
import GroupChatHeader from "~/components/chat/group/group-chat-header";
import MessageInput from "~/components/chat/MessageInput";
import { useGroupOptimisticUpdates } from "~/hooks/chat/useGroupOptimisticUpdates";
import { useConversationOptimisticUpdates } from "~/hooks/conversations/useConversationOptimisticUpdates";

const UserChat = () => {
  const router = useRouter();
  const groupId = router.query.id as string;
  const groupQuery = api.groups.getGroup.useQuery(groupId, {
    enabled: !!groupId,
  });
  const { addMessage } = useGroupOptimisticUpdates(groupId);
  const { readConversation } = useConversationOptimisticUpdates();

  const messagesQuery = api.groups.getMessages.useQuery(
    {
      targetGroupId: groupId,
    },
    {
      enabled: !!groupId,
    }
  );
  const messages = messagesQuery.data ?? [];

  const sendMessageMutation = api.groups.sendMessage.useMutation();

  const handleSendMessage = (message: string) => {
    addMessage(message);
    sendMessageMutation.mutate({
      message,
      targetGroupId: groupId,
    });
  };

  useQueryCallbacks({
    query: messagesQuery,
    onDataChanged: () => {
      readConversation(groupId);
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
