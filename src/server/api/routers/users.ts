import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { mapUserOnlineStatus } from "~/server/services/online-service";
import { omit } from "~/utils/reflections";

export const usersRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const { prisma, session } = ctx;

      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          groups: {
            where: {
              users: {
                some: {
                  id: session.user.id,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        ...omit(mapUserOnlineStatus(user), ["groups"]),
        groupsInCommon: user.groups,
      };
    }),
});
