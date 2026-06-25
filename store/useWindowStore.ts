'use client';
import { create } from 'zustand';

export type AppId =
  | 'finder'
  | 'mail'
  | 'notes'
  | 'photos'
  | 'maps'
  | 'music'
  | 'lightroom'
  | 'photoshop'
  | 'premiere';

interface WindowStore {
  openWindows: AppId[];
  activeWindow: AppId | null;
  finderFolder: string | null;
  openWindow: (id: AppId, folder?: string | null) => void;
  closeWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
}

export const useWindowStore = create<WindowStore>((set) => ({
  openWindows: [],
  activeWindow: null,
  finderFolder: null,
  openWindow: (id, folder) =>
    set((state) => ({
      openWindows: state.openWindows.includes(id)
        ? state.openWindows
        : [...state.openWindows, id],
      activeWindow: id,
      finderFolder: folder !== undefined ? folder : state.finderFolder,
    })),
  closeWindow: (id) =>
    set((state) => ({
      openWindows: state.openWindows.filter((w) => w !== id),
      activeWindow: state.activeWindow === id ? null : state.activeWindow,
    })),
  focusWindow: (id) => set({ activeWindow: id }),
}));
