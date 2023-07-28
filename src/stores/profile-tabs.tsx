import { create } from "zustand";

type EditUser = {
  name: string;
  image: string | null;
  description: string | null;
};

type ProfileTabsState = {
  activeTab: number;
  editUser: EditUser;
};

type ProfileTabsActions = {
  setActiveTab: (activeTab: number) => void;
  setEditUser: (editUser: EditUser) => void;
};

export type ProfileTabsStore = ProfileTabsState & ProfileTabsActions;

export const useProfileTabsStore = create<ProfileTabsStore>()((set) => ({
  activeTab: 0,
  editUser: {
    name: "",
    image: null,
    description: "",
  },
  setActiveTab: (activeTab: number) => set({ activeTab }),
  setEditUser: (editUser: EditUser) => set({ editUser }),
}));
