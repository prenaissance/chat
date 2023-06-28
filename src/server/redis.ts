import { Redis } from "ioredis";
import { env } from "~/env.mjs";

export enum RedisChannel {
  ChatMessages = "chat-messages",
  FriendRequests = "friend-requests",
  OnlineStatus = "online-status",
}

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(env.REDIS_URL);

if (env.NODE_ENV !== "production") globalForRedis.redis = redis;
