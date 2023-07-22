import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Icon,
  MenuItem,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useRef } from "react";
import { AiFillDelete } from "react-icons/ai";

import { api } from "~/utils/api";

type Props = {
  userId: string;
};

const RemoveFriendDialog = ({ userId }: Props) => {
  const queryClient = api.useContext();
  const deleteFriendMutation = api.friends.removeFriend.useMutation({
    onSuccess: () => queryClient.friends.invalidate(),
  });
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { isOpen, onClose, onOpen } = useDisclosure();

  const handleRemoveFriend = useCallback(() => {
    deleteFriendMutation.mutate({
      targetUserId: userId,
    });
  }, [deleteFriendMutation, userId]);

  return (
    <>
      <MenuItem icon={<Icon as={AiFillDelete} />} onClick={onOpen}>
        Remove Friend
      </MenuItem>
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
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
    </>
  );
};

export default RemoveFriendDialog;
