import {
  Avatar,
  AvatarBadge,
  SkeletonCircle,
  type AvatarProps,
  type ChakraProps,
} from "@chakra-ui/react";

export type UserAvatarInfo = {
  name: string;
  image?: string | null;
  isOnline?: boolean;
};

export type UserAvatarProps = {
  user?: UserAvatarInfo | null;
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
}: UserAvatarProps) =>
  !!user ? (
    <Avatar
      size={size}
      name={user.name ?? "Placeholder Name"}
      src={user.image ?? undefined}
      {...props}
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
