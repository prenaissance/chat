import { createTRPCRouter } from "~/server/api/trpc";
import { chatRouter } from "./routers/chat";
import { correspondentsRouter } from "./routers/correspondents";
import { conversationsRouter } from "./routers/conversations";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  chat: chatRouter,
  correspondents: correspondentsRouter,
  conversations: conversationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
