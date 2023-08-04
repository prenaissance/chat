export const mapUserOnlineStatus = <UserT extends { lastSeenAt: Date }>(
  user: UserT
) => {
  const now = new Date();
  const lastSeenAt = new Date(user.lastSeenAt);
  const diff = now.getTime() - lastSeenAt.getTime();
  const isOnline = diff < 1000 * 60 * 5;
  return {
    ...user,
    isOnline,
  };
};

export const mapGroupOnlineStatus = <
  UserT extends { id: string; lastSeenAt: Date },
  GroupT extends { users: UserT[] },
>(
  group: GroupT,
  selfId?: string
) => {
  const mappedUsers = group.users.map(mapUserOnlineStatus);
  const isOnline = mappedUsers
    .filter(({ id }) => id !== selfId)
    .some((user) => user.isOnline);
  return {
    ...group,
    isOnline,
    users: mappedUsers,
  };
};
