import { create } from "zustand";

type ProfileTabsState = {
  activeTab: number;
};

type ProfileTabsActions = {
  setActiveTab: (activeTab: number) => void;
};

export type ProfileTabsStore = ProfileTabsState & ProfileTabsActions;

export const useProfileTabs = create<ProfileTabsStore>()((set) => ({
  activeTab: 0,
  setActiveTab: (activeTab: number) => set({ activeTab }),
}));
