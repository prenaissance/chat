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

      const messageData = await prisma.$transaction(async (trs) => {
        const messageData = await trs.message.create({
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

        if (messageData.targetUser) {
          await trs.conversation.upsert({
            where: {
              userId_targetType_targetId: {
                userId: fromId,
                targetType,
                targetId,
              },
            },
            create: {
              userId: fromId,
              targetType,
              targetId,
              lastMessageId: messageData.id,
              unreadCount: 0,
            },
            update: {
              lastMessageId: messageData.id,
              unreadCount: 0,
            },
          });

          await trs.conversation.upsert({
            where: {
              userId_targetType_targetId: {
                userId: messageData.targetUser.id,
                targetType,
                targetId: fromId,
              },
            },
            create: {
              userId: messageData.targetUser.id,
              targetType,
              targetId: fromId,
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
        } else if (messageData.targetGroup) {
          const group = await trs.group.findUniqueOrThrow({
            where: {
              id: messageData.targetGroup.id,
            },
            include: {
              users: true,
            },
          });

          const groupUsers = group.users.filter(
            (user) => user.id !== messageData.fromId
          );

          await trs.conversation.upsert({
            where: {
              userId_targetType_targetId: {
                userId: fromId,
                targetType,
                targetId,
              },
            },
            create: {
              userId: fromId,
              targetType,
              targetId,
              lastMessageId: messageData.id,
              unreadCount: 0,
            },
            update: {
              lastMessageId: messageData.id,
              unreadCount: 0,
            },
          });

          await Promise.all(
            groupUsers.map(async (user) => {
              await trs.conversation.upsert({
                where: {
                  userId_targetType_targetId: {
                    userId: user.id,
                    targetType,
                    targetId: fromId,
                  },
                },
                create: {
                  userId: user.id,
                  targetType,
                  targetId: fromId,
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
            })
          );
        }

        return messageData;
      });
      const messageJSON = JSON.stringify(messageData);
      await redis.publish(RedisChannel.ChatMessages, messageJSON);
      return messageData;
    }),
});
