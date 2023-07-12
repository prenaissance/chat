import { omit } from "~/utils/reflections";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { type FriendRequest, type User } from "@prisma/client";

type UserWithFriendRequests = User & {
  receivedFriendRequests: FriendRequest[];
  sentFriendRequests: FriendRequest[];
};

type FriendStatus = "none" | "pending" | "friends";

const getFriendStatus = (
  user: UserWithFriendRequests,
  userId: string
): FriendStatus => {
  const receivedFriendRequest = user.receivedFriendRequests.find(
    (friendRequest) => friendRequest.fromId === userId
  );
  const sentFriendRequest = user.sentFriendRequests.find(
    (friendRequest) => friendRequest.toId === userId
  );

  if (receivedFriendRequest?.accepted || sentFriendRequest?.accepted) {
    return "friends";
  }

  if (receivedFriendRequest) {
    return "pending";
  }
  return "none";
};

export const correspondentsRouter = createTRPCRouter({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { query } = input;
      const { prisma, session } = ctx;
      const userId = session.user.id;

      const users = await prisma.user.findMany({
        where: {
          name: {
            contains: query,
          },
          id: {
            not: userId,
          },
        },
        include: {
          receivedFriendRequests: true,
          sentFriendRequests: true,
        },
        take: 5,
      });

      const groups = await prisma.group.findMany({
        where: {
          name: {
            contains: query,
          },
          users: {
            some: {
              id: userId,
            },
          },
        },
        take: 5,
      });

      return {
        users: users.map((user) => ({
          ...omit(user, ["receivedFriendRequests", "sentFriendRequests"]),
          friendStatus: getFriendStatus(user, userId),
        })),
        groups,
      };
    }),
});
