import { CloseIcon } from "@chakra-ui/icons";
import {
  ButtonGroup,
  IconButton,
  useEditableContext,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FaCheck } from "react-icons/fa";

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
          icon={<CloseIcon />}
          colorScheme="red"
          isDisabled={editNameMutation.isLoading}
        />
      </ButtonGroup>
    )
  );
};

export default EditableControls;
