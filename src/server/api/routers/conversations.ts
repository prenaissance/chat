import { toTargetDto } from "~/shared/dtos/target";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { MessageTarget } from "@prisma/client";
import { mapOnlineStatus } from "../../services/online-service";

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
      orderBy: {
        lastMessage: {
          createdAt: "desc",
        },
      },
    });

    return conversations.map(toTargetDto).map((conversation) => {
      if (conversation.targetType === MessageTarget.Group) {
        return conversation;
      }

      const { targetUser } = conversation;
      return {
        ...conversation,
        targetUser: mapOnlineStatus(targetUser),
      };
    });
  }),
});
