import { createGroupSchema } from "~/shared/schemas/group-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { MessageSource, MessageTarget } from "@prisma/client";
import { TRPCError } from "@trpc/server";

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
});

export { groupsRouter };
