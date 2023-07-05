import { InfoIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Show,
  useColorModeValue,
  chakra,
  HStack,
  Skeleton,
  IconButton,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import ChatLayout from "~/components/chat/ChatLayout";
import UserAvatar from "~/components/common/UserAvatar";

const UserChat = () => {
  const router = useRouter();
  const userId = router.query.id as string;
  const session = useSession();
  const sessionIsLoaded = session.status !== "loading";

  return (
    <ChatLayout>
      <Flex h="100%" w="100%">
        <Box flexGrow={1}>
          <HStack
            py={1}
            px={2}
            as="header"
            h={12}
            shadow="lg"
            bgColor={useColorModeValue("white", "gray.800")}
          >
            <UserAvatar user={session.data?.user} size="sm" isOnline />
            <Skeleton isLoaded={sessionIsLoaded} w="min(12rem, 50%)">
              <chakra.h1 fontSize="xl">
                {session.data?.user.name ?? "Placeholder Name"}
              </chakra.h1>
            </Skeleton>

            <IconButton
              ml="auto"
              variant="ghost"
              size="md"
              aria-label="Info about user"
              icon={<InfoIcon />}
            />
          </HStack>
        </Box>
        <Show above="xl">
          <chakra.aside
            w={80}
            h="100%"
            borderLeft="1px solid"
            borderColor={useColorModeValue("gray.400", "gray.600")}
          ></chakra.aside>
        </Show>
      </Flex>
    </ChatLayout>
  );
};

export default UserChat;
