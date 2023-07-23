import {
  Icon,
  IconButton,
  type IconButtonProps,
  Tooltip,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  Button,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogBody,
  useToast,
  AlertDialogContent,
} from "@chakra-ui/react";
import { useRef, type ElementType } from "react";
import { MdOutlinePending } from "react-icons/md";

import { api } from "~/utils/api";

type Props = Omit<IconButtonProps, "icon" | "aria-label" | "onClick"> & {
  name: string;
  userId: string;
  icon?: ElementType;
};

const CancelFriendRequestButton = ({
  name,
  userId,
  icon = MdOutlinePending,
  ...props
}: Props) => {
  const { onClose, onOpen, isOpen } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const queryClient = api.useContext();
  const toast = useToast();
  const cancelFriendRequestMutation =
    api.friends.cancelFriendRequest.useMutation({
      onSuccess: async () => {
        await Promise.all([
          queryClient.correspondents.search.invalidate(),
          queryClient.friends.getSentFriendRequests.invalidate(),
          queryClient.correspondents.search.invalidate(),
        ]);

        toast({
          title: `Friend request to ${name} cancelled`,
          status: "success",
        });
      },
    });

  const handleCancelFriendRequest = () =>
    cancelFriendRequestMutation.mutate({
      targetUserId: userId,
    });

  return (
    <>
      <Tooltip label={`Cancel friend request to ${name}`} placement="right">
        <IconButton
          aria-label={`Cancel friend request to ${name}`}
          size="sm"
          isLoading={cancelFriendRequestMutation.isLoading}
          onClick={onOpen}
          {...props}
        >
          <Icon as={icon} />
        </IconButton>
      </Tooltip>
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent data-ignore-outside-click>
            <AlertDialogHeader>Cancel Friend Request</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to cancel your friend request to {name}?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                variant="outline"
                size="sm"
                disabled={cancelFriendRequestMutation.isLoading}
              >
                Abort
              </Button>
              <Button
                colorScheme="red"
                size="sm"
                ml={3}
                onClick={handleCancelFriendRequest}
                isLoading={cancelFriendRequestMutation.isLoading}
              >
                Cancel Friend Request
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default CancelFriendRequestButton;
