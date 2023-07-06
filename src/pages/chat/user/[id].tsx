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
  InputGroup,
} from "@chakra-ui/react";
import { MessageTarget } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useState,
} from "react";
import ChatLayout from "~/components/chat/ChatLayout";
import UserAvatar from "~/components/common/UserAvatar";
import { type ChatStore, useChatStore } from "~/stores/chat";
import { api } from "~/utils/api";

const selector = ({ messages, setMessages }: ChatStore) => ({
  messages,
  setMessages,
});

const UserChat = () => {
  const { messages, setMessages } = useChatStore(selector);
  const router = useRouter();
  const userId = router.query.id as string;
  const session = useSession();
  const sessionIsLoaded = session.status !== "loading";

  const [typedMessage, setTypedMessage] = useState("");

  const messagesQuery = api.chat.getMessages.useQuery({
    targetId: userId,
    targetType: MessageTarget.User,
  });
  const sendMessageMutation = api.chat.sendMessage.useMutation();

  const handleTypedMessageChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTypedMessage(e.target.value);
  const handleSendMessage = () =>
    sendMessageMutation.mutate({
      message: typedMessage,
      targetId: userId,
      targetType: MessageTarget.User,
    });

  useEffect(() => {
    if (messagesQuery.isSuccess) {
      setMessages(messagesQuery.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesQuery.isSuccess]);

  return (
    <ChatLayout>
      <Flex h="100%" w="100%">
        <Box flexGrow={1}>
          <HStack
            py={1}
            px={2}
            as="header"
            h={12}
            shadow="lg"
            bgColor={useColorModeValue("white", "gray.800")}
          >
            <UserAvatar user={session.data?.user} size="sm" isOnline />
            <Skeleton isLoaded={sessionIsLoaded} w="min(12rem, 50%)">
              <chakra.h1 fontSize="xl">
                {session.data?.user.name ?? "Placeholder Name"}
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
          <Flex direction="column" px={2} pb={4}>
            <Box flexGrow={1} overflowY="auto">
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
            >
              <Input
                placeholder="Type a new message"
                value={typedMessage}
                onChange={handleTypedMessageChange}
              />
              <IconButton
                type="submit"
                aria-label="Send message"
                icon={<ArrowForwardIcon />}
                onClick={handleSendMessage}
                disabled={!typedMessage}
              />
            </chakra.form>
          </Flex>
        </Box>
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
