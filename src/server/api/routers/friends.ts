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

      const receivedFriendRequest = await prisma.friendRequest.findUnique({
        where: {
          fromId_toId: {
            fromId: targetUserId,
            toId: session.user.id,
          },
        },
      });

      if (receivedFriendRequest) {
        return await prisma.friendRequest.update({
          where: {
            id: receivedFriendRequest.id,
          },
          data: {
            accepted: true,
          },
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

  cancelFriendRequest: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { targetUserId } = input;
      const { session, prisma } = ctx;

      const friendRequest = await prisma.friendRequest.findFirst({
        where: {
          fromId: session.user.id,
          toId: targetUserId,
          accepted: false,
        },
      });

      if (!friendRequest) {
        throw new TRPCError({
          message: "You don't have a pending friend request",
          code: "NOT_FOUND",
        });
      }
    }),

  rejectFriendRequest: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { targetUserId } = input;
      const { session, prisma } = ctx;

      const friendRequest = await prisma.friendRequest.findFirst({
        where: {
          fromId: targetUserId,
          toId: session.user.id,
          accepted: false,
        },
      });

      if (!friendRequest) {
        throw new TRPCError({
          message: "You don't have a pending friend request",
          code: "NOT_FOUND",
        });
      }

      return await prisma.friendRequest.delete({
        where: {
          id: friendRequest.id,
        },
      });
    }),

  acceptFriendRequest: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { targetUserId } = input;
      const { session, prisma } = ctx;

      const friendRequest = await prisma.friendRequest.findFirst({
        where: {
          fromId: targetUserId,
          toId: session.user.id,
          accepted: false,
        },
      });

      if (!friendRequest) {
        throw new TRPCError({
          message: "You don't have a pending friend request",
          code: "NOT_FOUND",
        });
      }

      return await prisma.friendRequest.update({
        where: {
          id: friendRequest.id,
        },
        data: {
          accepted: true,
        },
      });
    }),
});
