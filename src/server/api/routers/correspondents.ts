import { omit } from "~/utils/reflections";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { getFriendStatusForUser } from "../services/friend-status-service";

export const correspondentsRouter = createTRPCRouter({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { query } = input;
      const { prisma, session } = ctx;
      const userId = session.user.id;

      const users = await prisma.user.findMany({
        where: {
          name: {
            contains: query,
          },
          id: {
            not: userId,
          },
        },
        include: {
          receivedFriendRequests: true,
          sentFriendRequests: true,
        },
        take: 5,
      });

      const groups = await prisma.group.findMany({
        where: {
          name: {
            contains: query,
          },
          users: {
            some: {
              id: userId,
            },
          },
        },
        take: 5,
      });

      return {
        users: users.map((user) => ({
          ...omit(user, ["receivedFriendRequests", "sentFriendRequests"]),
          friendStatus: getFriendStatusForUser(user, userId),
        })),
        groups,
      };
    }),
});
