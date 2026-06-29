'use client';
import { create } from 'zustand';

export type AppId =
  | 'finder'
  | 'mail'
  | 'notes'
  | 'photos'
  | 'maps'
  | 'music'
  | 'photoshop'
  | 'premiere';

export type RecentItemType = 'project' | 'note';

export interface RecentItem {
  id: string;
  type: RecentItemType;
  itemId: string;
}

const RECENT_ITEMS_LIMIT = 12;

function addRecentItem(items: RecentItem[], item: Omit<RecentItem, 'id'>) {
  const id = `${item.type}:${item.itemId}`;
  return [
    { id, ...item },
    ...items.filter((recent) => recent.id !== id),
  ].slice(0, RECENT_ITEMS_LIMIT);
}

interface WindowStore {
  openWindows: AppId[];
  activeWindow: AppId | null;
  finderFolder: string | null;
  selectedNoteId: string | null;
  recentItems: RecentItem[];
  openWindow: (id: AppId, folder?: string | null) => void;
  openNote: (noteId: string) => void;
  setSelectedNote: (noteId: string) => void;
  recordRecentProject: (projectId: string) => void;
  recordRecentNote: (noteId: string) => void;
  closeWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
}

export const useWindowStore = create<WindowStore>((set) => ({
  openWindows: [],
  activeWindow: null,
  finderFolder: null,
  selectedNoteId: null,
  recentItems: [],
  openWindow: (id, folder) =>
    set((state) => ({
      openWindows: state.openWindows.includes(id)
        ? state.openWindows
        : [...state.openWindows, id],
      activeWindow: id,
      finderFolder: folder !== undefined ? folder : state.finderFolder,
      recentItems: id === 'finder' && folder
        ? addRecentItem(state.recentItems, { type: 'project', itemId: folder })
        : state.recentItems,
    })),
  openNote: (noteId) =>
    set((state) => ({
      openWindows: state.openWindows.includes('notes')
        ? state.openWindows
        : [...state.openWindows, 'notes'],
      activeWindow: 'notes',
      selectedNoteId: noteId,
      recentItems: addRecentItem(state.recentItems, { type: 'note', itemId: noteId }),
    })),
  setSelectedNote: (noteId) =>
    set((state) => ({
      selectedNoteId: noteId,
      recentItems: addRecentItem(state.recentItems, { type: 'note', itemId: noteId }),
    })),
  recordRecentProject: (projectId) =>
    set((state) => ({
      recentItems: addRecentItem(state.recentItems, { type: 'project', itemId: projectId }),
    })),
  recordRecentNote: (noteId) =>
    set((state) => ({
      recentItems: addRecentItem(state.recentItems, { type: 'note', itemId: noteId }),
    })),
  closeWindow: (id) =>
    set((state) => ({
      openWindows: state.openWindows.filter((w) => w !== id),
      activeWindow: state.activeWindow === id ? null : state.activeWindow,
    })),
  focusWindow: (id) => set({ activeWindow: id }),
}));
