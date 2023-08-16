import { MessageSource, MessageTarget } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useCallback } from "react";

import { type MessageDTO } from "~/shared/dtos/chat";
import { api } from "~/utils/api";
import { cuid } from "~/utils/cryptography";

export const useGroupOptimisticUpdates = (targetUserId?: string) => {
  const session = useSession();
  const { data: selfUser } = api.profile.getProfile.useQuery(undefined, {
    enabled: !!session.data,
  });
  const { data: targetUser } = api.users.getUser.useQuery(
    {
      id: targetUserId!,
    },
    {
      enabled: !!targetUserId,
    }
  );
  const enabled = !!targetUserId && !!selfUser && !!targetUser;
  const queryClient = api.useContext();
  const addMessage = useCallback(
    (message: string) => {
      if (!enabled) {
        return;
      }

      const messageDto: MessageDTO = {
        id: cuid(),
        content: message,
        createdAt: new Date(),
        source: MessageSource.User,
        fromId: selfUser.id,
        from: selfUser,
        targetType: MessageTarget.User,
        targetGroupId: null,
        targetGroup: null,
        targetUserId,
        targetUser,
      };

      // Hope this assertion won't cause problems
      queryClient.chat.getUserMessages.setData(
        {
          targetUserId,
        },
        (messages) => [...messages!, messageDto]
      );
      queryClient.conversations.getConversations.setData(
        undefined,
        (conversations) =>
          conversations!.map((conversation) =>
            conversation.targetGroupId === targetUserId
              ? {
                  ...conversation,
                  lastMessage: messageDto,
                  unreadCount: 0,
                }
              : conversation
          )
      );
    },
    [enabled, targetUser, targetUserId, queryClient, selfUser]
  );

  return {
    enabled,
    addMessage,
  };
};
