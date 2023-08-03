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
import UserList from "../common/UserList";

type Props = ChakraProps & {
  title?: string;
};

const OnlineFriends = ({ title = "Online Friends:", ...props }: Props) => {
  const friendsQuery = api.friends.getOnlineFriends.useQuery();

  return (
    <UserList
      {...props}
      title="Online Friends:"
      fallbackDescription="No friends online"
      isLoading={friendsQuery.isLoading}
      users={friendsQuery.data}
    />
  );
};

export default OnlineFriends;
