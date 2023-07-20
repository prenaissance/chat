import { type User } from "@prisma/client";

export type OnlineStatusUser = User & {
  isOnline: boolean;
};
