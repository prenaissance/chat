import {
  Editable,
  EditableInput,
  EditablePreview,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";

import UserAvatar from "~/components/common/UserAvatar";
import { api } from "~/utils/api";
import EditableControls from "./EditableControls";
import LeaveGroupMenuItem from "./LeaveGroupMenuItem";

const GroupChatHeader = () => {
  const router = useRouter();
  const groupId = router.query.id as string | undefined;
  const groupQuery = api.groups.getGroup.useQuery(groupId!, {
    enabled: !!groupId,
  });
  const [name, setName] = useState<string>(null!);
  const ref = useRef<HTMLHeadElement>(null);
  const displayName = name ?? groupQuery.data?.name;

  return (
    <HStack
      py={1}
      px={2}
      as="header"
      h={12}
      shadow="lg"
      bgColor={useColorModeValue("white", "gray.800")}
    >
      <UserAvatar user={groupQuery.data} size="sm" />
      <Skeleton isLoaded={!groupQuery.isLoading} w="min(12rem, 50%)">
        <Editable value={displayName} onChange={setName}>
          <EditablePreview as="h1" ref={ref} />
          <HStack alignItems="center">
            <EditableInput w={48} />
            <EditableControls />
          </HStack>
        </Editable>
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
          <MenuItem onClick={() => ref.current?.focus?.()}>
            Edit group name
          </MenuItem>
          <LeaveGroupMenuItem />
        </MenuList>
      </Menu>
    </HStack>
  );
};

export default GroupChatHeader;
