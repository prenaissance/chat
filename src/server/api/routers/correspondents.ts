import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

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
        users,
        groups,
      };
    }),

  getCorrespondents: protectedProcedure.query(async ({ ctx }) => {
    const { prisma, session } = ctx;
    const userId = session.user.id;
  }),
});
