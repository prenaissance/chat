import {
  Avatar,
  AvatarBadge,
  SkeletonCircle,
  type AvatarProps,
  type ChakraProps,
} from "@chakra-ui/react";
import { type Session } from "next-auth";

type Props = {
  user?: Session["user"];
  isOnline?: boolean;
  size?: AvatarProps["size"];
  badgeBorderColor?: ChakraProps["borderColor"];
} & ChakraProps;

const UserAvatar = ({
  user,
  isOnline = true,
  size = "md",
  badgeBorderColor,
  ...props
}: Props) =>
  !!user ? (
    <Avatar
      size={size}
      name={user.name ?? "Placeholder Name"}
      src={user.image ?? undefined}
    >
      <AvatarBadge
        boxSize="1em"
        bg={isOnline ? "green.500" : "gray.500"}
        borderColor={badgeBorderColor}
      />
    </Avatar>
  ) : (
    <SkeletonCircle {...props} size={size} />
  );

export default UserAvatar;
