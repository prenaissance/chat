import {
  Divider,
  Flex,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  useColorModeValue,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";

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
  const { status, data: session } = useSession();

  return (
    <Tabs as={Flex} orientation="vertical" variant="line" h="100%">
      <TabList
        overflow="auto"
        minW="10rem"
        bgColor={useColorModeValue("gray.100", "gray.900")}
        borderRight="1px solid"
        borderColor={useColorModeValue("gray.400", "gray.600")}
      >
        <StyledTab>Profile</StyledTab>
        <Divider borderColor={useColorModeValue("gray.400", "gray.600")} />
        <StyledTab>Security</StyledTab>
      </TabList>
      <TabPanels></TabPanels>
    </Tabs>
  );
};

export default Profile;
