import { type User, type FriendRequest } from "@prisma/client";

export enum FriendStatus {
  None = "none",
  Sent = "sent",
  Received = "received",
  Friends = "friends",
}

export type FriendRequestDto = FriendRequest & { from: User; to: User };
