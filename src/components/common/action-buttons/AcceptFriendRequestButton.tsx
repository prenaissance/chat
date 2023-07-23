import {
  Icon,
  IconButton,
  type IconButtonProps,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { type ElementType } from "react";
import { AiOutlineUserAdd } from "react-icons/ai";

import { api } from "~/utils/api";

type Props = Omit<IconButtonProps, "icon" | "aria-label" | "onClick"> & {
  name: string;
  userId: string;
  icon?: ElementType;
};

const AcceptFriendRequestButton = ({
  name,
  userId,
  icon = AiOutlineUserAdd,
  ...props
}: Props) => {
  const queryClient = api.useContext();
  const toast = useToast();
  const acceptFriendRequestMutation =
    api.friends.acceptFriendRequest.useMutation({
      onSuccess: async () => {
        await Promise.all([
          queryClient.correspondents.search.invalidate(),
          queryClient.friends.invalidate(),
        ]);
        toast({
          title: `Friend request from ${name} accepted`,
          status: "success",
        });
      },
    });

  const handleCancelFriendRequest = () =>
    acceptFriendRequestMutation.mutate({
      targetUserId: userId,
    });
  const label = `Accept friend request from ${name}`;

  return (
    <Tooltip label={label} placement="right">
      <IconButton
        aria-label={label}
        size="sm"
        isLoading={acceptFriendRequestMutation.isLoading}
        onClick={handleCancelFriendRequest}
        {...props}
      >
        <Icon as={icon} />
      </IconButton>
    </Tooltip>
  );
};

export default AcceptFriendRequestButton;
