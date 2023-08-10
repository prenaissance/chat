import { MessageTarget } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { api } from "~/utils/api";

export const useNotifications = () => {
  const session = useSession();
  const router = useRouter();
  api.chat.onMessage.useSubscription(undefined, {
    enabled: !!session.data,
    onData: (message) => {
      if (Notification.permission !== "granted") {
        return;
      }

      switch (message.targetType) {
        case MessageTarget.User: {
          const notification = new Notification(message.from.name, {
            body: message.content,
            icon: message.from.image ?? undefined,
            tag: message.from.id,
          });
          notification.onclick = () =>
            router.push(`/chat/user/${message.fromId}`);
          break;
        }
        case MessageTarget.Group: {
          const notification = new Notification(message.targetGroup.name, {
            body: `${message.from.name}: ${message.content}`,
            icon: undefined, // TODO: add images to groups
            tag: message.targetGroup.id,
          });
          notification.onclick = () =>
            router.push(`/chat/group/${message.targetGroupId}`);
          break;
        }
      }
    },
  });
};
