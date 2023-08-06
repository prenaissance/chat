import { Box, Text, Flex, Stack, useColorModeValue } from "@chakra-ui/react";

import UserAvatar from "~/components/common/UserAvatar";
import MessageMeta from "./MessageMeta";
import { type ChatMessage } from "../types";
import { type UserInfo } from "~/components/common/types/user";

const URL_ENCODED_CHAT_TAIL_LEFT =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMycgaGVpZ2h0PSczJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxwYXRoIGZpbGw9J2JsYWNrJyBkPSdtIDAgMyBMIDMgMyBMIDMgMCBDIDMgMSAxIDMgMCAzJy8+PC9zdmc+";

const URL_ENCODED_CHAT_TAIL_RIGHT =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMycgaGVpZ2h0PSczJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxwYXRoIGZpbGw9J2JsYWNrJyBkPSdtIDAgMyBMIDEgMyBMIDMgMyBDIDIgMyAwIDEgMCAwJy8+PC9zdmc+";

export type UserMessageGroup = {
  messages: ChatMessage[];
  user: UserInfo;
  isSelf: boolean;
};

const ChatMessageGroup = ({ messages, user, isSelf }: UserMessageGroup) => {
  const selfColor = useColorModeValue("blue.200", "blue.800");
  const otherColor = useColorModeValue("gray.300", "gray.700");

  if (messages.length === 0) return null;
  const avatar = <UserAvatar user={user} size="sm" justifySelf="flex-end" />;
  return (
    <Flex alignItems="flex-end" px={2}>
      {!isSelf && avatar}
      <Stack
        flexGrow={1}
        mx={2}
        position="relative"
        spacing={1}
        _before={{
          maskImage: `url(${
            isSelf ? URL_ENCODED_CHAT_TAIL_RIGHT : URL_ENCODED_CHAT_TAIL_LEFT
          })`,
          content: "''",
          maskSize: "contain",
          position: "absolute",
          bottom: 0,
          left: isSelf ? undefined : "-6px",
          right: isSelf ? "-6px" : undefined,
          height: "6px",
          width: "6px",
          bgColor: isSelf ? selfColor : otherColor,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.createdAt.getTime()}
            w="fit-content"
            maxW="60%"
            borderTopLeftRadius="md"
            borderTopRightRadius="md"
            borderBottomLeftRadius="md"
            borderBottomRightRadius="md"
            bgColor={isSelf ? selfColor : otherColor}
            px={2}
            alignSelf={isSelf ? "flex-end" : "flex-start"}
            _first={{
              borderTopRadius: "lg",
            }}
            _last={{
              borderBottomRightRadius: isSelf ? "none" : "lg",
              borderBottomLeftRadius: isSelf ? "lg" : "none",
            }}
          >
            <Text>
              {message.content}
              <MessageMeta
                createdAt={message.createdAt}
                isSent={message.isSent}
                isRead={true}
                isSelf={isSelf}
              />
            </Text>
          </Box>
        ))}
      </Stack>
      {isSelf && avatar}
    </Flex>
  );
};

export default ChatMessageGroup;
