import { createTRPCRouter, protectedProcedure } from "../trpc";

const groupsRouter = createTRPCRouter({
  getGroups: protectedProcedure.query(async ({ ctx }) => {
    const { prisma, session } = ctx;
    const { groups } = await prisma.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      include: {
        groups: true,
      },
    });

    return groups;
  }),
});

export { groupsRouter };
