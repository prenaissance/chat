import {
  Flex,
  HStack,
  IconButton,
  Show,
  Text,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { AiOutlineSend } from "react-icons/ai";
import NextLink from "next/link";

import ChatLayout from "~/components/chat/ChatLayout";
import UserAvatar from "~/components/common/UserAvatar";
import { api } from "~/utils/api";

const Chat = () => {
  const friendsQuery = api.friends.getFriends.useQuery();
  const friends = friendsQuery.data ?? [];

  return (
    <ChatLayout>
      <Flex h="100%" w="100%">
        <Flex flexDirection="column" m={8} alignItems="center" flexGrow={1}>
          <Text
            fontSize="3xl"
            color={useColorModeValue("gray.700", "gray.300")}
          >
            Start a conversation by clicking a user or group on the left or
            finding someone through the search bar.
          </Text>
        </Flex>
        <Show above="xl">
          <chakra.aside
            w={80}
            h="100%"
            borderLeft="1px solid"
            borderColor={useColorModeValue("gray.400", "gray.600")}
          >
            <Text
              textAlign="start"
              fontWeight="bold"
              letterSpacing={1.2}
              px={4}
              py={2}
            >
              Friends:
            </Text>
            {friends.length ? (
              friends.map((friend) => (
                <HStack
                  key={friend.id}
                  w="100%"
                  px={4}
                  py={2}
                  alignItems="center"
                >
                  <UserAvatar user={friend} size="sm" />
                  <Text>{friend.name}</Text>
                  <IconButton
                    ml="auto"
                    as={NextLink}
                    href={`/chat/user/${friend.id}`}
                    aria-label={`Open chat with ${friend.name}`}
                    icon={<AiOutlineSend />}
                    rounded="md"
                    size="sm"
                  />
                </HStack>
              ))
            ) : (
              <Text
                px={4}
                py={2}
                color={useColorModeValue("gray.700", "gray.300")}
              >
                You don't have any friends yet.
              </Text>
            )}
          </chakra.aside>
        </Show>
      </Flex>
    </ChatLayout>
  );
};

export default Chat;
