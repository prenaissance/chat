import {
  ButtonGroup,
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
  chakra,
  useColorModeValue,
  useEditableContext,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { FaCheck, FaEllipsisV } from "react-icons/fa";

import UserAvatar from "~/components/common/UserAvatar";
import { api } from "~/utils/api";

const EditableControls = () => {
  const router = useRouter();
  const groupId = router.query.id as string | undefined;
  const { isEditing, onSubmit, value, getSubmitButtonProps } =
    useEditableContext();
  const toast = useToast();
  const queryClient = api.useContext();
  const editNameMutation = api.groups.editGroupName.useMutation({
    onSuccess: async () => {
      onSubmit();
      await Promise.all([
        queryClient.groups.invalidate(),
        queryClient.conversations.invalidate(),
      ]);
    },
    onError: (error) => {
      toast({
        title: "Error editing group name",
        description:
          error.data?.zodError?.formErrors.join(", ") ?? error.message,
        status: "error",
      });
    },
  });
  const handleMutation = () => {
    groupId &&
      editNameMutation.mutate({
        groupId: groupId,
        name: value,
      });
  };

  return (
    isEditing && (
      <ButtonGroup>
        <IconButton
          {...getSubmitButtonProps()}
          size="sm"
          onClick={handleMutation}
          aria-label="Save group name"
          isLoading={editNameMutation.isLoading}
          icon={<FaCheck />}
          colorScheme="green"
        />
        <IconButton
          size="sm"
          aria-label="Cancel editing group name"
          icon={<chakra.span fontWeight="bold">X</chakra.span>}
          colorScheme="red"
          isDisabled={editNameMutation.isLoading}
        />
      </ButtonGroup>
    )
  );
};

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
          <MenuItem>Leave group</MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};

export default GroupChatHeader;
