import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { MessageSource, MessageTarget } from "@prisma/client";
import { RedisChannel } from "~/server/redis";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        targetType: z.nativeEnum(MessageTarget),
        targetId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { message, targetType, targetId } = input;
      const { session, prisma, redis } = ctx;

      const fromId = session.user.id;

      const messageData = await prisma.message.create({
        data: {
          content: message,
          source: MessageSource.User,
          fromId,
          targetType,
          targetId,
          readBy: {
            connect: {
              id: fromId,
            },
          },
        },
        include: {
          from: true,
          targetGroup: true,
          targetUser: true,
        },
      });

      const messageJSON = JSON.stringify(messageData);
      await redis.publish(RedisChannel.ChatMessages, messageJSON);
    }),
});
