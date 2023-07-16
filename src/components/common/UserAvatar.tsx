import {
  Avatar,
  AvatarBadge,
  SkeletonCircle,
  type AvatarProps,
  type ChakraProps,
} from "@chakra-ui/react";
import { type Session } from "next-auth";

type Props = {
  user?: Omit<Session["user"], "email"> & { isOnline?: boolean };
  isOnline?: boolean;
  size?: AvatarProps["size"];
  badgeBorderColor?: ChakraProps["borderColor"];
} & ChakraProps;

const UserAvatar = ({
  user,
  isOnline,
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
        bg={isOnline ?? user.isOnline ?? false ? "green.500" : "gray.500"}
        borderColor={badgeBorderColor}
      />
    </Avatar>
  ) : (
    // fix skeleton breakpoint size to match avatar size
    <SkeletonCircle {...props} size="2rem" />
  );

export default UserAvatar;
