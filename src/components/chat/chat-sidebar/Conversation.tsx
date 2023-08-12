import { Box, HStack, useColorModeValue, Flex, Text } from "@chakra-ui/react";
import { MessageTarget } from "@prisma/client";
import NextLink from "next/link";

import { type RouterOutputs } from "~/utils/api";
import UserAvatar from "~/components/common/UserAvatar";
import { formatSocialMediaDate } from "~/utils/formatting";

const Conversation = ({
  data,
}: {
  data: RouterOutputs["conversations"]["getConversations"][number];
}) => {
  const isUser = data.targetType === MessageTarget.User;
  const lastMessageColor = useColorModeValue("gray.700", "gray.300");

  return (
    <NextLink
      href={`/chat/${data.targetType.toLowerCase()}/${
        isUser ? data.targetUserId : data.targetGroupId
      }`}
    >
      <HStack
        p={1}
        spacing={2}
        cursor="pointer"
        _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
      >
        <UserAvatar
          user={isUser ? data.targetUser : data.targetGroup}
          size="sm"
        />
        <Box flexGrow={1} h="100%">
          <HStack>
            <Text fontWeight="bold">
              {isUser ? data.targetUser.name : data.targetGroup.name}
            </Text>
            {data.lastMessage && (
              <Text fontSize="sm" color="gray.500" ml="auto">
                {formatSocialMediaDate(data.lastMessage.createdAt)}
              </Text>
            )}
          </HStack>
          <HStack>
            {data.lastMessage && (
              <Text noOfLines={1} fontSize="sm" color={lastMessageColor}>
                {data.lastMessage.content}
              </Text>
            )}
            {data.unreadCount > 0 && (
              <Flex
                alignItems="center"
                justifyContent="center"
                bg="gray.500"
                borderRadius="full"
                ml="auto"
                w={5}
                h={5}
              >
                <Text fontSize="xs" color="white">
                  {data.unreadCount}
                </Text>
              </Flex>
            )}
          </HStack>
        </Box>
      </HStack>
    </NextLink>
  );
};

export default Conversation;
