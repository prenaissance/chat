import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { chatRouter } from "./routers/chat";
import { correspondentsRouter } from "./routers/correspondents";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  chat: chatRouter,
  correspondents: correspondentsRouter,
  conversations: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
