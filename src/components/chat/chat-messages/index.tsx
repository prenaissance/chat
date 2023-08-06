import { useMemo } from "react";
import { Box, Stack, type BoxProps } from "@chakra-ui/react";
import { useSession } from "next-auth/react";

import { type ChatStore, useChatStore } from "~/stores/chat";
import ChatMessageGroup, { type UserMessageGroup } from "./chat-message-group";
import { MessageSource } from "@prisma/client";
import SystemMessageGroupComponent, {
  type SystemMessageGroup,
} from "./system-message-group";

const messagesSelector = (state: ChatStore) => state.messages;
const isLoadingMessagesSelector = (state: ChatStore) => state.isLoadingMessages;

const ChatMessagesSkeleton = (props: BoxProps) => (
  <Box {...props}>Placeholder</Box>
);

type MessageGroup =
  | {
      type: typeof MessageSource.User;
      messageGroup: UserMessageGroup;
    }
  | {
      type: typeof MessageSource.System;
      messageGroup: SystemMessageGroup;
    };

const messageGroupComponentMap = {
  [MessageSource.User]: ChatMessageGroup,
  [MessageSource.System]: SystemMessageGroupComponent,
};

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

      if (
        lastGroup?.messageGroup?.user?.id === message.fromId &&
        lastGroup?.type === message.source
      ) {
        lastGroup.messageGroup.messages.push({
          content: message.content,
          createdAt: message.createdAt,
          isSent: true,
        });
      } else {
        if (message.source === MessageSource.System) {
          groups.push({
            type: MessageSource.System,
            messageGroup: {
              messages: [
                {
                  content: message.content,
                  createdAt: message.createdAt,
                  isSent: true,
                },
              ],
              user: message.from,
            },
          });
        }
        if (message.source === MessageSource.User) {
          groups.push({
            type: MessageSource.User,
            messageGroup: {
              messages: [
                {
                  content: message.content,
                  createdAt: message.createdAt,
                  isSent: true,
                },
              ],
              user: message.from,
              isSelf: message.fromId === session.data?.user?.id,
            },
          });
        }
      }

      return groups;
    }, [] as MessageGroup[]);
  }, [messages, session.data?.user?.id]);

  const isLoading = isLoadingMessages || session.status === "loading";
  if (isLoading) {
    return <ChatMessagesSkeleton {...props} />;
  }
  return (
    <Stack {...props} gap={2}>
      {messageGroups.map((group, index) => {
        const Component = messageGroupComponentMap[group.type];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Component key={index} {...(group.messageGroup as any)} />;
      })}
    </Stack>
  );
};

export default ChatMessages;
