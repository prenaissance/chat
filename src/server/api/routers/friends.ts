import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { FriendStatus } from "~/shared/dtos/friends";
import { getFriendStatus } from "../../services/friend-status-service";
import { mapOnlineStatus } from "../../services/online-service";
import { omit } from "~/utils/reflections";

export const friendsRouter = createTRPCRouter({
  getFriends: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;
    const friends = await prisma.user.findMany({
      where: {
        sentFriendRequests: {
          some: {
            toId: session.user.id,
            accepted: true,
          },
        },
      },
    });

    return friends.map(mapOnlineStatus);
  }),

  getFriendsWithRequestDate: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;
    const friends = await prisma.user.findMany({
      where: {
        sentFriendRequests: {
          some: {
            toId: session.user.id,
            accepted: true,
          },
        },
      },
      include: {
        sentFriendRequests: true,
      },
    });

    return friends
      .map((friend) => ({
        ...omit(friend, ["sentFriendRequests"]),
        friendsSince: friend.sentFriendRequests[0]!.updatedAt,
      }))
      .map(mapOnlineStatus);
  }),

  getOnlineFriends: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;
    const friends = await prisma.user.findMany({
      where: {
        lastSeenAt: {
          gte: new Date(Date.now() - 1000 * 60 * 5),
        },
        sentFriendRequests: {
          some: {
            toId: session.user.id,
            accepted: true,
          },
        },
      },
    });

    return friends.map((user) => ({
      ...user,
      isOnline: true,
    }));
  }),

  getSentFriendRequests: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;
    const sentFriendRequests = await prisma.friendRequest.findMany({
      where: {
        fromId: session.user.id,
        accepted: false,
      },
      include: {
        to: true,
      },
    });
    return sentFriendRequests;
  }),

  getReceivedFriendRequests: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;
    const receivedFriendRequests = await prisma.friendRequest.findMany({
      where: {
        toId: session.user.id,
        accepted: false,
      },
      include: {
        from: true,
      },
    });
    return receivedFriendRequests;
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
        await prisma.friendRequest.update({
          where: {
            id: receivedFriendRequest.id,
          },
          data: {
            accepted: true,
          },
        });
        await prisma.friendRequest.create({
          data: {
            fromId: session.user.id,
            toId: targetUserId,
            accepted: true,
          },
        });
      }

      await prisma.friendRequest.create({
        data: {
          fromId: session.user.id,
          toId: targetUserId,
        },
      });
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

      await prisma.friendRequest.delete({
        where: {
          fromId_toId: {
            fromId: session.user.id,
            toId: targetUserId,
          },
        },
      });
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

      return await prisma.friendRequest.delete({
        where: {
          fromId_toId: {
            fromId: targetUserId,
            toId: session.user.id,
          },
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
      await prisma.friendRequest.create({
        data: {
          fromId: session.user.id,
          toId: targetUserId,
          accepted: true,
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

  removeFriend: protectedProcedure
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

      if (friendStatus !== FriendStatus.Friends) {
        throw new TRPCError({
          message: "You are not friends",
          code: "NOT_FOUND",
        });
      }

      await prisma.friendRequest.deleteMany({
        where: {
          OR: [
            {
              fromId: session.user.id,
              toId: targetUserId,
            },
            {
              fromId: targetUserId,
              toId: session.user.id,
            },
          ],
        },
      });
    }),
});
