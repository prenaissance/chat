import { type Group } from "@prisma/client";

export type UserAvatarInfo = {
  name: string;
  image?: string | null;
  isOnline?: boolean;
};

export type UserInfo = UserAvatarInfo & {
  id: string;
  description?: string | null;
};

export type UserInfoWithGroups = UserInfo & {
  groupsInCommon: Group[];
};
