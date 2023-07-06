import {
  Box,
  HStack,
  Skeleton,
  SkeletonCircle,
  Stack,
  type StackProps,
  useColorModeValue,
  Flex,
  Text,
} from "@chakra-ui/react";
import { MessageTarget } from "@prisma/client";
import Link from "next/link";
import NextLink from "next/link";

import { type RouterOutputs, api } from "~/utils/api";
import UserAvatar from "../common/UserAvatar";
import { formatSocialMediaDate } from "~/utils/formatting";

const StyledStack = (props: StackProps) => (
  <Stack
    p={1}
    as="nav"
    h="100%"
    w={60}
    borderRight="1px solid"
    borderColor={useColorModeValue("gray.400", "gray.600")}
    {...props}
  />
);

const Conversation = ({
  data,
}: {
  data: RouterOutputs["conversations"]["getConversations"][number];
}) => {
  const isUser = data.targetType === MessageTarget.User;

  return (
    <Link
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
              <Text
                fontSize="sm"
                color={useColorModeValue("gray.700", "gray.300")}
              >
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
    </Link>
  );
};

const ChatSideBar = () => {
  const conversationsQuery = api.conversations.getConversations.useQuery();
  const conversations = conversationsQuery.data ?? [];

  if (conversationsQuery.isLoading) {
    return (
      <StyledStack>
        {new Array(3).fill(0).map((_, i) => (
          <HStack key={i}>
            <SkeletonCircle />
            <Stack gap={2}>
              <Skeleton height="1rem" width="5rem" />
              <Skeleton height="1rem" width="10rem" />
            </Stack>
            <Skeleton height="1rem" width="1rem" />
          </HStack>
        ))}
      </StyledStack>
    );
  }

  if (conversations.length === 0) {
    return <StyledStack>No conversations</StyledStack>;
  }

  return (
    <StyledStack>
      {conversations.map((conversation) => (
        <Conversation key={conversation.id} data={conversation} />
      ))}
    </StyledStack>
  );
};

export default ChatSideBar;
