import {
  type ChakraProps,
  chakra,
  useColorModeValue,
  Text,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import NextLink from "next/link";

import UserAvatar from "../common/UserAvatar";
import { api } from "~/utils/api";
import { AiOutlineSend } from "react-icons/ai";

const OnlineFriends = (props: ChakraProps) => {
  const friendsQuery = api.friends.getFriends.useQuery();
  const friends = friendsQuery.data ?? [];
  const messageColor = useColorModeValue("gray.700", "gray.300");

  return (
    <chakra.aside w={80} {...props}>
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
          <HStack key={friend.id} w="100%" px={4} py={2} alignItems="center">
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
        <Text px={4} py={2} color={messageColor}>
          You don't have any friends yet.
        </Text>
      )}
    </chakra.aside>
  );
};

export default OnlineFriends;
