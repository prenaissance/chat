import { MessageTarget } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { api } from "~/utils/api";

export const useNotifications = () => {
  const session = useSession();
  const router = useRouter();
  api.chat.onMessage.useSubscription(undefined, {
    enabled: !!session.data && Notification.permission === "granted",
    onData: (message) => {
      switch (message.targetType) {
        case MessageTarget.User: {
          const notification = new Notification(message.from.name, {
            body: message.content,
            icon: message.from.image ?? undefined,
            tag: `chat-${message.from.id}`,
          });
          notification.onclick = () =>
            router.push(`/chat/user/${message.fromId}`);
          break;
        }
        case MessageTarget.Group: {
          const notification = new Notification(message.targetGroup.name, {
            body: `${message.from.name}: ${message.content}`,
            icon: undefined, // TODO: add images to groups
            tag: `chat-${message.targetGroup.id}`,
          });
          notification.onclick = () =>
            router.push(`/chat/group/${message.targetGroupId}`);
          break;
        }
      }
    },
  });

  api.friends.onFriendUpdate.useSubscription(undefined, {
    enabled: !!session.data && Notification.permission === "granted",
    onData: (friendRequest) => {
      if (friendRequest.accepted) {
        const notification = new Notification(
          `${friendRequest.from.name} accepted your friend request`,
          {
            body: "click to open chat",
            icon: friendRequest.from.image ?? undefined,
            tag: `friend-${friendRequest.from.id}`,
          }
        );
        notification.onclick = () =>
          router.push(`/chat/user/${friendRequest.fromId}`);
      } else {
        const notification = new Notification(
          `${friendRequest.from.name} sent you a friend request`,
          {
            icon: friendRequest.from.image ?? undefined,
            tag: `friend-${friendRequest.from.id}`,
          }
        );
        notification.onclick = () => router.push(`/friends`);
      }
    },
  });
};
