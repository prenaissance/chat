import { z } from "zod";
import { type PrismaClient } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const arePendingFriends = async (
  prisma: PrismaClient,
  userId1: string,
  userId2: string
) => {
  const friendShip = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        {
          fromId: userId1,
          toId: userId2,
        },
        {
          fromId: userId2,
          toId: userId1,
        },
      ],
    },
  });

  return friendShip !== null;
};

const areFriends = async (
  prisma: PrismaClient,
  userId1: string,
  userId2: string
) => {
  const friendShip = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        {
          fromId: userId1,
          toId: userId2,
          accepted: true,
        },
        {
          fromId: userId2,
          toId: userId1,
          accepted: true,
        },
      ],
    },
  });

  return friendShip !== null;
};

export const friendsRouter = createTRPCRouter({
  addFriend: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { targetUserId } = input;
      const { session, prisma } = ctx;
      if (await areFriends(prisma, session.user.id, targetUserId)) {
        throw new TRPCError({
          message: "You are already friends with this user",
          code: "BAD_REQUEST",
        });
      }

      if (await arePendingFriends(prisma, session.user.id, targetUserId)) {
        throw new TRPCError({
          message: "You already have a pending friend request",
          code: "CONFLICT",
        });
      }

      const friendRequest = await prisma.friendRequest.create({
        data: {
          fromId: session.user.id,
          toId: targetUserId,
        },
      });

      return friendRequest;
    }),
});
