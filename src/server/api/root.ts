import { createTRPCRouter } from "~/server/api/trpc";
import { chatRouter } from "./routers/chat";
import { correspondentsRouter } from "./routers/correspondents";
import { conversationsRouter } from "./routers/conversations";
import { usersRouter } from "./routers/users";
import { friendsRouter } from "./routers/friends";
import { onlineRouter } from "./routers/online";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  chat: chatRouter,
  users: usersRouter,
  correspondents: correspondentsRouter,
  friends: friendsRouter,
  conversations: conversationsRouter,
  online: onlineRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
