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

/**
 * A Zustand store hook for managing the state of the settings modal.
 * It handles opening, closing, and expanding the modal.
 *
 * @returns {SettingsModalStore} An object containing the modal's state and action methods.
 */
export const useSettingsModal = create<SettingsModalStore>((set) => ({
  isOpen: false,
  isExpanded: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, isExpanded: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setExpanded: (expanded: boolean) => set({ isExpanded: expanded }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
}));

