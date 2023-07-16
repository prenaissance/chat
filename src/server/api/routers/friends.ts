import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { FriendStatus } from "~/shared/dtos/friends";
import { getFriendStatus } from "../services/friend-status-service";

export const friendsRouter = createTRPCRouter({
  getFriends: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;
    const friends = await prisma.user.findMany({
      where: {
        OR: [
          {
            sentFriendRequests: {
              some: {
                toId: session.user.id,
                accepted: true,
              },
            },
          },
          {
            receivedFriendRequests: {
              some: {
                fromId: session.user.id,
                accepted: true,
              },
            },
          },
        ],
      },
    });

    return friends;
  }),
  getFriendStatus: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().cuid(),
      })
    )
    .query(({ input, ctx }) => {
      const { targetUserId } = input;
      const { session, prisma } = ctx;
      const userId = session.user.id;

      return getFriendStatus(prisma, userId, targetUserId);
    }),

  addFriend: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { targetUserId } = input;
      const { session, prisma } = ctx;
      const friendStatus = await getFriendStatus(
        prisma,
        session.user.id,
        targetUserId
      );

      if (friendStatus === FriendStatus.Friends) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already friends",
        });
      }

      if (friendStatus === FriendStatus.Sent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already sent a friend request",
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

      const friendStatus = await getFriendStatus(
        prisma,
        session.user.id,
        targetUserId
      );

      if (friendStatus !== FriendStatus.Sent) {
        throw new TRPCError({
          message: "You haven't sent a friend request",
          code: "NOT_FOUND",
        });
      }

      const friendRequest = await prisma.friendRequest.deleteMany({
        where: {
          fromId: session.user.id,
          toId: targetUserId,
          accepted: false,
        },
      });
      return friendRequest;
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

      const friendStatus = await getFriendStatus(
        prisma,
        session.user.id,
        targetUserId
      );

      if (friendStatus !== FriendStatus.Received) {
        throw new TRPCError({
          message: "You haven't received a friend request",
          code: "NOT_FOUND",
        });
      }
      const friendRequest = await prisma.friendRequest.findFirst({
        where: {
          fromId: targetUserId,
          toId: session.user.id,
          accepted: false,
        },
      });

      return await prisma.friendRequest.delete({
        where: {
          id: friendRequest?.id,
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

      const friendStatus = await getFriendStatus(
        prisma,
        session.user.id,
        targetUserId
      );

      if (friendStatus !== FriendStatus.Received) {
        throw new TRPCError({
          message: "You haven't received a friend request",
          code: "NOT_FOUND",
        });
      }

      const friendRequest = await prisma.friendRequest.findFirst({
        where: {
          fromId: targetUserId,
          toId: session.user.id,
          accepted: false,
        },
      });
      return await prisma.friendRequest.update({
        where: {
          id: friendRequest?.id,
        },
        data: {
          accepted: true,
        },
      });
    }),
});
