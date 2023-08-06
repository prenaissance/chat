import {
  Flex,
  Show,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  useColorModeValue,
} from "@chakra-ui/react";
import Head from "next/head";
import ChatLayout from "~/components/chat/ChatLayout";
import OnlineFriends from "~/components/chat/OnlineFriends";
import AllFriendsPanel from "~/components/friends/all-friends-panel";
import ReceivedFriendRequestsPanel from "~/components/friends/received-friend-requests-panel";
import SentFriendRequestsPanel from "~/components/friends/sent-friend-requests-panel";

const Friends = () => {
  return (
    <>
      <Head>
        <title>Friends</title>
        <meta name="description" content="Friends control panel" />
      </Head>
      <ChatLayout>
        <Flex h="100%" w="100%">
          <Tabs
            display="flex"
            isLazy
            w="100%"
            flexDirection="column"
            alignItems="center"
            flexGrow={1}
          >
            <TabList
              w="100%"
              borderColor={useColorModeValue("gray.400", "gray.600")}
            >
              <Tab>All Friends</Tab>
              <Tab>Sent Friend Requests</Tab>
              <Tab>Received Friend Requests</Tab>
            </TabList>
            <TabPanels>
              <AllFriendsPanel />
              <SentFriendRequestsPanel />
              <ReceivedFriendRequestsPanel />
            </TabPanels>
          </Tabs>
          <Show above="xl">
            <OnlineFriends
              borderLeftWidth="1px"
              borderColor={useColorModeValue("gray.400", "gray.600")}
              h="100%"
            />
          </Show>
        </Flex>
      </ChatLayout>
    </>
  );
};

export default Friends;
