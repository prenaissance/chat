import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  TabPanel,
  useColorModeValue,
} from "@chakra-ui/react";

import { useProfileTabsStore } from "~/stores/profile-tabs";
import UserCard from "../../common/UserCard";
import FileUpload from "../../common/FileUpload";
import { api } from "~/utils/api";
import { useQueryCallbacks } from "~/hooks/useQueryCallbacks";
import { blobToBase64DataUrl } from "~/utils/encoding";
import ConfirmationAlert from "./ConfirmationAlert";

const EditProfileTabPanel = () => {
  const editUser = useProfileTabsStore((state) => state.editUser);
  const setEditUser = useProfileTabsStore((state) => state.setEditUser);
  const profileQuery = api.profile.getProfile.useQuery();
  const panelColor = useColorModeValue("gray.300", "gray.700");
  useQueryCallbacks({
    query: profileQuery,
    onSuccess(data) {
      setEditUser({
        name: data.name,
        image: data.image,
      });
    },
  });

  return (
    <>
      <TabPanel display="flex" flexDirection="column" h="100%" w="100%" p={8}>
        <Heading as="h1" mb={3}>
          Profile Information
        </Heading>

        <Grid gridTemplateColumns="repeat(2, 1fr)" flexGrow={1} gap={6}>
          <GridItem>
            <FormControl w="sm" textTransform="uppercase">
              <FormLabel color="gray.400">Username</FormLabel>
              <Input
                minLength={1}
                maxLength={50}
                value={editUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
                rounded="sm"
                variant="filled"
                bgColor={panelColor}
              />
            </FormControl>
            <FormControl w="sm" textTransform="uppercase">
              <FormLabel color="gray.400">Avatar</FormLabel>
              <ButtonGroup
                w="100%"
                display="flex"
                justifyContent="space-between"
              >
                <FileUpload
                  label="Upload Avatar"
                  accept="image/*"
                  capture="user"
                  multiple={false}
                  onChange={(e) => {
                    if (e.target.files?.length ?? 0 > 0) {
                      void blobToBase64DataUrl(e.target.files![0]!).then(
                        (dataUrl) => {
                          setEditUser({ ...editUser, image: dataUrl });
                        }
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => setEditUser({ ...editUser, image: null })}
                >
                  Remove Avatar
                </Button>
              </ButtonGroup>
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
            <UserCard
              user={
                profileQuery.isLoading
                  ? undefined
                  : {
                      id: profileQuery.data?.id ?? "",
                      ...editUser,
                    }
              }
              isOnline
              w="fit-content"
            />
          </GridItem>
        </Grid>
      </TabPanel>
      <ConfirmationAlert />
    </>
  );
};

export default EditProfileTabPanel;
