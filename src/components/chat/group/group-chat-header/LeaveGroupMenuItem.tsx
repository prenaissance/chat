import {
  MenuItem,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogBody,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogCloseButton,
  AlertDialogFooter,
  Button,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useRef } from "react";
import { api } from "~/utils/api";

const LeaveGroupMenuItem = () => {
  const router = useRouter();
  const groupId = router.query.id as string | undefined;
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const queryClient = api.useContext();
  const leaveGroupMutation = api.groups.leaveGroup.useMutation({
    onSuccess: async (message) => {
      await router.replace("/chat");
      await Promise.all([
        queryClient.groups.invalidate(),
        queryClient.conversations.invalidate(),
      ]);
      toast({
        description: message,
        status: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error leaving group",
        description:
          error.data?.zodError?.formErrors.join(", ") ?? error.message,
        status: "error",
      });
    },
  });
  const handleMutation = () => {
    groupId && leaveGroupMutation.mutate(groupId);
  };

  return (
    <>
      <MenuItem onClick={onOpen}>Leave group</MenuItem>
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogCloseButton />
            <AlertDialogHeader>Leave group</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to leave this group?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                isDisabled={leaveGroupMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleMutation}
                ml={3}
                isLoading={leaveGroupMutation.isLoading}
              >
                Leave
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default LeaveGroupMenuItem;
