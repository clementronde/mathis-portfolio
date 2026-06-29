import type { AppId } from '@/store/useWindowStore';

export interface App {
  id: AppId;
  label: string;
}

export const DOCK_APPS: App[] = [
  { id: 'finder', label: 'Finder' },
  { id: 'mail', label: 'Mail' },
  { id: 'notes', label: 'Notes' },
  { id: 'photos', label: 'Photos' },
  { id: 'music', label: 'Music' },
  { id: 'maps', label: 'Maps' },
  { id: 'photoshop', label: 'Photoshop' },
  { id: 'premiere', label: 'Premiere Pro' },
];
