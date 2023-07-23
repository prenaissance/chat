import {
  Icon,
  type IconButtonProps,
  useDisclosure,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { AiOutlineUserAdd } from "react-icons/ai";
import RemoveFriendDialog from "./RemoveFriendDialog";
import { type ElementType } from "react";

type Props = Omit<IconButtonProps, "icon" | "aria-label" | "onClick"> & {
  name: string;
  userId: string;
  icon?: ElementType;
};

const RemoveFriendButton = ({
  userId,
  name,
  icon = AiOutlineUserAdd,
  ...props
}: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const label = `Remove ${name} from friends`;

  return (
    <>
      <Tooltip label={label} placement="right">
        <IconButton aria-label={label} size="sm" onClick={onOpen} {...props}>
          <Icon as={icon} />
        </IconButton>
      </Tooltip>
      <RemoveFriendDialog
        isOpen={isOpen}
        onClose={onClose}
        userId={userId}
        name={name}
      />
    </>
  );
};

export default RemoveFriendButton;
