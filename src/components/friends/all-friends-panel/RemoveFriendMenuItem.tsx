import { Icon, MenuItem, useDisclosure } from "@chakra-ui/react";
import { AiFillDelete } from "react-icons/ai";
import RemoveFriendDialog from "~/components/common/action-buttons/remove-friend-button/RemoveFriendDialog";

type Props = {
  userId: string;
  name: string;
};

const RemoveFriendMenuItem = ({ userId, name }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <MenuItem icon={<Icon as={AiFillDelete} />} onClick={onOpen}>
        Remove Friend
      </MenuItem>
      <RemoveFriendDialog
        isOpen={isOpen}
        onClose={onClose}
        userId={userId}
        name={name}
      />
    </>
  );
};

export default RemoveFriendMenuItem;
