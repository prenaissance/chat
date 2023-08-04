import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { MessageSource, MessageTarget } from "@prisma/client";

import { createGroupSchema } from "~/shared/schemas/group-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type MessageDTO } from "~/shared/dtos/chat";
import { toTargetDto } from "~/shared/dtos/target";
import {
  mapGroupOnlineStatus,
  mapUserOnlineStatus,
} from "~/server/services/online-service";
import { RedisChannel } from "~/server/services/singletons/redis";
import SuperJSON from "superjson";

const groupsRouter = createTRPCRouter({
  getGroup: protectedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input: id }) => {
      const { prisma, session } = ctx;

      const group = await prisma.group.findUnique({
        where: {
          id,
        },
        include: {
          users: {
            orderBy: {
              name: "asc",
            },
          },
        },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return mapGroupOnlineStatus(group, session.user.id);
    }),

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

  createGroup: protectedProcedure
    .input(createGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { name, members } = input;
      const membersWithSelf = [...new Set(members).add(session.user.id)];

      const group = await prisma.$transaction(async (trans) => {
        const group = await trans.group.create({
          data: {
            name,
            users: {
              connect: membersWithSelf.map((id) => ({
                id,
              })),
            },
            messages: {
              create: [
                {
                  content: `Group created by ${session.user.name}`,
                  source: MessageSource.System,
                  targetType: MessageTarget.Group,
                  fromId: session.user.id,
                },
              ],
            },
          },
          include: {
            messages: true,
          },
        });

        const lastMessageId = group.messages[0]!.id;
        await trans.conversation.create({
          data: {
            userId: session.user.id,
            targetGroupId: group.id,
            lastMessageId,
            targetType: MessageTarget.Group,
            unreadCount: 0,
          },
        });
        await Promise.all(
          membersWithSelf
            .filter((id) => id !== session.user.id)
            .map((id) =>
              trans.conversation.create({
                data: {
                  userId: id,
                  targetGroupId: group.id,
                  lastMessageId,
                  targetType: MessageTarget.Group,
                  unreadCount: 1,
                },
              })
            )
        );

        return group;
      });

      return group;
    }),

  addUsersToGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
        userIds: z.array(z.string().cuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { groupId, userIds } = input;

      const group = await prisma.group.findUnique({
        where: {
          id: groupId,
        },
        include: {
          users: {
            where: {
              id: {
                in: userIds,
              },
            },
          },
        },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      if (group.users.length) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Users ${group.users
            .map(({ name }) => name)
            .join(", ")} are already in the group`,
        });
      }

      const updatedGroup = await prisma.group.update({
        where: {
          id: groupId,
        },
        data: {
          users: {
            connect: userIds.map((id) => ({
              id,
            })),
          },
          messages: {
            create: [
              {
                content: `Users ${userIds.join(", ")} added to group`,
                source: MessageSource.System,
                targetType: MessageTarget.Group,
                fromId: session.user.id,
              },
            ],
          },
        },
      });

      return updatedGroup;
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(1000),
        targetGroupId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, targetGroupId } = input;
      const { session, prisma, redis } = ctx;

      const fromId = session.user.id;

      const messageData: MessageDTO = await prisma.$transaction(async (trs) => {
        const rawMessageData = await trs.message.create({
          data: {
            content: message,
            source: MessageSource.User,
            fromId,
            targetType: MessageTarget.Group,
            targetGroupId,
            readBy: {
              connect: {
                id: fromId,
              },
            },
          },
          include: {
            from: true,
            targetGroup: {
              include: {
                users: true,
              },
            },
          },
        });

        const messageData = toTargetDto(rawMessageData);

        const group = await trs.group.findUniqueOrThrow({
          where: {
            id: targetGroupId,
          },
          include: {
            users: true,
          },
        });

        await trs.conversation.update({
          where: {
            userId_targetType_targetGroupId: {
              userId: fromId,
              targetType: MessageTarget.Group,
              targetGroupId,
            },
          },
          data: {
            lastMessageId: rawMessageData.id,
            unreadCount: 0,
          },
        });

        await trs.conversation.updateMany({
          where: {
            targetGroupId,
            targetType: MessageTarget.Group,
            userId: {
              in: group.users.map(({ id }) => id).filter((id) => id !== fromId),
            },
          },
          data: {
            lastMessageId: rawMessageData.id,
            unreadCount: {
              increment: 1,
            },
          },
        });

        return {
          ...messageData,
          from: mapUserOnlineStatus(messageData.from),
        };
      });

      const messageJSON = SuperJSON.stringify(messageData);
      await redis.publish(RedisChannel.ChatMessages, messageJSON);
      return messageData;
    }),

  getMessages: protectedProcedure
    .input(
      z.object({
        targetGroupId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }): Promise<MessageDTO[]> => {
      const { targetGroupId } = input;
      const { session, prisma } = ctx;

      // set all messages from this user to read
      await prisma.conversation.updateMany({
        where: {
          userId: session.user.id,
          targetGroupId,
          targetType: MessageTarget.Group,
        },
        data: {
          unreadCount: 0,
        },
      });

      const groupMessages = await prisma.message.findMany({
        where: {
          targetGroupId,
        },
        include: {
          from: true,
          targetGroup: {
            include: {
              users: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return groupMessages.map(toTargetDto).map((message) => ({
        ...message,
        from: mapUserOnlineStatus(message.from),
      }));
    }),
});

export { groupsRouter };
