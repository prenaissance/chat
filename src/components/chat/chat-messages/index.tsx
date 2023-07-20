import { useMemo } from "react";
import { Box, Stack, type BoxProps } from "@chakra-ui/react";
import { useSession } from "next-auth/react";

import { type ChatStore, useChatStore } from "~/stores/chat";
import ChatMessageGroup, { type MessageGroup } from "./ChatMessageGroup";
import { pick } from "~/utils/reflections";

const messagesSelector = (state: ChatStore) => state.messages;
const isLoadingMessagesSelector = (state: ChatStore) => state.isLoadingMessages;

const ChatMessagesSkeleton = (props: BoxProps) => (
  <Box {...props}>Placeholder</Box>
);

type Props = BoxProps;

export const ChatMessages = ({ ...props }: Props) => {
  const messages = useChatStore(messagesSelector);
  const isLoadingMessages = useChatStore(isLoadingMessagesSelector);
  const session = useSession();

  const messageGroups: MessageGroup[] = useMemo(() => {
    if (!messages.length) {
      return [];
    }
    return messages.reduce((groups, message) => {
      const lastGroup = groups[groups.length - 1];

      if (lastGroup?.user?.id === message.fromId) {
        lastGroup.messages.push({
          content: message.content,
          createdAt: message.createdAt,
          isSent: true,
        });
      } else {
        groups.push({
          messages: [
            {
              content: message.content,
              createdAt: message.createdAt,
              isSent: true,
            },
          ],
          user: pick(message.from, ["id", "name", "image", "isOnline"]),
          isSelf: message.fromId === session.data?.user?.id,
        });
      }

      return groups;
    }, [] as MessageGroup[]);
  }, [messages, session.data?.user?.id]);

  const isLoading = isLoadingMessages || session.status === "loading";
  if (isLoading) {
    return <ChatMessagesSkeleton {...props} />;
  }
  return (
    <Stack {...props} gap={1}>
      {messageGroups.map((group, index) => (
        <ChatMessageGroup key={index} {...group} />
      ))}
    </Stack>
  );
};

export default ChatMessages;
