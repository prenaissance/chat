import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { Box, Stack, type BoxProps } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { MessageSource } from "@prisma/client";
import { useRouter } from "next/router";

import ChatMessageGroup, { type UserMessageGroup } from "./chat-message-group";
import SystemMessageGroupComponent, {
  type SystemMessageGroup,
} from "./system-message-group";
import { type MessageDTO } from "~/shared/dtos/chat";

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

type Props = { messages: MessageDTO[]; isLoading: boolean } & BoxProps;

export const ChatMessages = ({ messages, isLoading, ...props }: Props) => {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const session = useSession();
  const stackRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasScrolledInitiallyRef = useRef(false);
  const interceptionObserverRef = useRef<IntersectionObserver | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({
      block: "start",
    });
  }, []);

  const shouldScrollOnIncomingMessage = useCallback(() => {
    // check if the if the previous last message is visible
    const messageElements = stackRef.current?.children;
    if (!messageElements || messageElements.length < 3) {
      return false;
    }
    const secondLastMessageElement =
      messageElements[messageElements.length - 3]!;

    // calculate if the second last element is visible inside the stack
    const stackRect = stackRef.current.getBoundingClientRect();
    const secondLastMessageRect =
      secondLastMessageElement.getBoundingClientRect();
    const isSecondLastMessageVisible =
      secondLastMessageRect.top >= stackRect.top &&
      secondLastMessageRect.bottom <= stackRect.bottom;

    return isSecondLastMessageVisible;
  }, []);

  useEffect(() => {
    router.events.on("routeChangeComplete", scrollToBottom);

    return () => router.events.off("routeChangeComplete", scrollToBottom);
  }, [router.events, id, scrollToBottom]);

  useEffect(() => {
    const lastMessageSenderId = messages.at(-1)?.fromId;
    const shouldScrollToBottom =
      (hasScrolledInitiallyRef.current &&
        lastMessageSenderId === session.data?.user?.id) ||
      shouldScrollOnIncomingMessage();

    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [
    messages,
    session.data?.user?.id,
    scrollToBottom,
    shouldScrollOnIncomingMessage,
  ]);

  useLayoutEffect(() => {
    const shouldScrollToBottom =
      bottomRef.current && !isLoading && id && !hasScrolledInitiallyRef.current;

    if (shouldScrollToBottom) {
      scrollToBottom();
      hasScrolledInitiallyRef.current = true;
    }
  }, [isLoading, id, scrollToBottom]);

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

  if (isLoading || session.status === "loading") {
    return <ChatMessagesSkeleton {...props} />;
  }
  return (
    <Stack {...props} gap={2} ref={stackRef}>
      {messageGroups.map((group, index) => {
        const Component = messageGroupComponentMap[group.type];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Component key={index} {...(group.messageGroup as any)} />;
      })}
      <Box ref={bottomRef} />
    </Stack>
  );
};

export default ChatMessages;
