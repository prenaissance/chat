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
import EditProfileTabPanel from "~/components/profile/edit-profile-tab-panel";
import ProfileTabPanel from "~/components/profile/ProfileTabPanel";
import {
  type ProfileTabsStore,
  useProfileTabsStore,
} from "~/stores/profile-tabs";

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

const activeTabsSelector = (state: ProfileTabsStore) => state.activeTab;
const tabsSetterSelector = (state: ProfileTabsStore) => state.setActiveTab;

const Profile = () => {
  const activeTab = useProfileTabsStore(activeTabsSelector);
  const setActiveTab = useProfileTabsStore(tabsSetterSelector);
  return (
    <Tabs
      isLazy
      index={activeTab}
      as={Flex}
      orientation="vertical"
      variant="line"
      h="100%"
      onChange={setActiveTab}
    >
      <TabList
        overflow="auto"
        minW="10rem"
        bgColor={useColorModeValue("gray.100", "gray.900")}
        borderRight="1px solid"
        borderColor={useColorModeValue("gray.400", "gray.600")}
      >
        <StyledTab>My Account</StyledTab>
        <StyledTab>Edit Profile</StyledTab>
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
        <EditProfileTabPanel />
      </TabPanels>
    </Tabs>
  );
};

export default Profile;
