import { Box, Text, Flex, Stack, useColorModeValue } from "@chakra-ui/react";
import { type Session } from "next-auth";
import UserAvatar from "../../common/UserAvatar";

import MessageMeta from "./MessageMeta";

export type MessageGroup = {
  messages: {
    content: string;
    createdAt: Date;
    isSent: boolean;
  }[];
  user: Session["user"];
  isSelf: boolean;
};

const ChatMessageGroup = ({ messages, user, isSelf }: MessageGroup) => {
  const selfColor = useColorModeValue("blue.200", "blue.800");
  const otherColor = useColorModeValue("gray.400", "gray.600");

  if (messages.length === 0) return null;
  return (
    <Flex>
      <UserAvatar user={user} size="sm" />
      <Stack
        flexGrow={1}
        ml={2}
        position="relative"
        bgColor={isSelf ? selfColor : otherColor}
        spacing={1}
        _before={{
          maskImage:
            "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMycgaGVpZ2h0PSczJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxwYXRoIGZpbGw9J2JsYWNrJyBkPSdtIDAgMyBMIDMgMyBMIDMgMCBDIDMgMSAxIDMgMCAzJy8+PC9zdmc+)",
          content: "''",
          position: "absolute",
          bottom: 0,
          left: "-8px",
          height: "3px",
          width: "3px",
          // bgColor: isSelf ? selfColor : otherColor,
        }}
        _last={{
          borderBottomLeftRadius: "none",
        }}
      >
        {messages.map((message) => (
          <Box key={message.createdAt.getTime()}>
            <Text>{message.content}</Text>
            <MessageMeta
              createdAt={message.createdAt}
              isSent={message.isSent}
              isRead={false}
              isSelf={isSelf}
            />
          </Box>
        ))}
      </Stack>
    </Flex>
  );
};

export default ChatMessageGroup;
