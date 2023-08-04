import { type ChakraProps } from "@chakra-ui/react";
import { api } from "~/utils/api";
import UserList from "../common/UserList";

type Props = ChakraProps & {
  title?: string;
};

const OnlineFriends = (props: Props) => {
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
