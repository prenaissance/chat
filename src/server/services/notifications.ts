import { type Redis } from "ioredis";
import SuperJSON from "superjson";

import { RedisChannel } from "./singletons/redis";
import { type FriendRequestDto } from "~/shared/dtos/friends";

export const publishFriendRequest = (
  redis: Redis,
  friendRequest: FriendRequestDto
) => {
  const json = SuperJSON.stringify(friendRequest);
  void redis.publish(RedisChannel.FriendRequests, json);
};
