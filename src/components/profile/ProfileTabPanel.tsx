import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  Stack,
  TabPanel,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  type ProfileTabsStore,
  useProfileTabsStore,
} from "~/stores/profile-tabs";
import UserAvatar from "../common/UserAvatar";
import { api } from "~/utils/api";

const FieldInfo = ({ label, value }: { label: string; value: string }) => (
  <Stack spacing={0}>
    <Text color="gray.400" fontWeight="bold" textTransform="uppercase">
      {label}
    </Text>
    <Text>{value}</Text>
  </Stack>
);

const tabsSetterSelector = (state: ProfileTabsStore) => state.setActiveTab;

const ProfileTabPanel = () => {
  const profileQuery = api.profile.getProfile.useQuery();
  const setActiveTab = useProfileTabsStore(tabsSetterSelector);
  const panelColor = useColorModeValue("gray.300", "gray.700");
  return (
    <TabPanel display="flex" flexDirection="column" h="100%">
      <Heading mb={3} textAlign="center">
        Profile Information
      </Heading>

      <Box maxW="lg" rounded="xl" shadow="xl" bgColor={panelColor} p={4}>
        <HStack spacing={2} mt="6rem" alignItems="flex-end">
          <UserAvatar
            user={profileQuery.data}
            size="2xl"
            isOnline
            badgeBorderColor={panelColor}
          />
          <Text fontSize="3xl" fontWeight="bold">
            {profileQuery.data?.name ?? "Placeholder Name"}
          </Text>
          <Button
            bg={useColorModeValue("teal.500", "teal.900")}
            _hover={{ bg: useColorModeValue("teal.600", "teal.800") }}
            justifySelf="flex-end"
            shadow="md"
            onClick={() => setActiveTab(1)}
          >
            Edit Profile
          </Button>
        </HStack>
        <Stack
          p={4}
          spacing={4}
          mt={8}
          rounded="md"
          bgColor={useColorModeValue("gray.400", "gray.800")}
        >
          <FieldInfo
            label="Name"
            value={profileQuery.data?.name ?? "Default Name"}
          />
          <FieldInfo
            label="Email"
            value={profileQuery.data?.email ?? "Unset"}
          />
        </Stack>
      </Box>

      <Divider my={2} />
    </TabPanel>
  );
};

export default ProfileTabPanel;
