import {
  Avatar,
  AvatarBadge,
  Text,
  Card,
  CardBody,
  CardHeader,
  type ChakraProps,
  useColorModeValue,
  Divider,
  Stack,
  Button,
} from "@chakra-ui/react";
import type { Session } from "next-auth";

type Props = {
  user?: Session["user"];
  isOnline?: boolean;
} & ChakraProps;

const UserCard = ({ user, isOnline = true, ...props }: Props) => (
  <Card
    rounded="md"
    shadow="xl"
    maxW="sm"
    bgColor={useColorModeValue("gray.300", "gray.700")}
    p={4}
    {...props}
  >
    <CardHeader p={2}>
      <Avatar
        size="lg"
        name={user?.name ?? "Placeholder Name"}
        src={user?.image ?? undefined}
      >
        <AvatarBadge
          boxSize="1em"
          bg={isOnline ? "green.500" : "gray.500"}
          borderColor={useColorModeValue("gray.300", "gray.700")}
        />
      </Avatar>
    </CardHeader>
    <CardBody rounded="md" bgColor={useColorModeValue("gray.400", "gray.900")}>
      <Text fontSize="xl" fontWeight="bold">
        {user?.name ?? "Placeholder Name"}
      </Text>
      <Divider my={2} />
      <Stack>
        <Text fontWeight="bold" textTransform="uppercase">
          About me
        </Text>
        <Text color="gray.400">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Atque
          doloremque qui veritatis error ducimus beatae.
        </Text>
        <Text fontWeight="bold">N groups in common</Text>
      </Stack>
      <Divider my={2} />
      <Button
        variant="filled"
        bgColor={useColorModeValue("teal.300", "teal.900")}
      >
        Message
      </Button>
    </CardBody>
  </Card>
);

export default UserCard;
