import {
  HStack,
  Skeleton,
  SkeletonCircle,
  type StackProps,
} from "@chakra-ui/react";

const FriendRequestSkeleton = (props: StackProps) => {
  return (
    <HStack spacing={2} alignItems="flex-end" p={2} {...props}>
      <SkeletonCircle size="2rem" />
      <Skeleton h={5} w="min(50%, 16rem)" />
      <Skeleton h="2rem" w="2rem" ml="auto" rounded="md" />
      <Skeleton h="2rem" w="2rem" rounded="md" />
    </HStack>
  );
};

export default FriendRequestSkeleton;
