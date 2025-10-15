"use client";

import { create } from "zustand";

type SettingsModalStore = {
  isOpen: boolean;
  isExpanded: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
};

export const useSettingsModal = create<SettingsModalStore>((set) => ({
  isOpen: false,
  isExpanded: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, isExpanded: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setExpanded: (expanded: boolean) => set({ isExpanded: expanded }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
}));

