import { z } from "zod";
import { MessageSource, MessageTarget } from "@prisma/client";
import { observable } from "@trpc/server/observable";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { RedisChannel } from "~/server/services/singletons/redis";
import { type MessageDTO } from "~/shared/dtos/chat";
import { toTargetDto } from "~/shared/dtos/target";
import { mapOnlineStatus } from "../../services/online-service";

export const chatRouter = createTRPCRouter({
  sendUserMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(1000),
        targetUserId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, targetUserId } = input;
      const { session, prisma, redis } = ctx;

      const fromId = session.user.id;

      const messageData: MessageDTO = await prisma.$transaction(async (trs) => {
        const rawMessageData = await trs.message.create({
          data: {
            content: message,
            source: MessageSource.User,
            fromId,
            targetType: MessageTarget.User,
            targetUserId,
            readBy: {
              connect: {
                id: fromId,
              },
            },
          },
          include: {
            from: true,
            targetUser: true,
          },
        });

        const messageData = toTargetDto(rawMessageData);

        await trs.conversation.upsert({
          where: {
            userId_targetType_targetUserId: {
              userId: fromId,
              targetType: MessageTarget.User,
              targetUserId,
            },
          },
          create: {
            userId: fromId,
            targetType: MessageTarget.User,
            targetUserId,
            lastMessageId: messageData.id,
            unreadCount: 0,
          },
          update: {
            lastMessageId: messageData.id,
            unreadCount: {
              increment: 0,
            },
          },
        });

        await trs.conversation.upsert({
          where: {
            userId_targetType_targetUserId: {
              userId: targetUserId,
              targetType: MessageTarget.User,
              targetUserId: fromId,
            },
          },
          create: {
            userId: targetUserId,
            targetType: MessageTarget.User,
            targetUserId: fromId,
            lastMessageId: messageData.id,
            unreadCount: 1,
          },
          update: {
            lastMessageId: messageData.id,
            unreadCount: {
              increment: 1,
            },
          },
        });

        return {
          ...messageData,
          from: mapOnlineStatus(messageData.from),
        };
      });

      const messageJson = JSON.stringify(messageData);
      await redis.publish(RedisChannel.ChatMessages, messageJson);
      return messageData;
    }),

  onMessage: protectedProcedure.subscription(({ ctx }) => {
    const { subscriberRedis, session } = ctx;

    return observable<MessageDTO>((emitter) => {
      const handler = (channel: string, message: string) => {
        if (channel !== RedisChannel.ChatMessages.toString()) {
          return;
        }
        const messageData = JSON.parse(message) as MessageDTO;
        const isToUser =
          messageData.targetType === MessageTarget.User &&
          messageData.targetUserId === session.user.id;
        const isUserInGroup =
          messageData.targetType === MessageTarget.Group &&
          messageData.targetGroup.users
            .map((u) => u.id)
            .includes(session.user.id);

        if (isToUser || isUserInGroup) {
          emitter.next(messageData);
        }
      };
      subscriberRedis.on("message", handler);

      return () => void subscriberRedis.off("message", handler);
    });
  }),

  getUserMessages: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }): Promise<MessageDTO[]> => {
      const { targetUserId } = input;
      const { session, prisma } = ctx;
      // set all messages from this user to read
      await prisma.conversation.updateMany({
        where: {
          userId: session.user.id,
          targetUserId,
          targetType: MessageTarget.User,
        },
        data: {
          unreadCount: 0,
        },
      });

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              fromId: session.user.id,
              targetUserId,
            },
            {
              fromId: targetUserId,
              targetUserId: session.user.id,
            },
          ],
        },
        include: {
          from: true,
          targetUser: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 100,
      });

      return messages.map(toTargetDto).map((message) => ({
        ...message,
        from: mapOnlineStatus(message.from),
      }));
    }),
});
