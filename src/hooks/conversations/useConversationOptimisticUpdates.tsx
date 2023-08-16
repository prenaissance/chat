import { useCallback } from "react";
import { api } from "~/utils/api";

export const useConversationOptimisticUpdates = () => {
  const queryClient = api.useContext();

  const readConversation = useCallback(
    (targetId: string) => {
      queryClient.conversations.getConversations.setData(
        undefined,
        (conversations) =>
          (conversations ?? []).map((c) =>
            c.targetUserId === targetId || c.targetGroupId === targetId
              ? { ...c, unreadCount: 0 }
              : c
          )
      );
    },
    [queryClient]
  );

  return {
    readConversation,
  };
};
