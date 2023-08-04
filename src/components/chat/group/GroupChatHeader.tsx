import {
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import UserAvatar, {
  type UserAvatarInfo,
} from "~/components/common/UserAvatar";

type Props = {
  group?: UserAvatarInfo | null;
  isLoading: boolean;
};

const GroupChatHeader = ({ group, isLoading }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const handleSwitchEdit = () => setIsEditing((prev) => !prev);

  return (
    <HStack
      py={1}
      px={2}
      as="header"
      h={12}
      shadow="lg"
      bgColor={useColorModeValue("white", "gray.800")}
    >
      <UserAvatar user={group} size="sm" />
      <Skeleton isLoaded={!isLoading} w="min(12rem, 50%)">
        <chakra.h1 fontSize="xl">{group?.name ?? "Placeholder Name"}</chakra.h1>
      </Skeleton>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<FaEllipsisV />}
          ml="auto"
          variant="ghost"
          size="md"
          aria-label="Open menu for group chat"
        />
        <MenuList>
          <MenuItem onClick={handleSwitchEdit}>
            {isEditing ? "Exit edit mode" : "Edit group"}
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};

export default GroupChatHeader;
