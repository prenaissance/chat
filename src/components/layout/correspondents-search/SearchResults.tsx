import {
  Avatar,
  Box,
  type ChakraProps,
  HStack,
  Link,
  ListItem,
  Text,
  UnorderedList,
  Spinner,
  useColorModeValue,
  Tooltip,
  Icon,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { MessageTarget } from "@prisma/client";
import { api, type RouterOutputs } from "~/utils/api";
import { AiOutlineSend, AiOutlinePlus, AiOutlineUserAdd } from "react-icons/ai";
import { MdOutlinePending } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { FriendStatus } from "~/shared/dtos/friends";

const FriendActionButton = ({
  name,
  friendStatus,
  targetUserId,
}: {
  name: string;
  friendStatus: FriendStatus;
  targetUserId: string;
}) => {
  const queryClient = api.useContext();
  const toast = useToast();
  const addFriendMutation = api.friends.addFriend.useMutation({
    onSuccess: () => {
      void queryClient.correspondents.search.invalidate();
      toast({
        title: `Friend request sent to ${name}`,
        status: "success",
      });
    },
  });

  const cancelFriendRequestMutation =
    api.friends.cancelFriendRequest.useMutation({
      onSuccess: () => {
        void queryClient.correspondents.search.invalidate();
        toast({
          title: `Friend request to ${name} cancelled`,
          status: "success",
        });
      },
    });

  const acceptFriendRequestMutation =
    api.friends.acceptFriendRequest.useMutation({
      onSuccess: () => {
        void queryClient.correspondents.search.invalidate();
        toast({
          title: `Friend request from ${name} accepted`,
          status: "success",
        });
      },
    });

  switch (friendStatus) {
    case FriendStatus.None:
      return (
        <Tooltip label={`Send friend request to ${name}`} placement="right">
          <IconButton
            aria-label={`Send friend request to ${name}`}
            size="sm"
            isLoading={addFriendMutation.isLoading}
            onClick={() => {
              addFriendMutation.mutate({
                targetUserId,
              });
            }}
          >
            <Icon as={AiOutlinePlus} />
          </IconButton>
        </Tooltip>
      );
    case FriendStatus.Sent:
      return (
        <Tooltip label={`Cancel friend request to ${name}`} placement="right">
          <IconButton
            aria-label={`Cancel friend request to ${name}`}
            size="sm"
            isLoading={cancelFriendRequestMutation.isLoading}
            onClick={() => {
              cancelFriendRequestMutation.mutate({
                targetUserId,
              });
            }}
          >
            <Icon as={MdOutlinePending} />
          </IconButton>
        </Tooltip>
      );
    case FriendStatus.Received:
      return (
        <Tooltip label={`Accept friend request from ${name}`} placement="right">
          <IconButton
            aria-label={`Accept friend request from ${name}`}
            size="sm"
            isLoading={acceptFriendRequestMutation.isLoading}
            onClick={() => {
              acceptFriendRequestMutation.mutate({
                targetUserId,
              });
            }}
          >
            <Icon as={AiOutlineUserAdd} />
          </IconButton>
        </Tooltip>
      );
    case FriendStatus.Friends:
      <Tooltip label={`Already friends with ${name}`} placement="right">
        <IconButton aria-label={`Already friends with ${name}`} size="sm">
          <Icon as={FaUserFriends} />
        </IconButton>
      </Tooltip>;
    default:
      return null;
  }
};

type SearchResultProps =
  | {
      name: string;
      targetId: string;
      targetType: typeof MessageTarget.User;
      avatarSrc?: string | null;
      friendStatus: FriendStatus;
    }
  | {
      name: string;
      targetId: string;
      targetType: typeof MessageTarget.Group;
      avatarSrc?: string | null;
    };

const SearchResult = (props: SearchResultProps) => {
  const { name, targetId, targetType, avatarSrc } = props;
  const href = `/chat/${targetType.toLowerCase()}/${targetId}`;

  return (
    <HStack px={0} alignContent="flex-start" py={1}>
      <Avatar size="sm" src={avatarSrc ?? undefined} />
      <Text mr="auto">{name}</Text>
      {targetType == MessageTarget.User && (
        <FriendActionButton
          name={name}
          friendStatus={props.friendStatus}
          targetUserId={targetId}
        />
      )}
      <Tooltip label={`Open chat with ${name}`} placement="right">
        <Link as={NextLink} href={href}>
          <Icon
            as={AiOutlineSend}
            rounded="md"
            h={6}
            w={6}
            _hover={{
              bgColor: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
            }}
          />
        </Link>
      </Tooltip>
    </HStack>
  );
};
type SearchResultsProps = RouterOutputs["correspondents"]["search"] &
  ChakraProps & {
    query: string;
    isLoading: boolean;
  };

const SearchResults = ({
  isLoading,
  query,
  users,
  groups,
  ...props
}: SearchResultsProps) => {
  const totalLength = users.length + groups.length;
  if (query.length === 0) {
    return <Text {...props}>Search for a user or group</Text>;
  }
  if (isLoading) {
    return (
      <HStack {...props}>
        <Spinner />
        <Text>Loading</Text>
      </HStack>
    );
  }

  if (totalLength === 0) {
    return <Text {...props}>No results found</Text>;
  }

  return (
    <Box {...props}>
      {!!users.length && (
        <>
          <Text fontSize="sm" fontWeight="bold" color="gray.400">
            Users
          </Text>
          <UnorderedList listStyleType="none">
            {users.map((user) => (
              <ListItem key={user.id}>
                <SearchResult
                  name={user.name ?? "Unknown"}
                  targetId={user.id}
                  targetType={MessageTarget.User}
                  avatarSrc={user.image}
                  friendStatus={user.friendStatus}
                />
              </ListItem>
            ))}
          </UnorderedList>
        </>
      )}
      {!!groups.length && (
        <>
          <Text fontSize="sm" fontWeight="bold" color="gray.400">
            Groups
          </Text>
          <UnorderedList listStyleType="none">
            {groups.map((group) => (
              <ListItem key={group.id}>
                <SearchResult
                  name={group.name}
                  targetId={group.id}
                  targetType={MessageTarget.Group}
                />
              </ListItem>
            ))}
          </UnorderedList>
        </>
      )}
    </Box>
  );
};

export default SearchResults;
