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
} from "@chakra-ui/react";
import NextLink from "next/link";
import { MessageTarget } from "@prisma/client";
import { type RouterOutputs } from "~/utils/api";
import { ChevronRightIcon } from "@chakra-ui/icons";

type SearchResultProps = {
  name: string;
  targetId: string;
  targetType: MessageTarget;
  avatarSrc?: string | null;
};

const SearchResult = ({
  name,
  targetId,
  targetType,
  avatarSrc,
}: SearchResultProps) => {
  const href = `/chat/${targetType.toLowerCase()}/${targetId}`;

  return (
    <HStack px={0} alignContent="flex-start" py={1}>
      <Avatar size="sm" src={avatarSrc ?? undefined} />
      <Text>{name}</Text>
      <Tooltip label={`Open chat with ${name}`} placement="right">
        <Link as={NextLink} href={href}>
          <ChevronRightIcon
            rounded="full"
            h={6}
            w={6}
            bgColor={useColorModeValue("gray.400", "gray.700")}
            _hover={{
              bgColor: useColorModeValue("gray.500", "gray.600"),
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
