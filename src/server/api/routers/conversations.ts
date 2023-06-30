import { createTRPCRouter, protectedProcedure } from "../trpc";

export const conversationsRouter = createTRPCRouter({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const { prisma, session } = ctx;
    const userId = session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
      },
      include: {
        targetGroup: true,
        targetUser: true,
        lastMessage: true,
      },
    });

    return conversations;
  }),
});
