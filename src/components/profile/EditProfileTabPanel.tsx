import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Heading,
  Input,
  SkeletonCircle,
  Stack,
  TabPanel,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { ProfileTabsStore, useProfileTabs } from "~/stores/profile-tabs";
import UserCard from "../common/UserCard";

const FieldInfo = ({ label, value }: { label: string; value: string }) => (
  <Stack spacing={0}>
    <Text color="gray.400" fontWeight="bold" textTransform="uppercase">
      {label}
    </Text>
    <Text>{value}</Text>
  </Stack>
);

const tabsSetterSelector = (state: ProfileTabsStore) => state.setActiveTab;

const EditProfileTabPanel = () => {
  const { status, data: session } = useSession();
  const panelColor = useColorModeValue("gray.300", "gray.700");
  return (
    <TabPanel display="flex" flexDirection="column" h="100%" w="100%" p={8}>
      <Heading as="h1" mb={3}>
        Profile Information
      </Heading>

      <Grid gridTemplateColumns="repeat(2, 1fr)" flexGrow={1} gap={6}>
        <GridItem>
          <FormControl w="sm" textTransform={"uppercase"}>
            <FormLabel color="gray.400">Username</FormLabel>
            <Input rounded="sm" variant="filled" bgColor={panelColor} />
          </FormControl>
        </GridItem>
        <GridItem>
          <Heading
            as="h2"
            color="gray.400"
            textTransform="uppercase"
            fontSize="lg"
            fontWeight="semibold"
            mb={2}
          >
            Preview
          </Heading>
          <UserCard user={session?.user} isOnline w="fit-content" />
        </GridItem>
      </Grid>
    </TabPanel>
  );
};

export default EditProfileTabPanel;
