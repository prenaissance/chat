import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Slide,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { shallow } from "zustand/shallow";
import { useProfileTabsStore } from "~/stores/profile-tabs";
import { api } from "~/utils/api";
import { pick } from "~/utils/reflections";

const ConfirmationAlert = () => {
  const queryClient = api.useContext();
  const profileQuery = api.profile.getProfile.useQuery();
  const toast = useToast();
  const editUser = useProfileTabsStore((state) => state.editUser);
  const setEditUser = useProfileTabsStore((state) => state.setEditUser);

  const updateProfileMutation = api.profile.updateProfile.useMutation({
    onSuccess: (data) => {
      void queryClient.profile.invalidate();
      setEditUser({
        name: data.name,
        image: data.image,
      });
    },
    onError: (error) =>
      toast({
        status: "error",
        description: error.message,
        position: "top",
        isClosable: true,
      }),
  });

  const areDetailsChanged = useMemo(
    () =>
      !profileQuery.isLoading &&
      !shallow(editUser, pick(profileQuery.data!, ["name", "image"])),
    [editUser, profileQuery.data, profileQuery.isLoading]
  );
  const handleDiscard = useCallback(
    () =>
      profileQuery.data &&
      setEditUser({
        name: profileQuery.data.name,
        image: profileQuery.data.image,
      }),
    [profileQuery.data, setEditUser]
  );
  const handleUpdate = useCallback(
    () => updateProfileMutation.mutate(editUser),
    [editUser, updateProfileMutation]
  );

  return (
    <Slide direction="bottom" in={areDetailsChanged}>
      <Alert
        zIndex="toast"
        bgColor={useColorModeValue("gray.400", "gray.600")}
        rounded="lg"
        shadow="dark-lg"
        variant="solid"
        mx={{
          base: 4,
          md: "10%",
          lg: "20%",
        }}
        px={4}
        w="auto"
        my={4}
      >
        <AlertTitle>You have unsaved changes</AlertTitle>
        <AlertDescription ml="auto">
          <Button onClick={handleDiscard} type="button" variant="ghost" mr={3}>
            Discard
          </Button>
          <Button
            onClick={handleUpdate}
            type="button"
            colorScheme="green"
            isLoading={updateProfileMutation.isLoading}
          >
            Save changes
          </Button>
        </AlertDescription>
      </Alert>
    </Slide>
  );
};

export default ConfirmationAlert;
