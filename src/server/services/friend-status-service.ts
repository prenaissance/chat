import {
  type User,
  type PrismaClient,
  type FriendRequest,
} from "@prisma/client";
import { FriendStatus } from "~/shared/dtos/friends";

type UserWithFriendRequests = User & {
  receivedFriendRequests: FriendRequest[];
  sentFriendRequests: FriendRequest[];
};

export const getFriendStatus = async (
  prisma: PrismaClient,
  userId: string,
  targetUserId: string
) => {
  const receivedFriendRequest = await prisma.friendRequest.findFirst({
    where: {
      fromId: targetUserId,
      toId: userId,
    },
  });

  const sentFriendRequest = await prisma.friendRequest.findFirst({
    where: {
      fromId: userId,
      toId: targetUserId,
    },
  });

  if (receivedFriendRequest?.accepted || sentFriendRequest?.accepted) {
    return FriendStatus.Friends;
  }

  if (receivedFriendRequest) {
    return FriendStatus.Received;
  }

  if (sentFriendRequest) {
    return FriendStatus.Sent;
  }

  return FriendStatus.None;
};

export const getFriendStatusForUser = (
  targetUser: UserWithFriendRequests,
  userId: string
) => {
  const receivedFriendRequest = targetUser.sentFriendRequests.find(
    (friendRequest) => friendRequest.toId === userId
  );

  const sentFriendRequest = targetUser.receivedFriendRequests.find(
    (friendRequest) => friendRequest.fromId === userId
  );

  if (receivedFriendRequest?.accepted || sentFriendRequest?.accepted) {
    return FriendStatus.Friends;
  }

  if (receivedFriendRequest) {
    return FriendStatus.Received;
  }

  if (sentFriendRequest) {
    return FriendStatus.Sent;
  }

  return FriendStatus.None;
};
