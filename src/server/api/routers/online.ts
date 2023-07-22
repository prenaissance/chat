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
});
