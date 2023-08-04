import { MessageTarget } from "@prisma/client";

import { toTargetDto } from "~/shared/dtos/target";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  mapGroupOnlineStatus,
  mapUserOnlineStatus,
} from "../../services/online-service";

export const conversationsRouter = createTRPCRouter({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const { prisma, session } = ctx;
    const userId = session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
      },
      include: {
        targetGroup: {
          include: {
            users: true,
          },
        },
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
        const { targetGroup } = conversation;
        return {
          ...conversation,
          targetGroup: mapGroupOnlineStatus(targetGroup, userId),
        };
      }

      const { targetUser } = conversation;
      return {
        ...conversation,
        targetUser: mapUserOnlineStatus(targetUser),
      };
    });
  }),
});
