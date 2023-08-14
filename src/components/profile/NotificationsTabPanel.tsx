import {
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Switch,
  TabPanel,
} from "@chakra-ui/react";
import { type ChangeEvent, useRef } from "react";

import { useNotificationsStore } from "~/stores/notifications";

const NotificationsTabPanel = () => {
  const setEnabledPreferences = useNotificationsStore(
    (state) => state.setEnabledPreferences
  );
  const enabledPreferences = useRef(
    useNotificationsStore.getState().enabledPreferences
  ).current;
  const handleSwitchChange =
    (field: keyof typeof enabledPreferences) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setEnabledPreferences({
        ...enabledPreferences,
        [field]: e.target.checked,
      });
    };
  return (
    <TabPanel display="flex" flexDirection="column" w="100%" h="100%" px={8}>
      <Heading mb={3} textAlign="center">
        Notification settings
      </Heading>

      <Stack>
        <FormControl>
          <FormLabel>On receiving messages</FormLabel>
          <Switch
            defaultChecked={enabledPreferences.messages}
            onChange={handleSwitchChange("messages")}
          />
        </FormControl>
        <FormControl>
          <FormLabel>On friend request updates</FormLabel>
          <Switch
            defaultChecked={enabledPreferences.friendRequests}
            onChange={handleSwitchChange("friendRequests")}
          />
        </FormControl>
      </Stack>
    </TabPanel>
  );
};

export default NotificationsTabPanel;
