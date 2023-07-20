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
});
