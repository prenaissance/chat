import {
  Text,
  Card,
  CardBody,
  CardHeader,
  type ChakraProps,
  useColorModeValue,
  Divider,
  Stack,
  Button,
  Skeleton,
} from "@chakra-ui/react";
import NextLink from "next/link";

import UserAvatar from "./UserAvatar";
import { type UserInfoWithGroups } from "./types/user";

type Props = {
  user?: UserInfoWithGroups | null;
  isOnline?: boolean;
  showActions?: boolean;
} & ChakraProps;

const UserCard = ({ user, isOnline, showActions = true, ...props }: Props) => {
  const buttonColor = useColorModeValue("teal.300", "teal.900");
  const buttonHoverColor = useColorModeValue("teal.400", "teal.800");

  return (
    <Card
      rounded="md"
      shadow="xl"
      maxW="sm"
      bgColor={useColorModeValue("gray.300", "gray.700")}
      p={4}
      {...props}
    >
      <CardHeader p={2}>
        <UserAvatar
          user={user}
          isOnline={isOnline ?? user?.isOnline ?? false}
          size="lg"
          badgeBorderColor={useColorModeValue("gray.300", "gray.700")}
        />
      </CardHeader>
      <CardBody
        rounded="md"
        bgColor={useColorModeValue("gray.400", "gray.900")}
        flex="0 0 auto"
      >
        <Skeleton isLoaded={!!user}>
          <Text fontSize="xl" fontWeight="bold">
            {user?.name ?? "Placeholder Name"}
          </Text>
        </Skeleton>
        <Divider my={2} />
        <Stack>
          <Text fontWeight="bold" textTransform="uppercase">
            About me
          </Text>
          <Text
            color="gray.400"
            fontStyle={user?.description ? "normal" : "italic"}
            noOfLines={4}
          >
            {user?.description ||
              "This user has not written a description yet."}
          </Text>
          <Text fontWeight="bold">
            {user?.groupsInCommon?.length} group
            {user?.groupsInCommon?.length === 1 ? "" : "s"} in common
          </Text>
        </Stack>
        {showActions && (
          <>
            <Divider my={2} />
            <Button
              as={NextLink}
              variant="filled"
              href={`/chat/user/${user?.id ?? ""}`}
              disabled={!!user}
              bgColor={buttonColor}
              _hover={{ bgColor: buttonHoverColor }}
            >
              Message
            </Button>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default UserCard;
