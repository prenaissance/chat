import {
  Box,
  HStack,
  Skeleton,
  SkeletonCircle,
  Stack,
  type StackProps,
  useColorModeValue,
} from "@chakra-ui/react";
import { type RouterOutputs, api } from "~/utils/api";

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
}) => <HStack></HStack>;

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
