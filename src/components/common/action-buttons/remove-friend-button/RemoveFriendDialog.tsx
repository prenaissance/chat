import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useRef } from "react";

import { api } from "~/utils/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  name: string;
};

const RemoveFriendDialog = ({ isOpen, onClose, userId, name }: Props) => {
  const queryClient = api.useContext();
  const toast = useToast();
  const deleteFriendMutation = api.friends.removeFriend.useMutation({
    onSuccess: async () => {
      await Promise.all([
        queryClient.correspondents.search.invalidate(),
        queryClient.friends.invalidate(),
      ]);

      toast({
        title: `Removed ${name} from your friend list`,
        status: "success",
      });
    },
  });
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleRemoveFriend = useCallback(() => {
    deleteFriendMutation.mutate({
      targetUserId: userId,
    });
  }, [deleteFriendMutation, userId]);

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
    >
      <AlertDialogOverlay>
        <AlertDialogContent data-ignore-outside-click>
          <AlertDialogHeader>Remove Friend</AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to remove this user from your friend list?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="outline"
              size="sm"
              disabled={deleteFriendMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              size="sm"
              ml={3}
              onClick={handleRemoveFriend}
              isLoading={deleteFriendMutation.isLoading}
            >
              Remove
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default RemoveFriendDialog;
