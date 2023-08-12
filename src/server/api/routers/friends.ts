import { z } from "zod";
import { TRPCError } from "@trpc/server";
import SuperJSON from "superjson";
import { observable } from "@trpc/server/observable";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type FriendRequestDto, FriendStatus } from "~/shared/dtos/friends";
import { omit } from "~/utils/reflections";
import { getFriendStatus } from "~/server/services/friend-status-service";
import { mapUserOnlineStatus } from "~/server/services/online-service";
import { publishFriendRequest } from "~/server/services/notifications";
import { RedisChannel } from "~/server/services/singletons/redis";

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

    return friends.map(mapUserOnlineStatus);
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
      .map(mapUserOnlineStatus);
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
      const { session, prisma, redis } = ctx;
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
        const friendRequest = await prisma.friendRequest.create({
          data: {
            fromId: session.user.id,
            toId: targetUserId,
            accepted: true,
          },
          include: {
            from: true,
            to: true,
          },
        });
        publishFriendRequest(redis, friendRequest);
      }

      const friendRequest = await prisma.friendRequest.create({
        data: {
          fromId: session.user.id,
          toId: targetUserId,
        },
        include: {
          from: true,
          to: true,
        },
      });

      publishFriendRequest(redis, friendRequest);
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
      const { session, prisma, redis } = ctx;

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

      const newFriendRequest = await prisma.friendRequest.create({
        data: {
          fromId: session.user.id,
          toId: targetUserId,
          accepted: true,
        },
        include: {
          from: true,
          to: true,
        },
      });
      publishFriendRequest(redis, newFriendRequest);

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

  onFriendUpdate: protectedProcedure.subscription(({ ctx }) => {
    const { session, subscriberRedis } = ctx;
    const userId = session.user.id;

    return observable<FriendRequestDto>((emitter) => {
      const handler = (channel: string, message: string) => {
        if (channel !== RedisChannel.FriendRequests.toString()) {
          return;
        }
        const friendRequest = SuperJSON.parse<FriendRequestDto>(message);
        if (friendRequest.toId !== userId) {
          return;
        }

        emitter.next(friendRequest);
      };

      subscriberRedis.on("message", handler);

      return () => void subscriberRedis.off("message", handler);
    });
  }),
});
