import { useEffect, useState } from "react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Show,
  useColorModeValue,
  chakra,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { shallow } from "zustand/shallow";

import ChatLayout from "~/components/chat/ChatLayout";
import { type ChatStore, useChatStore } from "~/stores/chat";
import { api } from "~/utils/api";
import ChatMessages from "~/components/chat/chat-messages";
import { useQueryCallbacks } from "~/hooks/useQueryCallbacks";
import UserList from "~/components/common/UserList";
import GroupChatHeader from "~/components/chat/group/group-chat-header";

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
    addMessage,
    readUserConversation,
    setIsLoadingMessages,
  } = useChatStore(selector, shallow);
  const router = useRouter();
  const groupId = router.query.id as string;
  const groupQuery = api.groups.getGroup.useQuery(groupId, {
    enabled: !!groupId,
  });

  const [typedMessage, setTypedMessage] = useState("");

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

  const handleTypedMessageChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTypedMessage(e.target.value);
  const handleSendMessage = () => {
    sendMessageMutation.mutate({
      message: typedMessage,
      targetGroupId: groupId,
    });

    setTypedMessage("");
  };

  // might be bad pattern, but this branch is not subscribed to conversations
  useEffect(
    () => readUserConversation(groupId),
    [groupId, readUserConversation]
  );

  useQueryCallbacks({
    query: messagesQuery,
    onSuccess: () => setIsLoadingMessages(false),
    onDataChanged: setMessages,
  });

  return (
    <ChatLayout>
      <Flex h="100%" w="100%">
        <Flex flexDirection="column" flexGrow={1}>
          <GroupChatHeader />
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
  );
};

export default UserChat;
