import ws from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";

import { env } from "~/env.mjs";
import { type AppRouter, appRouter } from "~/server/api/root";
import { createWSSContext } from "./api/trpc";
import { subscriberRedis } from "./services/singletons/redis";

subscriberRedis.on("message", (channel, _message) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] 📢 received message in channel ${channel}`
  );
});

const wss = new ws.Server({
  port: env.WS_PORT,
});

const handler = applyWSSHandler<AppRouter>({
  router: appRouter,
  wss,
  createContext: createWSSContext,
});

wss.on("listening", () => {
  console.log(`🚀 WebSocket Server listening on ws://localhost:${env.WS_PORT}`);
});
wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
