import {
  Divider,
  Flex,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import ProfileTabPanel from "~/components/profile/ProfileTabPanel";

const StyledTab = ({ children }: { children: ReactNode }) => (
  <Tab
    _selected={{
      bg: useColorModeValue("teal.500", "teal.900"),
      color: useColorModeValue("white", "gray.100"),
    }}
    fontSize={["sm", "md", "lg"]}
  >
    {children}
  </Tab>
);

const Profile = () => {
  return (
    <Tabs as={Flex} orientation="vertical" variant="line" h="100%">
      <TabList
        overflow="auto"
        minW="10rem"
        bgColor={useColorModeValue("gray.100", "gray.900")}
        borderRight="1px solid"
        borderColor={useColorModeValue("gray.400", "gray.600")}
      >
        <StyledTab>My Account</StyledTab>
        <Divider borderColor={useColorModeValue("gray.400", "gray.600")} />
        <StyledTab>Security</StyledTab>
      </TabList>
      <TabPanels
        flexGrow={1}
        minH="100%"
        display="flex"
        flexDir="column"
        alignItems="center"
      >
        <ProfileTabPanel />
      </TabPanels>
    </Tabs>
  );
};

export default Profile;
