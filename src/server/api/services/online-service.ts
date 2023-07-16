export const mapOnlineStatus = <UserT extends { lastSeenAt: Date }>(
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
