import { AddIcon } from "@chakra-ui/icons";
import {
  type IconButtonProps,
  useDisclosure,
  IconButton,
  Tooltip,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogFooter,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Menu,
  FormHelperText,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  chakra,
  useToast,
  FormErrorIcon,
  HStack,
  Text,
} from "@chakra-ui/react";
import { useCallback, useRef } from "react";
import NextLink from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createGroupSchema,
  type CreateGroup,
} from "~/shared/schemas/group-schema";
import { api } from "~/utils/api";
import UserAvatar from "~/components/common/UserAvatar";

type Props = Omit<IconButtonProps, "onClick" | "aria-label">;

const CreateGroupButton = (props: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = api.useContext();
  const toast = useToast();
  const closeRef = useRef<HTMLButtonElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    setValue,
    watch,
    reset,
  } = useForm<CreateGroup>({
    resolver: zodResolver(createGroupSchema),
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      members: [],
    },
  });
  const members = watch("members");
  const handleMembersChange = useCallback(
    (value: string | string[]) => setValue("members", value as string[]),
    [setValue]
  );

  const friendsQuery = api.friends.getFriends.useQuery();
  const createGroupMutation = api.groups.createGroup.useMutation({
    onError: (error) => {
      setError("root", { message: error.message });
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.groups.invalidate(),
        queryClient.conversations.invalidate(),
      ]);
      reset();
      toast({
        status: "success",
        description: (
          <HStack justifyContent="space-between">
            <Text colorScheme="green">Group Created</Text>
            <Button
              size="xs"
              colorScheme="green"
              variant="link"
              as={NextLink}
              href={`/chat/group/${data.id}`}
              display="inline"
              py={1}
            >
              Open group chat
            </Button>
          </HStack>
        ),
        position: "bottom",
        isClosable: true,
      });
      onClose();
    },
  });
  const onSubmit: SubmitHandler<CreateGroup> = useCallback(
    (data) => createGroupMutation.mutateAsync(data),
    [createGroupMutation]
  );

  return (
    <>
      <Tooltip label="Create Group" placement="right">
        <IconButton
          icon={<AddIcon />}
          aria-label="Create Group"
          onClick={onOpen}
          {...props}
        />
      </Tooltip>
      <AlertDialog
        onClose={onClose}
        isOpen={isOpen}
        leastDestructiveRef={closeRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
            <AlertDialogCloseButton />
            <AlertDialogHeader>Create Group</AlertDialogHeader>
            <AlertDialogBody>
              <Alert status="error" mb={2} hidden={!errors.root}>
                <AlertIcon />
                <AlertDescription>{errors.root?.message}</AlertDescription>
              </Alert>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input {...register("name")} />

                <FormErrorMessage>
                  <FormErrorIcon />
                  {errors.name?.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.members}>
                <FormLabel>Group Members</FormLabel>
                <Menu closeOnSelect={false}>
                  <MenuButton
                    as={Button}
                    colorScheme="teal"
                    rightIcon={<AddIcon />}
                  >
                    Add Members
                  </MenuButton>
                  <MenuList w={20}>
                    <MenuOptionGroup
                      type="checkbox"
                      value={members}
                      onChange={handleMembersChange}
                    >
                      {friendsQuery.data?.map((friend) => (
                        <MenuItemOption
                          textOverflow="ellipsis"
                          key={friend.id}
                          value={friend.id}
                        >
                          <UserAvatar user={friend} size="xs" mr={2} />
                          <chakra.span>{friend.name}</chakra.span>
                        </MenuItemOption>
                      ))}
                    </MenuOptionGroup>
                  </MenuList>
                </Menu>
                <FormErrorMessage>
                  <FormErrorIcon />
                  {errors.members?.message}
                </FormErrorMessage>
                <FormHelperText>
                  Add included users from your friend list
                </FormHelperText>
              </FormControl>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={closeRef}
                onClick={onClose}
                isDisabled={createGroupMutation.isLoading}
              >
                Close
              </Button>
              <Button
                colorScheme="blue"
                ml={3}
                isLoading={createGroupMutation.isLoading}
                disabled={!isValid}
                type="submit"
              >
                Create
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default CreateGroupButton;
