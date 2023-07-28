import {
  Textarea,
  Tooltip,
  type TextareaProps,
  useColorModeValue,
  chakra,
  Box,
} from "@chakra-ui/react";
import { type ChangeEventHandler, useCallback } from "react";
import { useProfileTabsStore } from "~/stores/profile-tabs";

type Props = TextareaProps;

const EditDescriptionTextArea = (props: Props) => {
  const panelColor = useColorModeValue("gray.300", "gray.700");
  const description = useProfileTabsStore(
    (state) => state.editUser.description
  );
  const setEditUser = useProfileTabsStore((state) => state.setEditUser);
  const remainingCharacters = 200 - (description?.length ?? 0);

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      const newDescription = e.target.value;
      setEditUser({
        ...useProfileTabsStore.getState().editUser,
        description: newDescription,
      });
    },
    [setEditUser]
  );

  return (
    <Box position="relative">
      <Textarea
        noOfLines={3}
        pr={8}
        w="100%"
        mt={3}
        resize="none"
        value={description ?? ""}
        onChange={handleChange}
        placeholder="Description"
        rounded="sm"
        variant="filled"
        bgColor={panelColor}
        {...props}
      />
      <Tooltip
        placement="top"
        bgColor={useColorModeValue("gray.200", "gray.800")}
        color={useColorModeValue("gray.800", "gray.200")}
        label={
          remainingCharacters >= 0
            ? `${remainingCharacters} characters remaining`
            : `You entered ${-remainingCharacters} over the limit!`
        }
      >
        <chakra.span
          cursor={remainingCharacters >= 0 ? "pointer" : "not-allowed"}
          position="absolute"
          bottom={2}
          right={2}
          color={remainingCharacters >= 0 ? "gray.400" : "red.400"}
        >
          {remainingCharacters}
        </chakra.span>
      </Tooltip>
    </Box>
  );
};

export default EditDescriptionTextArea;
