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
import FadingSkeletonStack from "../common/FadingSkeletonStack";
import FriendSkeleton from "../friends/all-friends-panel/FriendSkeleton";

type Props = ChakraProps & {
  title?: string;
};

const OnlineFriends = ({ title = "Online Friends:", ...props }: Props) => {
  const friendsQuery = api.friends.getOnlineFriends.useQuery();
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
        {title}
      </Text>
      <FadingSkeletonStack
        count={5}
        element={<FriendSkeleton px={4} py={2} alignItems="center" />}
        isLoading={friendsQuery.isLoading}
      >
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
            There are no friends online.
          </Text>
        )}
      </FadingSkeletonStack>
    </chakra.aside>
  );
};

export default OnlineFriends;
