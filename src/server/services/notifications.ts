import { type FriendRequest, type User } from "@prisma/client";
import { type Redis } from "ioredis";
import SuperJSON from "superjson";
import { RedisChannel } from "./singletons/redis";

export const publishFriendRequest = (
  redis: Redis,
  friendRequest: FriendRequest & { from: User; to: User }
) => {
  const json = SuperJSON.stringify(friendRequest);
  void redis.publish(RedisChannel.FriendRequests, json);
};
