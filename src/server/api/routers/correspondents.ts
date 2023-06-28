import { MessageSource } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const correspondentsRouter = createTRPCRouter({
  getCorrespondents: protectedProcedure.query(async ({ ctx }) => {
    const { prisma, session } = ctx;
    const userId = session.user.id;
  }),
});
