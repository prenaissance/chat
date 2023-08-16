import { MessageSource, MessageTarget } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useCallback } from "react";

import { type MessageDTO } from "~/shared/dtos/chat";
import { api } from "~/utils/api";
import { cuid } from "~/utils/cryptography";

export const useGroupOptimisticUpdates = (groupId?: string) => {
  const session = useSession();
  const { data: selfUser } = api.profile.getProfile.useQuery(undefined, {
    enabled: !!session.data,
  });
  const { data: group } = api.groups.getGroup.useQuery(groupId!, {
    enabled: !!groupId,
  });
  const enabled = !!groupId && !!selfUser && !!group;
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
        targetType: MessageTarget.Group,
        targetGroupId: groupId,
        targetGroup: group,
        targetUserId: null,
        targetUser: null,
      };

      // Hope this assertion won't cause problems
      queryClient.groups.getMessages.setData(
        {
          targetGroupId: groupId,
        },
        (messages) => [...messages!, messageDto]
      );
      queryClient.conversations.getConversations.setData(
        undefined,
        (conversations) =>
          conversations!.map((conversation) =>
            conversation.targetGroupId === groupId
              ? {
                  ...conversation,
                  lastMessage: messageDto,
                  unreadCount: 0,
                }
              : conversation
          )
      );
    },
    [enabled, group, groupId, queryClient, selfUser]
  );

  return {
    enabled,
    addMessage,
  };
};
