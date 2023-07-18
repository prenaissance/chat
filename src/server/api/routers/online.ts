import { mapOnlineStatus } from "../services/online-service";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const onlineRouter = createTRPCRouter({
  heartbeat: protectedProcedure.mutation(async ({ ctx }) => {
    const { session, prisma } = ctx;
    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        lastSeenAt: new Date(),
      },
    });

    return user;
  }),

  getOnlineFriends: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;
    const friends = await prisma.user.findMany({
      where: {
        lastSeenAt: {
          lte: new Date(Date.now() - 1000 * 60 * 5),
        },
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

    return friends.map((user) => ({
      ...user,
      isOnline: true,
    }));
  }),
});
