import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationPreferences = {
  messages: boolean;
  friendRequests: boolean;
};

type NotificationsState = {
  wasUsedAsked: boolean;
  enabledPreferences: NotificationPreferences;
};

type NotificationsActions = {
  setUserAsked: () => void;
  setEnabledPreferences: (enabledPreferences: NotificationPreferences) => void;
};

export type NotificationsStore = NotificationsState & NotificationsActions;

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      wasUsedAsked: false,
      enabledPreferences: {
        messages: true,
        friendRequests: false,
      },
      setUserAsked: () => {
        set({ wasUsedAsked: true });
      },
      setEnabledPreferences: (enabledPreferences) => {
        set({ enabledPreferences });
      },
    }),
    {
      name: "notifications-store",
    }
  )
);
