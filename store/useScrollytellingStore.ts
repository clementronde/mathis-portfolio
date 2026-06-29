'use client';
import { create } from 'zustand';
import type { AppId } from './useWindowStore';

export const SCROLL_STEPS = [
  'intro',
  'finder',
  'finder-folder-1',
  'finder-folder-2',
  'finder-closed',
  'mail',
  'mail-closed',
  'notes',
  'notes-item-1',
  'notes-item-2',
  'notes-item-3',
  'notes-item-4',
  'notes-item-5',
  'notes-item-6',
  'notes-item-7',
  'notes-item-8',
  'notes-item-9',
  'notes-item-10',
  'notes-closed',
  'photos',
  'photos-library-1',
  'photos-library-2',
  'photos-library-3',
  'photos-library-4',
  'photos-library-5',
  'photos-library-6',
  'photos-library-7',
  'photos-library-8',
  'photos-closed',
  'maps',
  'maps-closed',
  'music',
  'music-closed',
  'photoshop',
  'photoshop-closed',
  'premiere',
  'premiere-closed',
] as const;

export type ScrollStep = typeof SCROLL_STEPS[number];

const STEP_APP_IDS: Partial<Record<ScrollStep, AppId>> = {
  finder: 'finder',
  'finder-folder-1': 'finder',
  'finder-folder-2': 'finder',
  mail: 'mail',
  notes: 'notes',
  'notes-item-1': 'notes',
  'notes-item-2': 'notes',
  'notes-item-3': 'notes',
  'notes-item-4': 'notes',
  'notes-item-5': 'notes',
  'notes-item-6': 'notes',
  'notes-item-7': 'notes',
  'notes-item-8': 'notes',
  'notes-item-9': 'notes',
  'notes-item-10': 'notes',
  photos: 'photos',
  'photos-library-1': 'photos',
  'photos-library-2': 'photos',
  'photos-library-3': 'photos',
  'photos-library-4': 'photos',
  'photos-library-5': 'photos',
  'photos-library-6': 'photos',
  'photos-library-7': 'photos',
  'photos-library-8': 'photos',
  maps: 'maps',
  music: 'music',
  photoshop: 'photoshop',
  premiere: 'premiere',
};

const STEP_FINDER_FOLDERS: Partial<Record<ScrollStep, string | null>> = {
  finder: null,
  'finder-folder-1': 'otacos-lolla',
  'finder-folder-2': 'tbs-sete',
};

const STEP_NOTE_INDEXES: Partial<Record<ScrollStep, number>> = {
  notes: 0,
  'notes-item-1': 1,
  'notes-item-2': 2,
  'notes-item-3': 3,
  'notes-item-4': 4,
  'notes-item-5': 5,
  'notes-item-6': 6,
  'notes-item-7': 7,
  'notes-item-8': 8,
  'notes-item-9': 9,
  'notes-item-10': 10,
};

const STEP_PHOTO_SCROLL_PROGRESS: Partial<Record<ScrollStep, number>> = {
  photos: 0,
  'photos-library-1': 0.125,
  'photos-library-2': 0.25,
  'photos-library-3': 0.375,
  'photos-library-4': 0.5,
  'photos-library-5': 0.625,
  'photos-library-6': 0.75,
  'photos-library-7': 0.875,
  'photos-library-8': 1,
};

const CLOSED_STEP_BY_APP: Record<AppId, ScrollStep> = {
  finder: 'finder-closed',
  mail: 'mail-closed',
  notes: 'notes-closed',
  photos: 'photos-closed',
  maps: 'maps-closed',
  music: 'music-closed',
  photoshop: 'photoshop-closed',
  premiere: 'premiere-closed',
};

const OPEN_STEP_BY_APP: Record<AppId, ScrollStep> = {
  finder: 'finder',
  mail: 'mail',
  notes: 'notes',
  photos: 'photos',
  maps: 'maps',
  music: 'music',
  photoshop: 'photoshop',
  premiere: 'premiere',
};

interface ScrollytellingStore {
  step: number;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (n: number) => void;
}

export const useScrollytellingStore = create<ScrollytellingStore>((set) => ({
  step: 0,
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, SCROLL_STEPS.length - 1) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  setStep: (n) => set({ step: Math.max(0, Math.min(n, SCROLL_STEPS.length - 1)) }),
}));

export function getStepAppId(step: number): AppId | null {
  const s = SCROLL_STEPS[step];
  return STEP_APP_IDS[s] ?? null;
}

export function getStepFinderFolder(step: number): string | null | undefined {
  const s = SCROLL_STEPS[step];
  return STEP_FINDER_FOLDERS[s];
}

export function getStepNoteIndex(step: number): number | undefined {
  const s = SCROLL_STEPS[step];
  return STEP_NOTE_INDEXES[s];
}

export function getStepPhotoScrollProgress(step: number): number | undefined {
  const s = SCROLL_STEPS[step];
  return STEP_PHOTO_SCROLL_PROGRESS[s];
}

export function getClosedStepIndexForApp(appId: AppId): number {
  return SCROLL_STEPS.indexOf(CLOSED_STEP_BY_APP[appId]);
}

export function getOpenStepIndexForApp(appId: AppId): number {
  return SCROLL_STEPS.indexOf(OPEN_STEP_BY_APP[appId]);
}
