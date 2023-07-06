import { z } from "zod";
import {
  type Message,
  MessageSource,
  MessageTarget,
  type User,
  type Group,
} from "@prisma/client";
import { observable } from "@trpc/server/observable";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { RedisChannel } from "~/server/redis";
import { type MessageDTO } from "~/shared/dtos/chat";

const messageToDto = (
  message: Message & {
    from: User;
    targetUser: User | null;
    targetGroup: Group | null;
  }
): MessageDTO =>
  message.targetType === MessageTarget.User
    ? {
        ...message,
        targetType: MessageTarget.User,
        targetUserId: message.targetUserId!,
        targetUser: message.targetUser!,
        targetGroupId: null,
        targetGroup: null,
      }
    : {
        ...message,
        targetType: MessageTarget.Group,
        targetUserId: null,
        targetUser: null,
        targetGroupId: message.targetGroupId!,
        targetGroup: message.targetGroup!,
      };

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        targetType: z.nativeEnum(MessageTarget),
        targetId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, targetType, targetId } = input;
      const { session, prisma, redis } = ctx;

      const fromId = session.user.id;

      const messageData = await prisma.$transaction(async (trs) => {
        const rawMessageData = await trs.message.create({
          data: {
            content: message,
            source: MessageSource.User,
            fromId,
            targetType,
            [targetType === MessageTarget.User
              ? "targetUserId"
              : "targetGroupId"]: targetId,
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

        const messageData = messageToDto(rawMessageData);

        if (messageData.targetType === MessageTarget.User) {
          await trs.conversation.upsert({
            where: {
              userId_targetType_targetUserId: {
                userId: fromId,
                targetType,
                targetUserId: targetId,
              },
            },
            create: {
              userId: fromId,
              targetType,
              targetUserId: targetId,
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
              userId_targetType_targetUserId: {
                userId: messageData.targetUser.id,
                targetType,
                targetUserId: fromId,
              },
            },
            create: {
              userId: messageData.targetUser.id,
              targetType,
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
              userId_targetType_targetUserId: {
                userId: fromId,
                targetType,
                targetUserId: targetId,
              },
            },
            create: {
              userId: fromId,
              targetType,
              targetUserId: targetId,
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
                  userId_targetType_targetUserId: {
                    userId: user.id,
                    targetType,
                    targetUserId: fromId,
                  },
                },
                create: {
                  userId: user.id,
                  targetType,
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
            })
          );
        }

        return messageData;
      });

      const messageJSON = JSON.stringify(messageData);
      await redis.publish(RedisChannel.ChatMessages, messageJSON);
      return messageData;
    }),

  onMessage: protectedProcedure.subscription(({ ctx }) => {
    const { redis, session } = ctx;

    return observable<MessageDTO>((emitter) => {
      // this approach is most likely not scalable, change later
      const subscriber = redis.duplicate();
      void subscriber.subscribe(RedisChannel.ChatMessages);

      subscriber.on("message", (_channel, message) => {
        const messageData = JSON.parse(message) as MessageDTO;
        if (messageData.from.id === session.user.id) {
          emitter.next(messageData);
        }
      });

      return () => {
        void subscriber.unsubscribe();
        void subscriber.quit();
      };
    });
  }),

  getMessages: protectedProcedure
    .input(
      z.object({
        targetType: z.nativeEnum(MessageTarget),
        targetId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }): Promise<MessageDTO[]> => {
      const { targetType, targetId } = input;
      const { session, prisma } = ctx;

      const messages = await prisma.message.findMany({
        where: {
          fromId: session.user.id,
          targetType,
          [targetType === MessageTarget.User
            ? "targetUserId"
            : "targetGroupId"]: targetId,
        },
        include: {
          from: true,
          targetGroup: true,
          targetUser: true,
        },
        take: 50,
      });

      return messages.map(messageToDto);
    }),
});
